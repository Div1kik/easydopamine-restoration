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
    CLAIMED_LEVEL_REWARDS: 'art_claimed_level_rewards',
    ACTIVE_CONTRACT: 'art_active_contract',
    EXPEDITION_STOCKS: 'art_expedition_stocks'
  },

  // --- ДЕНЬГИ (БЕЗ ОГРАНИЧЕНИЙ НА ВЕРХНИЙ ПРЕДЕЛ) ---
  getCoins() {
    return parseInt(localStorage.getItem(this.KEYS.COINS) || '0', 10);
  },

  setCoins(val) {
    // Только защита от отрицательного значения, верхнего потолка нет
    localStorage.setItem(this.KEYS.COINS, Math.max(0, Math.floor(val)).toString());
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

  getMaxMuseumCapacity() {
    const lvl = this.getLevelData().level;
    return Math.min(3 + Math.floor((lvl - 1) / 2), 24);
  },

  // --- ЭКСПЕДИЦИИ И ЗАПАСЫ НАХОДОК ---
  getAllStocks() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.EXPEDITION_STOCKS) || '{}');
    } catch {
      return {};
    }
  },

  getRegionStock(regionId, templates = []) {
    const all = this.getAllStocks();
    if (!all[regionId]) {
      const regionTemplates = templates.filter(t => t.regionId === regionId);
      const initialStock = {};
      regionTemplates.forEach(t => {
        initialStock[t.id] = regionId === 'egypt' ? 3 : 0;
      });
      all[regionId] = initialStock;
      localStorage.setItem(this.KEYS.EXPEDITION_STOCKS, JSON.stringify(all));
    }
    return all[regionId];
  },

  decrementArtifactStock(regionId, templateId) {
    const all = this.getAllStocks();
    if (all[regionId] && all[regionId][templateId] > 0) {
      all[regionId][templateId]--;
      localStorage.setItem(this.KEYS.EXPEDITION_STOCKS, JSON.stringify(all));
    }
  },

  fundExpedition(regionId, cost, templates = []) {
    const coins = this.getCoins();
    if (coins < cost) return false;

    this.addCoins(-cost);
    const all = this.getAllStocks();
    const regionTemplates = templates.filter(t => t.regionId === regionId);

    if (!all[regionId]) all[regionId] = {};

    regionTemplates.forEach(t => {
      const added = Math.floor(Math.random() * 3) + 1;
      all[regionId][t.id] = (all[regionId][t.id] || 0) + added;
    });

    localStorage.setItem(this.KEYS.EXPEDITION_STOCKS, JSON.stringify(all));
    return true;
  },

  // --- СРОЧНЫЕ КОНТРАКТЫ ---
  getDailyContract(templates) {
    const now = Date.now();
    try {
      const raw = localStorage.getItem(this.KEYS.ACTIVE_CONTRACT);
      if (raw) {
        const contract = JSON.parse(raw);
        if (contract && contract.nextAvailableAt > now) {
          return contract;
        }
      }
    } catch {
      // ignore
    }

    if (!templates || templates.length === 0) return null;

    const level = this.getLevelData().level;
    const allowedRegions = ['egypt'];
    if (level >= 2) allowedRegions.push('antique');
    if (level >= 4) allowedRegions.push('europe');
    if (level >= 6) allowedRegions.push('japan');
    if (level >= 8) allowedRegions.push('aztec');
    if (level >= 10) allowedRegions.push('vikings');
    if (level >= 12) allowedRegions.push('renaissance');

    const pool = templates.filter(t => allowedRegions.includes(t.regionId));
    const target = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : templates[0];

    const clients = [
      'Мэр Александрии',
      'Королевский музей',
      'Частный коллекционер',
      'Гильдия архивариусов',
      'Императорский посол'
    ];
    const client = clients[Math.floor(Math.random() * clients.length)];

    const basePrice = target.marketValue || 100;
    const bonusReward = 90;
    const contractPrice = basePrice + bonusReward;

    const cooldownDuration = 2 * 60 * 60 * 1000;

    const newContract = {
      id: `ctr_${now}`,
      templateId: target.id,
      regionId: target.regionId,
      name: target.name,
      client,
      rewardCoins: contractPrice,
      bonusCoins: bonusReward,
      bonusXP: 80,
      completed: false,
      createdAt: now,
      nextAvailableAt: now + cooldownDuration
    };

    localStorage.setItem(this.KEYS.ACTIVE_CONTRACT, JSON.stringify(newContract));
    return newContract;
  },

  completeDailyContract() {
    try {
      const raw = localStorage.getItem(this.KEYS.ACTIVE_CONTRACT);
      if (raw) {
        const contract = JSON.parse(raw);
        contract.completed = true;
        contract.nextAvailableAt = Date.now() + 2 * 60 * 60 * 1000;
        localStorage.setItem(this.KEYS.ACTIVE_CONTRACT, JSON.stringify(contract));
      }
    } catch {
      // no-op
    }
  },

  // --- ОФФЛАЙН-ДОХОД МУЗЕЯ ---
  updateOfflineTimestamp() {
    localStorage.setItem(this.KEYS.LAST_OFFLINE_TIME, Date.now().toString());
  },

  getOfflineEarnings() {
    const lastTime = parseInt(localStorage.getItem(this.KEYS.LAST_OFFLINE_TIME) || '0', 10);
    const now = Date.now();
    this.updateOfflineTimestamp();

    if (!lastTime || lastTime > now) return { coins: 0, minutes: 0 };

    const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));
    if (diffMinutes < 5) return { coins: 0, minutes: diffMinutes };

    const cappedMinutes = Math.min(diffMinutes, 480);
    const inventory = this.getInventory();
    const validExhibits = inventory.filter(item => (item.stars === undefined || item.stars >= 2));
    const count = validExhibits.length;

    if (count === 0) return { coins: 0, minutes: cappedMinutes };

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
    if (list.length > 30) list.pop();
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

  // --- ЗВУК ---
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
