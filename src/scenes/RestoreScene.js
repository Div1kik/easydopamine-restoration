import * as ArtifactsModule from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class RestoreScene extends Phaser.Scene {
  constructor() {
    super('RestoreScene');
  }

  create(data) {
    const { width, height } = this.scale;

    this.activeContract = (data && data.contract) ? data.contract : null;

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
      this.artifactData = ArtifactsModule.generateArtifactOrder(prefRegion, history, reqTemplate);
    } else {
      const templates = ArtifactsModule.ARTIFACT_TEMPLATES || [];
      const found = templates.find(t => t.id === reqTemplate) || templates[0];
      this.artifactData = { ...found, instanceId: `art_${Date.now()}` };
    }

    const isDuplicate = history.some(item => (item.templateId || item.id) === this.artifactData.id);
    this.isDuplicate = !this.activeContract && isDuplicate;

    if (this.activeContract) {
      this.artifactData.marketValue = this.activeContract.rewardCoins;
    } else if (this.isDuplicate) {
      this.artifactData.marketValue = Math.round((this.artifactData.marketValue || 100) * 0.45);
    }

    if (Storage.setActiveSession) {
      Storage.setActiveSession({ regionId: this.artifactData.regionId, templateId: this.artifactData.id });
    }

    if (AudioManager.playEraMusic) AudioManager.playEraMusic(this.artifactData.regionId || 'menu');

    this.currentTaskIndex = 0;
    this.lastTouchPos = null;
    this.lastCleanPos = null;
    this.glueApplied = false;
    this.isTaskTransition = false;
    this.mistakesCount = 0;
    this.lastMistakeTime = 0;
    this.isKintsugiMode = false;
    this.hasKintsugiMastery = false;

    // 1. Атмосферное освещение и фактурный верстак
    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;
    this.createAtmosphericWorkbench(width, height, tier);

    // 2. Верхняя навигация
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.coinsText = this.add.text(24, 34, `${coins} 🪙`, {
      fontSize: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(30);

    const menuBtn = this.add.rectangle(width - 64, 34, 104, 34, 0x161e2c)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    this.add.text(width - 64, 34, '🗂️ В меню', {
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

    const musicBtn = this.add.rectangle(width - 130, 34, 32, 32, 0x161e2c)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    const musicIcon = this.add.text(width - 130, 34, AudioManager.isMusicOn() ? '🎵' : '🔇', { fontSize: '15px' })
      .setOrigin(0.5).setDepth(31);

    musicBtn.on('pointerdown', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      const state = AudioManager.toggleMusic();
      musicIcon.setText(state ? '🎵' : '🔇');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    const sfxBtn = this.add.rectangle(width - 168, 34, 32, 32, 0x161e2c)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    const sfxIcon = this.add.text(width - 168, 34, AudioManager.isSfxOn() ? '🔊' : '🔈', { fontSize: '15px' })
      .setOrigin(0.5).setDepth(31);

    sfxBtn.on('pointerdown', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      const state = AudioManager.toggleSfx();
      sfxIcon.setText(state ? '🔊' : '🔈');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    // 3. Шапка задачи
    let headerTitle = (this.artifactData.regionName || 'ДРЕВНИЙ ЕГИПЕТ').toUpperCase();
    if (this.activeContract) {
      headerTitle = `📜 КОНТРАКТ: ${this.activeContract.client.toUpperCase()}`;
    } else if (this.isDuplicate) {
      headerTitle += ' • ПОВТОРНЫЙ ОБРАЗЕЦ (-55%)';
    }

    this.add.text(width / 2, 54, headerTitle, {
      fontSize: '10.5px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: this.activeContract ? '#facc15' : (this.isDuplicate ? '#94a3b8' : '#c5a059'),
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(30);

    this.add.text(width / 2, 74, this.artifactData.name, {
      fontSize: '18px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(30);

    this.taskNotice = this.add.text(width / 2, 95, '', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#cbd5e1'
    }).setOrigin(0.5).setDepth(30);

    const barWidth = width * 0.65;
    this.progressBarBg = this.add.rectangle(width / 2, 114, barWidth, 6, 0x0f172a).setDepth(30);
    this.progressBarFill = this.add.rectangle(width / 2 - barWidth / 2, 114, 0, 6, 0x10b981)
      .setOrigin(0, 0.5).setDepth(31);

    this.toolWarning = this.add.text(width / 2, 130, '', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(30);

    // 4. Позиционирование артефакта и тени
    this.artW = 320;
    this.artH = 400;
    this.centerX = Math.round(width / 2);
    this.centerY = Math.round(height * 0.44);
    this.topLeftX = this.centerX - this.artW / 2;
    this.topLeftY = this.centerY - this.artH / 2;

    // Двухслойный Ambient Occlusion
    this.add.ellipse(this.centerX, this.centerY + 164, 260, 48, 0x000000, 0.35).setDepth(6);
    this.add.ellipse(this.centerX, this.centerY + 160, 190, 32, 0x000000, 0.55).setDepth(6);

    const texKey = this.textures.exists(this.artifactData.textureKey) ? this.artifactData.textureKey : 'art_egypt_scarab';
    this.cleanArt = this.add.image(this.centerX, this.centerY, texKey).setDisplaySize(this.artW, this.artH).setDepth(7);

    this.breakHoleGfx = this.add.graphics().setDepth(7).setVisible(false);

    this.dirtLayer = this.add.renderTexture(this.topLeftX, this.topLeftY, this.artW, this.artH)
      .setOrigin(0, 0).setDepth(8);

    const maskImage = this.make.image({
      x: this.centerX,
      y: this.centerY,
      key: texKey,
      add: false
    });
    maskImage.setDisplaySize(this.artW, this.artH);
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

    const toolTex = (this.activeTool === 'tool_scraper') ? 'slot_scraper' : 'slot_brush';
    this.toolSprite = this.add.image(this.centerX, this.centerY, toolTex)
      .setOrigin(0.5, 0.95).setScale(0.7).setAlpha(0).setDepth(20);

    this.assemblyContainer = this.add.container(0, 0).setDepth(18).setVisible(false);

    this.createToolTray(height * 0.84);
    this.selectTool(this.activeTool, toolTex, this.activeMaskKey, true);

    this.gridCols = 32;
    this.gridRows = 40;
    this.totalCells = this.gridCols * this.gridRows;
    this.cleanedGrid = new Uint8Array(this.totalCells);
    this.validCellsMask = new Uint8Array(this.totalCells);
    this.buildValidShapeMask(texKey);

    this.startTask(0);

    // 5. Очистка
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
        this.toolWarning.setText(`⚠️ ОШИБКА: Нужен ${this.getToolName(currentTask.requiredTool)}!`);

        if (this.time.now - this.lastMistakeTime > 600) {
          this.lastMistakeTime = this.time.now;
          this.mistakesCount++;
          if (AudioManager.playScrub) AudioManager.playScrub();
          this.cameras.main.shake(120, 0.004);
        }
        return;
      }

      this.toolWarning.setText('');

      if (this.lastCleanPos) {
        const moveDist = Phaser.Math.Distance.Between(this.lastCleanPos.x, this.lastCleanPos.y, pointer.x, pointer.y);
        if (moveDist < 4) return;
      }
      this.lastCleanPos = { x: pointer.x, y: pointer.y };

      const localX = pointer.x - this.topLeftX;
      const localY = pointer.y - this.topLeftY;

      if (localX >= 0 && localX <= this.artW && localY >= 0 && localY <= this.artH) {
        this.dirtLayer.erase(this.activeMaskKey, localX, localY);

        if (this.activeTool === 'tool_scraper' && AudioManager.playScrub) AudioManager.playScrub();
        else if (this.activeTool === 'tool_brush' && AudioManager.playBrush) AudioManager.playBrush();
        else if (this.activeTool === 'tool_solvent' && AudioManager.playSpray) AudioManager.playSpray();
        else if (this.activeTool === 'tool_polish' && AudioManager.playCloth) AudioManager.playCloth();

        this.particles.emitParticleAt(pointer.x, pointer.y, 2);

        const eraserRadius = (this.activeTool === 'tool_scraper') ? 20 :
                             (this.activeTool === 'tool_brush') ? 24 :
                             (this.activeTool === 'tool_solvent') ? 22 : 26;

        const cellRadiusX = Math.ceil(eraserRadius / this.artW * this.gridCols);
        const cellRadiusY = Math.ceil(eraserRadius / this.artH * this.gridRows);

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

              if (dist <= eraserRadius) {
                const idx = gy * this.gridCols + gx;
                if (this.validCellsMask[idx] === 1) {
                  if (this.cleanedGrid[idx] < 2) {
                    this.cleanedGrid[idx]++;
                    if (this.cleanedGrid[idx] === 2) {
                      this.cleanedCount++;
                    }
                  }
                }
              }
            }
          }
        }

        const targetGoal = Math.max(this.targetValidCells * 0.92, 1);
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
      this.lastCleanPos = null;
      this.tweens.add({
        targets: this.toolSprite,
        alpha: 0,
        duration: 140
      });
    });
  }

  getToolName(toolId) {
    const map = {
      tool_scraper: 'Скребок',
      tool_brush: 'Кисть',
      tool_solvent: 'Спрей',
      tool_glue: 'Клей',
      tool_polish: 'Замша'
    };
    return map[toolId] || 'инструмент';
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

    if (this.targetValidCells < 50) {
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

  // Обновлённый визуальный рендер: тёплый софит и фактура мата
  createAtmosphericWorkbench(width, height, tier) {
    const bg = this.add.graphics().setDepth(0);

    // Глубокий затемнённый фон комнаты
    bg.fillStyle(0x06080d, 1);
    bg.fillRect(0, 0, width, height);

    const tableY = height * 0.22;
    const tableH = height - tableY;

    // Стол
    bg.fillStyle(0x0f141f, 1);
    bg.fillRect(0, tableY, width, tableH);
    bg.lineStyle(2, 0x1e2738, 1);
    bg.strokeLineShape(new Phaser.Geom.Line(0, tableY, width, tableY));

    // Рабочий мат реставратора
    const matX = width * 0.05;
    const matY = tableY + 12;
    const matW = width * 0.90;
    const matH = height * 0.57;

    bg.fillStyle(0x131a26, 0.98);
    bg.fillRoundedRect(matX, matY, matW, matH, 14);

    // Двойной латунный кант
    bg.lineStyle(1.5, 0xc5a059, 0.7);
    bg.strokeRoundedRect(matX, matY, matW, matH, 14);
    bg.lineStyle(1, 0x334155, 0.4);
    bg.strokeRoundedRect(matX + 4, matY + 4, matW - 8, matH - 8, 10);

    // Угловые латунные заклёпки
    const rivetPositions = [
      { x: matX + 12, y: matY + 12 },
      { x: matX + matW - 12, y: matY + 12 },
      { x: matX + 12, y: matY + matH - 12 },
      { x: matX + matW - 12, y: matY + matH - 12 }
    ];
    rivetPositions.forEach(r => {
      bg.fillStyle(0xd4af37, 0.85);
      bg.fillCircle(r.x, r.y, 3);
      bg.lineStyle(1, 0x78562d, 0.9);
      bg.strokeCircle(r.x, r.y, 3);
    });

    // Миллиметровая координатная сетка реставратора
    const gridGfx = this.add.graphics().setDepth(1);
    gridGfx.lineStyle(1, 0x1e293b, 0.28);
    const step = 28;
    for (let x = matX + 16; x < matX + matW - 16; x += step) {
      gridGfx.lineBetween(x, matY + 14, x, matY + matH - 14);
    }
    for (let y = matY + 16; y < matY + matH - 16; y += step) {
      gridGfx.lineBetween(matX + 14, y, matX + matW - 14, y);
    }

    // Тёплый софит лампы мастера (Spotlight)
    const lampLight = this.add.circle(width / 2, height * 0.42, width * 0.46, 0xffeedd, 0.045)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(2);

    // Вторичный ореол
    this.add.circle(width / 2, height * 0.42, width * 0.28, 0xfacc15, 0.035)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(2);
  }

  processGlueAction(pointer) {
    if (this.activeTool !== 'tool_glue') {
      this.toolWarning.setText('Выберите КЛЕЙ или ЗОЛОТОЙ ЛАК в лотке!');
      return;
    }

    this.toolSprite.setPosition(pointer.x, pointer.y - 12);
    this.toolSprite.setAlpha(1);

    const targetX = this.centerX + 35;
    const targetY = this.centerY - 15;
    const d = Phaser.Math.Distance.Between(pointer.x, pointer.y, targetX, targetY);

    if (d < 50 && !this.glueApplied) {
      this.glueApplied = true;

      const fillColor = this.isKintsugiMode ? 0xfacc15 : 0xf59e0b;
      this.breakHoleGfx.fillStyle(fillColor, 0.85);
      this.breakHoleGfx.fillCircle(targetX, targetY, 26);

      if (this.isKintsugiMode) {
        this.breakHoleGfx.lineStyle(2, 0xfffbeb, 1);
        this.breakHoleGfx.strokeCircle(targetX, targetY, 26);
        this.particles.setParticleTint(0xfacc15);
        this.particles.emitParticleAt(targetX, targetY, 8);
      }

      if (AudioManager.playWash) AudioManager.playWash();
      this.taskNotice.setText(this.isKintsugiMode ? '✨ ЗОЛОТОЙ ЛАК НАНЕСЕН! ВЕРНИТЕ ДЕТАЛЬ В ПАЗ' : 'КЛЕЙ НАНЕСЕН! ВЕРНИТЕ ДЕТАЛЬ В ПАЗ');
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

    const shardTex = this.textures.exists(task.shardTexture) ? task.shardTexture : this.artifactData.textureKey;
    const targetX = this.centerX + 35;
    const targetY = this.centerY - 15;

    this.breakHoleGfx.clear();
    this.breakHoleGfx.setVisible(true);
    this.breakHoleGfx.fillStyle(0x0a0c10, 0.95);
    this.breakHoleGfx.fillCircle(targetX, targetY, 26);
    this.breakHoleGfx.lineStyle(2, 0x8a7238, 0.7);
    this.breakHoleGfx.strokeCircle(targetX, targetY, 26);

    const pieceContainer = this.add.container(targetX, targetY).setDepth(19);

    const pieceImg = this.add.image(0, 0, shardTex)
      .setDisplaySize(this.artW, this.artH);
    pieceImg.setPosition(-(targetX - this.centerX), -(targetY - this.centerY));

    const shardMaskShape = this.make.graphics({ add: false });
    shardMaskShape.fillStyle(0xffffff);
    shardMaskShape.fillCircle(0, 0, 26);

    const shardMask = shardMaskShape.createGeometryMask();
    pieceContainer.setMask(shardMask);

    const pieceBorder = this.add.graphics();
    pieceBorder.lineStyle(2, 0xc5a059, 0.85);
    pieceBorder.strokeCircle(0, 0, 26);

    const hitZone = this.add.circle(0, 0, 32, 0x000000, 0.001)
      .setInteractive({ draggable: true, useHandCursor: true });

    pieceContainer.add([pieceImg, pieceBorder, hitZone]);
    this.brokenPiece = pieceContainer;

    if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();

    this.showKintsugiChoiceWidget(width);

    this.tweens.add({
      targets: this.brokenPiece,
      x: width * 0.22,
      y: this.centerY + 75,
      duration: 600,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        shardMaskShape.setPosition(this.brokenPiece.x, this.brokenPiece.y);
        this.taskNotice.setText('ДЕТАЛЬ ОТЛОМИЛАСЬ! ВЫБЕРИТЕ КЛЕЙ ИЛИ ЗОЛОТО');
        this.selectTool('tool_glue', 'slot_glue', 'mask_glue', true);
      }
    });

    hitZone.on('drag', (pointer, dragX, dragY) => {
      if (!this.glueApplied) {
        this.toolWarning.setText('СНАЧАЛА НАНЕСИТЕ КЛЕЙ ИЛИ ЗОЛОТОЙ ЛАК!');
        return;
      }
      this.brokenPiece.x = pointer.x;
      this.brokenPiece.y = pointer.y;
      shardMaskShape.setPosition(this.brokenPiece.x, this.brokenPiece.y);
    });

    hitZone.on('dragend', () => {
      const d = Phaser.Math.Distance.Between(this.brokenPiece.x, this.brokenPiece.y, targetX, targetY);
      if (d < 45 && this.glueApplied) {
        this.brokenPiece.setPosition(targetX, targetY);
        shardMaskShape.setPosition(targetX, targetY);
        hitZone.disableInteractive();

        if (this.kintsugiBanner) this.kintsugiBanner.destroy();

        if (this.isKintsugiMode) {
          this.hasKintsugiMastery = true;
          this.breakHoleGfx.clear();
          this.breakHoleGfx.lineStyle(3, 0xfacc15, 1);
          this.breakHoleGfx.strokeCircle(targetX, targetY, 26);
          if (AudioManager.playShine) AudioManager.playShine();
        } else {
          this.breakHoleGfx.clear();
          this.breakHoleGfx.lineStyle(3, 0x22c55e, 1);
          this.breakHoleGfx.strokeCircle(targetX, targetY, 26);
          if (AudioManager.playCoin) AudioManager.playCoin();
        }

        this.time.delayedCall(450, () => {
          this.breakHoleGfx.setVisible(false);
          this.assemblyContainer.setVisible(false);
          shardMaskShape.destroy();
          this.completeTaskTransition();
        });
      }
    });

    this.assemblyContainer.add([this.brokenPiece]);
  }

  showKintsugiChoiceWidget(width) {
    if (this.kintsugiBanner) this.kintsugiBanner.destroy();

    this.kintsugiBanner = this.add.container(width / 2, this.centerY - 130).setDepth(25);

    const bannerBg = this.add.rectangle(0, 0, width * 0.86, 42, 0x141a26, 0.96)
      .setStrokeStyle(1.5, 0xe2b35b, 0.8);

    const kintsugiBtn = this.add.rectangle(width * 0.43 - 54, 0, 94, 28, 0xd4af37)
      .setStrokeStyle(1, 0xfde047)
      .setInteractive({ useHandCursor: true });

    const kintsugiTxt = this.add.text(width * 0.43 - 54, 0, '✨ КИНЦУГИ', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const infoTxt = this.add.text(-width * 0.43 + 12, 0, 'Золотой шов: +60% к цене', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    kintsugiBtn.on('pointerdown', () => {
      this.isKintsugiMode = !this.isKintsugiMode;
      kintsugiBtn.setFillStyle(this.isKintsugiMode ? 0x22c55e : 0xd4af37);
      kintsugiTxt.setText(this.isKintsugiMode ? 'ВЫБРАНО ✓' : '✨ КИНЦУГИ');
      infoTxt.setText(this.isKintsugiMode ? 'Мастерское золото активировано!' : 'Золотой шов: +60% к цене');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    this.kintsugiBanner.add([bannerBg, infoTxt, kintsugiBtn, kintsugiTxt]);
  }

  createToolTray(trayY) {
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

      const slotBg = this.add.rectangle(slotX, trayY + 8, 48, 54, 0x161e2c)
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
        this.selectTool(t.id, t.icon, t.mask, false);
      });

      this.traySlots.push({ id: t.id, bg: slotBg, label: lbl });
    });
  }

  selectTool(toolId, iconKey, maskKey, isSilent = false) {
    this.activeTool = toolId;
    this.activeMaskKey = maskKey;

    if (this.textures.exists(iconKey)) {
      this.toolSprite.setTexture(iconKey);
    }

    if (!isSilent && AudioManager.playClick) {
      AudioManager.playClick();
    }

    this.traySlots.forEach(slot => {
      const active = (slot.id === toolId);
      slot.bg.setStrokeStyle(1.5, active ? 0x10b981 : 0x2c3b52, active ? 1 : 0.6);
      slot.label.setColor(active ? '#10b981' : '#64748b');
    });

    const currentTask = this.artifactData.tasks[this.currentTaskIndex];
    if (currentTask && toolId === currentTask.requiredTool) {
      this.toolWarning.setText('');
    }
  }

  // Процедурная генерация фактурной грязи с микрорельефом
  startTask(taskIdx) {
    this.currentTaskIndex = taskIdx;
    this.isTaskTransition = false;
    this.cleanedGrid.fill(0);
    this.cleanedCount = 0;
    this.progressBarFill.width = 0;
    this.toolWarning.setText('');

    const task = this.artifactData.tasks[taskIdx];
    const taskTitle = task.hint || task.name || 'Очистите артефакт';
    this.taskNotice.setText(`ШАГ ${taskIdx + 1}/${this.artifactData.tasks.length}: ${taskTitle}`);

    const toolIcons = {
      tool_scraper: 'slot_scraper',
      tool_brush: 'slot_brush_soft',
      tool_solvent: 'slot_solvent',
      tool_glue: 'slot_glue',
      tool_polish: 'slot_polish'
    };

    this.selectTool(task.requiredTool, toolIcons[task.requiredTool] || 'slot_scraper', task.requiredTool.replace('tool_', 'mask_'), true);

    if (task.type === 'break_and_assemble') {
      this.dirtLayer.clear();
      this.setupBreakAndAssembleStage(task);
      return;
    }

    if (this.kintsugiBanner) {
      this.kintsugiBanner.destroy();
      this.kintsugiBanner = null;
    }

    this.assemblyContainer.setVisible(false);
    this.breakHoleGfx.setVisible(false);

    this.dirtLayer.clear();
    const dirtGfx = this.make.graphics({ x: 0, y: 0, add: false });

    if (task.requiredTool === 'tool_scraper') {
      // Плотная окаменевшая порода с разломами
      dirtGfx.fillStyle(0x6e4d25, 0.98);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);

      dirtGfx.fillStyle(0x422a12, 0.92);
      for (let i = 0; i < 34; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(12, 30));
      }
      dirtGfx.fillStyle(0x8a6233, 0.65);
      for (let i = 0; i < 28; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(6, 16));
      }
    } else if (task.requiredTool === 'tool_brush') {
      // Мягкий песчаный налет
      dirtGfx.fillStyle(0xa89f81, 0.94);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);

      dirtGfx.fillStyle(0x736c56, 0.75);
      for (let i = 0; i < 32; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(8, 24));
      }
      dirtGfx.fillStyle(0xc2ba9d, 0.55);
      for (let i = 0; i < 26; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(5, 14));
      }
    } else if (task.requiredTool === 'tool_solvent') {
      // Изумрудная патина и окислы
      dirtGfx.fillStyle(0x234d35, 0.94);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);

      dirtGfx.fillStyle(0x367853, 0.80);
      for (let i = 0; i < 28; i++) {
        dirtGfx.fillEllipse(Phaser.Math.Between(20, this.artW - 20), Phaser.Math.Between(20, this.artH - 20), Phaser.Math.Between(18, 38), Phaser.Math.Between(10, 22));
      }
      dirtGfx.fillStyle(0x133020, 0.70);
      for (let i = 0; i < 22; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(20, this.artW - 20), Phaser.Math.Between(20, this.artH - 20), Phaser.Math.Between(8, 18));
      }
    } else {
      // Финишная тусклая плёнка под полировку
      dirtGfx.fillStyle(0x141414, 0.65);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);

      dirtGfx.fillStyle(0x282828, 0.50);
      for (let i = 0; i < 24; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(20, this.artW - 20), Phaser.Math.Between(20, this.artH - 20), Phaser.Math.Between(14, 32));
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
      }
    });

    if (this.currentTaskIndex < this.artifactData.tasks.length - 1) {
      this.time.delayedCall(200, () => {
        this.startTask(this.currentTaskIndex + 1);
      });
    } else {
      if (AudioManager.playShine) AudioManager.playShine();
      if (AudioManager.stopMusic) AudioManager.stopMusic();

      let earnedStars = 3;
      let qualityMultiplier = 1.0;

      if (this.mistakesCount >= 3) {
        earnedStars = 1;
        qualityMultiplier = 0.6;
      } else if (this.mistakesCount >= 1) {
        earnedStars = 2;
        qualityMultiplier = 0.8;
      }

      const kintsugiBonus = this.hasKintsugiMastery ? 1.6 : 1.0;
      const finalPrice = Math.max(10, Math.round((this.artifactData.marketValue || 100) * qualityMultiplier * kintsugiBonus));
      this.artifactData.marketValue = finalPrice;
      this.artifactData.isKintsugi = this.hasKintsugiMastery;

      try {
        Storage.addArtifactToInventory({
          instanceId: this.artifactData.instanceId || `art_${Date.now()}`,
          templateId: this.artifactData.id,
          regionName: this.artifactData.regionName || 'Древний Египет',
          name: this.artifactData.name,
          museumDesc: this.artifactData.description || '',
          textureKey: this.artifactData.textureKey,
          marketValue: finalPrice,
          stars: earnedStars,
          isKintsugi: this.hasKintsugiMastery
        });

        Storage.addHistoryEntry({
          templateId: this.artifactData.id,
          name: this.artifactData.name,
          date: Date.now()
        });

        if (this.activeContract) {
          Storage.completeDailyContract();
        }
      } catch (e) {
        console.warn('Inventory save error:', e);
      }

      this.time.delayedCall(300, () => {
        this.scene.start('VictoryScene', {
          artifact: this.artifactData,
          stars: earnedStars,
          isDuplicate: this.isDuplicate,
          isContract: !!this.activeContract,
          isKintsugi: this.hasKintsugiMastery,
          contractBonusXP: this.activeContract ? this.activeContract.bonusXP : 0
        });
      });
    }
  }
}
