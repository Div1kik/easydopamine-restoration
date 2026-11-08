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

  isMuted: () => localStorage.getItem('muted') === 'true',
  setMuted: (val) => localStorage.setItem('muted', val ? 'true' : 'false'),

  // Сессия для возврата из лавки на верстак
  setActiveSession: (data) => localStorage.setItem('active_restore_session', JSON.stringify(data)),
  getActiveSession: () => {
    try {
      return JSON.parse(localStorage.getItem('active_restore_session') || 'null');
    } catch {
      return null;
    }
  }
};
