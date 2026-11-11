import { ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class RestoreScene extends Phaser.Scene {
  constructor() {
    super('RestoreScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const dpr = Math.max(window.devicePixelRatio || 1, 2.5);
    this.dpr = dpr;

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

    let found = ARTIFACT_TEMPLATES.find(t => t.id === reqTemplateId);
    if (!found) {
      const pool = ARTIFACT_TEMPLATES.filter(t => t.regionId === reqRegion);
      found = pool.length > 0 ? pool[0] : ARTIFACT_TEMPLATES[0];
    }
    this.artifactData = found;

    this.isDuplicate = history.some(item => item.templateId === this.artifactData.id);
    if (this.isDuplicate) {
      this.isDuplicate = !(this.activeContract && true);
    }

    if (this.activeContract) {
      this.artifactData.marketValue = this.activeContract.rewardCoins;
    } else if (this.isDuplicate) {
      this.artifactData.marketValue = Math.round((this.artifactData.marketValue || 100) * 0.45);
    }

    if (Storage.setActiveSession) {
      Storage.setActiveSession({
        regionId: reqRegion,
        templateId: this.artifactData.id
      });
    }

    if (AudioManager.playEraMusic) {
      AudioManager.playEraMusic(this.artifactData.regionId || 'egypt');
    }

    this.currentTaskIndex = 0;
    this.currentTaskType = null;
    this.activeTool = null;
    this.activeMaskKey = null;
    this.isTaskTransition = false;
    this.mistakesCount = 0;
    this.isKintsugiMode = false;
    this.hasKintsugiMastery = false;

    // Генерация текстур грязи и HD-инструментов, если не созданы
    this.generateDirtTextures();
    this.generateHDToolTextures();

    // 2. ГЕОМЕТРИЯ ВЕРСТАКА
    const systemTopPad = 0;
    const topBarHeight = 46;
    const infoPanelHeight = 96;
    const headerTotalHeight = systemTopPad + topBarHeight + infoPanelHeight;

    const trayHeight = 90;
    const trayY = height - trayHeight / 2 - 14;
    const trayTopLimit = height - trayHeight - 24;

    const workspaceAvailableHeight = trayTopLimit - headerTotalHeight;
    const artMaxH = Math.round(workspaceAvailableHeight * 0.90);
    this.artW = Math.min(width * 0.78, 350);
    this.artH = Math.min(workspaceAvailableHeight * 0.78, 480);
    this.artH = Math.min(this.artH, artMaxH);

    this.artX = width / 2;
    this.artY = headerTotalHeight + workspaceAvailableHeight / 2;

    this.renderWorkbenchWorkshop(width, height, headerTotalHeight, trayTopLimit);

    // 3. ВЕРХНИЙ БАР (КАЗНА, МЕНЮ, ЗВУК)
    this.add.rectangle(width / 2, systemTopPad + 23, width, 46, 0x07090e, 0.95).setDepth(20);

    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.coinsText = this.add.text(width * 0.06, systemTopPad + 23, `🪙 ${coins}`, {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(22);
    this.coinsText.setResolution(dpr);

    const rightMargin = 14;
    const menuBtn = this.add.rectangle(width - rightMargin - 26, systemTopPad + 23, 52, 28, 0x141a24)
      .setStrokeStyle(1.5, 0x334155, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    const menuTxt = this.add.text(width - rightMargin - 26, systemTopPad + 23, 'Меню', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(22);
    menuTxt.setResolution(dpr);

    menuBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });

    const musicX = width - rightMargin - 26 - 36;
    const musicBtn = this.add.circle(musicX, systemTopPad + 23, 13, 0x141a24)
      .setStrokeStyle(1.2, 0x334155, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    const musicIcon = this.add.text(musicX, systemTopPad + 23, AudioManager.isMusicOn() ? '🎵' : '🔇', {
      fontSize: '11px'
    }).setOrigin(0.5).setDepth(22);
    musicIcon.setResolution(dpr);

    musicBtn.on('pointerdown', (p, lx, ly, ev) => {
      if (ev && ev.stopPropagation) ev.stopPropagation();
      const state = AudioManager.toggleMusic();
      musicIcon.setText(state ? '🎵' : '🔇');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    const sfxX = musicX - 32;
    const sfxBtn = this.add.circle(sfxX, systemTopPad + 23, 13, 0x141a24)
      .setStrokeStyle(1.2, 0x334155, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    const sfxIcon = this.add.text(sfxX, systemTopPad + 23, AudioManager.isSfxOn() ? '🔊' : '🔈', {
      fontSize: '11px'
    }).setOrigin(0.5).setDepth(22);
    sfxIcon.setResolution(dpr);

    sfxBtn.on('pointerdown', (p, lx, ly, ev) => {
      if (ev && ev.stopPropagation) ev.stopPropagation();
      const state = AudioManager.toggleSfx();
      sfxIcon.setText(state ? '🔊' : '🔈');
      if (AudioManager.playClick) AudioManager.playClick();
    });

    // 4. ИНФОРМАЦИОННАЯ ПЛАШКА (ПРОГРЕСС, НАЗВАНИЕ)
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
    let badgeColor = 0x38bdf8;
    if (this.activeContract) {
      badgeText = '📜 СРОЧНЫЙ ЗАКАЗ';
      badgeColor = 0xeab308;
    } else if (this.isDuplicate) {
      badgeText = 'ПОВТОРНАЯ НАХОДКА (-55%)';
      badgeColor = 0x94a3b8;
    }

    const badgeTxt = this.add.text(width / 2, 8, badgeText, {
      fontSize: '10px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#facc15',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5);
    badgeTxt.setResolution(dpr);

    this.artTitle = this.add.text(width / 2, 26, this.artifactData.name || 'Артефакт', {
      fontSize: '16px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.artTitle.setResolution(dpr);

    this.taskNotice = this.add.text(width / 2, 46, '', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#38bdf8'
    }).setOrigin(0.5);
    this.taskNotice.setResolution(dpr);

    const barW = Math.min(width * 0.78, 280);
    this.progressBarBg = this.add.rectangle(width / 2, 64, barW, 6, 0x1e293b);
    this.progressBarFill = this.add.rectangle(width / 2 - barW / 2, 64, 0, 6, 0x10b981).setOrigin(0, 0.5);

    this.toolWarning = this.add.text(width / 2, 80, '', {
      fontSize: '10.5px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.toolWarning.setResolution(dpr);

    artInfoCont.add([badgeTxt, this.artTitle, this.taskNotice, this.progressBarBg, this.progressBarFill, this.toolWarning]);

    // 5. ЗОНА ХОЛСТА АРТЕФАКТА
    this.artContainer = this.add.container(this.artX, this.artY).setDepth(10);

    const tex = this.textures.exists(this.artifactData.textureKey) ? this.artifactData.textureKey : 'art_egypt_scarab';
    this.cleanArt = this.add.image(0, 0, tex).setDisplaySize(this.artW, this.artH);

    this.breakHoleGfx = this.add.graphics().setVisible(false);

    this.dirtLayer = this.add.renderTexture(0, 0, this.artW, this.artH);

    const maskImage = this.make.image({
      x: this.artX,
      y: this.artY,
      key: tex,
      add: false
    });
    maskImage.setDisplaySize(this.artW, this.artH);
    this.dirtLayer.setMask(new Phaser.Display.Masks.BitmapMask(this, maskImage));

    this.artContainer.add([this.cleanArt, this.breakHoleGfx, this.dirtLayer]);

    // Спрайт инструмента на курсоре/пальце
    this.toolSprite = this.add.image(0, 0, 'hd_scraper_2')
      .setDisplaySize(48, 48)
      .setAlpha(0)
      .setDepth(35);

    // Контейнер сборки осколков
    this.assemblyContainer = this.add.container(0, 0).setDepth(18).setVisible(false);

    // Частицы
    this.createRestorationFX();

    // Сетка пикселей очистки
    this.gridCols = 32;
    this.gridRows = 40;
    this.cleanedGrid = new Uint8Array(this.gridCols * this.gridRows);
    this.validCellsMask = new Uint8Array(this.gridCols * this.gridRows);
    this.totalValidCells = 0;

    // Нижняя панель инструментов
    this.createToolsTray(width, dpr);

    // 6. ИНТЕРАКТИВНОСТЬ
    this.input.on('pointerdown', (p) => { this.processInteraction(p); });
    this.input.on('pointermove', (p) => { if (p.isDown) this.processInteraction(p); });
    this.input.on('pointerup', () => {
      this.lastCleanPos = null;
      this.lastTouchPos = null;
      this.tweens.add({
        targets: this.toolSprite,
        alpha: 0,
        duration: 120
      });
    });

    // Старт первой задачи
    this.startTask(0);
  }

  // =========================================================================
  // ТИРЫ ИНСТРУМЕНТОВ ИЗ ЛАВКИ
  // =========================================================================
  getToolTier(toolKey) {
    const rawKey = toolKey.replace('tool_', '');
    if (localStorage.getItem(`tool_upg_${rawKey}_4`) === 'true') return 4;
    if (localStorage.getItem(`tool_upg_${rawKey}_3`) === 'true') return 3;
    if (localStorage.getItem(`tool_upg_${rawKey}_2`) === 'true') return 2;
    return 1;
  }

  // Звук и частицы очистки с учетом тира
  emitToolFX(x, y) {
    if (this.activeTool === 'tool_scraper') {
      const tier = this.getToolTier('tool_scraper');
      AudioManager.playScrub(tier);
      this.particles.setParticleTint(tier >= 4 ? 0x06b6d4 : (tier === 3 ? 0x38bdf8 : 0xd97706));
      this.particles.emitParticleAt(x, y, tier >= 4 ? 4 : 2);
    } else if (this.activeTool === 'tool_brush') {
      const tier = this.getToolTier('tool_brush');
      AudioManager.playBrush(tier);
      this.particles.setParticleTint(tier >= 4 ? 0xa855f7 : 0xe2e8f0);
      this.particles.emitParticleAt(x, y, 3);
    } else if (this.activeTool === 'tool_solvent') {
      const tier = this.getToolTier('tool_solvent');
      AudioManager.playSpray(tier);
      this.particles.setParticleTint(tier >= 4 ? 0x38bdf8 : 0x34d399);
      this.particles.emitParticleAt(x, y, 3);
    } else if (this.activeTool === 'tool_polish') {
      const tier = this.getToolTier('tool_polish');
      AudioManager.playCloth(tier);
      this.particles.setParticleTint(tier >= 4 ? 0xfacc15 : 0xffffff);
      this.particles.emitParticleAt(x, y, 2);
    }
  }

  // Нижняя панель: выбор любого инструмента + подтяжка HD-иконок
  createToolsTray(width, dpr) {
    const getIconKey = (type) => {
      const tier = this.getToolTier(type);
      const raw = type.replace('tool_', '');
      const key = `hd_${raw}_${tier > 1 ? tier : 2}`;
      return this.textures.exists(key) ? key : `tex_hd_${type}`;
    };

    const tools = [
      { id: 'tool_scraper', mask: 'mask_scraper', icon: getIconKey('tool_scraper'), label: 'Скребок' },
      { id: 'tool_brush', mask: 'mask_brush', icon: getIconKey('tool_brush'), label: 'Кисть' },
      { id: 'tool_solvent', mask: 'mask_solvent', icon: getIconKey('tool_solvent'), label: 'Спрей' },
      { id: 'tool_polish', mask: 'mask_polish', icon: getIconKey('tool_polish'), label: 'Замша' }
    ];

    const trayY = this.scale.height - 38;
    this.add.rectangle(width / 2, trayY, width * 0.94, 62, 0x0e131d, 0.95)
      .setStrokeStyle(1.5, 0x273142, 0.9);

    const slotW = (width * 0.90) / tools.length;
    const startX = width * 0.05 + slotW / 2;
    this.traySlots = [];

    tools.forEach((t, i) => {
      const slotX = startX + i * slotW;
      const slotCont = this.add.container(slotX, trayY).setDepth(20);

      const slotWall = this.add.rectangle(0, 0, 56, 48, 0x141a24)
        .setStrokeStyle(1.5, 0x334155, 0.9)
        .setInteractive({ useHandCursor: true });

      const iconTex = this.textures.exists(t.icon) ? t.icon : `tex_hd_${t.id}`;
      const icon = this.add.image(0, -6, iconTex).setDisplaySize(32, 32);

      const lbl = this.add.text(0, 14, t.label, {
        fontSize: '9.5px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#94a3b8',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      lbl.setResolution(dpr);

      // Клик разблокирован: игрок свободен выбирать любой инструмент
      slotWall.on('pointerdown', () => {
        if (AudioManager.playClick) AudioManager.playClick();
        this.selectTool(t.id, t.icon, t.mask, false);
      });

      slotCont.add([slotWall, icon, lbl]);
      this.traySlots.push({ id: t.id, cont: slotCont, bg: slotWall, label: lbl });
    });
  }

  selectTool(toolId, iconKey, maskKey, isAuto = false) {
    this.activeTool = toolId;
    this.activeMaskKey = maskKey;

    if (this.toolSprite) {
      const tex = this.textures.exists(iconKey) ? iconKey : 'hd_scraper_2';
      this.toolSprite.setTexture(tex);
    }

    const currentTask = this.artifactData.tasks[this.currentTaskIndex];
    const isCorrect = (currentTask && currentTask.requiredTool === toolId);

    if (this.traySlots) {
      this.traySlots.forEach(slot => {
        const isSelected = (slot.id === toolId);
        slot.bg.setStrokeStyle(1.5, isSelected ? (isCorrect ? 0x22c55e : 0xeab308) : 0x334155, 0.9);
        slot.bg.setFillStyle(isSelected ? 0x1e293b : 0x141a24);
        slot.label.setColor(isSelected ? '#ffffff' : '#94a3b8');
      });
    }

    if (!isCorrect && !isAuto) {
      this.toolWarning.setText('⚠️ Нужен другой инструмент для этого слоя!');
    } else {
      this.toolWarning.setText('');
    }
  }

  // =========================================================================
  // ОБРАБОТКА ВЗАИМОДЕЙСТВИЯ (ОЧИСТКА ГРЯЗИ)
  // =========================================================================
  processInteraction(pointer) {
    if (this.isTaskTransition) return;

    const currentTask = this.artifactData.tasks[this.currentTaskIndex];
    if (!currentTask) return;

    if (currentTask.type === 'break_and_assemble') {
      return;
    }

    // Проверка правильности инструмента
    if (this.activeTool !== currentTask.requiredTool) {
      if (!this.lastWarnTime || this.time.now - this.lastWarnTime > 800) {
        this.lastWarnTime = this.time.now;
        if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
        this.toolWarning.setText(`⚠️ Нужен инструмент: ${this.getToolName(currentTask.requiredTool)}!`);
        this.mistakesCount++;
        this.cameras.main.shake(100, 0.003);
      }
      return;
    }

    this.toolWarning.setText('');

    // Позиционирование инструмента у пальца
    this.toolSprite.setPosition(pointer.x, pointer.y - 20);
    this.toolSprite.setAlpha(0.9);

    // Координаты относительно центра холста артефакта
    const localX = pointer.x - this.artX;
    const localY = pointer.y - this.artY;

    if (Math.abs(localX) > this.artW / 2 || Math.abs(localY) > this.artH / 2) {
      return;
    }

    // Радиус очистки скейлится от тира инструмента!
    const tier = this.getToolTier(this.activeTool);
    const baseRadius = (this.activeTool === 'tool_scraper') ? 22 : ((this.activeTool === 'tool_brush') ? 28 : 24);
    const eraserRadius = baseRadius + (tier - 1) * 6; // Старшие тиры чистят шире

    // Стираем маску на RenderTexture
    this.dirtLayer.erase(this.activeMaskKey || 'mask_scraper', localX + this.artW / 2, localY + this.artH / 2);
    this.emitToolFX(pointer.x, pointer.y);

    // Расчет прогресса по сетке
    const uX = (localX + this.artW / 2) / this.artW;
    const uY = (localY + this.artH / 2) / this.artH;

    const centerCol = Math.floor(uX * this.gridCols);
    const centerRow = Math.floor(uY * this.gridRows);
    const colRad = Math.ceil((eraserRadius / this.artW) * this.gridCols);
    const rowRad = Math.ceil((eraserRadius / this.artH) * this.gridRows);

    for (let c = Math.max(0, centerCol - colRad); c <= Math.min(this.gridCols - 1, centerCol + colRad); c++) {
      for (let r = Math.max(0, centerRow - rowRad); r <= Math.min(this.gridRows - 1, centerRow + rowRad); r++) {
        const idx = r * this.gridCols + c;
        if (this.validCellsMask[idx] === 1 && this.cleanedGrid[idx] === 0) {
          this.cleanedGrid[idx] = 1;
          this.cleanedCount++;
        }
      }
    }

    const ratio = (this.totalValidCells > 0) ? (this.cleanedCount / this.totalValidCells) : 1;
    const barW = Math.min(this.scale.width * 0.78, 280);
    this.progressBarFill.setSize(barW * Phaser.Math.Clamp(ratio, 0, 1), 6);

    // Задача завершена (порог 90% для комфорта)
    if (ratio >= 0.90 && !this.isTaskTransition) {
      this.isTaskTransition = true;
      this.completeTaskTransition();
    }
  }

  // =========================================================================
  // ПЕРЕХОД МЕЖДУ СЛОЯМИ И ФИНИШ
  // =========================================================================
  startTask(taskIdx) {
    this.currentTaskIndex = taskIdx;
    this.isTaskTransition = false;
    this.cleanedGrid.fill(0);
    this.cleanedCount = 0;
    this.progressBarFill.setSize(0, 6);
    this.toolWarning.setText('');

    const task = this.artifactData.tasks[taskIdx];
    if (!task) return;

    this.currentTaskType = task.type;
    this.taskNotice.setText(`ШАГ ${taskIdx + 1}/${this.artifactData.tasks.length}: ${task.name || 'Очистка'}`);

    // Автовыбор инструмента
    const autoIcon = this.getToolTierIcon(task.requiredTool);
    this.selectTool(task.requiredTool, autoIcon, `mask_${task.requiredTool.replace('tool_', '')}`, true);

    if (task.type === 'break_and_assemble') {
      this.dirtLayer.clear();
      this.setupBreakAndAssembleStage(task);
      return;
    }

    this.assemblyContainer.setVisible(false);
    this.breakHoleGfx.setVisible(false);

    // Формируем слой грязи
    this.buildValidCellsMask(this.artifactData.textureKey);
    this.fillDirtForTask(task.requiredTool);
  }

  completeTaskTransition() {
    if (AudioManager.playCoin) AudioManager.playCoin();

    // Вспышка завершения слоя
    const flash = this.add.rectangle(this.artX, this.artY, this.artW, this.artH, 0xffffff, 0.85).setDepth(25);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 350,
      onComplete: () => flash.destroy()
    });

    if (this.currentTaskIndex < this.artifactData.tasks.length - 1) {
      this.time.delayedCall(300, () => {
        this.startTask(this.currentTaskIndex + 1);
      });
    } else {
      // Все задачи решены — финиш и награда
      this.finishRestoration();
    }
  }

  finishRestoration() {
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

    // Сохранение отреставрированного экспоната в инвентарь музея
    if (Storage.addArtifactToInventory) {
      Storage.addArtifactToInventory({
        instanceId: `art_${Date.now()}`,
        templateId: this.artifactData.id,
        regionId: this.artifactData.regionId,
        name: this.artifactData.name,
        textureKey: this.artifactData.textureKey,
        marketValue: finalPrice,
        stars: earnedStars,
        isKintsugi: this.hasKintsugiMastery
      });
    }

    if (Storage.addHistoryEntry) {
      Storage.addHistoryEntry({
        templateId: this.artifactData.id,
        name: this.artifactData.name,
        date: Date.now()
      });
    }

    // Закрываем активную сессию (чтобы не было залипаний)
    if (Storage.setActiveSession) {
      Storage.setActiveSession(null);
    }

    if (this.activeContract && Storage.completeDailyContract) {
      Storage.completeDailyContract();
    }

    this.time.delayedCall(400, () => {
      this.scene.start('VictoryScene', {
        artifact: this.artifactData,
        stars: earnedStars,
        isDuplicate: this.isDuplicate,
        isContract: !!this.activeContract,
        isKintsugi: this.hasKintsugiMastery
      });
    });
  }

  // =========================================================================
  // МЕХАНИКА ОСКОЛКОВ И КИНЦУГИ
  // =========================================================================
  setupBreakAndAssembleStage(task) {
    this.assemblyContainer.removeAll(true);
    this.assemblyContainer.setVisible(true);

    const holeW = this.artW * 0.45;
    const holeH = this.artH * 0.35;
    const targetX = this.artX;
    const targetY = this.artY;

    this.breakHoleGfx.clear();
    this.breakHoleGfx.setVisible(true);
    this.breakHoleGfx.fillStyle(0x07090e, 0.95);
    this.breakHoleGfx.fillRoundedRect(targetX - holeW / 2, targetY - holeH / 2, holeW, holeH, 12);
    this.breakHoleGfx.lineStyle(2, 0xd97706, 0.8);
    this.breakHoleGfx.strokeRoundedRect(targetX - holeW / 2, targetY - holeH / 2, holeW, holeH, 12);

    const shard = this.add.image(targetX, targetY + 120, this.artifactData.textureKey)
      .setDisplaySize(holeW, holeH)
      .setInteractive({ useHandCursor: true, draggable: true });

    this.input.setDraggable(shard);

    shard.on('drag', (p, dragX, dragY) => {
      shard.setPosition(dragX, dragY);
    });

    shard.on('dragend', () => {
      const dist = Phaser.Math.Distance.Between(shard.x, shard.y, targetX, targetY);
      if (dist < 45) {
        shard.setPosition(targetX, targetY);
        shard.disableInteractive();
        this.breakHoleGfx.clear();

        if (AudioManager.playCoin) AudioManager.playCoin();

        // Проверяем наличие золотого лака Кинцуги
        const lacquer = Storage.getKintsugiLacquer ? Storage.getKintsugiLacquer() : 0;
        if (lacquer > 0) {
          this.showKintsugiChoice(targetX, targetY);
        } else {
          this.time.delayedCall(400, () => this.completeTaskTransition());
        }
      } else {
        this.tweens.add({
          targets: shard,
          x: targetX,
          y: targetY + 120,
          duration: 200,
          ease: 'Back.easeOut'
        });
      }
    });

    this.assemblyContainer.add(shard);
  }

  showKintsugiChoice(x, y) {
    const kCont = this.add.container(x, y + 80).setDepth(30);
    const bg = this.add.rectangle(0, 0, 220, 50, 0x0f172a, 0.95).setStrokeStyle(1.5, 0xfacc15, 0.9);
    const txt = this.add.text(0, 0, '✨ СКРЕПИТЬ КИНЦУГИ (+60%)', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => {
      Storage.addKintsugiLacquer(-1);
      this.hasKintsugiMastery = true;
      if (AudioManager.playShine) AudioManager.playShine();
      kCont.destroy();
      this.completeTaskTransition();
    });

    kCont.add([bg, txt]);
  }

  // =========================================================================
  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ (ГРЯЗЬ, ТЕКСТУРЫ, СТОЛ)
  // =========================================================================
  getToolName(toolId) {
    const names = {
      tool_scraper: 'Скребок',
      tool_brush: 'Кисть',
      tool_solvent: 'Спрей',
      tool_polish: 'Замша'
    };
    return names[toolId] || 'Инструмент';
  }

  getToolTierIcon(toolId) {
    const raw = toolId.replace('tool_', '');
    const tier = this.getToolTier(toolId);
    return `hd_${raw}_${tier > 1 ? tier : 2}`;
  }

  buildValidCellsMask(textureKey) {
    this.validCellsMask.fill(1);
    this.totalValidCells = this.gridCols * this.gridRows;
  }

  fillDirtForTask(toolType) {
    this.dirtLayer.clear();
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    if (toolType === 'tool_scraper') {
      g.fillStyle(0x6e4e25, 0.98);
      g.fillRect(0, 0, this.artW, this.artH);
      g.fillStyle(0x422e12, 0.90);
      for (let i = 0; i < 35; i++) {
        g.fillCircle(Phaser.Math.Between(10, this.artW - 10), Phaser.Math.Between(10, this.artH - 10), Phaser.Math.Between(12, 28));
      }
    } else if (toolType === 'tool_brush') {
      g.fillStyle(0xa89f81, 0.94);
      g.fillRect(0, 0, this.artW, this.artH);
      g.fillStyle(0x736c56, 0.75);
      for (let i = 0; i < 30; i++) {
        g.fillCircle(Phaser.Math.Between(10, this.artW - 10), Phaser.Math.Between(10, this.artH - 10), Phaser.Math.Between(8, 22));
      }
    } else if (toolType === 'tool_solvent') {
      g.fillStyle(0x234d35, 0.94);
      g.fillRect(0, 0, this.artW, this.artH);
      g.fillStyle(0x367053, 0.80);
      for (let i = 0; i < 26; i++) {
        g.fillCircle(Phaser.Math.Between(10, this.artW - 10), Phaser.Math.Between(10, this.artH - 10), Phaser.Math.Between(15, 30));
      }
    } else {
      g.fillStyle(0x141414, 0.65);
      g.fillRect(0, 0, this.artW, this.artH);
      g.fillStyle(0x282828, 0.50);
      for (let i = 0; i < 20; i++) {
        g.fillCircle(Phaser.Math.Between(10, this.artW - 10), Phaser.Math.Between(10, this.artH - 10), Phaser.Math.Between(10, 24));
      }
    }

    this.dirtLayer.draw(g, 0, 0);
    g.destroy();
  }

  generateDirtTextures() {
    const createMask = (key, rad) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(rad, rad, rad);
      g.generateTexture(key, rad * 2, rad * 2);
      g.destroy();
    };

    createMask('mask_scraper', 24);
    createMask('mask_brush', 30);
    createMask('mask_solvent', 26);
    createMask('mask_polish', 24);
  }

  generateHDToolTextures() {
    const s = 96;
    const drawItem = (key, drawFn) => {
      if (this.textures.exists(key)) return;
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      drawFn(gfx, s);
      gfx.generateTexture(key, s, s);
      gfx.destroy();
    };

    drawItem('hd_scraper_2', (g, s) => {
      g.fillStyle(0x78350f, 1);
      g.fillRect(s * 0.44, s * 0.45, s * 0.12, s * 0.48);
      g.fillStyle(0xd97706, 1);
      g.fillTriangle(s * 0.5, s * 0.12, s * 0.18, s * 0.46, s * 0.82, s * 0.46);
    });

    drawItem('hd_scraper_3', (g, s) => {
      g.fillStyle(0x334155, 1);
      g.fillRoundedRect(s * 0.42, s * 0.38, s * 0.16, s * 0.55, 4);
      g.fillStyle(0xe2e8f0, 1);
      g.fillTriangle(s * 0.5, s * 0.08, s * 0.72, s * 0.38, s * 0.5, s * 0.38);
    });

    drawItem('hd_scraper_4', (g, s) => {
      g.fillStyle(0x0f172a, 1);
      g.fillRoundedRect(s * 0.40, s * 0.30, s * 0.20, s * 0.60, 6);
      g.fillStyle(0x38bdf8, 1);
      g.fillTriangle(s * 0.5, s * 0.06, s * 0.38, s * 0.28, s * 0.62, s * 0.28);
    });

    drawItem('hd_brush_2', (g, s) => {
      g.fillStyle(0x9a3412, 1);
      g.fillRect(s * 0.45, s * 0.42, s * 0.10, s * 0.52);
      g.fillStyle(0xd97706, 1);
      g.fillCircle(s * 0.50, s * 0.22, s * 0.18);
    });

    drawItem('hd_brush_3', (g, s) => {
      g.fillStyle(0x1e293b, 1);
      g.fillRect(s * 0.46, s * 0.44, s * 0.08, s * 0.50);
      g.fillStyle(0xf1f5f9, 0.95);
      g.fillTriangle(s * 0.5, s * 0.38, s * 0.15, s * 0.14, s * 0.85, s * 0.14);
    });

    drawItem('hd_brush_4', (g, s) => {
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(s * 0.36, s * 0.32, s * 0.28, s * 0.60, 4);
      g.fillStyle(0xfacc15, 1);
      g.fillRect(s * 0.44, s * 0.16, s * 0.12, s * 0.18);
    });

    drawItem('hd_solvent_2', (g, s) => {
      g.fillStyle(0x065f46, 1);
      g.fillRoundedRect(s * 0.32, s * 0.32, s * 0.36, s * 0.56, 8);
    });

    drawItem('hd_solvent_3', (g, s) => {
      g.fillStyle(0x581c87, 0.9);
      g.fillTriangle(s * 0.5, s * 0.20, s * 0.84, s * 0.82, s * 0.16, s * 0.82);
    });

    drawItem('hd_solvent_4', (g, s) => {
      g.fillStyle(0x475569, 1);
      g.fillRoundedRect(s * 0.38, s * 0.26, s * 0.24, s * 0.64, 4);
      g.fillStyle(0x0284c7, 1);
      g.fillCircle(s * 0.5, s * 0.22, s * 0.16);
    });

    drawItem('hd_polish_2', (g, s) => {
      g.fillStyle(0xd97706, 1);
      g.fillRoundedRect(s * 0.26, s * 0.36, s * 0.48, s * 0.36, 12);
    });

    drawItem('hd_polish_3', (g, s) => {
      g.fillStyle(0x15803d, 1);
      g.fillRect(s * 0.22, s * 0.34, s * 0.56, s * 0.38);
    });

    drawItem('hd_polish_4', (g, s) => {
      g.fillStyle(0x0284c7, 1);
      g.fillRect(s * 0.38, s * 0.28, s * 0.24, s * 0.48);
      g.fillStyle(0xfacc15, 1);
      g.fillTriangle(s * 0.5, s * 0.04, s * 0.42, s * 0.12, s * 0.58, s * 0.12);
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

  renderWorkbenchWorkshop(width, height, topBound, botBound) {
    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;
    const bg = this.add.graphics().setDepth(1);

    const colors = {
      1: { fill: 0x0f172a, stroke: 0x1e293b },
      2: { fill: 0x1c1917, stroke: 0x44403c },
      3: { fill: 0x064e3b, stroke: 0x047857 },
      4: { fill: 0x090d16, stroke: 0xca8a04 }
    };

    const c = colors[tier] || colors[1];
    bg.fillStyle(c.fill, 1);
    bg.fillRect(0, topBound, width, botBound - topBound);
    bg.lineStyle(2, c.stroke, 0.8);
    bg.strokeRect(10, topBound + 6, width - 20, botBound - topBound - 12);
  }
}
