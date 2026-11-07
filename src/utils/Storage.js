import { YandexSDK } from './YandexSDK.js';

export class Storage {
  static get(key, defaultValue) {
    try {
      const item = localStorage.getItem(`edg_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(`edg_${key}`, JSON.stringify(value));
      // Асинхронная отправка копии в облако Яндекса
      this.syncToYandexCloud();
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  }

  // Облачная синхронизация с аккаунтом игрока
  static async syncToYandexCloud() {
    if (YandexSDK.player) {
      try {
        const payload = {
          coins: this.getCoins(),
          level_index: this.getCurrentLevelIndex(),
          unlocked_artifacts: this.getUnlockedArtifacts(),
          owned_tools: this.getOwnedTools(),
          equipped_tool: this.getEquippedTool(),
          stars: this.getStarsData()
        };
        await YandexSDK.player.setData(payload, true);
      } catch (err) {
        console.warn("Yandex Cloud save failed", err);
      }
    }
  }

  static async loadFromYandexCloud() {
    if (YandexSDK.player) {
      try {
        const data = await YandexSDK.player.getData();
        if (data && typeof data === 'object') {
          if (data.coins !== undefined) this.setLocal('coins', data.coins);
          if (data.level_index !== undefined) this.setLocal('level_index', data.level_index);
          if (data.unlocked_artifacts) this.setLocal('unlocked_artifacts', data.unlocked_artifacts);
          if (data.owned_tools) this.setLocal('owned_tools', data.owned_tools);
          if (data.equipped_tool) this.setLocal('equipped_tool', data.equipped_tool);
          if (data.stars) this.setLocal('stars', data.stars);
        }
      } catch (err) {
        console.warn("Yandex Cloud load failed", err);
      }
    }
  }

  static setLocal(key, value) {
    try {
      localStorage.setItem(`edg_${key}`, JSON.stringify(value));
    } catch {}
  }

  // Монеты
  static getCoins() {
    return this.get('coins', 0);
  }

  static addCoins(amount) {
    const current = this.getCoins();
    const updated = current + amount;
    this.set('coins', updated);
    return updated;
  }

  static spendCoins(amount) {
    const current = this.getCoins();
    if (current >= amount) {
      this.set('coins', current - amount);
      return true;
    }
    return false;
  }

  // Уровни
  static getCurrentLevelIndex() {
    return this.get('level_index', 0);
  }

  static setNextLevel(totalLevels) {
    const current = this.getCurrentLevelIndex();
    const next = (current + 1) % totalLevels;
    this.set('level_index', next);
    return next;
  }

  // Музей
  static unlockArtifact(id) {
    const unlocked = this.get('unlocked_artifacts', []);
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      this.set('unlocked_artifacts', unlocked);
    }
  }

  static getUnlockedArtifacts() {
    return this.get('unlocked_artifacts', []);
  }

  // Звезды
  static getStarsData() {
    return this.get('stars', {});
  }

  static setStars(artifactId, stars) {
    const data = this.getStarsData();
    if (!data[artifactId] || data[artifactId] < stars) {
      data[artifactId] = stars;
      this.set('stars', data);
    }
  }

  static getStars(artifactId) {
    const data = this.getStarsData();
    return data[artifactId] || 0;
  }

  // Инструменты
  static getOwnedTools() {
    return this.get('owned_tools', ['tool_basic']);
  }

  static getEquippedTool() {
    return this.get('equipped_tool', 'tool_basic');
  }

  static equipTool(id) {
    this.set('equipped_tool', id);
  }

  static buyTool(id, price) {
    if (this.spendCoins(price)) {
      const owned = this.getOwnedTools();
      if (!owned.includes(id)) {
        owned.push(id);
        this.set('owned_tools', owned);
      }
      this.equipTool(id);
      return true;
    }
    return false;
  }

  // Звук
  static isMuted() {
    return this.get('sound_muted', false);
  }

  static toggleMute() {
    const state = !this.isMuted();
    this.set('sound_muted', state);
    return state;
  }
}
