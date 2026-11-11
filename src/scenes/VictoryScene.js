import { AudioManager } from '../utils/AudioManager.js';
import { Storage } from '../utils/Storage.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const artifact = (data && data.artifact)
      ? data.artifact
      : { name: 'Артефакт', marketValue: 200 };
    const starsCount = (data && data.stars) ? data.stars : 3;

    this.add.rectangle(width / 2, height / 2, width, height, 0x07090e).setDepth(0);

    // Заголовок победы
    const title = this.add.text(width / 2, height * 0.10, 'РЕСТАВРАЦИЯ ЗАВЕРШЕНА!', {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: height * 0.10 - 4,
      duration: 600,
      ease: 'Quad.easeOut'
    });

    // Каскадная анимация звезд
    const starSpacing = 64;
    const starStartX = width / 2 - starSpacing;

    for (let i = 0; i < 3; i++) {
      const isFilled = (i < starsCount);
      const starKey = isFilled ? 'icon_star' : 'icon_star_empty';
      const posX = starStartX + i * starSpacing;
      const posY = height * 0.17;

      const star = this.add.image(posX, posY, starKey)
        .setScale(0)
        .setAlpha(0)
        .setDepth(10);

      const flash = this.add.circle(posX, posY, 32, 0xfde047, 0)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(9);

      this.time.delayedCall(250 + i * 200, () => {
        if (isFilled && AudioManager.playStarChime) {
          AudioManager.playStarChime(i);
        }

        this.tweens.add({
          targets: star,
          scale: 0.95,
          alpha: 1,
          duration: 400,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: star,
              y: posY - 4,
              duration: 1200 + i * 150,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        });

        if (isFilled) {
          this.tweens.add({
            targets: flash,
            alpha: { from: 0.8, to: 0 },
            scale: { from: 0.4, to: 1.5 },
            duration: 380,
            ease: 'Quad.easeOut'
          });
        }
      });
    }

    // Артефакт
    const tex = this.textures.exists(artifact.textureKey)
      ? artifact.textureKey
      : 'art_egypt_scarab';

    const artImg = this.add.image(width / 2, height * 0.38, tex)
      .setScale(0)
      .setDepth(10);

    this.tweens.add({
      targets: artImg,
      scale: 0.78,
      duration: 600,
      delay: 450,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: artImg,
          scaleX: 0.81,
          scaleY: 0.81,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // Название и ценность
    this.add.text(width / 2, height * 0.55, artifact.name, {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    this.add.text(width / 2, height * 0.59, `Музейная оценка: +${artifact.marketValue || 200} 🪙`, {
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#22c55e',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    // Блок Прогресса Опыта и Уровня
    this.createExperienceBar(width, height);

    // Кнопка: В главное меню
    const menuBtn = this.add.rectangle(
      width / 2,
      height * 0.79,
      width * 0.84,
      46,
      0x161e2c
    )
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);

    this.add.text(width / 2, height * 0.79, '🗂️ В главное меню', {
      fontSize: '15px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);

    menuBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });

    // Кнопка: Следующий артефакт
    const nextBtn = this.add.rectangle(
      width / 2,
      height * 0.87,
      width * 0.84,
      48,
      0x10b981
    )
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

  createExperienceBar(width, height) {
    const xpBoxY = height * 0.67;
    const barW = width * 0.78;

    const initialLvl = Storage.getLevelData();

    const xpLabel = this.add.text(width / 2 - barW / 2, xpBoxY - 14, `УР. ${initialLvl.level} • ${initialLvl.title}`, {
      fontSize: '11.5px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#cbd5e1',
      fontStyle: 'bold'
    }).setDepth(15);

    const xpNum = this.add.text(width / 2 + barW / 2, xpBoxY - 14, `+100 XP`, {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(15);

    this.add.rectangle(width / 2, xpBoxY + 4, barW, 8, 0x111827).setDepth(14);
    const xpFill = this.add.rectangle(width / 2 - barW / 2, xpBoxY + 4, barW * initialLvl.progressRatio, 8, 0x38bdf8)
      .setOrigin(0, 0.5).setDepth(15);

    this.time.delayedCall(700, () => {
      const result = Storage.addXP(100);
      const updatedLvl = Storage.getLevelData();

      this.tweens.add({
        targets: xpFill,
        width: barW * (result.leveledUp ? 1 : updatedLvl.progressRatio),
        duration: 700,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          if (result.leveledUp) {
            Storage.addCoins(150);
            this.showLevelUpModal(width, height, result.newLevel, result.newTitle);
          }
        }
      });
    });
  }

  showLevelUpModal(width, height, level, title) {
    if (AudioManager.playShine) AudioManager.playShine();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
      .setInteractive().setDepth(50);

    const card = this.add.container(width / 2, height / 2).setDepth(51).setScale(0);

    const cardBg = this.add.rectangle(0, 0, width * 0.84, 210, 0x111622)
      .setStrokeStyle(2, 0xe2b35b, 0.95);

    const badge = this.add.text(0, -65, '⭐ НОВЫЙ РАНГ! ⭐', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#facc15',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    const rankText = this.add.text(0, -32, `УРОВЕНЬ ${level}`, {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const titleText = this.add.text(0, -5, `«${title}»`, {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#94a3b8'
    }).setOrigin(0.5);

    const rewardText = this.add.text(0, 26, `Награда: +150 🪙 казны\nРасширена вместимость музея!`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#22c55e',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const okBtn = this.add.rectangle(0, 72, width * 0.60, 36, 0x16241a)
      .setStrokeStyle(1.5, 0x22c55e, 0.9)
      .setInteractive({ useHandCursor: true });

    const okTxt = this.add.text(0, 72, 'ЗАБРАТЬ НАГРАДУ', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    card.add([cardBg, badge, rankText, titleText, rewardText, okBtn, okTxt]);

    this.tweens.add({
      targets: card,
      scale: 1,
      duration: 350,
      ease: 'Back.easeOut'
    });

    okBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      overlay.destroy();
      card.destroy();
    });
  }
}
