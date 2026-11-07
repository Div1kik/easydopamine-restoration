import { Storage } from '../utils/Storage.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, 'bg_workshop').setDepth(0);

    // Панель логотипа
    this.add.rectangle(width / 2, height * 0.23, width * 0.86, 150, 0x1f1b18, 0.9)
      .setStrokeStyle(2, 0xd4af37, 0.5)
      .setDepth(1);

    this.add.text(width / 2, height * 0.17, 'EASY DOPAMINE GAMES', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#e67e22',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5).setDepth(2);

    this.add.text(width / 2, height * 0.24, 'АРТЕФАКТЫ\nВРЕМЕНИ', {
      fontSize: '28px',
      fontFamily: 'sans-serif',
      color: '#f5f6fa',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(2);

    // Уровень мастера и монеты
    const coins = Storage.getCoins();
    const lvl = Storage.getMasterLevel();
    const tier = Storage.getWorkshopTier();
    const tierNames = ['', 'Подвал мастера', 'Лавка древностей', 'Гильдия реставраторов', 'Императорский музей'];

    this.add.text(width / 2, height * 0.36, `Мастер ${lvl} уровня  |  ${tierNames[tier]}`, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#bdc3c7'
    }).setOrigin(0.5).setDepth(2);

    this.add.text(width / 2, height * 0.40, `Баланс: ${coins} золота`, {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // 1. ВЕРСТАК (ВЫБОР ЭПОХИ)
    const playBtn = this.add.rectangle(width / 2, height * 0.51, 260, 52, 0x27ae60)
      .setInteractive({ useHandCursor: true }).setDepth(5);
    this.add.text(width / 2, height * 0.51, 'ВЕРСТАК МАСТЕРА', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    playBtn.on('pointerdown', () => this.scene.start('EraSelectScene'));

    // 2. МАСТЕРСКАЯ И МАГАЗИН (Апгрейды и новые инструменты)
    const shopBtn = this.add.rectangle(width / 2, height * 0.60, 260, 52, 0xd35400)
      .setInteractive({ useHandCursor: true }).setDepth(5);
    this.add.text(width / 2, height * 0.60, 'МАСТЕРСКАЯ И ЛАВКА', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    shopBtn.on('pointerdown', () => this.scene.start('ShopScene'));

    // 3. МУЗЕЙНАЯ ВИТРИНА
    const museumBtn = this.add.rectangle(width / 2, height * 0.69, 260, 52, 0x2c3e50)
      .setInteractive({ useHandCursor: true }).setDepth(5);
    this.add.text(width / 2, height * 0.69, 'МУЗЕЙНАЯ ВИТРИНА', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    museumBtn.on('pointerdown', () => this.scene.start('MuseumScene'));

    this.createMuteButton(width - 36, 36);
  }

  createMuteButton(x, y) {
    const btn = this.add.image(x, y, 'icon_speaker').setInteractive({ useHandCursor: true }).setDepth(10);
    const line = this.add.line(0, 0, x - 12, y - 12, x + 12, y + 12, 0xe74c3c, 3).setOrigin(0).setDepth(11);

    const updateIcon = () => {
      line.setVisible(Storage.isMuted());
      btn.setAlpha(Storage.isMuted() ? 0.5 : 1);
    };

    updateIcon();

    btn.on('pointerdown', () => {
      Storage.toggleMute();
      updateIcon();
    });
  }
}
