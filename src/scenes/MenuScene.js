import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x090c15).setDepth(0);

    // Студийный лейбл
    this.add.text(width / 2, height * 0.08, 'EASY DOPAMINE GAMES', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5).setAlpha(0.85).setDepth(10);

    const divider = this.add.graphics().setDepth(10);
    divider.lineStyle(1, 0xd4af37, 0.4);
    divider.lineBetween(width / 2 - 50, height * 0.095, width / 2 + 50, height * 0.095);

    // Название игры
    this.add.text(width / 2, height * 0.135, 'АРТЕФАКТЫ ВРЕМЕНИ', {
      fontSize: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(10);

    this.add.text(width / 2, height * 0.175, 'Мастерская реставратора', {
      fontSize: '12.5px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#94a3b8',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(10);

    // Индикатор ранга и уровня игрока
    this.renderRankWidget(width, height * 0.22);

    // Парящий логотип
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

    // Кнопки звука
    this.createAudioToggles(width);

    // Кнопки навигации
    const createBtn = (y, text, colorBg, colorStroke, textColor, callback) => {
      const btn = this.add.rectangle(
        width / 2,
        y,
        width * 0.82,
        50,
        colorBg
      )
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

    createBtn(startY + 64, '🏛️ ВИТРИНА МАГАЗИНА', 0x131a29, 0x3b82f6, '#93c5fd', () => {
      if (AudioManager.playShopBell) AudioManager.playShopBell();
      this.scene.start('MuseumScene');
    });

    createBtn(startY + 128, '🛠️ ЛАВКА МАСТЕРА', 0x161c24, 0xe2b35b, '#fde047', () => {
      this.scene.start('ShopScene');
    });

    // Казна внизу
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.add.text(width / 2, height - 36, `Казна: ${coins} 🪙`, {
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    // Фоновая музыка
    if (!Storage.isMusicMuted()) {
      AudioManager.playEraMusic('menu');
    }

    // Проверка оффлайн-дохода музея от туристов
    this.checkOfflineEarnings(width, height);
  }

  renderRankWidget(width, y) {
    const lvlData = Storage.getLevelData();
    const boxW = width * 0.82;

    this.add.rectangle(width / 2, y, boxW, 38, 0x111622, 0.9)
      .setStrokeStyle(1, 0x273142, 0.8).setDepth(10);

    this.add.text(width / 2 - boxW / 2 + 14, y, `⭐ Ур. ${lvlData.level} • ${lvlData.title}`, {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(11);

    const barW = 80;
    const barX = width / 2 + boxW / 2 - 14 - barW;
    this.add.rectangle(barX + barW / 2, y, barW, 6, 0x1e293b).setDepth(11);
    this.add.rectangle(barX, y, barW * lvlData.progressRatio, 6, 0x38bdf8)
      .setOrigin(0, 0.5).setDepth(12);
  }

  checkOfflineEarnings(width, height) {
    const offline = Storage.getOfflineEarnings();
    if (offline && offline.coins > 0) {
      this.time.delayedCall(400, () => {
        this.showOfflineModal(width, height, offline);
      });
    }
  }

  showOfflineModal(width, height, offline) {
    if (AudioManager.playShopBell) AudioManager.playShopBell();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)
      .setInteractive().setDepth(50);

    const card = this.add.container(width / 2, height / 2).setDepth(51).setScale(0);

    const cardBg = this.add.rectangle(0, 0, width * 0.84, 200, 0x111622)
      .setStrokeStyle(2, 0x3b82f6, 0.9);

    const title = this.add.text(0, -60, '🏛️ МУЗЕЙ РАБОТАЛ БЕЗ ВАС!', {
      fontSize: '14.5px',
      fontFamily: 'sans-serif',
      color: '#93c5fd',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const desc = this.add.text(
      0,
      -18,
      `Пока вас не было (${offline.minutes} мин.),\nвитрину осмотрели сотни туристов!\nДоход от билетов: +${offline.coins} 🪙`,
      {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 4
      }
    ).setOrigin(0.5);

    const claimBtn = this.add.rectangle(0, 52, width * 0.64, 38, 0x10b981)
      .setStrokeStyle(1.5, 0x34d399, 0.9)
      .setInteractive({ useHandCursor: true });

    const claimTxt = this.add.text(0, 52, 'ЗАБРАТЬ В КАЗНУ', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    card.add([cardBg, title, desc, claimBtn, claimTxt]);

    this.tweens.add({
      targets: card,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    claimBtn.on('pointerdown', () => {
      Storage.addCoins(offline.coins);
      if (AudioManager.playCoin) AudioManager.playCoin();
      overlay.destroy();
      card.destroy();
      this.scene.restart();
    });
  }

  createAudioToggles(width) {
    // Музыка
    const musicBtn = this.add.circle(
      width - 70,
      36,
      17,
      AudioManager.isMusicOn() ? 0x142033 : 0x221a24
    )
      .setStrokeStyle(1.5, AudioManager.isMusicOn() ? 0x38bdf8 : 0xef4444, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    const musicIcon = this.add.text(
      width - 70,
      36,
      AudioManager.isMusicOn() ? '🎵' : '🔇',
      { fontSize: '14px' }
    ).setOrigin(0.5).setDepth(31);

    musicBtn.on('pointerdown', () => {
      const state = AudioManager.toggleMusic();
      musicBtn.setFillStyle(state ? 0x142033 : 0x221a24);
      musicBtn.setStrokeStyle(1.5, state ? 0x38bdf8 : 0xef4444, 0.9);
      musicIcon.setText(state ? '🎵' : '🔇');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    // SFX
    const sfxBtn = this.add.circle(
      width - 30,
      36,
      17,
      AudioManager.isSfxOn() ? 0x14261d : 0x221a24
    )
      .setStrokeStyle(1.5, AudioManager.isSfxOn() ? 0x22c55e : 0xef4444, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    const sfxIcon = this.add.text(
      width - 30,
      36,
      AudioManager.isSfxOn() ? '🔊' : '🔈',
      { fontSize: '14px' }
    ).setOrigin(0.5).setDepth(31);

    sfxBtn.on('pointerdown', () => {
      const state = AudioManager.toggleSfx();
      sfxBtn.setFillStyle(state ? 0x14261d : 0x221a24);
      sfxBtn.setStrokeStyle(1.5, state ? 0x22c55e : 0xef4444, 0.9);
      sfxIcon.setText(state ? '🔊' : '🔈');
      if (AudioManager.playClick) AudioManager.playClick();
    });
  }
}
