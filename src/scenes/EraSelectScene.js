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
      return {
        ...region,
        unlocked: (inventory.length >= needed) || (idx === 0),
        needed: needed
      };
    });

    this.selectedEraIndex = 0;
    this.scrollY = 0;
    this.tabScrollX = 0;

    // Шапка
    this.add.text(width / 2, 34, 'КАРТА ЭКСПЕДИЦИЙ', {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(20);

    this.add.text(width / 2, 58, `Ранг: ${rank}  •  Казна: ${coins} 💰`, {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(20);

    // Кнопка сброса
    const resetBtn = this.add.rectangle(width - 36, 36, 32, 32, 0x1f1924)
      .setStrokeStyle(1.5, 0xef4444, 0.8)
      .setInteractive({ useHandCursor: true })
      .setDepth(25);
    this.add.text(width - 36, 36, '🗑', { fontSize: '13px' }).setOrigin(0.5).setDepth(26);
    resetBtn.on('pointerdown', () => this.showResetModal());

    // Горизонтальный скролл табов
    this.createScrollableTabs(width, 88);

    // Границы рабочей зоны карточек
    this.listTopY = 138;
    this.listBottomY = height - 68;
    this.listHeight = this.listBottomY - this.listTopY;

    this.listContainer = this.add.container(0, this.listTopY).setDepth(5);

    // Маска отсечения
    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.listTopY, width, this.listHeight);
    this.listContainer.setMask(maskShape.createGeometryMask());

    this.setupVerticalScroll(width);
    this.renderArtifactsList();

    // Нижняя плашка
    this.add.rectangle(width / 2, height - 34, width, 68, 0x07090e).setDepth(30);

    const backBtn = this.add.rectangle(width / 2, height - 34, width * 0.88, 46, 0x131924)
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

    let tabDragStart = 0;
    let tabStartX = 0;
    let didTabDrag = false;

    this.eras.forEach((era, i) => {
      const tabX = startX + i * (tabWidth + spacing) + tabWidth / 2;
      const isSelected = (i === this.selectedEraIndex);

      const bg = this.add.rectangle(tabX, 16, tabWidth, 34, isSelected ? 0xd4af37 : 0x111622)
        .setStrokeStyle(1.5, isSelected ? 0xfef08a : 0x222c3d, 0.9)
        .setInteractive({ useHandCursor: true });

      const lockPrefix = era.unlocked ? '' : '🔒 ';
      const title = `${lockPrefix}${shortNames[i] || era.name}`;

      const text = this.add.text(tabX, 16, title, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: isSelected ? '#000000' : (era.unlocked ? '#94a3b8' : '#475569'),
        fontStyle: 'bold'
      }).setOrigin(0.5);

      bg.on('pointerdown', (pointer) => {
        tabDragStart = pointer.x;
        tabStartX = this.tabsScrollContainer.x;
        didTabDrag = false;
      });

      bg.on('pointermove', (pointer) => {
        if (!pointer.isDown) return;
        const dx = pointer.x - tabDragStart;
        if (Math.abs(dx) > 6) {
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

    // Слушаем глобальный ввод без создания поверхностной блокирующей зоны
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
      const lockTxt = this.add.text(width / 2, 80, '🔒 ЭПОХА ЗАБЛОКИРОВАНА', {
        fontSize: '15px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ef4444',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      const reqTxt = this.add.text(width / 2, 116, `Отреставрируйте ещё предметов,\nчтобы набрать ${currentEra.needed} экспонатов в коллекции.`, {
        fontSize: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5);
      this.listContainer.add([lockBox, lockTxt, reqTxt]);
      return;
    }

    const eraArtifacts = ARTIFACT_TEMPLATES.filter(a => a.regionId === currentEra.id);
    const cardH = 118;
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
        fontSize: '15px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      });

      const fullDesc = art.description || 'Древняя историческая ценность, требующая бережной очистки.';
      const desc = this.add.text(width / 2 - cardW / 2 + 92, cardY - 14, fullDesc, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        lineSpacing: 2,
        wordWrap: { width: cardW - 104 }
      });

      const takeBtn = this.add.text(width / 2 - cardW / 2 + 92, cardY + 34, '▶ ВЗЯТЬ НА ВЕРСТАК', {
        fontSize: '11.5px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#10b981',
        fontStyle: 'bold'
      });

      const valueBadge = this.add.text(width / 2 + cardW / 2 - 16, cardY + 34, `${art.marketValue || 200} 💰`, {
        fontSize: '11.5px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#facc15',
        fontStyle: 'bold'
      }).setOrigin(1, 0);

      // Прямой надежный клик: отличаем тап от скролла
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

    const title = this.add.text(width / 2, height / 2 - 62, 'СБРОС ПРОГРЕССА?', {
      fontSize: '17px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const msg = this.add.text(width / 2, height / 2 - 16, 'Все отреставрированные артефакты,\nмонеты, открытые эпохи и улучшения\nбудут удалены безвозвратно.', {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#cbd5e1',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);

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

    cancelBtn.on('pointerdown', () => modalCont.destroy());

    modalCont.add([overlay, box, title, msg, confirmBtn, confirmTxt, cancelBtn, cancelTxt]);
  }
}
