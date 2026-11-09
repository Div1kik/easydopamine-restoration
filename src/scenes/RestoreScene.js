import * as ArtifactsModule from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class RestoreScene extends Phaser.Scene {
  constructor() {
    super('RestoreScene');
  }

  create(data) {
    const { width, height } = this.scale;

    const history = Storage.getRecentHistory ? Storage.getRecentHistory() : [];
    let prefRegion = (data && data.regionId) ? data.regionId : 'egypt';
    let reqTemplate = (data && data.templateId) ? data.templateId : null;

    if (!reqTemplate) {
      const saved = Storage.getActiveSession ? Storage.getActiveSession() : null;
      if (saved) {
        prefRegion = saved.regionId;
        reqTemplate = saved.templateId;
      }
    }

    if (typeof ArtifactsModule.generateArtifactOrder === 'function') {
      this.artifactData = ArtifactsModule.generateArtifactOrder(prefRegion, history.slice(-3), reqTemplate);
    } else {
      const templates = ArtifactsModule.ARTIFACT_TEMPLATES || [];
      const found = templates.find(t => t.id === reqTemplate) || templates[0];
      this.artifactData = { ...found, instanceId: `art_${Date.now()}` };
    }

    if (Storage.setActiveSession) {
      Storage.setActiveSession({ regionId: this.artifactData.regionId, templateId: this.artifactData.id });
    }

    if (AudioManager.playEraMusic) AudioManager.playEraMusic(this.artifactData.regionId);

    this.currentTaskIndex = 0;
    this.lastTouchPos = null;
    this.glueApplied = false;
    this.isTaskTransition = false;

    // 1. Фон верстака
    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;
    this.createAtmosphericWorkbench(width, height, tier);

    // 2. Верхняя навигация
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.coinsText = this.add.text(24, 34, `${coins} 💰`, {
      fontSize: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(30);

    // Кнопка В ГЛАВНОЕ МЕНЮ вместо лавки
    const menuBtn = this.add.rectangle(width - 64, 34, 104, 34, 0x161e2c)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    this.add.text(width - 64, 34, '🏠 В меню', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(31);

    menuBtn.on('pointerdown', () => {
      if (AudioManager.stopMusic) AudioManager.stopMusic();
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });

    // 3. Шапка задачи
    this.add.text(width / 2, 54, (this.artifactData.regionName || 'ДРЕВНИЙ ЕГИПЕТ').toUpperCase(), {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#c5a059',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(30);

    this.add.text(width / 2, 74, this.artifactData.name, {
      fontSize: '18px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(30);

    this.taskNotice = this.add.text(width / 2, 94, '', {
      fontSize: '11.5px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#22c55e',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width * 0.88 }
    }).setOrigin(0.5).setDepth(30);

    const barWidth = width * 0.65;
    this.progressBarBg = this.add.rectangle(width / 2, 114, barWidth, 6, 0x0f141d).setDepth(30);
    this.progressBarFill = this.add.rectangle(width / 2 - barWidth / 2, 114, 0, 6, 0x10b981)
      .setOrigin(0, 0.5).setDepth(31);

    this.toolWarning = this.add.text(width / 2, 130, '', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(30);

    // 4. Точные габариты: 240 x 300 без искажения масштаба
    this.artW = 240;
    this.artH = 300;
    this.centerX = Math.round(width / 2);
    this.centerY = Math.round(height * 0.44);
    this.topLeftX = this.centerX - this.artW / 2;
    this.topLeftY = this.centerY - this.artH / 2;

    this.add.ellipse(this.centerX, this.centerY + 130, 200, 36, 0x000000, 0.7).setDepth(5);

    const texKey = this.textures.exists(this.artifactData.textureKey) ? this.artifactData.textureKey : 'art_egypt_scarab';
    this.cleanArt = this.add.image(this.centerX, this.centerY, texKey).setDepth(6);

    this.breakHoleGfx = this.add.graphics().setDepth(7).setVisible(false);

    // Слой грязи строго совпадает по размерам с артефактом
    this.dirtLayer = this.add.renderTexture(this.topLeftX, this.topLeftY, this.artW, this.artH)
      .setOrigin(0, 0).setDepth(8);

    const maskImage = this.make.image({
      x: this.centerX,
      y: this.centerY,
      key: texKey,
      add: false
    });
    this.dirtLayer.setMask(maskImage.createBitmapMask());

    this.particles = this.add.particles(0, 0, 'particle_dust', {
      lifespan: { min: 200, max: 350 },
      speed: { min: 40, max: 90 },
      scale: { start: 1.0, end: 0 },
      emitting: false
    }).setDepth(9);

    const firstTask = this.artifactData.tasks[0];
    this.activeTool = firstTask.requiredTool || 'tool_scraper';
    this.activeMaskKey = this.activeTool.replace('tool_', 'mask_');

    const toolTex = (this.activeTool === 'tool_scraper') ? 'slot_scraper' : 'slot_brush_soft';
    this.toolSprite = this.add.image(this.centerX, this.centerY, toolTex)
      .setOrigin(0.5, 0.95).setScale(0.7).setAlpha(0).setDepth(20);

    this.assemblyContainer = this.add.container(0, 0).setDepth(18).setVisible(false);

    this.createToolsTray(height * 0.84);
    this.selectTool(this.activeTool, toolTex, this.activeMaskKey);

    // Сетка анализа (24 x 30): каждая ячейка равна ровно 10x10 пикселей!
    this.gridCols = 24;
    this.gridRows = 30;
    this.totalCells = this.gridCols * this.gridRows;
    this.cleanedGrid = new Uint8Array(this.totalCells);
    this.validCellsMask = new Uint8Array(this.totalCells);
    this.buildValidShapeMask(texKey);

    this.startTask(0);

    // 5. Очистка строго по контуру артефакта
    const processInteraction = (pointer) => {
      if (!pointer.isDown || this.isTaskTransition) return;
      if (pointer.y > height * 0.74) return;

      const currentTask = this.artifactData.tasks[this.currentTaskIndex];

      if (currentTask.type === 'break_and_assemble') {
        this.processGlueAction(pointer);
        return;
      }

      this.toolSprite.setPosition(pointer.x, pointer.y - 12);
      this.toolSprite.setAlpha(1);

      if (this.activeTool !== currentTask.requiredTool) {
        this.toolWarning.setText(currentTask.hint || 'Выберите требуемый инструмент в лотке!');
        return;
      }

      const localX = pointer.x - this.topLeftX;
      const localY = pointer.y - this.topLeftY;

      if (localX >= 0 && localX <= this.artW && localY >= 0 && localY <= this.artH) {
        this.dirtLayer.erase(this.activeMaskKey, localX, localY);

        if (this.activeTool === 'tool_scraper' && AudioManager.playScrub) AudioManager.playScrub();
        else if (this.activeTool === 'tool_brush' && AudioManager.playBrush) AudioManager.playBrush();
        else if (this.activeTool === 'tool_solvent' && AudioManager.playSpray) AudioManager.playSpray();
        else if (this.activeTool === 'tool_polish' && AudioManager.playCloth) AudioManager.playCloth();

        this.particles.emitParticleAt(pointer.x, pointer.y, 2);

        const eraseRadius = (this.activeTool === 'tool_scraper') ? 22 :
                            (this.activeTool === 'tool_brush') ? 26 :
                            (this.activeTool === 'tool_solvent') ? 24 : 26;

        const cellRadiusX = Math.ceil((eraseRadius / this.artW) * this.gridCols);
        const cellRadiusY = Math.ceil((eraseRadius / this.artH) * this.gridRows);

        const centerCellX = Math.floor((localX / this.artW) * this.gridCols);
        const centerCellY = Math.floor((localY / this.artH) * this.gridRows);

        for (let ox = -cellRadiusX; ox <= cellRadiusX; ox++) {
          for (let oy = -cellRadiusY; oy <= cellRadiusY; oy++) {
            const gx = centerCellX + ox;
            const gy = centerCellY + oy;

            if (gx >= 0 && gx < this.gridCols && gy >= 0 && gy < this.gridRows) {
              const cellPxX = (gx + 0.5) * (this.artW / this.gridCols);
              const cellPxY = (gy + 0.5) * (this.artH / this.gridRows);
              const dist = Phaser.Math.Distance.Between(localX, localY, cellPxX, cellPxY);

              if (dist <= eraseRadius) {
                const idx = gy * this.gridCols + gx;
                // Засчитываем ТОЛЬКО пиксели, где действительно нарисован артефакт
                if (this.validCellsMask[idx] === 1 && this.cleanedGrid[idx] === 0) {
                  this.cleanedGrid[idx] = 1;
                  this.cleanedCount++;
                }
              }
            }
          }
        }

        // Порог: 93% реального тела артефакта (без пустоты вокруг)
        const targetGoal = Math.max(this.targetValidCells * 0.93, 1);
        const ratio = Math.min(this.cleanedCount / targetGoal, 1);
        this.progressBarFill.width = (this.scale.width * 0.65) * ratio;

        if (ratio >= 1.0 && !this.isTaskTransition) {
          this.isTaskTransition = true;
          this.toolSprite.setAlpha(0);
          this.dirtLayer.clear();
          this.completeTaskTransition();
        }
      }
    };

    this.input.on('pointerdown', (p) => {
      this.lastTouchPos = { x: p.x, y: p.y };
      processInteraction(p);
    });
    this.input.on('pointermove', processInteraction);
    this.input.on('pointerup', () => {
      this.lastTouchPos = null;
      this.tweens.add({
        targets: this.toolSprite,
        alpha: 0,
        duration: 140
      });
    });
  }

  buildValidShapeMask(textureKey) {
    this.validCellsMask.fill(0);
    this.targetValidCells = 0;

    let srcCanvas = null;
    try {
      const tex = this.textures.get(textureKey);
      srcCanvas = tex.getSourceImage();
    } catch {
      srcCanvas = null;
    }

    if (srcCanvas && srcCanvas.getContext) {
      const ctx = srcCanvas.getContext('2d');
      const w = srcCanvas.width;
      const h = srcCanvas.height;
      const imgData = ctx.getImageData(0, 0, w, h).data;

      for (let gy = 0; gy < this.gridRows; gy++) {
        for (let gx = 0; gx < this.gridCols; gx++) {
          const sampleX = Math.floor((gx + 0.5) * (w / this.gridCols));
          const sampleY = Math.floor((gy + 0.5) * (h / this.gridRows));
          const alpha = imgData[(sampleY * w + sampleX) * 4 + 3];

          const idx = gy * this.gridCols + gx;
          if (alpha > 35) {
            this.validCellsMask[idx] = 1;
            this.targetValidCells++;
          }
        }
      }
    }

    // Резервная форма, если чтение canvas заблокировано политикой браузера
    if (this.targetValidCells < 40) {
      this.targetValidCells = 0;
      for (let gy = 0; gy < this.gridRows; gy++) {
        for (let gx = 0; gx < this.gridCols; gx++) {
          const nx = (gx / (this.gridCols - 1)) * 2 - 1;
          const ny = (gy / (this.gridRows - 1)) * 2 - 1;
          if ((nx * nx * 1.4 + ny * ny) <= 0.8) {
            const idx = gy * this.gridCols + gx;
            this.validCellsMask[idx] = 1;
            this.targetValidCells++;
          }
        }
      }
    }
  }

  createAtmosphericWorkbench(width, height, tier) {
    const bg = this.add.graphics().setDepth(0);
    bg.fillStyle(0x0a0c10, 1);
    bg.fillRect(0, 0, width, height);

    const tableY = height * 0.22;
    const tableH = height - tableY;

    bg.fillStyle(0x131822, 1);
    bg.fillRect(0, tableY, width, tableH);
    bg.lineStyle(2, 0x243042, 1);
    bg.strokeLineShape(new Phaser.Geom.Line(0, tableY, width, tableY));

    bg.fillStyle(0x18202c, 0.95);
    bg.fillRoundedRect(width * 0.08, tableY + 14, width * 0.84, height * 0.56, 10);
    bg.lineStyle(1, 0x334155, 0.5);
    bg.strokeRoundedRect(width * 0.08, tableY + 14, width * 0.84, height * 0.56, 10);
  }

  processGlueAction(pointer) {
    if (this.activeTool !== 'tool_glue') {
      this.toolWarning.setText('Выберите КЛЕЙ в лотке!');
      return;
    }

    this.toolSprite.setPosition(pointer.x, pointer.y - 12);
    this.toolSprite.setAlpha(1);

    const targetX = this.centerX + 25;
    const targetY = this.centerY - 10;
    const d = Phaser.Math.Distance.Between(pointer.x, pointer.y, targetX, targetY);

    if (d < 45 && !this.glueApplied) {
      this.glueApplied = true;
      this.breakHoleGfx.fillStyle(0xf59e0b, 0.75);
      this.breakHoleGfx.fillCircle(targetX, targetY, 20);
      if (AudioManager.playWash) AudioManager.playWash();
      this.taskNotice.setText('КЛЕЙ НАНЕСЕН! ВЕРНИТЕ ОТКОЛОТУЮ ДЕТАЛЬ В ПАЗ');
      this.progressBarFill.width = (this.scale.width * 0.65);
      this.toolWarning.setText('');
    }
  }

  setupBreakAndAssembleStage(task) {
    const { width } = this.scale;
    this.assemblyContainer.removeAll(true);
    this.assemblyContainer.setVisible(true);
    this.glueApplied = false;
    this.progressBarFill.width = 0;

    const shardTex = this.textures.exists(task.shardTexture) ? task.shardTexture : 'shard_amphora';
    const targetX = this.centerX + 25;
    const targetY = this.centerY - 10;

    this.breakHoleGfx.clear();
    this.breakHoleGfx.setVisible(true);
    this.breakHoleGfx.fillStyle(0x0a0c10, 0.95);
    this.breakHoleGfx.fillCircle(targetX, targetY, 20);
    this.breakHoleGfx.lineStyle(2, 0x8a7238, 0.7);
    this.breakHoleGfx.strokeCircle(targetX, targetY, 20);

    this.brokenPiece = this.add.image(targetX, targetY, shardTex).setDepth(19);

    if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();

    this.tweens.add({
      targets: this.brokenPiece,
      x: width * 0.20,
      y: this.centerY + 75,
      angle: 35,
      duration: 600,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.brokenPiece.setInteractive({ draggable: true });
        this.taskNotice.setText('ДЕТАЛЬ ОТЛОМИЛАСЬ! НАНЕСИТЕ КЛЕЙ НА СКОЛ');
        this.selectTool('tool_glue', 'slot_glue', 'mask_glue');
      }
    });

    this.brokenPiece.on('drag', (pointer, dragX, dragY) => {
      if (!this.glueApplied) {
        this.toolWarning.setText('СНАЧАЛА НАНЕСИТЕ КЛЕЙ НА МЕСТО СКОЛА!');
        return;
      }
      this.brokenPiece.setPosition(dragX, dragY);
    });

    this.brokenPiece.on('dragend', () => {
      const d = Phaser.Math.Distance.Between(this.brokenPiece.x, this.brokenPiece.y, targetX, targetY);
      if (d < 40 && this.glueApplied) {
        this.brokenPiece.setPosition(targetX, targetY);
        this.brokenPiece.setAngle(0);
        this.brokenPiece.disableInteractive();

        this.breakHoleGfx.clear();
        this.breakHoleGfx.lineStyle(3, 0x22c55e, 1);
        this.breakHoleGfx.strokeCircle(targetX, targetY, 20);

        if (AudioManager.playCoin) AudioManager.playCoin();

        this.time.delayedCall(450, () => {
          this.breakHoleGfx.setVisible(false);
          this.assemblyContainer.setVisible(false);
          this.completeTaskTransition();
        });
      }
    });

    this.assemblyContainer.add([this.brokenPiece]);
  }

  createToolsTray(trayY) {
    const { width } = this.scale;
    const tools = [
      { id: 'tool_scraper', icon: 'slot_scraper', mask: 'mask_scraper', label: 'Скребок' },
      { id: 'tool_brush', icon: 'slot_brush_soft', mask: 'mask_brush', label: 'Кисть' },
      { id: 'tool_solvent', icon: 'slot_solvent', mask: 'mask_solvent', label: 'Спрей' },
      { id: 'tool_glue', icon: 'slot_glue', mask: 'mask_glue', label: 'Клей' },
      { id: 'tool_polish', icon: 'slot_polish', mask: 'mask_polish', label: 'Замша' }
    ];

    this.add.rectangle(width / 2, trayY + 8, width * 0.94, 82, 0x0e131d, 0.96)
      .setStrokeStyle(1.5, 0x222e42, 0.9)
      .setDepth(22);

    const stepX = (width * 0.90) / tools.length;
    const startX = width * 0.05 + stepX / 2;

    this.traySlots = [];

    tools.forEach((t, i) => {
      const slotX = startX + i * stepX;
      const isSelected = (t.id === this.activeTool);

      const slotBg = this.add.rectangle(slotX, trayY + 8, 48, 54, 0x161e2c, 0.95)
        .setStrokeStyle(1.5, isSelected ? 0x10b981 : 0x2c3b52, isSelected ? 1 : 0.6)
        .setInteractive({ useHandCursor: true })
        .setDepth(23);

      this.add.image(slotX, trayY + 4, t.icon).setScale(0.6).setDepth(24);

      const lbl = this.add.text(slotX, trayY + 40, t.label, {
        fontSize: '9.5px',
        fontFamily: 'sans-serif',
        color: isSelected ? '#10b981' : '#64748b',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(24);

      slotBg.on('pointerdown', () => {
        this.selectTool(t.id, t.icon, t.mask);
      });

      this.traySlots.push({ id: t.id, bg: slotBg, label: lbl });
    });
  }

  selectTool(toolId, iconKey, maskKey) {
    this.activeTool = toolId;
    this.activeMaskKey = maskKey;
    this.toolSprite.setTexture(iconKey);
    this.toolWarning.setText('');

    this.traySlots.forEach(slot => {
      const active = (slot.id === toolId);
      slot.bg.setStrokeStyle(1.5, active ? 0x10b981 : 0x2c3b52, active ? 1 : 0.6);
      slot.label.setColor(active ? '#10b981' : '#64748b');
    });
  }

  startTask(taskIdx) {
    this.currentTaskIndex = taskIdx;
    this.isTaskTransition = false;
    this.cleanedGrid.fill(0);
    this.cleanedCount = 0;
    this.progressBarFill.width = 0;
    this.toolWarning.setText('');

    const task = this.artifactData.tasks[taskIdx];
    this.taskNotice.setText(`ШАГ ${taskIdx + 1}/${this.artifactData.tasks.length}: ${task.name.toUpperCase()}`);

    const toolIcons = {
      tool_scraper: 'slot_scraper',
      tool_brush: 'slot_brush_soft',
      tool_solvent: 'slot_solvent',
      tool_glue: 'slot_glue',
      tool_polish: 'slot_polish'
    };
    this.selectTool(task.requiredTool, toolIcons[task.requiredTool] || 'slot_scraper', task.requiredTool.replace('tool_', 'mask_'));

    if (task.type === 'break_and_assemble') {
      this.dirtLayer.clear();
      this.setupBreakAndAssembleStage(task);
      return;
    }

    this.assemblyContainer.setVisible(false);
    this.breakHoleGfx.setVisible(false);

    this.dirtLayer.clear();
    const dirtGfx = this.make.graphics({ x: 0, y: 0, add: false });

    if (task.requiredTool === 'tool_scraper') {
      dirtGfx.fillStyle(0x78562d, 0.98);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x4a2e12, 0.85);
      for (let i = 0; i < 24; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(15, 35));
      }
    } else if (task.requiredTool === 'tool_brush') {
      dirtGfx.fillStyle(0xa89f81, 0.94);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x6b634d, 0.7);
      for (let i = 0; i < 24; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(10, 25));
      }
    } else if (task.requiredTool === 'tool_solvent') {
      dirtGfx.fillStyle(0x2a593f, 0.92);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x438a63, 0.75);
      for (let i = 0; i < 20; i++) {
        dirtGfx.fillEllipse(Phaser.Math.Between(20, this.artW - 20), Phaser.Math.Between(20, this.artH - 20), 40, 25);
      }
    } else {
      dirtGfx.fillStyle(0x181818, 0.55);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x333333, 0.40);
      for (let i = 0; i < 16; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(20, this.artW - 20), Phaser.Math.Between(20, this.artH - 20), 25);
      }
    }

    this.dirtLayer.draw(dirtGfx, 0, 0);
    dirtGfx.destroy();

    this.particles.setParticleTint(task.color || 0xc5a059);
  }

  completeTaskTransition() {
    if (AudioManager.playCoin) AudioManager.playCoin();

    const flash = this.add.rectangle(
      this.cleanArt.x,
      this.cleanArt.y,
      this.cleanArt.width,
      this.cleanArt.height,
      0xffffff,
      0.85
    ).setDepth(25);
    flash.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => {
        flash.destroy();

        if (this.currentTaskIndex < this.artifactData.tasks.length - 1) {
          this.time.delayedCall(200, () => {
            this.startTask(this.currentTaskIndex + 1);
          });
        } else {
          if (AudioManager.playShine) AudioManager.playShine();
          if (AudioManager.stopMusic) AudioManager.stopMusic();

          try {
            Storage.addArtifactToInventory({
              instanceId: this.artifactData.instanceId || `art_${Date.now()}`,
              templateId: this.artifactData.id,
              regionName: this.artifactData.regionName || 'Древний Египет',
              name: this.artifactData.name,
              museumDesc: this.artifactData.description || '',
              textureKey: this.artifactData.textureKey,
              marketValue: this.artifactData.marketValue || 200
            });
            Storage.addXP(100);
          } catch (e) {
            console.warn('Inventory save error:', e);
          }

          this.time.delayedCall(300, () => {
            this.scene.start('VictoryScene', { 
              artifact: this.artifactData,
              stars: 3
            });
          });
        }
      }
    });
  }
}
