import { AudioManager } from './AudioManager.js';

class YandexSDKManager {
  constructor() {
    this.ysdk = null;
    this.initialized = false;
    this.lastInterstitialTime = 0;
    this.restorationsSinceAd = 0;
    this.isAdShowing = false;
  }

  isYandexEnvironment() {
    if (typeof window === 'undefined') return false;
    try {
      return window.self !== window.top && Boolean(window.YaGames);
    } catch {
      return Boolean(window.YaGames);
    }
  }

  async init() {
    if (this.initialized) return this.ysdk;

    if (!this.isYandexEnvironment()) {
      this.initialized = true;
      return null;
    }

    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('YaGames init timeout')), 3000)
      );
      this.ysdk = await Promise.race([window.YaGames.init(), timeout]);
      this.initialized = true;
    } catch (e) {
      this.initialized = true;
      console.warn('YaGames init fallback:', e);
    }

    return this.ysdk;
  }

  notifyLoadingReady() {
    try {
      if (this.ysdk?.features?.LoadingAPI) {
        this.ysdk.features.LoadingAPI.ready();
      }
    } catch {}
  }

  notifyGameplayStart() {
    try {
      if (this.ysdk?.features?.GameplayAPI) {
        this.ysdk.features.GameplayAPI.start();
      }
    } catch {}
  }

  notifyGameplayStop() {
    try {
      if (this.ysdk?.features?.GameplayAPI) {
        this.ysdk.features.GameplayAPI.stop();
      }
    } catch {}
  }

  showRewarded(onReward, onClose = null) {
    if (this.isAdShowing) return;

    if (this.ysdk?.adv?.showRewardedVideo) {
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
            console.warn('Rewarded ad error:', err);
            this.isAdShowing = false;
            AudioManager.resumeAfterAd();
            this.notifyGameplayStart();
            if (typeof onClose === 'function') onClose(false);
          }
        }
      });
    } else {
      if (typeof onReward === 'function') onReward();
      if (typeof onClose === 'function') onClose(true);
    }
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

    if (this.ysdk?.adv?.showFullscreenAdv) {
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
    } else {
      this.lastInterstitialTime = Date.now();
      this.restorationsSinceAd = 0;
    }
  }
}

export const YandexSDK = new YandexSDKManager();
