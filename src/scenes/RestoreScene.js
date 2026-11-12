import * as ArtifactModels from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class RestoreScene extends Phaser.Scene {
  constructor() {
    super('RestoreScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const dpr = 2;
    this.dpr = dpr;

    const FONT_UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    this.FONT_UI = FONT_UI;

    // 1. ДАННЫЕ И СЕССИЯ
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

    if (typeof ArtifactModels.generateArtifactOrder === 'function') {
      this.artifactData = ArtifactModels.generateArtifactOrder(reqRegion, history, reqTemplateId);
    } else {
      const templates = ArtifactModels.ARTIFACT_TEMPLATES || [];
      const found = templates.find((t) => t.id === reqTemplateId) || templates[0];
      this.artifactData = { ...found, instanceId: `art_${Date.now()}` };
    }

    this.isDuplicate = history.some((item) => item.templateId === this.artifactData.id);
    if (this.isDuplicate && this.activeContract) {
      this.isDuplicate = false;
    }

    if (this.activeContract) {
      this.artifactData.marketValue = this.activeContract.rewardCoins;
    } else if (this.isDuplicate) {
      this.artifactData.marketValue = Math.round((this.artifactData.marketValue || 100) * 0.65);
    }

    if (Storage.setActiveSession) {
      Storage.setActiveSession(this.artifactData.regionId || reqRegion, this.artifactData.id);
    }

    if (AudioManager.playEraMusic) {
      AudioManager.playEraMusic(this.artifactData.regionId || 'egypt');
    }

    this.currentTaskIndex = 0;
    this.lastTouchPos = null;
    this.lastDustPos = null;
    this.activeTool = null;
    this.isTaskTransition = false;
    this.mistakesCount = 0;
    this.isKintsugiMode = false;
    this.hasKintsugiMastery = false;
    this.shardsList = [];

    this.isMobileDevice = true;
    this.generateDetailedToolTextures();

    // 2. БЕЗОПАСНАЯ ГЕОМЕТРИЯ ЭКРАНА
    const systemTopPad = 8;
    const topBarHeight = 46;
    const infoPanelHeight = 80;
    const workspaceTop = systemTopPad + topBarHeight + infoPanelHeight;

    const trayHeight = 90;
    const trayY = height - trayHeight / 2 - 14;
    const trayTopLimit = trayY - trayHeight / 2;

    const workspaceAvailableHeight = trayTopLimit - workspaceTop;
    this.centerX = Math.floor(width / 2);
    this.centerY = Math.floor(workspaceTop + workspaceAvailableHeight / 2);

    this.artW = Math.floor(Math.min(width * 0.78, 300));
    this.artH = Math.floor(Math.min(workspaceAvailableHeight * 0.74, 290));
    this.topLeftX = Math.floor(this.centerX - this.artW / 2);
    this.topLeftY = Math.floor(this.centerY - this.artH / 2);

    this.renderWorkbenchBackdrop(width, height, workspaceTop, trayTopLimit);

    // 3. ВЕРХНИЙ БАР (АНТИКВАРНО-БРОНЗОВЫЙ)
    const topBarGfx = this.add.graphics().setDepth(200);
    topBarGfx.fillGradientStyle(0x24180f, 0x24180f, 0x140d08, 0x140d08, 0.94);
    topBarGfx.fillRect(0, systemTopPad, width, topBarHeight);
    topBarGfx.lineStyle(1, 0xc89d54, 0.55);
    topBarGfx.lineBetween(0, systemTopPad + topBarHeight, width, systemTopPad + topBarHeight);

    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.coinsText = this.add.text(16, systemTopPad + 23, `${coins} 🪙`, {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0, 0.5).setDepth(205);

    const btnSize = 34;
    const rightMargin = 14;

    const menuBtnGfx = this.add.graphics().setDepth(204);
    menuBtnGfx.fillGradientStyle(0x332215, 0x332215, 0x1e130b, 0x1e130b, 1);
    menuBtnGfx.fillRoundedRect(width - rightMargin - 64, systemTopPad + 6, 64, btnSize, 8);
    menuBtnGfx.lineStyle(1.2, 0xc89d54, 0.9);
    menuBtnGfx.strokeRoundedRect(width - rightMargin - 64, systemTopPad + 6, 64, btnSize, 8);

    const menuBtn = this.add.zone(width - rightMargin - 32, systemTopPad + 23, 64, btnSize)
      .setInteractive({ useHandCursor: true })
      .setDepth(206);

    this.add.text(width - rightMargin - 32, systemTopPad + 23, 'Меню', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(205);

    menuBtn.on('pointerdown', () => {
      if (AudioManager.stopMusic) AudioManager.stopMusic();
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });

    const musicX = width - rightMargin - 64 - 8 - btnSize / 2;
    const musicBtn = this.add.circle(musicX, systemTopPad + 23, 16, AudioManager.isMusicOn() ? 0x2b1d12 : 0x160f0a)
      .setStrokeStyle(1.3, AudioManager.isMusicOn() ? 0xc89d54 : 0x7f1d1d, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(205);

    const musicIcon = this.add.text(musicX, systemTopPad + 23, AudioManager.isMusicOn() ? '🎵' : '🔇', {
      fontSize: '13px',
      resolution: dpr
    }).setOrigin(0.5).setDepth(206);

    musicBtn.on('pointerdown', (p, lx, ly, ev) => {
      if (ev && ev.stopPropagation) ev.stopPropagation();
      const state = AudioManager.toggleMusic();
      musicBtn.setFillStyle(state ? 0x2b1d12 : 0x160f0a);
      musicBtn.setStrokeStyle(1.3, state ? 0xc89d54 : 0x7f1d1d, 0.9);
      musicIcon.setText(state ? '🎵' : '🔇');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    const sfxX = musicX - btnSize - 6;
    const sfxBtn = this.add.circle(sfxX, systemTopPad + 23, 16, AudioManager.isSfxOn() ? 0x2b1d12 : 0x160f0a)
      .setStrokeStyle(1.3, AudioManager.isSfxOn() ? 0xc89d54 : 0x7f1d1d, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(205);

    const sfxIcon = this.add.text(sfxX, systemTopPad + 23, AudioManager.isSfxOn() ? '🔊' : '🔈', {
      fontSize: '13px',
      resolution: dpr
    }).setOrigin(0.5).setDepth(206);

    sfxBtn.on('pointerdown', (p, lx, ly, ev) => {
      if (ev && ev.stopPropagation) ev.stopPropagation();
      const state = AudioManager.toggleSfx();
      sfxBtn.setFillStyle(state ? 0x2b1d12 : 0x160f0a);
      sfxBtn.setStrokeStyle(1.3, state ? 0xc89d54 : 0x7f1d1d, 0.9);
      sfxIcon.setText(state ? '🔊' : '🔈');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    // 4. ИНФОРМАЦИОННАЯ ПЛАШКА ЭТАПА
    const artInfoCont = this.add.container(0, systemTopPad + 46).setDepth(190);

    const infoPanelGfx = this.add.graphics();
    infoPanelGfx.fillGradientStyle(0x1f140c, 0x1f140c, 0x120b07, 0x120b07, 0.90);
    infoPanelGfx.fillRect(0, 0, width, infoPanelHeight);
    infoPanelGfx.lineStyle(1.2, 0xc89d54, 0.55);
    infoPanelGfx.lineBetween(0, infoPanelHeight, width, infoPanelHeight);
    artInfoCont.add(infoPanelGfx);

    const regionNamesMap = {
      egypt: 'Древний Египет',
      antique: 'Античность',
      europe: 'Европа',
      japan: 'Япония',
      aztec: 'Ацтеки',
      vikings: 'Викинги',
      renaissance: 'Ренессанс'
    };
    const currentRegionName = regionNamesMap[this.artifactData.regionId] || this.artifactData.regionName || '';

    let badgeText = currentRegionName.toUpperCase();
    if (this.activeContract) badgeText = '📜 СРОЧНЫЙ КОНТРАКТ';
    else if (this.isDuplicate) badgeText = 'ПОВТОРНАЯ НАХОДКА (-35%)';

    const badgeTxt = this.add.text(width / 2, 10, badgeText, {
      fontSize: '9.5px',
      fontFamily: FONT_UI,
      color: this.isDuplicate ? '#fda4af' : '#e2b866',
      fontStyle: 'bold',
      letterSpacing: 1.2,
      resolution: dpr
    }).setOrigin(0.5, 0);

    const artTitle = this.add.text(width / 2, 24, this.artifactData.name || 'Артефакт', {
      fontSize: '15px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5, 0);

    this.taskNotice = this.add.text(width / 2, 43, '', {
      fontSize: '11px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: dpr
    }).setOrigin(0.5, 0);

    const barW = Math.min(width * 0.78, 280);
    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x0d0805, 0.95);
    progressBarBg.fillRoundedRect(width / 2 - barW / 2, 60, barW, 6, 3);
    progressBarBg.lineStyle(1, 0x5c3d22, 0.8);
    progressBarBg.strokeRoundedRect(width / 2 - barW / 2, 60, barW, 6, 3);

    this.progressBarFill = this.add.rectangle(width / 2 - barW / 2, 63, 6, 4, 0xfacc15)
      .setOrigin(0, 0.5);

    this.toolWarning = this.add.text(width / 2, 69, '', {
      fontSize: '10.5px',
      fontFamily: FONT_UI,
      color: '#fde047',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5, 0);

    artInfoCont.add([badgeTxt, artTitle, this.taskNotice, progressBarBg, this.progressBarFill, this.toolWarning]);

    // 5. РАБОЧАЯ ЗОНА И АРТЕФАКТ
    this.artifactShadow = this.add.ellipse(this.centerX, this.centerY + this.artH * 0.44, this.artW * 0.82, 26, 0x000000, 0.5)
      .setDepth(5);

    this.artifactPedestal = this.add.ellipse(this.centerX, this.centerY + this.artH * 0.43, this.artW * 0.68, 20, 0x2b1d12, 0.9)
      .setStrokeStyle(1.5, 0xc89d54, 0.75)
      .setDepth(6);

    const texKey = this.textures.exists(this.artifactData.textureKey) ? this.artifactData.textureKey : 'art_egypt_scarab';
    this.cleanArt = this.add.image(this.centerX, this.centerY, texKey)
      .setDisplaySize(this.artW, this.artH)
      .setDepth(7);

    this.breakHoleGfx = this.add.graphics().setDepth(7.5);

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

    this.createDustParticles();

    const firstTask = this.artifactData.tasks[0];
    const initialTool = firstTask.requiredTool || 'tool_scraper';

    // Рабочий кончик инструмента (верхний край спрайта, origin y = 0.08) совпадает ровно с точкой касания
    this.toolSprite = this.add.image(this.centerX, this.centerY, this.getToolTextureForTier(initialTool))
      .setOrigin(0.5, 0.10)
      .setScale(0.75)
      .setAlpha(0)
      .setDepth(100);

    this.assemblyContainer = this.add.container(0, 0).setDepth(35).setVisible(false);

    // 6. НИЖНИЙ ТРЕЙ ИНСТРУМЕНТОВ
    this.createToolTray(trayY, width, dpr);

    this.gridCols = 32;
    this.gridRows = 40;
    this.totalCells = this.gridCols * this.gridRows;
    this.cleanedGrid = new Uint8Array(this.totalCells);
    this.validCellsMask = new Uint8Array(this.totalCells);
    this.targetValidCells = this.totalCells;

    this.buildValidCellsMask(texKey);
    this.startTask(0);
    this.playMaterializeSequence();

    // 7. ИНТЕРАКТИВНОЕ ВЗАИМОДЕЙСТВИЕ (ТОЧНО ПОД ПАЛЬЦЕМ)
    const processInteraction = (pointer) => {
      if (this.isTaskTransition) return;
      if (pointer.y > trayTopLimit || pointer.y < workspaceTop) return;

      const currentTask = this.artifactData.tasks[this.currentTaskIndex];
      if (!currentTask) return;

      if (currentTask.type === 'break_and_assemble') {
        this.processGlueAction(pointer);
        return;
      }

      // Инструмент позиционируется ровно под точкой касания пальца
      this.toolSprite.setPosition(pointer.x, pointer.y);
      this.animateToolUnderFinger(pointer);

      if (this.activeTool !== currentTask.requiredTool) {
        this.toolWarning.setText(`⚠️ Нужен: ${this.getToolName(currentTask.requiredTool)}!`);
        if (!this.lastWarnTime || this.time.now - this.lastWarnTime > 700) {
          this.lastWarnTime = this.time.now;
          this.mistakesCount++;
          if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
          this.cameras.main.shake(80, 0.004);
        }
        return;
      }

      this.toolWarning.setText('');

      const localX = pointer.x - this.topLeftX;
      const localY = pointer.y - this.topLeftY;

      if (localX < 0 || localX > this.artW || localY < 0 || localY > this.artH) return;

      const tier = this.getToolTier(this.activeTool);
      const requiredPasses = tier >= 3 ? 1 : 2;
      const brushKey = `${this.activeTool}_t${tier}`;

      // Вычитаем половину размера текстуры кисти (32px), чтобы центр стирания попал точно в (localX, localY)
      this.dirtLayer.erase(brushKey, localX - 32, localY - 32);
      this.emitDustFX(pointer.x, pointer.y);

      const baseRadius = (this.activeTool === 'tool_scraper') ? 22 : ((this.activeTool === 'tool_brush') ? 28 : 24);
      const tierRadiusBonus = [0, 0, 6, 11, 16][tier] || 0;
      const countRadius = (baseRadius + tierRadiusBonus) * 0.72;

      const col2 = this.artW / this.gridCols;
      const row2 = this.artH / this.gridRows;

      const centerCol = Math.floor(localX / col2);
      const centerRow = Math.floor(localY / row2);
      const colRad = Math.ceil(countRadius / col2);
      const rowRad = Math.ceil(countRadius / row2);

      for (let rr = centerRow - rowRad; rr <= centerRow + rowRad; rr++) {
        if (rr < 0 || rr >= this.gridRows) continue;
        for (let cc = centerCol - colRad; cc <= centerCol + colRad; cc++) {
          if (cc < 0 || cc >= this.gridCols) continue;
          const gx = (cc + 0.5) * col2;
          const gy = (rr + 0.5) * row2;
          const distCell = Phaser.Math.Distance.Between(localX, localY, gx, gy);
          if (distCell <= countRadius) {
            const idx = rr * this.gridCols + cc;
            if (this.validCellsMask[idx] === 1 && this.cleanedGrid[idx] < requiredPasses) {
              this.cleanedGrid[idx]++;
              if (this.cleanedGrid[idx] >= requiredPasses) {
                this.cleanedScore++;
              }
            }
          }
        }
      }

      const maxScore = Math.max(1, this.targetValidCells);
      const ratio = Math.min(1, this.cleanedScore / maxScore);
      const maxBarW = Math.min(this.scale.width * 0.78, 280);
      this.progressBarFill.width = Math.max(6, maxBarW * ratio);

      if (ratio >= 0.94 && !this.isTaskTransition) {
        this.isTaskTransition = true;
        this.dirtLayer.clear();
        this.completeTaskTransition();
      }
    };

    this.input.on('pointerdown', (p) => {
      if (p.y > trayTopLimit || p.y < workspaceTop) return;
      this.lastTouchPos = { x: p.x, y: p.y };
      this.toolSprite.setAlpha(1);
      processInteraction(p);
    });

    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      processInteraction(p);
    });

    this.input.on('pointerup', () => {
      this.lastTouchPos = null;
      this.tweens.add({
        targets: this.toolSprite,
        alpha: 0,
        duration: 140
      });
    });
  }

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
    return this.textures.exists(key) ? key : 'tex_hd_tool_glue';
  }

  animateToolUnderFinger(pointer) {
    if (!this.lastTouchPos) {
      this.lastTouchPos = { x: pointer.x, y: pointer.y };
      return;
    }
    const dx = pointer.x - this.lastTouchPos.x;
    this.lastTouchPos.x = pointer.x;
    this.lastTouchPos.y = pointer.y;

    if (this.activeTool === 'tool_scraper') {
      const targetAngle = Phaser.Math.Clamp(dx * 1.4, -34, 16);
      this.toolSprite.angle = Phaser.Math.Linear(this.toolSprite.angle, targetAngle, 0.35);
    } else if (this.activeTool === 'tool_brush') {
      const targetAngle = Phaser.Math.Clamp(dx * 2.2, -32, 32);
      this.toolSprite.angle = Phaser.Math.Linear(this.toolSprite.angle, targetAngle, 0.3);
    } else {
      this.toolSprite.angle = 0;
    }
  }

  generateDetailedToolTextures() {
    const makeTex = (key, size, drawFn) => {
      if (this.textures.exists(key)) return;
      const cvs = this.textures.createCanvas(key, size, size);
      const ctx = cvs.getContext();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      drawFn(ctx);
      cvs.refresh();
    };

    // Кисти стирания строго 64x64 с центром в (32, 32) для точного совпадения с пальцем
    const toolTypes = ['scraper', 'brush', 'solvent', 'polish'];
    const baseRadii = { scraper: 18, brush: 22, solvent: 20, polish: 21 };
    const tierRadiusBonus = [0, 0, 3, 6, 9];
    const tierCenterAlpha = [0, 0.65, 0.76, 0.88, 1.0];

    toolTypes.forEach((type) => {
      [1, 2, 3, 4].forEach((tier) => {
        const rad = Math.min(31, baseRadii[type] + tierRadiusBonus[tier]);
        const alpha = tierCenterAlpha[tier];
        makeTex(`tool_${type}_t${tier}`, 64, (ctx) => {
          const grad = ctx.createRadialGradient(32, 32, rad * 0.25, 32, 32, rad);
          grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
          grad.addColorStop(0.7, `rgba(255,255,255,${alpha * 0.78})`);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(32, 32, rad, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    });

    makeTex('tex_hd_tool_glue', 128, (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(58, 36, 12, 74, 6);
      ctx.fill();
      ctx.fillStyle = '#eab308';
      ctx.fillRect(56, 26, 16, 12);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(56, 26);
      ctx.lineTo(72, 26);
      ctx.lineTo(64, 6);
      ctx.closePath();
      ctx.fill();
    });

    [1, 2, 3, 4].forEach((tier) => {
      makeTex(`tex_hd_tool_scraper_t${tier}`, 128, (ctx) => {
        const hGrad = ctx.createLinearGradient(56, 60, 72, 60);
        if (tier === 1) {
          hGrad.addColorStop(0, '#5c3a21');
          hGrad.addColorStop(1, '#855832');
        } else if (tier === 2) {
          hGrad.addColorStop(0, '#92400e');
          hGrad.addColorStop(1, '#d97706');
        } else if (tier === 3) {
          hGrad.addColorStop(0, '#334155');
          hGrad.addColorStop(1, '#94a3b8');
        } else {
          hGrad.addColorStop(0, '#1e293b');
          hGrad.addColorStop(1, '#38bdf8');
        }
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.roundRect(57, 52, 14, 62, 5);
        ctx.fill();

        ctx.fillStyle = tier >= 3 ? '#facc15' : '#94a3b8';
        ctx.fillRect(55, 46, 18, 8);

        if (tier === 4) {
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.moveTo(64, 6);
          ctx.lineTo(44, 46);
          ctx.lineTo(84, 46);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(64, 14);
          ctx.lineTo(54, 46);
          ctx.lineTo(74, 46);
          ctx.closePath();
          ctx.fill();
        } else if (tier === 3) {
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.moveTo(64, 8);
          ctx.lineTo(48, 46);
          ctx.lineTo(80, 46);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = tier === 2 ? '#fbbf24' : '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(46, 14);
          ctx.lineTo(82, 14);
          ctx.lineTo(74, 46);
          ctx.lineTo(54, 46);
          ctx.closePath();
          ctx.fill();
        }
      });
    });

    [1, 2, 3, 4].forEach((tier) => {
      makeTex(`tex_hd_tool_brush_t${tier}`, 128, (ctx) => {
        ctx.fillStyle = tier >= 3 ? '#1e293b' : '#78350f';
        ctx.beginPath();
        ctx.roundRect(58, 56, 12, 58, 5);
        ctx.fill();

        ctx.fillStyle = tier >= 2 ? '#facc15' : '#94a3b8';
        ctx.fillRect(54, 44, 20, 13);

        if (tier === 4) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(64, 28, 22, Math.PI, 0);
          ctx.stroke();
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.arc(64, 34, 14, 0, Math.PI * 2);
          ctx.fill();
        } else if (tier === 3) {
          ctx.fillStyle = '#fef3c7';
          ctx.beginPath();
          ctx.moveTo(54, 44);
          ctx.lineTo(74, 44);
          ctx.lineTo(96, 14);
          ctx.lineTo(64, 8);
          ctx.lineTo(32, 14);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = tier === 2 ? '#fde68a' : '#d6d3d1';
          ctx.beginPath();
          ctx.arc(64, 28, 20, Math.PI, 0);
          ctx.fillRect(44, 28, 40, 16);
          ctx.fill();
        }
      });
    });

    [1, 2, 3, 4].forEach((tier) => {
      makeTex(`tex_hd_tool_solvent_t${tier}`, 128, (ctx) => {
        ctx.fillStyle = tier === 4 ? '#6366f1' : (tier === 3 ? '#0d9488' : (tier === 2 ? '#0284c7' : '#38bdf8'));
        ctx.beginPath();
        ctx.roundRect(42, 42, 44, 68, 12);
        ctx.fill();

        ctx.fillStyle = tier >= 3 ? '#facc15' : '#d97706';
        ctx.fillRect(55, 24, 18, 18);
        ctx.fillRect(52, 16, 24, 9);
      });
    });

    [1, 2, 3, 4].forEach((tier) => {
      makeTex(`tex_hd_tool_polish_t${tier}`, 128, (ctx) => {
        if (tier === 4) {
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.roundRect(38, 52, 52, 52, 12);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(64, 14);
          ctx.lineTo(80, 34);
          ctx.lineTo(64, 52);
          ctx.lineTo(48, 34);
          ctx.closePath();
          ctx.fill();
        } else if (tier === 3) {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(36, 48, 56, 56, 14);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(64, 34, 16, Math.PI, 0);
          ctx.fill();
        } else {
          ctx.fillStyle = tier === 2 ? '#d97706' : '#a16207';
          ctx.beginPath();
          ctx.roundRect(34, 46, 60, 56, 16);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(64, 38, 22, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        }
      });
    });
  }

  createDustParticles() {
    this.particles = this.add.particles(0, 0, 'tool_scraper_t1', {
      lifespan: { min: 200, max: 350 },
      speed: { min: 40, max: 95 },
      scale: { start: 0.45, end: 0 },
      alpha: { start: 0.85, end: 0 },
      emitting: false
    }).setDepth(16);
  }

  emitDustFX(x, y) {
    if (this.activeTool === 'tool_scraper') {
      const tier = this.getToolTier('tool_scraper');
      if (AudioManager.playScrape) AudioManager.playScrape(tier);
      this.particles.setParticleTint(tier === 4 ? 0x38bdf8 : (tier === 3 ? 0xfacc15 : 0xd6d3d1));
      this.particles.emitParticleAt(x, y, tier >= 3 ? 3 : 2);
    } else if (this.activeTool === 'tool_brush') {
      const tier = this.getToolTier('tool_brush');
      if (AudioManager.playBrush) AudioManager.playBrush(tier);
      this.particles.setParticleTint(tier === 4 ? 0x38bdf8 : 0xfef3c7);
      this.particles.emitParticleAt(x, y, 2);
    } else if (this.activeTool === 'tool_solvent') {
      const tier = this.getToolTier('tool_solvent');
      if (AudioManager.playSpray) AudioManager.playSpray(tier);
      this.particles.setParticleTint(tier === 4 ? 0x818cf8 : 0x38bdf8);
      this.particles.emitParticleAt(x, y, 3);
    } else if (this.activeTool === 'tool_polish') {
      const tier = this.getToolTier('tool_polish');
      if (AudioManager.playCloth) AudioManager.playCloth(tier);
      this.particles.setParticleTint(tier >= 3 ? 0xfef08a : 0xffffff);
      this.particles.emitParticleAt(x, y, 2);
    }
  }

  createToolTray(trayY, width, dpr) {
    const tools = [
      { id: 'tool_scraper', icon: this.getToolTextureForTier('tool_scraper'), label: 'Скребок' },
      { id: 'tool_brush', icon: this.getToolTextureForTier('tool_brush'), label: 'Кисть' },
      { id: 'tool_solvent', icon: this.getToolTextureForTier('tool_solvent'), label: 'Реагент' },
      { id: 'tool_glue', icon: 'tex_hd_tool_glue', label: 'Клей' },
      { id: 'tool_polish', icon: this.getToolTextureForTier('tool_polish'), label: 'Блеск' }
    ];

    const trayBgGfx = this.add.graphics().setDepth(180);
    trayBgGfx.fillGradientStyle(0x24180f, 0x24180f, 0x120b07, 0x120b07, 0.94);
    trayBgGfx.fillRect(0, trayY - 52, width, 114);
    trayBgGfx.lineStyle(1.5, 0xc89d54, 0.65);
    trayBgGfx.lineBetween(0, trayY - 52, width, trayY - 52);

    const stepX = (width * 0.90) / tools.length;
    const startX = width * 0.05 + stepX / 2;

    this.traySlots = [];

    tools.forEach((t, i) => {
      const slotX = startX + i * stepX;
      const isSelected = (t.id === this.activeTool);

      const slotCont = this.add.container(slotX, trayY).setDepth(185);

      const slotGfx = this.add.graphics();
      const drawSlot = (selected) => {
        slotGfx.clear();
        slotGfx.fillGradientStyle(
          selected ? 0x452d18 : 0x261a10,
          selected ? 0x452d18 : 0x261a10,
          selected ? 0x2b1b0e : 0x170f09,
          selected ? 0x2b1b0e : 0x170f09,
          1
        );
        slotGfx.fillRoundedRect(-29, -34, 58, 68, 10);
        slotGfx.lineStyle(selected ? 2 : 1.2, selected ? 0xfacc15 : 0x8c6239, 0.95);
        slotGfx.strokeRoundedRect(-29, -34, 58, 68, 10);
      };
      drawSlot(isSelected);

      const slotZone = this.add.zone(0, 0, 58, 68)
        .setInteractive({ useHandCursor: true });

      const iconImg = this.add.image(0, -8, t.icon).setScale(0.42);

      const lbl = this.add.text(0, 22, t.label, {
        fontSize: '9.5px',
        fontFamily: this.FONT_UI,
        color: isSelected ? '#facc15' : '#e6d5bc',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      slotCont.add([slotGfx, iconImg, lbl, slotZone]);

      slotZone.on('pointerdown', () => {
        this.selectTool(t.id, t.icon, true);
      });

      this.traySlots.push({
        id: t.id,
        cont: slotCont,
        drawSlot,
        label: lbl,
        baseY: trayY
      });
    });
  }

  selectTool(toolId, iconKey, isUser = false) {
    this.activeTool = toolId;

    if (this.textures.exists(iconKey)) {
      this.toolSprite.setTexture(iconKey);
    }

    if (isUser && AudioManager.playClick) {
      AudioManager.playClick();
    }

    this.traySlots.forEach((slot) => {
      const active = (slot.id === toolId);
      slot.drawSlot(active);
      slot.label.setColor(active ? '#facc15' : '#e6d5bc');

      this.tweens.add({
        targets: slot.cont,
        y: active ? (slot.baseY - 6) : slot.baseY,
        duration: 120,
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
    this.artifactPedestal.setAlpha(0);
    this.artifactShadow.setAlpha(0);

    if (AudioManager.playCloth) AudioManager.playCloth();

    this.tweens.add({
      targets: [this.cleanArt, this.dirtLayer],
      alpha: 1,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.isTaskTransition = false;
      }
    });

    this.tweens.add({
      targets: [this.artifactPedestal, this.artifactShadow],
      alpha: 0.85,
      duration: 350
    });
  }

  getToolName(toolId) {
    const map = {
      tool_scraper: 'Скребок',
      tool_brush: 'Кисть',
      tool_solvent: 'Реагент',
      tool_glue: 'Клей',
      tool_polish: 'Блеск'
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
      const w = srcCanvas.width;
      const h = srcCanvas.height;
      const imgData = srcCanvas.getContext('2d').getImageData(0, 0, w, h).data;

      for (let gy = 0; gy < this.gridRows; gy++) {
        for (let gx = 0; gx < this.gridCols; gx++) {
          const sampleX = Math.floor(((gx + 0.5) / this.gridCols) * w);
          const sampleY = Math.floor(((gy + 0.5) / this.gridRows) * h);
          const alpha = imgData[(sampleY * w + sampleX) * 4 + 3];
          const idx = gy * this.gridCols + gx;
          if (alpha > 40) {
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

 renderWorkbenchBackdrop(width, height, topBound, bottomBound) {
    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;
    const activeSkin = Storage.getActiveWorkbenchSkin
      ? Storage.getActiveWorkbenchSkin()
      : (localStorage.getItem('active_workbench_skin') || `workbench_bg_${tier}`);

    const applyBgTexture = (key) => {
      if (this.workbenchBgImg) this.workbenchBgImg.destroy();
      this.workbenchBgImg = this.add.image(width / 2, height / 2, key).setDepth(1);
      this.workbenchBgImg.setScale(Math.max(width / this.workbenchBgImg.width, height / this.workbenchBgImg.height));
    };

    if (this.textures.exists(activeSkin)) {
      applyBgTexture(activeSkin);
    } else {
      const fallbackBg = this.add.graphics().setDepth(0.5);
      fallbackBg.fillStyle(0x0d0805, 1);
      fallbackBg.fillRect(0, 0, width, height);

      this.load.image(activeSkin, `assets/backgrounds/${activeSkin}.png`);
      this.load.once(`filecomplete-image-${activeSkin}`, () => {
        if (this.scene && this.scene.isActive()) {
          applyBgTexture(activeSkin);
        }
      });
      this.load.once('loaderror', (file) => {
        if (file && file.key === activeSkin && activeSkin !== 'workbench_bg_1') {
          this.load.image('workbench_bg_1', 'assets/backgrounds/workbench_bg_1.png');
          this.load.once('filecomplete-image-workbench_bg_1', () => {
            if (this.scene && this.scene.isActive()) applyBgTexture('workbench_bg_1');
          });
          this.load.start();
        }
      });
      this.load.start();
    }

    const matPadX = 18;
    const matTop = topBound + 8;
    const matBottom = bottomBound - 10;
    const matW = width - matPadX * 2;
    const matH = matBottom - matTop;
    const matCenterY = matTop + matH / 2;

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

    // Полупрозрачный стеклянно-бархатный коврик, чтобы фон верстака читался во всей красе
    matGfx.fillStyle(palette.fill, 0.18);
    matGfx.fillRoundedRect(-halfW, -halfH, matW, matH, 16);

    matGfx.lineStyle(2.5, palette.border, 0.85);
    matGfx.strokeRoundedRect(-halfW, -halfH, matW, matH, 16);

    matGfx.lineStyle(1, palette.line, 0.3);
    matGfx.strokeRoundedRect(-halfW + 6, -halfH + 6, matW - 12, matH - 12, 12);

    const rivets = [
      { x: -halfW + 12, y: -halfH + 12 },
      { x: halfW - 12, y: -halfH + 12 },
      { x: -halfW + 12, y: halfH - 12 },
      { x: halfW - 12, y: halfH - 12 }
    ];
    rivets.forEach((r) => {
      matGfx.fillStyle(palette.border, 0.9);
      matGfx.fillCircle(r.x, r.y, 3);
    });

    const grid = this.add.graphics();
    grid.lineStyle(1, palette.line, 0.06);
    const step = 36;
    for (let x = -halfW + 36; x <= halfW - 36; x += step) {
      grid.lineBetween(x, -halfH + 12, x, halfH - 12);
    }
    for (let y = -halfH + 36; y <= halfH - 36; y += step) {
      grid.lineBetween(-halfW + 12, y, halfW - 12, y);
    }

    this.matContainer.add([matGfx, grid]);
    this.matContainer.setScale(0.95);
    this.matContainer.setAlpha(0);
    this.tweens.add({
      targets: this.matContainer,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 320,
      ease: 'Cubic.easeOut'
    });
  }

  processGlueAction(pointer) {
    if (this.activeTool !== 'tool_glue') {
      this.toolWarning.setText('⚠️ Выберите Клей на нижней панели!');
      return;
    }

    this.toolSprite.setPosition(pointer.x, pointer.y);
    this.toolSprite.setAlpha(1);

    if (!this.shardsList || this.shardsList.length === 0) return;

    let newlyGlued = false;

    this.shardsList.forEach((s) => {
      if (!s.glued) {
        const d = Phaser.Math.Distance.Between(pointer.x, pointer.y, s.targetX, s.targetY);
        if (d < 42) {
          s.glued = true;
          newlyGlued = true;
          s.border.clear();
          s.border.lineStyle(2.5, this.isKintsugiMode ? 0xfacc15 : 0x4ade80, 0.95);
          s.border.strokeCircle(0, 0, s.radius);

          this.breakHoleGfx.fillStyle(0x0d0805, 0.85);
          this.breakHoleGfx.fillCircle(s.targetX, s.targetY, s.radius);
          this.breakHoleGfx.lineStyle(2.5, this.isKintsugiMode ? 0xfacc15 : 0x4ade80, 0.95);
          this.breakHoleGfx.strokeCircle(s.targetX, s.targetY, s.radius);

          this.particles.setParticleTint(this.isKintsugiMode ? 0xfacc15 : 0x38bdf8);
          this.particles.emitParticleAt(s.targetX, s.targetY, 6);
        }
      }
    });

    if (newlyGlued) {
      if (AudioManager.playRub) AudioManager.playRub();
      const gluedCount = this.shardsList.filter((s) => s.glued).length;
      const total = this.shardsList.length;
      this.updateAssemblyProgress();

      if (gluedCount < total) {
        this.toolWarning.setText(`Клей нанесён (${gluedCount}/${total}). Промажьте остальные сколы!`);
      } else {
        this.toolWarning.setText('✨ Все места промазаны! Перетащите каждый осколок на своё место!');
      }
    }
  }

  updateAssemblyProgress() {
    if (!this.shardsList || this.shardsList.length === 0) return;
    const total = this.shardsList.length;
    const glued = this.shardsList.filter((s) => s.glued).length;
    const placed = this.shardsList.filter((s) => s.placed).length;

    const progress = (glued * 0.4 + placed * 0.6) / total;
    const maxBarW = Math.min(this.scale.width * 0.78, 280);
    this.progressBarFill.width = Math.max(6, maxBarW * progress);
  }

  getRandomValidPointsOnArt(count) {
    const candidates = [];
    const colW = this.artW / this.gridCols;
    const rowH = this.artH / this.gridRows;

    for (let gy = 4; gy < this.gridRows - 4; gy++) {
      for (let gx = 4; gx < this.gridCols - 4; gx++) {
        const idx = gy * this.gridCols + gx;
        if (this.validCellsMask[idx] === 1) {
          candidates.push({
            x: Math.floor(this.topLeftX + (gx + 0.5) * colW),
            y: Math.floor(this.topLeftY + (gy + 0.5) * rowH)
          });
        }
      }
    }

    Phaser.Utils.Array.Shuffle(candidates);
    const chosen = [];
    const minDistance = 68;

    for (let i = 0; i < candidates.length; i++) {
      const pt = candidates[i];
      const tooClose = chosen.some((c) => Phaser.Math.Distance.Between(pt.x, pt.y, c.x, c.y) < minDistance);
      if (!tooClose) {
        chosen.push(pt);
        if (chosen.length >= count) break;
      }
    }

    if (chosen.length === 0) {
      chosen.push({ x: this.centerX, y: this.centerY });
    }

    return chosen;
  }

  createShardTexture(texKey, targetX, targetY, radius, idx) {
    const shardKey = `shard_tex_${Date.now()}_${idx}`;
    if (this.textures.exists(shardKey)) {
      this.textures.remove(shardKey);
    }

    const size = radius * 2 + 8;
    const half = size / 2;
    const cvs = this.textures.createCanvas(shardKey, size, size);
    const ctx = cvs.getContext();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Вырезаем реальный фрагмент артефакта в локальной системе координат (half, half)
    ctx.save();
    ctx.beginPath();
    ctx.arc(half, half, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const srcImg = this.textures.get(texKey).getSourceImage();
    if (srcImg) {
      const offsetX = this.topLeftX - targetX + half;
      const offsetY = this.topLeftY - targetY + half;
      ctx.drawImage(srcImg, offsetX, offsetY, this.artW, this.artH);
    } else {
      ctx.fillStyle = '#c89d54';
      ctx.fillRect(0, 0, size, size);
    }
    ctx.restore();

    cvs.refresh();
    return shardKey;
  }

  setupBreakAndAssembleStage(task) {
    const { width } = this.scale;
    const dpr = this.dpr;

    this.assemblyContainer.removeAll(true);
    this.assemblyContainer.setVisible(true);
    this.assemblyContainer.setDepth(35);

    this.progressBarFill.width = 6;
    this.shardsList = [];

    const texKey = this.textures.exists(this.artifactData.textureKey) ? this.artifactData.textureKey : 'art_egypt_scarab';

    const shardCount = Phaser.Math.Clamp(task.shardCount || 2, 2, 3);
    const points = this.getRandomValidPointsOnArt(shardCount);
    this.taskNotice.setText(`ЭТАП ${this.currentTaskIndex + 1}/${this.artifactData.tasks.length}: Склейте сколы (${points.length} шт.)`);

    this.breakHoleGfx.clear();
    this.breakHoleGfx.setVisible(true);

    const scatterOffsets = [
      { dx: -115, dy: -60 },
      { dx: 115, dy: -60 },
      { dx: -95, dy: 100 },
      { dx: 95, dy: 100 }
    ];

    if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
    this.cameras.main.shake(140, 0.008);

    points.forEach((pt, idx) => {
      const targetX = pt.x;
      const targetY = pt.y;
      const radius = 25;

      // Тёмное углубление скола на артефакте
      this.breakHoleGfx.fillStyle(0x0d0805, 0.94);
      this.breakHoleGfx.fillCircle(targetX, targetY, radius);
      this.breakHoleGfx.lineStyle(2, 0xef4444, 0.9);
      this.breakHoleGfx.strokeCircle(targetX, targetY, radius);

      // Генерируем самостоятельную текстуру осколка без WebGL GeometryMask
      const shardTexKey = this.createShardTexture(texKey, targetX, targetY, radius, idx);

      const pieceContainer = this.add.container(targetX, targetY).setDepth(40);
      const pieceImg = this.add.image(0, 0, shardTexKey);

      const pieceBorder = this.add.graphics();
      pieceBorder.lineStyle(2.5, 0xfacc15, 0.95);
      pieceBorder.strokeCircle(0, 0, radius);

      const hitZone = this.add.circle(0, 0, 38, 0xfacc15, 0.05)
        .setInteractive({ draggable: true, useHandCursor: true });

      pieceContainer.add([pieceImg, pieceBorder, hitZone]);
      this.input.setDraggable(hitZone);
      this.assemblyContainer.add(pieceContainer);

      const scatter = scatterOffsets[idx % scatterOffsets.length];
      const restX = this.centerX + scatter.dx;
      const restY = this.centerY + scatter.dy;

      const shardObj = {
        id: idx,
        targetX,
        targetY,
        restX,
        restY,
        radius,
        texKey: shardTexKey,
        container: pieceContainer,
        border: pieceBorder,
        hitZone,
        glued: false,
        placed: false
      };
      this.shardsList.push(shardObj);

      this.tweens.add({
        targets: pieceContainer,
        x: restX,
        y: restY,
        duration: 380 + idx * 60,
        ease: 'Bounce.easeOut',
        onComplete: () => {
          if (idx === 0) {
            this.selectTool('tool_glue', 'tex_hd_tool_glue', true);
            this.toolWarning.setText(`Нанесите Клей на все места сколов (${points.length} шт.)!`);
          }
        }
      });

      hitZone.on('drag', (pointer) => {
        if (shardObj.placed) return;
        if (!shardObj.glued) {
          this.toolWarning.setText('⚠️ Сначала нанесите Клей в гнездо этого осколка!');
          return;
        }
        pieceContainer.x = pointer.x;
        pieceContainer.y = pointer.y;
      });

      hitZone.on('dragend', () => {
        if (shardObj.placed || !shardObj.glued) return;

        const dist = Phaser.Math.Distance.Between(pieceContainer.x, pieceContainer.y, targetX, targetY);
        if (dist < 42) {
          shardObj.placed = true;
          pieceContainer.x = targetX;
          pieceContainer.y = targetY;
          hitZone.disableInteractive();
          hitZone.setFillStyle(0xffffff, 0);
          pieceBorder.clear();

          if (this.isKintsugiMode) {
            pieceBorder.lineStyle(3, 0xfacc15, 0.95);
            pieceBorder.strokeCircle(0, 0, radius);
            if (AudioManager.playShine) AudioManager.playShine();
          } else {
            pieceBorder.lineStyle(1, 0x4ade80, 0.45);
            pieceBorder.strokeCircle(0, 0, radius);
            if (AudioManager.playCoin) AudioManager.playCoin();
          }

          this.updateAssemblyProgress();

          const allPlaced = this.shardsList.every((s) => s.placed);
          if (allPlaced) {
            if (this.isKintsugiMode) {
              this.hasKintsugiMastery = true;
              if (Storage.addKintsugiLacquer) {
                Storage.addKintsugiLacquer(-1);
              } else {
                const cur = Math.max(0, parseInt(localStorage.getItem('kintsugi_lacquer') || '0', 10) - 1);
                localStorage.setItem('kintsugi_lacquer', String(cur));
              }
            }

            this.time.delayedCall(400, () => {
              this.breakHoleGfx.setVisible(false);
              this.assemblyContainer.setVisible(false);
              if (this.kintsugiBanner) {
                this.kintsugiBanner.destroy();
                this.kintsugiBanner = null;
              }
              this.completeTaskTransition();
            });
          } else {
            const left = this.shardsList.filter((s) => !s.placed).length;
            this.toolWarning.setText(`Отлично! Осталось установить осколков: ${left}`);
          }
        } else {
          this.toolWarning.setText('⚠️ Этот осколок не подходит сюда — ищите его родное место!');
          this.tweens.add({
            targets: pieceContainer,
            x: restX,
            y: restY,
            duration: 200,
            ease: 'Back.easeOut'
          });
        }
      });
    });

    const lacquer = Storage.getKintsugiLacquer
      ? Storage.getKintsugiLacquer()
      : parseInt(localStorage.getItem('kintsugi_lacquer') || '0', 10);
    if (lacquer > 0) {
      this.showKintsugiBanner(width, dpr);
    }
  }

  showKintsugiBanner(width, dpr) {
    if (this.kintsugiBanner) this.kintsugiBanner.destroy();

    this.kintsugiBanner = this.add.container(width / 2, this.centerY + 165).setDepth(45);
    const bannerW = width * 0.88;
    const bannerH = 44;

    const bannerGfx = this.add.graphics();
    bannerGfx.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.96);
    bannerGfx.fillRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 10);
    bannerGfx.lineStyle(1.5, 0xc89d54, 0.9);
    bannerGfx.strokeRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 10);

    const btnX = width * 0.44 - 52;
    const btnGfx = this.add.graphics();
    const drawBtn = (active) => {
      btnGfx.clear();
      btnGfx.fillStyle(active ? 0x16a34a : 0xd99b26, 1);
      btnGfx.fillRoundedRect(btnX - 45, -14, 90, 28, 7);
      btnGfx.lineStyle(1, active ? 0x86efac : 0xfef08a, 0.95);
      btnGfx.strokeRoundedRect(btnX - 45, -14, 90, 28, 7);
    };
    drawBtn(false);

    const kintsugiZone = this.add.zone(btnX, 0, 90, 28)
      .setInteractive({ useHandCursor: true });

    const kintsugiTxt = this.add.text(btnX, 0, '✨ КИНЦУГИ', {
      fontSize: '10.5px',
      fontFamily: this.FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const infoTxt = this.add.text(-width * 0.44 + 12, 0, 'Золотой шов (1 лак на все): +60%', {
      fontSize: '10.5px',
      fontFamily: this.FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0, 0.5);

    kintsugiZone.on('pointerdown', () => {
      this.isKintsugiMode = !this.isKintsugiMode;
      drawBtn(this.isKintsugiMode);
      kintsugiTxt.setColor(this.isKintsugiMode ? '#ffffff' : '#1a1004');
      kintsugiTxt.setText(this.isKintsugiMode ? '✓ ВЫБРАНО' : '✨ КИНЦУГИ');
      infoTxt.setText(this.isKintsugiMode ? 'Золото активно на все сколы!' : 'Золотой шов (1 лак на все): +60%');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    this.kintsugiBanner.add([bannerGfx, infoTxt, btnGfx, kintsugiTxt, kintsugiZone]);
  }

  startTask(taskIdx) {
    this.currentTaskIndex = taskIdx;
    this.isTaskTransition = false;
    this.cleanedGrid.fill(0);
    this.cleanedScore = 0;
    this.progressBarFill.width = 6;
    this.toolWarning.setText('');

    const task = this.artifactData.tasks[taskIdx];
    if (!task) return;

    const reqTool = task.requiredTool || 'tool_scraper';
    const taskTitle = task.hint || task.name || 'Очистите артефакт';
    this.taskNotice.setText(`ШАГ ${taskIdx + 1}/${this.artifactData.tasks.length}: ${taskTitle}`);

    const iconKey = reqTool === 'tool_glue' ? 'tex_hd_tool_glue' : this.getToolTextureForTier(reqTool);
    this.selectTool(reqTool, iconKey, true);

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
      dirtGfx.fillStyle(0x5c4a35, 0.90);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x42321f, 0.92);
      for (let i = 0; i < 34; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(12, 30));
      }
      dirtGfx.fillStyle(0x8a6d4b, 0.65);
      for (let i = 0; i < 20; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(6, 16));
      }
    } else if (reqTool === 'tool_brush') {
      dirtGfx.fillStyle(0xa89f91, 0.84);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x78716c, 0.75);
      for (let i = 0; i < 32; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(8, 24));
      }
    } else if (reqTool === 'tool_solvent') {
      dirtGfx.fillStyle(0x234d45, 0.84);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x367063, 0.80);
      for (let i = 0; i < 28; i++) {
        dirtGfx.fillEllipse(Phaser.Math.Between(20, this.artW - 20), Phaser.Math.Between(20, this.artH - 20), Phaser.Math.Between(18, 38), Phaser.Math.Between(10, 22));
      }
    } else {
      dirtGfx.fillStyle(0x41413a, 0.65);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x282824, 0.50);
      for (let i = 0; i < 24; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(15, this.artW - 15), Phaser.Math.Between(15, this.artH - 15), Phaser.Math.Between(14, 32));
      }
    }

    this.dirtLayer.draw(dirtGfx, 0, 0);
    dirtGfx.destroy();
  }

  completeTaskTransition() {
    if (AudioManager.playCoin) AudioManager.playCoin();

    const flash = this.add.rectangle(this.cleanArt.x, this.cleanArt.y, this.cleanArt.width, this.cleanArt.height, 0xfffbeb, 0.7)
      .setDepth(25);
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
