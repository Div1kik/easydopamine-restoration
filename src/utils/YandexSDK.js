import { AudioManager } from './AudioManager.js';

class MultiPlatformSDKManager {
  constructor() {
    this.platform = 'web'; // 'yandex' | 'vk' | 'android' | 'web'
    this.ysdk = null;
    this.vkBridge = null;
    this.initialized = false;
    this.lastInterstitialTime = 0;
    this.restorationsSinceAd = 0;
    this.isAdShowing = false;
  }

  detectPlatform() {
    if (typeof window === 'undefined') return 'web';

    const href = String(window.location?.href || '');
    const search = String(window.location?.search || '');
    const ref = String(document?.referrer || '');

    // 1. Android / Capacitor нативное приложение (RuStore / Google Play)
    const isCapacitorNative =
      Boolean(window.Capacitor?.isNativePlatform?.()) ||
      window.location?.protocol === 'capacitor:' ||
      window.location?.protocol === 'file:' ||
      Boolean(window.AndroidAdsBridge);

    if (isCapacitorNative) {
      return 'android';
    }

    // 2. VK Mini Apps / VK Play
    const isVK =
      search.includes('vk_app_id=') ||
      search.includes('vk_platform=') ||
      ref.includes('vk.com') ||
      ref.includes('vk.ru') ||
      href.includes('vk.com');

    if (isVK) {
      return 'vk';
    }

    // 3. Яндекс.Игры (iframe или подключённый YaGames SDK)
    let inIframe = false;
    try {
      inIframe = window.self !== window.top;
    } catch {
      inIframe = true;
    }

    const isYandex =
      ref.includes('yandex.') ||
      href.includes('yandex.') ||
      (inIframe && Boolean(window.YaGames));

    if (isYandex) {
      return 'yandex';
    }

    return 'web';
  }

  getPlatform() {
    if (!this.initialized) {
      this.platform = this.detectPlatform();
    }
    return this.platform;
  }

  async init() {
    if (this.initialized) return this.platform;
    this.platform = this.detectPlatform();

    try {
      if (this.platform === 'yandex') {
        await this.initYandex();
      } else if (this.platform === 'vk') {
        await this.initVK();
      } else if (this.platform === 'android') {
        await this.initAndroid();
      }
    } catch (e) {
      console.warn(`[PlatformSDK:${this.platform}] init fallback:`, e);
    }

    this.initialized = true;
    console.info(`[PlatformSDK] Активная площадка: ${this.platform.toUpperCase()}`);
    return this.platform;
  }

