import { Storage } from '../utils/Storage.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Глубокий музейный фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x161311);

    // Золотая окантовка карточки
    this.add.rectangle(width / 2, height * 0.28, width * 0.85, 180, 0x241e1a)
      .setStrokeStyle(2, 0xd4af37, 0.4);

    this.add.text(width / 2, height * 0.22, 'EASY DOPAMINE GAMES', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#e67e22',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.29, 'АРТЕФАКТЫ\nВРЕМЕНИ', {
      fontSize: '28px',
      fontFamily: 'sans-serif',
      color: '#f5f6fa',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // Счет монет
    const coins = Storage.getCoins();
    this.add.text(width / 2, height * 0.42, `Баланс: ${coins} золота`, {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Кнопка 1: В мастерскую (играть)
    const playBtn = this.add.rectangle(width / 2, height * 0.58, 250, 56, 0x27ae60)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.58, 'В МАСТЕРСКУЮ', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    playBtn.on('pointerdown', () => {
      this.scene.start('RestoreScene');
    });

    // Кнопка 2: В музей (коллекция)
    const museumBtn = this.add.rectangle(width / 2, height * 0.68, 250, 52, 0x2c3e50)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.68, 'МУЗЕЙ ЭКСПОНАТОВ', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    museumBtn.on('pointerdown', () => {
      this.scene.start('MuseumScene');
    });

    // Переключатель звука в углу
    this.createMuteButton(width - 36, 36);
  }

  createMuteButton(x, y) {
    const btn = this.add.image(x, y, 'icon_speaker').setInteractive({ useHandCursor: true });
    const line = this.add.line(0, 0, x - 12, y - 12, x + 12, y + 12, 0xe74c3c, 3).setOrigin(0);
    
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
