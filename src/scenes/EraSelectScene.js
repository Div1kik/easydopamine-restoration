import { REGIONS, ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class EraSelectScene extends Phaser.Scene {
  constructor() {
    super('EraSelectScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x07090e).setDepth(0);

    const levelData = Storage.getLevelData ? Storage.getLevelData() : { level: 1, title: 'Ученик' };
    const coins = Storage.getCoins ? Storage.getCoins() : 0;

    // Стоимость снаряжения экспедиции по эпохам
    const expeditionCosts = {
      egypt: 120,
      antique: 280,
      europe: 600,
      japan: 1200,
      aztec: 2200,
      vikings: 4000,
      renaissance: 7500
    };

    const requiredLevels = [1, 2, 4, 6, 8, 10, 12];
    this.eras = REGIONS.map((region, idx) => {
      const needLvl = requiredLevels[idx] !== undefined ? requiredLevels[idx] : (idx * 2 + 1);
      return {
        ...region,
        unlocked: levelData.level >= needLvl,
        requiredLevel: needLvl,
        cost: expeditionCosts[region.id] || 500
      };
    });

    this.selectedEraIndex = 0;
    this.scrollX = 0;

    if (this.eras[0] && AudioManager.playEraMusic) {
      AudioManager.playEraMusic(this.eras[0].id);
    }

    // Шапка
    this.add.text(width / 2, 34, 'КАРТА ЭКСПЕДИЦИЙ', {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(20);

    this.subInfoText = this.add.text(
      width / 2,
      56,
      `Ур. ${levelData.level} • ${levelData.title}  |  Казна: ${coins} 🪙`,
      {
        fontSize: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(20);

    // Кнопка сброса (для тестов)
    const resetBtn = this.add.rectangle(width - 36, 36, 32, 32, 0x1f1424)
      .setStrokeStyle(1.5, 0xef4444, 0.8)
      .setInteractive({ useHandCursor: true })
      .setDepth(25);

    this.add.text(width - 36, 36, '🗑️', { fontSize: '13px' })
      .setOrigin(0.5).setDepth(26);

    resetBtn.on('pointerdown', () => this.showResetModal());

    this.createScrollableTabs(width, 89);

    this.listTopY = 138;
    this.listBottomY = height - 68;
    this.listHeight = this.listBottomY - this.listTopY;

    this.listContainer = this.add.container(0, this.listTopY).setDepth(5);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.listTopY, width, this.listHeight);
    this.listContainer.setMask(maskShape.createGeometryMask());

    this.setupVerticalScroll();
    this.renderArtifactsList();

    // Нижняя плашка
    this.add.rectangle(width / 2, height - 34, width, 68, 0x07090e).setDepth(30);

    const backBtn = this.add.rectangle(width / 2, height - 34, width * 0.88, 44, 0x141a24)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(31);

    this.add.text(width / 2, height - 34, 'В главное меню', {
      fontSize: '14.5px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(32);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });
  }

  updateHeader() {
    const levelData = Storage.getLevelData ? Storage.getLevelData() : { level: 1, title: 'Ученик' };
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.subInfoText.setText(`Ур. ${levelData.level} • ${levelData.title}  |  Казна: ${coins} 🪙`);
  }

  createScrollableTabs(width, y) {
    if (this.tabsScrollContainer) this.tabsScrollContainer.destroy();

    this.tabsScrollContainer = this.add.container(0, y).setDepth(20);

    const tabWidth = 96;
    const spacing = 8;
    const startX = 14;

    const shortNames = ['Египет', 'Античность', 'Европа', 'Япония', 'Ацтеки', 'Викинги', 'Ренессанс'];

    this.tabButtons = [];
    const totalTabsWidth = startX + this.eras.length * (tabWidth + spacing);
    const minScrollX = Math.min(0, width - totalTabsWidth);

    let tabDragStartX = 0;
    let tabInitialX = 0;
    let isDraggingTabs = false;

    this.eras.forEach((era, i) => {
      const tabX = startX + i * (tabWidth + spacing) + tabWidth / 2;
      const isSelected = (i === this.selectedEraIndex);

      const bg = this.add.rectangle(tabX, 16, tabWidth, 34, isSelected ? 0xd4af37 : 0x111622)
        .setStrokeStyle(1.5, isSelected ? 0xefbe08 : 0x222e3d, 0.9)
        .setInteractive({ useHandCursor: true });

      const lockPrefix = era.unlocked ? '' : '🔒 ';
      const titleStr = `${lockPrefix}${shortNames[i] || era.name}`;

      const text = this.add.text(tabX, 16, titleStr, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: isSelected ? '#000000' : (era.unlocked ? '#94a3b8' : '#475569'),
        fontStyle: 'bold'
      }).setOrigin(0.5);

      bg.on('pointerdown', (pointer) => {
        tabDragStartX = pointer.x;
        tabInitialX = this.tabsScrollContainer.x;
        isDraggingTabs = false;
      });

      bg.on('pointermove', (pointer) => {
        if (!pointer.isDown) return;
        const ds = pointer.x - tabDragStartX;
        if (Math.abs(ds) > 4) {
          isDraggingTabs = true;
          this.tabsScrollContainer.x = Phaser.Math.Clamp(tabInitialX + ds, minScrollX, 0);
        }
      });

      bg.on('pointerup', () => {
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

      this.tabsScrollContainer.add([bg, text]);
      this.tabButtons.push({ bg, text, era, index: i });
    });
  }

  updateTabsVisual() {
    this.tabButtons.forEach(item => {
      const isSelected = (item.index === this.selectedEraIndex);
      item.bg.setFillStyle(isSelected ? 0xd4af37 : 0x111622);
      item.bg.setStrokeStyle(1.5, isSelected ? 0xefbe08 : 0x222e3d);
      item.text.setColor(
        isSelected ? '#000000' : (item.era.unlocked ? '#94a3b8' : '#475569')
      );
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
    const currentEra = this.eras[this.selectedEraIndex];
    this.updateHeader();

    if (!currentEra.unlocked) {
      this.minListY = this.listTopY;
      const lockBox = this.add.rectangle(
        width / 2,
        100,
        width * 0.88,
        140,
        0x111622
      ).setStrokeStyle(1.5, 0xef4444, 0.6);

      const lockTxt = this.add.text(width / 2, 80, '🔒 ЭПОХА ЗАБЛОКИРОВАНА', {
        fontSize: '15px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ef4444',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const reqTxt = this.add.text(
        width / 2,
        114,
        `Требуется ${currentEra.requiredLevel} уровень мастера.\nПовышайте ранг, реставрируя доступные реликвии!`,
        {
          fontSize: '12.5px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#94a3b8',
          align: 'center',
          lineSpacing: 4
        }
      ).setOrigin(0.5);

      this.listContainer.add([lockBox, lockTxt, reqTxt]);
      return;
    }

    // 1. Плашка снаряжения экспедиции
    const expeditionBox = this.add.container(width / 2, 36);
    const expBg = this.add.rectangle(0, 0, width * 0.90, 60, 0x141b2a)
      .setStrokeStyle(1.5, 0x3b82f6, 0.8);

    const expTitle = this.add.text(-width * 0.45 + 14, -14, `СНАРЯДИТЬ ЭКСПЕДИЦИЮ В ${currentEra.name.toUpperCase()}`, {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#93c5fd',
      fontStyle: 'bold'
    });

    const expDesc = this.add.text(-width * 0.45 + 14, 6, `Доставка 1-3 случайных находок каждого типа`, {
      fontSize: '10px',
      fontFamily: 'sans-serif',
      color: '#94a3b8'
    });

    const fundBtn = this.add.rectangle(width * 0.45 - 54, 0, 92, 34, 0x1d4ed8)
      .setStrokeStyle(1, 0x60a5fa)
      .setInteractive({ useHandCursor: true });

    const fundTxt = this.add.text(width * 0.45 - 54, 0, `${currentEra.cost} 🪙`, {
      fontSize: '11.5px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    fundBtn.on('pointerdown', () => {
      const success = Storage.fundExpedition(currentEra.id, currentEra.cost, ARTIFACT_TEMPLATES);
      if (success) {
        if (AudioManager.playCoin) AudioManager.playCoin();
        this.renderArtifactsList();
      } else {
        if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
      }
    });

    expeditionBox.add([expBg, expTitle, expDesc, fundBtn, fundTxt]);
    this.listContainer.add(expeditionBox);

    // 2. Список артефактов с учётом запасов
    const eraArtifacts = ARTIFACT_TEMPLATES.filter(a => a.regionId === currentEra.id);
    const stocks = Storage.getRegionStock(currentEra.id, ARTIFACT_TEMPLATES);

    const cardH = 110;
    const spacing = 12;
    const cardW = width * 0.90;
    const listOffsetY = 80;

    let touchDownTime = 0;
    let touchDownY = 0;

    eraArtifacts.forEach((art, index) => {
      const cardY = listOffsetY + index * (cardH + spacing) + cardH / 2;
      const countLeft = stocks[art.id] !== undefined ? stocks[art.id] : 0;
      const hasStock = countLeft > 0;

      const bg = this.add.rectangle(width / 2, cardY, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1.5, hasStock ? 0x233145 : 0x221a24, 0.8)
        .setInteractive({ useHandCursor: hasStock });

      const texKey = this.textures.exists(art.textureKey) ? art.textureKey : 'art_egypt_scarab';
      const icon = this.add.image(width / 2 - cardW / 2 + 40, cardY, texKey)
        .setDisplaySize(68, 68)
        .setAlpha(hasStock ? 1 : 0.45);

      const title = this.add.text(width / 2 - cardW / 2 + 82, cardY - 30, art.name, {
        fontSize: '15px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: hasStock ? '#ffffff' : '#64748b',
        fontStyle: 'bold'
      });

      // Отображение доступного количества
      const stockBadgeColor = hasStock ? '#38bdf8' : '#ef4444';
      const stockBadgeText = hasStock ? `В наличии: ${countLeft} шт.` : `Запасы иссякли (нужна экспедиция)`;

      const stockLbl = this.add.text(width / 2 - cardW / 2 + 82, cardY - 8, stockBadgeText, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: stockBadgeColor,
        fontStyle: 'bold'
      });

      const takeBtnText = hasStock ? '▶ ВЗЯТЬ НА ВЕРСТАК' : 'ОБРАЗЦЫ ЗАКОНЧИЛИСЬ';
      const takeBtn = this.add.text(width / 2 - cardW / 2 + 82, cardY + 28, takeBtnText, {
        fontSize: '11.5px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: hasStock ? '#10b981' : '#475569',
        fontStyle: 'bold'
      });

      const valueBadge = this.add.text(
        width / 2 + cardW / 2 - 16,
        cardY + 28,
        `${art.marketValue || 100} 🪙`,
        {
          fontSize: '11.5px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: hasStock ? '#facc15' : '#475569',
          fontStyle: 'bold'
        }
      ).setOrigin(1, 0);

      bg.on('pointerdown', (p) => {
        touchDownTime = this.time.now;
        touchDownY = p.y;
      });

      bg.on('pointerup', (p) => {
        const moveDist = Math.abs(p.y - touchDownY);
        const elapsed = this.time.now - touchDownTime;

        if (!this.isDraggingList && moveDist < 10 && elapsed < 400 && hasStock) {
          // Списываем 1 штуку из запасов
          Storage.decrementArtifactStock(currentEra.id, art.id);

          if (AudioManager.playClick) AudioManager.playClick();
          this.scene.start('RestoreScene', {
            regionId: currentEra.id,
            templateId: art.id
          });
        }
      });

      this.listContainer.add([bg, icon, title, stockLbl, takeBtn, valueBadge]);
    });

    const totalContentHeight = listOffsetY + eraArtifacts.length * (cardH + spacing) + 24;
    this.minListY = Math.min(this.listTopY, this.listBottomY - totalContentHeight);
  }

  showResetModal() {
    const { width, height } = this.scale;
    const modalCont = this.add.container(0, 0).setDepth(100);

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.86)
      .setInteractive();

    const box = this.add.rectangle(width / 2, height / 2, width * 0.86, 210, 0x171214)
      .setStrokeStyle(1.5, 0xef4444, 0.9);

    const title = this.add.text(width / 2, height / 2 - 60, '⚠️ СБРОС ПРОГРЕССА', {
      fontSize: '17px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const msg = this.add.text(
      width / 2,
      height / 2 - 16,
      'Все отреставрированные артефакты,\nмонеты, открытые эпохи и улучшения\nбудут удалены безвозвратно.',
      {
        fontSize: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#cbd5e1',
        align: 'center',
        lineSpacing: 4
      }
    ).setOrigin(0.5);

    const confirmBtn = this.add.rectangle(width / 2 - 64, height / 2 + 56, 110, 36, 0xef4444)
      .setInteractive({ useHandCursor: true });

    const confirmTxt = this.add.text(width / 2 - 64, height / 2 + 56, 'СБРОСИТЬ', {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    confirmBtn.on('pointerdown', () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    });

    const cancelBtn = this.add.rectangle(width / 2 + 64, height / 2 + 56, 110, 36, 0x334155)
      .setInteractive({ useHandCursor: true });

    const cancelTxt = this.add.text(width / 2 + 64, height / 2 + 56, 'ОТМЕНА', {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    cancelBtn.on('pointerdown', () => {
      modalCont.destroy();
    });

    modalCont.add([overlay, box, title, msg, confirmBtn, confirmTxt, cancelBtn, cancelTxt]);
  }
}
