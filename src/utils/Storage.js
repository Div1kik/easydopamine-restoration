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
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  }

  static getCoins() {
    return this.get('coins', 0);
  }

  static addCoins(amount) {
    const current = this.getCoins();
    const updated = current + amount;
    this.set('coins', updated);
    return updated;
  }

  static getCurrentLevelIndex() {
    return this.get('level_index', 0);
  }

  static setNextLevel(totalLevels) {
    const current = this.getCurrentLevelIndex();
    const next = (current + 1) % totalLevels;
    this.set('level_index', next);
    return next;
  }

  // Коллекция открытых артефактов
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

  // Состояние звука
  static isMuted() {
    return this.get('sound_muted', false);
  }

  static toggleMute() {
    const state = !this.isMuted();
    this.set('sound_muted', state);
    return state;
  }
}
