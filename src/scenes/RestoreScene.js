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

    // Фон верстака
    this.add.image(width / 2, height / 2, 'bg_workshop').setDepth(0);

    // Домой
    const homeBtn = this.add.image(36, 36, 'icon_home')
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    homeBtn.on('pointerdown', () => this.scene.start('EraSelectScene'));

    const coins = Storage.getCoins();
    this.add.text(70, 26, `${coins}`, {
      fontSize: '20px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setDepth(20);

    this.createMuteButton(width - 36, 36);

    // Заголовки
    this.add.text(width / 2, 62, displayEraName, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#e67e22',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(20);

    this.add.text(width / 2, 84, this.artifactData.name || 'Артефакт', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5).setDepth(20);

    // Инструкция и подсказка
    this.taskNotice = this.add.text(width / 2, 108, '', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#2ecc71',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(20);

    this.warningNotice = this.add.text(width / 2, 128, '', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#e74c3c',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(20);

    // Габариты предмета
    this.artW = 300;
    this.artH = 400;
    this.centerX = width / 2;
    this.centerY = height * 0.43;
    this.topLeftX = this.centerX - this.artW / 2;
    this.topLeftY = this.centerY - this.artH / 2;

    this.add.ellipse(this.centerX, this.centerY + 160, 260, 45, 0x000000, 0.45).setDepth(1);
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

    // Спрайт инструмента
    this.toolSprite = this.add.image(this.centerX, this.centerY, 'slot_scraper')
      .setOrigin(0.5, 0.95)
      .setScale(0.7)
      .setAlpha(0)
      .setDepth(15);

    // Прогресс-бар (появляется только там, где идет очистка)
    const barWidth = width * 0.72;
    this.progressBg = this.add.rectangle(width / 2, height * 0.70, barWidth, 12, 0x111111).setDepth(10);
    this.progressBar = this.add.rectangle(width / 2 - barWidth / 2, height * 0.70, 0, 12, 0x2ecc71)
      .setOrigin(0, 0.5)
      .setDepth(11);
    this.progressLabel = this.add.text(width / 2, height * 0.70 - 14, '', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#bdc3c7',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    // Лоток инструментов
    this.createToolsTray(height * 0.83);

    // Запуск первого этапа
    this.startTask(0);

    // Сенсорная очистка
    const processScrubbing = (pointer) => {
      if (!pointer.isDown || this.isTaskTransition) return;
      if (pointer.y > height * 0.74) return;

      const currentTask = this.artifactData.tasks[this.currentTaskIndex];
      if (currentTask.type !== 'clean') return; // В режиме склейки ластик выключен

      if (!this.lastTouchPos) {
        this.lastTouchPos = { x: pointer.x, y: pointer.y };
        return;
      }

      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.lastTouchPos.x, this.lastTouchPos.y);
      if (dist < 6) return;

      this.lastTouchPos = { x: pointer.x, y: pointer.y };
      this.toolSprite.setPosition(pointer.x, pointer.y - 10);
      this.toolSprite.setAlpha(1);

      // Проверка логики инструмента
      if (this.activeTool !== currentTask.requiredTool) {
        this.warningNotice.setText(`❌ ${currentTask.hint}`);
        return;
      } else {
        this.warningNotice.setText('');
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

    this.traySlots.forEach(slot => {
      slot.bg.setStrokeStyle(1.5, slot.id === toolId ? 0x2ecc71 : 0x555555);
    });
  }

  startTask(taskIdx) {
    this.currentTaskIndex = taskIdx;
    this.isTaskTransition = false;
    this.cleanedSteps = 0;
    this.warningNotice.setText('');

    const task = this.artifactData.tasks[taskIdx];
    this.taskNotice.setText(`ЭТАП ${taskIdx + 1}/${this.artifactData.tasks.length}: ${task.name.toUpperCase()}`);

    // Автоматически переключаем в руке рекомендуемый инструмент
    const toolMap = {
      tool_scraper: { icon: 'slot_scraper', mask: 'mask_scraper' },
      tool_solvent: { icon: 'slot_solvent', mask: 'mask_solvent' },
      tool_glue: { icon: 'slot_glue', mask: 'mask_glue' },
      tool_brush: { icon: 'slot_brush', mask: 'mask_brush' },
      tool_polish: { icon: 'slot_polish', mask: 'mask_polish' }
    };
    const def = toolMap[task.requiredTool] || toolMap.tool_scraper;
    this.selectTool(task.requiredTool, def.icon, def.mask);

    if (task.type === 'clean') {
      // 1. РЕЖИМ ОЧИСТКИ
      this.progressBg.setVisible(true);
      this.progressBar.setVisible(true);
      this.progressLabel.setVisible(true);
      this.targetSteps = task.target;

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

    } else if (task.type === 'assemble') {
      // 2. РЕЖИМ ИНТЕРАКТИВНОЙ СКЛЕЙКИ (Осколок + Клей)
      this.dirtLayer.clear();
      this.progressBg.setVisible(false);
      this.progressBar.setVisible(false);
      this.progressLabel.setVisible(false);

      this.setupAssemblyMode(task);
    }
  }

  setupAssemblyMode(task) {
    const { width, height } = this.scale;

    // Подсветка целевой зоны трещины
    const targetZone = this.add.circle(this.topLeftX + task.targetX, this.topLeftY + task.targetY, 28, 0xd4af37, 0.3)
      .setStrokeStyle(2, 0xf1c40f, 0.8)
      .setDepth(6);

    this.tweens.add({
      targets: targetZone,
      scale: 1.15,
      alpha: 0.6,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Осколок, лежащий рядом на верстаке
    const shard = this.add.image(width * 0.18, height * 0.58, task.shardTexture)
      .setInteractive({ draggable: true })
      .setDepth(12);

    this.input.setDraggable(shard);

    shard.on('drag', (pointer, dragX, dragY) => {
      shard.x = dragX;
      shard.y = dragY;
    });

    shard.on('dragend', () => {
      const dist = Phaser.Math.
