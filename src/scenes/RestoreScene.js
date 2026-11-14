import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { YandexSDK } from '../utils/YandexSDK.js';
import { ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { ToolArt } from '../utils/ToolArt.js';

export class RestoreScene extends Phaser.Scene {
  constructor() {
    super('RestoreScene');
  }

  init(data) {
    this.regionId = (data && data.regionId) || 'egypt';
    this.templateId = (data && data.templateId) || null;
    this.contract = (data && data.contract) || null;
  }

  create() {
    const { width, height } = this.scale;
    const textRes = 3;
    const FONT_UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0805, 1).setDepth(0);

    // Подбор шаблона артефакта
    let template = this.templateId
      ? ARTIFACT_TEMPLATES.find((t) => t.id === this.templateId)
      : null;

    if (!template) {
      const pool = ARTIFACT_TEMPLATES.filter((t) => t.regionId === this.regionId);
      template = pool[0] || ARTIFACT_TEMPLATES[0];
    }
    this.template = template;

    if (!this.contract) {
      Storage.setActiveSession(this.regionId, this.template.id);
    }

    // Размеры и зона рабочего стола
    this.artW = 260;
    this.artH = 320;
    const topBound = 132;
    const bottomBound = height - 134;
    this.centerY = (topBound + bottomBound) / 2;

    // Фон верстака + подложка
    this.renderWorkbenchBackdrop(width, height, topBound, bottomBound);

    // Состояние этапов реставрации
    this.steps = [
      { id: 'scraper', name: 'Скребок', hint: 'Сколоть окаменевший пласт породы' },
      { id: 'brush', name: 'Кисть', hint: 'Смести минеральную пыль и песок' },
      { id: 'reagent', name: 'Реагент', hint: 'Снять вековой налёт и окислы' },
      { id: 'glue', name: 'Клей', hint: 'Скрепить сколы и трещины' },
      { id: 'polish', name: 'Блеск', hint: 'Отполировать до музейного сияния' }
    ];

    this.currentStepIdx = 0;
    this.mistakes = 0;
    this.kintsugiUsed = false;
    this.selectedTool = 'scraper';
    this.stepProgress = 0;
    this.isCompleted = false;

    // Отрисовка самого артефакта и слоёв загрязнений
    this.setupArtifactLayers(width, this.centerY);

    // Верхний HUD (казна, название, прогресс шага, кнопки звука и меню)
    this.createTopHud(width, textRes, FONT_UI);

    // Нижняя панель инструментов
    this.createBottomToolbar(width, height, textRes, FONT_UI);

    // Интерактив на рабочем поле
    this.setupWorkInteractions(width, height, topBound, bottomBound);

    if (AudioManager.playMusic) AudioManager.playMusic('workshop');
  }

  renderWorkbenchBackdrop(width, height, topBound, bottomBound) {
    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;
    const activeSkin = Storage.getActiveWorkbenchSkin
      ? Storage.getActiveWorkbenchSkin()
      : (localStorage.getItem('active_workbench_skin') || `workbench_bg_${tier}`);

    const isTextureValid = (key) => {
      if (!this.textures.exists(key)) return false;
      const tex = this.textures.get(key);
      const src = tex && tex.getSourceImage ? tex.getSourceImage() : null;
      return Boolean(src && src.width > 1 && src.height > 1);
    };

    const applyBgTexture = (key) => {
      if (!this.scene || !this.scene.isActive()) return;
      if (!isTextureValid(key)) return;

      if (this.workbenchBgImg) this.workbenchBgImg.destroy();
      this.workbenchBgImg = this.add.image(width / 2, height / 2, key).setDepth(1);
      this.workbenchBgImg.setScale(Math.max(width / this.workbenchBgImg.width, height / this.workbenchBgImg.height));
    };

    if (isTextureValid(activeSkin)) {
      applyBgTexture(activeSkin);
    } else {
      if (this.textures.exists(activeSkin)) {
        this.textures.remove(activeSkin);
      }

      if (isTextureValid('workbench_bg_1')) {
        applyBgTexture('workbench_bg_1');
      }

      this.load.once(`filecomplete-image-${activeSkin}`, () => {
        applyBgTexture(activeSkin);
      });

      this.load.image(activeSkin, `assets/workbenches/${activeSkin}.webp`);
      if (!this.load.isLoading()) {
        this.load.start();
      }
    }

    const artW = this.artW || 260;
    const artH = this.artH || 320;
    const maxMatW = width - 56;
    const maxMatH = (bottomBound - topBound) - 44;

    const matW = Math.min(artW + 46, maxMatW);
    const matH = Math.min(artH + 46, maxMatH);
    const matCenterY = this.centerY || ((topBound + bottomBound) / 2);

    this.matContainer = this.add.container(width / 2, matCenterY).setDepth(2);

    const matGfx = this.add.graphics();
    const halfW = matW / 2;
    const halfH = matH / 2;

    const palettes = {
      1: { fill: 0x261a11, border: 0x6e472b, line: 0x8c5a37 },
      2: { fill: 0x3b2615, border: 0x9c663a, line: 0xc2864e },
      3: { fill: 0x16382b, border: 0xc89d54, line: 0xe2b866 },
      4: { fill: 0x291d14, border: 0xfacc15, line: 0xfef08a }
    };
    const palette = palettes[tier] || palettes[1];

    matGfx.fillStyle(palette.fill, 0.22);
    matGfx.fillRoundedRect(-halfW, -halfH, matW, matH, 16);

    matGfx.lineStyle(2, palette.border, 0.85);
    matGfx.strokeRoundedRect(-halfW, -halfH, matW, matH, 16);

    matGfx.lineStyle(1, palette.line, 0.3);
    matGfx.strokeRoundedRect(-halfW + 5, -halfH + 5, matW - 10, matH - 10, 12);

    const rivets = [
      { x: -halfW + 11, y: -halfH + 11 },
      { x: halfW - 11, y: -halfH + 11 },
      { x: -halfW + 11, y: halfH - 11 },
      { x: halfW - 11, y: halfH - 11 }
    ];
    rivets.forEach((r) => {
      matGfx.fillStyle(palette.border, 0.9);
      matGfx.fillCircle(r.x, r.y, 2.5);
    });

    this.matContainer.add(matGfx);
  }

  setupArtifactLayers(width, centerY) {
    this.artContainer = this.add.container(width / 2, centerY).setDepth(5);

    const texKey = this.template.textureKey;
    if (this.textures.exists(texKey)) {
      this.artSprite = this.add.image(0, 0, texKey);
      const scale = Math.min(this.artW / this.artSprite.width, this.artH / this.artSprite.height);
      this.artSprite.setScale(scale);
    } else {
      this.artSprite = this.add.rectangle(0, 0, 180, 220, 0xc89d54, 1);
    }
    this.artContainer.add(this.artSprite);

    // Слой налёта / окислов (снимается реагентом)
    this.tarnishOverlay = this.add.graphics();
    this.tarnishOverlay.fillStyle(0x2d3a2e, 0.62);
    this.tarnishOverlay.fillRoundedRect(-this.artW * 0.36, -this.artH * 0.4, this.artW * 0.72, this.artH * 0.8, 36);
    this.artContainer.add(this.tarnishOverlay);

    // Слой пыли и песка (сметается кистью)
    this.dustOverlay = this.add.graphics();
    this.dustOverlay.fillStyle(0x8c7355, 0.74);
    for (let i = 0; i < 42; i++) {
      const rx = Phaser.Math.Between(-95, 95);
      const ry = Phaser.Math.Between(-125, 125);
      const rr = Phaser.Math.Between(12, 28);
      this.dustOverlay.fillCircle(rx, ry, rr);
    }
    this.artContainer.add(this.dustOverlay);

    // Слой окаменевшей породы (скалывается скребком)
    this.crustNodes = [];
    for (let i = 0; i < 28; i++) {
      const rx = Phaser.Math.Between(-85, 85);
      const ry = Phaser.Math.Between(-115, 115);
      const rr = Phaser.Math.Between(16, 30);
      const chunk = this.add.circle(rx, ry, rr, i % 2 === 0 ? 0x5c4938 : 0x473729, 0.96);
      chunk.setStrokeStyle(1.5, 0x2b2017, 0.8);
      this.artContainer.add(chunk);
      this.crustNodes.push(chunk);
    }

    // Слой трещин (склеивается клеем / кинцуги)
    this.crackGfx = this.add.graphics();
    this.crackGfx.lineStyle(3, 0x140d08, 0.92);
    this.crackGfx.beginPath();
    this.crackGfx.moveTo(-45, -70);
    this.crackGfx.lineTo(-10, -20);
    this.crackGfx.lineTo(-35, 35);
    this.crackGfx.moveTo(40, -50);
    this.crackGfx.lineTo(8, 10);
    this.crackGfx.lineTo(48, 75);
    this.crackGfx.strokePath();
    this.crackGfx.setAlpha(0);
    this.artContainer.add(this.crackGfx);
  }

  createTopHud(width, textRes, FONT_UI) {
    // Верхняя плашка монет и кнопок
    const coins = Storage.getCoins();
    const coinBox = this.add.graphics().setDepth(20);
    coinBox.fillStyle(0x1f140c, 0.92);
    coinBox.fillRoundedRect(14, 14, 106, 30, 8);
    coinBox.lineStyle(1, 0xc89d54, 0.8);
    coinBox.strokeRoundedRect(14, 14, 106, 30, 8);

    this.coinText = this.add.text(67, 29, `${coins} 🪙`, {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5).setDepth(21);

    // Кнопка Меню
    const menuBtn = this.add.graphics().setDepth(20);
    menuBtn.fillStyle(0x2b1d12, 0.95);
    menuBtn.fillRoundedRect(width - 74, 14, 60, 30, 8);
    menuBtn.lineStyle(1, 0xc89d54, 0.85);
    menuBtn.strokeRoundedRect(width - 74, 14, 60, 30, 8);

    this.add.text(width - 44, 29, 'Меню', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5).setDepth(21);

    const menuZone = this.add.zone(width - 44, 29, 60, 30)
      .setInteractive({ useHandCursor: true })
      .setDepth(22);
    menuZone.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });

    // Кнопка ?
    const helpCircle = this.add.circle(width - 96, 29, 14, 0x2b1d12)
      .setStrokeStyle(1.2, 0xfacc15, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);
    this.add.text(width - 96, 29, '?', {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5).setDepth(22);

    helpCircle.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.showQuickTip();
    });

    // Плашка названия артефакта и текущего шага
    const infoW = width - 28;
    const infoGfx = this.add.graphics().setDepth(20);
    infoGfx.fillStyle(0x1f140c, 0.92);
    infoGfx.fillRoundedRect(14, 52, infoW, 68, 11);
    infoGfx.lineStyle(1, 0xc89d54, 0.78);
    infoGfx.strokeRoundedRect(14, 52, infoW, 68, 11);

    const regionNames = {
      egypt: 'ДРЕВНИЙ ЕГИПЕТ',
      antique: 'АНТИЧНОСТЬ',
      europe: 'СРЕДНЕВЕКОВЬЕ',
      japan: 'ДРЕВНЯЯ ЯПОНИЯ',
      aztec: 'ИМПЕРИЯ АЦТЕКОВ',
      vikings: 'ЭПОХА ВИКИНГОВ',
      renaissance: 'РЕНЕССАНС'
    };

    this.add.text(width / 2, 66, regionNames[this.regionId] || 'ЭКСПЕДИЦИЯ', {
      fontSize: '10px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      fontStyle: 'bold',
      letterSpacing: 1.2,
      resolution: textRes
    }).setOrigin(0.5).setDepth(21);

    this.add.text(width / 2, 83, this.template.name, {
      fontSize: '14.5px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5).setDepth(21);

    this.stepHintText = this.add.text(width / 2, 102, '', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: textRes
    }).setOrigin(0.5).setDepth(21);

    // Прогресс-бар текущего этапа
    this.progressBarBg = this.add.graphics().setDepth(21);
    this.progressBarBg.fillStyle(0x0d0805, 0.95);
    this.progressBarBg.fillRoundedRect(width / 2 - 110, 112, 220, 4, 2);

    this.progressBarFill = this.add.graphics().setDepth(22);

    // Кнопка Кинцуги (появляется на шаге склейки)
    this.kintsugiBtn = this.add.container(width / 2, 146).setDepth(25).setVisible(false);
    const kBg = this.add.graphics();
    kBg.fillGradientStyle(0xfacc15, 0xfacc15, 0xb47814, 0xb47814, 1);
    kBg.fillRoundedRect(-96, -15, 192, 30, 9);
    kBg.lineStyle(1.5, 0xfef08a, 1);
    kBg.strokeRoundedRect(-96, -15, 192, 30, 9);

    this.kintsugiLabel = this.add.text(0, 0, '', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    const kZone = this.add.zone(0, 0, 192, 30).setInteractive({ useHandCursor: true });
    kZone.on('pointerdown', () => {
      if (this.kintsugiUsed) return;
      if (Storage.useKintsugiLacquer()) {
        this.kintsugiUsed = true;
        if (AudioManager.playShine) AudioManager.playShine();
        this.kintsugiLabel.setText('✨ КИНЦУГИ АКТИВИРОВАН (+60%)');
        this.crackGfx.clear();
        this.crackGfx.lineStyle(3.5, 0xfacc15, 1);
        this.crackGfx.beginPath();
        this.crackGfx.moveTo(-45, -70);
        this.crackGfx.lineTo(-10, -20);
        this.crackGfx.lineTo(-35, 35);
        this.crackGfx.moveTo(40, -50);
        this.crackGfx.lineTo(8, 10);
        this.crackGfx.lineTo(48, 75);
        this.crackGfx.strokePath();
      }
    });

    this.kintsugiBtn.add([kBg, this.kintsugiLabel, kZone]);
    this.updateHudStep();
  }

  updateHudStep() {
    const step = this.steps[this.currentStepIdx];
    if (!step) return;
    this.stepHintText.setText(`ШАГ ${this.currentStepIdx + 1}/${this.steps.length}: ${step.hint}`);

    const ratio = Phaser.Math.Clamp(this.stepProgress / 100, 0, 1);
    const { width } = this.scale;
    this.progressBarFill.clear();
    if (ratio > 0) {
      this.progressBarFill.fillStyle(0xfacc15, 1);
      this.progressBarFill.fillRoundedRect(width / 2 - 110, 112, Math.max(6, 220 * ratio), 4, 2);
    }

    if (step.id === 'glue') {
      const lacquer = Storage.getKintsugiLacquer();
      if (lacquer > 0 || this.kintsugiUsed) {
        this.kintsugiLabel.setText(
          this.kintsugiUsed ? '✨ КИНЦУГИ АКТИВИРОВАН (+60%)' : `✨ КИНЦУГИ (${lacquer} шт.)`
        );
        this.kintsugiBtn.setVisible(true);
      }
    } else {
      this.kintsugiBtn.setVisible(false);
    }
  }

  createBottomToolbar(width, height, textRes, FONT_UI) {
    const barH = 116;
    const barY = height - barH / 2 - 8;

    const panel = this.add.graphics().setDepth(20);
    panel.fillStyle(0x1b120b, 0.96);
    panel.fillRoundedRect(12, height - barH - 8, width - 24, barH, 14);
    panel.lineStyle(1.2, 0xc89d54, 0.8);
    panel.strokeRoundedRect(12, height - barH - 8, width - 24, barH, 14);

    const activeToolSkin = Storage.getActiveToolSkin ? Storage.getActiveToolSkin() : 'default';
    const slotW = (width - 48) / this.steps.length;
    this.toolButtons = {};

    this.steps.forEach((step, idx) => {
      const cx = 24 + slotW * idx + slotW / 2;
      const cont = this.add.container(cx, barY).setDepth(22);

      const boxW = slotW - 8;
      const boxH = 88;
      const bg = this.add.graphics();

      const drawBox = (selected) => {
        bg.clear();
        bg.fillStyle(selected ? 0x3b2614 : 0x24180f, 1);
        bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 10);
        bg.lineStyle(selected ? 2 : 1, selected ? 0xfacc15 : 0x785534, 0.95);
        bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 10);
      };
      drawBox(step.id === this.selectedTool);

      let iconObj = null;
      if (ToolArt && typeof ToolArt.createToolIcon === 'function') {
        iconObj = ToolArt.createToolIcon(this, step.id, activeToolSkin, 0, -10, 44);
      }
      if (!iconObj) {
        const emojis = { scraper: '⛏️', brush: '🖌️', reagent: '🧪', glue: '🏺', polish: '✨' };
        iconObj = this.add.text(0, -10, emojis[step.id] || '🛠', {
          fontSize: '26px',
          resolution: textRes
        }).setOrigin(0.5);
      }

      const lbl = this.add.text(0, 26, step.name, {
        fontSize: '11px',
        fontFamily: FONT_UI,
        color: '#fdf6e3',
        fontStyle: 'bold',
        resolution: textRes
      }).setOrigin(0.5);

      const hit = this.add.zone(0, 0, boxW, boxH).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        if (AudioManager.playClick) AudioManager.playClick();
        this.selectTool(step.id);
      });

      cont.add([bg, iconObj, lbl, hit]);
      this.toolButtons[step.id] = { cont, drawBox };
    });
  }

  selectTool(toolId) {
    this.selectedTool = toolId;
    Object.entries(this.toolButtons).forEach(([id, btn]) => {
      btn.drawBox(id === toolId);
    });
  }

  setupWorkInteractions(width, height, topBound, bottomBound) {
    const workZone = this.add.zone(width / 2, (topBound + bottomBound) / 2, width - 32, bottomBound - topBound)
      .setInteractive({ useHandCursor: true })
      .setDepth(15);

    let lastX = 0;
    let lastY = 0;

    workZone.on('pointerdown', (p) => {
      lastX = p.x;
      lastY = p.y;
      this.handleWorkStroke(p.x, p.y, 12);
    });

    workZone.on('pointermove', (p) => {
      if (!p.isDown) return;
      const dist = Phaser.Math.Distance.Between(lastX, lastY, p.x, p.y);
      if (dist >= 8) {
        lastX = p.x;
        lastY = p.y;
        this.handleWorkStroke(p.x, p.y, dist * 0.45);
      }
    });
  }

  handleWorkStroke(px, py, power) {
    if (this.isCompleted) return;
    const expectedStep = this.steps[this.currentStepIdx];
    if (!expectedStep) return;

    if (this.selectedTool !== expectedStep.id) {
      this.mistakes++;
      this.cameras.main.shake(90, 0.004);
      this.stepHintText.setColor('#fca5a5');
      this.time.delayedCall(350, () => {
        if (this.stepHintText) this.stepHintText.setColor('#d6c3a5');
      });
      return;
    }

    this.stepProgress = Math.min(100, this.stepProgress + power);
    this.applyVisualStepFeedback(expectedStep.id, this.stepProgress / 100);
    this.updateHudStep();

    if (this.stepProgress >= 100) {
      this.advanceStep();
    }
  }

  applyVisualStepFeedback(stepId, ratio) {
    if (stepId === 'scraper') {
      const targetVisible = Math.ceil(this.crustNodes.length * (1 - ratio));
      this.crustNodes.forEach((node, idx) => {
        if (idx >= targetVisible && node.visible) {
          node.setVisible(false);
        }
      });
      if (ratio > 0.75) {
        this.crackGfx.setAlpha((ratio - 0.75) * 4);
      }
    } else if (stepId === 'brush') {
      this.dustOverlay.setAlpha(Math.max(0, 0.74 * (1 - ratio)));
    } else if (stepId === 'reagent') {
      this.tarnishOverlay.setAlpha(Math.max(0, 0.62 * (1 - ratio)));
    } else if (stepId === 'glue') {
      this.crackGfx.setAlpha(this.kintsugiUsed ? 1 : Math.max(0.15, 1 - ratio * 0.85));
    } else if (stepId === 'polish') {
      this.artSprite.setScale(this.artSprite.scaleX * (1 + 0.0005));
    }
  }

  advanceStep() {
    if (AudioManager.playShine) AudioManager.playShine();
    this.currentStepIdx++;
    this.stepProgress = 0;

    if (this.currentStepIdx >= this.steps.length) {
      this.finishRestoration();
      return;
    }

    const nextStep = this.steps[this.currentStepIdx];
    this.selectTool(nextStep.id);
    this.updateHudStep();
  }

  showQuickTip() {
    const step = this.steps[this.currentStepIdx];
    if (!step) return;
    this.stepHintText.setColor('#facc15');
    this.stepHintText.setText(`ПОДСКАЗКА: Выберите инструмент «${step.name}»`);
  }

  finishRestoration() {
    if (this.isCompleted) return;
    this.isCompleted = true;

    let stars = 3;
    if (this.mistakes >= 6) stars = 1;
    else if (this.mistakes >= 2) stars = 2;

    const baseVal = this.template.baseValue || 150;
    const starMult = stars === 3 ? 1.35 : (stars === 2 ? 1.0 : 0.7);
    const kintsugiMult = this.kintsugiUsed ? 1.6 : 1.0;
    const earnedCoins = Math.round(baseVal * starMult * kintsugiMult);
    const earnedXP = Math.round((this.template.xpReward || 45) * (stars === 3 ? 1.3 : 1.0));

    Storage.addCoins(earnedCoins);
    const levelResult = Storage.addXP(earnedXP);

    if (this.contract) {
      Storage.addCoins(this.contract.rewardCoins || 0);
      Storage.addXP(this.contract.bonusXP || 0);
      Storage.completeDailyContract();
    } else {
      Storage.decrementArtifactStock(this.regionId, this.template.id);
      Storage.setActiveSession(null);

      if (stars >= 2) {
        Storage.addArtifactToInventory({
          instanceId: 'art_' + Date.now(),
          templateId: this.template.id,
          regionId: this.regionId,
          name: this.template.name,
          textureKey: this.template.textureKey,
          stars,
          kintsugi: this.kintsugiUsed,
          marketValue: earnedCoins,
          restoredAt: Date.now()
        });
      }
    }

    Storage.addHistoryEntry({
      templateId: this.template.id,
      name: this.template.name,
      stars,
      coins: earnedCoins,
      kintsugi: this.kintsugiUsed,
      date: Date.now()
    });

    if (YandexSDK && YandexSDK.showInterstitial) {
      YandexSDK.showInterstitial();
    }

    this.scene.start('VictoryScene', {
      template: this.template,
      regionId: this.regionId,
      stars,
      earnedCoins,
      earnedXP,
      kintsugiUsed: this.kintsugiUsed,
      contract: this.contract,
      levelResult
    });
  }
}
