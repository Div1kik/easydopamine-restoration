import { REGIONS, ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class EraSelectScene extends Phaser.Scene {
  constructor() {
    super('EraSelectScene');
  }

  create() {
    const { width, height } = this.scale;
    const textRes = 2;
    this.textRes = textRes;

    const FONT_TITLE = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';
    const FONT_UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    this.FONT_UI = FONT_UI;

    // 1. Фон экрана экспедиций (стол картографа с лёгким затемнением)
    if (this.textures.exists('expedition_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'expedition_bg').setDepth(0);
      bg.setScale(Math.max(width / bg.width, height / bg.height));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0906, 0.25).setDepth(0);
    } else {
      const bg = this.add.graphics().setDepth(0);
      bg.fillGradientStyle(0x21160d, 0x21160d, 0x0d0805, 0x0d0805, 1);
      bg.fillRect(0, 0, width, height);
    }

    const levelData = Storage.getLevelData ? Storage.getLevelData() : { level: 1, title: 'Ученик' };
    const coins = Storage.getCoins ? Storage.getCoins() : 0;

    // Сниженная стартовая цена для Египта (90 монет)
    const expeditionCosts = {
      egypt: 90,
      antique: 220,
      europe: 550,
      japan: 1100,
      aztec: 2000,
      vikings: 3000,
      renaissance: 5000
    };

    const requiredLevels = [1, 3, 6, 8, 10, 12];
    this.eras = REGIONS.map((region, idx) => {
      const needLvl = requiredLevels[idx] !== undefined ? requiredLevels[idx] : (idx * 3 + 1);
      return {
        ...region,
        unlocked: levelData.level >= needLvl,
        requiredLevel: needLvl,
        cost: expeditionCosts[region.id] || 100
      };
    });

    this.selectedEraIndex = 0;
    this.tabsScrollX = 0;

    if (this.eras[0] && AudioManager.playEraMusic) {
      AudioManager.playEraMusic(this.eras[0].id);
    }

    // 2. Полупрозрачная верхняя шапка
    const headerBg = this.add.graphics().setDepth(18);
    headerBg.fillGradientStyle(0x24180f, 0x24180f, 0x140d08, 0x140d08, 0.84);
    headerBg.fillRect(0, 0, width, 114);
    headerBg.lineStyle(1.5, 0xc89d54, 0.65);
    headerBg.lineBetween(0, 114, width, 114);

    this.add.text(width / 2, 24, '🧭 КАРТА ЭКСПЕДИЦИЙ', {
      fontSize: '18px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      resolution: textRes
    }).setOrigin(0.5).setDepth(20);

    this.subInfoText = this.add.text(
      width / 2,
      49,
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
    resetGfx.fillRoundedRect(width - 52, 18, 32, 32, 8);
    resetGfx.lineStyle(1.2, 0xf87171, 0.85);
    resetGfx.strokeRoundedRect(width - 52, 18, 32, 32, 8);

    const resetBtn = this.add.zone(width - 36, 34, 32, 32)
      .setInteractive({ useHandCursor: true })
      .setDepth(26);

    this.add.text(width - 36, 34, '🗑', {
      fontSize: '14px',
      resolution: textRes
    }).setOrigin(0.5).setDepth(25);

    resetBtn.on('pointerdown', () => this.showResetModal());

    // 3. Горизонтальные вкладки эпох
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

    // 4. Нижняя полупрозрачная панель с кнопкой возврата
    const footerBg = this.add.graphics().setDepth(30);
    footerBg.fillGradientStyle(0x1f140c, 0x1f140c, 0x120b07, 0x120b07, 0.88);
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
    const levelData = Storage.getLevelData ? Storage.getLevelData() : { level: 1, title: 'Ученик' };
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.subInfoText.setText(`Ур. ${levelData.level} (${levelData.title})  |  Казна: ${coins} 🪙`);
  }

  createScrollableTabs(width, y) {
    if (this.tabsScrollContainer) this.tabsScrollContainer.destroy();

    this.tabsScrollContainer = this.add.container(0, y).setDepth(20);

    const tabWidth = 98;
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
        : `🔒 Ур.${era.requiredLevel}`;

      const txt = this.add.text(tabX, 0, labelStr, {
        fontSize: '11px',
        fontFamily: this.FONT_UI,
        color: isSelected ? '#1a1004' : (era.unlocked ? '#fdf6e3' : '#9c8265'),
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
      this.tabButtons.push({ drawTab, txt, era, index: i });
    });
  }

  updateTabsVisual() {
    this.tabButtons.forEach((item) => {
      const isSelected = (item.index === this.selectedEraIndex);
      item.drawTab(isSelected);
      item.txt.setColor(isSelected ? '#1a1004' : (item.era.unlocked ? '#fdf6e3' : '#9c8265'));
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

    // Если эпоха закрыта по уровню
    if (!currentEra.unlocked) {
      this.minListY = this.listTopY;
      const boxW = width * 0.88;
      const boxH = 144;

      const lockGfx = this.add.graphics();
      lockGfx.fillGradientStyle(0x261a10, 0x261a10, 0x160f0a, 0x160f0a, 0.72);
      lockGfx.fillRoundedRect(width / 2 - boxW / 2, 108 - boxH / 2, boxW, boxH, 14);
      lockGfx.lineStyle(1.5, 0xf87171, 0.8);
      lockGfx.strokeRoundedRect(width / 2 - boxW / 2, 108 - boxH / 2, boxW, boxH, 14);

      const lockTxt = this.add.text(width / 2, 80, '🔒 ЭПОХА ЗАБЛОКИРОВАНА', {
        fontSize: '15px',
        fontFamily: FONT_UI,
        color: '#fda4af',
        fontStyle: 'bold',
        resolution: textRes
      }).setOrigin(0.5);

      const reqTxt = this.add.text(
        width / 2,
        118,
        `Требуется ${currentEra.requiredLevel}-й уровень мастера.\nПовышайте ранг, реставрируя доступные реликвии!`,
        {
          fontSize: '12px',
          fontFamily: FONT_UI,
          color: '#e6d5bc',
          align: 'center',
          lineSpacing: 4,
          resolution: textRes
        }
      ).setOrigin(0.5);

      this.listContainer.add([lockGfx, lockTxt, reqTxt]);
      return;
    }

    // 1. Полупрозрачная карточка снаряжения экспедиции
    const expW = width * 0.90;
    const expH = 84;
    const expY = 48;
    const expeditionBox = this.add.container(width / 2, expY);

    const expGfx = this.add.graphics();
    expGfx.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.62);
    expGfx.fillRoundedRect(-expW / 2, -expH / 2, expW, expH, 12);
    expGfx.lineStyle(1.5, 0xc89d54, 0.88);
    expGfx.strokeRoundedRect(-expW / 2, -expH / 2, expW, expH, 12);

    const expTitle = this.add.text(-expW / 2 + 14, -15, '🧭 СНАРЯДИТЬ ЭКСПЕДИЦИЮ В РЕГИОН', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0, 0.5);

    const expDesc = this.add.text(-expW / 2 + 14, 10, 'Доставка 1–2 случайных находок на склад эпохи', {
      fontSize: '10px',
      fontFamily: FONT_UI,
      color: '#e6d5bc',
      resolution: textRes
    }).setOrigin(0, 0.5);

    const fundBtnX = expW / 2 - 48;
    const fundBtnW = 82;
    const fundBtnH = 34;

    const fundGfx = this.add.graphics();
    fundGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 0.98);
    fundGfx.fillRoundedRect(fundBtnX - fundBtnW / 2, -fundBtnH / 2, fundBtnW, fundBtnH, 8);
    fundGfx.lineStyle(1, 0xfef08a, 0.95);
    fundGfx.strokeRoundedRect(fundBtnX - fundBtnW / 2, -fundBtnH / 2, fundBtnW, fundBtnH, 8);

    const fundZone = this.add.zone(fundBtnX, 0, fundBtnW, fundBtnH)
      .setInteractive({ useHandCursor: true });

    const fundTxt = this.add.text(fundBtnX, 0, `${currentEra.cost} 🪙`, {
      fontSize: '12px',
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
      } else {
        if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
      }
    });

    expeditionBox.add([expGfx, expTitle, expDesc, fundGfx, fundTxt, fundZone]);
    this.listContainer.add(expeditionBox);

    // 2. Список артефактов с учётом запасов на складе (полупрозрачные карточки на фоне стола)
    const eraArtifacts = ARTIFACT_TEMPLATES.filter((a) => a.regionId === currentEra.id);
    const stocks = Storage.getRegionStock(currentEra.id, ARTIFACT_TEMPLATES);

    const cardH = 92;
    const spacing = 10;
    const cardW = width * 0.90;
    const listOffsetY = 100;

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
        hasStock ? 0.56 : 0.42
      );
      cardGfx.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
      cardGfx.lineStyle(1.3, hasStock ? 0xc89d54 : 0x5c3d22, hasStock ? 0.88 : 0.5);
      cardGfx.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);

      // Лёгкая тёмная подложка слева под иконку артефакта
      cardGfx.fillStyle(0x0d0805, 0.45);
      cardGfx.fillRoundedRect(-cardW / 2 + 10, -34, 68, 68, 10);

      const texKey = this.textures.exists(art.textureKey) ? art.textureKey : 'art_egypt_scarab';
      const icon = this.add.image(-cardW / 2 + 44, 0, texKey)
        .setDisplaySize(58, 58)
        .setAlpha(hasStock ? 1 : 0.45);

      const title = this.add.text(-cardW / 2 + 90, -24, art.name, {
        fontSize: '13.5px',
        fontFamily: FONT_UI,
        color: hasStock ? '#fdf6e3' : '#9c8265',
        fontStyle: 'bold',
        resolution: textRes
      });

      const stockBadgeColor = hasStock ? '#86efac' : '#fca5a5';
      const stockBadgeText = hasStock
        ? `📦 В наличии: ${countLeft} шт.`
        : 'Запасы иссякли (нужна экспедиция)';

      const stockBadge = this.add.text(-cardW / 2 + 90, -4, stockBadgeText, {
        fontSize: '11px',
        fontFamily: FONT_UI,
        color: stockBadgeColor,
        fontStyle: 'bold',
        resolution: textRes
      });

      const takeBtnText = hasStock ? '⚒ ВЗЯТЬ НА ВЕРСТАК ›' : 'Склад пуст';
      const takeBtn = this.add.text(-cardW / 2 + 90, 20, takeBtnText, {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: hasStock ? '#facc15' : '#7a6552',
        fontStyle: 'bold',
        resolution: textRes
      });

      const valueBadge = this.add.text(cardW / 2 - 14, -20, `${art.marketValue || 100} 🪙`, {
        fontSize: '11.5px',
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

    // Кнопка "Сбросить"
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

    // Кнопка "Отмена"
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
