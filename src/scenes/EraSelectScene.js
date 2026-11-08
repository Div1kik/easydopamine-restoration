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
      fontSize: '28px',
      fontFamily: 'sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScale(0.5).setDepth(30);

    this.add.text(width / 2, 56, `Ранг: ${rank}  •  Казна: ${coins} 💰`, {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#94a3b8'
    }).setOrigin(0.5).setScale(0.5).setDepth(30);

    // Кнопка сброса
    const resetBtn = this.add.rectangle(width - 34, 34, 34, 34, 0x1f1924)
      .setStrokeStyle(1.5, 0xef4444, 0.8)
      .setInteractive({ useHandCursor: true })
      .setDepth(31);
    this.add.text(width - 34, 34, '🗑', { fontSize: '15px' }).setOrigin(0.5).setDepth(32);
    resetBtn.on('pointerdown', () => this.showResetModal());

    // Границы рабочей зоны списка
    this.listTop = 136;
    this.listBottom = height - 66;

    // Отрисовка интерфейса
    this.createTabsUI(width);
    this.renderCards(width);

    // Нижняя кнопка возврата
    this.add.rectangle(width / 2, height - 33, width, 66, 0x07090e).setDepth(30);
    const backBtn = this.add.rectangle(width / 2, height - 34, width * 0.88, 44, 0x141a24)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(31);
    this.add.text(width / 2, height - 34, 'В главное меню', {
      fontSize: '26px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScale(0.5).setDepth(32);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });

    // Обработка вертикального жеста списка без блокирующих overlay
    let dragStartY = 0;
    let initialScrollY = 0;
    let isDragging = false;

    this.input.on('pointerdown', (p) => {
      if (p.y >= this.listTop && p.y <= this.listBottom) {
        dragStartY = p.y;
        initialScrollY = this.scrollY;
        isDragging = false;
      }
    });

    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      if (p.y >= this.listTop && p.y <= this.listBottom) {
        const dy = p.y - dragStartY;
        if (Math.abs(dy) > 6) {
          isDragging = true;
          this.scrollY = Phaser.Math.Clamp(initialScrollY + dy, this.maxScrollUp, 0);
          this.updateCardsPosition();
        }
      }
    });
  }

  createTabsUI(width) {
    if (this.tabsElements) this.tabsElements.forEach(el => el.destroy());
    this.tabsElements = [];

    const tabW = 96;
    const spacing = 8;
    const startX = 14;
    const names = ['Египет', 'Античность', 'Европа', 'Япония', 'Ацтеки', 'Викинги', 'Ренессанс'];

    let tabDragX = 0;
    let tabInitX = 0;
    let isTabMoving = false;
    const minTabX = Math.min(0, width - (startX + this.eras.length * (tabW + spacing)));

    this.eras.forEach((era, i) => {
      const isSel = (i === this.selectedEraIndex);
      const bx = startX + i * (tabW + spacing) + tabW / 2 + this.tabScrollX;

      const bg = this.add.rectangle(bx, 96, tabW, 36, isSel ? 0xd4af37 : 0x111622)
        .setStrokeStyle(1.5, isSel ? 0xfef08a : 0x222c3d, 0.9)
        .setInteractive({ useHandCursor: true })
        .setDepth(20);

      const title = `${era.unlocked ? '' : '🔒 '}${names[i] || era.name}`;
      const txt = this.add.text(bx, 96, title, {
        fontSize: '22px',
        fontFamily: 'sans-serif',
        color: isSel ? '#000000' : (era.unlocked ? '#94a3b8' : '#475569'),
        fontStyle: 'bold'
      }).setOrigin(0.5).setScale(0.5).setDepth(21);

      bg.on('pointerdown', (p) => {
        tabDragX = p.x;
        tabInitX = this.tabScrollX;
        isTabMoving = false;
      });

      bg.on('pointermove', (p) => {
        if (!p.isDown) return;
        const dx = p.x - tabDragX;
        if (Math.abs(dx) > 6) {
          isTabMoving = true;
          this.tabScrollX = Phaser.Math.Clamp(tabInitX + dx, minTabX, 0);
          this.createTabsUI(width);
        }
      });

      bg.on('pointerup', () => {
        if (!isTabMoving) {
          if (AudioManager.playClick) AudioManager.playClick();
          this.selectedEraIndex = i;
          this.scrollY = 0;
          this.createTabsUI(width);
          this.renderCards(width);
        }
      });

      this.tabsElements.push(bg, txt);
    });
  }

  renderCards(width) {
    if (this.cardsElements) this.cardsElements.forEach(el => el.destroy());
    this.cardsElements = [];

    const currentEra = this.eras[this.selectedEraIndex];

    if (!currentEra.unlocked) {
      this.maxScrollUp = 0;
      const box = this.add.rectangle(width / 2, this.listTop + 80, width * 0.88, 120, 0x111520)
        .setStrokeStyle(1.5, 0xef4444, 0.6).setDepth(10);
      const t1 = this.add.text(width / 2, this.listTop + 60, '🔒 ЭПОХА ЗАБЛОКИРОВАНА', {
        fontSize: '28px',
        fontFamily: 'sans-serif',
        color: '#ef4444',
        fontStyle: 'bold'
      }).setOrigin(0.5).setScale(0.5).setDepth(11);

      const t2 = this.add.text(width / 2, this.listTop + 95, `Отреставрируйте минимум ${currentEra.needed} экспонатов для открытия`, {
        fontSize: '22px',
        fontFamily: 'sans-serif',
        color: '#94a3b8'
      }).setOrigin(0.5).setScale(0.5).setDepth(11);

      this.cardsElements.push(box, t1, t2);
      return;
    }

    const eraArtifacts = ARTIFACT_TEMPLATES.filter(a => a.regionId === currentEra.id);
    const cardH = 114;
    const spacing = 12;
    const cardW = width * 0.90;

    this.cardData = [];

    eraArtifacts.forEach((art, idx) => {
      const baseY = this.listTop + idx * (cardH + spacing) + cardH / 2 + 10;

      const bg = this.add.rectangle(width / 2, baseY, cardW, cardH, 0x111622, 0.97)
        .setStrokeStyle(1.5, 0x243042, 0.9)
        .setInteractive({ useHandCursor: true })
        .setDepth(10);

      const texKey = this.textures.exists(art.textureKey) ? art.textureKey : 'art_egypt_scarab';
      const icon = this.add.image(width / 2 - cardW / 2 + 46, baseY, texKey)
        .setDisplaySize(68, 68).setDepth(11);

      const title = this.add.text(width / 2 - cardW / 2 + 90, baseY - 36, art.name, {
        fontSize: '28px',
        fontFamily: 'sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setScale(0.5).setDepth(11);

      const desc = this.add.text(width / 2 - cardW / 2 + 90, baseY - 12, art.description || 'Древний артефакт', {
        fontSize: '20px',
        fontFamily: 'sans-serif',
        color: '#94a3b8',
        lineSpacing: 2,
        wordWrap: { width: (cardW - 100) * 2 }
      }).setScale(0.5).setDepth(11);

      const action = this.add.text(width / 2 - cardW / 2 + 90, baseY + 32, '▶ ВЗЯТЬ НА ВЕРСТАК', {
        fontSize: '22px',
        fontFamily: 'sans-serif',
        color: '#10b981',
        fontStyle: 'bold'
      }).setScale(0.5).setDepth(11);

      const val = this.add.text(width / 2 + cardW / 2 - 16, baseY + 32, `${art.marketValue || 200} 💰`, {
        fontSize: '22px',
        fontFamily: 'sans-serif',
        color: '#facc15',
        fontStyle: 'bold'
      }).setOrigin(1, 0).setScale(0.5).setDepth(11);

      let tapY = 0;
      bg.on('pointerdown', (p) => { tapY = p.y; });
      bg.on('pointerup', (p) => {
        if (Math.abs(p.y - tapY) < 10) {
          if (AudioManager.playClick) AudioManager.playClick();
          this.scene.start('RestoreScene', {
            regionId: currentEra.id,
            templateId: art.id
          });
        }
      });

      this.cardsElements.push(bg, icon, title, desc, action, val);
      this.cardData.push({ baseY, elements: [bg, icon, title, desc, action, val] });
    });

    const totalHeight = eraArtifacts.length * (cardH + spacing) + 20;
    this.maxScrollUp = Math.min(0, (this.listBottom - this.listTop) - totalHeight);
    this.updateCardsPosition();
  }

  updateCardsPosition() {
    if (!this.cardData) return;
    this.cardData.forEach(card => {
      const curY = card.baseY + this.scrollY;
      const isVisible = (curY >= this.listTop - 30 && curY <= this.listBottom + 30);
      card.elements.forEach(el => {
        el.y = curY;
        el.setVisible(isVisible);
      });
    });
  }

  showResetModal() {
    const { width, height } = this.scale;
    const modalObjects = [];

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.88)
      .setInteractive().setDepth(50);

    const box = this.add.rectangle(width / 2, height / 2, width * 0.86, 190, 0x121724)
      .setStrokeStyle(1.5, 0xef4444, 0.9).setDepth(51);

    const title = this.add.text(width / 2, height / 2 - 50, 'СБРОСИТЬ ПРОГРЕСС?', {
      fontSize: '32px',
      fontFamily: 'sans-serif',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScale(0.5).setDepth(52);

    const desc = this.add.text(width / 2, height / 2 - 12, 'Все артефакты, монеты и уровни\nбудут удалены безвозвратно.', {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#cbd5e1',
      align: 'center'
    }).setOrigin(0.5).setScale(0.5).setDepth(52);

    const confirmBtn = this.add.rectangle(width / 2 - 60, height / 2 + 48, 100, 36, 0xef4444)
      .setInteractive({ useHandCursor: true }).setDepth(52);
    const confirmTxt = this.add.text(width / 2 - 60, height / 2 + 48, 'СБРОСИТЬ', {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScale(0.5).setDepth(53);

    confirmBtn.on('pointerdown', () => {
      localStorage.clear();
      window.location.reload();
    });

    const cancelBtn = this.add.rectangle(width / 2 + 60, height / 2 + 48, 100, 36, 0x334155)
      .setInteractive({ useHandCursor: true }).setDepth(52);
    const cancelTxt = this.add.text(width / 2 + 60, height / 2 + 48, 'ОТМЕНА', {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScale(0.5).setDepth(53);

    cancelBtn.on('pointerdown', () => {
      modalObjects.forEach(o => o.destroy());
    });

    modalObjects.push(overlay, box, title, desc, confirmBtn, confirmTxt, cancelBtn, cancelTxt);
  }
}
