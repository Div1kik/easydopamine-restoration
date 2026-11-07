import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;

    // Глубокий монолитный фон кабинета
    this.add.image(width / 2, height / 2, `bg_workshop_tier_${tier}`).setDepth(0);

    // Панель заголовка (матовый графит с мягким золотым тиснением)
    this.add.rectangle(width / 2, height * 0.23, width * 0.88, 150, 0x0c0f14, 0.88)
      .setStrokeStyle(1.5, 0xc5a059, 0.85)
      .setDepth(1);

    this.add.text(width / 2, height * 0.17, 'EASY DOPAMINE GAMES', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#d97706',
      fontStyle: 'bold',
      letterSpacing: 4
    }).setOrigin(0.5).setDepth(2);

    this.add.text(width / 2, height * 0.24, 'АРТЕФАКТЫ\nВРЕМЕНИ', {
      fontSize: '28px',
      fontFamily: 'sans-serif',
      color: '#f8fafc',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5).setDepth(2);

    const coins = Storage.getCoins();
    const lvl = Storage.getMasterLevel ? Storage.getMasterLevel() : 1;
    const tierNames = ['', 'Сырой подвал', 'Лавка древностей', 'Гильдия мастеров', 'Императорский музей'];

    this.add.text(width / 2, height * 0.36, `Мастер ${lvl} ранга  •  ${tierNames[tier]}`, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#94a3b8'
    }).setOrigin(0.5).setDepth(2);

    this.add.text(width / 2, height * 0.40, `Казна: ${coins} золота`, {
      fontSize: '19px',
      fontFamily: 'sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // Кнопки интерфейса с мягким свечением
    this.createMenuButton(width / 2, height * 0.52, 'ВЕРСТАК МАСТЕРА', 0x15803d, () => {
      this.scene.start('EraSelectScene');
    });

    this.createMenuButton(width / 2, height * 0.61, 'МАСТЕРСКАЯ И ЛАВКА', 0xb45309, () => {
      this.scene.start('ShopScene');
    });

    this.createMenuButton(width / 2, height * 0.70, 'ВИТРИНА РЕДКОСТЕЙ', 0x1d4ed8, () => {
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
