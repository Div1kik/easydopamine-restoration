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
    EXPEDITION_STOCKS: 'art_expedition_stocks',
    KINTSUGI_LACQUER: 'art_kintsugi_lacquer',
    UNLOCKED_REGIONS: 'art_unlocked_regions'
  },

  // --- ДЕНЬГИ ---
  getCoins() {
    return parseInt(localStorage.getItem(this.KEYS.COINS) || '0', 10);
  },

  setCoins(val) {
    localStorage.setItem(this.KEYS.COINS, Math.max(0, Math.floor(val)).toString());
  },

  addCoins(amount) {
    const cur = this.getCoins();
    this.setCoins(cur + amount);
    return this.getCoins();
  },

  // --- ЗОЛОТОЙ ЛАК (КИНЦУГИ) ---
  getKintsugiLacquer() {
    return parseInt(localStorage.getItem(this.KEYS.KINTSUGI_LACQUER) || '2', 10);
  },

  addKintsugiLacquer(count) {
    const cur = this.getKintsugiLacquer();
    const updated = Math.max(0, cur + count);
    localStorage.setItem(this.KEYS.KINTSUGI_LACQUER, updated.toString());
    return updated;
  },

  buyKintsugiLacquer(count = 1, pricePerOne = 750) {
    const totalCost = count * pricePerOne;
    if (this.getCoins() < totalCost) return false;
    this.addCoins(-totalCost);
    this.addKintsugiLacquer(count);
    return true;
  },

  useKintsugiLacquer() {
    const cur = this.getKintsugiLacquer();
    if (cur > 0) {
      this.addKintsugiLacquer(-1);
      return true;
    }
    return false;
  },

  // =========================================================================
  // БАЛАНС ЭПОХ И ПОРОГ ВХОЖДЕНИЯ (50 УРОВНЕЙ)
  // =========================================================================
  REGION_UNLOCK_REQS: {
    egypt: { minLevel: 1, cost: 0, name: 'Древний Египет' },
    antique: { minLevel: 4, cost: 450, name: 'Античность' },
    europe: { minLevel: 9, cost: 1400, name: 'Средневековье' },
    japan: { minLevel: 16, cost: 3800, name: 'Япония' },
    aztec: { minLevel: 24, cost: 8500, name: 'Ацтеки' },
    vikings: { minLevel: 34, cost: 18000, name: 'Викинги' },
    renaissance: { minLevel: 44, cost: 38000, name: 'Ренессанс' }
  },

  getUnlockedRegions() {
    try {
      const data = JSON.parse(localStorage.getItem(this.KEYS.UNLOCKED_REGIONS));
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {}
    return ['egypt'];
  },

  isRegionUnlocked(regionId) {
    if (regionId === 'egypt') return true;
    const unlocked = this.getUnlockedRegions();
    return unlocked.includes(regionId);
  },

  canUnlockRegion(regionId) {
    const req = this.REGION_UNLOCK_REQS[regionId];
    if (!req) return false;
    const currentLevel = this.getLevelData().level;
    const coins = this.getCoins();
    return (currentLevel >= req.minLevel && coins >= req.cost && !this.isRegionUnlocked(regionId));
  },

  unlockRegion(regionId) {
    if (!this.canUnlockRegion(regionId)) return false;
    const req = this.REGION_UNLOCK_REQS[regionId];
    this.addCoins(-req.cost);
    const unlocked = this.getUnlockedRegions();
    if (!unlocked.includes(regionId)) {
      unlocked.push(regionId);
      localStorage.setItem(this.KEYS.UNLOCKED_REGIONS, JSON.stringify(unlocked));
    }
    return true;
  },

  // =========================================================================
  // 50 УРОВНЕЙ И ПРОГРЕССИЯ
  // =========================================================================
  getLevelConfig(level) {
    const titles = [
      'Ученик реставратора', 'Подмастерье древностей', 'Помощник хранителя', 'Младший реставратор', 'Музейный эксперт',
      'Мастер реликвий', 'Старший архивариус', 'Королевский реставратор', 'Магистр древностей', 'Легендарный реставратор',
      'Хранитель эпох I', 'Хранитель эпох II', 'Хранитель эпох III', 'Знаток артефактов', 'Мастер золотого шва',
      'Хранитель тайн Востока', 'Смотритель Пантеона', 'Верховный реставратор', 'Архитектор вечности', 'Грандмастер реликвий',
      'Лорд-хранитель Лувра', 'Искатель Первозданного', 'Магистр Кинцуги', 'Владыка залов времени', 'Оракул древностей',
      'Мастер древней стали', 'Алхимик реставрации', 'Хранитель саги ярлов', 'Патриарх музейного дела', 'Живая легенда музея',
      'Титан реставрации I', 'Титан реставрации II', 'Титан реставрации III', 'Мастер бессмертных ваз', 'Хранитель святилищ',
      'Имперский антиквар', 'Великий магистр древностей', 'Покоритель веков', 'Летописец цивилизаций', 'Владыка бессмертия',
      'Демиург времени I', 'Демиург времени II', 'Демиург времени III', 'Верховный демиург', 'Хранитель нитей судьбы',
      'Вечный архивариус', 'Повелитель реликвий', 'Абсолютный реставратор', 'Творец вечности', 'Бессмертный Хранитель'
    ];

    const idx = Math.max(1, Math.min(level, 50));
    const title = titles[idx - 1] || `Мастер ранга ${idx}`;

    let minXP = 0;
    if (idx === 1) minXP = 0;
    else if (idx === 2) minXP = 100;
    else if (idx === 3) minXP = 260;
    else if (idx === 4) minXP = 480;
    else if (idx === 5) minXP = 780;
    else if (idx === 6) minXP = 1180;
    else if (idx === 7) minXP = 1700;
    else if (idx === 8) minXP = 2360;
    else if (idx === 9) minXP = 3200;
    else if (idx === 10) minXP = 4250;
    else {
      minXP = 4250 + Math.round((idx - 10) * 1250 + Math.pow(idx - 10, 1.45) * 180);
    }

    return { level: idx, title, minXP };
  },

  getXP() {
    return parseInt(localStorage.getItem(this.KEYS.XP) || '0', 10);
  },

  setXP(val) {
    localStorage.setItem(this.KEYS.XP, Math.max(0, Math.floor(val)).toString());
  },

  getLevelData() {
    const currentXP = this.getXP();
    let currentLevel = 1;

    for (let lvl = 1; lvl <= 50; lvl++) {
      const cfg = this.getLevelConfig(lvl);
      if (currentXP >= cfg.minXP) {
        currentLevel = lvl;
      } else {
        break;
      }
    }

    const currentCfg = this.getLevelConfig(currentLevel);
    const isMaxLevel = (currentLevel >= 50);
    const nextCfg = isMaxLevel ? null : this.getLevelConfig(currentLevel + 1);

    const baseXP = currentCfg.minXP;
    const requiredForNext = nextCfg ? (nextCfg.minXP - baseXP) : 1000;
    const progressXP = isMaxLevel ? requiredForNext : Math.min(currentXP - baseXP, requiredForNext);
    const progressRatio = isMaxLevel ? 1.0 : Math.min(progressXP / requiredForNext, 1.0);

    return {
      level: currentLevel,
      title: currentCfg.title,
      currentXP,
      progressXP,
      requiredForNext,
      progressRatio,
      isMaxLevel
    };
  },

  addXP(amount) {
    const prevData = this.getLevelData();
    const prevLevel = prevData.level;

    const newTotal = this.getXP() + amount;
    this.setXP(newTotal);

    const newLevelData = this.getLevelData();
    const newLevel = newLevelData.level;
    const leveledUp = newLevel > prevLevel;

    if (leveledUp) {
      for (let lvl = prevLevel + 1; lvl <= newLevel; lvl++) {
        this.grantLevelReward(lvl);
      }
    }

    return {
      leveledUp,
      prevLevel,
      newLevel,
      newTitle: newLevelData.title
    };
  },

  grantLevelReward(level) {
    const bonusCoins = level * 150;
    this.addCoins(bonusCoins);

    let lacquerBonus = 0;
    if (level % 5 === 0) {
      lacquerBonus = 2;
    } else if (level % 3 === 0) {
      lacquerBonus = 1;
    }
    if (lacquerBonus > 0) {
      this.addKintsugiLacquer(lacquerBonus);
    }
  },

  getMaxMuseumCapacity() {
    const lvl = this.getLevelData().level;
    return Math.min(3 + Math.floor((lvl - 1) / 2), 24);
  },

  // --- ЭКСПЕДИЦИИ И СКЛАДЫ ---
  getAllStocks() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.EXPEDITION_STOCKS)) || {};
    } catch {
      return {};
    }
  },

  getRegionStock(regionId, templates = []) {
    const all = this.getAllStocks();
    if (all[regionId]) return all[regionId];

    const regionTemplates = templates.filter(t => t.regionId === regionId);
    const initialStock = {};
    regionTemplates.forEach(t => {
      initialStock[t.id] = regionId === 'egypt' ? 3 : 0;
    });

    all[regionId] = initialStock;
    localStorage.setItem(this.KEYS.EXPEDITION_STOCKS, JSON.stringify(all));
    return all[regionId];
  },

  addArtifactStock(regionId, templateId, count = 1) {
    const all = this.getAllStocks();
    if (!all[regionId]) all[regionId] = {};
    all[regionId][templateId] = (all[regionId][templateId] || 0) + count;
    localStorage.setItem(this.KEYS.EXPEDITION_STOCKS, JSON.stringify(all));
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

  // --- КОНТРАКТЫ ---
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
    } catch {}

    if (!templates || templates.length === 0) return null;

    // Контракты выпадают только по открытым игроком эпохам
    const unlocked = this.getUnlockedRegions();
    const pool = templates.filter(t => unlocked.includes(t.regionId));
    const target = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : templates[0];

    const clients = [
      'Мэр Александрии', 'Королевский музей', 'Частный коллекционер', 'Гильдия архивариусов', 'Императорский посол'
    ];
    const client = clients[Math.floor(Math.random() * clients.length)];

    const basePrice = target.marketValue || 100;
    const bonusReward = Math.round(basePrice * 0.4) + 60;
    const contractPrice = basePrice + bonusReward;
    const cooldownDuration = 2 * 60 * 60 * 1000;

    const newContract = {
      id: 'ctr_' + now,
      templateId: target.id,
      regionId: target.regionId,
      name: target.name,
      client,
      rewardCoins: contractPrice,
      bonusXP: 90,
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
    } catch {}
  },

  // --- ОФФЛАЙН ДОХОД ---
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

    if (count === 0) return { coins: 0, minutes: cappedMinutes, exhibitsCount: 0 };

    const earnedCoins = Math.floor((cappedMinutes / 10) * count * 2);
    return { coins: Math.max(0, earnedCoins), minutes: cappedMinutes, exhibitsCount: count };
  },

  // --- ИНВЕНТАРЬ И СЕССИЯ ---
  getWorkshopTier() {
    return parseInt(localStorage.getItem(this.KEYS.WORKSHOP_TIER) || '1', 10);
  },

  setWorkshopTier(tier) {
    localStorage.setItem(this.KEYS.WORKSHOP_TIER, tier.toString());
  },

  getInventory() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.INVENTORY)) || [];
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
      return JSON.parse(localStorage.getItem(this.KEYS.HISTORY)) || [];
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
