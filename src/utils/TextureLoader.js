export const TextureLoader = {
  _pending: {},

  loadImage(scene, key, url, onLoaded = null) {
    if (!scene || !scene.textures) return;

    if (scene.textures.exists(key)) {
      if (onLoaded) onLoaded(key);
      return;
    }

    if (this._pending[key]) {
      if (onLoaded) this._pending[key].push(onLoaded);
      return;
    }

    this._pending[key] = onLoaded ? [onLoaded] : [];

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        if (!scene.textures.exists(key)) {
          scene.textures.addImage(key, img);
        }
      } catch (e) {
        console.warn(`TextureLoader error for ${key}:`, e);
      }
      const cbs = this._pending[key] || [];
      delete this._pending[key];
      cbs.forEach((cb) => {
        try { cb(key); } catch {}
      });
    };
    img.onerror = () => {
      console.warn(`Не удалось загрузить изображение: ${url}`);
      delete this._pending[key];
    };
    img.src = url;
  }
};
