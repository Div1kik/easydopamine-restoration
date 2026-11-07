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
      this.syncToYandexCloud();
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  }

  static async syncToYandexCloud() {
    if (YandexSDK.player) {
      try {
        const payload = {
          coins: this.getCoins(),
          xp: this.getXP(),
          workshop_tier: this.getWorkshopTier(),
          inventory: this.getInventory(),
          recent_history: this.getRecentHistory(),
          owned_tools: this.getOwnedTools(),
          equipped_tools: this.getEquippedTools()
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
          if (data.xp !== undefined) this.setLocal('xp', data.xp);
          if (data.workshop_tier !== undefined) this.setLocal('workshop_tier', data.workshop_tier);
          if (data.inventory) this.setLocal('inventory', data.inventory);
          if (data.recent_history) this.setLocal('recent_history', data.recent_history);
          if (data.owned_tools) this.setLocal('owned_tools', data.owned_tools);
          if (data.equipped_tools) this.setLocal('equipped_tools', data.equipped_tools);
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

  // 1. ДЕНЬГИ И ОПЫТ
  static getCoins() {
    return this.get('coins', 150);
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

  static getXP() {
    return this.get('xp', 0);
  }

  static addXP(amount) {
    const current = this.getXP();
    const updated = current + amount;
    this.set('xp', updated);
    return updated;
  }

  static getMasterLevel() {
    const xp = this.getXP();
    if (xp < 350) return 1;
    if (xp < 900) return 2;
    if (xp < 1800) return 3;
    if (xp < 3200) return 4;
    return 5;
  }

  static getXPProgress() {
    const xp = this.getXP();
    const lvl = this.getMasterLevel();
    const thresholds = [0, 350, 900, 1800, 3200, 6000];
    const currentBase = thresholds[lvl - 1];
    const nextBase = thresholds[lvl] || 6000;
    const progress = (xp - currentBase) / (nextBase - currentBase);
    return Math.min(Math.max(progress, 0), 1);
  }

  // 2. АПГРЕЙД МАСТЕРСКОЙ (1..4)
  static getWorkshopTier() {
    return this.get('workshop_tier', 1);
  }

  static upgradeWorkshopTier() {
    const current = this.getWorkshopTier();
    if (current < 4) {
      this.set('workshop_tier', current + 1);
      return true;
    }
    return false;
  }

  // 3. ИНВЕНТАРЬ ВИТРИНЫ (Реальные предметы, которые можно продать)
  static getInventory() {
    return this.get('inventory', []);
  }

  static addArtifactToInventory(artInstance) {
    const inv = this.getInventory();
    inv.push(artInstance);
    this.set('inventory', inv);

    // Добавляем в историю недавних выпадений
    this.pushRecentHistory(artInstance.templateId);
  }

  static removeArtifactFromInventory(instanceId) {
    let inv = this.getInventory();
    inv = inv.filter(item => item.instanceId !== instanceId);
    this.set('inventory', inv);
  }

  // 4. ИСТОРИЯ ВЫПАДЕНИЙ (гарантия: не чаще, чем раз в 3 заказа)
  static getRecentHistory() {
    return this.get('recent_history', []);
  }

  static pushRecentHistory(templateId) {
    const history = this.getRecentHistory();
    history.push(templateId);
    if (history.length > 5) history.shift();
    this.set('recent_history', history);
  }

  static isRecentlyUsed(templateId) {
    const history = this.getRecentHistory();
    // Последние 3 предмета не должны повторяться
    const lastThree = history.slice(-3);
    return lastThree.includes(templateId);
  }

  // 5. ИНСТРУМЕНТЫ
  static getOwnedTools() {
    return this.get('owned_tools', ['scraper_1', 'solvent_1', 'glue_1', 'brush_1', 'polish_1']);
  }

  static unlockTool(toolId) {
    const owned = this.getOwnedTools();
    if (!owned.includes(toolId)) {
      owned.push(toolId);
      this.set('owned_tools', owned);
    }
  }

  static getEquippedTools() {
    return this.get('equipped_tools', {
      tool_scraper: 'scraper_1',
      tool_solvent: 'solvent_1',
      tool_glue: 'glue_1',
      tool_brush: 'brush_1',
      tool_polish: 'polish_1'
    });
  }

  static equipTool(type, toolId) {
    const equipped = this.getEquippedTools();
    equipped[type] = toolId;
    this.set('equipped_tools', equipped);
  }

  static isMuted() {
    return this.get('sound_muted', false);
  }

  static toggleMute() {
    const state = !this.isMuted();
    this.set('sound_muted', state);
    return state;
  }
}
