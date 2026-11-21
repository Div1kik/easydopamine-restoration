import { AudioManager } from './AudioManager.js';
import { Storage } from './Storage.js';

const STEP_KEY = 'art_tutorial_seq_step_v2';
const DONE_KEY = 'art_tutorial_seq_done_v2';

/**
 * Единая сквозная цепочка обучения (этапы):
 * 0 - Меню: кнопка "На верстак" (открывает обучающего Скарабея со всеми 4 этапами + Кинцуги)
 * 1 - Верстак: панель этапов и трей инструментов (Скребок, Кисть, Реагент, Клей, Блеск)
 * 2 - Верстак (этап скола): Золотой лак Кинцуги (+60% к цене)
 * 3 - Меню: кнопка "Экспедиции"
 * 4 - Карта экспедиций: Энергия ⚡ -> Ручные раскопки -> Авто-сбор
 * 5 - Раскопки: отдельно Георадар, Кирка и Кисть
 * 6 - Меню: кнопка "Лавка Мастера"
 * 7 - Лавка: вкладки (Верстак, Раскопки, Стиль/15 столов/Сундук, Музей)
 * 8 - Меню: кнопка "Зал Славы (Музей)"
 * 9 - Музей: витрины, осмотр скарабея и пассивный доход -> Финал обучения!
 */
class TutorialManagerClass {
  constructor() {
    this.activeOverlay = null;
    this._initialized = false;
  }

  ensureInit() {
    if (this._initialized) return;
    this._initialized = true;

    // Если игрок уже опытный (ур > 1 или есть отреставрированные предметы), не навязываем авто-старт
    if (localStorage.getItem(DONE_KEY) === null && localStorage.getItem(STEP_KEY) === null) {
      const lvl = Storage.getLevelData ? Storage.getLevelData().level : 1;
      const inv = Storage.getInventory ? Storage.getInventory() : [];
      if (lvl > 1 || inv.length > 0) {
        localStorage.setItem(DONE_KEY, 'true');
      } else {
        localStorage.setItem(STEP_KEY, '0');
      }
    }
  }

  isDone() {
    this.ensureInit();
    return localStorage.getItem(DONE_KEY) === 'true';
  }

  getStep() {
    this.ensureInit();
    if (this.isDone()) return -1;
    return parseInt(localStorage.getItem(STEP_KEY) || '0', 10);
  }

  setStep(step) {
    if (this.isDone()) return;
    localStorage.setItem(STEP_KEY, String(step));
  }

  completeAll() {
    localStorage.setItem(DONE_KEY, 'true');
    localStorage.removeItem(STEP_KEY);
    this.destroyCurrent();
  }

  resetAll() {
    localStorage.setItem(DONE_KEY, 'false');
    localStorage.setItem(STEP_KEY, '0');
    this.destroyCurrent();
  }