  async initYandex() {
    // Ждём асинхронную загрузку sdk.js максимум 2.5 секунды
    for (let i = 0; i < 25; i++) {
      if (window.YaGames) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!window.YaGames) return;

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('YaGames init timeout')), 3000)
    );
    this.ysdk = await Promise.race([window.YaGames.init(), timeout]);
  }

  async initVK() {
    for (let i = 0; i < 25; i++) {
      if (window.vkBridge) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!window.vkBridge) return;

    this.vkBridge = window.vkBridge;
    await this.vkBridge.send('VKWebAppInit');
  }

  async initAndroid() {
    // Инициализируем нативный рекламный мост (AdMob / Appodeal / MyTarget), если подключён в Capacitor
    const admob = window.Capacitor?.Plugins?.AdMob;
    if (admob && typeof admob.initialize === 'function') {
      await admob.initialize({ initializeForTesting: false });
    }
  }

  notifyLoadingReady() {
    try {
      if (this.platform === 'yandex' && this.ysdk?.features?.LoadingAPI) {
        this.ysdk.features.LoadingAPI.ready();
      }
    } catch {}
  }

  notifyGameplayStart() {
    try {
      if (this.platform === 'yandex' && this.ysdk?.features?.GameplayAPI) {
        this.ysdk.features.GameplayAPI.start();
      }
    } catch {}
  }

  notifyGameplayStop() {
    try {
      if (this.platform === 'yandex' && this.ysdk?.features?.GameplayAPI) {
        this.ysdk.features.GameplayAPI.stop();
      }
    } catch {}
  }

  showRewarded(onReward, onClose = null) {
    if (this.isAdShowing) return;

    // --- 1. YANDEX GAMES ---
    if (this.platform === 'yandex' && this.ysdk?.adv?.showRewardedVideo) {
      let rewarded = false;
      this.isAdShowing = true;
      this.ysdk.adv.showRewardedVideo({
        callbacks: {
          onOpen: () => {
            AudioManager.suspendForAd();
            this.notifyGameplayStop();
          },
          onRewarded: () => {
            rewarded = true;
          },
          onClose: () => {
            this.isAdShowing = false;
            AudioManager.resumeAfterAd();
            this.notifyGameplayStart();
            if (rewarded && typeof onReward === 'function') onReward();
            if (typeof onClose === 'function') onClose(rewarded);
          },
          onError: (err) => {
            console.warn('Yandex Rewarded ad error:', err);
            this.isAdShowing = false;
            AudioManager.resumeAfterAd();
            this.notifyGameplayStart();
            if (typeof onClose === 'function') onClose(false);
          }
        }
      });
      return;
    }

    // --- 2. VK GAMES / VK MINI APPS ---
    if (this.platform === 'vk' && this.vkBridge) {
      this.isAdShowing = true;
      AudioManager.suspendForAd();
      this.vkBridge
        .send('VKWebAppShowNativeAds', { ad_format: 'reward' })
        .then((data) => {
          this.isAdShowing = false;
          AudioManager.resumeAfterAd();
          const ok = Boolean(data?.result);
          if (ok && typeof onReward === 'function') onReward();
          if (typeof onClose === 'function') onClose(ok);
        })
        .catch((err) => {
          console.warn('VK Rewarded ad error:', err);
          this.isAdShowing = false;
          AudioManager.resumeAfterAd();
          if (typeof onClose === 'function') onClose(false);
        });
      return;
    }

    // --- 3. ANDROID (Capacitor AdMob / Нативный мост) ---
    if (this.platform === 'android') {
      const admob = window.Capacitor?.Plugins?.AdMob;
      if (admob && typeof admob.showRewardVideoAd === 'function') {
        this.isAdShowing = true;
        AudioManager.suspendForAd();
        admob
          .showRewardVideoAd()
          .then(() => {
            this.isAdShowing = false;
            AudioManager.resumeAfterAd();
            if (typeof onReward === 'function') onReward();
            if (typeof onClose === 'function') onClose(true);
          })
          .catch(() => {
            this.isAdShowing = false;
            AudioManager.resumeAfterAd();
            if (typeof onReward === 'function') onReward();
            if (typeof onClose === 'function') onClose(true);
          });
        return;
      }
    }

    // --- 4. WEB / OFFLINE FALLBACK ---
    if (typeof onReward === 'function') onReward();
    if (typeof onClose === 'function') onClose(true);
  }

  onRestorationCompleted() {
    this.restorationsSinceAd++;
    const now = Date.now();
    if (this.restorationsSinceAd >= 3 && now - this.lastInterstitialTime > 180000) {
      this.showInterstitial();
    }
  }

  showInterstitial() {
    if (this.isAdShowing) return;

    // --- 1. YANDEX GAMES ---
    if (this.platform === 'yandex' && this.ysdk?.adv?.showFullscreenAdv) {
      this.isAdShowing = true;
      this.ysdk.adv.showFullscreenAdv({
        callbacks: {
          onOpen: () => {
            AudioManager.suspendForAd();
            this.notifyGameplayStop();
          },
          onClose: () => {
            this.isAdShowing = false;
            this.lastInterstitialTime = Date.now();
            this.restorationsSinceAd = 0;
            AudioManager.resumeAfterAd();
            this.notifyGameplayStart();
          },
          onError: () => {
            this.isAdShowing = false;
            AudioManager.resumeAfterAd();
            this.notifyGameplayStart();
          }
        }
      });
      return;
    }

    // --- 2. VK GAMES ---
    if (this.platform === 'vk' && this.vkBridge) {
      this.isAdShowing = true;
      AudioManager.suspendForAd();
      this.vkBridge
        .send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
        .finally(() => {
          this.isAdShowing = false;
          this.lastInterstitialTime = Date.now();
          this.restorationsSinceAd = 0;
          AudioManager.resumeAfterAd();
        });
      return;
    }

    // --- 3. ANDROID ---
    if (this.platform === 'android') {
      const admob = window.Capacitor?.Plugins?.AdMob;
      if (admob && typeof admob.showInterstitial === 'function') {
        this.isAdShowing = true;
        AudioManager.suspendForAd();
        admob.showInterstitial().finally(() => {
          this.isAdShowing = false;
          this.lastInterstitialTime = Date.now();
          this.restorationsSinceAd = 0;
          AudioManager.resumeAfterAd();
        });
        return;
      }
    }

    this.lastInterstitialTime = Date.now();
    this.restorationsSinceAd = 0;
  }
}

export const PlatformSDK = new MultiPlatformSDKManager();
// Обратная совместимость для всех существующих импортов в сценах
export const YandexSDK = PlatformSDK;
