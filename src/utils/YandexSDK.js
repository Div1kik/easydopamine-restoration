import { AudioManager } from './AudioManager.js';

class YandexSDKManager {
  constructor() {
    this.bridge = null;
    this.initialized = false;
    this.lastInterstitialTime = 0;
    this.restorationsSinceAd = 0;
    this.isAdShowing = false;
  }

  getBridge() {
    if (typeof window !== 'undefined' && window.vkBridge) {
      return window.vkBridge;
    }
    return null;
  }

  async init() {
    if (this.initialized) return this.bridge;

    const bridge = this.getBridge();
    if (!bridge) {
      this.initialized = true;
      return null;
    }

    try {
      await bridge.send('VKWebAppInit');
      this.bridge = bridge;
      this.initialized = true;

      bridge.send('VKWebAppCheckNativeAds', { ad_format: 'reward' }).catch(() => {});
      bridge.send('VKWebAppCheckNativeAds', { ad_format: 'interstitial' }).catch(() => {});
    } catch (e) {
      this.initialized = true;
      console.warn('VK Bridge init fallback:', e);
    }

    return this.bridge;
  }

  notifyLoadingReady() {}

  notifyGameplayStart() {}

  notifyGameplayStop() {}

  showRewarded(onReward, onClose = null) {
    if (this.isAdShowing) return;

    if (this.bridge) {
      this.isAdShowing = true;
      AudioManager.suspendForAd();

      this.bridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' })
        .then((data) => {
          this.isAdShowing = false;
          AudioManager.resumeAfterAd();
          const rewarded = Boolean(data && data.result);
          if (rewarded && typeof onReward === 'function') onReward();
          if (typeof onClose === 'function') onClose(rewarded);
          this.bridge.send('VKWebAppCheckNativeAds', { ad_format: 'reward' }).catch(() => {});
        })
        .catch((err) => {
          console.warn('VK Rewarded ad error:', err);
          this.isAdShowing = false;
          AudioManager.resumeAfterAd();
          if (typeof onClose === 'function') onClose(false);
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

    if (this.bridge) {
      this.isAdShowing = true;
      AudioManager.suspendForAd();

      this.bridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
        .then(() => {
          this.isAdShowing = false;
          this.lastInterstitialTime = Date.now();
          this.restorationsSinceAd = 0;
          AudioManager.resumeAfterAd();
          this.bridge.send('VKWebAppCheckNativeAds', { ad_format: 'interstitial' }).catch(() => {});
        })
        .catch(() => {
          this.isAdShowing = false;
          AudioManager.resumeAfterAd();
        });
    } else {
      this.lastInterstitialTime = Date.now();
      this.restorationsSinceAd = 0;
    }
  }
}

export const YandexSDK = new YandexSDKManager();
