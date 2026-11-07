import { ARTIFACTS } from '../data/artifacts.js';
import { TOOLS } from '../data/tools.js';
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

    // Текущая активная фаза (0, 1 или 2)
    this.currentPhaseIndex = 0;

    // Фон рабочей зоны
    this.add.rectangle(width / 2, height / 2, width, height, 0x1f1b18);

    // Домой
    const homeBtn = this.add.image(36, 36, 'icon_home').setInteractive({ useHandCursor: true });
    homeBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    // Монеты
    const coins = Storage.getCoins();
    this.coinsText = this.add.text(70, 26, `${coins}`, {
      fontSize: '20px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    });

    // Mute
    this.createMuteButton(width - 36, 36);

    // Заголовки
    this.add.text(width / 2, 70, this.artifactData.eraName.toUpperCase(), {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#e67e22',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.add.text(width / 2, 96, this.artifactData.name, {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Подзаголовок текущей фазы
    this.phaseText = this.add.text(width / 2, 122, '', {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#2ecc71',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Габариты холста
    this.artW = 300;
    this.artH = 400;
    this.centerX = width / 2;
    this.centerY = height / 2 + 25;
    this.topLeftX = this.centerX - this.artW / 2;
    this.topLeftY = this.centerY - this.artH / 2;

    // Базовый чистый артефакт
    this.cleanArt = this.add.image(this.centerX, this.centerY, this.artifactData.textureKey);

    // Слой грязи RenderTexture
    this.dirtLayer = this.add.renderTexture(this.topLeftX, this.topLeftY, this.artW, this.artH).setOrigin(0, 0);

    // Частицы
    this.particles = this.add.particles(0, 0, 'particle_dust', {
      lifespan: { min: 250, max: 450 },
      speed: { min: 60, max: 140 },
      scale: { start: 1.2, end: 0 },
      emitting: false
    });

    // Спрайт инструмента
    this.toolSprite = this.add.image(this.centerX, this.centerY, 'tool_brush_basic');
    this.toolSprite.setOrigin(0.5, 0.95);
    this.toolSprite.setAlpha(0);

    // Прогресс-бар внизу
    const barWidth = width * 0.7;
    this.add.rectangle(width / 2, height - 55, barWidth, 14, 0x111111);
    this.progressBar = this.add.rectangle(width / 2 - barWidth / 2, height - 55, 0, 14, 0x2ecc71).setOrigin(0, 0.5);

    // Инициализация первой фазы
    this.startPhase(0);

    // Обработка касаний
    const processScrubbing = (pointer) => {
      if (!pointer.isDown || this.isPhaseTransition) return;

      this.toolSprite.setPosition(pointer.x, pointer.y - 15);
      this.toolSprite.setAlpha(1);

      const dx = pointer.x - pointer.prevPosition.x;
      this.toolSprite.setAngle(Phaser.Math.Clamp(dx * 2.5, -20, 20));

      const localX = pointer.x - this.topLeftX;
      const localY = pointer.y - this.topLeftY;

      if (localX >= 0 && localX <= this.artW && localY >= 0 && localY <= this.artH) {
        this.dirtLayer.erase(this.activeMaskKey, localX, localY);
        this.cleanedPixels += this.stepWeight;

        // Звук в зависимости от фазы
        if (this.currentPhaseIndex === 0) AudioManager.playScrub();
        else if (this.currentPhaseIndex === 1) AudioManager.playWash();
        else AudioManager.playCloth();

        if (navigator.vibrate && Math.random() < 0.25) {
          navigator.vibrate(8);
        }

        this.particles.emitParticleAt(pointer.x, pointer.y, 2);
        this.updateProgress();
      }
    };

    this.input.on('pointerdown', processScrubbing);
    this.input.on('pointermove', processScrubbing);
    this.input.on('pointerup', () => this.toolSprite.setAlpha(0));
  }

  startPhase(phaseIdx) {
    this.currentPhaseIndex = phaseIdx;
    this.isPhaseTransition = false;
    this.cleanedPixels = 0;

    const phase = this.artifactData.phases[phaseIdx];
    this.phaseText.setText(`ЭТАП ${phaseIdx + 1}/3: ${phase.name.toUpperCase()}`);
    this.totalStepsTarget = phase.targetSteps;

    // Подбор инструмента и маски под фазу
    if (phaseIdx === 0) {
      const equippedToolId = Storage.getEquippedTool();
      const tool = TOOLS.find(t => t.id === equippedToolId) || TOOLS[0];
      this.toolSprite.setTexture(tool.textureKey);
      this.activeMaskKey = tool.maskKey;
      this.stepWeight = Math.round(tool.brushRadius / 25);
    } else if (phaseIdx === 1) {
      this.toolSprite.setTexture('tool_sponge');
      this.activeMaskKey = 'brush_mask_wide';
      this.stepWeight = 2;
    } else {
      this.toolSprite.setTexture('tool_cloth');
      this.activeMaskKey = 'brush_mask_gold';
      this.stepWeight = 3;
    }

    // Заливка слоя грязи под текущую фазу
    this.dirtLayer.clear();
    const dirtGfx = this.make.graphics({ x: 0, y: 0, add: false });
    dirtGfx.fillStyle(phase.color, phaseIdx === 2 ? 0.75 : 0.95);
    dirtGfx.fillRect(0, 0, this.artW, this.artH);

    dirtGfx.fillStyle(phase.spots, 0.9);
    for (let i = 0; i < 22; i++) {
      dirtGfx.fillCircle(
        Phaser.Math.Between(25, this.artW - 25),
        Phaser.Math.Between(25, this.artH - 25),
        Phaser.Math.Between(15, 50)
      );
    }
    this.dirtLayer.draw(dirtGfx, 0, 0);
    dirtGfx.destroy();

    this.particles.setParticleTint(phase.color);
    this.updateProgress();
  }

  updateProgress() {
    const ratio = Math.min(this.cleanedPixels / this.totalStepsTarget, 1);
    const maxWidth = this.scale.width * 0.7;
    this.progressBar.width = ratio * maxWidth;

    if (ratio >= 1 && !this.isPhaseTransition) {
      this.isPhaseTransition = true;
      this.toolSprite.setAlpha(0);
      this.dirtLayer.clear();

      AudioManager.playCoin();

      // Волна блеска
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

          if (this.currentPhaseIndex < 2) {
            // Переход к следующей фазе реставрации
            this.time.delayedCall(300, () => {
              this.startPhase(this.currentPhaseIndex + 1);
            });
          } else {
            // Все 3 фазы пройдены — триумф!
            this.time.delayedCall(350, () => {
              this.scene.start('VictoryScene', { artifact: this.artifactData });
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
