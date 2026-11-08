import { YandexSDK } from './YandexSDK.js';

const PREFIX = 'easydopamine_restoration_';

export const Storage = {
  get(key, defaultValue) {
    try {
      const val = localStorage.getItem(PREFIX + key);
      return val !== null ? JSON.parse(val) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      if (YandexSDK && typeof YandexSDK.saveToCloud === 'function') {
        YandexSDK.saveToCloud({ [key]: value });
      }
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  },

  // --- МОНЕТЫ И БАЛАНС ---
  getCoins() {
    return this.get('coins', 150);
  },

  setCoins(amount) {
    this.set('coins', Math.max(0, amount));
  },

  addCoins(amount) {
    const current = this.getCoins();
    this.setCoins(current + amount);
  },

  // --- ОПЫТ (XP) И РАНГИ МАСТЕРА ---
  getXP() {
    return this.get('player_xp', 0);
  },

  addXP(amount) {
    const current = this.getXP();
    this.set('player_xp', current + amount);
  },

  getMasterLevel() {
    const xp = this.getXP();
    if (xp >= 3200) return 5;
    if (xp >= 1800) return 4;
    if (xp >= 900) return 3;
    if (xp >= 350) return 2;
    return 1;
  },

  // --- ПРОВЕРКА ОТКРЫТИЯ 7 РЕГИОНОВ ---
  isRegionUnlocked(regionId) {
    if (regionId === 'egypt') return true;

    const lvl = this.getMasterLevel();
    const history = this.getRecentHistory();
    const inventory = this.getInventory();
    const sold = this.get('sold_artifacts', []);

    const hasRestoredFromRegion = (regId) => {
      const inInv = inventory.some(item => item && item.regionId === regId);
      const inHistory = history.some(id => typeof id === 'string' && id.startsWith(regId));
      const inSold = sold.some(s => s && s.regionId === regId);
      return inInv || inHistory || inSold;
    };

    if (regionId === 'greece') {
      return lvl >= 2;
    }
    if (regionId === 'europe') {
      return lvl >= 2 && hasRestoredFromRegion('greece');
    }
    if (regionId === 'japan') {
      return lvl >= 3;
    }
    if (regionId === 'mesoamerica') {
      return lvl >= 3 && hasRestoredFromRegion('japan');
    }
    if (regionId === 'viking') {
      return lvl >= 4;
    }
    if (regionId === 'china') {
      return lvl >= 5;
    }

    return false;
  },

  getRegionLockReason(regionId) {
    switch (regionId) {
      case 'greece':
        return 'Требуется Ранг Мастера II (350 XP)';
      case 'europe':
        return 'Отреставрируйте хотя бы 1 реликвию Греции';
      case 'japan':
        return 'Требуется Ранг Мастера III (900 XP)';
      case 'mesoamerica':
        return 'Отреставрируйте хотя бы 1 реликвию Японии';
      case 'viking':
        return 'Требуется Ранг Мастера IV (1800 XP)';
      case 'china':
        return 'Требуется Ранг Мастера V (3200 XP)';
      default:
        return 'Регион заблокирован';
    }
  },

  // --- ИНВЕНТАРЬ ЛАВКИ И ИСТОРИЯ ---
  getInventory() {
    return this.get('inventory', []);
  },

  addArtifactToInventory(artifact) {
    const list = this.getInventory();
    list.unshift(artifact);
    this.set('inventory', list);

    const history = this.getRecentHistory();
    history.push(artifact.templateId || artifact.id || 'artifact');
    if (history.length > 20) history.shift();
    this.set('recent_history', history);
  },

  removeArtifactFromInventory(instanceId) {
    const list = this.getInventory();
    const idx = list.findIndex(item => item.instanceId === instanceId);
    if (idx !== -1) {
      const soldItem = list.splice(idx, 1)[0];
      this.set('inventory', list);

      const sold = this.get('sold_artifacts', []);
      sold.push(soldItem);
      this.set('sold_artifacts', sold);
    }
  },

  getRecentHistory() {
    return this.get('recent_history', []);
  },

  // --- УРОВЕНЬ МАСТЕРСКОЙ (ТИР 1..4) ---
  getWorkshopTier() {
    return this.get('workshop_tier', 1);
  },

  setWorkshopTier(tier) {
    this.set('workshop_tier', Math.min(4, Math.max(1, tier)));
  },

  // --- ЭКИПИРОВКА ИНСТРУМЕНТОВ ---
  getEquippedTools() {
    return this.get('equipped_tools', {
      tool_scraper: 'scraper_1',
      tool_brush: 'brush_1',
      tool_solvent: 'solvent_1',
      tool_glue: 'glue_1',
      tool_polish: 'polish_1'
    });
  },

  setEquippedTool(type, toolId) {
    const equipped = this.getEquippedTools();
    equipped[type] = toolId;
    this.set('equipped_tools', equipped);
  },

  // --- НАСТРОЙКИ ЗВУКА ---
  isMuted() {
    return this.get('muted', false);
  },

  setMuted(val) {
    this.set('muted', Boolean(val));
  },

  toggleMute() {
    const next = !this.isMuted();
    this.setMuted(next);
    return next;
  },

  // --- СИНХРОНИЗАЦИЯ С ОБЛАКОМ YANDEX ---
  async loadFromYandexCloud() {
    try {
      if (YandexSDK && typeof YandexSDK.loadFromCloud === 'function') {
        const cloudData = await YandexSDK.loadFromCloud();
        if (cloudData && typeof cloudData === 'object') {
          Object.entries(cloudData).forEach(([k, v]) => {
            localStorage.setItem(PREFIX + k, JSON.stringify(v));
          });
        }
      }
    } catch (e) {
      console.warn('Cloud sync error:', e);
    }
  }
};
