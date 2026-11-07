import { YandexSDK } from './YandexSDK.js';

export class Storage {
  static get(key, defaultValue) {
    try {
      const item = localStorage.getItem(`edg_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(`edg_${key}`, JSON.stringify(value));
      this.syncToYandexCloud();
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  }

  static async syncToYandexCloud() {
    if (YandexSDK.player) {
      try {
        const payload = {
          coins: this.getCoins(),
          xp: this.getXP(),
          workshop_tier: this.getWorkshopTier(),
          level_index: this.getCurrentLevelIndex(),
          unlocked_artifacts: this.getUnlockedArtifacts(),
          sold_artifacts: this.getSoldArtifacts(),
          owned_tools: this.getOwnedTools(),
          equipped_tools: this.getEquippedTools(),
          stars: this.getStarsData()
        };
        await YandexSDK.player.setData(payload, true);
      } catch (err) {
        console.warn("Yandex Cloud save failed", err);
      }
    }
  }

  static async loadFromYandexCloud() {
    if (YandexSDK.player) {
      try {
        const data = await YandexSDK.player.getData();
        if (data && typeof data === 'object') {
          if (data.coins !== undefined) this.setLocal('coins', data.coins);
          if (data.xp !== undefined) this.setLocal('xp', data.xp);
          if (data.workshop_tier !== undefined) this.setLocal('workshop_tier', data.workshop_tier);
          if (data.level_index !== undefined) this.setLocal('level_index', data.level_index);
          if (data.unlocked_artifacts) this.setLocal('unlocked_artifacts', data.unlocked_artifacts);
          if (data.sold_artifacts) this.setLocal('sold_artifacts', data.sold_artifacts);
          if (data.owned_tools) this.setLocal('owned_tools', data.owned_tools);
          if (data.equipped_tools) this.setLocal('equipped_tools', data.equipped_tools);
          if (data.stars) this.setLocal('stars', data.stars);
        }
      } catch (err) {
        console.warn("Yandex Cloud load failed", err);
      }
    }
  }

  static setLocal(key, value) {
    try {
      localStorage.setItem(`edg_${key}`, JSON.stringify(value));
    } catch {}
  }

  // 1. ЗОЛОТО
  static getCoins() {
    return this.get('coins', 100); // 100 монет на старте
  }

  static addCoins(amount) {
    const current = this.getCoins();
    const updated = current + amount;
    this.set('coins', updated);
    return updated;
  }

  static spendCoins(amount) {
    const current = this.getCoins();
    if (current >= amount) {
      this.set('coins', current - amount);
      return true;
    }
    return false;
  }

  // 2. ОПЫТ (XP) И УРОВЕНЬ МАСТЕРА
  static getXP() {
    return this.get('xp', 0);
  }

  static addXP(amount) {
    const current = this.getXP();
    const updated = current + amount;
    this.set('xp', updated);
    return updated;
  }

  static getMasterLevel() {
    const xp = this.getXP();
    // 0 XP = 1 ур, 300 XP = 2 ур, 800 XP = 3 ур, 1500 XP = 4 ур, 2500 XP = 5 ур...
    if (xp < 300) return 1;
    if (xp < 800) return 2;
    if (xp < 1600) return 3;
    if (xp < 2700) return 4;
    return 5;
  }

  static getXPProgress() {
    const xp = this.getXP();
    const lvl = this.getMasterLevel();
    const thresholds = [0, 300, 800, 1600, 2700, 5000];
    const currentBase = thresholds[lvl - 1];
    const nextBase = thresholds[lvl] || 5000;
    const progress = (xp - currentBase) / (nextBase - currentBase);
    return Math.min(Math.max(progress, 0), 1);
  }

  // 3. АПГРЕЙДЫ МАСТЕРСКОЙ (1..4)
  static getWorkshopTier() {
    return this.get('workshop_tier', 1);
  }

  static upgradeWorkshopTier() {
    const current = this.getWorkshopTier();
    if (current < 4) {
      this.set('workshop_tier', current + 1);
      return true;
    }
    return false;
  }

  // 4. ИНСТРУМЕНТЫ ПО ТИПАМ
  static getOwnedTools() {
    return this.get('owned_tools', ['scraper_1', 'solvent_1', 'glue_1', 'brush_1', 'polish_1']);
  }

  static unlockTool(toolId) {
    const owned = this.getOwnedTools();
    if (!owned.includes(toolId)) {
      owned.push(toolId);
      this.set('owned_tools', owned);
    }
  }

  static getEquippedTools() {
    return this.get('equipped_tools', {
      tool_scraper: 'scraper_1',
      tool_solvent: 'solvent_1',
      tool_glue: 'glue_1',
      tool_brush: 'brush_1',
      tool_polish: 'polish_1'
    });
  }

  static equipTool(type, toolId) {
    const equipped = this.getEquippedTools();
    equipped[type] = toolId;
    this.set('equipped_tools', equipped);
  }

  // 5. ВИТРИНА И ПРОДАЖА
  static unlockArtifact(id) {
    const unlocked = this.get('unlocked_artifacts', []);
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      this.set('unlocked_artifacts', unlocked);
    }
  }

  static getUnlockedArtifacts() {
    return this.get('unlocked_artifacts', []);
  }

  static sellArtifactReplica(id, price) {
    this.addCoins(price);
    const sold = this.get('sold_artifacts', []);
    sold.push({ id, date: Date.now() });
    this.set('sold_artifacts', sold);
  }

  static getSoldArtifacts() {
    return this.get('sold_artifacts', []);
  }

  // 6. НАВИГАЦИЯ И УРОВНИ
  static getCurrentLevelIndex() {
    return this.get('level_index', 0);
  }

  static isEraUnlocked(eraId) {
    if (eraId === 'egypt') return true;
    const unlocked = this.getUnlockedArtifacts();
    if (eraId === 'greece') return unlocked.includes('egypt_scarab');
    if (eraId === 'europe') return unlocked.includes('greece_amphora');
    if (eraId === 'japan') return unlocked.includes('europe_shield');
    return false;
  }

  static getStarsData() {
    return this.get('stars', {});
  }

  static setStars(artifactId, stars) {
    const data = this.getStarsData();
    if (!data[artifactId] || data[artifactId] < stars) {
      data[artifactId] = stars;
      this.set('stars', data);
    }
  }

  static isMuted() {
    return this.get('sound_muted', false);
  }

  static toggleMute() {
    const state = !this.isMuted();
    this.set('sound_muted', state);
    return state;
  }
}
