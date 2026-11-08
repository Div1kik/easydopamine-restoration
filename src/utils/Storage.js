// Проверка открытия регионов по рангу XP и достижениям
  static isRegionUnlocked(regionId) {
    if (regionId === 'egypt') return true;

    const lvl = this.getMasterLevel();
    const history = this.getRecentHistory ? this.getRecentHistory() : [];
    const inventory = this.getInventory ? this.getInventory() : [];
    const sold = this.get('sold_artifacts', []);

    // Проверяем, был ли отреставрирован хоть один предмет из указанного региона
    const hasRestoredFromRegion = (regId) => {
      const inInv = inventory.some(item => item.regionId === regId);
      const inHistory = history.some(id => id.startsWith(regId));
      const inSold = sold.some(s => s.id && s.id.startsWith(regId));
      return inInv || inHistory || inSold;
    };

    if (regionId === 'greece') {
      return lvl >= 2;
    }
    if (regionId === 'europe') {
      return lvl >= 2 && hasRestoredFromRegion('greece');
    }
    if (regionId === 'japan') {
      return lvl >= 3;
    }
    if (regionId === 'mesoamerica') {
      return lvl >= 3 && hasRestoredFromRegion('japan');
    }
    if (regionId === 'viking') {
      return lvl >= 4;
    }
    if (regionId === 'china') {
      return lvl >= 5;
    }

    return false;
  }

  // Описание условия для заблокированного региона
  static getRegionLockReason(regionId) {
    switch (regionId) {
      case 'greece':
        return 'Требуется Ранг Мастера II (350 XP)';
      case 'europe':
        return 'Отреставрируйте реликвию Греции';
      case 'japan':
        return 'Требуется Ранг Мастера III (900 XP)';
      case 'mesoamerica':
        return 'Отреставрируйте реликвию Японии';
      case 'viking':
        return 'Требуется Ранг Мастера IV (1800 XP)';
      case 'china':
        return 'Требуется Ранг Мастера V (3200 XP)';
      default:
        return 'Регион заблокирован';
    }
  }
