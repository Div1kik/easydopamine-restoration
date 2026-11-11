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
    KINTSUGI_LACQUER: 'art_kintsugi_lacquer'
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

  useKintsugiLacquer() {
    const cur = this.getKintsugiLacquer();
    if (cur > 0) {
      this.addKintsugiLacquer(-1);
      return true;
    }
    return false;
  },

  // =========================================================================
  // 50 УРОВНЕЙ И ПРОГРЕССИЯ
  // =========================================================================
  getLevelConfig(level) {
    const titles = [
      'Ученик реставратора',      // 1
      'Подмастерье древностей',    // 2
      'Помощник хранителя',       // 3
      'Младший реставратор',      // 4
      'Музейный эксперт',         // 5
      'Мастер реликвий',          // 6
      'Старший архивариус',       // 7
      'Королевский реставратор',  // 8
      'Магистр древностей',       // 9
      'Легендарный реставратор',  // 10
      'Хранитель эпох I',         // 11
      'Хранитель эпох II',        // 12
      'Хранитель эпох III',       // 13
      'Знаток артефактов',        // 14
      'Мастер золотого шва',      // 15
      'Хранитель тайн Востока',   // 16
      'Смотритель Пантеона',      // 17
      'Верховный реставратор',    // 18
      'Архитектор вечности',      // 19
      'Грандмастер реликвий',     // 20
      'Лорд-хранитель Лувра',     // 21
      'Искатель Первозданного',   // 22
      'Магистр Кинцуги',          // 23
      'Владыка залов времени',    // 24
      'Оракул древностей',        // 25
      'Мастер древней стали',     // 26
      'Алхимик реставрации',      // 27
      'Хранитель саги ярлов',     // 28
      'Патриарх музейного дела',  // 29
      'Живая легенда музея',      // 30
      'Титан реставрации I',      // 31
      'Титан реставрации II',     // 32
      'Титан реставрации III',    // 33
      'Мастер бессмертных ваз',   // 34
      'Хранитель святилищ',       // 35
      'Имперский антиквар',       // 36
      'Великий магистр древностей',// 37
      'Покоритель веков',         // 38
      'Летописец цивилизаций',    // 39
      'Владыка бессмертия',       // 40
      'Демиург времени I',        // 41
      'Демиург времени II',       // 42
      'Демиург времени III',      // 43
      'Верховный демиург',        // 44
      'Хранитель нитей судьбы',   // 45
      'Вечный архивариус',        // 46
      'Повелитель реликвий',      // 47
      'Абсолютный реставратор',   // 48
      'Творец вечности',          // 49
      'Бессмертный Хранитель'     // 50
    ];

    const idx = Math.max(1, Math.min(level, 50));
    const title = titles[idx - 1] || `Мастер ранга ${idx}`;

    // Формула опыта: плавный прогрессивный рост от 0 до 50 уровня
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
      // Для уровней 11-50: квадратичный шаг с шагом ~1200..2500 XP
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

    // Автоматическая выдача наград при повышении уровня
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
    // Базовая награда: 100 монет * уровень
    const bonusCoins = level * 120;
    this.addCoins(bonusCoins);

    // Каждые 3 уровня даем 1 Золотой лак Кинцуги, а на круглых (5, 10, 15...) — 2 шт.
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

    const currentLvl = this.getLevelData().level;
    const allowedRegions = ['egypt'];
    if (currentLvl >= 2) allowedRegions.push('antique');
    if (currentLvl >= 4) allowedRegions.push('europe');
    if (currentLvl >= 6) allowedRegions.push('japan');
    if (currentLvl >= 8) allowedRegions.push('aztec');
    if (currentLvl >= 10) allowedRegions.push('vikings');
    if (currentLvl >= 12) allowedRegions.push('renaissance');

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
      id: 'ctr_' + now,
      templateId: target.id,
      regionId: target.regionId,
      name: target.name,
      client,
      rewardCoins: contractPrice,
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
