export const Storage = {
  KEYS: {
    COINS: 'art_coins',
    XP: 'art_xp',
    WORKSHOP_TIER: 'art_workshop_tier',
    ACTIVE_WORKBENCH_SKIN: 'active_workbench_skin',
    OWNED_WORKBENCH_SKINS: 'owned_workbench_skins',
    ACTIVE_TOOL_SKIN: 'art_active_tool_skin',
    OWNED_TOOL_SKINS: 'art_owned_tool_skins',
    TOOL_BOX_PITY: 'art_tool_box_pity',
    AD_CHEST_LAST_TIME: 'art_ad_chest_last_time',
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
    return parseInt(localStorage.getItem(this.KEYS.COINS) || '120', 10);
  },

  setCoins(val) {
    localStorage.setItem(this.KEYS.COINS, Math.max(0, Math.floor(val)).toString());
  },

  addCoins(amount) {
    const cur = this.getCoins();
    this.setCoins(cur + amount);
    return this.getCoins();
  },

  // --- СКИНЫ ВЕРСТАКА (15 ТЕМ) ---
  getActiveWorkbenchSkin() {
    const saved = localStorage.getItem(this.KEYS.ACTIVE_WORKBENCH_SKIN);
    if (saved) return saved;
    return `workbench_bg_${this.getWorkshopTier()}`;
  },

  setActiveWorkbenchSkin(skinId) {
    if (skinId) {
      localStorage.setItem(this.KEYS.ACTIVE_WORKBENCH_SKIN, skinId);
    }
  },

  getOwnedWorkbenchSkins() {
    try {
      const list = JSON.parse(localStorage.getItem(this.KEYS.OWNED_WORKBENCH_SKINS));
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return ['workbench_bg_1'];
  },

  unlockWorkbenchSkin(skinId) {
    const list = this.getOwnedWorkbenchSkins();
    if (!list.includes(skinId)) {
      list.push(skinId);
      localStorage.setItem(this.KEYS.OWNED_WORKBENCH_SKINS, JSON.stringify(list));
    }
    return list;
  },

  // --- КАСТОМНЫЕ СКИНЫ ИНСТРУМЕНТОВ ---
  getActiveToolSkin() {
    return localStorage.getItem(this.KEYS.ACTIVE_TOOL_SKIN) || 'default';
  },

  setActiveToolSkin(skinId) {
    localStorage.setItem(this.KEYS.ACTIVE_TOOL_SKIN, skinId || 'default');
  },

  getOwnedToolSkins() {
    try {
      const list = JSON.parse(localStorage.getItem(this.KEYS.OWNED_TOOL_SKINS));
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return ['default'];
  },

  unlockToolSkin(skinId) {
    const list = this.getOwnedToolSkins();
    if (!list.includes(skinId)) {
      list.push(skinId);
      localStorage.setItem(this.KEYS.OWNED_TOOL_SKINS, JSON.stringify(list));
    }
    return list;
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

  buyKintsugiLacquer(count = 1, pricePerOne = 550) {
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

  // --- БАЛАНС ЭПОХ (РЕНЕССАНС НА 25 УРОВНЕ) ---
  REGION_UNLOCK_REQS: {
    egypt: { minLevel: 1, cost: 0, expeditionCost: 90, name: 'Древний Египет' },
    antique: { minLevel: 3, cost: 250, expeditionCost: 220, name: 'Античность' },
    europe: { minLevel: 6, cost: 750, expeditionCost: 480, name: 'Средневековье' },
    japan: { minLevel: 10, cost: 1800, expeditionCost: 950, name: 'Япония' },
    aztec: { minLevel: 15, cost: 4200, expeditionCost: 1750, name: 'Ацтеки' },
    vikings: { minLevel: 20, cost: 9000, expeditionCost: 2800, name: 'Викинги' },
    renaissance: { minLevel: 25, cost: 18000, expeditionCost: 4500, name: 'Ренессанс' }
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
    const req = this.REGION_UNLOCK_REQS[regionId];
    if (req && this.getLevelData().level >= req.minLevel && req.cost === 0) return true;
    return this.getUnlockedRegions().includes(regionId);
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

  // --- ДИНАМИЧЕСКАЯ ШКАЛА ОПЫТА (50 УРОВНЕЙ) ---
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
    else if (idx <= 10) {
      const baseSteps = [0, 60, 140, 240, 360, 510, 700, 930, 1200, 1520];
      minXP = baseSteps[idx - 1];
    } else if (idx <= 25) {
      minXP = 1520 + Math.round((idx - 10) * 420 + Math.pow(idx - 10, 1.25) * 50);
    } else {
      minXP = 11800 + Math.round((idx - 25) * 1100 + Math.pow(idx - 25, 1.4) * 120);
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

  getLevelRewardDetails(level) {
    const bonusCoins = level * 150 + 100;
    let lacquerBonus = 0;
    if (level % 5 === 0) lacquerBonus = 2;
    else if (level % 2 === 0) lacquerBonus = 1;
    return { bonusCoins, lacquerBonus };
  },

  addXP(amount) {
    const prevData = this.getLevelData();
    const prevLevel = prevData.level;

    const newTotal = this.getXP() + amount;
    this.setXP(newTotal);

    const newLevelData = this.getLevelData();
    const newLevel = newLevelData.level;
    const leveledUp = newLevel > prevLevel;

    let totalBonusCoins = 0;
    let totalLacquerBonus = 0;

    if (leveledUp) {
      for (let lvl = prevLevel + 1; lvl <= newLevel; lvl++) {
        const rew = this.grantLevelReward(lvl);
        totalBonusCoins += rew.bonusCoins;
        totalLacquerBonus += rew.lacquerBonus;
      }
    }

    return {
      leveledUp,
      prevLevel,
      newLevel,
      newTitle: newLevelData.title,
      bonusCoins: totalBonusCoins,
      lacquerBonus: totalLacquerBonus
    };
  },

  grantLevelReward(level) {
    const rew = this.getLevelRewardDetails(level);
    this.addCoins(rew.bonusCoins);
    if (rew.lacquerBonus > 0) {
      this.addKintsugiLacquer(rew.lacquerBonus);
    }
    return rew;
  },

  getMaxMuseumCapacity() {
    const lvl = this.getLevelData().level;
    return Math.min(4 + Math.floor((lvl - 1) / 2), 26);
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
      initialStock[t.id] = regionId === 'egypt' ? 3 : 1;
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

    if (cost > 0) {
      this.addCoins(-cost);
    }
    const all = this.getAllStocks();
    const regionTemplates = templates.filter(t => t.regionId === regionId);

    if (!all[regionId]) all[regionId] = {};

    regionTemplates.forEach(t => {
      const added = Math.floor(Math.random() * 2) + 1;
      all[regionId][t.id] = (all[regionId][t.id] || 0) + added;
    });

    localStorage.setItem(this.KEYS.EXPEDITION_STOCKS, JSON.stringify(all));
    return true;
  },

  // --- КОНТРАКТЫ ---
  getDailyContract(templates, forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh) {
      try {
        const raw = localStorage.getItem(this.KEYS.ACTIVE_CONTRACT);
        if (raw) {
          const contract = JSON.parse(raw);
          if (contract && contract.nextAvailableAt > now) {
            return contract;
          }
        }
      } catch {}
    }

    if (!templates || templates.length === 0) return null;

    const unlocked = this.getUnlockedRegions();
    const pool = templates.filter(t => unlocked.includes(t.regionId));
    const target = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : templates[0];

    const clients = [
      'Мэр Александрии', 'Королевский музей', 'Частный коллекционер', 'Гильдия архивариусов', 'Императорский посол'
    ];
    const client = clients[Math.floor(Math.random() * clients.length)];

    const basePrice = target.marketValue || 100;
    const bonusReward = Math.round(basePrice * 0.50) + 90;
    const contractPrice = basePrice + bonusReward;
    const cooldownDuration = 90 * 60 * 1000;

    const newContract = {
      id: 'ctr_' + now,
      templateId: target.id,
      regionId: target.regionId,
      title: target.name,
      name: target.name,
      client,
      rewardCoins: contractPrice,
      bonusXP: 110,
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
        contract.nextAvailableAt = Date.now() + 90 * 60 * 1000;
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

    let mult = 1.0;
    if (localStorage.getItem('museum_upg_pedestal_1') === 'true') mult += 0.15;
    if (localStorage.getItem('museum_upg_pedestal_2') === 'true') mult += 0.25;
    if (localStorage.getItem('museum_upg_hall_royal') === 'true') mult += 0.50;

    const earnedCoins = Math.floor((cappedMinutes / 10) * count * 2.5 * mult);
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

  getRestoreHistory() {
    return this.getRecentHistory();
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

  setActiveSession(sessionOrRegion, templateId) {
    if (!sessionOrRegion) {
      localStorage.removeItem(this.KEYS.SESSION);
    } else if (typeof sessionOrRegion === 'string') {
      localStorage.setItem(this.KEYS.SESSION, JSON.stringify({ regionId: sessionOrRegion, templateId }));
    } else {
      localStorage.setItem(this.KEYS.SESSION, JSON.stringify(sessionOrRegion));
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
