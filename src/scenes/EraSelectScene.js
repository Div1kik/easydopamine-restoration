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

    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;
    this.add.image(width / 2, height / 2, `bg_workshop_tier_${tier}`).setDepth(0);

    // Шапка
    this.add.rectangle(width / 2, 45, width, 90, 0x0a0c10, 0.92).setDepth(20);
    this.add.text(width / 2, 28, 'КАРТА ЭКСПЕДИЦИЙ', {
      fontSize: '17px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#c5a059',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(21);

    const lvl = Storage.getMasterLevel ? Storage.getMasterLevel() : 1;
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.add.text(width / 2, 48, `Ранг Мастера: ${lvl}  •  Казна: ${coins} золота`, {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#94a3b8'
    }).setOrigin(0.5).setDepth(21);

    this.createScrollableTabs(width);

    this.listContainer = this.add.container(0, 0).setDepth(5);
    const listMaskShape = this.make.graphics();
    listMaskShape.fillRect(0, 115, width, height - 180);
    this.listContainer.setMask(listMaskShape.createGeometryMask());

    this.setupVerticalScroll(height);
    this.renderRegionContent();

    // Подвал
    this.add.rectangle(width / 2, height - 32, width, 64, 0x0a0c10, 0.95).setDepth(20);
    const backBtn = this.add.rectangle(width / 2, height - 32, 220, 38, 0x161b24, 0.95)
      .setStrokeStyle(1.5, 0xffffff, 0.2)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    this.add.text(width / 2, height - 32, 'В главное меню', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(22);

    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  createScrollableTabs(width) {
    this.tabsContainer = this.add.container(0, 0).setDepth(22);
    const tabY = 82;
    const tabW = 105;
    this.tabButtons = [];

    REGIONS.forEach((region, idx) => {
      const tabX = 60 + idx * (tabW + 8);
      const isUnlocked = Storage.isRegionUnlocked(region.id);
      const isSelected = (idx === this.selectedRegionIndex);

      const tabBg = this.add.rectangle(tabX, tabY, tabW, 32, isSelected ? 0xc5a059 : 0x141820, 0.95)
        .setStrokeStyle(1, isSelected ? 0xffffff : (isUnlocked ? 0x334155 : 0x1e2430))
        .setInteractive({ useHandCursor: true });

      const name = isUnlocked ? region.name.split(' ')[0] : `🔒 ${region.name.split(' ')[0]}`;
      const label = this.add.text(tabX, tabY, name, {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: isSelected ? '#0f172a' : (isUnlocked ? '#cbd5e1' : '#64748b'),
        fontStyle: 'bold'
      }).setOrigin(0.5);

      tabBg.on('pointerdown', () => {
        this.selectedRegionIndex = idx;
        this.updateTabStyles();
        this.renderRegionContent();
      });

      this.tabsContainer.add([tabBg, label]);
      this.tabButtons.push({ tabBg, label, regionId: region.id, rawName: region.name.split(' ')[0] });
    });

    let startX = 0;
    const maxScroll = Math.min(0, width - (REGIONS.length * 113 + 30));

    this.input.on('pointerdown', (p) => {
      if (p.y >= 65 && p.y <= 100) startX = p.x - this.tabsContainer.x;
    });

    this.input.on('pointermove', (p) => {
      if (p.isDown && p.y >= 65 && p.y <= 100) {
        this.tabsContainer.x = Phaser.Math.Clamp(p.x - startX, maxScroll, 0);
      }
    });
  }

  updateTabStyles() {
    this.tabButtons.forEach((tab, idx) => {
      const isSelected = (idx === this.selectedRegionIndex);
      const isUnlocked = Storage.isRegionUnlocked(tab.regionId);

      tab.tabBg.setFillStyle(isSelected ? 0xc5a059 : 0x141820);
      tab.tabBg.setStrokeStyle(1, isSelected ? 0xffffff : (isUnlocked ? 0x334155 : 0x1e2430));
      tab.label.setColor(isSelected ? '#0f172a' : (isUnlocked ? '#cbd5e1' : '#64748b'));
      tab.label.setText(isUnlocked ? tab.rawName : `🔒 ${tab.rawName}`);
    });
  }

  setupVerticalScroll(height) {
    let startY = 0;
    this.input.on('pointerdown', (p) => {
      if (p.y > 115 && p.y < height - 60) {
        startY = p.y - this.listContainer.y;
      }
    });

    this.input.on('pointermove', (p) => {
      if (p.isDown && p.y > 115 && p.y < height - 60) {
        const newY = p.y - startY;
        this.listContainer.y = Phaser.Math.Clamp(newY, this.minScrollY, 0);
      }
    });
  }

  renderRegionContent() {
    const { width, height } = this.scale;
    this.listContainer.removeAll(true);
    this.listContainer.y = 0;

    const region = REGIONS[this.selectedRegionIndex];
    const isUnlocked = Storage.isRegionUnlocked(region.id);

    if (!isUnlocked) {
      const lockCard = this.add.rectangle(width / 2, height * 0.42, width * 0.88, 260, 0x10141c, 0.92)
        .setStrokeStyle(1.5, 0xef4444, 0.4);

      const lockIcon = this.add.image(width / 2, height * 0.34, 'icon_lock')
        .setScale(1.5).setTint(0xef4444);

      const title = this.add.text(width / 2, height * 0.41, `${region.name.toUpperCase()}\nНЕДОСТУПЕН`, {
        fontSize: '15px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#f8fafc',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5);

      const reason = Storage.getRegionLockReason(region.id);
      const desc = this.add.text(width / 2, height * 0.48, `Условие экспедиции:\n${reason}`, {
        fontSize: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fbbf24',
        align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5);

      this.listContainer.add([lockCard, lockIcon, title, desc]);
      this.minScrollY = 0;
      return;
    }

    const templates = ARTIFACT_TEMPLATES.filter(t => t.regionId === region.id);
    const startY = 130;
    const cardH = 95;

    templates.forEach((item, idx) => {
      const cardY = startY + idx * cardH;

      const bg = this.add.rectangle(width / 2, cardY + 38, width * 0.90, 84, 0x141822, 0.95)
        .setStrokeStyle(1, 0xc5a059, 0.5)
        .setInteractive({ useHandCursor: true });

      const texKey = this.textures.exists(item.textureKey) ? item.textureKey : 'art_egypt_scarab';
      const thumb = this.add.image(width * 0.18, cardY + 38, texKey).setScale(0.20);

      const textX = width * 0.32;
      const title = this.add.text(textX, cardY + 14, item.name, {
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      });

      const desc = this.add.text(textX, cardY + 32, item.museumDesc, {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: width * 0.56 }
      });

      const action = this.add.text(textX, cardY + 54, '▶ ВЗЯТЬ НА ВЕРСТАК', {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#10b981',
        fontStyle: 'bold',
        letterSpacing: 1
      });

      // ВАЖНО: передаем точный templateId, чтобы не было путаницы!
      bg.on('pointerdown', () => {
        if (AudioManager.playEraMusic) AudioManager.playEraMusic(region.id);
        this.scene.start('RestoreScene', { regionId: region.id, templateId: item.templateId });
      });

      this.listContainer.add([bg, thumb, title, desc, action]);
    });

    const totalContentHeight = startY + templates.length * cardH + 40;
    this.minScrollY = Math.min(0, (height - 65) - totalContentHeight);
  }
}
