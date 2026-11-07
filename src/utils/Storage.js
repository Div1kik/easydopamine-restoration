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
