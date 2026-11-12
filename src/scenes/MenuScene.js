import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { ARTIFACT_TEMPLATES } from '../data/artifacts.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // 1. Фон кабинета реставратора с адаптивным покрытием экрана
    if (this.textures.exists('menu_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'menu_bg');
      const scaleX = width / bg.width;
      const scaleY = height / bg.height;
      bg.setScale(Math.max(scaleX, scaleY));
      // Лёгкое затемнение поверх фона, чтобы текст и кнопки читались идеально
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0906, 0.42);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x16100c);
    }

    // Верхняя декоративная рамка-виньетка
    const headerPanel = this.add.rectangle(width / 2, height * 0.11, width * 0.9, height * 0.13, 0x1a120b, 0.78);
    headerPanel.setStrokeStyle(1.5, 0xc89d54, 0.65);

    // Студия
    this.add.text(width / 2, height * 0.062, 'EASY DOPAMINE GAMES', {
      fontSize: '10px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#d4af37',
      fontStyle: 'bold',
      letterSpacing: 2,
      resolution: dpr
    }).setOrigin(0.5);

    const divider = this.add.graphics();
    divider.lineStyle(1, 0xc89d54, 0.45);
    divider.lineBetween(width / 2 - 44, height * 0.08, width / 2 + 44, height * 0.08);

    // Заголовок
    this.add.text(width / 2, height * 0.112, 'АРТЕФАКТЫ ВРЕМЕНИ', {
      fontSize: '23px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setShadow(0, 2, '#000000', 4, false, true);

    this.add.text(width / 2, height * 0.148, 'Мастерская реставратора', {
      fontSize: '12px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontStyle: 'italic',
      color: '#d6c3a5',
      resolution: dpr
    }).setOrigin(0.5);

    // Парящий логотип артефакта
    const logoKey = this.textures.exists('art_egypt_scarab') ? 'art_egypt_scarab' : null;
    if (logoKey) {
      const logo = this.add.image(width / 2, height * 0.255, logoKey);
      logo.setDisplaySize(104, 104);
      logo.setDepth(10);

      this.tweens.add({
        targets: logo,
        y: height * 0.242,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Плашка ранга
    this.renderRankWidget(width, height * 0.445, dpr);

    // Кнопки переключения звука
    this.createAudioToggles(width);

    // Фабрика кнопок меню в стиле бронзы и тёмного дуба
    const createBtn = (y, text, fillColor, strokeColor, textColor, onClick) => {
      const btnW = width * 0.84;
      const btnH = 48;

      const shadow = this.add.rectangle(width / 2, y + 3, btnW, btnH, 0x090604, 0.75);
      const btn = this.add.rectangle(width / 2, y, btnW, btnH, fillColor, 0.94)
        .setStrokeStyle(1.5, strokeColor, 0.9)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(width / 2, y, text, {
        fontSize: '14px',
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: textColor,
        fontStyle: 'bold',
        letterSpacing: 1,
        resolution: dpr
      }).setOrigin(0.5);

      btn.on('pointerover', () => {
        btn.setStrokeStyle(2, 0xfde68a, 1);
      });

      btn.on('pointerout', () => {
        btn.setStrokeStyle(1.5, strokeColor, 0.9);
      });

      btn.on('pointerdown', () => {
        if (AudioManager.playClick) AudioManager.playClick();
        this.tweens.add({
          targets: [btn, label, shadow],
          scaleX: 0.96,
          scaleY: 0.96,
          duration: 70,
          yoyo: true,
          ease: 'Quad.easeOut',
          onComplete: () => onClick()
        });
      });

      return btn;
    };

    const startY = height * 0.565;

    // 1. «НА ВЕРСТАК» — главная золотисто-бронзовая кнопка
    createBtn(startY, '⚒  НА ВЕРСТАК', 0xd99b26, 0xfef08a, '#1a1106', () => {
      this.startQuickRestore();
    });

    // 2. «ЭКСПЕДИЦИИ»
    createBtn(startY + 58, '🧭  ЭКСПЕДИЦИИ', 0x2b1d12, 0xb08948, '#f5e6c8', () => {
      this.scene.start('WorldMapScene');
    });

    // 3. «ЛАВКА МАСТЕРА»
    createBtn(startY + 116, '🕯  ЛАВКА МАСТЕРА', 0x2b1d12, 0xb08948, '#f5e6c8', () => {
      this.scene.start('ShopScene');
    });

    // 4. «ЗАЛ СЛАВЫ (МУЗЕЙ)»
    createBtn(startY + 174, '🏛  ЗАЛ СЛАВЫ (МУЗЕЙ)', 0x2b1d12, 0xb08948, '#f5e6c8', () => {
      this.scene.start('MuseumScene');
    });

    // Инвентарь лака
    const lacquer = Storage.getBindingLacquer ? Storage.getBindingLacquer() : 0;
    const lacquerBadge = this.add.rectangle(width / 2, height * 0.925, width * 0.72, 26, 0x1a120b, 0.85)
      .setStrokeStyle(1, 0xc89d54, 0.5);
    this.add.text(width / 2, height * 0.925, `✨ Золотой лак в наличии: ${lacquer} шт.`, {
      fontSize: '12px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    // Фоновая музыка
    if (AudioManager.playMusic) AudioManager.playMusic('menu');

    // Оффлайн-доход
    this.checkOfflineEarnings(width, height, dpr);

    // Срочный контракт
    this.renderContractWidget(width, height * 0.35, dpr);
  }

  startQuickRestore() {
    if (Storage.hasActiveSession && Storage.hasActiveSession()) {
      this.scene.start('RestoreScene');
      return;
    }

    const unlocked = Storage.getUnlockedRegions ? Storage.getUnlockedRegions() : ['egypt'];
    const availablePool = [];

    unlocked.forEach((regionId) => {
      const stock = Storage.getRegionStock(regionId, ARTIFACT_TEMPLATES);
      if (stock) {
        Object.entries(stock).forEach(([templateId, count]) => {
          if (count > 0) {
            const tmpl = ARTIFACT_TEMPLATES.find((t) => t.id === templateId && t.regionId === regionId);
            if (tmpl) {
              availablePool.push({ regionId, templateId });
            }
          }
        });
      }
    });

    if (availablePool.length === 0) {
      this.scene.start('WorldMapScene');
      return;
    }

    const randomIndex = Math.floor(Math.random() * availablePool.length);
    const chosen = availablePool[randomIndex];

    Storage.setActiveSession(chosen.regionId, chosen.templateId);
    this.scene.start('RestoreScene', {
      regionId: chosen.regionId,
      templateId: chosen.templateId
    });
  }

  renderRankWidget(width, y, dpr) {
    const lvlData = Storage.getLevelData ? Storage.getLevelData() : { level: 1, title: 'Новичок', progressRatio: 0 };
    const boxW = width * 0.84;
    const boxH = 46;

    const rankCont = this.add.container(width / 2, y);

    const bg = this.add.rectangle(0, 0, boxW, boxH, 0x1c130c, 0.9)
      .setStrokeStyle(1.5, 0xc89d54, 0.75)
      .setInteractive({ useHandCursor: true });

    const lvlBadge = this.add.text(-boxW / 2 + 12, -8, `УР. ${lvlData.level}`, {
      fontSize: '12px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0, 0.5);

    const rankTitle = this.add.text(-boxW / 2 + 68, -8, lvlData.title, {
      fontSize: '12px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0, 0.5);

    const tapHint = this.add.text(boxW / 2 - 12, -8, 'Путь ›', {
      fontSize: '10px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#d6c3a5',
      resolution: dpr
    }).setOrigin(1, 0.5);

    const barW = boxW - 24;
    const barH = 6;
    const barY = 11;

    const barBg = this.add.rectangle(0, barY, barW, barH, 0x0f0a06);
    const fillW = Math.max(4, barW * Phaser.Math.Clamp(lvlData.progressRatio, 0, 1));
    const barFill = this.add.rectangle(-barW / 2, barY, fillW, barH, 0xd99b26).setOrigin(0, 0.5);

    rankCont.add([bg, lvlBadge, rankTitle, tapHint, barBg, barFill]);

    bg.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.openLevelProgressModal(width, this.scale.height, dpr);
    });
  }

  openLevelProgressModal(width, height, dpr) {
    const curLevel = Storage.getLevelData ? Storage.getLevelData().level : 1;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x080503, 0.88)
      .setDepth(40)
      .setInteractive();

    const modalCont = this.add.container(width / 2, height / 2).setDepth(41);
    const modalW = width * 0.88;
    const modalH = height * 0.78;

    const bg = this.add.rectangle(0, 0, modalW, modalH, 0x1e140d, 0.98)
      .setStrokeStyle(1.5, 0xc89d54, 0.9);

    const title = this.add.text(0, -modalH / 2 + 24, '🏆 ПУТЬ МАСТЕРА ВРЕМЕНИ', {
      fontSize: '14px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const subTitle = this.add.text(0, -modalH / 2 + 44, `Текущий ранг: Уровень ${curLevel} из 50`, {
      fontSize: '11px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#d6c3a5',
      resolution: dpr
    }).setOrigin(0.5);

    const listCont = this.add.container(0, 0);

    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(width / 2 - modalW / 2 + 8, height / 2 - modalH / 2 + 60, modalW - 16, modalH - 124);
    listCont.setMask(new Phaser.Display.Masks.GeometryMask(this, maskGfx));

    const itemH = 54;
    const startListY = -modalH / 2 + 66;

    const epochUnlocks = {
      1: '🇪🇬 Египет',
      3: '🏛 Античность',
      6: '⚔️ Средневековье',
      10: '🐉 Восток',
      15: '🗿 Майя',
      20: '🛡 Викинги',
      25: '🎨 Ренессанс'
    };

    for (let lvl = 1; lvl <= 50; lvl++) {
      const cfg = Storage.getLevelConfig ? Storage.getLevelConfig(lvl) : { title: `Ранг ${lvl}` };
      const itemY = startListY + (lvl - 1) * itemH;
      const isCurrent = (lvl === curLevel);
      const isPassed = (lvl < curLevel);

      const rowCont = this.add.container(0, itemY);

      const rowBgColor = isCurrent ? 0x3b2614 : (isPassed ? 0x261a11 : 0x160f0a);
      const rowStroke = isCurrent ? 0xfacc15 : (isPassed ? 0x8c6239 : 0x4a3525);

      const rowBg = this.add.rectangle(0, itemH / 2 - 3, modalW - 24, itemH - 6, rowBgColor, 0.92)
        .setStrokeStyle(isCurrent ? 1.5 : 1, rowStroke, 0.85);

      const numTxt = this.add.text(-modalW / 2 + 20, 12, `УР. ${lvl}`, {
        fontSize: '12px',
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: isCurrent ? '#facc15' : (isPassed ? '#e2b866' : '#8c735b'),
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0, 0.5);

      const titleTxt = this.add.text(-modalW / 2 + 68, 12, cfg.title, {
        fontSize: '12px',
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: isCurrent ? '#ffffff' : (isPassed ? '#f5e6c8' : '#7a6552'),
        fontStyle: isCurrent ? 'bold' : 'normal',
        resolution: dpr
      }).setOrigin(0, 0.5);

      const rewardCoins = lvl * 100 + 100;
      let rewardStr = `Награда: +${rewardCoins} 🪙`;
      if (lvl % 5 === 0) rewardStr += ' + 1 ✨ Лак';

      const rewardTxt = this.add.text(-modalW / 2 + 68, 32, rewardStr, {
        fontSize: '10px',
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: '#e2b866',
        resolution: dpr
      }).setOrigin(0, 0.5);

      if (epochUnlocks[lvl]) {
        const epochTxt = this.add.text(modalW / 2 - 20, 32, epochUnlocks[lvl], {
          fontSize: '9.5px',
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#38bdf8',
          fontStyle: 'bold',
          resolution: dpr
        }).setOrigin(1, 0.5);
        rowCont.add(epochTxt);
      }

      if (isPassed) {
        const checkTxt = this.add.text(modalW / 2 - 20, 12, '✓', {
          fontSize: '14px',
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#86efac',
          fontStyle: 'bold',
          resolution: dpr
        }).setOrigin(1, 0.5);
        rowCont.add(checkTxt);
      } else if (isCurrent) {
        const curTxt = this.add.text(modalW / 2 - 20, 12, '• ВЫ ЗДЕСЬ', {
          fontSize: '9.5px',
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#facc15',
          fontStyle: 'bold',
          resolution: dpr
        }).setOrigin(1, 0.5);
        rowCont.add(curTxt);
      }

      rowCont.add([rowBg, numTxt, titleTxt, rewardTxt]);
      listCont.add(rowCont);
    }

    const initialScrollY = Math.min(0, -((curLevel - 3) * itemH) - (50 * itemH - modalH + 140));
    listCont.y = initialScrollY;

    let startY = 0;
    let isDragging = false;
    const minScrollY = -(50 * itemH - (modalH - 130));

    overlay.on('pointerdown', (p) => {
      startY = p.y;
      isDragging = true;
    });

    overlay.on('pointermove', (p) => {
      if (!isDragging) return;
      const dy = p.y - startY;
      startY = p.y;
      listCont.y = Phaser.Math.Clamp(listCont.y + dy, minScrollY, 0);
    });

    overlay.on('pointerup', () => {
      isDragging = false;
    });

    const closeBtn = this.add.rectangle(0, modalH / 2 - 28, modalW * 0.7, 36, 0x3b2614)
      .setStrokeStyle(1.5, 0xc89d54, 0.9)
      .setInteractive({ useHandCursor: true });

    const closeTxt = this.add.text(0, modalH / 2 - 28, 'ЗАКРЫТЬ', {
      fontSize: '12px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    closeBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      maskGfx.destroy();
      modalCont.destroy();
      overlay.destroy();
    });

    modalCont.add([bg, title, subTitle, listCont, closeBtn, closeTxt]);
  }

  formatTimeRemaining(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  renderContractWidget(width, y, dpr) {
    const contract = Storage.getContract ? Storage.getContract(ARTIFACT_TEMPLATES) : null;
    if (!contract) return;

    const boxW = width * 0.84;
    const boxH = 54;

    const box = this.add.rectangle(width / 2, y, boxW, boxH, 0x1c130c, 0.9)
      .setStrokeStyle(1.5, contract.completed ? 0x86efac : 0xc89d54, 0.85);

    if (contract.completed) {
      this.add.text(width / 2, y - 10, '✓ КОНТРАКТ ВЫПОЛНЕН!', {
        fontSize: '11px',
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: '#86efac',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      const timerTxt = this.add.text(width / 2, y + 10, 'Новый через: 00:00:00', {
        fontSize: '10px',
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: '#d6c3a5',
        resolution: dpr
      }).setOrigin(0.5);

      const updateTimer = () => {
        const nextAvail = contract.nextAvailableAt || Date.now();
        const rem = nextAvail - Date.now();
        if (rem <= 0) {
          this.scene.restart();
        } else {
          timerTxt.setText(`Новый через: ${this.formatTimeRemaining(rem)}`);
        }
      };

      this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: updateTimer
      });
      updateTimer();
      return;
    }

    box.setInteractive({ useHandCursor: true });

    this.add.text(width / 2 - boxW / 2 + 12, y - 16, '📜 СРОЧНЫЙ ЗАКАЗ МУЗЕЯ', {
      fontSize: '10px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0);

    this.add.text(width / 2 - boxW / 2 + 12, y - 2, contract.title, {
      fontSize: '11px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0);

    this.add.text(width / 2 - boxW / 2 + 12, y + 13, `+${contract.rewardCoins} 🪙 | +${contract.bonusXP} XP`, {
      fontSize: '11px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#e2b866',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0);

    const timerTxt = this.add.text(width / 2 + boxW / 2 - 12, y - 18, '00:00:00', {
      fontSize: '10px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#d6c3a5',
      resolution: dpr
    }).setOrigin(1, 0);

    const updateTimer = () => {
      const nextAvail = contract.nextAvailableAt || Date.now();
      const rem = nextAvail - Date.now();
      if (rem <= 0) {
        this.scene.restart();
      } else {
        timerTxt.setText(this.formatTimeRemaining(rem));
      }
    };

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: updateTimer
    });
    updateTimer();

    const takeBtn = this.add.rectangle(width / 2 + boxW / 2 - 44, y + 6, 74, 28, 0xd99b26)
      .setStrokeStyle(1, 0xfef08a)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2 + boxW / 2 - 44, y + 6, 'ВЗЯТЬ', {
      fontSize: '11px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#1a1106',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const startContract = () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('RestoreScene', {
        regionId: contract.regionId,
        templateId: contract.templateId,
        contract
      });
    };

    box.on('pointerdown', startContract);
    takeBtn.on('pointerdown', startContract);
  }

  checkOfflineEarnings(width, height, dpr) {
    const offline = Storage.getOfflineEarnings ? Storage.getOfflineEarnings() : { coins: 0, minutes: 0 };
    if (!offline || offline.coins <= 0) return;

    if (AudioManager.playShine) AudioManager.playShine();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x080503, 0.85)
      .setDepth(45)
      .setInteractive();

    const box = this.add.container(width / 2, height / 2).setDepth(46);

    const bg = this.add.rectangle(0, 0, width * 0.84, 180, 0x1e140d, 0.98)
      .setStrokeStyle(1.5, 0xc89d54, 0.9);

    const title = this.add.text(0, -56, '🏛 ДОХОД МУЗЕЯ ЗА ВРЕМЯ ОТСУТСТВИЯ', {
      fontSize: '11.5px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const desc = this.add.text(0, -14, `Пока вас не было (${offline.minutes} мин),\nпосетители оставили в казне:`, {
      fontSize: '11px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#f5e6c8',
      align: 'center',
      resolution: dpr
    }).setOrigin(0.5);

    const sumTxt = this.add.text(0, 22, `+${offline.coins} 🪙`, {
      fontSize: '18px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const claimBtn = this.add.rectangle(0, 58, width * 0.65, 36, 0xd99b26)
      .setStrokeStyle(1, 0xfef08a)
      .setInteractive({ useHandCursor: true });

    const claimTxt = this.add.text(0, 58, 'ЗАБРАТЬ В КАЗНУ', {
      fontSize: '12px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#1a1106',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    claimBtn.on('pointerdown', () => {
      Storage.addCoins(offline.coins);
      if (AudioManager.playCoin) AudioManager.playCoin();
      box.destroy();
      overlay.destroy();
      this.scene.restart();
    });

    box.add([bg, title, desc, sumTxt, claimBtn, claimTxt]);
  }

  createAudioToggles(width) {
    const musicBtn = this.add.circle(width - 70, 36, 17, AudioManager.isMusicOn() ? 0x2b1d12 : 0x160f0a)
      .setStrokeStyle(1.5, AudioManager.isMusicOn() ? 0xc89d54 : 0x7f1d1d, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    const musicIcon = this.add.text(width - 70, 36, AudioManager.isMusicOn() ? '🎵' : '🔇', {
      fontSize: '14px'
    }).setOrigin(0.5).setDepth(31);

    musicBtn.on('pointerdown', () => {
      const state = AudioManager.toggleMusic();
      musicBtn.setFillStyle(state ? 0x2b1d12 : 0x160f0a);
      musicBtn.setStrokeStyle(1.5, state ? 0xc89d54 : 0x7f1d1d, 0.9);
      musicIcon.setText(state ? '🎵' : '🔇');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    const sfxBtn = this.add.circle(width - 30, 36, 17, AudioManager.isSfxOn() ? 0x2b1d12 : 0x160f0a)
      .setStrokeStyle(1.5, AudioManager.isSfxOn() ? 0xc89d54 : 0x7f1d1d, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    const sfxIcon = this.add.text(width - 30, 36, AudioManager.isSfxOn() ? '🔊' : '🔈', {
      fontSize: '14px'
    }).setOrigin(0.5).setDepth(31);

    sfxBtn.on('pointerdown', () => {
      const state = AudioManager.toggleSfx();
      sfxBtn.setFillStyle(state ? 0x2b1d12 : 0x160f0a);
      sfxBtn.setStrokeStyle(1.5, state ? 0xc89d54 : 0x7f1d1d, 0.9);
      sfxIcon.setText(state ? '🔊' : '🔈');
      if (AudioManager.playClick) AudioManager.playClick();
    });
  }
}
