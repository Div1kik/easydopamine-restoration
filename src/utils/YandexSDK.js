class YandexSDKManager {
  constructor() {
    this.ysdk = null;
    this.initialized = false;
    this.lastInterstitialTime = 0;
    this.restorationsSinceAd = 0;
  }

  async init() {
    if (this.initialized) return this.ysdk;
    if (typeof window !== 'undefined' && window.YaGames) {
      try {
        this.ysdk = await window.YaGames.init();
        this.initialized = true;
        if (this.ysdk.features && this.ysdk.features.LoadingAPI) {
          this.ysdk.features.LoadingAPI.ready();
        }
      } catch (e) {
        console.warn('YaGames init fallback:', e);
      }
    }
    return this.ysdk;
  }

  notifyGameplayStart() {
    try {
      if (this.ysdk && this.ysdk.features && this.ysdk.features.GameplayAPI) {
        this.ysdk.features.GameplayAPI.start();
      }
    } catch {}
  }

  notifyGameplayStop() {
    try {
      if (this.ysdk && this.ysdk.features && this.ysdk.features.GameplayAPI) {
        this.ysdk.features.GameplayAPI.stop();
      }
    } catch {}
  }

  showRewarded(onReward, onClose = null) {
    if (this.ysdk && this.ysdk.adv && this.ysdk.adv.showRewardedVideo) {
      let rewarded = false;
      this.notifyGameplayStop();
      this.ysdk.adv.showRewardedVideo({
        callbacks: {
          onRewarded: () => {
            rewarded = true;
          },
          onClose: () => {
            this.notifyGameplayStart();
            if (rewarded && typeof onReward === 'function') onReward();
            if (typeof onClose === 'function') onClose(rewarded);
          },
          onError: (err) => {
            console.warn('Rewarded ad error:', err);
            this.notifyGameplayStart();
            if (typeof onClose === 'function') onClose(false);
          }
        }
      });
    } else {
      // Локальный / GitHub Pages фолбэк для тестирования награждаемой рекламы
      if (typeof onReward === 'function') onReward();
      if (typeof onClose === 'function') onClose(true);
    }
  }

  onRestorationCompleted() {
    this.restorationsSinceAd++;
    const now = Date.now();
    // Показываем межстраничную рекламу не чаще 1 раза в 3 реставрации и не чаще 1 раза в 180 сек
    if (this.restorationsSinceAd >= 3 && now - this.lastInterstitialTime > 180000) {
      this.showInterstitial();
    }
  }

  showInterstitial() {
    if (this.ysdk && this.ysdk.adv && this.ysdk.adv.showFullscreenAdv) {
      this.notifyGameplayStop();
      this.ysdk.adv.showFullscreenAdv({
        callbacks: {
          onClose: () => {
            this.lastInterstitialTime = Date.now();
            this.restorationsSinceAd = 0;
            this.notifyGameplayStart();
          },
          onError: () => {
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
