import { ARTIFACTS, ERAS } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MuseumScene extends Phaser.Scene {
  constructor() {
    super('MuseumScene');
  }

  create() {
    const { width, height } = this.scale;
    this.currentEraIndex = 0;

    this.add.image(width / 2, height / 2, 'bg_workshop').setDepth(0);

    // Заголовок
    this.add.text(width / 2, 38, 'МУЗЕЙНАЯ ВИТРИНА', {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#d4af37',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(2);

    // Баланс
    this.balanceText = this.add.text(width / 2, 65, `Баланс: ${Storage.getCoins()} золота`, {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    this.container = this.add.container(0, 0).setDepth(3);

    this.createTabs();
    this.renderEraCards();

    // Кнопка возврата в меню
    const backBtn = this.add.rectangle(width / 2, height - 42, 220, 44, 0x34495e)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.add.text(width / 2, height - 42, 'В главное меню', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  createTabs() {
    const { width } = this.scale;
    const tabY = 95;
    const tabWidth = width / ERAS.length;
    this.tabButtons = [];

    ERAS.forEach((era, idx) => {
      const tabX = tabWidth * idx + tabWidth / 2;
      const isUnlocked = Storage.isEraUnlocked(era.id);

      const tabBg = this.add.rectangle(tabX, tabY, tabWidth - 6, 32, idx === this.currentEraIndex ? 0xd4af37 : 0x221d19)
        .setInteractive({ useHandCursor: true }).setDepth(4);

      const label = this.add.text(tabX, tabY, era.name.split(' ')[1] || era.name, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: idx === this.currentEraIndex ? '#141210' : (isUnlocked ? '#bdc3c7' : '#555555'),
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(5);

      tabBg.on('pointerdown', () => {
        this.currentEraIndex = idx;
        this.updateTabStyles();
        this.renderEraCards();
      });

      this.tabButtons.push({ tabBg, label, eraId: era.id });
    });
  }

  updateTabStyles() {
    this.tabButtons.forEach((tab, idx) => {
      const isSelected = idx === this.currentEraIndex;
      const isUnlocked = Storage.isEraUnlocked(tab.eraId);
      tab.tabBg.setFillStyle(isSelected ? 0xd4af37 : 0x221d19);
      tab.label.setColor(isSelected ? '#141210' : (isUnlocked ? '#bdc3c7' : '#555555'));
    });
  }

  renderEraCards() {
    const { width } = this.scale;
    this.container.removeAll(true);

    const era = ERAS[this.currentEraIndex];
    const isUnlocked = Storage.isEraUnlocked(era.id);

    if (!isUnlocked) {
      const lockBg = this.add.rectangle(width / 2, 380, width * 0.88, 360, 0x141210, 0.9)
        .setStrokeStyle(1.5, 0x444444);
      const lockIcon = this.add.image(width / 2, 340, 'icon_lock').setScale(1.5);
      const lockText = this.add.text(width / 2, 420, `${era.name.toUpperCase()}\nЗАБЛОКИРОВАНА`, {
        fontSize: '18px',
        fontFamily: 'sans-serif',
        color: '#7f8c8d',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);
      this.container.add([lockBg, lockIcon, lockText]);
      return;
    }

    const eraArtifacts = ARTIFACTS.filter(a => a.eraId === era.id);
    const unlocked = Storage.getUnlockedArtifacts();

    const startY = 135;
    const cardH = 165;

    eraArtifacts.forEach((item, idx) => {
      const cardY = startY + idx * cardH;
      const isRestored = unlocked.includes(item.id);
      const replicaPrice = Math.round((item.reward || 120) * 0.7);

      const bg = this.add.rectangle(width / 2, cardY + 55, width * 0.9, 140, isRestored ? 0x221d19 : 0x161413, 0.95)
        .setStrokeStyle(1.5, isRestored ? 0xd4af37 : 0x333333, 0.8);

      const thumb = this.add.image(width * 0.22, cardY + 55, item.textureKey).setScale(0.26);
      if (!isRestored) thumb.setTint(0x111111).setAlpha(0.3);

      const textX = width * 0.38;
      const title = this.add.text(textX, cardY + 14, item.name, {
        fontSize: '15px',
        fontFamily: 'sans-serif',
        color: isRestored ? '#ffffff' : '#666666',
        fontStyle: 'bold'
      });

      const desc = this.add.text(textX, cardY + 36, isRestored ? item.museumDesc : 'Отреставрируйте экспонат, чтобы выставить в витрине.', {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: isRestored ? '#bdc3c7' : '#444444',
        wordWrap: { width: width * 0.52 }
      });

      this.container.add([bg, thumb, title, desc]);

      if (isRestored) {
        // Кнопка 1: 3D Осмотр
        const inspectBtn = this.add.rectangle(textX + 40, cardY + 95, 80, 28, 0x2980b9)
          .setInteractive({ useHandCursor: true });
        const inspectTxt = this.add.text(textX + 40, cardY + 95, 'ОСМОТР', {
          fontSize: '10px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        inspectBtn.on('pointerdown', () => {
          this.scene.start('ArtifactDetailScene', { artifact: item });
        });

        // Кнопка 2: Продать реплику коллекционеру за золото
        const sellBtn = this.add.rectangle(textX + 135, cardY + 95, 95, 28, 0xe67e22)
          .setInteractive({ useHandCursor: true });
        const sellTxt = this.add.text(textX + 135, cardY + 95, `ПРОДАТЬ +${replicaPrice}`, {
          fontSize: '10px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        sellBtn.on('pointerdown', () => {
          Storage.sellArtifactReplica(item.id, replicaPrice);
          AudioManager.playCoin();
          this.balanceText.setText(`Баланс: ${Storage.getCoins()} золота`);

          sellBtn.setFillStyle(0x27ae60);
          sellTxt.setText('ПРОДАНО!');
          this.time.delayedCall(800, () => {
            sellBtn.setFillStyle(0xe67e22);
            sellTxt.setText(`ПРОДАТЬ +${replicaPrice}`);
          });
        });

        this.container.add([inspectBtn, inspectTxt, sellBtn, sellTxt]);
      }
    });
  }
}
