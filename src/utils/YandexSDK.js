class YandexSDKBridge {
  constructor() {
    this.ysdk = null;
    this.player = null;
    this.isInitialized = false;
  }

  async init() {
    // Если страница открыта не внутри iframe Яндекса — SDK не инициализируем
    const isInsideIframe = (window.self !== window.top);
    if (typeof YaGames === 'undefined' || !isInsideIframe) {
      console.log('Автономный режим (запуск вне портала Yandex). Хранилище: LocalStorage.');
      return;
    }

    try {
      this.ysdk = await YaGames.init();
      this.isInitialized = true;
      try {
        this.player = await this.ysdk.getPlayer({ scopes: false });
      } catch (err) {
        console.warn('Игрок Yandex не авторизован:', err);
      }
    } catch (e) {
      console.warn('YaGames.init пропущен:', e);
    }
  }

  showFullscreenAdv(callbacks = {}) {
    if (!this.ysdk) {
      if (callbacks.onClose) callbacks.onClose(false);
      return;
    }
    this.ysdk.adv.showFullscreenAdv({
      callbacks: {
        onClose: (wasShown) => { if (callbacks.onClose) callbacks.onClose(wasShown); },
        onError: (err) => { if (callbacks.onError) callbacks.onError(err); }
      }
    });
  }

  showRewardedVideo(callbacks = {}) {
    if (!this.ysdk) {
      if (callbacks.onRewarded) callbacks.onRewarded();
      if (callbacks.onClose) callbacks.onClose();
      return;
    }
    this.ysdk.adv.showRewardedVideo({
      callbacks: {
        onRewarded: () => { if (callbacks.onRewarded) callbacks.onRewarded(); },
        onClose: () => { if (callbacks.onClose) callbacks.onClose(); },
        onError: (err) => { if (callbacks.onError) callbacks.onError(err); }
      }
    });
  }
}

export const YandexSDK = new YandexSDKBridge();
