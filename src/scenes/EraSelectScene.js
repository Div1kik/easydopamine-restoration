import { ERAS, ARTIFACTS } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';

export class EraSelectScene extends Phaser.Scene {
  constructor() {
    super('EraSelectScene');
  }

  create() {
    const { width, height } = this.scale;
    this.selectedEraIndex = 0;
    this.renderedElements = [];

    this.add.image(width / 2, height / 2, 'bg_workshop').setDepth(0);

    this.add.text(width / 2, 38, 'ВЫБОР ЭПОХИ', {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#d4af37',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(2);

    const resetBtn = this.add.text(width - 20, 20, 'Сброс', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#e74c3c',
      fontStyle: 'bold'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(10);

    resetBtn.on('pointerdown', () => {
      localStorage.clear();
      this.scene.restart();
    });

    this.createTabs();
    this.renderEraLevels();

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
    const tabWidth = width / ERAS.length;
    this.tabButtons = [];

    ERAS.forEach((era, idx) => {
      const tabX = tabWidth * idx + tabWidth / 2;
      const isUnlocked = Storage.isEraUnlocked(era.id);

      const tabBg = this.add.rectangle(tabX, tabY, tabWidth - 8, 36, idx === this.selectedEraIndex ? 0xd4af37 : 0x221d19)
        .setInteractive({ useHandCursor: true })
        .setDepth(5);

      const label = this.add.text(tabX, tabY, era.name.split(' ')[1] || era.name, {
        fontSize: '13px',
        fontFamily: 'sans-serif',
        color: idx === this.selectedEraIndex ? '#141210' : (isUnlocked ? '#bdc3c7' : '#555555'),
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(6);

      tabBg.on('pointerdown', () => {
        this.selectedEraIndex = idx;
        this.updateTabStyles();
        this.renderEraLevels();
      });

      this.tabButtons.push({ tabBg, label, eraId: era.id });
    });
  }

  updateTabStyles() {
    this.tabButtons.forEach((tab, idx) => {
      const isSelected = idx === this.selectedEraIndex;
      const isUnlocked = Storage.isEraUnlocked(tab.eraId);

      tab.tabBg.setFillStyle(isSelected ? 0xd4af37 : 0x221d19);
      tab.label.setColor(isSelected ? '#141210' : (isUnlocked ? '#bdc3c7' : '#555555'));
    });
  }

  renderEraLevels() {
    const { width, height } = this.scale;

    this.renderedElements.forEach(el => el.destroy());
    this.renderedElements = [];

    const era = ERAS[this.selectedEraIndex];
    const isUnlocked = Storage.isEraUnlocked(era.id);

    if (!isUnlocked) {
      const lockBg = this.add.rectangle(width / 2, height * 0.45, width * 0.88, 360, 0x141210, 0.9)
        .setStrokeStyle(1.5, 0x444444).setDepth(3);
      const lockIcon = this.add.image(width / 2, height * 0.38, 'icon_lock').setScale(1.5).setDepth(4);
      const lockText = this.add.text(width / 2, height * 0.48, `${era.name.toUpperCase()}\nЗАБЛОКИРОВАНА`, {
        fontSize: '18px',
        fontFamily: 'sans-serif',
        color: '#7f8c8d',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5).setDepth(4);

      const hintText = this.add.text(width / 2, height * 0.56, 'Отреставрируйте все предметы\nпредыдущей эпохи.', {
        fontSize: '13px',
        fontFamily: 'sans-serif',
        color: '#555555',
        align: 'center'
      }).setOrigin(0.5).setDepth(4);

      this.renderedElements.push(lockBg, lockIcon, lockText, hintText);
      return;
    }

    const eraArtifacts = ARTIFACTS.filter(a => a.eraId === era.id);
    const unlocked = Storage.getUnlockedArtifacts();

    const startY = 120;
    const cardH = 160;

    eraArtifacts.forEach((item, idx) => {
      const cardY = startY + idx * cardH;
      const isRestored = unlocked.includes(item.id);
      const isPlayable = (idx === 0) || unlocked.includes(eraArtifacts[idx - 1].id) || isRestored;

      const bg = this.add.rectangle(width / 2, cardY + 55, width * 0.9, 135, isPlayable ? 0x221d19 : 0x161413, 0.92)
        .setStrokeStyle(1.5, isPlayable ? 0xd4af37 : 0x333333, 0.8)
        .setDepth(3);

      if (isPlayable) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => {
          const globalIdx = ARTIFACTS.findIndex(a => a.id === item.id);
          Storage.set('level_index', globalIdx);
          this.scene.start('RestoreScene');
        });
      }

      const thumb = this.add.image(width * 0.22, cardY + 55, item.textureKey)
        .setScale(0.26)
        .setDepth(4);

      if (!isPlayable) {
        thumb.setTint(0x111111).setAlpha(0.3);
      }

      const textX = width * 0.38;
      const title = this.add.text(textX, cardY + 16, item.name, {
        fontSize: '16px',
        fontFamily: 'sans-serif',
        color: isPlayable ? '#ffffff' : '#666666',
        fontStyle: 'bold'
      }).setDepth(4);

      const desc = this.add.text(textX, cardY + 40, item.museumDesc, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: isPlayable ? '#bdc3c7' : '#444444',
        wordWrap: { width: width * 0.52 }
      }).setDepth(4);

      let statusLabel = '🔒 ЗАБЛОКИРОВАНО';
      let statusColor = '#555555';
      if (isRestored) {
        statusLabel = '✓ ОТРЕСТАВРИРОВАНО';
        statusColor = '#2ecc71';
      } else if (isPlayable) {
        statusLabel = '▶ НА ВЕРСТАК';
        statusColor = '#f39c12';
      }

      const status = this.add.text(textX, cardY + 86, statusLabel, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: statusColor,
        fontStyle: 'bold'
      }).setDepth(4);

      this.renderedElements.push(bg, thumb, title, desc, status);
    });
  }
}
