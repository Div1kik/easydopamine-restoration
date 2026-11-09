export const Storage = {
  getCoins: () => parseInt(localStorage.getItem('coins') || '0', 10),
  addCoins: (amount) => {
    const next = Math.max(0, Storage.getCoins() + amount);
    localStorage.setItem('coins', next.toString());
    return next;
  },

  getXP: () => parseInt(localStorage.getItem('xp') || '0', 10),
  addXP: (amount) => {
    const next = Storage.getXP() + amount;
    localStorage.setItem('xp', next.toString());
    return next;
  },

  getWorkshopTier: () => parseInt(localStorage.getItem('workshop_tier') || '1', 10),
  setWorkshopTier: (tier) => localStorage.setItem('workshop_tier', tier.toString()),

  getInventory: () => {
    try {
      return JSON.parse(localStorage.getItem('inventory') || '[]');
    } catch {
      return [];
    }
  },
  addArtifactToInventory: (item) => {
    const inv = Storage.getInventory();
    inv.unshift(item);
    localStorage.setItem('inventory', JSON.stringify(inv));
  },
  removeArtifactFromInventory: (instanceId) => {
    const inv = Storage.getInventory().filter(it => it.instanceId !== instanceId);
    localStorage.setItem('inventory', JSON.stringify(inv));
    return inv;
  },

  getRecentHistory: () => {
    try {
      return JSON.parse(localStorage.getItem('recent_history') || '[]');
    } catch {
      return [];
    }
  },
  recordHistory: (templateId) => {
    const hist = Storage.getRecentHistory();
    hist.push(templateId);
    if (hist.length > 8) hist.shift();
    localStorage.setItem('recent_history', JSON.stringify(hist));
  },

  // Раздельные флаги звука
  isMusicMuted: () => localStorage.getItem('music_muted') === 'true',
  setMusicMuted: (val) => localStorage.setItem('music_muted', val ? 'true' : 'false'),

  isSfxMuted: () => localStorage.getItem('sfx_muted') === 'true',
  setSfxMuted: (val) => localStorage.setItem('sfx_muted', val ? 'true' : 'false'),

  setActiveSession: (data) => localStorage.setItem('active_restore_session', JSON.stringify(data)),
  getActiveSession: () => {
    try {
      return JSON.parse(localStorage.getItem('active_restore_session') || 'null');
    } catch {
      return null;
    }
  }
};
