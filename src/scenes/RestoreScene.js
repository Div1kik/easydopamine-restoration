import { ARTIFACTS, ERAS } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class RestoreScene extends Phaser.Scene {
  constructor() {
    super('RestoreScene');
  }

  create() {
    const { width, height } = this.scale;
    const currentIdx = Storage.getCurrentLevelIndex();
    this.artifactData = ARTIFACTS[currentIdx] || ARTIFACTS[0];

    const matchedEra = ERAS.find(e => e.id === this.artifactData.eraId);
    const displayEraName = (this.artifactData.eraName || (matchedEra ? matchedEra.name : 'ЭПОХА')).toUpperCase();

    this.currentTaskIndex = 0;
    this.activeTool = 'tool_scraper';
    this.lastTouchPos = null;

    // Состояния для интерактивной склейки
    this.glueApplied = false;
    this.pieceAssembled = false;

    // 1. Фон мастерской
    this.add.image(width / 2, height / 2, 'bg_workshop').setDepth(0);

    // Домой
    const homeBtn = this.add.image(36, 36, 'icon_home')
      .setInteractive({ useHandCursor: true })
      .setDepth(25);
    homeBtn.on('pointerdown', () => this.scene.start('EraSelectScene'));

    const coins = Storage.getCoins();
    this.add.text(70, 26, `${coins}`, {
      fontSize: '20px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setDepth(25);

    this.createMuteButton(width - 36, 36);

    // Заголовки
    this.add.text(width / 2, 62, displayEraName, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#e67e22',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(25);

    this.add.text(width / 2, 85, this.artifactData.name, {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5).setDepth(25);

    // Подсказка задачи
    this.taskNotice = this.add.text(width / 2, 110, '', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#2ecc71',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(25);

    // Всплывающее предупреждение при неверном инструменте
    this.toolWarning = this.add.text(width / 2, 134, '', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#e74c3c',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(25);

    // Координаты центра верстака
    this.artW = 300;
    this.artH = 400;
    this.centerX = width / 2;
    this.centerY = height * 0.43;
    this.topLeftX = this.centerX - this.artW / 2;
    this.topLeftY = this.centerY - this.artH / 2;

    this.add.ellipse(this.centerX, this.centerY + 160, 260, 45, 0x000000, 0.45).setDepth(1);

    // Чистый артефакт
    this.cleanArt = this.add.image(this.centerX, this.centerY, this.artifactData.textureKey).setDepth(2);

    // Слой грязи
    this.dirtLayer = this.add.renderTexture(this.topLeftX, this.topLeftY, this.artW, this.artH)
      .setOrigin(0, 0)
      .setDepth(3);

    const maskImage = this.make.image({
      x: this.centerX,
      y: this.centerY,
      key: this.artifactData.textureKey,
      add: false
    });
    this.dirtLayer.setMask(maskImage.createBitmapMask());

    // Частицы
    this.particles = this.add.particles(0, 0, 'particle_dust', {
      lifespan: { min: 250, max: 450 },
      speed: { min: 60, max: 140 },
      scale: { start: 1.2, end: 0 },
      emitting: false
    }).setDepth(5);

    // Спрайт выбранного инструмента
    this.toolSprite = this.add.image(this.centerX, this.centerY, 'slot_scraper')
      .setOrigin(0.5, 0.95)
      .setScale(0.7)
      .setAlpha(0)
      .setDepth(15);

    // Контейнер прогресс-бара (скрывается на этапе склейки)
    this.progressContainer = this.add.container(0, 0).setDepth(12);
    const barWidth = width * 0.72;
    const pBg = this.add.rectangle(width / 2, height * 0.69, barWidth, 12, 0x111111);
    this.progressBar = this.add.rectangle(width / 2 - barWidth / 2, height * 0.69, 0, 12, 0x2ecc71).setOrigin(0, 0.5);
    this.progressText = this.add.text(width / 2, height * 0.69, '0%', {
      fontSize: '10px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.progressContainer.add([pBg, this.progressBar, this.progressText]);

    // Контейнер интерактивной склейки
    this.assemblyContainer = this.add.container(0, 0).setDepth(14).setVisible(false);
    this.createAssemblyElements();

    // Лоток инструментов
    this.createToolsTray(height * 0.83);

    // Старт первой задачи
    this.startTask(0);

    // Обработка логики очистки
    const processScrubbing = (pointer) => {
      if (!pointer.isDown || this.isTaskTransition) return;
      if (pointer.y > height * 0.74) return;

      const currentTask = this.artifactData.tasks[this.currentTaskIndex];

      // Если идет склейка — стирание грязи отключено
      if (currentTask.requiredTool === 'tool_glue') {
        this.processGlueAction(pointer);
        return;
      }

      if (!this.lastTouchPos) {
        this.lastTouchPos = { x: pointer.x, y: pointer.y };
        return;
      }

      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.lastTouchPos.x, this.lastTouchPos.y);
      if (dist < 6) return;

      this.lastTouchPos = { x: pointer.x, y: pointer.y };
      this.toolSprite.setPosition(pointer.x, pointer.y - 10);
      this.toolSprite.setAlpha(1);

      // ЖЕСТКАЯ ЛОГИКА: Не тот инструмент = 0 прогресса + предупреждение
      if (this.activeTool !== currentTask.requiredTool) {
        this.showToolWarning(currentTask.requiredTool);
        return;
      }

      const localX = pointer.x - this.topLeftX;
      const localY = pointer.y - this.topLeftY;

      if (localX >= 0 && localX <= this.artW && localY >= 0 && localY <= this.artH) {
        this.dirtLayer.erase(this.activeMaskKey, localX, localY);
        this.cleanedSteps += 2;

        if (this.activeTool === 'tool_scraper') AudioManager.playScrub();
        else if (this.activeTool === 'tool_solvent') AudioManager.playWash();
        else AudioManager.playCloth();

        if (navigator.vibrate && Math.random() < 0.2) navigator.vibrate(8);
        this.particles.emitParticleAt(pointer.x, pointer.y, 2);

        this.updateProgress();
      }
    };

    this.input.on('pointerdown', (p) => {
      this.lastTouchPos = { x: p.x, y: p.y };
      processScrubbing(p);
    });
    this.input.on('pointermove', processScrubbing);
    this.input.on('pointerup', () => {
      this.lastTouchPos = null;
      this.toolSprite.setAlpha(0);
    });
  }

  // Создание интерактивного осколка для склейки
  createAssemblyElements() {
    const { width } = this.scale;

    // Подсвеченный шов скола на амфоре
    this.seamGfx = this.add.graphics();
    this.seamGfx.lineStyle(6, 0xd4af37, 0.4);
    this.seamGfx.strokeLineShape(new Phaser.Geom.Line(this.centerX - 30, this.centerY - 20, this.centerX + 25, this.centerY + 70));

    // Интерактивный осколок сбоку верстака
    this.brokenPiece = this.add.image(width * 0.16, this.centerY + 50, 'slot_glue') // Заглушка формы осколка
      .setScale(0.55)
      .setInteractive({ draggable: true });

    // Посадочная целевая зона осколка
    this.targetZone = { x: this.centerX - 5, y: this.centerY + 25 };

    this.brokenPiece.on('drag', (pointer, dragX, dragY) => {
      if (!this.glueApplied) {
        this.toolWarning.setText('СНАЧАЛА НАНЕСИТЕ КЛЕЙ ПО ШВУ!');
        return;
      }
      this.brokenPiece.setPosition(dragX, dragY);
    });

    this.brokenPiece.on('dragend', () => {
      const d = Phaser.Math.Distance.Between(this.brokenPiece.x, this.brokenPiece.y, this.targetZone.x, this.targetZone.y);
      if (d < 35 && this.glueApplied) {
        // Успешный защелк осколка на место
        this.brokenPiece.setPosition(this.targetZone.x, this.targetZone.y);
        this.brokenPiece.disableInteractive();
        this.seamGfx.clear();
        this.seamGfx.lineStyle(4, 0x2ecc71, 0.9);
        this.seamGfx.strokeLineShape(new Phaser.Geom.Line(this.centerX - 30, this.centerY - 20, this.centerX + 25, this.centerY + 70));

        AudioManager.playCoin();
        if (navigator.vibrate) navigator.vibrate([30, 40]);

        this.time.delayedCall(400, () => {
          this.assemblyContainer.setVisible(false);
          this.completeTaskTransition();
        });
      }
    });

    this.assemblyContainer.add([this.seamGfx, this.brokenPiece]);
  }

  processGlueAction(pointer) {
    if (this.activeTool !== 'tool_glue') {
      this.showToolWarning('tool_glue');
      return;
    }

    this.toolSprite.setPosition(pointer.x, pointer.y - 10);
    this.toolSprite.setAlpha(1);

    // Нанесение клея по шву трещины
    const d = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.centerX, this.centerY + 25);
    if (d < 60 && !this.glueApplied) {
      this.glueApplied = true;
      this.seamGfx.clear();
      this.seamGfx.lineStyle(6, 0xf39c12, 1);
      this.seamGfx.strokeLineShape(new Phaser.Geom.Line(this.centerX - 30, this.centerY - 20, this.centerX + 25, this.centerY + 70));

      AudioManager.playWash();
      this.taskNotice.setText('КЛЕЙ НАНЕСЕН! ПРИСОЕДИНИТЕ ОСКОЛОК');
      this.toolWarning.setText('');
    }
  }

  showToolWarning(neededToolId) {
    const names = {
      tool_scraper: 'Нужен СКРЕБОК для грубой корки!',
      tool_solvent: 'Нужен РАСТВОРИТЕЛЬ для смывки налета!',
      tool_glue: 'Нужен КЛЕЙ для реставрации трещины!',
      tool_brush: 'Нужна КИСТЬ с пигментом для узора!',
      tool_polish: 'Нужна ЗАМША для финишной полировки!'
    };
    this.toolWarning.setText(names[neededToolId] || 'Выберите подходящий инструмент в лотке!');
  }

  createToolsTray(trayY) {
    const { width } = this.scale;
    const tools = [
      { id: 'tool_scraper', icon: 'slot_scraper', mask: 'mask_scraper', label: 'Скребок' },
      { id: 'tool_solvent', icon: 'slot_solvent', mask: 'mask_solvent', label: 'Растворитель' },
      { id: 'tool_glue', icon: 'slot_glue', mask: 'mask_glue', label: 'Клей' },
      { id: 'tool_brush', icon: 'slot_brush', mask: 'mask_brush', label: 'Краска' },
      { id: 'tool_polish', icon: 'slot_polish', mask: 'mask_polish', label: 'Замша' }
    ];

    this.add.rectangle(width / 2, trayY + 15, width * 0.94, 90, 0x1a1613, 0.95)
      .setStrokeStyle(1.5, 0x444444)
      .setDepth(15);

    const stepX = (width * 0.90) / tools.length;
    const startX = width * 0.05 + stepX / 2;

    this.traySlots = [];

    tools.forEach((t, i) => {
      const slotX = startX + i * stepX;
      const slotBg = this.add.rectangle(slotX, trayY + 10, 52, 60, 0x241e1a)
        .setStrokeStyle(1.5, t.id === this.activeTool ? 0x2ecc71 : 0x555555)
        .setInteractive({ useHandCursor: true })
        .setDepth(16);

      this.add.image(slotX, trayY + 5, t.icon).setScale(0.55).setDepth(17);
      this.add.text(slotX, trayY + 44, t.label, {
        fontSize: '9px',
        fontFamily: 'sans-serif',
        color: '#bdc3c7'
      }).setOrigin(0.5).setDepth(17);

      slotBg.on('pointerdown', () => {
        this.selectTool(t.id, t.icon, t.mask);
      });

      this.traySlots.push({ id: t.id, bg: slotBg });
    });
  }

  selectTool(toolId, iconKey, maskKey) {
    this.activeTool = toolId;
    this.activeMaskKey = maskKey;
    this.toolSprite.setTexture(iconKey);
    this.toolWarning.setText('');

    this.traySlots.forEach(slot => {
      slot.bg.setStrokeStyle(1.5, slot.id === toolId ? 0x2ecc71 : 0x555555);
    });
  }

  startTask(taskIdx) {
    this.currentTaskIndex = taskIdx;
    this.isTaskTransition = false;
    this.cleanedSteps = 0;
    this.toolWarning.setText('');

    const task = this.artifactData.tasks[taskIdx];
    this.taskNotice.setText(`ШАГ ${taskIdx + 1}/${this.artifactData.tasks.length}: ${task.name.toUpperCase()}`);
    this.targetSteps = task.target || 200;

    // Если фаза СКЛЕЙКИ — скрываем грязевой слой и ползунок, включаем интерактивный осколок
    if (task.requiredTool === 'tool_glue') {
      this.progressContainer.setVisible(false);
      this.dirtLayer.clear();
      this.assemblyContainer.setVisible(true);
      this.glueApplied = false;
      this.taskNotice.setText('ИНСТРУКЦИЯ: 1. НАНЕСИТЕ КЛЕЙ НА ШОВ. 2. ПРИСОЕДИНИТЕ ДЕТАЛЬ.');
      return;
    }

    // Обычная фаза очистки
    this.progressContainer.setVisible(true);
    this.assemblyContainer.setVisible(false);

    this.dirtLayer.clear();
    const dirtGfx = this.make.graphics({ x: 0, y: 0, add: false });
    dirtGfx.fillStyle(task.color, 0.96);
    dirtGfx.fillRect(0, 0, this.artW, this.artH);

    dirtGfx.fillStyle(0x111111, 0.35);
    for (let i = 0; i < 22; i++) {
      dirtGfx.fillCircle(
        Phaser.Math.Between(20, this.artW - 20),
        Phaser.Math.Between(20, this.artH - 20),
        Phaser.Math.Between(15, 50)
      );
    }
    this.dirtLayer.draw(dirtGfx, 0, 0);
    dirtGfx.destroy();

    this.particles.setParticleTint(task.color);
    this.updateProgress();
  }

  updateProgress() {
    const ratio = Math.min(this.cleanedSteps / this.targetSteps, 1);
    const maxWidth = this.scale.width * 0.72;

    // Плавное пропорциональное заполнение
    this.progressBar.width = ratio * maxWidth;
    this.progressText.setText(`${Math.floor(ratio * 100)}%`);

    if (ratio >= 1 && !this.isTaskTransition) {
      this.isTaskTransition = true;
      this.toolSprite.setAlpha(0);
      this.dirtLayer.clear();
      this.completeTaskTransition();
    }
  }

  completeTaskTransition() {
    AudioManager.playCoin();

    const flash = this.add.rectangle(
      this.cleanArt.x,
      this.cleanArt.y,
      this.cleanArt.width,
      this.cleanArt.height,
      0xffffff,
      0.85
    ).setDepth(18);
    flash.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => {
        flash.destroy();

        if (this.currentTaskIndex < this.artifactData.tasks.length - 1) {
          this.time.delayedCall(300, () => {
            this.startTask(this.currentTaskIndex + 1);
          });
        } else {
          AudioManager.playShine();
          this.time.delayedCall(350, () => {
            this.scene.start('VictoryScene', { 
              artifact: this.artifactData,
              stars: 3
            });
          });
        }
      }
    });
  }

  createMuteButton(x, y) {
    const btn = this.add.image(x, y, 'icon_speaker')
      .setInteractive({ useHandCursor: true })
      .setDepth(25);
    const line = this.add.line(0, 0, x - 12, y - 12, x + 12, y + 12, 0xe74c3c, 3)
      .setOrigin(0)
      .setDepth(26);

    const updateIcon = () => {
      line.setVisible(Storage.isMuted());
      btn.setAlpha(Storage.isMuted() ? 0.5 : 1);
    };

    updateIcon();

    btn.on('pointerdown', () => {
      Storage.toggleMute();
      updateIcon();
    });
  }
}
