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

    const xp = Storage.getXP ? Storage.getXP() : 0;
    const rank = Math.floor(xp / 100) + 1;
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    const inventory = Storage.getInventory ? Storage.getInventory() : [];

    const requiredRestored = [0, 2, 4, 6, 8, 10, 12];

    this.eras = REGIONS.map((region, idx) => {
      const needed = requiredRestored[idx] || 0;
      const isUnlocked = (inventory.length >= needed) || (idx === 0);
      return {
        ...region,
        unlocked: isUnlocked,
        needed: needed
      };
    });

    this.selectedEraIndex = 0;

    // 1. Четкая векторная шапка (HiDPI Supersampling 2x)
    this.createText(width / 2, 34, 'КАРТА ЭКСПЕДИЦИЙ', 40, '#e2b35b', true, 20);
    this.createText(width / 2, 58, `Ранг: ${rank}  •  Казна: ${coins} 💰`, 24, '#94a3b8', true, 20);

    // Кнопка сброса
    const resetBtn = this.add.rectangle(width - 36, 36, 34, 34, 0x1f1924)
      .setStrokeStyle(1.5, 0xef4444, 0.8)
      .setInteractive({ useHandCursor: true })
      .setDepth(25);
    this.createText(width - 36, 36, '🗑', 26, '#ffffff', false, 26);
    resetBtn.on('pointerdown', () => this.showResetModal());

    // 2. Горизонтальные табы эпох со свободным drag-скроллом
    this.createScrollableTabs(width, 86);

    // 3. Рабочая область карточек артефактов
    this.listTopY = 138;
    this.listBottomY = height - 68;
    this.listHeight = this.listBottomY - this.listTopY;

    this.listContainer = this.add.container(0, this.listTopY).setDepth(5);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.listTopY, width, this.listHeight);
    this.listContainer.setMask(maskShape.createGeometryMask());

    this.setupVerticalScroll(width);
    this.renderArtifactsList();

    // 4. Нижняя панель с кнопкой возврата
    const bottomBg = this.add.rectangle(width / 2, height - 34, width, 68, 0x07090e).setDepth(30);

    const backBtn = this.add.rectangle(width / 2, height - 34, width * 0.88, 48, 0x131924)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(31);

    this.createText(width / 2, height - 34, 'В главное меню', 30, '#ffffff', true, 32);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });
  }

  createText(x, y, text, sizePx, color = '#ffffff', isBold = false, depth = 10, align = 'center') {
    const t = this.add.text(x, y, text, {
      fontSize: `${sizePx}px`,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: color,
      fontStyle: isBold ? 'bold' : 'normal',
      align: align
    }).setOrigin(0.5).setScale(0.5).setDepth(depth);
    return t;
  }

  createScrollableTabs(width, y) {
    if (this.tabsScrollContainer) this.tabsScrollContainer.destroy();

    this.tabsScrollContainer = this.add.container(0, y).setDepth(20);
    const tabWidth = 98;
    const spacing = 8;
    const startX = 14;
    const shortNames = ['Египет', 'Античность', 'Европа', 'Япония', 'Ацтеки', 'Викинги', 'Ренессанс'];

    this.tabButtons = [];
    const totalTabsWidth = startX + this.eras.length * (tabWidth + spacing);
    const minScrollX = Math.min(0, width - totalTabsWidth);

    let tabDragStart = 0;
    let tabStartX = 0;
    let didTabDrag = false;

    this.eras.forEach((era, i) => {
      const tabX = startX + i * (tabWidth + spacing) + tabWidth / 2;
      const isSelected = (i === this.selectedEraIndex);

      const bg = this.add.rectangle(tabX, 18, tabWidth, 36, isSelected ? 0xd4af37 : 0x111622)
        .setStrokeStyle(1.5, isSelected ? 0xfef08a : 0x222c3d, 0.9)
        .setInteractive({ useHandCursor: true });

      const lockPrefix = era.unlocked ? '' : '🔒 ';
      const title = `${lockPrefix}${shortNames[i] || era.name}`;

      const text = this.add.text(tabX, 18, title, {
        fontSize: '22px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: isSelected ? '#000000' : (era.unlocked ? '#94a3b8' : '#475569'),
        fontStyle: 'bold'
      }).setOrigin(0.5).setScale(0.5);

      bg.on('pointerdown', (pointer) => {
        tabDragStart = pointer.x;
        tabStartX = this.tabsScrollContainer.x;
        didTabDrag = false;
      });

      bg.on('pointermove', (pointer) => {
        if (!pointer.isDown) return;
        const dx = pointer.x - tabDragStart;
        if (Math.abs(dx) > 8) {
          didTabDrag = true;
          this.tabsScrollContainer.x = Phaser.Math.Clamp(tabStartX + dx, minScrollX, 0);
        }
      });

      bg.on('pointerup', () => {
        if (!didTabDrag) {
          if (AudioManager.playClick) AudioManager.playClick();
          this.selectedEraIndex = i;
          this.updateTabsVisual();
          this.renderArtifactsList();
        }
      });

      this.tabsScrollContainer.add([bg, text]);
      this.tabButtons.push({ bg, text, era, index: i });
    });
  }

  updateTabsVisual() {
    this.tabButtons.forEach(item => {
      const isSelected = (item.index === this.selectedEraIndex);
      item.bg.setFillStyle(isSelected ? 0xd4af37 : 0x111622)
        .setStrokeStyle(1.5, isSelected ? 0xfef08a : 0x222c3d);
      item.text.setColor(isSelected ? '#000000' : (item.era.unlocked ? '#94a3b8' : '#475569'));
    });
  }

  setupVerticalScroll(width) {
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
        if (Math.abs(dy) > 8) {
          this.isDraggingList = true;
          this.listContainer.y = Phaser.Math.Clamp(containerStartY + dy, this.minListY, this.listTopY);
        }
      }
    });
  }

  renderArtifactsList() {
    this.listContainer.removeAll(true);
    this.listContainer.y = this.listTopY;

    const { width } = this.scale;
    const currentEra = this.eras[this.selectedEraIndex];

    if (!currentEra.unlocked) {
      this.minListY = this.listTopY;
      const lockBox = this.add.rectangle(width / 2, 100, width * 0.88, 140, 0x111520)
        .setStrokeStyle(1.5, 0xef4444, 0.6);
      const lockTxt = this.createText(width / 2, 80, '🔒 ЭПОХА ЗАБЛОКИРОВАНА', 30, '#ef4444', true, 10);
      const reqTxt = this.createText(width / 2, 116, `Отреставрируйте ещё предметов,\nчтобы набрать ${currentEra.needed} экспонатов в коллекции.`, 24, '#94a3b8', false, 10);
      this.listContainer.add([lockBox, lockTxt, reqTxt]);
      return;
    }

    const eraArtifacts = ARTIFACT_TEMPLATES.filter(a => a.regionId === currentEra.id);
    const cardH = 120;
    const spacing = 12;
    const cardW = width * 0.90;

    let touchDownTime = 0;
    let touchDownY = 0;

    eraArtifacts.forEach((art, index) => {
      const cardY = index * (cardH + spacing) + cardH / 2 + 8;

      const bg = this.add.rectangle(width / 2, cardY, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1.5, 0x222c3d, 0.8)
        .setInteractive({ useHandCursor: true });

      const texKey = this.textures.exists(art.textureKey) ? art.textureKey : 'art_egypt_scarab';
      const icon = this.add.image(width / 2 - cardW / 2 + 48, cardY, texKey)
        .setDisplaySize(68, 68);

      const title = this.add.text(width / 2 - cardW / 2 + 92, cardY - 38, art.name, {
        fontSize: '30px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setScale(0.5);

      const fullDesc = art.description || 'Древняя историческая ценность, требующая бережной очистки и реставрации.';
      const desc = this.add.text(width / 2 - cardW / 2 + 92, cardY - 14, fullDesc, {
        fontSize: '22px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#94a3b8',
        lineSpacing: 4,
        wordWrap: { width: (cardW - 104) * 2 }
      }).setScale(0.5);

      const takeBtn = this.add.text(width / 2 - cardW / 2 + 92, cardY + 34, '▶ ВЗЯТЬ НА ВЕРСТАК', {
        fontSize: '23px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#10b981',
        fontStyle: 'bold'
      }).setScale(0.5);

      const valueBadge = this.add.text(width / 2 + cardW / 2 - 16, cardY + 34, `${art.marketValue || 200} 💰`, {
        fontSize: '23px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#facc15',
        fontStyle: 'bold'
      }).setOrigin(1, 0).setScale(0.5);

      bg.on('pointerdown', (p) => {
        touchDownTime = this.time.now;
        touchDownY = p.y;
      });

      bg.on('pointerup', (p) => {
        const moveDist = Math.abs(p.y - touchDownY);
        const elapsed = this.time.now - touchDownTime;
        if (!this.isDraggingList && moveDist < 10 && elapsed < 400) {
          if (AudioManager.playClick) AudioManager.playClick();
          this.scene.start('RestoreScene', {
            regionId: currentEra.id,
            templateId: art.id
          });
        }
      });

      this.listContainer.add([bg, icon, title, desc, takeBtn, valueBadge]);
    });

    const totalContentHeight = eraArtifacts.length * (cardH + spacing) + 24;
    this.minListY = Math.min(this.listTopY, this.listBottomY - totalContentHeight);
  }

  showResetModal() {
    const { width, height } = this.scale;
    const modalCont = this.add.container(0, 0).setDepth(100);

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85)
      .setInteractive();

    const box = this.add.rectangle(width / 2, height / 2, width * 0.86, 210, 0x121724)
      .setStrokeStyle(1.5, 0xef4444, 0.9);

    const title = this.createText(width / 2, height / 2 - 62, 'СБРОС ПРОГРЕССА?', 34, '#ef4444', true, 105);

    const msg = this.createText(width / 2, height / 2 - 16, 'Все отреставрированные артефакты,\nмонеты, открытые эпохи и улучшения\nбудут удалены безвозвратно.', 24, '#cbd5e1', false, 105);

    const confirmBtn = this.add.rectangle(width / 2 - 64, height / 2 + 56, 110, 36, 0xef4444)
      .setInteractive({ useHandCursor: true }).setDepth(104);
    const confirmTxt = this.createText(width / 2 - 64, height / 2 + 56, 'СБРОСИТЬ', 24, '#ffffff', true, 105);

    confirmBtn.on('pointerdown', () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    });

    const cancelBtn = this.add.rectangle(width / 2 + 64, height / 2 + 56, 110, 36, 0x334155)
      .setInteractive({ useHandCursor: true }).setDepth(104);
    const cancelTxt = this.createText(width / 2 + 64, height / 2 + 56, 'ОТМЕНА', 24, '#ffffff', true, 105);

    cancelBtn.on('pointerdown', () => modalCont.destroy());

    modalCont.add([overlay, box, title, msg, confirmBtn, confirmTxt, cancelBtn, cancelTxt]);
  }
}
