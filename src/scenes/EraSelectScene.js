import { REGIONS, ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class EraSelectScene extends Phaser.Scene {
  constructor() {
    super('EraSelectScene');
  }

  create() {
    const { width, height } = this.scale;
    this.selectedRegionIndex = 0;
    this.renderedElements = [];

    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;
    this.add.image(width / 2, height / 2, `bg_workshop_tier_${tier}`).setDepth(0);

    // Заголовок
    this.add.text(width / 2, 34, 'КАРТА ЭКСПЕДИЦИЙ', {
      fontSize: '18px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#c5a059',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(2);

    const lvl = Storage.getMasterLevel ? Storage.getMasterLevel() : 1;
    const coins = Storage.getCoins();
    this.add.text(width / 2, 54, `Ранг Мастера: ${lvl}  •  Казна: ${coins} золота`, {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#94a3b8'
    }).setOrigin(0.5).setDepth(2);

    this.createTabs();
    this.renderRegionContent();

    // Назад в меню
    const backBg = this.add.rectangle(width / 2, height - 38, 220, 42, 0x161b24, 0.95)
      .setStrokeStyle(1.5, 0xffffff, 0.2)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    this.add.text(width / 2, height - 38, 'В главное меню', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    backBg.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  createTabs() {
    const { width } = this.scale;
    const tabY = 82;
    const tabWidth = (width * 0.94) / REGIONS.length;
    const startX = width * 0.03 + tabWidth / 2;
    this.tabButtons = [];

    REGIONS.forEach((region, idx) => {
      const tabX = startX + idx * tabWidth;
      const isUnlocked = Storage.isRegionUnlocked(region.id);
      const isSelected = (idx === this.selectedRegionIndex);

      const tabBg = this.add.rectangle(tabX, tabY, tabWidth - 4, 32, isSelected ? 0xc5a059 : 0x141820, 0.95)
        .setStrokeStyle(1, isSelected ? 0xffffff : (isUnlocked ? 0x334155 : 0x1e2430))
        .setInteractive({ useHandCursor: true })
        .setDepth(5);

      const shortLabel = region.name.split(' ')[0].substring(0, 4);
      const labelText = isUnlocked ? shortLabel : '🔒';

      const label = this.add.text(tabX, tabY, labelText, {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: isSelected ? '#0f172a' : (isUnlocked ? '#cbd5e1' : '#64748b'),
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(6);

      tabBg.on('pointerdown', () => {
        this.selectedRegionIndex = idx;
        this.updateTabStyles();
        this.renderRegionContent();
      });

      this.tabButtons.push({ tabBg, label, regionId: region.id, shortLabel });
    });
  }

  updateTabStyles() {
    this.tabButtons.forEach((tab, idx) => {
      const isSelected = (idx === this.selectedRegionIndex);
      const isUnlocked = Storage.isRegionUnlocked(tab.regionId);

      tab.tabBg.setFillStyle(isSelected ? 0xc5a059 : 0x141820);
      tab.tabBg.setStrokeStyle(1, isSelected ? 0xffffff : (isUnlocked ? 0x334155 : 0x1e2430));

      tab.label.setColor(isSelected ? '#0f172a' : (isUnlocked ? '#cbd5e1' : '#64748b'));
      tab.label.setText(isUnlocked ? tab.shortLabel : '🔒');
    });
  }

  renderRegionContent() {
    const { width, height } = this.scale;

    this.renderedElements.forEach(el => el.destroy());
    this.renderedElements = [];

    const region = REGIONS[this.selectedRegionIndex];
    const isUnlocked = Storage.isRegionUnlocked(region.id);

    // 1. ЕСЛИ РЕГИОН ЗАБЛОКИРОВАН — ВЫВОДИМ СТИЛЬНУЮ ПАНЕЛЬ ТРЕБОВАНИЙ
    if (!isUnlocked) {
      const lockCard = this.add.rectangle(width / 2, height * 0.44, width * 0.88, 280, 0x10141c, 0.92)
        .setStrokeStyle(1.5, 0xef4444, 0.4)
        .setDepth(4);

      const lockIcon = this.add.image(width / 2, height * 0.36, 'icon_lock')
        .setScale(1.6)
        .setTint(0xef4444)
        .setDepth(5);

      const title = this.add.text(width / 2, height * 0.43, `${region.name.toUpperCase()}\nНЕДОСТУПЕН`, {
        fontSize: '16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#f8fafc',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5).setDepth(5);

      const reason = Storage.getRegionLockReason(region.id);
      const desc = this.add.text(width / 2, height * 0.50, `Условие экспедиции:\n${reason}`, {
        fontSize: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fbbf24',
        align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5).setDepth(5);

      this.renderedElements.push(lockCard, lockIcon, title, desc);
      return;
    }

    // 2. ЕСЛИ РЕГИОН ОТКРЫТ — ВЫВОДИМ СПИСОК АРТЕФАКТОВ РЕГИОНА
    const templates = ARTIFACT_TEMPLATES.filter(t => t.regionId === region.id);
    const startY = 120;
    const cardH = 96;

    templates.forEach((item, idx) => {
      const cardY = startY + idx * cardH;
      if (cardY > height - 70) return;

      const bg = this.add.rectangle(width / 2, cardY + 38, width * 0.90, 84, 0x141822, 0.95)
        .setStrokeStyle(1, 0xc5a059, 0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(3);

      const thumb = this.add.image(width * 0.18, cardY + 38, item.textureKey)
        .setScale(0.20)
        .setDepth(4);

      const textX = width * 0.32;
      const title = this.add.text(textX, cardY + 12, item.name, {
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setDepth(4);

      const desc = this.add.text(textX, cardY + 32, item.museumDesc, {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: width * 0.56 }
      }).setDepth(4);

      const action = this.add.text(textX, cardY + 54, '▶ ВЗЯТЬ НА ВЕРСТАК', {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#10b981',
        fontStyle: 'bold',
        letterSpacing: 1
      }).setDepth(4);

      bg.on('pointerdown', () => {
        if (AudioManager.playEraMusic) AudioManager.playEraMusic(region.id);
        this.scene.start('RestoreScene', { regionId: region.id });
      });

      this.renderedElements.push(bg, thumb, title, desc, action);
    });
  }
}
