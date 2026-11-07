class YandexSDKBridge {
  constructor() {
    this.ysdk = null;
    this.player = null;
    this.isInitialized = false;
  }

  async init() {
    if (typeof YaGames === 'undefined') {
      console.log('Yandex SDK не обнаружен (запуск вне портала). Используется локальное хранилище.');
      return;
    }

    try {
      this.ysdk = await YaGames.init();
      this.isInitialized = true;
      console.log('Yandex SDK успешно инициализирован.');

      try {
        this.player = await this.ysdk.getPlayer({ scopes: false });
      } catch (err) {
        console.warn('Не удалось получить игрока Yandex:', err);
      }
    } catch (e) {
      console.warn('Ошибка инициализации YaGames:', e);
    }
  }

  // Межстраничная полноэкранная реклама
  showFullscreenAdv(callbacks = {}) {
    if (!this.ysdk) {
      if (callbacks.onClose) callbacks.onClose(false);
      return;
    }

    this.ysdk.adv.showFullscreenAdv({
      callbacks: {
        onOpen: () => { if (callbacks.onOpen) callbacks.onOpen(); },
        onClose: (wasShown) => { if (callbacks.onClose) callbacks.onClose(wasShown); },
        onError: (err) => { if (callbacks.onError) callbacks.onError(err); }
      }
    });
  }

  // Реклама за вознаграждение (удвоение золота)
  showRewardedVideo(callbacks = {}) {
    if (!this.ysdk) {
      // Для тестов вне портала сразу отдаем успех
      if (callbacks.onRewarded) callbacks.onRewarded();
      if (callbacks.onClose) callbacks.onClose();
      return;
    }

    this.ysdk.adv.showRewardedVideo({
      callbacks: {
        onOpen: () => { if (callbacks.onOpen) callbacks.onOpen(); },
        onRewarded: () => { if (callbacks.onRewarded) callbacks.onRewarded(); },
        onClose: () => { if (callbacks.onClose) callbacks.onClose(); },
        onError: (err) => { if (callbacks.onError) callbacks.onError(err); }
      }
    });
  }
}

export const YandexSDK = new YandexSDKBridge();
