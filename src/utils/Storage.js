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
}
