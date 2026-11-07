import { Storage } from '../utils/Storage.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, 'bg_workshop').setDepth(0);

    // Панель логотипа
    this.add.rectangle(width / 2, height * 0.25, width * 0.86, 160, 0x1f1b18, 0.9)
      .setStrokeStyle(2, 0xd4af37, 0.5)
      .setDepth(1);

    this.add.text(width / 2, height * 0.19, 'EASY DOPAMINE GAMES', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#e67e22',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5).setDepth(2);

    this.add.text(width / 2, height * 0.26, 'АРТЕФАКТЫ\nВРЕМЕНИ', {
      fontSize: '28px',
      fontFamily: 'sans-serif',
      color: '#f5f6fa',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(2);

    // Баланс
    const coins = Storage.getCoins();
    this.add.text(width / 2, height * 0.39, `Баланс: ${coins} золота`, {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // 1. Кнопка «ВЕРСТАК МАСТЕРА»
    const playBtn = this.add.rectangle(width / 2, height * 0.53, 260, 56, 0x27ae60)
      .setInteractive({ useHandCursor: true })
      .setDepth(5);

    this.add.text(width / 2, height * 0.53, 'ВЕРСТАК МАСТЕРА', {
      fontSize: '17px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);

    playBtn.on('pointerdown', () => {
      this.scene.start('EraSelectScene');
    });

    // 2. Кнопка «МУЗЕЙНАЯ ВИТРИНА»
    const museumBtn = this.add.rectangle(width / 2, height * 0.63, 260, 56, 0x2c3e50)
      .setInteractive({ useHandCursor: true })
      .setDepth(5);

    this.add.text(width / 2, height * 0.63, 'МУЗЕЙНАЯ ВИТРИНА', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);

    museumBtn.on('pointerdown', () => {
      this.scene.start('MuseumScene');
    });

    // 3. Звук
    this.createMuteButton(width - 36, 36);
  }

  createMuteButton(x, y) {
    const btn = this.add.image(x, y, 'icon_speaker')
      .setInteractive({ useHandCursor: true })
      .setDepth(10);
    const line = this.add.line(0, 0, x - 12, y - 12, x + 12, y + 12, 0xe74c3c, 3)
      .setOrigin(0)
      .setDepth(11);

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
