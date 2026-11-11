import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { ARTIFACT_TEMPLATES } from '../data/artifacts.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x090c15).setDepth(0);

    // Студийный лейбл
    this.add.text(width / 2, height * 0.065, 'EASY DOPAMINE GAMES', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5).setAlpha(0.85).setDepth(10);

    const divider = this.add.graphics().setDepth(10);
    divider.lineStyle(1, 0xd4af37, 0.4);
    divider.lineBetween(width / 2 - 50, height * 0.08, width / 2 + 50, height * 0.08);

    // Название игры
    this.add.text(width / 2, height * 0.115, 'АРТЕФАКТЫ ВРЕМЕНИ', {
      fontSize: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(10);

    this.add.text(width / 2, height * 0.15, 'Мастерская реставратора', {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#94a3b8',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(10);

    // Виджет ранга
    this.renderRankWidget(width, height * 0.195);

    // Парящий логотип
    const logoKey = this.textures.exists('art_egypt_scarab') ? 'art_egypt_scarab' : null;
    if (logoKey) {
      const logo = this.add.image(width / 2, height * 0.295, logoKey)
        .setDisplaySize(76, 76)
        .setDepth(10);

      this.tweens.add({
        targets: logo,
        y: height * 0.295 - 6,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Плашка контракта
    this.renderContractWidget(width, height * 0.405);

    // Кнопки звука
    this.createAudioToggles(width);

    // Кнопки навигации
    const createBtn = (y, text, colorBg, colorStroke, textColor, callback) => {
      const btn = this.add.rectangle(
        width / 2,
        y,
        width * 0.82,
        46,
        colorBg
      )
        .setStrokeStyle(1.5, colorStroke, 0.9)
        .setInteractive({ useHandCursor: true })
        .setDepth(20);

      const label = this.add.text(width / 2, y, text, {
        fontSize: '14.5px',
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

    const startY = height * 0.51;

    createBtn(startY, '▶ ЭКСПЕДИЦИИ', 0x10b981, 0x34d399, '#ffffff', () => {
      this.scene.start('EraSelectScene');
    });

    createBtn(startY + 56, '🏛️ ВИТРИНА МАГАЗИНА', 0x131a29, 0x3b82f6, '#93c5fd', () => {
      if (AudioManager.playShopBell) AudioManager.playShopBell();
      this.scene.start('MuseumScene');
    });

    createBtn(startY + 112, '🛠️ ЛАВКА МАСТЕРА', 0x161c24, 0xe2b35b, '#fde047', () => {
      this.scene.start('ShopScene');
    });

    // Кнопка Гачи / Лутбоксов
    createBtn(startY + 168, '🎁 СУНДУКИ АРХЕОЛОГА', 0x24142a, 0xa855f7, '#e9d5ff', () => {
      this.showGachaModal(width, height);
    });

    // Баланс казны и запас золотого лака
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    const lacquer = Storage.getKintsugiLacquer ? Storage.getKintsugiLacquer() : 0;

    this.add.text(width / 2, height - 32, `Казна: ${coins} 🪙  •  Лак Кинцуги: ${lacquer} 🍯`, {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    if (!Storage.isMusicMuted()) {
      AudioManager.playEraMusic('menu');
    }

    this.checkOfflineEarnings(width, height);
  }

  renderRankWidget(width, y) {
    const lvlData = Storage.getLevelData();
    const boxW = width * 0.82;

    this.add.rectangle(width / 2, y, boxW, 36, 0x111622, 0.9)
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

  formatTimeRemaining(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  renderContractWidget(width, y) {
    const contract = Storage.getDailyContract(ARTIFACT_TEMPLATES);
    if (!contract) return;

    const boxW = width * 0.82;
    const boxH = 68;

    const box = this.add.rectangle(width / 2, y, boxW, boxH, 0x131926, 0.96)
      .setStrokeStyle(1.5, contract.completed ? 0x334155 : 0xe2b35b, 0.8)
      .setDepth(12);

    if (contract.completed) {
      this.add.text(width / 2 - boxW / 2 + 14, y - 14, '✅ КОНТРАКТ ВЫПОЛНЕН', {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: '#22c55e',
        fontStyle: 'bold'
      }).setDepth(13);

      const cdText = this.add.text(width / 2 - boxW / 2 + 14, y + 10, 'Новый заказ через: --:--:--', {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: '#94a3b8'
      }).setDepth(13);

      this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          const rem = contract.nextAvailableAt - Date.now();
          if (rem <= 0) {
            this.scene.restart();
          } else {
            cdText.setText(`Новый заказ через: ${this.formatTimeRemaining(rem)}`);
          }
        }
      });
      return;
    }

    box.setInteractive({ useHandCursor: true });

    this.add.text(width / 2 - boxW / 2 + 12, y - 20, `📜 ЗАКАЗ: ${contract.client.toUpperCase()}`, {
      fontSize: '10px',
      fontFamily: 'sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setDepth(13);

    this.add.text(width / 2 - boxW / 2 + 12, y - 2, contract.name, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setDepth(13);

    this.add.text(width / 2 - boxW / 2 + 12, y + 16, `+${contract.rewardCoins} 🪙  •  +${contract.bonusXP} XP`, {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#22c55e',
      fontStyle: 'bold'
    }).setDepth(13);

    const timerText = this.add.text(width / 2 + boxW / 2 - 12, y - 20, '00:00:00', {
      fontSize: '9.5px',
      fontFamily: 'sans-serif',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(13);

    const updateTimer = () => {
      const remaining = contract.nextAvailableAt - Date.now();
      if (remaining <= 0) {
        this.scene.restart();
      } else {
        timerText.setText(`⏱ ${this.formatTimeRemaining(remaining)}`);
      }
    };
    updateTimer();

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: updateTimer
    });

    const takeBtn = this.add.rectangle(width / 2 + boxW / 2 - 46, y + 8, 76, 30, 0x10b981)
      .setStrokeStyle(1, 0x34d399, 0.9)
      .setDepth(13);

    this.add.text(width / 2 + boxW / 2 - 46, y + 8, 'ВЗЯТЬ', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(14);

    box.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('RestoreScene', {
        regionId: contract.regionId,
        templateId: contract.templateId,
        contract
      });
    });
  }

  // --- МОДАЛЬНОЕ ОКНО ГАЧИ / ЛУТБОКСОВ ---
  showGachaModal(width, height) {
    if (AudioManager.playClick) AudioManager.playClick();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85)
      .setInteractive().setDepth(50);

    const modal = this.add.container(width / 2, height / 2).setDepth(51).setScale(0);

    const bg = this.add.rectangle(0, 0, width * 0.88, 380, 0x111624)
      .setStrokeStyle(2, 0xa855f7, 0.9);

    const title = this.add.text(0, -155, '🎁 ТАЙНЫЕ СУНДУКИ ДРЕВНОСТЕЙ', {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#e9d5ff',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5);

    // Карточка 1: Деревянный ларь
    const box1Bg = this.add.rectangle(0, -70, width * 0.78, 90, 0x161e30)
      .setStrokeStyle(1.5, 0x64748b, 0.8);

    const box1Title = this.add.text(-width * 0.39 + 16, -95, '📦 Походный ларь археолога', {
      fontSize: '12.5px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    const box1Desc = this.add.text(-width * 0.39 + 16, -74, 'Содержит: 100-450 🪙, образцы находок,\nредкий шанс на баночку Золотого лака.', {
      fontSize: '10px',
      fontFamily: 'sans-serif',
      color: '#94a3b8',
      lineSpacing: 2
    });

    const open1Btn = this.add.rectangle(width * 0.39 - 48, -70, 78, 32, 0x3b82f6)
      .setStrokeStyle(1, 0x60a5fa)
      .setInteractive({ useHandCursor: true });

    const open1Txt = this.add.text(width * 0.39 - 48, -70, '350 🪙', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Карточка 2: Золотой ларец
    const box2Bg = this.add.rectangle(0, 45, width * 0.78, 90, 0x1c192d)
      .setStrokeStyle(1.5, 0xe2b35b, 0.9);

    const box2Title = this.add.text(-width * 0.39 + 16, 20, '✨ Золотой сундук Гильдии', {
      fontSize: '12.5px',
      fontFamily: 'sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    });

    const box2Desc = this.add.text(-width * 0.39 + 16, 41, 'Гарантированно: 1-2 лака Кинцуги,\nдо 2 500 🪙 и редкие образцы раскопок.', {
      fontSize: '10px',
      fontFamily: 'sans-serif',
      color: '#cbd5e1',
      lineSpacing: 2
    });

    const open2Btn = this.add.rectangle(width * 0.39 - 48, 45, 78, 32, 0xd4af37)
      .setStrokeStyle(1, 0xfde047)
      .setInteractive({ useHandCursor: true });

    const open2Txt = this.add.text(width * 0.39 - 48, 45, '1200 🪙', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Кнопка закрытия
    const closeBtn = this.add.rectangle(0, 145, width * 0.60, 36, 0x1f2937)
      .setStrokeStyle(1.5, 0x475569)
      .setInteractive({ useHandCursor: true });

    const closeTxt = this.add.text(0, 145, 'ЗАКРЫТЬ', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#cbd5e1',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    modal.add([bg, title, box1Bg, box1Title, box1Desc, open1Btn, open1Txt, box2Bg, box2Title, box2Desc, open2Btn, open2Txt, closeBtn, closeTxt]);

    this.tweens.add({
      targets: modal,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      modal.destroy();
      this.scene.restart();
    });

    // Обработка открытия ларей
    open1Btn.on('pointerdown', () => {
      this.handleOpenChest(350, 'common', overlay, modal, width, height);
    });

    open2Btn.on('pointerdown', () => {
      this.handleOpenChest(1200, 'rare', overlay, modal, width, height);
    });
  }

  handleOpenChest(cost, type, overlay, modal, width, height) {
    const coins = Storage.getCoins();
    if (coins < cost) {
      if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
      return;
    }

    Storage.addCoins(-cost);
    if (AudioManager.playCoin) AudioManager.playCoin();

    // Генерация награды
    let prizeCoins = 0;
    let prizeLacquer = 0;
    let prizeStockText = '';

    if (type === 'common') {
      prizeCoins = Phaser.Math.Between(150, 450);
      prizeLacquer = Math.random() < 0.35 ? 1 : 0;
    } else {
      prizeCoins = Phaser.Math.Between(600, 2200);
      prizeLacquer = Phaser.Math.Between(1, 2);
    }

    Storage.addCoins(prizeCoins);
    if (prizeLacquer > 0) Storage.addKintsugiLacquer(prizeLacquer);

    // Добавляем 1 случайный образец в Египет или открытую эпоху
    const randomTemplate = ARTIFACT_TEMPLATES[Math.floor(Math.random() * ARTIFACT_TEMPLATES.length)];
    Storage.addArtifactStock(randomTemplate.regionId, randomTemplate.id, 1);
    prizeStockText = `+1 образец: ${randomTemplate.name}`;

    // Анимация получения дропа
    modal.setVisible(false);
    this.showLootDropCard(prizeCoins, prizeLacquer, prizeStockText, overlay, modal, width, height);
  }

  showLootDropCard(coins, lacquer, stockText, overlay, parentModal, width, height) {
    if (AudioManager.playShine) AudioManager.playShine();

    const card = this.add.container(width / 2, height / 2).setDepth(60).setScale(0);

    const cardBg = this.add.rectangle(0, 0, width * 0.82, 230, 0x171224)
      .setStrokeStyle(2, 0xfacc15, 0.95);

    const rays = this.add.circle(0, -40, 60, 0xfacc15, 0.15)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: rays,
      scale: 1.4,
      alpha: 0.3,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    const dropTitle = this.add.text(0, -75, '✨ НАГРАДА ИЗ СУНДУКА! ✨', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const prize1 = this.add.text(0, -35, `+${coins} 🪙 казны`, {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#22c55e',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const lacquerStr = lacquer > 0 ? `+${lacquer} 🍯 Золотой лак (Кинцуги)` : 'Пыль веков (пусто)';
    const prize2 = this.add.text(0, -5, lacquerStr, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: lacquer > 0 ? '#facc15' : '#64748b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const prize3 = this.add.text(0, 24, stockText, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const okBtn = this.add.rectangle(0, 75, width * 0.58, 36, 0x10b981)
      .setStrokeStyle(1.5, 0x34d399)
      .setInteractive({ useHandCursor: true });

    const okTxt = this.add.text(0, 75, 'ЗАБРАТЬ', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    card.add([cardBg, rays, dropTitle, prize1, prize2, prize3, okBtn, okTxt]);

    this.tweens.add({
      targets: card,
      scale: 1,
      duration: 350,
      ease: 'Back.easeOut'
    });

    okBtn.on('pointerdown', () => {
      card.destroy();
      overlay.destroy();
      parentModal.destroy();
      this.scene.restart();
    });
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
