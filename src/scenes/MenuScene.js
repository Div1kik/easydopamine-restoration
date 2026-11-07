import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;

    AudioManager.playMenuMusic();

    this.add.image(width / 2, height / 2, `bg_workshop_tier_${tier}`).setDepth(0);

    // Парящая карточка бренда (Dark Glassmorphism)
    const brandCard = this.add.rectangle(width / 2, height * 0.20, width * 0.88, 140, 0x141820, 0.75)
      .setStrokeStyle(1.5, 0xffffff, 0.1)
      .setDepth(1);

    this.add.text(width / 2, height * 0.15, 'EASY DOPAMINE GAMES', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f59e0b',
      fontStyle: 'bold',
      letterSpacing: 4
    }).setOrigin(0.5).setDepth(2);

    this.add.text(width / 2, height * 0.22, 'АРТЕФАКТЫ\nВРЕМЕНИ', {
      fontSize: '26px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5).setDepth(2);

    // Блок статуса мастера
    const lvl = Storage.getMasterLevel ? Storage.getMasterLevel() : 1;
    const xp = Storage.getXP ? Storage.getXP() : 0;
    const thresholds = [0, 350, 900, 1800, 3200, 6000];
    const currentBase = thresholds[lvl - 1] || 0;
    const nextBase = thresholds[lvl] || 6000;
    const currentLvlXP = xp - currentBase;
    const neededLvlXP = nextBase - currentBase;
    const progressRatio = Math.min(Math.max(currentLvlXP / neededLvlXP, 0), 1);

    const tierNames = ['', 'Базовая мастерская', 'Лавка древностей', 'Гильдия реставраторов', 'Императорская галерея'];

    this.add.text(width / 2, height * 0.33, `МАСТЕР ${lvl} РАНГА  •  ${tierNames[tier].toUpperCase()}`, {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#94a3b8',
      fontStyle: 'bold',
      letterSpacing: 1.5
    }).setOrigin(0.5).setDepth(2);

    // Минималистичный гладкий прогресс-бар XP
    const barW = width * 0.74;
    this.add.rectangle(width / 2, height * 0.365, barW, 8, 0x1e2430)
      .setDepth(2);

    this.add.rectangle(width / 2 - barW / 2, height * 0.365, barW * progressRatio, 8, 0xf59e0b)
      .setOrigin(0, 0.5)
      .setDepth(3);

    this.add.text(width / 2, height * 0.395, `${xp} / ${nextBase} XP`, {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#64748b'
    }).setOrigin(0.5).setDepth(2);

    // Монеты
    const coins = Storage.getCoins();
    this.add.text(width / 2, height * 0.44, `${coins} ЗОЛОТА`, {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#fbbf24',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(2);

    // Кнопки навигации с мягким пружинящим эффектом (Spring feedback)
    this.createModernButton(width / 2, height * 0.54, 'ВЕРСТАК МАСТЕРА', 0x10b981, () => {
      AudioManager.stopMusic();
      this.scene.start('EraSelectScene');
    });

    this.createModernButton(width / 2, height * 0.63, 'МАСТЕРСКАЯ И ЛАВКА', 0xf59e0b, () => {
      AudioManager.stopMusic();
      this.scene.start('ShopScene');
    });

    this.createModernButton(width / 2, height * 0.72, 'ВИТРИНА РЕДКОСТЕЙ', 0x3b82f6, () => {
      AudioManager.stopMusic();
      this.scene.start('MuseumScene');
    });

    this.createMuteButton(width - 36, 36);
  }

  createModernButton(x, y, text, accentColor, onClick) {
    const btnContainer = this.add.container(x, y).setDepth(5);

    const bg = this.add.rectangle(0, 0, 260, 52, 0x161b24, 0.95)
      .setStrokeStyle(1.5, accentColor, 0.7)
      .setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 1.5
    }).setOrigin(0.5);

    btnContainer.add([bg, label]);

    bg.on('pointerdown', () => {
      this.tweens.add({
        targets: btnContainer,
        scale: 0.95,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeInOut',
        onComplete: onClick
      });
    });
  }

  createMuteButton(x, y) {
    const btn = this.add.image(x, y, 'icon_speaker').setInteractive({ useHandCursor: true }).setDepth(10);
    const line = this.add.line(0, 0, x - 12, y - 12, x + 12, y + 12, 0xef4444, 2.5).setOrigin(0).setDepth(11);

    const updateIcon = () => {
      line.setVisible(Storage.isMuted());
      btn.setAlpha(Storage.isMuted() ? 0.35 : 1);
    };

    updateIcon();

    btn.on('pointerdown', () => {
      AudioManager.toggleMute();
      updateIcon();
    });
  }
}
