import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { ARTIFACT_TEMPLATES } from '../data/artifacts.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    // Повышенное разрешение рендера текста (3x), чтобы полностью убрать пиксельную лесенку
    const textRes = 3;

    // Единый гладкий стек шрифтов
    const FONT_TITLE = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';
    const FONT_UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

    // 1. Фон кабинета реставратора
    if (this.textures.exists('menu_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'menu_bg');
      const scaleX = width / bg.width;
      const scaleY = height / bg.height;
      bg.setScale(Math.max(scaleX, scaleY));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0906, 0.44);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x16100c);
    }

    // 2. Звуковые тумблеры (подняты выше, чтобы не задевать шапку)
    this.createAudioToggles(width, textRes);

    // 3. Верхняя плашка заголовка (скруглённая, с бронзовой рамкой и внутренним бликом)
    const headerW = width * 0.88;
    const headerH = 98;
    const headerY = 104;
    this.drawStyledBox(width / 2, headerY, headerW, headerH, {
      fillTop: 0x24180f,
      fillBottom: 0x140d08,
      alpha: 0.86,
      stroke: 0xc89d54,
      strokeAlpha: 0.75,
      radius: 14,
      highlight: true
    });

    this.add.text(width / 2, headerY - 31, 'EASY DOPAMINE GAMES', {
      fontSize: '10px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      fontStyle: 'bold',
      letterSpacing: 2.5,
      resolution: textRes
    }).setOrigin(0.5);

    const divider = this.add.graphics();
    divider.lineStyle(1, 0xc89d54, 0.45);
    divider.lineBetween(width / 2 - 54, headerY - 18, width / 2 + 54, headerY - 18);

    this.add.text(width / 2, headerY + 3, 'АРТЕФАКТЫ ВРЕМЕНИ', {
      fontSize: '23px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1,
      resolution: textRes
    }).setOrigin(0.5).setShadow(0, 2, '#000000', 6, false, true);

    this.add.text(width / 2, headerY + 28, 'Мастерская реставратора', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: textRes
    }).setOrigin(0.5);

    // 4. Парящий логотип артефакта
    const logoKey = this.textures.exists('art_egypt_scarab') ? 'art_egypt_scarab' : null;
    if (logoKey) {
      const logo = this.add.image(width / 2, height * 0.275, logoKey);
      logo.setDisplaySize(102, 102);
      logo.setDepth(10);

      this.tweens.add({
        targets: logo,
        y: height * 0.262,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 5. Виджет срочного контракта (если активен)
    this.renderContractWidget(width, height * 0.365, textRes, FONT_UI);

    // 6. Плашка ранга
    this.renderRankWidget(width, height * 0.455, textRes, FONT_UI);

    // 7. Фабрика скруглённых объёмных кнопок меню
    const createBtn = (y, text, isPrimary, onClick) => {
      const btnW = width * 0.86;
      const btnH = 50;
      const cont = this.add.container(width / 2, y);

      const palette = isPrimary
        ? {
            fillTop: 0xeab308,
            fillBottom: 0xb47814,
            stroke: 0xfef08a,
            strokeHover: 0xffffff,
            textColor: '#1a1004',
            shadowText: null
          }
        : {
            fillTop: 0x332215,
            fillBottom: 0x1e130b,
            stroke: 0xb08948,
            strokeHover: 0xfde68a,
            textColor: '#f7ead2',
            shadowText: '#000000'
          };

      const gfx = this.add.graphics();
      const drawState = (hovered) => {
        gfx.clear();
        // Мягкая тень снизу
        gfx.fillStyle(0x050302, 0.65);
        gfx.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH, 12);

        // Основной градиент кнопки
        gfx.fillGradientStyle(
          palette.fillTop,
          palette.fillTop,
          palette.fillBottom,
          palette.fillBottom,
          0.96
        );
        gfx.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12);

        // Верхний внутренний блик (объём фаски)
        gfx.lineStyle(1, 0xffffff, isPrimary ? 0.45 : 0.14);
        gfx.beginPath();
        gfx.moveTo(-btnW / 2 + 12, -btnH / 2 + 1.5);
        gfx.lineTo(btnW / 2 - 12, -btnH / 2 + 1.5);
        gfx.strokePath();

        // Внешняя рамка
        gfx.lineStyle(hovered ? 2 : 1.5, hovered ? palette.strokeHover : palette.stroke, 0.95);
        gfx.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12);
      };

      drawState(false);

      const label = this.add.text(0, 0, text, {
        fontSize: '14px',
        fontFamily: FONT_UI,
        color: palette.textColor,
        fontStyle: 'bold',
        letterSpacing: 0.8,
        resolution: textRes
      }).setOrigin(0.5);

      if (palette.shadowText) {
        label.setShadow(0, 1, palette.shadowText, 3, false, true);
      }

      // Невидимая интерактивная зона точно по размеру кнопки
      const hitZone = this.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });

      hitZone.on('pointerover', () => drawState(true));
      hitZone.on('pointerout', () => drawState(false));
      hitZone.on('pointerdown', () => {
        if (AudioManager.playClick) AudioManager.playClick();
        this.tweens.add({
          targets: cont,
          scaleX: 0.965,
          scaleY: 0.965,
          duration: 65,
          yoyo: true,
          ease: 'Quad.easeOut',
          onComplete: () => onClick()
        });
      });

      cont.add([gfx, label, hitZone]);
      return cont;
    };

    const startY = height * 0.565;

    createBtn(startY, '⚒  НА ВЕРСТАК', true, () => {
      this.startQuickRestore();
    });

    createBtn(startY + 60, '🧭  ЭКСПЕДИЦИИ', false, () => {
      this.scene.start('WorldMapScene');
    });

    createBtn(startY + 120, '🕯  ЛАВКА МАСТЕРА', false, () => {
      this.scene.start('ShopScene');
    });

    createBtn(startY + 180, '🏛  ЗАЛ СЛАВЫ (МУЗЕЙ)', false, () => {
      this.scene.start('MuseumScene');
    });

    // 8. Нижний бейдж золотого лака (скруглённая капсула)
    const lacquer = Storage.getBindingLacquer ? Storage.getBindingLacquer() : 0;
    const badgeW = width * 0.74;
    const badgeH = 30;
    const badgeY = height * 0.93;

    this.drawStyledBox(width / 2, badgeY, badgeW, badgeH, {
      fillTop: 0x21160d,
      fillBottom: 0x140d08,
      alpha: 0.9,
      stroke: 0xc89d54,
      strokeAlpha: 0.6,
      radius: 15,
      highlight: false
    });

    this.add.text(width / 2, badgeY, `✨ Золотой лак в наличии: ${lacquer} шт.`, {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    if (AudioManager.playMusic) AudioManager.playMusic('menu');
    this.checkOfflineEarnings(width, height, textRes, FONT_UI);
  }

  // Универсальный рисовальщик скруглённых панелей с градиентом и бликом
  drawStyledBox(x, y, w, h, opts) {
    const gfx = this.add.graphics();
    const r = opts.radius || 10;

    gfx.fillStyle(0x050302, 0.55);
    gfx.fillRoundedRect(x - w / 2, y - h / 2 + 3, w, h, r);

    gfx.fillGradientStyle(opts.fillTop, opts.fillTop, opts.fillBottom, opts.fillBottom, opts.alpha ?? 0.92);
    gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);

    if (opts.highlight) {
      gfx.lineStyle(1, 0xffffff, 0.14);
      gfx.beginPath();
      gfx.moveTo(x - w / 2 + r, y - h / 2 + 1.5);
      gfx.lineTo(x + w / 2 - r, y - h / 2 + 1.5);
      gfx.strokePath();
    }

    gfx.lineStyle(1.5, opts.stroke, opts.strokeAlpha ?? 0.85);
    gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
    return gfx;
  }

  startQuickRestore() {
    if (Storage.hasActiveSession && Storage.hasActiveSession()) {
      this.scene.start('RestoreScene');
      return;
    }

    const unlocked = Storage.getUnlockedRegions ? Storage.getUnlockedRegions() : ['egypt'];
    const availablePool = [];

    unlocked.forEach((regionId) => {
      const stock = Storage.getRegionStock(regionId, ARTIFACT_TEMPLATES);
      if (stock) {
        Object.entries(stock).forEach(([templateId, count]) => {
          if (count > 0) {
            const tmpl = ARTIFACT_TEMPLATES.find((t) => t.id === templateId && t.regionId === regionId);
            if (tmpl) {
              availablePool.push({ regionId, templateId });
            }
          }
        });
      }
    });

    if (availablePool.length === 0) {
      this.scene.start('WorldMapScene');
      return;
    }

    const randomIndex = Math.floor(Math.random() * availablePool.length);
    const chosen = availablePool[randomIndex];

    Storage.setActiveSession(chosen.regionId, chosen.templateId);
    this.scene.start('RestoreScene', {
      regionId: chosen.regionId,
      templateId: chosen.templateId
    });
  }

  renderRankWidget(width, y, textRes, FONT_UI) {
    const lvlData = Storage.getLevelData ? Storage.getLevelData() : { level: 1, title: 'Новичок', progressRatio: 0 };
    const boxW = width * 0.86;
    const boxH = 48;

    const rankCont = this.add.container(width / 2, y);

    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(0x050302, 0.55);
    bgGfx.fillRoundedRect(-boxW / 2, -boxH / 2 + 3, boxW, boxH, 11);
    bgGfx.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.94);
    bgGfx.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 11);
    bgGfx.lineStyle(1.5, 0xc89d54, 0.8);
    bgGfx.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 11);

    const lvlBadge = this.add.text(-boxW / 2 + 14, -9, `УР. ${lvlData.level}`, {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0, 0.5);

    const rankTitle = this.add.text(-boxW / 2 + 66, -9, lvlData.title, {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0, 0.5);

    const tapHint = this.add.text(boxW / 2 - 14, -9, 'Путь ›', {
      fontSize: '11px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: textRes
    }).setOrigin(1, 0.5);

    // Скруглённый прогресс-бар
    const barW = boxW - 28;
    const barH = 7;
    const barY = 11;
    const fillW = Math.max(8, barW * Phaser.Math.Clamp(lvlData.progressRatio, 0, 1));

    const barGfx = this.add.graphics();
    barGfx.fillStyle(0x0d0805, 0.95);
    barGfx.fillRoundedRect(-barW / 2, barY - barH / 2, barW, barH, 3.5);
    barGfx.fillGradientStyle(0xfacc15, 0xfacc15, 0xd97706, 0xd97706, 1);
    barGfx.fillRoundedRect(-barW / 2, barY - barH / 2, fillW, barH, 3.5);

    const hitZone = this.add.zone(0, 0, boxW, boxH).setInteractive({ useHandCursor: true });

    rankCont.add([bgGfx, lvlBadge, rankTitle, tapHint, barGfx, hitZone]);

    hitZone.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.openLevelProgressModal(width, this.scale.height, textRes, FONT_UI);
    });
  }

  openLevelProgressModal(width, height, textRes, FONT_UI) {
    const curLevel = Storage.getLevelData ? Storage.getLevelData().level : 1;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x080503, 0.88)
      .setDepth(40)
      .setInteractive();

    const modalCont = this.add.container(width / 2, height / 2).setDepth(41);
    const modalW = width * 0.88;
    const modalH = height * 0.78;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x24180f, 0x24180f, 0x160f0a, 0x160f0a, 0.98);
    bg.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 14);
    bg.lineStyle(1.5, 0xc89d54, 0.9);
    bg.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 14);

    const title = this.add.text(0, -modalH / 2 + 24, '🏆 ПУТЬ МАСТЕРА ВРЕМЕНИ', {
      fontSize: '14px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    const subTitle = this.add.text(0, -modalH / 2 + 45, `Текущий ранг: Уровень ${curLevel} из 50`, {
      fontSize: '11px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: textRes
    }).setOrigin(0.5);

    const listCont = this.add.container(0, 0);

    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(width / 2 - modalW / 2 + 8, height / 2 - modalH / 2 + 62, modalW - 16, modalH - 126);
    listCont.setMask(new Phaser.Display.Masks.GeometryMask(this, maskGfx));

    const itemH = 54;
    const startListY = -modalH / 2 + 68;

    const epochUnlocks = {
      1: '🇪🇬 Египет',
      3: '🏛 Античность',
      6: '⚔️ Средневековье',
      10: '🐉 Восток',
      15: '🗿 Майя',
      20: '🛡 Викинги',
      25: '🎨 Ренессанс'
    };

    for (let lvl = 1; lvl <= 50; lvl++) {
      const cfg = Storage.getLevelConfig ? Storage.getLevelConfig(lvl) : { title: `Ранг ${lvl}` };
      const itemY = startListY + (lvl - 1) * itemH;
      const isCurrent = (lvl === curLevel);
      const isPassed = (lvl < curLevel);

      const rowCont = this.add.container(0, itemY);

      const rowBgColor = isCurrent ? 0x3b2614 : (isPassed ? 0x261a11 : 0x160f0a);
      const rowStroke = isCurrent ? 0xfacc15 : (isPassed ? 0x8c6239 : 0x4a3525);

      const rowBg = this.add.graphics();
      rowBg.fillStyle(rowBgColor, 0.94);
      rowBg.fillRoundedRect(-(modalW - 24) / 2, 0, modalW - 24, itemH - 6, 8);
      rowBg.lineStyle(isCurrent ? 1.5 : 1, rowStroke, 0.85);
      rowBg.strokeRoundedRect(-(modalW - 24) / 2, 0, modalW - 24, itemH - 6, 8);

      const numTxt = this.add.text(-modalW / 2 + 20, 14, `УР. ${lvl}`, {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: isCurrent ? '#facc15' : (isPassed ? '#e2b866' : '#8c735b'),
        fontStyle: 'bold',
        resolution: textRes
      }).setOrigin(0, 0.5);

      const titleTxt = this.add.text(-modalW / 2 + 68, 14, cfg.title, {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: isCurrent ? '#ffffff' : (isPassed ? '#f5e6c8' : '#7a6552'),
        fontStyle: isCurrent ? 'bold' : 'normal',
        resolution: textRes
      }).setOrigin(0, 0.5);

      const rewardCoins = lvl * 100 + 100;
      let rewardStr = `Награда: +${rewardCoins} 🪙`;
      if (lvl % 5 === 0) rewardStr += ' + 1 ✨ Лак';

      const rewardTxt = this.add.text(-modalW / 2 + 68, 34, rewardStr, {
        fontSize: '10.5px',
        fontFamily: FONT_UI,
        color: '#e2b866',
        resolution: textRes
      }).setOrigin(0, 0.5);

      if (epochUnlocks[lvl]) {
        const epochTxt = this.add.text(modalW / 2 - 20, 34, epochUnlocks[lvl], {
          fontSize: '10px',
          fontFamily: FONT_UI,
          color: '#38bdf8',
          fontStyle: 'bold',
          resolution: textRes
        }).setOrigin(1, 0.5);
        rowCont.add(epochTxt);
      }

      if (isPassed) {
        const checkTxt = this.add.text(modalW / 2 - 20, 14, '✓', {
          fontSize: '14px',
          fontFamily: FONT_UI,
          color: '#86efac',
          fontStyle: 'bold',
          resolution: textRes
        }).setOrigin(1, 0.5);
        rowCont.add(checkTxt);
      } else if (isCurrent) {
        const curTxt = this.add.text(modalW / 2 - 20, 14, '• ВЫ ЗДЕСЬ', {
          fontSize: '10px',
          fontFamily: FONT_UI,
          color: '#facc15',
          fontStyle: 'bold',
          resolution: textRes
        }).setOrigin(1, 0.5);
        rowCont.add(curTxt);
      }

      rowCont.add([rowBg, numTxt, titleTxt, rewardTxt]);
      listCont.add(rowCont);
    }

    const initialScrollY = Math.min(0, -((curLevel - 3) * itemH) - (50 * itemH - modalH + 140));
    listCont.y = initialScrollY;

    let startY = 0;
    let isDragging = false;
    const minScrollY = -(50 * itemH - (modalH - 130));

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

    overlay.on('pointerup', () => {
      isDragging = false;
    });

    const closeGfx = this.add.graphics();
    closeGfx.fillGradientStyle(0x3b2614, 0x3b2614, 0x24160b, 0x24160b, 1);
    closeGfx.fillRoundedRect(-(modalW * 0.7) / 2, modalH / 2 - 46, modalW * 0.7, 36, 10);
    closeGfx.lineStyle(1.5, 0xc89d54, 0.9);
    closeGfx.strokeRoundedRect(-(modalW * 0.7) / 2, modalH / 2 - 46, modalW * 0.7, 36, 10);

    const closeHit = this.add.zone(0, modalH / 2 - 28, modalW * 0.7, 36).setInteractive({ useHandCursor: true });

    const closeTxt = this.add.text(0, modalH / 2 - 28, 'ЗАКРЫТЬ', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    closeHit.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      maskGfx.destroy();
      modalCont.destroy();
      overlay.destroy();
    });

    modalCont.add([bg, title, subTitle, listCont, closeGfx, closeTxt, closeHit]);
  }

  formatTimeRemaining(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  renderContractWidget(width, y, textRes, FONT_UI) {
    const contract = Storage.getContract ? Storage.getContract(ARTIFACT_TEMPLATES) : null;
    if (!contract) return;

    const boxW = width * 0.86;
    const boxH = 56;

    this.drawStyledBox(width / 2, y, boxW, boxH, {
      fillTop: 0x261a10,
      fillBottom: 0x170f09,
      alpha: 0.94,
      stroke: contract.completed ? 0x86efac : 0xc89d54,
      strokeAlpha: 0.85,
      radius: 11,
      highlight: true
    });

    if (contract.completed) {
      this.add.text(width / 2, y - 10, '✓ КОНТРАКТ ВЫПОЛНЕН!', {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: '#86efac',
        fontStyle: 'bold',
        resolution: textRes
      }).setOrigin(0.5);

      const timerTxt = this.add.text(width / 2, y + 10, 'Новый через: 00:00:00', {
        fontSize: '10.5px',
        fontFamily: FONT_UI,
        color: '#d6c3a5',
        resolution: textRes
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

      this.time.addEvent({ delay: 1000, loop: true, callback: updateTimer });
      updateTimer();
      return;
    }

    const hitBox = this.add.zone(width / 2, y, boxW, boxH).setInteractive({ useHandCursor: true });

    this.add.text(width / 2 - boxW / 2 + 14, y - 17, '📜 СРОЧНЫЙ ЗАКАЗ МУЗЕЯ', {
      fontSize: '10px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0);

    this.add.text(width / 2 - boxW / 2 + 14, y - 2, contract.title, {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0);

    this.add.text(width / 2 - boxW / 2 + 14, y + 13, `+${contract.rewardCoins} 🪙 | +${contract.bonusXP} XP`, {
      fontSize: '11px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0);

    const timerTxt = this.add.text(width / 2 + boxW / 2 - 14, y - 18, '00:00:00', {
      fontSize: '10px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: textRes
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

    this.time.addEvent({ delay: 1000, loop: true, callback: updateTimer });
    updateTimer();

    const btnX = width / 2 + boxW / 2 - 46;
    const btnY = y + 7;
    const takeGfx = this.add.graphics();
    takeGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
    takeGfx.fillRoundedRect(btnX - 36, btnY - 14, 72, 28, 8);
    takeGfx.lineStyle(1, 0xfef08a, 0.95);
    takeGfx.strokeRoundedRect(btnX - 36, btnY - 14, 72, 28, 8);

    this.add.text(btnX, btnY, 'ВЗЯТЬ', {
      fontSize: '11px',
      fontFamily: FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    const startContract = () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('RestoreScene', {
        regionId: contract.regionId,
        templateId: contract.templateId,
        contract
      });
    };

    hitBox.on('pointerdown', startContract);
  }

  checkOfflineEarnings(width, height, textRes, FONT_UI) {
    const offline = Storage.getOfflineEarnings ? Storage.getOfflineEarnings() : { coins: 0, minutes: 0 };
    if (!offline || offline.coins <= 0) return;

    if (AudioManager.playShine) AudioManager.playShine();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x080503, 0.85)
      .setDepth(45)
      .setInteractive();

    const box = this.add.container(width / 2, height / 2).setDepth(46);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x24180f, 0x24180f, 0x160f0a, 0x160f0a, 0.98);
    bg.fillRoundedRect(-(width * 0.84) / 2, -92, width * 0.84, 184, 14);
    bg.lineStyle(1.5, 0xc89d54, 0.9);
    bg.strokeRoundedRect(-(width * 0.84) / 2, -92, width * 0.84, 184, 14);

    const title = this.add.text(0, -58, '🏛 ДОХОД МУЗЕЯ ЗА ВРЕМЯ ОТСУТСТВИЯ', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    const desc = this.add.text(0, -14, `Пока вас не было (${offline.minutes} мин),\nпосетители оставили в казне:`, {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#f5e6c8',
      align: 'center',
      resolution: textRes
    }).setOrigin(0.5);

    const sumTxt = this.add.text(0, 22, `+${offline.coins} 🪙`, {
      fontSize: '19px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    const claimGfx = this.add.graphics();
    claimGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
    claimGfx.fillRoundedRect(-(width * 0.66) / 2, 42, width * 0.66, 36, 10);
    claimGfx.lineStyle(1, 0xfef08a, 0.95);
    claimGfx.strokeRoundedRect(-(width * 0.66) / 2, 42, width * 0.66, 36, 10);

    const claimHit = this.add.zone(0, 60, width * 0.66, 36).setInteractive({ useHandCursor: true });

    const claimTxt = this.add.text(0, 60, 'ЗАБРАТЬ В КАЗНУ', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    claimHit.on('pointerdown', () => {
      Storage.addCoins(offline.coins);
      if (AudioManager.playCoin) AudioManager.playCoin();
      box.destroy();
      overlay.destroy();
      this.scene.restart();
    });

    box.add([bg, title, desc, sumTxt, claimGfx, claimTxt, claimHit]);
  }

  createAudioToggles(width, textRes) {
    const musicBtn = this.add.circle(width - 68, 28, 16, AudioManager.isMusicOn() ? 0x2b1d12 : 0x160f0a)
      .setStrokeStyle(1.5, AudioManager.isMusicOn() ? 0xc89d54 : 0x7f1d1d, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    const musicIcon = this.add.text(width - 68, 28, AudioManager.isMusicOn() ? '🎵' : '🔇', {
      fontSize: '13px',
      resolution: textRes
    }).setOrigin(0.5).setDepth(31);

    musicBtn.on('pointerdown', () => {
      const state = AudioManager.toggleMusic();
      musicBtn.setFillStyle(state ? 0x2b1d12 : 0x160f0a);
      musicBtn.setStrokeStyle(1.5, state ? 0xc89d54 : 0x7f1d1d, 0.9);
      musicIcon.setText(state ? '🎵' : '🔇');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    const sfxBtn = this.add.circle(width - 30, 28, 16, AudioManager.isSfxOn() ? 0x2b1d12 : 0x160f0a)
      .setStrokeStyle(1.5, AudioManager.isSfxOn() ? 0xc89d54 : 0x7f1d1d, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    const sfxIcon = this.add.text(width - 30, 28, AudioManager.isSfxOn() ? '🔊' : '🔈', {
      fontSize: '13px',
      resolution: textRes
    }).setOrigin(0.5).setDepth(31);

    sfxBtn.on('pointerdown', () => {
      const state = AudioManager.toggleSfx();
      sfxBtn.setFillStyle(state ? 0x2b1d12 : 0x160f0a);
      sfxBtn.setStrokeStyle(1.5, state ? 0xc89d54 : 0x7f1d1d, 0.9);
      sfxIcon.setText(state ? '🔊' : '🔈');
      if (AudioManager.playClick) AudioManager.playClick();
    });
  }
}
