import { ERAS, ARTIFACTS } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';

export class EraSelectScene extends Phaser.Scene {
  constructor() {
    super('EraSelectScene');
  }

  create() {
    const { width, height } = this.scale;
    this.selectedEraIndex = 0;

    // Фон мастерской
    this.add.image(width / 2, height / 2, 'bg_workshop');

    // Шапка
    this.add.text(width / 2, 40, 'ВЫБОР ЭПОХИ', {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#d4af37',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.contentContainer = this.add.container(0, 0);

    this.createTabs();
    this.renderEraLevels();

    // Кнопка Домой
    const backBtn = this.add.rectangle(width / 2, height - 45, 220, 46, 0x34495e)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height - 45, 'В главное меню', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  createTabs() {
    const { width } = this.scale;
    const tabY = 80;
    const tabWidth = width / ERAS.length;
    this.tabButtons = [];

    ERAS.forEach((era, idx) => {
      const tabX = tabWidth * idx + tabWidth / 2;
      const isUnlocked = Storage.isEraUnlocked(era.id);

      const tabText = this.add.text(tabX, tabY, era.name.split(' ')[1] || era.name, {
        fontSize: '13px',
        fontFamily: 'sans-serif',
        color: idx === this.selectedEraIndex ? '#f1c40f' : (isUnlocked ? '#bdc3c7' : '#555555'),
        fontStyle: 'bold'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      tabText.on('pointerdown', () => {
        this.selectedEraIndex = idx;
        this.updateTabStyles();
        this.renderEraLevels();
      });

      this.tabButtons.push(tabText);
    });
  }

  updateTabStyles() {
    this.tabButtons.forEach((tab, idx) => {
      const isUnlocked = Storage.isEraUnlocked(ERAS[idx].id);
      tab.setColor(idx === this.selectedEraIndex ? '#f1c40f' : (isUnlocked ? '#bdc3c7' : '#555555'));
    });
  }

  renderEraLevels() {
    const { width, height } = this.scale;
    this.contentContainer.removeAll(true);

    const era = ERAS[this.selectedEraIndex];
    const isUnlocked = Storage.isEraUnlocked(era.id);

    if (!isUnlocked) {
      const lockBg = this.add.rectangle(width / 2, height * 0.45, width * 0.88, 360, 0x141210, 0.85)
        .setStrokeStyle(1.5, 0x444444);
      const lockIcon = this.add.image(width / 2, height * 0.40, 'icon_lock').setScale(1.5);
      const lockText = this.add.text(width / 2, height * 0.50, `${era.name.toUpperCase()}\nЗАБЛОКИРОВАНА`, {
        fontSize: '18px',
        fontFamily: 'sans-serif',
        color: '#7f8c8d',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);
      this.contentContainer.add([lockBg, lockIcon, lockText]);
      return;
    }

    const eraArtifacts = ARTIFACTS.filter(a => a.eraId === era.id);
    const unlocked = Storage.getUnlockedArtifacts();

    const startY = 125;
    const cardH = 160;

    eraArtifacts.forEach((item, idx) => {
      const cardY = startY + idx * cardH;
      // Предмет открыт, если он уже отреставрирован ИЛИ он первый в эпохе ИЛИ прошлый предмет эпохи уже сдан
      const isRestored = unlocked.includes(item.id);
      const isPlayable = idx === 0 || unlocked.includes(eraArtifacts[idx - 1].id);

      const bg = this.add.rectangle(width / 2, cardY + 55, width * 0.9, 135, isPlayable ? 0x221d19 : 0x161413, 0.9)
        .setStrokeStyle(1.5, isPlayable ? 0xd4af37 : 0x333333, 0.8);

      if (isPlayable) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => {
          // Находим глобальный индекс предмета
          const globalIdx = ARTIFACTS.findIndex(a => a.id === item.id);
          Storage.set('level_index', globalIdx);
          this.scene.start('RestoreScene');
        });
      }

      const thumb = this.add.image(width * 0.22, cardY + 55, item.textureKey).setScale(0.26);
      if (!isPlayable) {
        thumb.setTint(0x111111).setAlpha(0.3);
      }

      const textX = width * 0.38;
      const title = this.add.text(textX, cardY + 15, item.name, {
        fontSize: '16px',
        fontFamily: 'sans-serif',
        color: isPlayable ? '#ffffff' : '#666666',
        fontStyle: 'bold'
      });

      const desc = this.add.text(textX, cardY + 40, item.museumDesc, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: isPlayable ? '#bdc3c7' : '#444444',
        wordWrap: { width: width * 0.52 }
      });

      const status = this.add.text(textX, cardY + 85, isRestored ? '✓ ОТРЕСТАВРИРОВАНО' : (isPlayable ? '▶ НА ВЕРСТАК' : '🔒 ЗАБЛОКИРОВАНО'), {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: isRestored ? '#2ecc71' : (isPlayable ? '#f39c12' : '#555555'),
        fontStyle: 'bold'
      });

      this.contentContainer.add([bg, thumb, title, desc, status]);
    });
  }
}
