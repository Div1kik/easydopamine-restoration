import { AudioManager } from '../utils/AudioManager.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const artifact = (data && data.artifact) ? data.artifact : { name: 'Артефакт', marketValue: 200 };
    const starsCount = (data && data.stars) ? data.stars : 3;

    this.add.rectangle(width / 2, height / 2, width, height, 0x07090e).setDepth(0);

    // Заголовок победы
    const title = this.add.text(width / 2, height * 0.12, 'РЕСТАВРАЦИЯ ЗАВЕРШЕНА!', {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: height * 0.12 - 4,
      duration: 600,
      ease: 'Quad.easeOut'
    });

    // КАСКАДНАЯ АНИМАЦИЯ ПОЯВЛЕНИЯ ЗВЕЗД
    const starSpacing = 64;
    const starStartX = width / 2 - starSpacing;

    for (let i = 0; i < 3; i++) {
      const isFilled = (i < starsCount);
      const starKey = isFilled ? 'icon_star' : 'icon_star_empty';
      const posX = starStartX + i * starSpacing;
      const posY = height * 0.20;

      const star = this.add.image(posX, posY, starKey)
        .setScale(0)
        .setAlpha(0)
        .setDepth(10);

      // Вспышка позади звезды
      const flash = this.add.circle(posX, posY, 32, 0xfde047, 0)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(9);

      this.time.delayedCall(300 + i * 220, () => {
        if (isFilled && AudioManager.playStarChime) {
          AudioManager.playStarChime(i);
        }

        // Вылет с эффектом отдачи (Back.easeOut)
        this.tweens.add({
          targets: star,
          scale: 0.95,
          alpha: 1,
          duration: 450,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Лёгкое парение
            this.tweens.add({
              targets: star,
              y: posY - 5,
              duration: 1200 + i * 150,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        });

        // Световой импульс
        if (isFilled) {
          this.tweens.add({
            targets: flash,
            alpha: { from: 0.8, to: 0 },
            scale: { from: 0.4, to: 1.5 },
            duration: 400,
            ease: 'Quad.easeOut'
          });
        }
      });
    }

    // Артефакт
    const tex = this.textures.exists(artifact.textureKey) ? artifact.textureKey : 'art_egypt_scarab';
    const artImg = this.add.image(width / 2, height * 0.44, tex)
      .setScale(0)
      .setDepth(10);

    this.tweens.add({
      targets: artImg,
      scale: 0.85,
      duration: 650,
      delay: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: artImg,
          scaleX: 0.88,
          scaleY: 0.88,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // Название и музейная оценка
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

    // КНОПКА: В ГЛАВНОЕ МЕНЮ
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
