import * as ArtifactsModule from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class RestoreScene extends Phaser.Scene {
  constructor() {
    super('RestoreScene');
  }

  create(data) {
    const { width, height } = this.scale;

    // --- 1. ДАННЫЕ И СЕССИЯ (НЕПРИКОСНОВЕННЫЙ БАЗИС) ---
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

    // FTUE проверка разворачивания мата
    const ftueKey = `art_ftue_mat_${this.artifactData.regionId || 'egypt'}`;
    const isFirstTime = !sessionStorage.getItem(ftueKey);
    if (isFirstTime) {
      sessionStorage.setItem(ftueKey, '1');
    }
    this.isRitualIntro = isFirstTime;

    // Генерация сглаженных High-DPI текстур инструментов
    this.generateAntiAliasedToolTextures();

    // =========================================================================
    // 2. БЕЗОПАСНАЯ ГЕОМЕТРИЯ ЭКРАНА (LAYOUT ANCHORS)
    // =========================================================================
    const topBarHeight = 52;
    const infoPanelHeight = 96;
    const headerTotalHeight = topBarHeight + infoPanelHeight;
    const trayHeight = 88;
    const trayY = height - trayHeight / 2 - 14;
    const trayTopLimit = height - trayHeight - 26;

    const workspaceAvailableHeight = trayTopLimit - headerTotalHeight;
    this.centerX = Math.round(width / 2);
    this.centerY = Math.round(headerTotalHeight + workspaceAvailableHeight / 2);

    this.artW = Math.min(width * 0.76, 320);
    this.artH = Math.min(workspaceAvailableHeight * 0.78, 400);
    this.topLeftX = this.centerX - this.artW / 2;
    this.topLeftY = this.centerY - this.artH / 2;

    // Сглаженный стол и кожаный мат
    this.renderAtmosphericWorkshop(width, height, headerTotalHeight, trayTopLimit);

    // =========================================================================
    // 3. ВЕРХНИЙ БАР (ТИПОГРАФИКА И СИСТЕМНЫЕ КНОПКИ)
    // =========================================================================
    const topBarCont = this.add.container(0, 0).setDepth(40);

    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.coinsText = this.add.text(18, 26, `🪙 ${coins}`, {
      fontSize: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.coinsText.setShadow(0, 2, 'rgba(0,0,0,0.85)', 4);
    topBarCont.add(this.coinsText);

    const btnSize = 34;
    const rightMargin = 16;

    const menuBtn = this.add.rectangle(width - rightMargin - 46, 26, 92, btnSize, 0x131924)
      .setStrokeStyle(1.5, 0x334155, 0.9)
      .setInteractive({ useHandCursor: true });

    const menuTxt = this.add.text(width - rightMargin - 46, 26, '📁 Меню', {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2e8f0',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    menuTxt.setShadow(0, 1, 'rgba(0,0,0,0.8)', 2);

    menuBtn.on('pointerdown', () => {
      if (AudioManager.stopMusic) AudioManager.stopMusic();
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });

    const musicBtnX = width - rightMargin - 92 - 10 - btnSize / 2;
    const musicBtn = this.add.rectangle(musicBtnX, 26, btnSize, btnSize, 0x131924)
      .setStrokeStyle(1.5, 0x334155, 0.9)
      .setInteractive({ useHandCursor: true });
    const musicIcon = this.add.text(musicBtnX, 26, AudioManager.isMusicOn() ? '🎵' : '🔇', { fontSize: '14px' })
      .setOrigin(0.5);

    musicBtn.on('pointerdown', (p, lx, ly, ev) => {
      if (ev && ev.stopPropagation) ev.stopPropagation();
      const state = AudioManager.toggleMusic();
      musicIcon.setText(state ? '🎵' : '🔇');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    const sfxBtnX = musicBtnX - btnSize - 8;
    const sfxBtn = this.add.rectangle(sfxBtnX, 26, btnSize, btnSize, 0x131924)
      .setStrokeStyle(1.5, 0x334155, 0.9)
      .setInteractive({ useHandCursor: true });
    const sfxIcon = this.add.text(sfxBtnX, 26, AudioManager.isSfxOn() ? '🔊' : '🔈', { fontSize: '14px' })
      .setOrigin(0.5);

    sfxBtn.on('pointerdown', (p, lx, ly, ev) => {
      if (ev && ev.stopPropagation) ev.stopPropagation();
      const state = AudioManager.toggleSfx();
      sfxIcon.setText(state ? '🔊' : '🔈');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    topBarCont.add([menuBtn, menuTxt, musicBtn, musicIcon, sfxBtn, sfxIcon]);

    // =========================================================================
    // 4. ИНФОРМАЦИОННАЯ ШАПКА ЗАДАНИЯ
    // =========================================================================
    const infoCont = this.add.container(0, topBarHeight).setDepth(40);

    let badgeText = (this.artifactData.regionName || 'ДРЕВНИЙ ЕГИПЕТ').toUpperCase();
    if (this.activeContract) {
      badgeText = `📜 КОНТРАКТ: ${this.activeContract.client.toUpperCase()}`;
    } else if (this.isDuplicate) {
      badgeText += ' • ПОВТОРНЫЙ ОБРАЗЕЦ (-55%)';
    }

    const badgeLbl = this.add.text(width / 2, 8, badgeText, {
      fontSize: '10.5px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: this.activeContract ? '#facc15' : (this.isDuplicate ? '#94a3b8' : '#c5a059'),
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);
    badgeLbl.setShadow(0, 1, 'rgba(0,0,0,0.9)', 3);

    const artTitle = this.add.text(width / 2, 29, this.artifactData.name, {
      fontSize: '18px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    artTitle.setShadow(0, 2, 'rgba(0,0,0,0.85)', 4);

    this.taskNotice = this.add.text(width / 2, 50, '', {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#cbd5e1'
    }).setOrigin(0.5);
    this.taskNotice.setShadow(0, 1, 'rgba(0,0,0,0.8)', 2);

    const barWidth = Math.min(width * 0.72, 280);
    this.progressBarBg = this.add.rectangle(width / 2, 68, barWidth, 6, 0x0f172a);
    this.progressBarFill = this.add.rectangle(width / 2 - barWidth / 2, 68, 0, 6, 0x10b981)
      .setOrigin(0, 0.5);

    this.toolWarning = this.add.text(width / 2, 83, '', {
      fontSize: '10.5px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f87171',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    infoCont.add([badgeLbl, artTitle, this.taskNotice, this.progressBarBg, this.progressBarFill, this.toolWarning]);

    // =========================================================================
    // 5. РАБОЧАЯ ЗОНА И АРТЕФАКТ
    // =========================================================================
    this.contactShadow1 = this.add.ellipse(this.centerX, this.centerY + this.artH * 0.40, this.artW * 0.85, 36, 0x000000, 0.45).setDepth(6);
    this.contactShadow2 = this.add.ellipse(this.centerX, this.centerY + this.artH * 0.38, this.artW * 0.60, 22, 0x000000, 0.65).setDepth(6);

    const texKey = this.textures.exists(this.artifactData.textureKey) ? this.artifactData.textureKey : 'art_egypt_scarab';
    this.cleanArt = this.add.image(this.centerX, this.centerY, texKey)
      .setDisplaySize(this.artW, this.artH)
      .setDepth(7);

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

    this.createRestorationVFX();

    const firstTask = this.artifactData.tasks[0];
    this.activeTool = firstTask.requiredTool || 'tool_scraper';
    this.activeMaskKey = this.activeTool.replace('tool_', 'mask_');

    // Спрайт активного инструмента под пальцем
    this.toolSprite = this.add.image(this.centerX, this.centerY, `tex_hd_${this.activeTool}`)
      .setOrigin(0.5, 0.88).setScale(0.52).setAlpha(0).setDepth(20);

    this.assemblyContainer = this.add.container(0, 0).setDepth(18).setVisible(false);

    // =========================================================================
    // 6. ОБЪЁМНЫЙ ЛОТОК ИНСТРУМЕНТОВ
    // =========================================================================
    this.createToolTray(trayY, width);
    this.selectTool(this.activeTool, `tex_hd_${this.activeTool}`, this.activeMaskKey, true);

    this.gridCols = 32;
    this.gridRows = 40;
    this.totalCells = this.gridCols * this.gridRows;
    this.cleanedGrid = new Uint8Array(this.totalCells);
    this.validCellsMask = new Uint8Array(this.totalCells);
    this.buildValidShapeMask(texKey);

    this.startTask(0);

    if (this.isRitualIntro) {
      this.playMatUnrollSequence();
    }

    // =========================================================================
    // 7. ИНТЕРАКТИВНОЕ СТИРАНИЕ С ЖИВОЙ КИНЕМАТИКОЙ
    // =========================================================================
    const processInteraction = (pointer) => {
      if (this.isAnimatingMat) {
        this.skipMatIntro();
        return;
      }
      if (!pointer.isDown || this.isTaskTransition) return;
      if (pointer.y > trayTopLimit) return;

      const currentTask = this.artifactData.tasks[this.currentTaskIndex];

      if (currentTask.type === 'break_and_assemble') {
        this.processGlueAction(pointer);
        return;
      }

      this.toolSprite.setPosition(pointer.x, pointer.y - 12);
      this.toolSprite.setAlpha(1);

      // Анимация инструмента под пальцем в зависимости от вектора движения
      this.animateToolUnderFinger(pointer);

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

        this.emitToolVFX(pointer.x, pointer.y);

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
        this.progressBarFill.width = (Math.min(this.scale.width * 0.72, 280)) * ratio;

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
        angle: 0,
        scaleX: 0.52,
        scaleY: 0.52,
        duration: 140
      });
    });
  }

  // =========================================================================
  // 8. КИНЕМАТИКА ИНСТРУМЕНТОВ В ДВИЖЕНИИ
  // =========================================================================
  animateToolUnderFinger(pointer) {
    if (!this.lastTouchPos) {
      this.lastTouchPos = { x: pointer.x, y: pointer.y };
      return;
    }

    const dx = pointer.x - this.lastTouchPos.x;
    const dy = pointer.y - this.lastTouchPos.y;
    this.lastTouchPos = { x: pointer.x, y: pointer.y };

    if (this.activeTool === 'tool_scraper') {
      // Скребок: наклон в сторону движения и легкий пружинящий нажим
      const targetAngle = Phaser.Math.Clamp(dx * 1.8, -16, 16);
      this.toolSprite.angle = Phaser.Math.Linear(this.toolSprite.angle, targetAngle, 0.35);
      this.toolSprite.scaleY = (Math.abs(dx) > 1 || Math.abs(dy) > 1) ? 0.49 : 0.52;
    } else if (this.activeTool === 'tool_brush') {
      // Кисть: эластичный изгиб ворса назад от вектора ведения
      const targetAngle = Phaser.Math.Clamp(-dx * 1.4, -20, 20);
      this.toolSprite.angle = Phaser.Math.Linear(this.toolSprite.angle, targetAngle, 0.25);
      this.toolSprite.scaleX = (Math.abs(dx) > 2) ? 0.56 : 0.52;
    } else if (this.activeTool === 'tool_solvent') {
      // Спрей: пульсирующий ход сопла
      const spd = Math.sqrt(dx * dx + dy * dy);
      if (spd > 3) {
        this.toolSprite.angle = (Math.sin(this.time.now * 0.02) * 5);
        this.toolSprite.scaleY = 0.48;
      } else {
        this.toolSprite.angle = 0;
        this.toolSprite.scaleY = 0.52;
      }
    } else if (this.activeTool === 'tool_polish') {
      // Замша: круговые полирующие микро-вибрации
      this.toolSprite.angle = Math.sin(this.time.now * 0.035) * 8;
      this.toolSprite.scaleX = 0.52 + Math.cos(this.time.now * 0.035) * 0.04;
      this.toolSprite.scaleY = 0.52 + Math.sin(this.time.now * 0.035) * 0.04;
    } else {
      this.toolSprite.angle = 0;
      this.toolSprite.scaleX = 0.52;
      this.toolSprite.scaleY = 0.52;
    }
  }

  // =========================================================================
  // 9. СУПЕРСЭМПЛИНГ ТЕКСТУР ИНСТРУМЕНТОВ (HI-DPI 128x128 БЕЗ РЯБИ)
  // =========================================================================
  generateAntiAliasedToolTextures() {
    const makeHD = (key, drawFn) => {
      if (this.textures.exists(key)) return;
      const cvs = this.textures.createCanvas(key, 128, 128);
      const ctx = cvs.getContext();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      drawFn(ctx);
      cvs.refresh();
    };

    // 1. Скребок HD
    makeHD('tex_hd_tool_scraper', (ctx) => {
      ctx.clearRect(0, 0, 128, 128);
      // Рукоять из тёмного дерева
      const hGrad = ctx.createLinearGradient(54, 60, 74, 60);
      hGrad.addColorStop(0, '#2b1810');
      hGrad.addColorStop(0.5, '#5c3319');
      hGrad.addColorStop(1, '#1f100a');
      ctx.fillStyle = hGrad;
      ctx.beginPath();
      ctx.roundRect(56, 60, 16, 60, 6);
      ctx.fill();

      // Латунный больстер
      const bGrad = ctx.createLinearGradient(52, 50, 76, 50);
      bGrad.addColorStop(0, '#b48a28');
      bGrad.addColorStop(0.5, '#fde047');
      bGrad.addColorStop(1, '#856417');
      ctx.fillStyle = bGrad;
      ctx.fillRect(53, 50, 22, 10);

      // Стальное гранёное лезвие
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(64, 8);
      ctx.lineTo(92, 50);
      ctx.lineTo(36, 50);
      ctx.closePath();
      ctx.fill();

      // Полированный скос лезвия
      const sGrad = ctx.createLinearGradient(36, 8, 92, 50);
      sGrad.addColorStop(0, 'rgba(255,255,255,0.85)');
      sGrad.addColorStop(0.45, 'rgba(241,245,249,0.3)');
      sGrad.addColorStop(1, 'rgba(15,23,42,0.6)');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.moveTo(64, 8);
      ctx.lineTo(72, 50);
      ctx.lineTo(60, 50);
      ctx.closePath();
      ctx.fill();
    });

    // 2. Кисть HD
    makeHD('tex_hd_tool_brush', (ctx) => {
      ctx.clearRect(0, 0, 128, 128);
      // Ручка
      const rGrad = ctx.createLinearGradient(56, 62, 72, 62);
      rGrad.addColorStop(0, '#78350f');
      rGrad.addColorStop(0.5, '#b45309');
      rGrad.addColorStop(1, '#451a03');
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.roundRect(58, 62, 12, 58, 6);
      ctx.fill();

      // Обойма полированная сталь
      const fGrad = ctx.createLinearGradient(50, 42, 78, 42);
      fGrad.addColorStop(0, '#94a3b8');
      fGrad.addColorStop(0.5, '#f8fafc');
      fGrad.addColorStop(1, '#475569');
      ctx.fillStyle = fGrad;
      ctx.fillRect(52, 42, 24, 20);

      // Натуральный мягкий ворс с градиентом
      const wGrad = ctx.createLinearGradient(64, 10, 64, 42);
      wGrad.addColorStop(0, '#1c1917');
      wGrad.addColorStop(0.5, '#92400e');
      wGrad.addColorStop(0.85, '#d97706');
      wGrad.addColorStop(1, '#fef08a');
      ctx.fillStyle = wGrad;
      ctx.beginPath();
      ctx.ellipse(64, 26, 18, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Спрей HD
    makeHD('tex_hd_tool_solvent', (ctx) => {
      ctx.clearRect(0, 0, 128, 128);
      // Изумрудный стеклянный флакон
      const gGrad = ctx.createLinearGradient(44, 44, 84, 44);
      gGrad.addColorStop(0, '#064e3b');
      gGrad.addColorStop(0.5, '#059669');
      gGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.roundRect(44, 44, 40, 72, 10);
      ctx.fill();

      // Глянец на стекле
      ctx.fillStyle = 'rgba(255,255,255,0.42)';
      ctx.fillRect(48, 48, 6, 62);

      // Горловина и латунный пульверизатор
      ctx.fillStyle = '#b48a28';
      ctx.fillRect(56, 26, 16, 18);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(50, 18, 28, 9);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(72, 11, 18, 9);
    });

    // 4. Клей HD
    makeHD('tex_hd_tool_glue', (ctx) => {
      ctx.clearRect(0, 0, 128, 128);
      // Керамический флакон
      const pGrad = ctx.createLinearGradient(42, 48, 86, 48);
      pGrad.addColorStop(0, '#0f172a');
      pGrad.addColorStop(0.5, '#334155');
      pGrad.addColorStop(1, '#020617');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.roundRect(42, 48, 44, 68, 10);
      ctx.fill();

      // Золотая гравированная этикетка
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(50, 68, 28, 28);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(54, 72, 20, 20);

      // Горлышко и капля лака
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(54, 32, 20, 16);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(64, 24, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(61, 21, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Замша HD
    makeHD('tex_hd_tool_polish', (ctx) => {
      ctx.clearRect(0, 0, 128, 128);
      // Свёрток замши
      const zGrad = ctx.createRadialGradient(64, 64, 8, 64, 64, 44);
      zGrad.addColorStop(0, '#fde68a');
      zGrad.addColorStop(0.6, '#d97706');
      zGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = zGrad;
      ctx.beginPath();
      ctx.roundRect(38, 38, 52, 52, 14);
      ctx.fill();

      // Складки мягкой ткани
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(62, 60, 14, 0.4, Math.PI * 1.3);
      ctx.stroke();
    });
  }

  // =========================================================================
  // 10. VFX СИСТЕМА ЧАСТИЦ
  // =========================================================================
  createRestorationVFX() {
    this.particles = this.add.particles(0, 0, 'particle_dust', {
      lifespan: { min: 200, max: 350 },
      speed: { min: 40, max: 90 },
      scale: { start: 1.0, end: 0 },
      emitting: false
    }).setDepth(9);
  }

  emitToolVFX(x, y) {
    if (this.activeTool === 'tool_scraper') {
      if (AudioManager.playScrub) AudioManager.playScrub();
      this.particles.setParticleTint(0x8a6233);
      this.particles.emitParticleAt(x, y, 3);
    } else if (this.activeTool === 'tool_brush') {
      if (AudioManager.playBrush) AudioManager.playBrush();
      this.particles.setParticleTint(0xd4af37);
      this.particles.emitParticleAt(x, y, 2);
    } else if (this.activeTool === 'tool_solvent') {
      if (AudioManager.playSpray) AudioManager.playSpray();
      this.particles.setParticleTint(0x34d399);
      this.particles.emitParticleAt(x, y, 3);
    } else if (this.activeTool === 'tool_polish') {
      if (AudioManager.playCloth) AudioManager.playCloth();
      this.particles.setParticleTint(0xffffff);
      this.particles.emitParticleAt(x, y, 1);
    }
  }

  // =========================================================================
  // 11. ЛОТОК ИНСТРУМЕНТОВ С АНИМАЦИЕЙ ПОДНЯТИЯ
  // =========================================================================
  createToolTray(trayY, width) {
    const tools = [
      { id: 'tool_scraper', icon: 'tex_hd_tool_scraper', mask: 'mask_scraper', label: 'Скребок' },
      { id: 'tool_brush', icon: 'tex_hd_tool_brush', mask: 'mask_brush', label: 'Кисть' },
      { id: 'tool_solvent', icon: 'tex_hd_tool_solvent', mask: 'mask_solvent', label: 'Спрей' },
      { id: 'tool_glue', icon: 'tex_hd_tool_glue', mask: 'mask_glue', label: 'Клей' },
      { id: 'tool_polish', icon: 'tex_hd_tool_polish', mask: 'mask_polish', label: 'Замша' }
    ];

    this.add.rectangle(width / 2, trayY, width * 0.94, 82, 0x0c1017, 0.98)
      .setStrokeStyle(1.5, 0x1e2738, 0.9)
      .setDepth(22);

    const stepX = (width * 0.90) / tools.length;
    const startX = width * 0.05 + stepX / 2;

    this.traySlots = [];

    tools.forEach((t, i) => {
      const slotX = startX + i * stepX;
      const isSelected = (t.id === this.activeTool);

      const slotCont = this.add.container(slotX, trayY).setDepth(23);

      const slotWell = this.add.rectangle(0, 0, 52, 58, 0x080c12)
        .setStrokeStyle(1, 0x1a2333, 0.8);

      const slotBg = this.add.rectangle(0, 0, 50, 56, 0x141a24)
        .setStrokeStyle(1.5, isSelected ? 0xd4af37 : 0x243042, isSelected ? 1 : 0.6)
        .setInteractive({ useHandCursor: true });

      const iconImg = this.add.image(0, -6, t.icon).setScale(0.44);

      const lbl = this.add.text(0, 18, t.label, {
        fontSize: '9.5px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: isSelected ? '#facc15' : '#64748b',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      slotCont.add([slotWell, slotBg, iconImg, lbl]);

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

    this.traySlots.forEach(slot => {
      const active = (slot.id === toolId);
      slot.bg.setStrokeStyle(1.5, active ? 0xd4af37 : 0x243042, active ? 1 : 0.6);
      slot.label.setColor(active ? '#facc15' : '#64748b');

      this.tweens.add({
        targets: slot.cont,
        y: active ? (slot.baseY - 7) : slot.baseY,
        duration: 180,
        ease: 'Cubic.easeOut'
      });
    });

    const currentTask = this.artifactData.tasks[this.currentTaskIndex];
    if (currentTask && toolId === currentTask.requiredTool) {
      this.toolWarning.setText('');
    }
  }

  // =========================================================================
  // 12. МАТ ВЕРСТАКА И РАЗВОРАЧИВАНИЕ
  // =========================================================================
  playMatUnrollSequence() {
    this.isAnimatingMat = true;

    this.cleanArt.setAlpha(0);
    this.dirtLayer.setAlpha(0);
    this.contactShadow1.setAlpha(0);
    this.contactShadow2.setAlpha(0);

    this.matContainer.setScale(0.08, 1);
    this.matContainer.setAlpha(0.7);

    if (AudioManager.playCloth) AudioManager.playCloth();

    this.matIntroTween = this.tweens.add({
      targets: this.matContainer,
      scaleX: 1,
      alpha: 1,
      duration: 520,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.cleanArt.setY(this.centerY - 24);
        this.dirtLayer.setY(this.topLeftY - 24);

        this.tweens.add({
          targets: [this.cleanArt],
          y: this.centerY,
          alpha: 1,
          duration: 320,
          ease: 'Quad.easeOut'
        });

        this.tweens.add({
          targets: [this.dirtLayer],
          y: this.topLeftY,
          alpha: 1,
          duration: 320,
          ease: 'Quad.easeOut'
        });

        this.tweens.add({
          targets: [this.contactShadow1, this.contactShadow2],
          alpha: { from: 0, to: 0.65 },
          duration: 350,
          ease: 'Quad.easeOut',
          onComplete: () => {
            this.isAnimatingMat = false;
          }
        });
      }
    });
  }

  skipMatIntro() {
    if (!this.isAnimatingMat) return;
    if (this.matIntroTween) this.matIntroTween.stop();

    this.matContainer.setScale(1, 1).setAlpha(1);
    this.cleanArt.setY(this.centerY).setAlpha(1);
    this.dirtLayer.setY(this.topLeftY).setAlpha(1);
    this.contactShadow1.setAlpha(0.45);
    this.contactShadow2.setAlpha(0.65);
    this.isAnimatingMat = false;
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

  renderAtmosphericWorkshop(width, height, topY, bottomY) {
    const bg = this.add.graphics().setDepth(0);
    bg.fillStyle(0x070a10, 1);
    bg.fillRect(0, 0, width, height);

    const matPadding = 12;
    const matW = width - matPadding * 2;
    const matH = bottomY - topY - 14;
    const matCenterY = topY + 8 + matH / 2;

    this.matContainer = this.add.container(width / 2, matCenterY).setDepth(2);

    const matGfx = this.add.graphics();
    const halfW = matW / 2;
    const halfH = matH / 2;

    matGfx.fillStyle(0x0f1520, 1);
    matGfx.fillRoundedRect(-halfW, -halfH, matW, matH, 12);

    matGfx.lineStyle(1.5, 0xc5a059, 0.7);
    matGfx.strokeRoundedRect(-halfW, -halfH, matW, matH, 12);
    matGfx.lineStyle(1, 0x1e293b, 0.4);
    matGfx.strokeRoundedRect(-halfW + 4, -halfH + 4, matW - 8, matH - 8, 8);

    const rivets = [
      { x: -halfW + 12, y: -halfH + 12 },
      { x: halfW - 12, y: -halfH + 12 },
      { x: -halfW + 12, y: halfH - 12 },
      { x: halfW - 12, y: halfH - 12 }
    ];
    rivets.forEach(r => {
      matGfx.fillStyle(0xd4af37, 0.9);
      matGfx.fillCircle(r.x, r.y, 3);
      matGfx.lineStyle(1, 0x5a3f1a, 0.8);
      matGfx.strokeCircle(r.x, r.y, 3);
    });

    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1e293b, 0.18);
    const step = 26;
    for (let x = -halfW + 16; x < halfW - 16; x += step) {
      grid.lineBetween(x, -halfH + 12, x, halfH - 12);
    }
    for (let y = -halfH + 16; y < halfH - 16; y += step) {
      grid.lineBetween(-halfW + 12, y, halfW - 12, y);
    }

    this.matContainer.add([matGfx, grid]);

    this.add.circle(this.centerX, this.centerY, Math.min(width * 0.48, 220), 0xfff4e0, 0.04)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3);
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
      this.taskNotice.setText(this.isKintsugiMode ? '✨ ЗОЛОТОЙ ЛАК НАНЕСЕН! ВЕРНИТЕ ДЕТАЛЬ' : 'КЛЕЙ НАНЕСЕН! ВЕРНИТЕ ДЕТАЛЬ');
      this.progressBarFill.width = Math.min(this.scale.width * 0.72, 280);
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
        this.selectTool('tool_glue', 'tex_hd_tool_glue', 'mask_glue', true);
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

    this.kintsugiBanner = this.add.container(width / 2, this.centerY - this.artH * 0.44).setDepth(35);

    const bannerBg = this.add.rectangle(0, 0, width * 0.86, 38, 0x141a26, 0.96)
      .setStrokeStyle(1.5, 0xe2b35b, 0.8);

    const kintsugiBtn = this.add.rectangle(width * 0.43 - 52, 0, 90, 26, 0xd4af37)
      .setStrokeStyle(1, 0xfde047)
      .setInteractive({ useHandCursor: true });

    const kintsugiTxt = this.add.text(width * 0.43 - 52, 0, '✨ КИНЦУГИ', {
      fontSize: '10.5px',
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
      infoTxt.setText(this.isKintsugiMode ? 'Мастерское золото активно!' : 'Золотой шов: +60% к цене');
      if (AudioManager.playClick) AudioManager.playClick();
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
    const taskTitle = task.hint || task.name || 'Очистите артефакт';
    this.taskNotice.setText(`ШАГ ${taskIdx + 1}/${this.artifactData.tasks.length}: ${taskTitle}`);

    this.selectTool(task.requiredTool, `tex_hd_${task.requiredTool}`, task.requiredTool.replace('tool_', 'mask_'), true);

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
      dirtGfx.fillStyle(0x141414, 0.65);
      dirtGfx.fillRect(0, 0, this.artW, this.artH);
      dirtGfx.fillStyle(0x282828, 0.50);
      for (let i = 0; i < 24; i++) {
        dirtGfx.fillCircle(Phaser.Math.Between(20, this.artW - 20), Phaser.Math.Between(20, this.artH - 20), Phaser.Math.Between(14, 32));
      }
    }

    this.dirtLayer.draw(dirtGfx, 0, 0);
    dirtGfx.destroy();
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
