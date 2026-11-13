import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { YandexSDK } from '../utils/YandexSDK.js';
import { ARTIFACT_TEMPLATES } from '../data/artifacts.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const textRes = 3;
    this.isModalOpen = false;

    const FONT_TITLE = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';
    const FONT_UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

    if (this.textures.exists('menu_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'menu_bg');
      bg.setScale(Math.max(width / bg.width, height / bg.height));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0906, 0.44);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x16100c);
    }

    this.createAudioToggles(width, textRes);

    // Верхняя плашка заголовка
    const headerW = width * 0.88;
    const headerH = 94;
    const headerY = 94;
    this.drawStyledBox(width / 2, headerY, headerW, headerH, {
      fillTop: 0x24180f,
      fillBottom: 0x140d08,
      alpha: 0.90,
      stroke: 0xc89d54,
      strokeAlpha: 0.78,
      radius: 14,
      highlight: true
    });

    this.add.text(width / 2, headerY - 29, 'EASY DOPAMINE GAMES', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      fontStyle: 'bold',
      letterSpacing: 1.8,
      resolution: textRes
    }).setOrigin(0.5);

    const divider = this.add.graphics();
    divider.lineStyle(1, 0xc89d54, 0.45);
    divider.lineBetween(width / 2 - 64, headerY - 15, width / 2 + 64, headerY - 15);

    this.add.text(width / 2, headerY + 4, 'АРТЕФАКТЫ ВРЕМЕНИ', {
      fontSize: '22px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1,
      resolution: textRes
    }).setOrigin(0.5).setShadow(0, 2, '#000000', 6, false, true);

    this.add.text(width / 2, headerY + 28, 'Мастерская реставратора', {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: textRes
    }).setOrigin(0.5);

    // Парящий логотип артефакта
    const logoKey = this.textures.exists('art_egypt_scarab') ? 'art_egypt_scarab' : null;
    if (logoKey) {
      const logo = this.add.image(width / 2, height * 0.252, logoKey);
      logo.setDisplaySize(84, 84);
      logo.setDepth(10);

      this.tweens.add({
        targets: logo,
        y: height * 0.240,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Виджет срочного контракта
    this.renderContractWidget(width, height * 0.358, textRes, FONT_UI);

    // Плашка ранга
    this.renderRankWidget(width, height * 0.464, textRes, FONT_UI);

    const createBtn = (y, text, isPrimary, onClick) => {
      const btnW = width * 0.86;
      const btnH = 48;
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
        gfx.fillStyle(0x050302, 0.65);
        gfx.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH, 12);

        gfx.fillGradientStyle(
          palette.fillTop,
          palette.fillTop,
          palette.fillBottom,
          palette.fillBottom,
          0.96
        );
        gfx.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12);

        gfx.lineStyle(1, 0xffffff, isPrimary ? 0.45 : 0.14);
        gfx.beginPath();
        gfx.moveTo(-btnW / 2 + 12, -btnH / 2 + 1.5);
        gfx.lineTo(btnW / 2 - 12, -btnH / 2 + 1.5);
        gfx.strokePath();

        gfx.lineStyle(hovered ? 2 : 1.5, hovered ? palette.strokeHover : palette.stroke, 0.95);
        gfx.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12);
      };

      drawState(false);

      const label = this.add.text(0, 0, text, {
        fontSize: '14.5px',
        fontFamily: FONT_UI,
        color: palette.textColor,
        fontStyle: 'bold',
        letterSpacing: 0.8,
        resolution: textRes
      }).setOrigin(0.5);

      if (palette.shadowText) {
        label.setShadow(0, 1, palette.shadowText, 3, false, true);
      }

      const hitZone = this.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });

      hitZone.on('pointerover', () => {
        if (!this.isModalOpen) drawState(true);
      });
      hitZone.on('pointerout', () => drawState(false));
      hitZone.on('pointerdown', () => {
        if (this.isModalOpen) return;
        if (AudioManager.playClick) AudioManager.playClick();
        this.tweens.add({
          targets: cont,
          scaleX: 0.965,
          scaleY: 0.965,
          duration: 65,
          yoyo: true,
          ease: 'Quad.easeOut',
          onComplete: () => {
            if (!this.isModalOpen) onClick();
          }
        });
      });

      cont.add([gfx, label, hitZone]);
      return cont;
    };

    const startY = height * 0.568;

    createBtn(startY, '⚒  НА ВЕРСТАК', true, () => {
      this.startQuickRestore();
    });

    createBtn(startY + 58, '🧭  ЭКСПЕДИЦИИ', false, () => {
      this.scene.start('EraSelectScene');
    });

    createBtn(startY + 116, '🕯  ЛАВКА МАСТЕРА', false, () => {
      this.scene.start('ShopScene');
    });

    createBtn(startY + 174, '🏛  ЗАЛ СЛАВЫ (МУЗЕЙ)', false, () => {
      this.scene.start('MuseumScene');
    });

    // Нижний бейдж золотого лака и казны
    const lacquer = Storage.getKintsugiLacquer();
    const coins = Storage.getCoins();
    const badgeW = width * 0.86;
    const badgeH = 34;
    const badgeY = height * 0.935;

    this.drawStyledBox(width / 2, badgeY, badgeW, badgeH, {
      fillTop: 0x21160d,
      fillBottom: 0x140d08,
      alpha: 0.92,
      stroke: 0xc89d54,
      strokeAlpha: 0.65,
      radius: 16,
      highlight: false
    });

    this.add.text(width / 2, badgeY, `🪙 Казна: ${coins}   |   ✨ Лак Кинцуги: ${lacquer} шт.`, {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    if (AudioManager.playMusic) AudioManager.playMusic('menu');
    this.checkOfflineEarnings(width, height, textRes, FONT_UI);
  }

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
    const saved = Storage.getActiveSession();
    if (saved && saved.templateId) {
      this.scene.start('RestoreScene', {
        regionId: saved.regionId,
        templateId: saved.templateId
      });
      return;
    }

    const unlocked = Storage.getUnlockedRegions();
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
      this.scene.start('EraSelectScene');
      return;
    }

    const chosen = availablePool[Math.floor(Math.random() * availablePool.length)];
    Storage.setActiveSession(chosen.regionId, chosen.templateId);
    this.scene.start('RestoreScene', {
      regionId: chosen.regionId,
      templateId: chosen.templateId
    });
  }

  renderRankWidget(width, y, textRes, FONT_UI) {
    const lvlData = Storage.getLevelData();
    const boxW = width * 0.86;
    const boxH = 50;

    const rankCont = this.add.container(width / 2, y);

    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(0x050302, 0.55);
    bgGfx.fillRoundedRect(-boxW / 2, -boxH / 2 + 3, boxW, boxH, 11);
    bgGfx.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.94);
    bgGfx.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 11);
    bgGfx.lineStyle(1.5, 0xc89d54, 0.8);
    bgGfx.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 11);

    const padX = 14;
    const lvlBadge = this.add.text(-boxW / 2 + padX, -9, `УР. ${lvlData.level}`, {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0, 0.5);

    const rankTitle = this.add.text(-boxW / 2 + padX + 54, -9, lvlData.title, {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0, 0.5);

    const tapHint = this.add.text(boxW / 2 - padX, -9, 'Путь ›', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: textRes
    }).setOrigin(1, 0.5);

    const barW = boxW - padX * 2;
    const barH = 7;
    const barY = 12;
    const fillW = Math.max(8, barW * Phaser.Math.Clamp(lvlData.progressRatio, 0, 1));

    const barGfx = this.add.graphics();
    barGfx.fillStyle(0x0d0805, 0.95);
    barGfx.fillRoundedRect(-barW / 2, barY - barH / 2, barW, barH, 3.5);
    barGfx.fillGradientStyle(0xfacc15, 0xfacc15, 0xd97706, 0xd97706, 1);
    barGfx.fillRoundedRect(-barW / 2, barY - barH / 2, fillW, barH, 3.5);

    const hitZone = this.add.zone(0, 0, boxW, boxH).setInteractive({ useHandCursor: true });

    rankCont.add([bgGfx, lvlBadge, rankTitle, tapHint, barGfx, hitZone]);

    hitZone.on('pointerdown', () => {
      if (this.isModalOpen) return;
      if (AudioManager.playClick) AudioManager.playClick();
      this.openLevelProgressModal(width, this.scale.height, textRes, FONT_UI);
    });
  }

  openLevelProgressModal(width, height, textRes, FONT_UI) {
    if (this.isModalOpen) return;
    this.isModalOpen = true;

    const curLevel = Storage.getLevelData().level;
    const modalObjects = [];

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x080503, 0.90)
      .setDepth(100)
      .setInteractive();
    modalObjects.push(overlay);

    const modalW = width * 0.88;
    const modalH = height * 0.78;
    const modalTop = height / 2 - modalH / 2;
    const modalBottom = height / 2 + modalH / 2;
    const headerH = 66;
    const footerH = 60;

    // Фон модального окна
    const bg = this.add.graphics().setDepth(101);
    bg.fillGradientStyle(0x24180f, 0x24180f, 0x160f0a, 0x160f0a, 0.99);
    bg.fillRoundedRect(width / 2 - modalW / 2, modalTop, modalW, modalH, 14);
    modalObjects.push(bg);

    const listViewportTop = modalTop + headerH;
    const listViewportBottom = modalBottom - footerH;

    // Контейнер списка уровней (строки рисуются сразу в видимом слое depth 102)
    const listCont = this.add.container(width / 2, listViewportTop).setDepth(102);
    modalObjects.push(listCont);

    const itemH = 56;
    const rowW = modalW - 24;
    const epochUnlocks = {
      1: '🇪🇬 Египет',
      3: '🏛 Античность',
      6: '⚔️ Европа',
      10: '🐉 Япония',
      15: '🗿 Ацтеки',
      20: '🛡 Викинги',
      25: '🎨 Ренессанс'
    };

    for (let lvl = 1; lvl <= 50; lvl++) {
      const cfg = Storage.getLevelConfig(lvl);
      const rew = Storage.getLevelRewardDetails(lvl);
      const itemY = (lvl - 1) * itemH;
      const isCurrent = (lvl === curLevel);
      const isPassed = (lvl < curLevel);

      const rowCont = this.add.container(0, itemY);

      const rowBgColor = isCurrent ? 0x3b2614 : (isPassed ? 0x261a11 : 0x1a120c);
      const rowStroke = isCurrent ? 0xfacc15 : (isPassed ? 0x8c6239 : 0x4a3525);

      const rowBg = this.add.graphics();
      rowBg.fillStyle(rowBgColor, 1);
      rowBg.fillRoundedRect(-rowW / 2, 0, rowW, itemH - 6, 8);
      rowBg.lineStyle(isCurrent ? 1.5 : 1, rowStroke, 0.9);
      rowBg.strokeRoundedRect(-rowW / 2, 0, rowW, itemH - 6, 8);

      const numTxt = this.add.text(-rowW / 2 + 10, 15, `УР. ${lvl}`, {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: isCurrent ? '#facc15' : (isPassed ? '#e2b866' : '#8c735b'),
        fontStyle: 'bold',
        resolution: textRes
      }).setOrigin(0, 0.5);

      const titleTxt = this.add.text(-rowW / 2 + 56, 15, cfg.title, {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: isCurrent ? '#ffffff' : (isPassed ? '#f5e6c8' : '#9c8265'),
        fontStyle: isCurrent ? 'bold' : 'normal',
        resolution: textRes
      }).setOrigin(0, 0.5);

      let rewardStr = `+${rew.bonusCoins} 🪙`;
      if (rew.lacquerBonus > 0) rewardStr += `  +${rew.lacquerBonus} ✨ Лак`;

      const rewardTxt = this.add.text(-rowW / 2 + 56, 35, rewardStr, {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: '#e2b866',
        resolution: textRes
      }).setOrigin(0, 0.5);

      rowCont.add([rowBg, numTxt, titleTxt, rewardTxt]);

      if (epochUnlocks[lvl]) {
        const epochTxt = this.add.text(rowW / 2 - 10, 35, epochUnlocks[lvl], {
          fontSize: '11px',
          fontFamily: FONT_UI,
          color: '#38bdf8',
          fontStyle: 'bold',
          resolution: textRes
        }).setOrigin(1, 0.5);
        rowCont.add(epochTxt);
      }

      if (isPassed) {
        const checkTxt = this.add.text(rowW / 2 - 10, 15, '✓', {
          fontSize: '13px',
          fontFamily: FONT_UI,
          color: '#86efac',
          fontStyle: 'bold',
          resolution: textRes
        }).setOrigin(1, 0.5);
        rowCont.add(checkTxt);
      } else if (isCurrent) {
        const curTxt = this.add.text(rowW / 2 - 10, 15, '• ВЫ ЗДЕСЬ', {
          fontSize: '10.5px',
          fontFamily: FONT_UI,
          color: '#facc15',
          fontStyle: 'bold',
          resolution: textRes
        }).setOrigin(1, 0.5);
        rowCont.add(curTxt);
      }

      listCont.add(rowCont);
    }

    // Непрозрачная верхняя шапка окна (depth 105) + маскировка фона сверху окна (depth 104)
    const topBlocker = this.add.graphics().setDepth(104);
    topBlocker.fillStyle(0x080503, 0.96);
    topBlocker.fillRect(0, 0, width, modalTop);

    const modalHeaderGfx = this.add.graphics().setDepth(105);
    modalHeaderGfx.fillGradientStyle(0x24180f, 0x24180f, 0x1d130c, 0x1d130c, 1);
    modalHeaderGfx.fillRoundedRect(width / 2 - modalW / 2, modalTop, modalW, headerH, { tl: 14, tr: 14, bl: 0, br: 0 });
    modalHeaderGfx.lineStyle(1, 0xc89d54, 0.45);
    modalHeaderGfx.lineBetween(width / 2 - modalW / 2 + 12, listViewportTop - 2, width / 2 + modalW / 2 - 12, listViewportTop - 2);

    const title = this.add.text(width / 2, modalTop + 23, '🏆 ПУТЬ МАСТЕРА ВРЕМЕНИ', {
      fontSize: '14.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5).setDepth(106);

    const subTitle = this.add.text(width / 2, modalTop + 45, `Текущий ранг: Уровень ${curLevel} из 50`, {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: textRes
    }).setOrigin(0.5).setDepth(106);

    // Непрозрачная нижняя панель окна (depth 105) + маскировка фона снизу окна (depth 104)
    const bottomBlocker = this.add.graphics().setDepth(104);
    bottomBlocker.fillStyle(0x080503, 0.96);
    bottomBlocker.fillRect(0, modalBottom, width, height - modalBottom);

    const modalFooterGfx = this.add.graphics().setDepth(105);
    modalFooterGfx.fillGradientStyle(0x19110b, 0x19110b, 0x160f0a, 0x160f0a, 1);
    modalFooterGfx.fillRoundedRect(width / 2 - modalW / 2, listViewportBottom, modalW, footerH, { tl: 0, tr: 0, bl: 14, br: 14 });
    modalFooterGfx.lineStyle(1, 0xc89d54, 0.45);
    modalFooterGfx.lineBetween(width / 2 - modalW / 2 + 12, listViewportBottom + 2, width / 2 + modalW / 2 - 12, listViewportBottom + 2);

    // Внешняя рамка модального окна
    const borderGfx = this.add.graphics().setDepth(107);
    borderGfx.lineStyle(1.5, 0xc89d54, 0.92);
    borderGfx.strokeRoundedRect(width / 2 - modalW / 2, modalTop, modalW, modalH, 14);

    modalObjects.push(topBlocker, modalHeaderGfx, title, subTitle, bottomBlocker, modalFooterGfx, borderGfx);

    // Границы скролла и авто-позиционирование на текущем уровне
    const totalListH = 50 * itemH;
    const minScrollY = Math.min(listViewportTop, listViewportBottom - totalListH - 6);
    const maxScrollY = listViewportTop;

    const targetOffset = Math.max(0, (curLevel - 3) * itemH);
    listCont.y = Phaser.Math.Clamp(listViewportTop - targetOffset, minScrollY, maxScrollY);

    let startY = 0;
    let listStartY = 0;
    let isDragging = false;

    const onDown = (p) => {
      if (p.y >= listViewportTop && p.y <= listViewportBottom) {
        startY = p.y;
        listStartY = listCont.y;
        isDragging = true;
      }
    };

    const onMove = (p) => {
      if (!isDragging) return;
      const dy = p.y - startY;
      listCont.y = Phaser.Math.Clamp(listStartY + dy, minScrollY, maxScrollY);
    };

    const onUp = () => {
      isDragging = false;
    };

    const onWheel = (pointer, gameObjects, deltaX, deltaY) => {
      if (pointer.y >= listViewportTop && pointer.y <= listViewportBottom) {
        listCont.y = Phaser.Math.Clamp(listCont.y - deltaY * 0.45, minScrollY, maxScrollY);
      }
    };

    this.input.on('pointerdown', onDown);
    this.input.on('pointermove', onMove);
    this.input.on('pointerup', onUp);
    this.input.on('wheel', onWheel);

    const closeBtnW = modalW * 0.72;
    const closeBtnH = 38;
    const closeBtnY = modalBottom - footerH / 2;

    const closeGfx = this.add.graphics().setDepth(106);
    closeGfx.fillGradientStyle(0x3b2614, 0x3b2614, 0x24160b, 0x24160b, 1);
    closeGfx.fillRoundedRect(width / 2 - closeBtnW / 2, closeBtnY - closeBtnH / 2, closeBtnW, closeBtnH, 10);
    closeGfx.lineStyle(1.5, 0xc89d54, 0.9);
    closeGfx.strokeRoundedRect(width / 2 - closeBtnW / 2, closeBtnY - closeBtnH / 2, closeBtnW, closeBtnH, 10);

    const closeHit = this.add.zone(width / 2, closeBtnY, closeBtnW, closeBtnH)
      .setInteractive({ useHandCursor: true })
      .setDepth(108);

    const closeTxt = this.add.text(width / 2, closeBtnY, 'ЗАКРЫТЬ', {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5).setDepth(107);

    modalObjects.push(closeGfx, closeHit, closeTxt);

    const closeModal = () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.input.off('pointerdown', onDown);
      this.input.off('pointermove', onMove);
      this.input.off('pointerup', onUp);
      this.input.off('wheel', onWheel);

      modalObjects.forEach((obj) => {
        if (obj && obj.destroy) obj.destroy();
      });

      // Небольшая задержка перед снятием блокировки, чтобы отпускание пальца не нажало кнопки под окном
      this.time.delayedCall(120, () => {
        this.isModalOpen = false;
      });
    };

    closeHit.on('pointerup', closeModal);
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
    const contract = Storage.getDailyContract(ARTIFACT_TEMPLATES);
    if (!contract) return;

    const boxW = width * 0.86;
    const boxH = 76;
    const leftEdge = width / 2 - boxW / 2;
    const rightEdge = width / 2 + boxW / 2;
    const padX = 14;

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
      this.add.text(leftEdge + padX, y - 12, '✓ КОНТРАКТ ВЫПОЛНЕН!', {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#86efac',
        fontStyle: 'bold',
        resolution: textRes
      }).setOrigin(0, 0.5);

      const timerTxt = this.add.text(leftEdge + padX, y + 12, 'Новый через: 00:00:00', {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: '#d6c3a5',
        resolution: textRes
      }).setOrigin(0, 0.5);

      const btnW = 84;
      const adBtnX = rightEdge - padX - btnW / 2;
      const adGfx = this.add.graphics();
      adGfx.fillStyle(0x1e3a8a, 1);
      adGfx.fillRoundedRect(adBtnX - btnW / 2, y - 16, btnW, 32, 8);
      adGfx.lineStyle(1, 0x38bdf8, 0.95);
      adGfx.strokeRoundedRect(adBtnX - btnW / 2, y - 16, btnW, 32, 8);

      this.add.text(adBtnX, y, '🎬 НОВЫЙ', {
        fontSize: '11px',
        fontFamily: FONT_UI,
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: textRes
      }).setOrigin(0.5);

      const adZone = this.add.zone(adBtnX, y, btnW, 32).setInteractive({ useHandCursor: true });
      adZone.on('pointerdown', () => {
        if (this.isModalOpen) return;
        YandexSDK.showRewarded(() => {
          Storage.getDailyContract(ARTIFACT_TEMPLATES, true);
          this.scene.restart();
        });
      });

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

    // Левая колонка: жёсткое ограничение ширины текста, чтобы не наползал на правую кнопку
    const leftTextMaxW = boxW - 110;

    this.add.text(leftEdge + padX, y - 22, '📜 СРОЧНЫЙ ЗАКАЗ МУЗЕЯ', {
      fontSize: '11px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      wordWrap: { width: leftTextMaxW },
      resolution: textRes
    }).setOrigin(0, 0.5);

    this.add.text(leftEdge + padX, y, contract.title || contract.name, {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      wordWrap: { width: leftTextMaxW },
      resolution: textRes
    }).setOrigin(0, 0.5);

    this.add.text(leftEdge + padX, y + 22, `+${contract.rewardCoins} 🪙  |  +${contract.bonusXP} XP`, {
      fontSize: '11px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0, 0.5);

    // Правая колонка: таймер и кнопка ВЗЯТЬ строго с отступом 14px от правого края
    const btnW = 72;
    const btnH = 28;
    const btnX = rightEdge - padX - btnW / 2;
    const btnY = y + 11;

    const timerTxt = this.add.text(btnX, y - 19, '00:00:00', {
      fontSize: '11px',
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
        timerTxt.setText(this.formatTimeRemaining(rem));
      }
    };

    this.time.addEvent({ delay: 1000, loop: true, callback: updateTimer });
    updateTimer();

    const takeGfx = this.add.graphics();
    takeGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
    takeGfx.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
    takeGfx.lineStyle(1, 0xfef08a, 0.95);
    takeGfx.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);

    this.add.text(btnX, btnY, 'ВЗЯТЬ', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    hitBox.on('pointerdown', () => {
      if (this.isModalOpen) return;
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('RestoreScene', {
        regionId: contract.regionId,
        templateId: contract.templateId,
        contract
      });
    });
  }

  checkOfflineEarnings(width, height, textRes, FONT_UI) {
    const offline = Storage.getOfflineEarnings();
    if (!offline || offline.coins <= 0) return;

    this.isModalOpen = true;
    if (AudioManager.playShine) AudioManager.playShine();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x080503, 0.88)
      .setDepth(110)
      .setInteractive();

    const box = this.add.container(width / 2, height / 2).setDepth(111);
    const boxW = width * 0.86;
    const boxH = 252; // Увеличена высота, чтобы снизу оставался аккуратный зазор 18px

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x24180f, 0x24180f, 0x160f0a, 0x160f0a, 0.98);
    bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 14);
    bg.lineStyle(1.5, 0xc89d54, 0.9);
    bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 14);

    const title = this.add.text(0, -boxH / 2 + 28, '🏛 ДОХОД МУЗЕЯ ЗА ОТСУТСТВИЕ', {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    const desc = this.add.text(0, -boxH / 2 + 68, `Пока вас не было (${offline.minutes} мин),\nпосетители оставили в казне:`, {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#f5e6c8',
      align: 'center',
      lineSpacing: 4,
      resolution: textRes
    }).setOrigin(0.5);

    const sumTxt = this.add.text(0, -boxH / 2 + 114, `+${offline.coins} 🪙`, {
      fontSize: '22px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    const btnW = boxW * 0.84;

    // Кнопка обычного сбора
    const claimY = boxH / 2 - 74;
    const claimGfx = this.add.graphics();
    claimGfx.fillStyle(0x332215, 1);
    claimGfx.fillRoundedRect(-btnW / 2, claimY - 18, btnW, 36, 9);
    claimGfx.lineStyle(1, 0xc89d54, 0.9);
    claimGfx.strokeRoundedRect(-btnW / 2, claimY - 18, btnW, 36, 9);

    const claimHit = this.add.zone(0, claimY, btnW, 36).setInteractive({ useHandCursor: true });
    const claimTxt = this.add.text(0, claimY, `ЗАБРАТЬ ${offline.coins} 🪙`, {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    // Кнопка x2 за рекламу с чистым отступом 18px от нижней рамки
    const adY = boxH / 2 - 30;
    const adGfx = this.add.graphics();
    adGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
    adGfx.fillRoundedRect(-btnW / 2, adY - 18, btnW, 36, 9);
    adGfx.lineStyle(1, 0xfef08a, 0.95);
    adGfx.strokeRoundedRect(-btnW / 2, adY - 18, btnW, 36, 9);

    const adHit = this.add.zone(0, adY, btnW, 36).setInteractive({ useHandCursor: true });
    const adTxt = this.add.text(0, adY, `🎬 ЗАБРАТЬ x2 (${offline.coins * 2} 🪙)`, {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    claimHit.on('pointerup', () => {
      Storage.addCoins(offline.coins);
      if (AudioManager.playCoin) AudioManager.playCoin();
      box.destroy();
      overlay.destroy();
      this.isModalOpen = false;
      this.scene.restart();
    });

    adHit.on('pointerup', () => {
      YandexSDK.showRewarded(() => {
        Storage.addCoins(offline.coins * 2);
        if (AudioManager.playCoin) AudioManager.playCoin();
        box.destroy();
        overlay.destroy();
        this.isModalOpen = false;
        this.scene.restart();
      });
    });

    box.add([bg, title, desc, sumTxt, claimGfx, claimTxt, claimHit, adGfx, adTxt, adHit]);
  }

  createAudioToggles(width, textRes) {
    const musicBtn = this.add.circle(width - 68, 28, 16, AudioManager.isMusicOn() ? 0x2b1d12 : 0x160f0a)
      .setStrokeStyle(1.5, AudioManager.isMusicOn() ? 0xc89d54 : 0x7f1d1d, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    const musicIcon = this.add.text(width - 68, 28, AudioManager.isMusicOn() ? '🎵' : '🔇', {
      fontSize: '14px',
      resolution: textRes
    }).setOrigin(0.5).setDepth(31);

    musicBtn.on('pointerdown', () => {
      if (this.isModalOpen) return;
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
      fontSize: '14px',
      resolution: textRes
    }).setOrigin(0.5).setDepth(31);

    sfxBtn.on('pointerdown', () => {
      if (this.isModalOpen) return;
      const state = AudioManager.toggleSfx();
      sfxBtn.setFillStyle(state ? 0x2b1d12 : 0x160f0a);
      sfxBtn.setStrokeStyle(1.5, state ? 0xc89d54 : 0x7f1d1d, 0.9);
      sfxIcon.setText(state ? '🔊' : '🔈');
      if (AudioManager.playClick) AudioManager.playClick();
    });
  }
}
