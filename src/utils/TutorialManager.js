import { AudioManager } from './AudioManager.js';

const STORAGE_KEY = 'art_tutorial_completed_stages_v1';

class TutorialManagerClass {
  constructor() {
    this.activeOverlay = null;
  }

  getCompletedStages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  isStageCompleted(stageId) {
    return this.getCompletedStages().includes(stageId);
  }

  markStageCompleted(stageId) {
    const list = this.getCompletedStages();
    if (!list.includes(stageId)) {
      list.push(stageId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  }

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Запускает пошаговый Spotlight-тур для конкретной сцены, если он ещё не пройден
   * @param {Phaser.Scene} scene
   * @param {string} stageId
   * @param {Array<{rect: {x,y,w,h}, title: string, body: string, badge?: string}>} steps
   * @param {Function} onComplete
   */
  startTour(scene, stageId, steps, onComplete = null) {
    if (!scene || !steps || steps.length === 0) return false;
    if (this.isStageCompleted(stageId)) return false;

    this.destroyCurrent();

    const { width, height } = scene.scale;
    const dpr = 3;
    const FONT_TITLE = '"Cormorant Garamond", Georgia, serif';
    const FONT_UI = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    let stepIndex = 0;

    // Контейнер поверх всей сцены
    const root = scene.add.container(0, 0).setDepth(950);
    this.activeOverlay = root;

    // 4 затемняющие шторки вокруг выделяемого прямоугольника (чтобы окно подсветки оставалось кристально чистым!)
    const shadeTop = scene.add.rectangle(0, 0, width, 10, 0x050302, 0.82).setOrigin(0, 0).setInteractive();
    const shadeBottom = scene.add.rectangle(0, 0, width, 10, 0x050302, 0.82).setOrigin(0, 0).setInteractive();
    const shadeLeft = scene.add.rectangle(0, 0, 10, 10, 0x050302, 0.82).setOrigin(0, 0).setInteractive();
    const shadeRight = scene.add.rectangle(0, 0, 10, 10, 0x050302, 0.82).setOrigin(0, 0).setInteractive();

    // Прозрачный перехватчик кликов по центру, чтобы случайный тап не провалился в кнопки под туториалом
    const centerBlocker = scene.add.zone(width / 2, height / 2, width, height).setInteractive();

    // Золотая пульсирующая рамка вокруг целевой зоны
    const highlightGfx = scene.add.graphics();
    const glowGfx = scene.add.graphics();

    // Карточка с текстом подсказки
    const cardW = Math.min(width * 0.90, 420);
    const cardCont = scene.add.container(width / 2, height / 2);

    const cardBg = scene.add.graphics();
    const pointerArrow = scene.add.graphics();

    const badgeTxt = scene.add.text(0, 0, '', {
      fontSize: '10.5px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      fontStyle: 'bold',
      letterSpacing: 1.2,
      resolution: dpr
    }).setOrigin(0, 0.5);

    const skipTxt = scene.add.text(0, 0, 'Пропустить ✕', {
      fontSize: '11px',
      fontFamily: FONT_UI,
      color: '#9c8265',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(1, 0.5);

    const skipZone = scene.add.zone(0, 0, 96, 26).setInteractive({ useHandCursor: true });

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

    const finishTour = () => {
      if (pulseTween) pulseTween.stop();
      this.markStageCompleted(stageId);
      this.destroyCurrent();
      if (typeof onComplete === 'function') onComplete();
    };

    const renderStep = () => {
      const step = steps[stepIndex];
      if (!step) {
        finishTour();
        return;
      }

      const r = step.rect || { x: width / 2 - 120, y: height / 2 - 40, w: 240, h: 80 };
      const rx = Phaser.Math.Clamp(r.x, 4, width - 8);
      const ry = Phaser.Math.Clamp(r.y, 4, height - 8);
      const rw = Phaser.Math.Clamp(r.w, 24, width - rx - 4);
      const rh = Phaser.Math.Clamp(r.h, 24, height - ry - 4);

      // Обновляем 4 затемняющие шторки вокруг окна подсветки
      shadeTop.setPosition(0, 0).setSize(width, ry);
      shadeBottom.setPosition(0, ry + rh).setSize(width, Math.max(0, height - (ry + rh)));
      shadeLeft.setPosition(0, ry).setSize(rx, rh);
      shadeRight.setPosition(rx + rw, ry).setSize(Math.max(0, width - (rx + rw)), rh);

      // Рамка вокруг выделенного блока
      highlightGfx.clear();
      highlightGfx.lineStyle(2.2, 0xfacc15, 1);
      highlightGfx.strokeRoundedRect(rx - 3, ry - 3, rw + 6, rh + 6, 12);

      glowGfx.clear();
      glowGfx.lineStyle(5, 0xfef08a, 0.55);
      glowGfx.strokeRoundedRect(rx - 6, ry - 6, rw + 12, rh + 12, 14);

      // Заполняем тексты карточки и считаем динамическую высоту
      const pad = 16;
      const topRowY = 18;
      badgeTxt.setText(step.badge || `ОБУЧЕНИЕ • ШАГ ${stepIndex + 1} ИЗ ${steps.length}`);
      badgeTxt.setPosition(-cardW / 2 + pad, topRowY);

      skipTxt.setPosition(cardW / 2 - pad, topRowY);
      skipZone.setPosition(cardW / 2 - pad - 42, topRowY);

      titleTxt.setText(step.title);
      titleTxt.setPosition(-cardW / 2 + pad, topRowY + 18);

      const bodyY = titleTxt.y + titleTxt.height + 8;
      bodyTxt.setText(step.body);
      bodyTxt.setPosition(-cardW / 2 + pad, bodyY);

      const btnY = bodyY + bodyTxt.height + 28;
      const cardH = btnY + nextBtnH / 2 + 14;

      // Рисуем плашку карточки
      cardBg.clear();
      cardBg.fillStyle(0x050302, 0.78);
      cardBg.fillRoundedRect(-cardW / 2, 4, cardW, cardH, 14);
      cardBg.fillGradientStyle(0x261a10, 0x261a10, 0x140d08, 0x140d08, 0.99);
      cardBg.fillRoundedRect(-cardW / 2, 0, cardW, cardH, 14);
      cardBg.lineStyle(1.8, 0xc89d54, 0.95);
      cardBg.strokeRoundedRect(-cardW / 2, 0, cardW, cardH, 14);

      // Кнопка "Далее" / "Понятно!"
      const btnX = cardW / 2 - pad - nextBtnW / 2;
      nextBtnGfx.clear();
      nextBtnGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
      nextBtnGfx.fillRoundedRect(btnX - nextBtnW / 2, btnY - nextBtnH / 2, nextBtnW, nextBtnH, 9);
      nextBtnGfx.lineStyle(1, 0xfef08a, 0.95);
      nextBtnGfx.strokeRoundedRect(btnX - nextBtnW / 2, btnY - nextBtnH / 2, nextBtnW, nextBtnH, 9);

      nextBtnTxt.setText(stepIndex === steps.length - 1 ? 'ПОНЯТНО ✓' : 'ДАЛЕЕ ›');
      nextBtnTxt.setPosition(btnX, btnY);
      nextBtnZone.setPosition(btnX, btnY);

      // Позиционируем карточку так, чтобы она не перекрывала выделенный прямоугольник
      const targetCenterY = ry + rh / 2;
      const targetCenterX = Phaser.Math.Clamp(rx + rw / 2, width / 2 - cardW / 2 + 24, width / 2 + cardW / 2 - 24) - width / 2;

      pointerArrow.clear();
      pointerArrow.fillStyle(0xc89d54, 1);

      if (targetCenterY < height * 0.5) {
        // Выделение сверху -> карточку ставим снизу от него
        const cardTop = Math.min(height - cardH - 14, ry + rh + 16);
        cardCont.setPosition(width / 2, cardTop);

        pointerArrow.beginPath();
        pointerArrow.moveTo(targetCenterX - 10, 0);
        pointerArrow.lineTo(targetCenterX + 10, 0);
        pointerArrow.lineTo(targetCenterX, -10);
        pointerArrow.closePath();
        pointerArrow.fill();
      } else {
        // Выделение снизу -> карточку ставим сверху от него
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
      stepIndex++;
      renderStep();
    });

    skipZone.on('pointerup', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      finishTour();
    });

    scene.events.once('shutdown', () => {
      if (pulseTween) pulseTween.stop();
      this.activeOverlay = null;
    });

    renderStep();
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
