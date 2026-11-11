export const Storage = {
  KEYS: {
    COINS: 'art_coins',
    XP: 'art_xp',
    WORKSHOP_TIER: 'art_workshop_tier',
    INVENTORY: 'art_inventory',
    HISTORY: 'art_history',
    SESSION: 'art_active_session',
    MUSIC_MUTED: 'art_music_muted',
    SFX_MUTED: 'art_sfx_muted',
    LAST_OFFLINE_TIME: 'art_last_offline_time',
    CLAIMED_LEVEL_REWARDS: 'art_claimed_level_rewards'
  },

  // --- ДЕНЬГИ ---
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

  // --- СИСТЕМА УРОВНЕЙ И РАНГОВ ---
  RANKS: [
    { level: 1, title: 'Ученик реставратора', minXP: 0 },
    { level: 2, title: 'Подмастерье древностей', minXP: 100 },
    { level: 3, title: 'Помощник хранителя', minXP: 260 },
    { level: 4, title: 'Младший реставратор', minXP: 480 },
    { level: 5, title: 'Музейный эксперт', minXP: 780 },
    { level: 6, title: 'Мастер реликвий', minXP: 1180 },
    { level: 7, title: 'Старший архивариус', minXP: 1700 },
    { level: 8, title: 'Королевский реставратор', minXP: 2360 },
    { level: 9, title: 'Магистр древностей', minXP: 3200 },
    { level: 10, title: 'Легендарный реставратор', minXP: 4250 }
  ],

  getXP() {
    return parseInt(localStorage.getItem(this.KEYS.XP) || '0', 10);
  },

  setXP(val) {
    localStorage.setItem(this.KEYS.XP, Math.max(0, val).toString());
  },

  getLevelData() {
    const currentXP = this.getXP();
    let currentRankIndex = 0;

    for (let i = 0; i < this.RANKS.length; i++) {
      if (currentXP >= this.RANKS[i].minXP) {
        currentRankIndex = i;
      } else {
        break;
      }
    }

    const currentRank = this.RANKS[currentRankIndex];
    const nextRank = this.RANKS[currentRankIndex + 1] || null;

    const baseXP = currentRank.minXP;
    const requiredForNext = nextRank ? nextRank.minXP - baseXP : 1000;
    const progressXP = nextRank ? Math.min(currentXP - baseXP, requiredForNext) : requiredForNext;
    const progressRatio = nextRank ? progressXP / requiredForNext : 1.0;

    return {
      level: currentRank.level,
      title: currentRank.title,
      currentXP,
      progressXP,
      requiredForNext,
      progressRatio,
      isMaxLevel: !nextRank
    };
  },

  addXP(amount) {
    const prevLevel = this.getLevelData().level;
    const newTotal = this.getXP() + amount;
    this.setXP(newTotal);
    const newLevelData = this.getLevelData();

    return {
      leveledUp: newLevelData.level > prevLevel,
      oldLevel: prevLevel,
      newLevel: newLevelData.level,
      newTitle: newLevelData.title
    };
  },

  // Вместимость музея зависит от уровня (базово 3 + 1 за каждые 2 уровня)
  getMaxMuseumCapacity() {
    const lvl = this.getLevelData().level;
    return Math.min(3 + Math.floor((lvl - 1) / 2), 12);
  },

  // --- ОФФЛАЙН-ДОХОД МУЗЕЯ (ЯНДЕКС ИГРЫ RETENTION) ---
  updateOfflineTimestamp() {
    localStorage.setItem(this.KEYS.LAST_OFFLINE_TIME, Date.now().toString());
  },

  getOfflineEarnings() {
    const lastTime = parseInt(localStorage.getItem(this.KEYS.LAST_OFFLINE_TIME) || '0', 10);
    const now = Date.now();
    this.updateOfflineTimestamp();

    if (!lastTime || lastTime > now) return { coins: 0, minutes: 0 };

    const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));
    // Начисление начинается от 5 минут отсутствия, макс. лимит 480 минут (8 часов)
    if (diffMinutes < 5) return { coins: 0, minutes: diffMinutes };

    const cappedMinutes = Math.min(diffMinutes, 480);
    const inventory = this.getInventory();
    const count = inventory.length;

    if (count === 0) return { coins: 0, minutes: cappedMinutes };

    // Базовый доход: 2 монеты за каждые 10 минут за каждый выставленный экспонат
    const earnedCoins = Math.floor((cappedMinutes / 10) * count * 2);
    return { coins: Math.max(0, earnedCoins), minutes: cappedMinutes, exhibitsCount: count };
  },

  // --- ВЕРСТАК И ИНВЕНТАРЬ ---
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

  removeArtifactFromInventory(instanceId) {
    const list = this.getInventory();
    const updated = list.filter(item => item.instanceId !== instanceId);
    localStorage.setItem(this.KEYS.INVENTORY, JSON.stringify(updated));
    return updated;
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

  // --- ЗВУК И МУЗЫКА ---
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