  /**
   * Запускает блок шагов только если текущий сквозной этап совпадает с expectedStep
   */
  runIfStep(scene, expectedStep, steps, onFinishStep = null) {
    if (!scene || this.isDone()) return false;
    if (this.getStep() !== expectedStep) return false;

    this.destroyCurrent();

    const { width, height } = scene.scale;
    const dpr = 3;
    const FONT_TITLE = '"Cormorant Garamond", Georgia, serif';
    const FONT_UI = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    let subIdx = 0;

    const root = scene.add.container(0, 0).setDepth(950);
    this.activeOverlay = root;

    const shadeTop = scene.add.rectangle(0, 0, width, 10, 0x050302, 0.82).setOrigin(0, 0).setInteractive();
    const shadeBottom = scene.add.rectangle(0, 0, width, 10, 0x050302, 0.82).setOrigin(0, 0).setInteractive();
    const shadeLeft = scene.add.rectangle(0, 0, 10, 10, 0x050302, 0.82).setOrigin(0, 0).setInteractive();
    const shadeRight = scene.add.rectangle(0, 0, 10, 10, 0x050302, 0.82).setOrigin(0, 0).setInteractive();

    const centerBlocker = scene.add.zone(width / 2, height / 2, width, height).setInteractive();

    const highlightGfx = scene.add.graphics();
    const glowGfx = scene.add.graphics();

    const cardW = Math.min(width * 0.90, 420);
    const cardCont = scene.add.container(width / 2, height / 2);

    const cardBg = scene.add.graphics();
    const pointerArrow = scene.add.graphics();

    const badgeTxt = scene.add.text(0, 0, '', {
      fontSize: '10.5px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      fontStyle: 'bold',
      letterSpacing: 1.1,
      resolution: dpr
    }).setOrigin(0, 0.5);

    const skipTxt = scene.add.text(0, 0, 'Пропустить ✕', {
      fontSize: '11px',
      fontFamily: FONT_UI,
      color: '#fda4af',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(1, 0.5);

    const skipZone = scene.add.zone(0, 0, 104, 28).setInteractive({ useHandCursor: true });

    const titleTxt = scene.add.text(0, 0, '', {
      fontSize: '16.5px',
      fontFamily: FONT_TITLE,
      color: '#facc15',
      fontStyle: 'bold',
      wordWrap: { width: cardW - 28 },
      resolution: dpr
    }).setOrigin(0, 0);

    const bodyTxt = scene.add.text(0, 0, '', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      lineSpacing: 4,
      wordWrap: { width: cardW - 28 },
      resolution: dpr
    }).setOrigin(0, 0);

    const nextBtnW = 148;
    const nextBtnH = 34;
    const nextBtnGfx = scene.add.graphics();
    const nextBtnTxt = scene.add.text(0, 0, 'ДАЛЕЕ ›', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);
    const nextBtnZone = scene.add.zone(0, 0, nextBtnW, nextBtnH).setInteractive({ useHandCursor: true });

    cardCont.add([
      pointerArrow,
      cardBg,
      badgeTxt,
      skipTxt,
      skipZone,
      titleTxt,
      bodyTxt,
      nextBtnGfx,
      nextBtnTxt,
      nextBtnZone
    ]);

    root.add([
      shadeTop,
      shadeBottom,
      shadeLeft,
      shadeRight,
      centerBlocker,
      glowGfx,
      highlightGfx,
      cardCont
    ]);

    const pulseTween = scene.tweens.add({
      targets: glowGfx,
      alpha: { from: 0.95, to: 0.25 },
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const finishBlock = () => {
      if (pulseTween) pulseTween.stop();
      this.destroyCurrent();
      if (typeof onFinishStep === 'function') {
        onFinishStep();
      }
    };

    const renderSubStep = () => {
      const step = steps[subIdx];
      if (!step) {
        finishBlock();
        return;
      }

      const r = step.rect || { x: width / 2 - 120, y: height / 2 - 40, w: 240, h: 80 };
      const rx = Phaser.Math.Clamp(r.x, 4, width - 8);
      const ry = Phaser.Math.Clamp(r.y, 4, height - 8);
      const rw = Phaser.Math.Clamp(r.w, 24, width - rx - 4);
      const rh = Phaser.Math.Clamp(r.h, 24, height - ry - 4);

      shadeTop.setPosition(0, 0).setSize(width, ry);
      shadeBottom.setPosition(0, ry + rh).setSize(width, Math.max(0, height - (ry + rh)));
      shadeLeft.setPosition(0, ry).setSize(rx, rh);
      shadeRight.setPosition(rx + rw, ry).setSize(Math.max(0, width - (rx + rw)), rh);

      highlightGfx.clear();
      highlightGfx.lineStyle(2.2, 0xfacc15, 1);
      highlightGfx.strokeRoundedRect(rx - 3, ry - 3, rw + 6, rh + 6, 12);

      glowGfx.clear();
      glowGfx.lineStyle(5, 0xfef08a, 0.55);
      glowGfx.strokeRoundedRect(rx - 6, ry - 6, rw + 12, rh + 12, 14);

      const pad = 16;
      const topRowY = 18;
      badgeTxt.setText(step.badge || `ОБУЧЕНИЕ • ${subIdx + 1}/${steps.length}`);
      badgeTxt.setPosition(-cardW / 2 + pad, topRowY);

      skipTxt.setPosition(cardW / 2 - pad, topRowY);
      skipZone.setPosition(cardW / 2 - pad - 46, topRowY);

      titleTxt.setText(step.title);
      titleTxt.setPosition(-cardW / 2 + pad, topRowY + 18);

      const bodyY = titleTxt.y + titleTxt.height + 8;
      bodyTxt.setText(step.body);
      bodyTxt.setPosition(-cardW / 2 + pad, bodyY);

      const btnY = bodyY + bodyTxt.height + 28;
      const cardH = btnY + nextBtnH / 2 + 14;

      cardBg.clear();
      cardBg.fillStyle(0x050302, 0.78);
      cardBg.fillRoundedRect(-cardW / 2, 4, cardW, cardH, 14);
      cardBg.fillGradientStyle(0x261a10, 0x261a10, 0x140d08, 0x140d08, 0.99);
      cardBg.fillRoundedRect(-cardW / 2, 0, cardW, cardH, 14);
      cardBg.lineStyle(1.8, 0xc89d54, 0.95);
      cardBg.strokeRoundedRect(-cardW / 2, 0, cardW, cardH, 14);

      const btnX = cardW / 2 - pad - nextBtnW / 2;
      nextBtnGfx.clear();
      nextBtnGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
      nextBtnGfx.fillRoundedRect(btnX - nextBtnW / 2, btnY - nextBtnH / 2, nextBtnW, nextBtnH, 9);
      nextBtnGfx.lineStyle(1, 0xfef08a, 0.95);
      nextBtnGfx.strokeRoundedRect(btnX - nextBtnW / 2, btnY - nextBtnH / 2, nextBtnW, nextBtnH, 9);

      nextBtnTxt.setText(step.btnLabel || (subIdx === steps.length - 1 ? 'ПОНЯТНО ✓' : 'ДАЛЕЕ ›'));
      nextBtnTxt.setPosition(btnX, btnY);
      nextBtnZone.setPosition(btnX, btnY);

      const targetCenterY = ry + rh / 2;
      const targetCenterX = Phaser.Math.Clamp(rx + rw / 2, width / 2 - cardW / 2 + 24, width / 2 + cardW / 2 - 24) - width / 2;

      pointerArrow.clear();
      pointerArrow.fillStyle(0xc89d54, 1);

      if (targetCenterY < height * 0.5) {
        const cardTop = Math.min(height - cardH - 14, ry + rh + 16);
        cardCont.setPosition(width / 2, cardTop);

        pointerArrow.beginPath();
        pointerArrow.moveTo(targetCenterX - 10, 0);
        pointerArrow.lineTo(targetCenterX + 10, 0);
        pointerArrow.lineTo(targetCenterX, -10);
        pointerArrow.closePath();
        pointerArrow.fill();
      } else {
        const cardTop = Math.max(14, ry - cardH - 16);
        cardCont.setPosition(width / 2, cardTop);

        pointerArrow.beginPath();
        pointerArrow.moveTo(targetCenterX - 10, cardH);
        pointerArrow.lineTo(targetCenterX + 10, cardH);
        pointerArrow.lineTo(targetCenterX, cardH + 10);
        pointerArrow.closePath();
        pointerArrow.fill();
      }
    };

    nextBtnZone.on('pointerup', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      subIdx++;
      renderSubStep();
    });

    skipZone.on('pointerup', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      if (pulseTween) pulseTween.stop();
      this.completeAll();
    });

    scene.events.once('shutdown', () => {
      if (pulseTween) pulseTween.stop();
      this.activeOverlay = null;
    });

    renderSubStep();
    return true;
  }

  destroyCurrent() {
    if (this.activeOverlay && this.activeOverlay.destroy) {
      this.activeOverlay.destroy();
    }
    this.activeOverlay = null;
  }
}

export const TutorialManager = new TutorialManagerClass();
