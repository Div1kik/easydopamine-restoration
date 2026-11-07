import { ARTIFACTS } from '../data/artifacts.js';
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

    this.currentTaskIndex = 0;
    this.activeTool = 'tool_scraper'; // По умолчанию в руке скребок
    this.lastTouchPos = null;

    // 1. Фон мастерской с мягким теплым светом
    this.add.image(width / 2, height / 2, 'bg_workshop');

    // Верхняя панель
    const homeBtn = this.add.image(36, 36, 'icon_home').setInteractive({ useHandCursor: true });
    homeBtn.on('pointerdown', () => this.scene.start('EraSelectScene'));

    const coins = Storage.getCoins();
    this.add.text(70, 26, `${coins}`, {
      fontSize: '20px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    });

    this.createMuteButton(width - 36, 36);

    // Заголовки
    this.add.text(width / 2, 65, this.artifactData.eraName.toUpperCase(), {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#e67e22',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.add.text(width / 2, 88, this.artifactData.name, {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Подсказка задачи
    this.taskNotice = this.add.text(width / 2, 114, '', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#2ecc71',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Габариты предмета
    this.artW = 300;
    this.artH = 400;
    this.centerX = width / 2;
    this.centerY = height * 0.43;
    this.topLeftX = this.centerX - this.artW / 2;
    this.topLeftY = this.centerY - this.artH / 2;

    // Мягкая тень под артефактом
    this.add.ellipse(this.centerX, this.centerY + 160, 260, 45, 0x000000, 0.45);

    // Чистый базовый артефакт
    this.cleanArt = this.add.image(this.centerX, this.centerY, this.artifactData.textureKey);

    // Слой грязи
    this.dirtLayer = this.add.renderTexture(this.topLeftX, this.topLeftY, this.artW, this.artH).setOrigin(0, 0);

    // ГРЯЗЬ СТРОГО НА ПРЕДМЕТЕ: создаем маску по альфа-каналу чистого предмета
    const maskImage = this.make.image({
      x: this.centerX,
      y: this.centerY,
      key: this.artifactData.textureKey,
      add: false
    });
    const artMask = maskImage.createBitmapMask();
    this.dirtLayer.setMask(artMask);

    // Частицы
    this.particles = this.add.particles(0, 0, 'particle_dust', {
      lifespan: { min: 250, max: 450 },
      speed: { min: 60, max: 140 },
      scale: { start: 1.2, end: 0 },
      emitting: false
    });

    // Видимый инструмент под пальцем
    this.toolSprite = this.add.image(this.centerX, this.centerY, 'slot_scraper');
    this.toolSprite.setOrigin(0.5, 0.95);
    this.toolSprite.setScale(0.7);
    this.toolSprite.setAlpha(0);

    // Прогресс-бар текущей задачи
    const barWidth = width * 0.72;
    this.add.rectangle(width / 2, height * 0.70, barWidth, 12, 0x111111);
    this.progressBar = this.add.rectangle(width / 2 - barWidth / 2, height * 0.70, 0, 12, 0x2ecc71).setOrigin(0, 0.5);

    // 2. ИНТЕРАКТИВНЫЙ ЛОТОК ИНСТРУМЕНТОВ ВНИЗУ
    this.createToolsTray(height * 0.83);

    // Инициализация первой задачи
    this.startTask(0);

    // Стирание с проверкой соответствия инструмента
    const processScrubbing = (pointer) => {
      if (!pointer.isDown || this.isTaskTransition) return;

      if (!this.lastTouchPos) {
        this.lastTouchPos = { x: pointer.x, y: pointer.y };
        return;
      }

      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.lastTouchPos.x, this.lastTouchPos.y);
      if (dist < 6) return; // Исключаем чит удержания пальца

      this.lastTouchPos = { x: pointer.x, y: pointer.y };
      this.toolSprite.setPosition(pointer.x, pointer.y - 10);
      this.toolSprite.setAlpha(1);

      const localX = pointer.x - this.topLeftX;
      const localY = pointer.y - this.topLeftY;

      if (localX >= 0 && localX <= this.artW && localY >= 0 && localY <= this.artH) {
        const currentTask = this.artifactData.tasks[this.currentTaskIndex];
        const isCorrectTool = (this.activeTool === currentTask.requiredTool);

        // Если инструмент неправильный — скорость стирания минимальна
        const effectiveStep = isCorrectTool ? 2 : 0.3;

        this.dirtLayer.erase(this.activeMaskKey, localX, localY);
        this.cleanedSteps += effectiveStep;

        if (isCorrectTool) {
          if (this.activeTool === 'tool_scraper') AudioManager.playScrub();
          else if (this.activeTool === 'tool_solvent') AudioManager.playWash();
          else AudioManager.playCloth();

          if (navigator.vibrate && Math.random() < 0.2) navigator.vibrate(8);
          this.particles.emitParticleAt(pointer.x, pointer.y, 2);
        }

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

    // Подложка лотка
    this.add.rectangle(width / 2, trayY + 15, width * 0.94, 90, 0x1a1613, 0.9)
      .setStrokeStyle(1.5, 0x444444);

    const stepX = (width * 0.90) / tools.length;
    const startX = width * 0.05 + stepX / 2;

    this.traySlots = [];

    tools.forEach((t, i) => {
      const slotX = startX + i * stepX;
      const slotBg = this.add.rectangle(slotX, trayY + 10, 52, 60, 0x241e1a)
        .setStrokeStyle(1.5, t.id === this.activeTool ? 0x2ecc71 : 0x555555)
        .setInteractive({ useHandCursor: true });

      const icon = this.add.image(slotX, trayY + 5, t.icon).setScale(0.55);
      const label = this.add.text(slotX, trayY + 44, t.label, {
        fontSize: '9px',
        fontFamily: 'sans-serif',
        color: '#bdc3c7'
      }).setOrigin(0.5);

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

    const task = this.artifactData.tasks[taskIdx];
    this.taskNotice.setText(`ШАГ ${taskIdx + 1}/${this.artifactData.tasks.length}: ${task.name.toUpperCase()}`);
    this.targetSteps = task.target;

    // Автовыбор скребка при старте
    this.selectTool('tool_scraper', 'slot_scraper', 'mask_scraper');

    // Заливаем грязь под текущую задачу
    this.dirtLayer.clear();
    const dirtGfx = this.make.graphics({ x: 0, y: 0, add: false });
    dirtGfx.fillStyle(task.color, 0.95);
    dirtGfx.fillRect(0, 0, this.artW, this.artH);

    dirtGfx.fillStyle(0x111111, 0.4);
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
    this.progressBar.width = ratio * maxWidth;

    if (ratio >= 1 && !this.isTaskTransition) {
      this.isTaskTransition = true;
      this.toolSprite.setAlpha(0);
      this.dirtLayer.clear();

      AudioManager.playCoin();

      const flash = this.add.rectangle(
        this.cleanArt.x,
        this.cleanArt.y,
        this.cleanArt.width,
        this.cleanArt.height,
        0xffffff,
        0.85
      );
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
  }

  createMuteButton(x, y) {
    const btn = this.add.image(x, y, 'icon_speaker').setInteractive({ useHandCursor: true });
    const line = this.add.line(0, 0, x - 12, y - 12, x + 12, y + 12, 0xe74c3c, 3).setOrigin(0);

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
