import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;

    // Включаем уютную музыку главного меню
    AudioManager.playMenuMusic();

    this.add.image(width / 2, height / 2, `bg_workshop_tier_${tier}`).setDepth(0);

    // Панель логотипа
    this.add.rectangle(width / 2, height * 0.21, width * 0.88, 140, 0x0c0f14, 0.88)
      .setStrokeStyle(1.5, 0xc5a059, 0.85)
      .setDepth(1);

    this.add.text(width / 2, height * 0.16, 'EASY DOPAMINE GAMES', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#d97706',
      fontStyle: 'bold',
      letterSpacing: 4
    }).setOrigin(0.5).setDepth(2);

    this.add.text(width / 2, height * 0.23, 'АРТЕФАКТЫ\nВРЕМЕНИ', {
      fontSize: '28px',
      fontFamily: 'sans-serif',
      color: '#f8fafc',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5).setDepth(2);

    // БЛОК ОПЫТА И ПРОГРЕССА МАСТЕРА
    const lvl = Storage.getMasterLevel ? Storage.getMasterLevel() : 1;
    const xp = Storage.getXP ? Storage.getXP() : 0;
    const thresholds = [0, 350, 900, 1800, 3200, 6000];
    const currentBase = thresholds[lvl - 1] || 0;
    const nextBase = thresholds[lvl] || 6000;
    const currentLvlXP = xp - currentBase;
    const neededLvlXP = nextBase - currentBase;
    const progressRatio = Math.min(Math.max(currentLvlXP / neededLvlXP, 0), 1);

    const tierNames = ['', 'Сырой подвал', 'Лавка древностей', 'Гильдия мастеров', 'Императорская галерея'];

    this.add.text(width / 2, height * 0.33, `МАСТЕР ${lvl} РАНГА  •  ${tierNames[tier].toUpperCase()}`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#cbd5e1',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(2);

    // Шкала XP
    const barW = width * 0.72;
    this.add.rectangle(width / 2, height * 0.365, barW, 12, 0x1e2430)
      .setStrokeStyle(1, 0x475569)
      .setDepth(2);

    this.add.rectangle(width / 2 - barW / 2, height * 0.365, barW * progressRatio, 10, 0xf59e0b)
      .setOrigin(0, 0.5)
      .setDepth(3);

    this.add.text(width / 2, height * 0.39, `Опыт: ${xp} / ${nextBase} XP`, {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#94a3b8'
    }).setOrigin(0.5).setDepth(2);

    const coins = Storage.getCoins();
    this.add.text(width / 2, height * 0.43, `Казна: ${coins} золота`, {
      fontSize: '19px',
      fontFamily: 'sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // Кнопки меню
    this.createMenuButton(width / 2, height * 0.53, 'ВЕРСТАК МАСТЕРА', 0x15803d, () => {
      AudioManager.stopMusic();
      this.scene.start('EraSelectScene');
    });

    this.createMenuButton(width / 2, height * 0.62, 'МАСТЕРСКАЯ И ЛАВКА', 0xb45309, () => {
      AudioManager.stopMusic();
      this.scene.start('ShopScene');
    });

    this.createMenuButton(width / 2, height * 0.71, 'ВИТРИНА РЕДКОСТЕЙ', 0x1d4ed8, () => {
      AudioManager.stopMusic();
      this.scene.start('MuseumScene');
    });

    this.createMuteButton(width - 36, 36);
  }

  createMenuButton(x, y, text, color, onClick) {
    const btn = this.add.rectangle(x, y, 260, 52, color, 0.95)
      .setStrokeStyle(1.5, 0xffffff, 0.35)
      .setInteractive({ useHandCursor: true })
      .setDepth(5);

    this.add.text(x, y, text, {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(6);

    btn.on('pointerdown', onClick);
  }

  createMuteButton(x, y) {
    const btn = this.add.image(x, y, 'icon_speaker').setInteractive({ useHandCursor: true }).setDepth(10);
    const line = this.add.line(0, 0, x - 12, y - 12, x + 12, y + 12, 0xef4444, 3).setOrigin(0).setDepth(11);

    const updateIcon = () => {
      line.setVisible(Storage.isMuted());
      btn.setAlpha(Storage.isMuted() ? 0.4 : 1);
    };

    updateIcon();

    btn.on('pointerdown', () => {
      AudioManager.toggleMute();
      updateIcon();
    });
  }
}
