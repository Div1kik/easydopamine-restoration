import { AudioManager } from '../utils/AudioManager.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const artifact = (data && data.artifact) ? data.artifact : { name: 'Артефакт', marketValue: 200 };
    const starsCount = (data && data.stars) ? data.stars : 3;

    // Фон экрана победы
    this.add.rectangle(width / 2, height / 2, width, height, 0x07090e).setDepth(0);

    // Заголовок
    this.add.text(width / 2, height * 0.12, 'РЕСТАВРАЦИЯ ЗАВЕРШЕНА!', {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(10);

    // ЗОЛОТЫЕ ЗВЕЗДЫ (устранение зеленых квадратов)
    const starStartX = width / 2 - 56;
    for (let i = 0; i < 3; i++) {
      const starKey = (i < starsCount) ? 'icon_star' : 'icon_star_empty';
      const star = this.add.image(starStartX + i * 56, height * 0.20, starKey)
        .setScale(0)
        .setDepth(10);

      this.tweens.add({
        targets: star,
        scale: 0.9,
        duration: 400,
        delay: 200 + i * 150,
        ease: 'Back.easeOut'
      });
    }

    // Артефакт во всей красе
    const tex = this.textures.exists(artifact.textureKey) ? artifact.textureKey : 'art_egypt_scarab';
    const artImg = this.add.image(width / 2, height * 0.44, tex)
      .setScale(0.85)
      .setDepth(10);

    // Мягкое свечение под артефактом
    this.tweens.add({
      targets: artImg,
      scaleX: 0.88,
      scaleY: 0.88,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Название и оценка стоимости
    this.add.text(width / 2, height * 0.64, artifact.name, {
      fontSize: '22px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    this.add.text(width / 2, height * 0.69, `Музейная оценка: +${artifact.marketValue || 200} 💰`, {
      fontSize: '15px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#22c55e',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    // КНОПКА: В ГЛАВНОЕ МЕНЮ (как запрошено, остается на экране поздравления)
    const menuBtn = this.add.rectangle(width / 2, height * 0.79, width * 0.84, 48, 0x161e2c)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);

    this.add.text(width / 2, height * 0.79, '🏠 В главное меню', {
      fontSize: '15px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);

    menuBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });

    // КНОПКА: СЛЕДУЮЩИЙ АРТЕФАКТ
    const nextBtn = this.add.rectangle(width / 2, height * 0.87, width * 0.84, 48, 0x10b981)
      .setStrokeStyle(1.5, 0x34d399, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);

    this.add.text(width / 2, height * 0.87, '▶ К следующему артефакту', {
      fontSize: '15px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);

    nextBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('EraSelectScene');
    });
  }
}
