import { REGIONS, ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';

export class EraSelectScene extends Phaser.Scene {
  constructor() {
    super('EraSelectScene');
  }

  create() {
    const { width, height } = this.scale;
    this.selectedRegionIndex = 0;
    this.renderedElements = [];

    const tier = Storage.getWorkshopTier();
    this.add.image(width / 2, height / 2, `bg_workshop_tier_${tier}`).setDepth(0);

    this.add.text(width / 2, 38, 'ЭКСПЕДИЦИИ И ЗАКАЗЫ', {
      fontSize: '20px',
      fontFamily: 'sans-serif',
      color: '#d4af37',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(2);

    const resetBtn = this.add.text(width - 20, 20, 'Сброс', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#e74c3c',
      fontStyle: 'bold'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(10);

    resetBtn.on('pointerdown', () => {
      localStorage.clear();
      this.scene.restart();
    });

    this.createTabs();
    this.renderRegionOrders();

    const backBg = this.add.rectangle(width / 2, height - 42, 220, 44, 0x34495e)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    this.add.text(width / 2, height - 42, 'В главное меню', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    backBg.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  createTabs() {
    const { width } = this.scale;
    const tabY = 75;
    const tabWidth = width / REGIONS.length;
    this.tabButtons = [];

    REGIONS.forEach((region, idx) => {
      const tabX = tabWidth * idx + tabWidth / 2;
      const shortName = region.name.split(' ')[0];

      const tabBg = this.add.rectangle(tabX, tabY, tabWidth - 4, 32, idx === this.selectedRegionIndex ? 0xd4af37 : 0x221d19)
        .setInteractive({ useHandCursor: true })
        .setDepth(5);

      const label = this.add.text(tabX, tabY, shortName, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: idx === this.selectedRegionIndex ? '#141210' : '#bdc3c7',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(6);

      tabBg.on('pointerdown', () => {
        this.selectedRegionIndex = idx;
        this.updateTabStyles();
        this.renderRegionOrders();
      });

      this.tabButtons.push({ tabBg, label });
    });
  }

  updateTabStyles() {
    this.tabButtons.forEach((tab, idx) => {
      const isSelected = idx === this.selectedRegionIndex;
      tab.tabBg.setFillStyle(isSelected ? 0xd4af37 : 0x221d19);
      tab.label.setColor(isSelected ? '#141210' : '#bdc3c7');
    });
  }

  renderRegionOrders() {
    const { width } = this.scale;

    this.renderedElements.forEach(el => el.destroy());
    this.renderedElements = [];

    const region = REGIONS[this.selectedRegionIndex];
    const templates = ARTIFACT_TEMPLATES.filter(t => t.regionId === region.id);

    const startY = 120;
    const cardH = 150;

    templates.forEach((item, idx) => {
      const cardY = startY + idx * cardH;

      const bg = this.add.rectangle(width / 2, cardY + 50, width * 0.9, 130, 0x221d19, 0.95)
        .setStrokeStyle(1.5, 0xd4af37, 0.8)
        .setDepth(3)
        .setInteractive({ useHandCursor: true });

      bg.on('pointerdown', () => {
        this.scene.start('RestoreScene', { regionId: region.id });
      });

      const thumb = this.add.image(width * 0.22, cardY + 50, item.textureKey)
        .setScale(0.26)
        .setDepth(4);

      const textX = width * 0.38;
      const title = this.add.text(textX, cardY + 14, item.name, {
        fontSize: '15px',
        fontFamily: 'sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setDepth(4);

      const desc = this.add.text(textX, cardY + 36, item.museumDesc, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: '#bdc3c7',
        wordWrap: { width: width * 0.52 }
      }).setDepth(4);

      const actionText = this.add.text(textX, cardY + 88, '▶ ПРИНЯТЬ ЗАКАЗ НА ВЕРСТАК', {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: '#2ecc71',
        fontStyle: 'bold'
      }).setDepth(4);

      this.renderedElements.push(bg, thumb, title, desc, actionText);
    });
  }
}
