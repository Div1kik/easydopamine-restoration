import { REGIONS, ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { YandexSDK } from '../utils/YandexSDK.js';

export class EraSelectScene extends Phaser.Scene {
  constructor() {
    super('EraSelectScene');
  }

  create() {
    const { width, height } = this.scale;
    const textRes = 3;
    this.textRes = textRes;

    const FONT_TITLE = '"Cormorant Garamond", Georgia, serif';
    const FONT_UI = '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.FONT_UI = FONT_UI;

    if (this.textures.exists('expedition_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'expedition_bg').setDepth(0);
      bg.setScale(Math.max(width / bg.width, height / bg.height));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0906, 0.25).setDepth(0);
    } else {
      const bg = this.add.graphics().setDepth(0);
      bg.fillGradientStyle(0x21160d, 0x21160d, 0x0d0805, 0x0d0805, 1);
      bg.fillRect(0, 0, width, height);
    }

    const levelData = Storage.getLevelData();
    const coins = Storage.getCoins();

    this.eras = REGIONS.map((region) => {
      const req = Storage.REGION_UNLOCK_REQS[region.id] || { minLevel: 1, cost: 0, expeditionCost: 100 };
      const isUnlocked = Storage.isRegionUnlocked(region.id);
      return {
        ...region,
        unlocked: isUnlocked,
        levelReached: levelData.level >= req.minLevel,
        requiredLevel: req.minLevel,
        unlockCost: req.cost,
        cost: req.expeditionCost || 100
      };
    });

    this.selectedEraIndex = 0;

    if (this.eras[0] && AudioManager.playEraMusic) {
      AudioManager.playEraMusic(this.eras[0].id);
    }

    // Верхняя шапка
    const headerBg = this.add.graphics().setDepth(18);
    headerBg.fillGradientStyle(0x24180f, 0x24180f, 0x140d08, 0x140d08, 0.88);
    headerBg.fillRect(0, 0, width, 114);
    headerBg.lineStyle(1.5, 0xc89d54, 0.65);
    headerBg.lineBetween(0, 114, width, 114);

    this.add.text(width / 2, 22, '🧭 КАРТА ЭКСПЕДИЦИЙ', {
      fontSize: '20px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      resolution: textRes
    }).setOrigin(0.5).setDepth(20);

    this.subInfoText = this.add.text(
      width / 2,
      48,
      `Ур. ${levelData.level} (${levelData.title})  |  Казна: ${coins} 🪙`,
      {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: '#e2b866',
        fontStyle: 'bold',
        resolution: textRes
      }
    ).setOrigin(0.5).setDepth(20);

    // Кнопка сброса в углу
    const resetGfx = this.add.graphics().setDepth(24);
    resetGfx.fillStyle(0x2b1512, 0.9);
    resetGfx.fillRoundedRect(width - 50, 16, 32, 32, 8);
    resetGfx.lineStyle(1.2, 0xf87171, 0.85);
    resetGfx.strokeRoundedRect(width - 50, 16, 32, 32, 8);

    const resetBtn = this.add.zone(width - 34, 32, 32, 32)
      .setInteractive({ useHandCursor: true })
      .setDepth(26);

    this.add.text(width - 34, 32, '🗑', {
      fontSize: '14px',
      resolution: textRes
    }).setOrigin(0.5).setDepth(25);

    resetBtn.on('pointerdown', () => this.showResetModal());

    this.createScrollableTabs(width, 86);

    this.listTopY = 120;
    this.listBottomY = height - 68;
    this.listHeight = this.listBottomY - this.listTopY;

    this.listContainer = this.add.container(0, this.listTopY).setDepth(5);

    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.listTopY, width, this.listHeight);
    this.listContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

    this.setupVerticalScroll();
    this.renderArtifactsList();

    // Нижняя панель с кнопкой возврата
    const footerBg = this.add.graphics().setDepth(30);
    footerBg.fillGradientStyle(0x1f140c, 0x1f140c, 0x120b07, 0x120b07, 0.90);
    footerBg.fillRect(0, height - 66, width, 66);
    footerBg.lineStyle(1.5, 0xc89d54, 0.65);
    footerBg.lineBetween(0, height - 66, width, height - 66);

    const btnW = width * 0.88;
    const btnH = 44;
    const btnY = height - 33;

    const backGfx = this.add.graphics().setDepth(31);
    backGfx.fillGradientStyle(0x332215, 0x332215, 0x1e130b, 0x1e130b, 0.96);
    backGfx.fillRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 11);
    backGfx.lineStyle(1.5, 0xc89d54, 0.9);
    backGfx.strokeRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 11);

    const backZone = this.add.zone(width / 2, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .setDepth(33);

    this.add.text(width / 2, btnY, 'В главное меню', {
      fontSize: '14px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5).setDepth(32);

    backZone.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });
  }

  updateHeader() {
    const levelData = Storage.getLevelData();
    const coins = Storage.getCoins();
    this.subInfoText.setText(`Ур. ${levelData.level} (${levelData.title})  |  Казна: ${coins} 🪙`);
  }

  createScrollableTabs(width, y) {
    if (this.tabsScrollContainer) this.tabsScrollContainer.destroy();

    this.tabsScrollContainer = this.add.container(0, y).setDepth(20);

    const tabWidth = 104;
    const tabHeight = 32;
    const spacing = 8;
    const startX = 16;

    const shortNames = {
      egypt: 'Египет',
      antique: 'Античность',
      europe: 'Европа',
      japan: 'Япония',
      aztec: 'Ацтеки',
      vikings: 'Викинги',
      renaissance: 'Ренессанс'
    };

    this.tabButtons = [];
    const totalTabsWidth = startX + this.eras.length * (tabWidth + spacing);
    const minScrollX = Math.min(0, width - totalTabsWidth - 16);

    let tabDragStartX = 0;
    let tabInitialX = 0;
    let isDraggingTabs = false;

    this.eras.forEach((era, i) => {
      const tabX = startX + i * (tabWidth + spacing) + tabWidth / 2;
      const isSelected = (i === this.selectedEraIndex);

      const gfx = this.add.graphics();
      const drawTab = (selected) => {
        gfx.clear();
        gfx.fillStyle(selected ? 0xd99b26 : 0x24180f, selected ? 0.96 : 0.82);
        gfx.fillRoundedRect(tabX - tabWidth / 2, -tabHeight / 2, tabWidth, tabHeight, 8);
        gfx.lineStyle(selected ? 1.5 : 1, selected ? 0xfef08a : 0x8c6239, 0.9);
        gfx.strokeRoundedRect(tabX - tabWidth / 2, -tabHeight / 2, tabWidth, tabHeight, 8);
      };
      drawTab(isSelected);

      const zone = this.add.zone(tabX, 0, tabWidth, tabHeight)
        .setInteractive({ useHandCursor: true });

      const labelStr = era.unlocked
        ? (shortNames[era.id] || era.name)
        : (era.levelReached ? `🔑 ${shortNames[era.id]}` : `🔒 Ур.${era.requiredLevel}`);

      const txt = this.add.text(tabX, 0, labelStr, {
        fontSize: '11.5px',
        fontFamily: this.FONT_UI,
        color: isSelected ? '#1a1004' : (era.unlocked ? '#fdf6e3' : (era.levelReached ? '#facc15' : '#9c8265')),
        fontStyle: 'bold',
        resolution: this.textRes
      }).setOrigin(0.5);

      zone.on('pointerdown', (pointer) => {
        tabDragStartX = pointer.x;
        tabInitialX = this.tabsScrollContainer.x;
        isDraggingTabs = false;
      });

      zone.on('pointermove', (pointer) => {
        if (pointer.isDown) {
          const dx = pointer.x - tabDragStartX;
          if (Math.abs(dx) > 6) {
            isDraggingTabs = true;
            this.tabsScrollContainer.x = Phaser.Math.Clamp(tabInitialX + dx, minScrollX, 0);
          }
        }
      });

      zone.on('pointerup', () => {
        if (!isDraggingTabs) {
          if (AudioManager.playClick) AudioManager.playClick();
          this.selectedEraIndex = i;
          this.updateTabsVisual();
          this.renderArtifactsList();

          if (era.unlocked && AudioManager.playEraMusic) {
            AudioManager.playEraMusic(era.id);
          }
        }
      });

      this.tabsScrollContainer.add([gfx, txt, zone]);
      this.tabButtons.push({ drawTab, txt, era, index: i, shortNames });
    });
  }

  updateTabsVisual() {
    this.tabButtons.forEach((item) => {
      const isSelected = (item.index === this.selectedEraIndex);
      item.drawTab(isSelected);
      item.txt.setColor(isSelected ? '#1a1004' : (item.era.unlocked ? '#fdf6e3' : (item.era.levelReached ? '#facc15' : '#9c8265')));
    });
  }

  setupVerticalScroll() {
    let startY = 0;
    let containerStartY = 0;
    this.isDraggingList = false;

    this.input.on('pointerdown', (p) => {
      if (p.y >= this.listTopY && p.y <= this.listBottomY) {
        startY = p.y;
        containerStartY = this.listContainer.y;
        this.isDraggingList = false;
      }
    });

    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      if (p.y >= this.listTopY && p.y <= this.listBottomY) {
        const dy = p.y - startY;
        if (Math.abs(dy) > 6) {
          this.isDraggingList = true;
        }
        this.listContainer.y = Phaser.Math.Clamp(
          containerStartY + dy,
          this.minListY || this.listTopY,
          this.listTopY
        );
      }
    });
  }

  renderArtifactsList() {
    this.listContainer.removeAll(true);
    this.listContainer.y = this.listTopY;

    const { width } = this.scale;
    const textRes = this.textRes;
    const FONT_UI = this.FONT_UI;
    const currentEra = this.eras[this.selectedEraIndex];
    this.updateHeader();

    // Если эпоха не открыта
    if (!currentEra.unlocked) {
      this.minListY = this.listTopY;
      const boxW = width * 0.90;
      const boxH = 190;

      const lockGfx = this.add.graphics();
      lockGfx.fillGradientStyle(0x261a10, 0x261a10, 0x160f0a, 0x160f0a, 0.85);
      lockGfx.fillRoundedRect(width / 2 - boxW / 2, 125 - boxH / 2, boxW, boxH, 14);
      lockGfx.lineStyle(1.5, currentEra.levelReached ? 0xfacc15 : 0xf87171, 0.85);
      lockGfx.strokeRoundedRect(width / 2 - boxW / 2, 125 - boxH / 2, boxW, boxH, 14);

      const lockTxt = this.add.text(
        width / 2,
        66,
        currentEra.levelReached ? '🔑 ЭПОХА ГОТОВА К ОТКРЫТИЮ' : '🔒 ЭПОХА ЗАБЛОКИРОВАНА',
        {
          fontSize: '14.5px',
          fontFamily: FONT_UI,
          color: currentEra.levelReached ? '#facc15' : '#fda4af',
          fontStyle: 'bold',
          resolution: textRes
        }
      ).setOrigin(0.5);

      const reqStr = currentEra.levelReached
        ? `Требуется лицензия гильдии для региона «${currentEra.name}».\nСтоимость открытия: ${currentEra.unlockCost} 🪙`
        : `Требуется ${currentEra.requiredLevel}-й уровень мастера.\nПовышайте ранг, реставрируя доступные реликвии!`;

      const reqTxt = this.add.text(width / 2, 114, reqStr, {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: boxW - 28 },
        resolution: textRes
      }).setOrigin(0.5);

      this.listContainer.add([lockGfx, lockTxt, reqTxt]);

      if (currentEra.levelReached) {
        const unlockBtnW = 216;
        const unlockBtnH = 40;
        const unlockGfx = this.add.graphics();
        unlockGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
        unlockGfx.fillRoundedRect(width / 2 - unlockBtnW / 2, 174 - unlockBtnH / 2, unlockBtnW, unlockBtnH, 10);
        unlockGfx.lineStyle(1.2, 0xfef08a, 0.95);
        unlockGfx.strokeRoundedRect(width / 2 - unlockBtnW / 2, 174 - unlockBtnH / 2, unlockBtnW, unlockBtnH, 10);

        const unlockZone = this.add.zone(width / 2, 174, unlockBtnW, unlockBtnH).setInteractive({ useHandCursor: true });
        const unlockLabel = this.add.text(width / 2, 174, `ОТКРЫТЬ ЗА ${currentEra.unlockCost} 🪙`, {
          fontSize: '13px',
          fontFamily: FONT_UI,
          color: '#1a1004',
          fontStyle: 'bold',
          resolution: textRes
        }).setOrigin(0.5);

        unlockZone.on('pointerdown', () => {
          if (Storage.unlockRegion(currentEra.id)) {
            if (AudioManager.playShine) AudioManager.playShine();
            currentEra.unlocked = true;
            this.createScrollableTabs(width, 86);
            this.renderArtifactsList();
          } else if (AudioManager.playBreakSnap) {
            AudioManager.playBreakSnap();
          }
        });

        this.listContainer.add([unlockGfx, unlockZone, unlockLabel]);
      }
      return;
    }

    // 1. Карточка снаряжения экспедиции (+ широкая кнопка за рекламу)
    const expW = width * 0.92;
    const expH = 92;
    const expY = 52;
    const expeditionBox = this.add.container(width / 2, expY);

    const expGfx = this.add.graphics();
    expGfx.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.78);
    expGfx.fillRoundedRect(-expW / 2, -expH / 2, expW, expH, 12);
    expGfx.lineStyle(1.5, 0xc89d54, 0.88);
    expGfx.strokeRoundedRect(-expW / 2, -expH / 2, expW, expH, 12);

    const textMaxW = expW - 144;
    const expTitle = this.add.text(-expW / 2 + 14, -22, '🧭 СНАРЯДИТЬ ЭКСПЕДИЦИЮ', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0, 0.5);

    const expDesc = this.add.text(-expW / 2 + 14, 10, 'Доставка 1–2 находок каждого вида на склад эпохи', {
      fontSize: '10.5px',
      fontFamily: FONT_UI,
      color: '#e6d5bc',
      wordWrap: { width: textMaxW },
      resolution: textRes
    }).setOrigin(0, 0.5);

    const fundBtnW = 112;
    const fundBtnX = expW / 2 - fundBtnW / 2 - 12;
    const fundBtnH = 34;

    const fundGfx = this.add.graphics();
    fundGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 0.98);
    fundGfx.fillRoundedRect(fundBtnX - fundBtnW / 2, -20 - fundBtnH / 2, fundBtnW, fundBtnH, 8);
    fundGfx.lineStyle(1, 0xfef08a, 0.95);
    fundGfx.strokeRoundedRect(fundBtnX - fundBtnW / 2, -20 - fundBtnH / 2, fundBtnW, fundBtnH, 8);

    const fundZone = this.add.zone(fundBtnX, -20, fundBtnW, fundBtnH)
      .setInteractive({ useHandCursor: true });

    const fundTxt = this.add.text(fundBtnX, -20, `${currentEra.cost} 🪙`, {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    fundZone.on('pointerdown', () => {
      if (this.isDraggingList) return;
      const success = Storage.fundExpedition(
        currentEra.id,
        currentEra.cost,
        ARTIFACT_TEMPLATES
      );
      if (success) {
        if (AudioManager.playCoin) AudioManager.playCoin();
        this.renderArtifactsList();
      } else if (AudioManager.playBreakSnap) {
        AudioManager.playBreakSnap();
      }
    });

    // Кнопка бесплатной экспедиции за рекламу (широкая, текст помещается с запасом)
    const adExpGfx = this.add.graphics();
    adExpGfx.fillStyle(0x1e3a8a, 0.98);
    adExpGfx.fillRoundedRect(fundBtnX - fundBtnW / 2, 20 - 15, fundBtnW, 30, 8);
    adExpGfx.lineStyle(1, 0x38bdf8, 0.95);
    adExpGfx.strokeRoundedRect(fundBtnX - fundBtnW / 2, 20 - 15, fundBtnW, 30, 8);

    const adExpZone = this.add.zone(fundBtnX, 20, fundBtnW, 30).setInteractive({ useHandCursor: true });
    const adExpTxt = this.add.text(fundBtnX, 20, '🎬 БЕСПЛАТНО', {
      fontSize: '10.5px',
      fontFamily: FONT_UI,
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    adExpZone.on('pointerdown', () => {
      if (this.isDraggingList) return;
      YandexSDK.showRewarded(() => {
        Storage.fundExpedition(currentEra.id, 0, ARTIFACT_TEMPLATES);
        if (AudioManager.playCoin) AudioManager.playCoin();
        this.renderArtifactsList();
      });
    });

    expeditionBox.add([expGfx, expTitle, expDesc, fundGfx, fundTxt, fundZone, adExpGfx, adExpTxt, adExpZone]);
    this.listContainer.add(expeditionBox);

    // 2. Список артефактов
    const eraArtifacts = ARTIFACT_TEMPLATES.filter((a) => a.regionId === currentEra.id);
    const stocks = Storage.getRegionStock(currentEra.id, ARTIFACT_TEMPLATES);

    const cardH = 96;
    const spacing = 10;
    const cardW = width * 0.92;
    const listOffsetY = 110;

    let touchDownTime = 0;
    let touchDownY = 0;

    eraArtifacts.forEach((art, index) => {
      const cardY = listOffsetY + index * (cardH + spacing) + cardH / 2;
      const countLeft = stocks[art.id] !== undefined ? stocks[art.id] : 0;
      const hasStock = countLeft > 0;

      const cardCont = this.add.container(width / 2, cardY);

      const cardGfx = this.add.graphics();
      cardGfx.fillGradientStyle(
        hasStock ? 0x261a10 : 0x160f0a,
        hasStock ? 0x261a10 : 0x160f0a,
        hasStock ? 0x170f09 : 0x110b07,
        hasStock ? 0x170f09 : 0x110b07,
        hasStock ? 0.72 : 0.50
      );
      cardGfx.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
      cardGfx.lineStyle(1.3, hasStock ? 0xc89d54 : 0x5c3d22, hasStock ? 0.88 : 0.5);
      cardGfx.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);

      cardGfx.fillStyle(0x0d0805, 0.45);
      cardGfx.fillRoundedRect(-cardW / 2 + 10, -34, 68, 68, 10);

      const texKey = this.textures.exists(art.textureKey) ? art.textureKey : 'art_egypt_scarab';
      const icon = this.add.image(-cardW / 2 + 44, 0, texKey)
        .setDisplaySize(58, 58)
        .setAlpha(hasStock ? 1 : 0.45);

      const title = this.add.text(-cardW / 2 + 88, -26, art.name, {
        fontSize: '13.5px',
        fontFamily: FONT_UI,
        color: hasStock ? '#fdf6e3' : '#9c8265',
        fontStyle: 'bold',
        wordWrap: { width: cardW - 155 },
        resolution: textRes
      });

      const stockBadgeColor = hasStock ? '#86efac' : '#fca5a5';
      const stockBadgeText = hasStock
        ? `📦 На складе: ${countLeft} шт.`
        : 'Склад пуст (нужна экспедиция)';

      const stockBadge = this.add.text(-cardW / 2 + 88, -3, stockBadgeText, {
        fontSize: '11px',
        fontFamily: FONT_UI,
        color: stockBadgeColor,
        fontStyle: 'bold',
        resolution: textRes
      });

      const takeBtnText = hasStock ? '⚒ ВЗЯТЬ НА ВЕРСТАК ›' : 'Нет в наличии';
      const takeBtn = this.add.text(-cardW / 2 + 88, 21, takeBtnText, {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: hasStock ? '#facc15' : '#7a6552',
        fontStyle: 'bold',
        resolution: textRes
      });

      const valueBadge = this.add.text(cardW / 2 - 14, -22, `${art.marketValue || 100} 🪙`, {
        fontSize: '12.5px',
        fontFamily: FONT_UI,
        color: hasStock ? '#facc15' : '#7a6552',
        fontStyle: 'bold',
        resolution: textRes
      }).setOrigin(1, 0);

      const hitZone = this.add.zone(0, 0, cardW, cardH)
        .setInteractive({ useHandCursor: hasStock });

      hitZone.on('pointerdown', (p) => {
        touchDownTime = this.time.now;
        touchDownY = p.y;
      });

      hitZone.on('pointerup', (p) => {
        const moveDist = Math.abs(p.y - touchDownY);
        const elapsed = this.time.now - touchDownTime;

        if (!this.isDraggingList && moveDist < 10 && elapsed < 450 && hasStock) {
          Storage.setActiveSession(currentEra.id, art.id);
          if (AudioManager.playClick) AudioManager.playClick();
          this.scene.start('RestoreScene', {
            regionId: currentEra.id,
            templateId: art.id
          });
        }
      });

      cardCont.add([cardGfx, icon, title, stockBadge, takeBtn, valueBadge, hitZone]);
      this.listContainer.add(cardCont);
    });

    const totalContentHeight = listOffsetY + eraArtifacts.length * (cardH + spacing) + 30;
    this.minListY = Math.min(this.listTopY, this.listBottomY - totalContentHeight);
  }

  showResetModal() {
    const { width, height } = this.scale;
    const textRes = this.textRes;
    const FONT_UI = this.FONT_UI;

    const modalCont = this.add.container(0, 0).setDepth(100);

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x080503, 0.85)
      .setInteractive();

    const boxW = width * 0.84;
    const boxH = 210;

    const boxGfx = this.add.graphics();
    boxGfx.fillGradientStyle(0x24180f, 0x24180f, 0x160f0a, 0x160f0a, 0.98);
    boxGfx.fillRoundedRect(width / 2 - boxW / 2, height / 2 - boxH / 2, boxW, boxH, 14);
    boxGfx.lineStyle(1.5, 0xf87171, 0.9);
    boxGfx.strokeRoundedRect(width / 2 - boxW / 2, height / 2 - boxH / 2, boxW, boxH, 14);

    const title = this.add.text(width / 2, height / 2 - 68, '⚠️ СБРОС ПРОГРЕССА', {
      fontSize: '15px',
      fontFamily: FONT_UI,
      color: '#fda4af',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    const msg = this.add.text(
      width / 2,
      height / 2 - 14,
      'Все отреставрированные артефакты,\nмонеты, открытые эпохи и улучшения\nбудут удалены безвозвратно.',
      {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#f5e6c8',
        align: 'center',
        lineSpacing: 4,
        resolution: textRes
      }
    ).setOrigin(0.5);

    const confirmGfx = this.add.graphics();
    confirmGfx.fillStyle(0xb91c1c, 1);
    confirmGfx.fillRoundedRect(width / 2 - 64 - 55, height / 2 + 56 - 18, 110, 36, 9);
    confirmGfx.lineStyle(1, 0xfca5a5, 0.9);
    confirmGfx.strokeRoundedRect(width / 2 - 64 - 55, height / 2 + 56 - 18, 110, 36, 9);

    const confirmZone = this.add.zone(width / 2 - 64, height / 2 + 56, 110, 36)
      .setInteractive({ useHandCursor: true });

    const confirmTxt = this.add.text(width / 2 - 64, height / 2 + 56, 'СБРОСИТЬ', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    confirmZone.on('pointerdown', () => {
      localStorage.clear();
      window.location.reload();
    });

    const cancelGfx = this.add.graphics();
    cancelGfx.fillStyle(0x332215, 1);
    cancelGfx.fillRoundedRect(width / 2 + 64 - 55, height / 2 + 56 - 18, 110, 36, 9);
    cancelGfx.lineStyle(1, 0xc89d54, 0.9);
    cancelGfx.strokeRoundedRect(width / 2 + 64 - 55, height / 2 + 56 - 18, 110, 36, 9);

    const cancelZone = this.add.zone(width / 2 + 64, height / 2 + 56, 110, 36)
      .setInteractive({ useHandCursor: true });

    const cancelTxt = this.add.text(width / 2 + 64, height / 2 + 56, 'ОТМЕНА', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    cancelZone.on('pointerdown', () => {
      modalCont.destroy();
    });

    modalCont.add([
      overlay,
      boxGfx,
      title,
      msg,
      confirmGfx,
      confirmTxt,
      confirmZone,
      cancelGfx,
      cancelTxt,
      cancelZone
    ]);
  }
}
