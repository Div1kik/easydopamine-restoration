import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Глубокий темный фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x090c15).setDepth(0);

    // Студийный лейбл Easy Dopamine Games
    this.add.text(width / 2, height * 0.11, 'EASY DOPAMINE GAMES', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5).setAlpha(0.85).setDepth(10);

    // Тонкая золотая полоска-разделитель под студией
    const divider = this.add.graphics().setDepth(10);
    divider.lineStyle(1, 0xd4af37, 0.4);
    divider.lineBetween(width / 2 - 50, height * 0.125, width / 2 + 50, height * 0.125);

    // Название игры
    this.add.text(width / 2, height * 0.165, 'АРТЕФАКТЫ ВРЕМЕНИ', {
      fontSize: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(10);

    this.add.text(width / 2, height * 0.205, 'Мастерская реставратора', {
      fontSize: '12.5px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#94a3b8',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(10);

    // Центральный парящий артефакт
    const logoKey = this.textures.exists('art_egypt_scarab') ? 'art_egypt_scarab' : null;
    if (logoKey) {
      const logo = this.add.image(width / 2, height * 0.36, logoKey)
        .setDisplaySize(110, 110)
        .setDepth(10);

      this.tweens.add({
        targets: logo,
        y: height * 0.36 - 10,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Кнопки навигации
    const createBtn = (y, text, colorBg, colorStroke, textColor, callback) => {
      const btn = this.add.rectangle(width / 2, y, width * 0.82, 50, colorBg)
        .setStrokeStyle(1.5, colorStroke, 0.9)
        .setInteractive({ useHandCursor: true })
        .setDepth(20);

      const label = this.add.text(width / 2, y, text, {
        fontSize: '15px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: textColor,
        fontStyle: 'bold'
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

    const startY = height * 0.52;
    createBtn(startY, '▶ ЭКСПЕДИЦИИ', 0x10b981, 0x34d399, '#ffffff', () => {
      this.scene.start('EraSelectScene');
    });

    createBtn(startY + 64, '🏛 МУЗЕЙНАЯ ВИТРИНА', 0x131a29, 0x3b82f6, '#93c5fd', () => {
      this.scene.start('MuseumScene');
    });

    createBtn(startY + 128, '🛒 ЛАВКА МАСТЕРА', 0x161c24, 0xe2b35b, '#fde047', () => {
      this.scene.start('ShopScene');
    });

    // Казна
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.add.text(width / 2, height - 36, `Казна: ${coins} 💰`, {
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }
}
