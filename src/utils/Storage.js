import { YandexSDK } from './YandexSDK.js';

const STORAGE_PREFIX = 'easydopamine_restoration_';

function readKey(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function writeKey(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    if (YandexSDK && typeof YandexSDK.saveToCloud === 'function') {
      YandexSDK.saveToCloud({ [key]: value });
    }
  } catch (err) {
    console.warn('Storage write error:', err);
  }
}

export const Storage = {
  get: (key, fallback) => readKey(key, fallback),
  set: (key, value) => writeKey(key, value),

  // --- БАЛАНС ---
  getCoins: () => readKey('coins', 150),
  setCoins: (amount) => writeKey('coins', Math.max(0, amount)),
  addCoins: (amount) => {
    const current = readKey('coins', 150);
    writeKey('coins', current + amount);
  },

  // --- XP И РАНГИ ---
  getXP: () => readKey('player_xp', 0),
  addXP: (amount) => {
    const current = readKey('player_xp', 0);
    writeKey('player_xp', current + amount);
  },
  getMasterLevel: () => {
    const xp = readKey('player_xp', 0);
    if (xp >= 3200) return 5;
    if (xp >= 1800) return 4;
    if (xp >= 900) return 3;
    if (xp >= 350) return 2;
    return 1;
  },

  // --- ЛОГИКА 7 РЕГИОНОВ ---
  isRegionUnlocked: (regionId) => {
    if (regionId === 'egypt') return true;

    const xp = readKey('player_xp', 0);
    let lvl = 1;
    if (xp >= 3200) lvl = 5;
    else if (xp >= 1800) lvl = 4;
    else if (xp >= 900) lvl = 3;
    else if (xp >= 350) lvl = 2;

    const history = readKey('recent_history', []);
    const inventory = readKey('inventory', []);
    const sold = readKey('sold_artifacts', []);

    const hasRestored = (regId) => {
      const inInv = inventory.some((item) => item && item.regionId === regId);
      const inHist = history.some((id) => typeof id === 'string' && id.startsWith(regId));
      const inSold = sold.some((s) => s && s.regionId === regId);
      return inInv || inHist || inSold;
    };

    if (regionId === 'greece') return lvl >= 2;
    if (regionId === 'europe') return lvl >= 2 && hasRestored('greece');
    if (regionId === 'japan') return lvl >= 3;
    if (regionId === 'mesoamerica') return lvl >= 3 && hasRestored('japan');
    if (regionId === 'viking') return lvl >= 4;
    if (regionId === 'china') return lvl >= 5;

    return false;
  },

  getRegionLockReason: (regionId) => {
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

  // --- ИНВЕНТАРЬ ---
  getInventory: () => readKey('inventory', []),
  addArtifactToInventory: (artifact) => {
    const list = readKey('inventory', []);
    list.unshift(artifact);
    writeKey('inventory', list);

    const history = readKey('recent_history', []);
    history.push(artifact.templateId || artifact.id || 'artifact');
    if (history.length > 20) history.shift();
    writeKey('recent_history', history);
  },
  removeArtifactFromInventory: (instanceId) => {
    const list = readKey('inventory', []);
    const idx = list.findIndex((item) => item && item.instanceId === instanceId);
    if (idx !== -1) {
      const soldItem = list.splice(idx, 1)[0];
      writeKey('inventory', list);

      const sold = readKey('sold_artifacts', []);
      sold.push(soldItem);
      writeKey('sold_artifacts', sold);
    }
  },
  getRecentHistory: () => readKey('recent_history', []),

  // --- УРОВЕНЬ МАСТЕРСКОЙ ---
  getWorkshopTier: () => readKey('workshop_tier', 1),
  setWorkshopTier: (tier) => writeKey('workshop_tier', Math.min(4, Math.max(1, tier))),

  // --- ИНСТРУМЕНТЫ ---
  getEquippedTools: () => readKey('equipped_tools', {
    tool_scraper: 'scraper_1',
    tool_brush: 'brush_1',
    tool_solvent: 'solvent_1',
    tool_glue: 'glue_1',
    tool_polish: 'polish_1'
  }),
  setEquippedTool: (type, toolId) => {
    const tools = readKey('equipped_tools', {
      tool_scraper: 'scraper_1',
      tool_brush: 'brush_1',
      tool_solvent: 'solvent_1',
      tool_glue: 'glue_1',
      tool_polish: 'polish_1'
    });
    tools[type] = toolId;
    writeKey('equipped_tools', tools);
  },

  // --- ЗВУК ---
  isMuted: () => readKey('muted', false),
  setMuted: (val) => writeKey('muted', Boolean(val)),
  toggleMute: () => {
    const next = !readKey('muted', false);
    writeKey('muted', next);
    return next;
  },

  // --- СИНХРОНИЗАЦИЯ ОБЛАКА ---
  loadFromYandexCloud: async () => {
    try {
      if (YandexSDK && typeof YandexSDK.loadFromCloud === 'function') {
        const cloudData = await YandexSDK.loadFromCloud();
        if (cloudData && typeof cloudData === 'object') {
          Object.entries(cloudData).forEach(([k, v]) => {
            localStorage.setItem(STORAGE_PREFIX + k, JSON.stringify(v));
          });
        }
      }
    } catch (err) {
      console.warn('Cloud sync error:', err);
    }
  }
};
