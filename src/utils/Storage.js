export const Storage = {
  // Ключи локального хранилища
  KEYS: {
    COINS: 'art_coins',
    XP: 'art_xp',
    WORKSHOP_TIER: 'art_workshop_tier',
    INVENTORY: 'art_inventory',
    HISTORY: 'art_history',
    SESSION: 'art_active_session',
    MUSIC_MUTED: 'art_music_muted',
    SFX_MUTED: 'art_sfx_muted'
  },

  getCoins() {
    return parseInt(localStorage.getItem(this.KEYS.COINS) || '0', 10);
  },

  setCoins(val) {
    localStorage.setItem(this.KEYS.COINS, Math.max(0, val).toString());
  },

  addCoins(amount) {
    const cur = this.getCoins();
    this.setCoins(cur + amount);
    return this.getCoins();
  },

  getXP() {
    return parseInt(localStorage.getItem(this.KEYS.XP) || '0', 10);
  },

  setXP(val) {
    localStorage.setItem(this.KEYS.XP, Math.max(0, val).toString());
  },

  addXP(amount) {
    const cur = this.getXP();
    this.setXP(cur + amount);
    return this.getXP();
  },

  getWorkshopTier() {
    return parseInt(localStorage.getItem(this.KEYS.WORKSHOP_TIER) || '1', 10);
  },

  setWorkshopTier(tier) {
    localStorage.setItem(this.KEYS.WORKSHOP_TIER, tier.toString());
  },

  getInventory() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.INVENTORY) || '[]');
    } catch {
      return [];
    }
  },

  addArtifactToInventory(artifact) {
    const list = this.getInventory();
    list.unshift(artifact);
    localStorage.setItem(this.KEYS.INVENTORY, JSON.stringify(list));
  },

  getRecentHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.HISTORY) || '[]');
    } catch {
      return [];
    }
  },

  addHistoryEntry(entry) {
    const list = this.getRecentHistory();
    list.unshift(entry);
    if (list.length > 20) list.pop();
    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(list));
  },

  getActiveSession() {
    try {
      const data = localStorage.getItem(this.KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setActiveSession(session) {
    if (!session) {
      localStorage.removeItem(this.KEYS.SESSION);
    } else {
      localStorage.setItem(this.KEYS.SESSION, JSON.stringify(session));
    }
  },

  isMusicMuted() {
    return localStorage.getItem(this.KEYS.MUSIC_MUTED) === 'true';
  },

  setMusicMuted(val) {
    localStorage.setItem(this.KEYS.MUSIC_MUTED, val ? 'true' : 'false');
  },

  isSfxMuted() {
    return localStorage.getItem(this.KEYS.SFX_MUTED) === 'true';
  },

  setSfxMuted(val) {
    localStorage.setItem(this.KEYS.SFX_MUTED, val ? 'true' : 'false');
  }
};
