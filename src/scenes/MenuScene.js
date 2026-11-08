import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Глубокий градиентный фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x090c15).setDepth(0);

    // Декоративные световые круги
    const glow1 = this.add.circle(width * 0.2, height * 0.25, 140, 0x1e293b, 0.25);
    const glow2 = this.add.circle(width * 0.8, height * 0.7, 160, 0x312e81, 0.15);

    // Логотип и заголовки с субпиксельным сглаживанием
    this.add.text(width / 2, height * 0.18, 'АРТЕФАКТЫ ВРЕМЕНИ', {
      fontSize: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 3,
      resolution: 2
    }).setOrigin(0.5).setDepth(10);

    this.add.text(width / 2, height * 0.22, 'Мастерская реставратора', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#94a3b8',
      letterSpacing: 1,
      resolution: 2
    }).setOrigin(0.5).setDepth(10);

    // Центральная парящая иконка артефакта
    const icon = this.add.image(width / 2, height * 0.38, 'art_egypt_scarab')
      .setDisplaySize(130, 130)
      .setDepth(10);

    this.tweens.add({
      targets: icon,
      y: height * 0.38 - 12,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Навигационные кнопки с монолитным хитбоксом
    const createBtn = (y, text, colorBg, colorStroke, textColor, callback) => {
      const btn = this.add.rectangle(width / 2, y, width * 0.82, 52, colorBg)
        .setStrokeStyle(1.5, colorStroke, 0.9)
        .setInteractive({ useHandCursor: true })
        .setDepth(20);

      const label = this.add.text(width / 2, y, text, {
        fontSize: '15px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: textColor,
        fontStyle: 'bold',
        resolution: 2
      }).setOrigin(0.5).setDepth(21);

      btn.on('pointerdown', () => {
        if (AudioManager.playClick) AudioManager.playClick();
        this.tweens.add({
          targets: [btn, label],
          scale: 0.96,
          duration: 70,
          yoyo: true,
          onComplete: callback
        });
      });
    };

    const startY = height * 0.54;
    createBtn(startY, '▶ ЭКСПЕДИЦИИ', 0x10b981, 0x34d399, '#ffffff', () => {
      this.scene.start('EraSelectScene');
    });

    createBtn(startY + 66, '🏛 МУЗЕЙНАЯ ВИТРИНА', 0x131a29, 0x3b82f6, '#93c5fd', () => {
      this.scene.start('MuseumScene');
    });

    createBtn(startY + 132, '🛒 ЛАВКА МАСТЕРА', 0x161c24, 0xe2b35b, '#fde047', () => {
      this.scene.start('ShopScene');
    });

    // Монеты внизу экрана
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.add.text(width / 2, height - 36, `Казна: ${coins} 💰`, {
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: 2
    }).setOrigin(0.5).setDepth(10);
  }
}
