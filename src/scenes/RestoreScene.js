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
    const preferredRegion = (data && data.regionId) ? data.regionId : null;
    const requestedTemplate = (data && data.templateId) ? data.templateId : null;

    if (typeof ArtifactsModule.generateArtifactOrder === 'function') {
      this.artifactData = ArtifactsModule.generateArtifactOrder(preferredRegion, history.slice(-3), requestedTemplate);
    } else {
      const templates = ArtifactsModule.ARTIFACT_TEMPLATES || [];
      this.artifactData = { ...templates[0], instanceId: `art_${Date.now()}` };
    }

    AudioManager.playEraMusic(this.artifactData.regionId);

    this.currentTaskIndex = 0;
    const firstTask = this.artifactData.tasks[0];
    this.activeTool = firstTask.requiredTool || 'tool_scraper';
    this.activeMaskKey = this.activeTool.replace('tool_', 'mask_');
    this.lastTouchPos = null;
    this.glueApplied = false;
    this.isTaskTransition = false;

    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;
    this.add.image(width / 2, height / 2, `bg_workshop_tier_${tier}`).setDepth(0);

    // ВЕРХНЯЯ ШАПКА ВЫСОКОЙ ЧЕТКОСТИ
    const homeBtn = this.add.image(90, 90, 'icon_home')
      .setScale(0.85).setInteractive({ useHandCursor: true }).setDepth(25);
    homeBtn.on('pointerdown', () => {
      AudioManager.stopMusic();
      this.scene.start('EraSelectScene');
    });

    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.add.text(150, 70, `${coins} 💰`, {
      fontSize: '36px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setDepth(25);

    this.createMuteButton(width - 90, 90);

    this.add.text(width / 2, 130, (this.artifactData.regionName || 'ЭКСПЕДИЦИЯ').toUpperCase(), {
      fontSize: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#c5a059',
      fontStyle: 'bold',
      letterSpacing: 4
    }).setOrigin(0.5).setDepth(25);

    this.add.text(width / 2, 175, this.artifactData.name, {
      fontSize: '40px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(25);

    // ЧИСТЫЙ СЕГМЕНТНЫЙ ИНДИКАТОР ПРОГРЕССА (БЕЗ РАЗНОЦВЕТНЫХ ПОЛОС)
    this.taskNotice = this.add.text(width / 2, 230, '', {
      fontSize: '26px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#22c55e',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(25);

    this.toolWarning = this.add.text(width / 2, 275, '', {
      fontSize: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(25);

    // ГЕОМЕТРИЯ АРТЕФАКТА (Масштаб 600x800)
    this.artW = 600;
    this.artH = 800;
    this.centerX = Math.round(width / 2);
    this.centerY = Math.round(height * 0.44);
    this.topLeftX = this.centerX - this.artW / 2;
    this.topLeftY = this.centerY - this.artH / 2;

    // Мягкая рассеянная тень на мате под артефактом
    this.add.ellipse(this.centerX, this.centerY + 340, 540, 90, 0x000000, 0.65).setDepth(1);

    const texKey = this.textures.exists(this.artifactData.textureKey) ? this.artifactData.textureKey : 'art_egypt_scarab';
    this.cleanArt = this.add.image(this.centerX, this.centerY, texKey).setDepth(2);

    this.breakHoleGfx = this.add.graphics().setDepth(3).setVisible(false);

    // Слой загрязнения в полном разрешении
    this.dirtLayer = this.add.renderTexture(this.topLeftX, this.topLeftY, this.artW, this.artH)
      .setOrigin(0, 0).setDepth(4);

    const maskImage = this.make.image({
      x: this.centerX,
      y: this.centerY,
      key: texKey,
      add: false
    });
    this.dirtLayer.setMask(maskImage.createBitmapMask());

    this.particles = this.add.particles(0, 0, 'particle_dust', {
      lifespan: { min: 250, max: 450 },
      speed: { min: 80, max: 200 },
      scale: { start: 1.2, end: 0 },
      emitting: false
    }).setDepth(5);

    const toolTex = (this.activeTool === 'tool_scraper') ? 'slot_scraper' : 'slot_brush_soft';
    this.toolSprite = this.add.image(this.centerX, this.centerY, toolTex)
      .setOrigin(0.5, 0.95).setScale(0.85).setAlpha(0).setDepth(15);

    this.assemblyContainer = this.add.container(0, 0).setDepth(14).setVisible(false);

    this.createToolsTray(height * 0.86);
    this.selectTool(this.activeTool, toolTex, this.activeMaskKey);

    this.startTask(0);

    const processInteraction = (pointer) => {
      if (!pointer.isDown || this.isTaskTransition) return;
      if (pointer.y > height * 0.76) return;

      const currentTask = this.artifactData.tasks[this.currentTaskIndex];

      if (currentTask.type === 'break_and_assemble') {
        this.processGlueAction(pointer);
        return;
      }

      if (!this.lastTouchPos) {
        this.lastTouchPos = { x: pointer.x, y: pointer.y };
        return;
      }

      const dx = pointer.x - this.lastTouchPos.x;
      const dy = pointer.y - this.lastTouchPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 6) return;

      this.lastTouchPos = { x: pointer.x, y: pointer.y };

      this.toolSprite.setPosition(pointer.x, pointer.y - 25);
      this.toolSprite.setAlpha(1);

      if (this.activeTool === 'tool_scraper') {
        this.toolSprite.angle = Phaser.Math.Clamp(dx * 1.5, -25, 25) + (Math.random() * 4 - 2);
      } else if (this.activeTool === 'tool_brush') {
        this.toolSprite.angle = Phaser.Math.Clamp(-dx * 1.8, -20, 20);
      } else if (this.activeTool === 'tool_polish') {
        this.toolSprite.angle = Math.sin(this.time.now * 0.02) * 12;
      } else {
        this.toolSprite.angle = 0;
      }

      if (this.activeTool !== currentTask.requiredTool) {
        this.toolWarning.setText(currentTask.hint || 'Выберите правильный инструмент в лотке!');
        return;
      }

      const localX = pointer.x - this.topLeftX;
      const localY = pointer.y - this.topLeftY;

      if (localX >= 0 && localX <= this.artW && localY >= 0 && localY <= this.artH) {
        this.dirtLayer.erase(this.activeMaskKey, localX, localY);
        this.markPointsCleaned(localX, localY);

        if (this.activeTool === 'tool_scraper') AudioManager.playScrub();
        else if (this.activeTool === 'tool_brush') AudioManager.playBrush();
        else if (this.activeTool === 'tool_solvent') AudioManager.playSpray();
        else if (this.activeTool === 'tool_polish') AudioManager.playCloth();

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
      this.tweens.add({
        targets: this.toolSprite,
        alpha: 0,
        angle: 0,
        duration: 150
      });
    });
  }

  initCoverageGrid() {
    this.gridPoints = [];
    const step = 30;
    const centerLocalX = this.artW / 2;
    const centerLocalY = this.artH / 2;
    const rx = this.artW * 0.38;
    const ry = this.artH * 0.42;

    for (let x = 40; x < this.artW - 40; x += step) {
      for (let y = 40; y < this.artH - 40; y += step) {
        const normX = (x - centerLocalX) / rx;
        const normY = (y - centerLocalY) / ry;
        if ((normX * normX + normY * normY) <= 1.0) {
          this.gridPoints.push({ x, y, cleaned: false });
        }
      }
    }
    this.totalCoveragePoints = Math.max(this.gridPoints.length, 1);
    this.cleanedCoveragePoints = 0;
  }

  markPointsCleaned(localX, localY) {
    const radius = 75;
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
    const ratio = this.cleanedCoveragePoints / this.totalCoveragePoints;
    if (ratio >= 0.95 && !this.isTaskTransition) {
      this.isTaskTransition = true;
      this.toolSprite.setAlpha(0);
      this.dirtLayer.clear();
      this.completeTaskTransition();
    }
  }

  setupBreakAndAssembleStage(task) {
    const { width } = this.scale;
    this.assemblyContainer.removeAll(true);
    this.assemblyContainer.setVisible(true);
    this.glueApplied = false;

    const shardTex = this.textures.exists(task.shardTexture) ? task.shardTexture : 'shard_amphora';
    const targetX = this.centerX + 70;
    const targetY = this.centerY - 40;

    this.breakHoleGfx.clear();
    this.breakHoleGfx.setVisible(true);
    this.breakHoleGfx.fillStyle(0x0a0c10, 0.95);
    this.breakHoleGfx.fillCircle(targetX, targetY, 52);
    this.breakHoleGfx.lineStyle(6, 0x8a7238, 0.7);
    this.breakHoleGfx.strokeCircle(targetX, targetY, 52);

    this.brokenPiece = this.add.image(targetX, targetY, shardTex).setDepth(16);

    AudioManager.playBreakSnap();
    if (navigator.vibrate) navigator.vibrate([40, 60]);

    this.tweens.add({
      targets: this.brokenPiece,
      x: width * 0.22,
      y: this.centerY + 180,
      angle: 35,
      duration: 650,
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
      if (d < 80 && this.glueApplied) {
        this.brokenPiece.setPosition(targetX, targetY);
        this.brokenPiece.setAngle(0);
        this.brokenPiece.disableInteractive();

        this.breakHoleGfx.clear();
        this.breakHoleGfx.lineStyle(6, 0x22c55e, 1);
        this.breakHoleGfx.strokeCircle(targetX, targetY, 52);

        AudioManager.playCoin();
        if (navigator.vibrate) navigator.vibrate([25, 30]);

        this.time.delayedCall(500, () => {
          this.breakHoleGfx.setVisible(false);
          this.assemblyContainer.setVisible(false);
          this.completeTaskTransition();
        });
      }
    });

    this.assemblyContainer.add([this.brokenPiece]);
  }

  processGlueAction(pointer) {
    if (this.activeTool !== 'tool_glue') {
      this.toolWarning.setText('Выберите КЛЕЙ в лотке!');
      return;
    }

    this.toolSprite.setPosition(pointer.x, pointer.y - 25);
    this.toolSprite.setAlpha(1);

    const targetX = this.centerX + 70;
    const targetY = this.centerY - 40;
    const d = Phaser.Math.Distance.Between(pointer.x, pointer.y, targetX, targetY);

    if (d < 80 && !this.glueApplied) {
      this.glueApplied = true;
      this.breakHoleGfx.fillStyle(0xf59e0b, 0.7);
      this.breakHoleGfx.fillCircle(targetX, targetY, 48);
      AudioManager.playWash();
      this.taskNotice.setText('КЛЕЙ НАНЕСЕН! ВЕРНИТЕ ОТКОЛОТУЮ ДЕТАЛЬ В ПАЗ');
      this.toolWarning.setText('');
    }
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

    this.add.rectangle(width / 2, trayY + 20, width * 0.92, 160, 0x12161f, 0.94)
      .setStrokeStyle(2, 0xffffff, 0.12)
      .setDepth(15);

    const stepX = (width * 0.88) / tools.length;
    const startX = width * 0.06 + stepX / 2;

    this.traySlots = [];

    tools.forEach((t, i) => {
      const slotX = startX + i * stepX;
      const isSelected = (t.id === this.activeTool);

      const slotBg = this.add.rectangle(slotX, trayY + 14, 110, 125, 0x1a212b, 0.95)
        .setStrokeStyle(2.5, isSelected ? 0x10b981 : 0x334155, isSelected ? 1 : 0.45)
        .setInteractive({ useHandCursor: true })
        .setDepth(16);

      this.add.image(slotX, trayY + 6, t.icon).setScale(0.55).setDepth(17);

      const lbl = this.add.text(slotX, trayY + 80, t.label, {
        fontSize: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: isSelected ? '#10b981' : '#94a3b8',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(17);

      slotBg.on('pointerdown', () => {
        this.tweens.add({
          targets: slotBg,
          scale: 0.92,
          duration: 60,
          yoyo: true,
          ease: 'Quad.easeInOut'
        });
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
      slot.bg.setStrokeStyle(2.5, active ? 0x10b981 : 0x334155, active ? 1 : 0.45);
      slot.label.setColor(active ? '#10b981' : '#94a3b8');
    });
  }

  startTask(taskIdx) {
    this.currentTaskIndex = taskIdx;
    this.isTaskTransition = false;
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
    this.initCoverageGrid();

    this.dirtLayer.clear();
    const dirtGfx = this.make.graphics({ x: 0, y: 0, add: false });

    if (task.requiredTool === 'tool_scraper') {
      dirtGfx.fillStyle(0x78562d, 0.98);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x4a2e12, 0.85);
      for (let i = 0; i < 35; i++) {
        dirtGfx.fillCircle(
          Phaser.Math.Between(40, this.artW - 40),
          Phaser.Math.Between(40, this.artH - 40),
          Phaser.Math.Between(30, 90)
        );
      }
    } else if (task.requiredTool === 'tool_brush') {
      dirtGfx.fillStyle(0xa89f81, 0.94);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x6b634d, 0.75);
      for (let i = 0; i < 35; i++) {
        dirtGfx.fillCircle(
          Phaser.Math.Between(40, this.artW - 40),
          Phaser.Math.Between(40, this.artH - 40),
          Phaser.Math.Between(20, 60)
        );
      }
    } else if (task.requiredTool === 'tool_solvent') {
      dirtGfx.fillStyle(0x2a593f, 0.92);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x438a63, 0.75);
      for (let i = 0; i < 30; i++) {
        dirtGfx.fillEllipse(
          Phaser.Math.Between(50, this.artW - 50),
          Phaser.Math.Between(50, this.artH - 50),
          Phaser.Math.Between(60, 160),
          Phaser.Math.Between(40, 100)
        );
      }
    } else {
      dirtGfx.fillStyle(0x181818, 0.55);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x333333, 0.40);
      for (let i = 0; i < 25; i++) {
        dirtGfx.fillCircle(
          Phaser.Math.Between(50, this.artW - 50),
          Phaser.Math.Between(50, this.artH - 50),
          Phaser.Math.Between(40, 120)
        );
      }
    }

    this.dirtLayer.draw(dirtGfx, 0, 0);
    dirtGfx.destroy();

    this.particles.setParticleTint(task.color || 0xc5a059);
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
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => {
        flash.destroy();

        if (this.currentTaskIndex < this.artifactData.tasks.length - 1) {
          this.time.delayedCall(250, () => {
            this.startTask(this.currentTaskIndex + 1);
          });
        } else {
          AudioManager.playShine();
          AudioManager.stopMusic();

          try {
            Storage.addArtifactToInventory({
              instanceId: this.artifactData.instanceId || `art_${Date.now()}`,
              templateId: this.artifactData.templateId || 'egypt_scarab',
              regionName: this.artifactData.regionName || 'Древний Египет',
              name: this.artifactData.name || 'Отреставрированный артефакт',
              museumDesc: this.artifactData.museumDesc || '',
              textureKey: this.artifactData.textureKey || 'art_egypt_scarab',
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

  createMuteButton(x, y) {
    const btn = this.add.image(x, y, 'icon_speaker')
      .setScale(0.85).setInteractive({ useHandCursor: true }).setDepth(25);
    const line = this.add.line(0, 0, x - 25, y - 25, x + 25, y + 25, 0xef4444, 5)
      .setOrigin(0).setDepth(26);

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
