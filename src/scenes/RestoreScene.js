import { generateArtifactOrder } from '../data/artifacts.js';
import { TOOL_SHOP_ITEMS } from '../data/tools.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class RestoreScene extends Phaser.Scene {
  constructor() {
    super('RestoreScene');
  }

  create(data) {
    const { width, height } = this.scale;

    const history = Storage.getRecentHistory();
    const preferredRegion = (data && data.regionId) ? data.regionId : null;
    this.artifactData = generateArtifactOrder(preferredRegion, history.slice(-3));

    this.currentTaskIndex = 0;
    this.activeTool = 'tool_scraper';
    this.lastTouchPos = null;
    this.glueApplied = false;

    // 1. ОТРИСОВКА АТМОСФЕРНОГО ФОНА МАСТЕРСКОЙ
    const tier = Storage.getWorkshopTier();
    this.add.image(width / 2, height / 2, `bg_workshop_tier_${tier}`).setDepth(0);

    // Верхняя панель
    const homeBtn = this.add.image(36, 36, 'icon_home')
      .setInteractive({ useHandCursor: true }).setDepth(25);
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
    this.add.text(width / 2, 58, this.artifactData.regionName.toUpperCase(), {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#e67e22',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(25);

    this.add.text(width / 2, 80, this.artifactData.name, {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(25);

    this.taskNotice = this.add.text(width / 2, 105, '', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#2ecc71',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(25);

    this.toolWarning = this.add.text(width / 2, 126, '', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#e74c3c',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(25);

    // Габариты верстака
    this.artW = 300;
    this.artH = 400;
    this.centerX = width / 2;
    this.centerY = height * 0.44;
    this.topLeftX = this.centerX - this.artW / 2;
    this.topLeftY = this.centerY - this.artH / 2;

    // Глубокая тень верстака под предметом
    this.add.ellipse(this.centerX, this.centerY + 165, 270, 48, 0x000000, 0.55).setDepth(1);

    // Чистый артефакт
    this.cleanArt = this.add.image(this.centerX, this.centerY, this.artifactData.textureKey).setDepth(2);

    // Слой грязи
    this.dirtLayer = this.add.renderTexture(this.topLeftX, this.topLeftY, this.artW, this.artH)
      .setOrigin(0, 0).setDepth(3);

    const maskImage = this.make.image({
      x: this.centerX,
      y: this.centerY,
      key: this.artifactData.textureKey,
      add: false
    });
    this.dirtLayer.setMask(maskImage.createBitmapMask());

    // Частицы пыли / искр
    this.particles = this.add.particles(0, 0, 'particle_dust', {
      lifespan: { min: 250, max: 450 },
      speed: { min: 60, max: 140 },
      scale: { start: 1.2, end: 0 },
      emitting: false
    }).setDepth(5);

    // Спрайт инструмента
    this.toolSprite = this.add.image(this.centerX, this.centerY, 'slot_scraper')
      .setOrigin(0.5, 0.95).setScale(0.7).setAlpha(0).setDepth(15);

    // Контейнер склейки
    this.assemblyContainer = this.add.container(0, 0).setDepth(14).setVisible(false);

    // Лоток инструментов
    this.createToolsTray(height * 0.84);

    // Старт первой фазы
    this.startTask(0);

    // Сенсорное управление
    const processInteraction = (pointer) => {
      if (!pointer.isDown || this.isTaskTransition) return;
      if (pointer.y > height * 0.74) return;

      const currentTask = this.artifactData.tasks[this.currentTaskIndex];

      if (currentTask.type === 'assemble') {
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

      if (this.activeTool !== currentTask.requiredTool) {
        this.toolWarning.setText(currentTask.hint || 'Выберите подходящий инструмент!');
        return;
      }

      const localX = pointer.x - this.topLeftX;
      const localY = pointer.y - this.topLeftY;

      if (localX >= 0 && localX <= this.artW && localY >= 0 && localY <= this.artH) {
        this.dirtLayer.erase(this.activeMaskKey, localX, localY);

        // Отмечаем стертые контрольные точки реальной площади
        this.markPointsCleaned(localX, localY);

        if (this.activeTool === 'tool_scraper') AudioManager.playScrub();
        else if (this.activeTool === 'tool_solvent') AudioManager.playWash();
        else AudioManager.playCloth();

        if (navigator.vibrate && Math.random() < 0.2) navigator.vibrate(8);
        this.particles.emitParticleAt(pointer.x, pointer.y, 2);

        this.checkRealCleanliness();
      }
    };

    this.input.on('pointerdown', (p) => {
      this.lastTouchPos = { x: p.x, y: p.y };
      processInteraction(p);
    });
    this.input.on('pointermove', processInteraction);
    this.input.on('pointerup', () => {
      this.lastTouchPos = null;
      this.toolSprite.setAlpha(0);
    });
  }

  // Сетка контрольных точек для проверки честной очистки поверхности
  initCoverageGrid() {
    this.gridPoints = [];
    const step = 20;
    for (let x = 30; x < this.artW - 30; x += step) {
      for (let y = 30; y < this.artH - 30; y += step) {
        this.gridPoints.push({ x, y, cleaned: false });
      }
    }
    this.totalCoveragePoints = this.gridPoints.length;
    this.cleanedCoveragePoints = 0;
  }

  markPointsCleaned(localX, localY) {
    const radius = 35;
    for (let i = 0; i < this.gridPoints.length; i++) {
      const p = this.gridPoints[i];
      if (!p.cleaned) {
        const d = Phaser.Math.Distance.Between(localX, localY, p.x, p.y);
        if (d < radius) {
          p.cleaned = true;
          this.cleanedCoveragePoints++;
        }
      }
    }
  }

  checkRealCleanliness() {
    // 92% очистки точек считается идеальным результатом без поиска микропикселей
    const ratio = this.cleanedCoveragePoints / this.totalCoveragePoints;
    if (ratio >= 0.92 && !this.isTaskTransition) {
      this.isTaskTransition = true;
      this.toolSprite.setAlpha(0);
      this.dirtLayer.clear();
      this.completeTaskTransition();
    }
  }

  processGlueAction(pointer) {
    if (this.activeTool !== 'tool_glue') {
      this.toolWarning.setText('Выберите КЛЕЙ в лотке!');
      return;
    }

    this.toolSprite.setPosition(pointer.x, pointer.y - 10);
    this.toolSprite.setAlpha(1);

    const d = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.centerX, this.centerY + 15);
    if (d < 50 && !this.glueApplied) {
      this.glueApplied = true;
      this.seamGfx.clear();
      this.seamGfx.lineStyle(6, 0xf39c12, 1);
      this.seamGfx.strokeLineShape(new Phaser.Geom.Line(this.centerX - 25, this.centerY - 15, this.centerX + 25, this.centerY + 60));

      AudioManager.playWash();
      this.taskNotice.setText('КЛЕЙ НАНЕСЕН! ПЕРЕТАЩИТЕ ОСКОЛОК В ПАЗ');
      this.toolWarning.setText('');
    }
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
      .setStrokeStyle(1.5, 0x444444).setDepth(15);

    const stepX = (width * 0.90) / tools.length;
    const startX = width * 0.05 + stepX / 2;

    this.traySlots = [];

    tools.forEach((t, i) => {
      const slotX = startX + i * stepX;
      const slotBg = this.add.rectangle(slotX, trayY + 10, 52, 60, 0x241e1a)
        .setStrokeStyle(1.5, t.id === this.activeTool ? 0x2ecc71 : 0x555555)
        .setInteractive({ useHandCursor: true }).setDepth(16);

      this.add.image(slotX, trayY + 5, t.icon).setScale(0.55).setDepth(17);
      this.add.text(slotX, trayY + 44, t.label, {
        fontSize: '9px',
        fontFamily: 'sans-serif',
        color: '#bdc3c7'
      }).setOrigin(0.5).setDepth(17);

      slotBg.on('pointerdown', () => this.selectTool(t.id, t.icon, t.mask));
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
    this.toolWarning.setText('');

    const task = this.artifactData.tasks[taskIdx];
    this.taskNotice.setText(`ШАГ ${taskIdx + 1}/${this.artifactData.tasks.length}: ${task.name.toUpperCase()}`);

    if (task.type === 'assemble') {
      this.dirtLayer.clear();
      this.setupAssembleStage(task);
      return;
    }

    this.assemblyContainer.setVisible(false);
    this.initCoverageGrid();

    // КОНТРАСТНАЯ ГРАФИКА ДЕФЕКТОВ ПО ЭТАПАМ
    this.dirtLayer.clear();
    const dirtGfx = this.make.graphics({ x: 0, y: 0, add: false });

    if (task.requiredTool === 'tool_scraper') {
      // 1. Окаменевшая грубая корка / ржавчина (глина, песок, окалина)
      dirtGfx.fillStyle(task.color || 0x78562d, 0.98);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x3e2714, 0.85);
      for (let i = 0; i < 30; i++) {
        dirtGfx.fillCircle(
          Phaser.Math.Between(20, this.artW - 20),
          Phaser.Math.Between(20, this.artH - 20),
          Phaser.Math.Between(15, 45)
        );
      }
    } else if (task.requiredTool === 'tool_solvent') {
      // 2. Химические окислы, солевой налет, патина (зеленовато-белесая эмульсия)
      dirtGfx.fillStyle(0x2d4f3e, 0.90);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x4a7c59, 0.75);
      for (let i = 0; i < 20; i++) {
        dirtGfx.fillEllipse(
          Phaser.Math.Between(30, this.artW - 30),
          Phaser.Math.Between(30, this.artH - 30),
          Phaser.Math.Between(30, 80),
          Phaser.Math.Between(20, 50)
        );
      }
    } else {
      // 3. Неполированная матовая поверхность (дымчатая вуаль перед зеркальным блеском)
      dirtGfx.fillStyle(0x1a1a1a, 0.55);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x333333, 0.40);
      for (let i = 0; i < 15; i++) {
        dirtGfx.fillCircle(
          Phaser.Math.Between(25, this.artW - 25),
          Phaser.Math.Between(25, this.artH - 25),
          Phaser.Math.Between(20, 60)
        );
      }
    }

    this.dirtLayer.draw(dirtGfx, 0, 0);
    dirtGfx.destroy();

    this.particles.setParticleTint(task.color || 0xd4af37);
  }

  setupAssembleStage(task) {
    const { width } = this.scale;
    this.assemblyContainer.removeAll(true);
    this.assemblyContainer.setVisible(true);
    this.glueApplied = false;

    this.seamGfx = this.add.graphics();
    this.seamGfx.lineStyle(6, 0xd4af37, 0.4);
    this.seamGfx.strokeLineShape(new Phaser.Geom.Line(this.centerX - 25, this.centerY - 15, this.centerX + 25, this.centerY + 60));

    const shardTex = this.textures.exists(task.shardTexture) ? task.shardTexture : 'shard_amphora';
    this.brokenPiece = this.add.image(width * 0.18, this.centerY + 60, shardTex)
      .setInteractive({ draggable: true });

    const targetX = this.centerX;
    const targetY = this.centerY + 25;

    this.brokenPiece.on('drag', (pointer, dragX, dragY) => {
      if (!this.glueApplied) {
        this.toolWarning.setText('СНАЧАЛА НАНЕСИТЕ КЛЕЙ НА ШОВ!');
        return;
      }
      this.brokenPiece.setPosition(dragX, dragY);
    });

    this.brokenPiece.on('dragend', () => {
      const d = Phaser.Math.Distance.Between(this.brokenPiece.x, this.brokenPiece.y, targetX, targetY);
      if (d < 45 && this.glueApplied) {
        this.brokenPiece.setPosition(targetX, targetY);
        this.brokenPiece.disableInteractive();

        this.seamGfx.clear();
        this.seamGfx.lineStyle(4, 0x2ecc71, 0.9);
        this.seamGfx.strokeLineShape(new Phaser.Geom.Line(this.centerX - 25, this.centerY - 15, this.centerX + 25, this.centerY + 60));

        AudioManager.playCoin();
        if (navigator.vibrate) navigator.vibrate([30, 40]);

        this.time.delayedCall(450, () => {
          this.assemblyContainer.setVisible(false);
          this.completeTaskTransition();
        });
      }
    });

    this.assemblyContainer.add([this.seamGfx, this.brokenPiece]);
    this.selectTool('tool_glue', 'slot_glue', 'mask_glue');
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
          Storage.addArtifactToInventory(this.artifactData);

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
      .setInteractive({ useHandCursor: true }).setDepth(25);
    const line = this.add.line(0, 0, x - 12, y - 12, x + 12, y + 12, 0xe74c3c, 3)
      .setOrigin(0).setDepth(26);

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
