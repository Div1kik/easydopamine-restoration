import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { ARTIFACT_TEMPLATES } from '../data/artifacts.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Фоновая подложка
    this.add.rectangle(width / 2, height / 2, width, height, 0x07090e);

    // Студия
    this.add.text(width / 2, height * 0.065, 'EASY DOPAMINE GAMES', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#c5a059',
      fontStyle: 'bold',
      letterSpacing: 2,
      resolution: dpr
    }).setOrigin(0.5);

    const divider = this.add.graphics();
    divider.lineStyle(1, 0xc5a059, 0.4);
    divider.lineBetween(width / 2 - 50, height * 0.08, width / 2 + 50, height * 0.08);

    // Заголовок
    this.add.text(width / 2, height * 0.115, 'АРТЕФАКТЫ ВРЕМЕНИ', {
      fontSize: '24px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 2,
      resolution: dpr
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.15, 'Мастерская реставратора', {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#94a3b8',
      letterSpacing: 1,
      resolution: dpr
    }).setOrigin(0.5);

    // Парящий логотип артефакта
    const logoKey = this.textures.exists('art_egypt_scarab') ? 'art_egypt_scarab' : null;
    if (logoKey) {
      const logo = this.add.image(width / 2, height * 0.265, logoKey)
        .setDisplaySize(120, 150)
        .setDepth(5);

      this.tweens.add({
        targets: logo,
        y: height * 0.245,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Плашка ранга (клик открывает табель 50 уровней)
    this.renderRankWidget(width, height * 0.405, dpr);

    // Кнопки переключения звука
    this.createAudioToggles(width);

    // Фабрика кнопок меню
    const createBtn = (y, text, colorBg, colorStroke, textColor, onClick) => {
      const btnW = width * 0.82;
      const btnH = 48;

      const btn = this.add.rectangle(width / 2, y, btnW, btnH, colorBg, 0.95)
        .setStrokeStyle(1.5, colorStroke, 0.9)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(width / 2, y, text, {
        fontSize: '14.5px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: textColor,
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        if (AudioManager.playClick) AudioManager.playClick();
        this.tweens.add({
          targets: [btn, label],
          scale: 0.96,
          duration: 70,
          yoyo: true,
          ease: 'Quad.easeInOut',
          onComplete: () => onClick()
        });
      });

      return btn;
    };

    const startY = height * 0.51;

    // 1. «НА ВЕРСТАК» — честный рандом строго из имеющихся в наличии артефактов
    createBtn(startY, '🔨 НА ВЕРСТАК', 0x164e63, 0x06b6d4, '#ffffff', () => {
      this.startQuickRestore();
    });

    // 2. «ЭКСПЕДИЦИИ» — привычный выбор эпох
    createBtn(startY + 56, '🗺️ ЭКСПЕДИЦИИ', 0x1c1917, 0xd97706, '#facc15', () => {
      this.scene.start('EraSelectScene');
    });

    // 3. «ЛАВКА МАСТЕРА»
    createBtn(startY + 112, '🛒 ЛАВКА МАСТЕРА', 0x1e1b4b, 0x6366f1, '#ffffff', () => {
      this.scene.start('ShopScene');
    });

    // 4. «ЗАЛ СЛАВЫ (МУЗЕЙ)»
    createBtn(startY + 168, '🏛️ ЗАЛ СЛАВЫ (МУЗЕЙ)', 0x14532d, 0x22c55e, '#ffffff', () => {
      this.scene.start('MuseumScene');
    });

    // Инвентарь лака
    const lacquer = Storage.getKintsugiLacquer ? Storage.getKintsugiLacquer() : 0;
    this.add.text(width / 2, height * 0.81, `✨ Золотой лак Кинцуги: ${lacquer}`, {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    // Фоновая музыка
    if (AudioManager.playEraMusic) AudioManager.playEraMusic('menu');

    // Оффлайн доход
    this.checkOfflineEarnings(width, height, dpr);

    // Срочный заказ
    this.renderContractWidget(width, height * 0.89, dpr);
  }

  // =========================================================================
  // БЫСТРЫЙ ВХОД НА ВЕРСТАК: СТРОГО ИЗ НАЛИЧИЯ НА СКЛАДЕ
  // =========================================================================
  startQuickRestore() {
    // 1. Проверяем незавершённую сессию (только если она реально существует и валидна)
    const saved = Storage.getActiveSession ? Storage.getActiveSession() : null;
    if (saved && saved.templateId && saved.regionId && !saved.completed) {
      this.scene.start('RestoreScene', { regionId: saved.regionId, templateId: saved.templateId });
      return;
    }

    // 2. Сканируем все открытые регионы и собираем только те артефакты, которые РЕАЛЬНО ЕСТЬ В НАЛИЧИИ (> 0)
    const unlocked = Storage.getUnlockedRegions ? Storage.getUnlockedRegions() : ['egypt'];
    const allStocks = Storage.getAllStocks ? Storage.getAllStocks() : {};
    const availablePool = [];

    unlocked.forEach(regId => {
      const regStock = allStocks[regId] || {};
      Object.entries(regStock).forEach(([templateId, count]) => {
        if (count > 0) {
          availablePool.push({ regionId: regId, templateId });
        }
      });
    });

    // 3. Если артефакты есть в наличии — выбираем абсолютно случайный
    if (availablePool.length > 0) {
      const chosen = availablePool[Math.floor(Math.random() * availablePool.length)];
      Storage.decrementArtifactStock(chosen.regionId, chosen.templateId);
      this.scene.start('RestoreScene', { regionId: chosen.regionId, templateId: chosen.templateId });
    } else {
      // 4. Если на складе 0 артефактов — переходим в выбор эпох
      this.scene.start('EraSelectScene');
    }
  }

  // =========================================================================
  // ПЛАШКА РАНГА И ОКНО 50 РАНГОВ
  // =========================================================================
  renderRankWidget(width, y, dpr) {
    const lvlData = Storage.getLevelData ? Storage.getLevelData() : { level: 1, title: 'Ученик', progressRatio: 0 };
    const boxW = width * 0.84;
    const boxH = 46;

    const rankCont = this.add.container(width / 2, y).setDepth(10);

    const bg = this.add.rectangle(0, 0, boxW, boxH, 0x0f172a, 0.95)
      .setStrokeStyle(1.5, 0xca8a04, 0.8)
      .setInteractive({ useHandCursor: true });

    const lvlBadge = this.add.text(-boxW / 2 + 14, -8, `УР. ${lvlData.level}`, {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0, 0.5);

    const rankTitle = this.add.text(-boxW / 2 + 75, -8, lvlData.title, {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e2e8f0',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0, 0.5);

    const tapHint = this.add.text(boxW / 2 - 12, -8, 'Табель ❯', {
      fontSize: '10.5px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#38bdf8',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(1, 0.5);

    const barW = boxW - 28;
    const barH = 7;
    const barY = 12;

    const barBg = this.add.rectangle(0, barY, barW, barH, 0x1e293b).setOrigin(0.5);
    const barFillW = barW * Phaser.Math.Clamp(lvlData.progressRatio, 0, 1);
    const barFill = this.add.rectangle(-barW / 2, barY, barFillW, barH, 0x10b981).setOrigin(0, 0.5);

    rankCont.add([bg, lvlBadge, rankTitle, tapHint, barBg, barFill]);

    bg.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.openLevelProgressModal(width, this.scale.height, dpr);
    });
  }

  openLevelProgressModal(width, height, dpr) {
    const curLevel = Storage.getLevelData ? Storage.getLevelData().level : 1;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85)
      .setDepth(40)
      .setInteractive();

    const modalCont = this.add.container(width / 2, height / 2).setDepth(41);
    const modalW = width * 0.92;
    const modalH = height * 0.78;

    const bg = this.add.rectangle(0, 0, modalW, modalH, 0x0b0f17, 0.98)
      .setStrokeStyle(1.5, 0xd4af37, 0.9);

    const title = this.add.text(0, -modalH / 2 + 24, '🏆 ТАБЕЛЬ РАНГОВ И НАГРАД', {
      fontSize: '16px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -modalH / 2 + 44, `Текущий ранг: Уровень ${curLevel} из 50`, {
      fontSize: '11.5px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#94a3b8',
      resolution: dpr
    }).setOrigin(0.5);

    const listCont = this.add.container(0, 0);

    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(width / 2 - modalW / 2 + 8, height / 2 - modalH / 2 + 62, modalW - 16, modalH - 124);
    listCont.setMask(new Phaser.Display.Masks.GeometryMask(this, maskGfx));

    const itemH = 50;
    const startListY = -modalH / 2 + 88;

    const epochUnlocks = {
      1: '🇪🇬 Египет',
      3: '🏛️ Античность',
      6: '⚔️ Средневековье',
      10: '⛩️ Япония',
      15: '🦅 Ацтеки',
      20: '🛡️ Викинги',
      25: '🎨 Ренессанс'
    };

    for (let lvl = 1; lvl <= 50; lvl++) {
      const cfg = Storage.getLevelConfig ? Storage.getLevelConfig(lvl) : { title: `Ранг ${lvl}` };
      const itemY = startListY + (lvl - 1) * itemH;
      const isCurrent = (lvl === curLevel);
      const isPassed = (lvl < curLevel);

      const rowCont = this.add.container(0, itemY);
      const rowBgColor = isCurrent ? 0x1e293b : (isPassed ? 0x0f172a : 0x090d14);
      const strokeColor = isCurrent ? 0xfacc15 : (isPassed ? 0x10b981 : 0x1e293b);

      const rowBg = this.add.rectangle(0, 0, modalW - 28, itemH - 6, rowBgColor, 0.95)
        .setStrokeStyle(isCurrent ? 2 : 1, strokeColor, 0.85);

      const numTxt = this.add.text(-modalW / 2 + 24, 0, `${lvl}`, {
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: isCurrent ? '#facc15' : (isPassed ? '#10b981' : '#64748b'),
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      const titleTxt = this.add.text(-modalW / 2 + 44, -7, cfg.title, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: isCurrent ? '#ffffff' : (isPassed ? '#cbd5e1' : '#64748b'),
        fontStyle: isCurrent ? 'bold' : 'normal',
        resolution: dpr
      }).setOrigin(0, 0.5);

      const rewardCoins = lvl * 160 + 100;
      let rewardStr = `+${rewardCoins} 🪙`;
      if (lvl % 5 === 0) rewardStr += '  +2 ✨';
      else if (lvl % 2 === 0) rewardStr += '  +1 ✨';

      const rewardTxt = this.add.text(-modalW / 2 + 44, 9, rewardStr, {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ca8a04',
        resolution: dpr
      }).setOrigin(0, 0.5);

      if (epochUnlocks[lvl]) {
        const epochTxt = this.add.text(modalW / 2 - 28, 0, epochUnlocks[lvl], {
          fontSize: '9.5px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#38bdf8',
          fontStyle: 'bold',
          resolution: dpr
        }).setOrigin(1, 0.5);
        rowCont.add(epochTxt);
      } else if (isPassed) {
        const checkTxt = this.add.text(modalW / 2 - 28, 0, '✓', {
          fontSize: '12px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#10b981',
          resolution: dpr
        }).setOrigin(1, 0.5);
        rowCont.add(checkTxt);
      } else if (isCurrent) {
        const curTxt = this.add.text(modalW / 2 - 28, 0, '★ ВЫ ЗДЕСЬ', {
          fontSize: '9.5px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#facc15',
          fontStyle: 'bold',
          resolution: dpr
        }).setOrigin(1, 0.5);
        rowCont.add(curTxt);
      }

      rowCont.add([rowBg, numTxt, titleTxt, rewardTxt]);
      listCont.add(rowCont);
    }

    const initialScrollY = Phaser.Math.Clamp(-(curLevel - 3) * itemH, -(50 * itemH - (modalH - 140)), 0);
    listCont.y = initialScrollY;

    let startY = 0;
    let isDragging = false;
    const minScrollY = -(50 * itemH - (modalH - 140));

    overlay.on('pointerdown', (p) => {
      startY = p.y;
      isDragging = true;
    });

    overlay.on('pointermove', (p) => {
      if (!isDragging) return;
      const dy = p.y - startY;
      startY = p.y;
      listCont.y = Phaser.Math.Clamp(listCont.y + dy, minScrollY, 0);
    });

    overlay.on('pointerup', () => { isDragging = false; });
    overlay.on('pointerout', () => { isDragging = false; });

    const closeBtn = this.add.rectangle(0, modalH / 2 - 28, modalW * 0.7, 36, 0x1e293b)
      .setStrokeStyle(1.5, 0x475569)
      .setInteractive({ useHandCursor: true });

    const closeTxt = this.add.text(0, modalH / 2 - 28, 'ЗАКРЫТЬ', {
      fontSize: '12.5px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    closeBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      maskGfx.destroy();
      modalCont.destroy();
      overlay.destroy();
    });

    modalCont.add([bg, title, subtitle, listCont, closeBtn, closeTxt]);
  }

  // =========================================================================
  // СРОЧНЫЙ КОНТРАКТ И ОФФЛАЙН ДОХОД
  // =========================================================================
  formatTimeRemaining(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  renderContractWidget(width, y, dpr) {
    const contract = Storage.getDailyContract ? Storage.getDailyContract(ARTIFACT_TEMPLATES) : null;
    if (!contract) return;

    const boxW = width * 0.84;
    const boxH = 56;

    const box = this.add.rectangle(width / 2, y, boxW, boxH, 0x0f172a, 0.95)
      .setStrokeStyle(1.5, contract.completed ? 0x22c55e : 0xeab308, 0.85);

    if (contract.completed) {
      this.add.text(width / 2, y - 10, '✓ КОНТРАКТ ВЫПОЛНЕН', {
        fontSize: '12px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#10b981',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      const timerTxt = this.add.text(width / 2, y + 10, 'Новый через: 00:00:00', {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#94a3b8',
        resolution: dpr
      }).setOrigin(0.5);

      const updateTimer = () => {
        const nextAvail = contract.nextAvailableAt || Date.now();
        const rem = nextAvail - Date.now();
        if (rem <= 0) {
          this.scene.restart();
        } else {
          timerTxt.setText(`Новый через: ${this.formatTimeRemaining(rem)}`);
        }
      };

      this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: updateTimer
      });
      updateTimer();
      return;
    }

    box.setInteractive({ useHandCursor: true });

    this.add.text(width / 2 - boxW / 2 + 12, y - 20, `📜 ЗАКАЗ: ${contract.client}`, {
      fontSize: '10px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#eab308',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0);

    this.add.text(width / 2 - boxW / 2 + 12, y - 3, contract.name, {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0);

    this.add.text(width / 2 - boxW / 2 + 12, y + 13, `+${contract.rewardCoins} 🪙 | +${contract.bonusXP} XP`, {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#34d399',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0);

    const timerTxt = this.add.text(width / 2 + boxW / 2 - 12, y - 20, '00:00:00', {
      fontSize: '10px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#94a3b8',
      resolution: dpr
    }).setOrigin(1, 0);

    const updateTimer = () => {
      const nextAvail = contract.nextAvailableAt || Date.now();
      const rem = nextAvail - Date.now();
      if (rem <= 0) {
        this.scene.restart();
      } else {
        timerTxt.setText(this.formatTimeRemaining(rem));
      }
    };

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: updateTimer
    });
    updateTimer();

    const takeBtn = this.add.rectangle(width / 2 + boxW / 2 - 44, y + 6, 74, 28, 0x164e63)
      .setStrokeStyle(1, 0x06b6d4)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2 + boxW / 2 - 44, y + 6, 'ВЗЯТЬ', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const startContract = () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('RestoreScene', {
        regionId: contract.regionId,
        templateId: contract.templateId,
        contract
      });
    };

    box.on('pointerdown', startContract);
    takeBtn.on('pointerdown', startContract);
  }

  checkOfflineEarnings(width, height, dpr) {
    const offline = Storage.getOfflineEarnings ? Storage.getOfflineEarnings() : { coins: 0, minutes: 0 };
    if (!offline || offline.coins <= 0) return;

    if (AudioManager.playShine) AudioManager.playShine();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85).setDepth(45).setInteractive();
    const box = this.add.container(width / 2, height / 2).setDepth(46);

    const bg = this.add.rectangle(0, 0, width * 0.84, 180, 0x0f172a, 0.98)
      .setStrokeStyle(1.5, 0xca8a04, 0.9);

    const title = this.add.text(0, -50, '🏛️ ДОХОД МУЗЕЯ ЗА ВРЕМЯ ОТСУТСТВИЯ', {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const desc = this.add.text(0, -10, `Пока вас не было (${offline.minutes} мин),\nпосетители оставили в казне:`, {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#cbd5e1',
      align: 'center',
      resolution: dpr
    }).setOrigin(0.5);

    const sumTxt = this.add.text(0, 22, `+${offline.coins} 🪙`, {
      fontSize: '18px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#34d399',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const claimBtn = this.add.rectangle(0, 58, width * 0.55, 34, 0xca8a04).setInteractive({ useHandCursor: true });
    const claimTxt = this.add.text(0, 58, 'ЗАБРАТЬ В КАЗНУ', {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#000000',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    claimBtn.on('pointerdown', () => {
      Storage.addCoins(offline.coins);
      if (AudioManager.playCoin) AudioManager.playCoin();
      box.destroy();
      overlay.destroy();
      this.scene.restart();
    });

    box.add([bg, title, desc, sumTxt, claimBtn, claimTxt]);
  }

  // =========================================================================
  // ЗВУКОВЫЕ ТУМБЛЕРЫ
  // =========================================================================
  createAudioToggles(width) {
    const musicBtn = this.add.circle(width - 70, 36, 17, AudioManager.isMusicOn() ? 0x142033 : 0x221a24)
      .setStrokeStyle(1.5, AudioManager.isMusicOn() ? 0x38bdf8 : 0xef4444, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    const musicIcon = this.add.text(width - 70, 36, AudioManager.isMusicOn() ? '🎵' : '🔇', {
      fontSize: '14px'
    }).setOrigin(0.5).setDepth(31);

    musicBtn.on('pointerdown', () => {
      const state = AudioManager.toggleMusic();
      musicBtn.setFillStyle(state ? 0x142033 : 0x221a24);
      musicBtn.setStrokeStyle(1.5, state ? 0x38bdf8 : 0xef4444, 0.9);
      musicIcon.setText(state ? '🎵' : '🔇');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    const sfxBtn = this.add.circle(width - 30, 36, 17, AudioManager.isSfxOn() ? 0x14261d : 0x221a24)
      .setStrokeStyle(1.5, AudioManager.isSfxOn() ? 0x22c55e : 0xef4444, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    const sfxIcon = this.add.text(width - 30, 36, AudioManager.isSfxOn() ? '🔊' : '🔈', {
      fontSize: '14px'
    }).setOrigin(0.5).setDepth(31);

    sfxBtn.on('pointerdown', () => {
      const state = AudioManager.toggleSfx();
      sfxBtn.setFillStyle(state ? 0x14261d : 0x221a24);
      sfxBtn.setStrokeStyle(1.5, state ? 0x22c55e : 0xef4444, 0.9);
      sfxIcon.setText(state ? '🔊' : '🔈');
      if (AudioManager.playClick) AudioManager.playClick();
    });
  }
}
