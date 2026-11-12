import * as ArtifactsModule from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class RestoreScene extends Phaser.Scene {
  constructor() {
    super('RestoreScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // 1. ДАННЫЕ И СЕССИЯ (ВЫЗОВ РОДНОГО ГЕНЕРАТОРА ЗАКАЗОВ)
    this.activeContract = (data && data.contract) ? data.contract : null;

    const history = Storage.getRestoreHistory ? Storage.getRestoreHistory() : [];
    let reqRegion = (data && data.regionId) ? data.regionId : 'egypt';
    let reqTemplateId = (data && data.templateId) ? data.templateId : null;

    if (!reqTemplateId) {
      const saved = Storage.getActiveSession ? Storage.getActiveSession() : null;
      if (saved && saved.templateId) {
        reqRegion = saved.regionId;
        reqTemplateId = saved.templateId;
      }
    }

    if (typeof ArtifactsModule.generateArtifactOrder === 'function') {
      this.artifactData = ArtifactsModule.generateArtifactOrder(reqRegion, history, reqTemplateId);
    } else {
      const templates = ArtifactsModule.ARTIFACT_TEMPLATES || [];
      const found = templates.find(t => t.id === reqTemplateId) || templates[0];
      this.artifactData = {
        ...found,
        instanceId: `art_${Date.now()}`,
        tasks: [
          { name: 'Сколоть окаменелый пласт породы', hint: 'Сколоть окаменелый пласт породы', requiredTool: 'tool_scraper', color: 0x78562d },
          { name: 'Смести минеральную пыль и песок', hint: 'Смести минеральную пыль и песок', requiredTool: 'tool_brush', color: 0xa89f81 },
          { name: 'Натереть воском и навести глянец', hint: 'Натереть воском и навести глянец', requiredTool: 'tool_polish', color: 0x18181b }
        ]
      };
    }

    this.isDuplicate = history.some(item => item.templateId === this.artifactData.id);
    if (this.isDuplicate && this.activeContract) {
      this.isDuplicate = false;
    }

    if (this.activeContract) {
      this.artifactData.marketValue = this.activeContract.rewardCoins;
    } else if (this.isDuplicate) {
      this.artifactData.marketValue = Math.round((this.artifactData.marketValue || 100) * 0.45);
    }

    if (Storage.setActiveSession) {
      Storage.setActiveSession({
        regionId: this.artifactData.regionId || reqRegion,
        templateId: this.artifactData.id
      });
    }

    if (AudioManager.playEraMusic) {
      AudioManager.playEraMusic(this.artifactData.regionId || 'egypt');
    }

    this.currentTaskIndex = 0;
    this.lastTouchPos = null;
    this.lastCleanPos = null;
    this.activeTool = null;
    this.isTaskTransition = false;
    this.mistakesCount = 0;
    this.isKintsugiMode = false;
    this.hasKintsugiMastery = false;

    this.isMobileDevice = true;
    this.generateDetailedToolTextures();

    // 2. БЕЗОПАСНАЯ ГЕОМЕТРИЯ ЭКРАНА
    const systemTopPad = 42;
    const topBarHeight = 46;
    const infoPanelHeight = 96;
    const headerTotalHeight = systemTopPad + topBarHeight + infoPanelHeight;

    const trayHeight = 90;
    const trayY = height - trayHeight / 2 - 14;
    const trayTopLimit = height - trayHeight - 24;

    const workspaceAvailableHeight = trayTopLimit - headerTotalHeight;
    this.centerX = Math.floor(width / 2);
    this.centerY = Math.floor(headerTotalHeight + workspaceAvailableHeight / 2);

    this.artW = Math.floor(Math.min(width * 0.78, 350));
    this.artH = Math.floor(Math.min(workspaceAvailableHeight * 0.78, 480));
    this.topLeftX = Math.floor(this.centerX - this.artW / 2);
    this.topLeftY = Math.floor(this.centerY - this.artH / 2);

    // Отрисовка верстака с анимацией раскатывания коврика
    this.renderWorkbenchWorkshop(width, height, headerTotalHeight, trayTopLimit);

    // 3. ВЕРХНИЙ БАР
    this.add.rectangle(width / 2, systemTopPad + 23, width, 46, 0x07090e, 0.92).setDepth(20);

    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.coinsText = this.add.text(width * 0.06, systemTopPad + 23, `🪙 ${coins}`, {
      fontSize: '13px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0, 0.5).setDepth(22);

    const btnSize = 34;
    const rightMargin = 14;

    const menuBtn = this.add.rectangle(width - rightMargin - 26, systemTopPad + 23, 52, 28, 0x141a24)
      .setStrokeStyle(1.5, 0x334155, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    this.add.text(width - rightMargin - 26, systemTopPad + 23, 'Меню', {
      fontSize: '11px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(22);

    menuBtn.on('pointerdown', () => {
      if (AudioManager.stopMusic) AudioManager.stopMusic();
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });

    const musicX = width - rightMargin - 52 - 10 - btnSize / 2;
    const musicBtn = this.add.circle(musicX, systemTopPad + 23, 14, 0x141a24)
      .setStrokeStyle(1.5, 0x334155, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    const musicIcon = this.add.text(musicX, systemTopPad + 23, AudioManager.isMusicOn() ? '🎵' : '🔇', {
      fontSize: '12px',
      resolution: dpr
    }).setOrigin(0.5).setDepth(22);

    musicBtn.on('pointerdown', (p, lx, ly, ev) => {
      if (ev && ev.stopPropagation) ev.stopPropagation();
      const state = AudioManager.toggleMusic();
      musicIcon.setText(state ? '🎵' : '🔇');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    const sfxX = musicX - btnSize - 6;
    const sfxBtn = this.add.circle(sfxX, systemTopPad + 23, 14, 0x141a24)
      .setStrokeStyle(1.5, 0x334155, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    const sfxIcon = this.add.text(sfxX, systemTopPad + 23, AudioManager.isSfxOn() ? '🔊' : '🔈', {
      fontSize: '12px',
      resolution: dpr
    }).setOrigin(0.5).setDepth(22);

    sfxBtn.on('pointerdown', (p, lx, ly, ev) => {
      if (ev && ev.stopPropagation) ev.stopPropagation();
      const state = AudioManager.toggleSfx();
      sfxIcon.setText(state ? '🔊' : '🔈');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    // 4. ИНФОРМАЦИОННАЯ ПЛАШКА
    const artInfoCont = this.add.container(0, systemTopPad + 46).setDepth(15);

    const regionNamesMap = {
      egypt: 'Древний Египет',
      antique: 'Античность',
      europe: 'Европа',
      japan: 'Япония',
      aztec: 'Ацтеки',
      vikings: 'Викинги',
      renaissance: 'Ренессанс'
    };

    const currentRegionName = regionNamesMap[this.artifactData.regionId] || this.artifactData.regionName || 'Экспедиция';
    let badgeText = currentRegionName;
    if (this.activeContract) {
      badgeText = '📜 СРОЧНЫЙ КОНТРАКТ';
    } else if (this.isDuplicate) {
      badgeText = 'ПОВТОРНЫЙ ОБРАЗЕЦ (-55%)';
    }

    const badgeTxt = this.add.text(width / 2, 8, badgeText, {
      fontSize: '10px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
      color: this.isDuplicate ? '#94a3b8' : '#facc15',
      fontStyle: 'bold',
      letterSpacing: 1,
      resolution: dpr
    }).setOrigin(0.5);

    this.artTitle = this.add.text(width / 2, 26, this.artifactData.name || 'Артефакт', {
      fontSize: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    this.taskNotice = this.add.text(width / 2, 46, '', {
      fontSize: '11px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
      color: '#38bdf8',
      resolution: dpr
    }).setOrigin(0.5);

    const barW = Math.min(width * 0.78, 280);
    this.progressBarBg = this.add.rectangle(width / 2, 64, barW, 6, 0x1e293b);
    this.progressBarFill = this.add.rectangle(width / 2 - barW / 2, 64, 0, 6, 0x10b981).setOrigin(0, 0.5);

    this.toolWarning = this.add.text(width / 2, 80, '', {
      fontSize: '10.5px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
      color: '#ef4444',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    artInfoCont.add([badgeTxt, this.artTitle, this.taskNotice, this.progressBarBg, this.progressBarFill, this.toolWarning]);

    // 5. РАБОЧАЯ ЗОНА И АРТЕФАКТ (СТРОГО ПО СИЛУЭТУ ЧЕРЕЗ BITMAP MASK)
    this.contactShadow1 = this.add.ellipse(this.centerX, this.centerY + this.artH * 0.14, this.artW * 0.88, 38, 0x000000, 0.14).setDepth(6);
    this.contactShadow2 = this.add.ellipse(this.centerX, this.centerY + this.artH * 0.14, this.artW * 0.65, 24, 0x000000, 0.22).setDepth(6);

    const texKey = this.textures.exists(this.artifactData.textureKey) ? this.artifactData.textureKey : 'art_egypt_scarab';
    this.cleanArt = this.add.image(this.centerX, this.centerY, texKey)
      .setDisplaySize(this.artW, this.artH)
      .setDepth(7);

    this.breakHoleGfx = this.add.graphics().setDepth(7).setVisible(false);

    this.dirtLayer = this.add.renderTexture(this.topLeftX, this.topLeftY, this.artW, this.artH)
      .setOrigin(0, 0)
      .setDepth(8);

    const maskImage = this.make.image({
      x: this.centerX,
      y: this.centerY,
      key: texKey,
      add: false
    });
    maskImage.setDisplaySize(this.artW, this.artH);
    this.dirtLayer.setMask(new Phaser.Display.Masks.BitmapMask(this, maskImage));

    this.createRestorationFX();

    // Начальный инструмент
    const firstTask = this.artifactData.tasks[0];
    this.activeTool = firstTask.requiredTool || 'tool_scraper';
    this.activeMaskKey = this.activeTool.replace('tool_', 'mask_');

    this.toolSprite = this.add.image(this.centerX, this.centerY, this.getToolTextureForTier(this.activeTool))
      .setOrigin(0.5, 0.90)
      .setScale(0.62)
      .setAlpha(0)
      .setDepth(35);

    this.assemblyContainer = this.add.container(0, 0).setDepth(18).setVisible(false);

    // 6. НИЖНИЙ ТРЕЙ ИНСТРУМЕНТОВ
    this.createToolsTray(trayY, width, dpr);

    this.gridCols = 32;
    this.gridRows = 40;
    this.totalCells = this.gridCols * this.gridRows;
    this.cleanedGrid = new Uint8Array(this.totalCells);
    this.validCellsMask = new Uint8Array(this.totalCells);
    this.buildValidCellsMask(texKey);

    this.startTask(0);
    this.playMaterializeSequence();

    // 7. ИНТЕРАКТИВНОЕ СТИРАНИЕ
    const processInteraction = (pointer) => {
      if (this.isTaskTransition) return;
      if (pointer.y > trayTopLimit) return;

      const currentTask = this.artifactData.tasks[this.currentTaskIndex];
      if (!currentTask) return;

      if (currentTask.type === 'break_and_assemble') {
        this.processGlueAction(pointer);
        return;
      }

      const offsetY = this.isMobileDevice ? 28 : 12;
      this.toolSprite.setPosition(pointer.x, pointer.y - offsetY);
      this.toolSprite.setAlpha(1);
      this.animateToolUnderFinger(pointer);

      if (this.activeTool !== currentTask.requiredTool) {
        this.toolWarning.setText(`⚠️ ОШИБКА: Нужен ${this.getToolName(currentTask.requiredTool)}!`);
        if (!this.lastWarnTime || this.time.now - this.lastWarnTime > 700) {
          this.lastWarnTime = this.time.now;
          this.mistakesCount++;
          if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
          this.cameras.main.shake(90, 0.004);
        }
        return;
      }

      this.toolWarning.setText('');

      if (this.lastCleanPos) {
        const dist = Phaser.Math.Distance.Between(this.lastCleanPos.x, this.lastCleanPos.y, pointer.x, pointer.y);
        if (dist < 4) return;
      }
      this.lastCleanPos = { x: pointer.x, y: pointer.y };

      const localX = pointer.x - this.topLeftX;
      const localY = (pointer.y - (this.isMobileDevice ? 16 : 0)) - this.topLeftY;

      if (localX < 0 || localX > this.artW || localY < 0 || localY > this.artH) return;

      this.dirtLayer.erase(this.activeMaskKey, localX, localY);
      this.emitToolFX(pointer.x, pointer.y - (this.isMobileDevice ? 16 : 0));

      const tier = this.getToolTier(this.activeTool);
      const baseRadius = (this.activeTool === 'tool_scraper') ? 26 : ((this.activeTool === 'tool_brush') ? 32 : 28);
      const eraserRadius = baseRadius + (tier - 1) * 5;

      const cellW = this.artW / this.gridCols;
      const cellH = this.artH / this.gridRows;
      const centerCol = Math.floor(localX / cellW);
      const centerRow = Math.floor(localY / cellH);
      const colRad = Math.ceil(eraserRadius / cellW);
      const rowRad = Math.ceil(eraserRadius / cellH);

      for (let cr = -colRad; cr <= colRad; cr++) {
        for (let rr = -rowRad; rr <= rowRad; rr++) {
          const gx = centerCol + cr;
          const gy = centerRow + rr;
          if (gx >= 0 && gx < this.gridCols && gy >= 0 && gy < this.gridRows) {
            const cellPxX = (gx + 0.5) * cellW;
            const cellPxY = (gy + 0.5) * cellH;
            const dist = Phaser.Math.Distance.Between(localX, localY, cellPxX, cellPxY);
            if (dist <= eraserRadius) {
              const idx = gy * this.gridCols + gx;
              if (this.validCellsMask[idx] === 1 && this.cleanedGrid[idx] === 0) {
                this.cleanedGrid[idx] = 1;
                this.cleanedCount++;
              }
            }
          }
        }
      }

      const targetVal = Math.max(1, this.targetValidCells);
      const ratio = Math.min(1, this.cleanedCount / targetVal);
      this.progressBarFill.width = Math.min(this.scale.width * 0.78, 280) * ratio;

      if (ratio >= 0.92 && !this.isTaskTransition) {
        this.isTaskTransition = true;
        this.dirtLayer.clear();
        this.completeTaskTransition();
      }
    };

    this.input.on('pointerdown', (p) => {
      this.lastCleanPos = null;
      this.lastTouchPos = { x: p.x, y: p.y };
      processInteraction(p);
    });
    this.input.on('pointermove', (p) => {
      if (p.isDown) processInteraction(p);
    });
    this.input.on('pointerup', () => {
      this.lastCleanPos = null;
      this.lastTouchPos = null;
      this.tweens.add({
        targets: this.toolSprite,
        alpha: 0,
        duration: 140
      });
    });
  }

  // =========================================================================
  // ТИРЫ ИНСТРУМЕНТОВ И СВЯЗЬ С ЛАВКОЙ
  // =========================================================================
  getToolTier(toolKey) {
    const rawKey = toolKey.replace('tool_', '');
    if (localStorage.getItem(`tool_upg_${rawKey}_4`) === 'true') return 4;
    if (localStorage.getItem(`tool_upg_${rawKey}_3`) === 'true') return 3;
    if (localStorage.getItem(`tool_upg_${rawKey}_2`) === 'true') return 2;
    return 1;
  }

  getToolTextureForTier(toolId) {
    const tier = this.getToolTier(toolId);
    const key = `tex_hd_${toolId}_t${tier}`;
    return this.textures.exists(key) ? key : `tex_hd_${toolId}_t1`;
  }

  animateToolUnderFinger(pointer) {
    if (!this.lastTouchPos) {
      this.lastTouchPos = { x: pointer.x, y: pointer.y };
      return;
    }
    const dx = pointer.x - this.lastTouchPos.x;
    this.lastTouchPos = { x: pointer.x, y: pointer.y };

    if (this.activeTool === 'tool_scraper') {
      const targetAngle = Phaser.Math.Clamp(dx * 1.8, -34, 16);
      this.toolSprite.angle = Phaser.Math.Linear(this.toolSprite.angle, targetAngle, 0.35);
    } else if (this.activeTool === 'tool_brush') {
      const targetAngle = Phaser.Math.Clamp(dx * 2.2, -32, 32);
      this.toolSprite.angle = Phaser.Math.Linear(this.toolSprite.angle, targetAngle, 0.35);
    } else {
      this.toolSprite.angle = 0;
    }
  }

  // =========================================================================
  // ДЕТАЛИЗИРОВАННЫЕ ТЕКСТУРЫ ИНСТРУМЕНТОВ ПО ТИРАМ (1..4)
  // =========================================================================
  generateDetailedToolTextures() {
    const generateTex = (key, drawFn) => {
      if (this.textures.exists(key)) return;
      const cvs = this.textures.createCanvas(key, 128, 128);
      const ctx = cvs.context;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      drawFn(ctx);
      cvs.refresh();
    };

    ['mask_scraper', 'mask_brush', 'mask_solvent', 'mask_polish'].forEach((mKey, i) => {
      const rad = i === 1 ? 30 : 25;
      generateTex(mKey, (ctx) => {
        const g = ctx.createRadialGradient(64, 64, rad * 0.3, 64, 64, rad);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(64, 64, rad, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // 1. СКРЕБОК (Тир 1..4)
    [1, 2, 3, 4].forEach((tier) => {
      generateTex(`tex_hd_tool_scraper_t${tier}`, (ctx) => {
        const hGrad = ctx.createLinearGradient(54, 60, 74, 60);
        if (tier === 1) { hGrad.addColorStop(0, '#5c3317'); hGrad.addColorStop(0.5, '#8b4513'); hGrad.addColorStop(1, '#3e1f08'); }
        else if (tier === 2) { hGrad.addColorStop(0, '#78350f'); hGrad.addColorStop(0.5, '#b45309'); hGrad.addColorStop(1, '#451a03'); }
        else if (tier === 3) { hGrad.addColorStop(0, '#1e293b'); hGrad.addColorStop(0.5, '#475569'); hGrad.addColorStop(1, '#0f172a'); }
        else { hGrad.addColorStop(0, '#090d16'); hGrad.addColorStop(0.5, '#1e293b'); hGrad.addColorStop(1, '#000000'); }
        ctx.fillStyle = hGrad;
        ctx.fillRect(54, 58, 20, 62);

        ctx.fillStyle = tier >= 4 ? '#facc15' : (tier === 3 ? '#38bdf8' : '#d97706');
        ctx.fillRect(50, 50, 28, 10);

        if (tier === 4) {
          ctx.fillStyle = '#0ea5e9';
          ctx.beginPath();
          ctx.moveTo(64, 8); ctx.lineTo(48, 50); ctx.lineTo(80, 50); ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.moveTo(64, 14); ctx.lineTo(58, 50); ctx.lineTo(70, 50); ctx.closePath();
          ctx.fill();
        } else if (tier === 3) {
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(64, 10); ctx.lineTo(82, 50); ctx.lineTo(64, 50); ctx.closePath();
          ctx.fill();
        } else {
          const bGrad = ctx.createLinearGradient(36, 15, 92, 50);
          if (tier === 2) { bGrad.addColorStop(0, '#fde047'); bGrad.addColorStop(1, '#ca8a04'); }
          else { bGrad.addColorStop(0, '#cbd5e1'); bGrad.addColorStop(1, '#64748b'); }
          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.moveTo(64, 12); ctx.lineTo(36, 50); ctx.lineTo(92, 50); ctx.closePath();
          ctx.fill();
        }
      });
    });

    // 2. КИСТЬ (Тир 1..4)
    [1, 2, 3, 4].forEach((tier) => {
      generateTex(`tex_hd_tool_brush_t${tier}`, (ctx) => {
        ctx.fillStyle = tier >= 3 ? '#1e293b' : '#78350f';
        ctx.fillRect(58, 56, 12, 64);

        ctx.fillStyle = tier >= 4 ? '#facc15' : '#94a3b8';
        ctx.fillRect(54, 46, 20, 12);

        if (tier === 4) {
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(64, 28, 22, Math.PI, 0);
          ctx.stroke();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(64, 34, 12, 0, Math.PI * 2);
          ctx.fill();
        } else if (tier === 3) {
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.moveTo(54, 46); ctx.lineTo(24, 16); ctx.lineTo(104, 16); ctx.lineTo(74, 46); ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = tier === 2 ? '#d97706' : '#a16207';
          ctx.beginPath();
          ctx.arc(64, 28, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    });

    // 3. РЕАКТИВ (Тир 1..4)
    [1, 2, 3, 4].forEach((tier) => {
      generateTex(`tex_hd_tool_solvent_t${tier}`, (ctx) => {
        ctx.fillStyle = tier === 4 ? '#38bdf8' : (tier === 3 ? '#a855f7' : (tier === 2 ? '#10b981' : '#059669'));
        ctx.beginPath();
        ctx.roundRect(42, 42, 44, 70, 10);
        ctx.fill();

        ctx.fillStyle = tier >= 3 ? '#facc15' : '#d97706';
        ctx.fillRect(56, 22, 16, 20);
        ctx.fillRect(56, 18, 28, 8);
      });
    });

    // 4. ЗАМША / ПОЛИРОЛЬ (Тир 1..4)
    [1, 2, 3, 4].forEach((tier) => {
      generateTex(`tex_hd_tool_polish_t${tier}`, (ctx) => {
        if (tier === 4) {
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.roundRect(38, 38, 52, 52, 12);
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(64, 20); ctx.lineTo(84, 40); ctx.lineTo(64, 60); ctx.lineTo(44, 40); ctx.closePath();
          ctx.fill();
        } else if (tier === 3) {
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.roundRect(34, 44, 60, 44, 8);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(64, 44, 22, Math.PI, 0);
          ctx.fill();
        } else {
          ctx.fillStyle = tier === 2 ? '#f59e0b' : '#d97706';
          ctx.beginPath();
          ctx.roundRect(34, 42, 60, 46, 14);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(54, 65, 14, 0.3, Math.PI * 1.6);
          ctx.stroke();
        }
      });
    });
  }

  createRestorationFX() {
    this.particles = this.add.particles(0, 0, 'mask_scraper', {
      lifespan: { min: 200, max: 350 },
      speed: { min: 40, max: 90 },
      scale: { start: 0.35, end: 0 },
      emitting: false
    }).setDepth(24);
  }

  emitToolFX(x, y) {
    if (this.activeTool === 'tool_scraper') {
      const tier = this.getToolTier('tool_scraper');
      if (AudioManager.playScrub) AudioManager.playScrub(tier);
      this.particles.setParticleTint(tier >= 4 ? 0x06b6d4 : (tier === 3 ? 0x38bdf8 : 0x8d6e63));
      this.particles.emitParticleAt(x, y, tier >= 4 ? 4 : 2);
    } else if (this.activeTool === 'tool_brush') {
      const tier = this.getToolTier('tool_brush');
      if (AudioManager.playBrush) AudioManager.playBrush(tier);
      this.particles.setParticleTint(tier >= 4 ? 0xa855f7 : 0xe0f2f1);
      this.particles.emitParticleAt(x, y, 3);
    } else if (this.activeTool === 'tool_solvent') {
      const tier = this.getToolTier('tool_solvent');
      if (AudioManager.playSpray) AudioManager.playSpray(tier);
      this.particles.setParticleTint(tier >= 4 ? 0x38bdf8 : 0x34d399);
      this.particles.emitParticleAt(x, y, 3);
    } else if (this.activeTool === 'tool_polish') {
      const tier = this.getToolTier('tool_polish');
      if (AudioManager.playCloth) AudioManager.playCloth(tier);
      this.particles.setParticleTint(tier >= 4 ? 0xfacc15 : 0xffffff);
      this.particles.emitParticleAt(x, y, 2);
    }
  }

  createToolsTray(trayY, width, dpr) {
    const tools = [
      { id: 'tool_scraper', icon: this.getToolTextureForTier('tool_scraper'), mask: 'mask_scraper', label: 'Скребок' },
      { id: 'tool_brush', icon: this.getToolTextureForTier('tool_brush'), mask: 'mask_brush', label: 'Кисть' },
      { id: 'tool_solvent', icon: this.getToolTextureForTier('tool_solvent'), mask: 'mask_solvent', label: 'Спрей' },
      { id: 'tool_polish', icon: this.getToolTextureForTier('tool_polish'), mask: 'mask_polish', label: 'Замша' }
    ];

    this.add.rectangle(width / 2, trayY, width * 0.94, 82, 0x0e131d, 0.95)
      .setStrokeStyle(1.5, 0x273142, 0.9)
      .setDepth(19);

    const stepX = (width * 0.90) / tools.length;
    const startX = width * 0.05 + stepX / 2;

    this.traySlots = [];

    tools.forEach((t, i) => {
      const slotX = startX + i * stepX;
      const isSelected = (t.id === this.activeTool);

      const slotCont = this.add.container(slotX, trayY).setDepth(20);
      const slotWall = this.add.rectangle(0, 0, 66, 68, 0x0b0f17).setDepth(19);

      const slotBg = this.add.rectangle(0, 0, 62, 64, isSelected ? 0x1e293b : 0x141a24, 0.96)
        .setStrokeStyle(1.5, isSelected ? 0x22c55e : 0x334155, 0.9)
        .setInteractive({ useHandCursor: true });

      const iconImg = this.add.image(0, -8, t.icon).setScale(0.46);

      const lbl = this.add.text(0, 21, t.label, {
        fontSize: '9.5px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
        color: isSelected ? '#facc15' : '#94a3b8',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      slotCont.add([slotWall, slotBg, iconImg, lbl]);

      slotBg.on('pointerdown', () => {
        this.selectTool(t.id, t.icon, t.mask, false);
      });

      this.traySlots.push({
        id: t.id,
        cont: slotCont,
        bg: slotBg,
        label: lbl,
        baseY: trayY
      });
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

    this.traySlots.forEach((slot) => {
      const active = (slot.id === toolId);
      slot.bg.setStrokeStyle(1.5, active ? 0x22c55e : 0x334155, 0.9);
      slot.bg.setFillStyle(active ? 0x1e293b : 0x141a24, 0.96);
      slot.label.setColor(active ? '#facc15' : '#94a3b8');

      this.tweens.add({
        targets: slot.cont,
        y: active ? (slot.baseY - 4) : slot.baseY,
        duration: 100,
        ease: 'Back.easeOut'
      });
    });

    const currentTask = this.artifactData.tasks[this.currentTaskIndex];
    if (currentTask && currentTask.requiredTool === toolId) {
      this.toolWarning.setText('');
    }
  }

  playMaterializeSequence() {
    this.isTaskTransition = true;
    this.cleanArt.setAlpha(0);
    this.dirtLayer.setAlpha(0);
    this.contactShadow1.setAlpha(0);
    this.contactShadow2.setAlpha(0);

    if (AudioManager.playCloth) AudioManager.playCloth(1);

    this.tweens.add({
      targets: [this.cleanArt, this.dirtLayer],
      alpha: 1,
      duration: 320,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.isTaskTransition = false;
      }
    });

    this.tweens.add({
      targets: [this.contactShadow1, this.contactShadow2],
      alpha: { from: 0, to: 0.22 },
      duration: 300
    });
  }

  getToolName(toolId) {
    const map = {
      tool_scraper: 'Скребок',
      tool_brush: 'Кисть',
      tool_solvent: 'Спрей',
      tool_polish: 'Замша'
    };
    return map[toolId] || 'инструмент';
  }

  buildValidCellsMask(textureKey) {
    this.validCellsMask.fill(0);
    this.targetValidCells = 0;

    let srcCanvas = null;
    try {
      const tex = this.textures.get(textureKey);
      srcCanvas = tex.getSourceImage();
    } catch (e) {
      srcCanvas = null;
    }

    if (srcCanvas && srcCanvas.getContext) {
      const ctx = srcCanvas.getContext('2d');
      const w = srcCanvas.width;
      const h = srcCanvas.height;
      const imgData = ctx.getImageData(0, 0, w, h).data;

      for (let gy = 0; gy < this.gridRows; gy++) {
        for (let gx = 0; gx < this.gridCols; gx++) {
          const sampleX = Math.floor(((gx + 0.5) / this.gridCols) * w);
          const sampleY = Math.floor(((gy + 0.5) / this.gridRows) * h);
          const alpha = imgData[(sampleY * w + sampleX) * 4 + 3];

          const idx = gy * this.gridCols + gx;
          if (alpha > 30) {
            this.validCellsMask[idx] = 1;
            this.targetValidCells++;
          }
        }
      }
    }

    if (this.targetValidCells === 0) {
      this.validCellsMask.fill(1);
      this.targetValidCells = this.totalCells;
    }
  }

  renderWorkbenchWorkshop(width, height, topBound, botBound) {
    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;
    const bg = this.add.graphics().setDepth(1);
    bg.fillStyle(0x07090e, 1);
    bg.fillRect(0, 0, width, height);

    const matPadX = 16;
    const matTop = topBound + 6;
    const matBot = botBound - 14;
    const matH = matBot - matTop;
    const matW = width - matPadX * 2;
    const matCenterY = matTop + matH / 2;

    this.matContainer = this.add.container(width / 2, matCenterY).setDepth(2);

    const matGfx = this.add.graphics();
    const halfW = matW / 2;
    const halfH = matH / 2;

    const palette = {
      1: { fill: 0x0f172a, border: 0x334155, line: 0x1e293b },
      2: { fill: 0x1c1917, border: 0x78350f, line: 0x292524 },
      3: { fill: 0x064e3b, border: 0xd97706, line: 0x047857 },
      4: { fill: 0x090d16, border: 0xfacc15, line: 0x1e293b }
    }[tier] || { fill: 0x0f172a, border: 0x334155, line: 0x1e293b };

    matGfx.fillStyle(palette.fill, 1);
    matGfx.fillRoundedRect(-halfW, -halfH, matW, matH, 16);

    matGfx.lineStyle(2.5, palette.border, 0.85);
    matGfx.strokeRoundedRect(-halfW, -halfH, matW, matH, 16);

    matGfx.lineStyle(1, palette.border, 0.35);
    matGfx.strokeRoundedRect(-halfW + 6, -halfH + 6, matW - 12, matH - 12, 12);

    const rivets = [
      { x: -halfW + 12, y: -halfH + 12 },
      { x: halfW - 12, y: -halfH + 12 },
      { x: -halfW + 12, y: halfH - 12 },
      { x: halfW - 12, y: halfH - 12 }
    ];
    rivets.forEach(r => {
      matGfx.fillStyle(palette.border, 0.8);
      matGfx.fillCircle(r.x, r.y, 3);
    });

    const grid = this.add.graphics();
    grid.lineStyle(1, palette.line, 0.35);
    const step = 36;
    for (let x = -halfW + 36; x < halfW - 20; x += step) {
      grid.lineBetween(x, -halfH + 12, x, halfH - 12);
    }
    for (let y = -halfH + 36; y < halfH - 20; y += step) {
      grid.lineBetween(-halfW + 12, y, halfW - 12, y);
    }

    this.matContainer.add([matGfx, grid]);

    // Анимация раскатывания коврика при входе на верстак
    this.matContainer.setScale(1, 0.06);
    this.matContainer.setAlpha(0.3);
    this.tweens.add({
      targets: this.matContainer,
      scaleY: 1,
      alpha: 1,
      duration: 420,
      ease: 'Cubic.easeOut'
    });
  }

  processGlueAction(pointer) {
    if (this.activeTool !== 'tool_glue') {
      this.toolWarning.setText('⚠️ Перетащите отколовшийся фрагмент на место!');
    }
  }

  setupBreakAndAssembleStage(task) {
    const { width } = this.scale;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.assemblyContainer.removeAll(true);
    this.assemblyContainer.setVisible(true);
    this.progressBarFill.width = 0;

    const shardTex = this.textures.exists(task.shardTexture) ? task.shardTexture : this.artifactData.textureKey;
    const targetX = this.centerX + 35;
    const targetY = this.centerY + 15;

    this.breakHoleGfx.clear();
    this.breakHoleGfx.setVisible(true);
    this.breakHoleGfx.fillStyle(0x0b0f17, 0.92);
    this.breakHoleGfx.fillCircle(targetX, targetY, 34);
    this.breakHoleGfx.lineStyle(2, 0xfacc15, 0.75);
    this.breakHoleGfx.strokeCircle(targetX, targetY, 34);

    const pieceContainer = this.add.container(this.centerX - 60, this.centerY + 110).setDepth(25);
    const pieceImg = this.add.image(0, 0, shardTex).setDisplaySize(64, 64);

    const hitZone = this.add.circle(0, 0, 36, 0xffffff, 0)
      .setInteractive({ draggable: true, useHandCursor: true });

    pieceContainer.add([pieceImg, hitZone]);
    this.input.setDraggable(hitZone);

    hitZone.on('drag', (pointer) => {
      pieceContainer.x = pointer.x;
      pieceContainer.y = pointer.y;
    });

    hitZone.on('dragend', () => {
      const dist = Phaser.Math.Distance.Between(pieceContainer.x, pieceContainer.y, targetX, targetY);
      if (dist < 42) {
        pieceContainer.x = targetX;
        pieceContainer.y = targetY;
        hitZone.disableInteractive();
        this.breakHoleGfx.clear();
        if (AudioManager.playCoin) AudioManager.playCoin();

        const lacquer = Storage.getKintsugiLacquer ? Storage.getKintsugiLacquer() : 0;
        if (lacquer > 0) {
          this.showKintsugiBanner(width, dpr);
        } else {
          this.time.delayedCall(350, () => {
            this.assemblyContainer.setVisible(false);
            this.completeTaskTransition();
          });
        }
      } else {
        this.tweens.add({
          targets: pieceContainer,
          x: this.centerX - 60,
          y: this.centerY + 110,
          duration: 180,
          ease: 'Back.easeOut'
        });
      }
    });

    this.assemblyContainer.add(pieceContainer);
  }

  showKintsugiBanner(width, dpr) {
    if (this.kintsugiBanner) this.kintsugiBanner.destroy();

    this.kintsugiBanner = this.add.container(width / 2, this.centerY + 115).setDepth(30);
    const bannerBg = this.add.rectangle(0, 0, width * 0.86, 44, 0x0f172a, 0.96)
      .setStrokeStyle(1.5, 0xe2b35b, 0.85);

    const kintsugiBtn = this.add.rectangle(width * 0.43 - 52, 0, 90, 26, 0xfde047)
      .setInteractive({ useHandCursor: true });

    const kintsugiTxt = this.add.text(width * 0.43 - 52, 0, '✨ КИНЦУГИ', {
      fontSize: '10.5px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
      color: '#000000',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const infoTxt = this.add.text(-width * 0.43 + 12, 0, 'Золотой шов: +60% к цене', {
      fontSize: '11px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0, 0.5);

    kintsugiBtn.on('pointerdown', () => {
      Storage.addKintsugiLacquer(-1);
      this.hasKintsugiMastery = true;
      if (AudioManager.playShine) AudioManager.playShine();
      this.kintsugiBanner.destroy();
      this.assemblyContainer.setVisible(false);
      this.completeTaskTransition();
    });

    this.kintsugiBanner.add([bannerBg, infoTxt, kintsugiBtn, kintsugiTxt]);
  }

  startTask(taskIdx) {
    this.currentTaskIndex = taskIdx;
    this.isTaskTransition = false;
    this.cleanedGrid.fill(0);
    this.cleanedCount = 0;
    this.progressBarFill.width = 0;
    this.toolWarning.setText('');

    const task = this.artifactData.tasks[taskIdx];
    if (!task) return;

    const reqTool = task.requiredTool || 'tool_scraper';
    const taskTitle = task.hint || task.name || 'Очистите артефакт';
    this.taskNotice.setText(`ШАГ ${taskIdx + 1}/${this.artifactData.tasks.length}: ${taskTitle}`);

    this.selectTool(reqTool, this.getToolTextureForTier(reqTool), reqTool.replace('tool_', 'mask_'), true);

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

    if (reqTool === 'tool_scraper') {
      dirtGfx.fillStyle(0x6e4e25, 0.98);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x422e12, 0.92);
      for (let i = 0; i < 34; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(12, 30));
      }
      dirtGfx.fillStyle(0x8a6233, 0.65);
      for (let i = 0; i < 28; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(6, 16));
      }
    } else if (reqTool === 'tool_brush') {
      dirtGfx.fillStyle(0xa89f81, 0.94);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x736c56, 0.75);
      for (let i = 0; i < 32; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(8, 24));
      }
    } else if (reqTool === 'tool_solvent') {
      dirtGfx.fillStyle(0x234d35, 0.94);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x367053, 0.80);
      for (let i = 0; i < 28; i++) {
        dirtGfx.fillEllipse(Phaser.Math.Between(20, this.artW - 20), Phaser.Math.Between(20, this.artH - 20), Phaser.Math.Between(18, 38), Phaser.Math.Between(10, 22));
      }
    } else {
      dirtGfx.fillStyle(0x141414, 0.65);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x282828, 0.50);
      for (let i = 0; i < 24; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(14, 32));
      }
    }

    this.dirtLayer.draw(dirtGfx, 0, 0);
    dirtGfx.destroy();
  }

  completeTaskTransition() {
    if (AudioManager.playCoin) AudioManager.playCoin();

    const flash = this.add.rectangle(this.cleanArt.x, this.cleanArt.y, this.cleanArt.width, this.cleanArt.height, 0xffffff, 0.85).setDepth(25);
    flash.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy()
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
          instanceId: `art_${Date.now()}`,
          templateId: this.artifactData.id,
          regionId: this.artifactData.regionId,
          regionName: this.artifactData.regionName || 'Древний Египет',
          name: this.artifactData.name,
          museumDesc: this.artifactData.museumDesc || '',
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

        if (Storage.setActiveSession) Storage.setActiveSession(null);
        if (this.activeContract && Storage.completeDailyContract) Storage.completeDailyContract();
      } catch (e) {
        console.warn('Inventory save error:', e);
      }

      this.time.delayedCall(300, () => {
        this.scene.start('VictoryScene', {
          artifact: this.artifactData,
          stars: earnedStars,
          isDuplicate: this.isDuplicate,
          isContract: !!this.activeContract,
          isKintsugi: this.hasKintsugiMastery
        });
      });
    }
  }
}
