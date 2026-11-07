import { ARTIFACTS } from '../data/artifacts.js';
import { TOOLS } from '../data/tools.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { YandexSDK } from '../utils/YandexSDK.js';

export class RestoreScene extends Phaser.Scene {
  constructor() {
    super('RestoreScene');
  }

  create() {
    const { width, height } = this.scale;
    const currentIdx = Storage.getCurrentLevelIndex();
    this.artifactData = ARTIFACTS[currentIdx] || ARTIFACTS[0];

    this.currentPhaseIndex = 0;
    this.startTime = performance.now();
    this.lastTouchPos = null;

    // Энергия бустера: 0..100%
    this.boosterEnergy = 0;
    this.maxBoosterEnergy = 100;

    // Фон рабочей зоны
    this.add.rectangle(width / 2, height / 2, width, height, 0x141210);

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
    this.add.text(width / 2, 68, this.artifactData.eraName.toUpperCase(), {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#e67e22',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.add.text(width / 2, 92, this.artifactData.name, {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    this.phaseText = this.add.text(width / 2, 118, '', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#2ecc71',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Габариты холста (HD 300x400)
    this.artW = 300;
    this.artH = 400;
    this.centerX = width / 2;
    this.centerY = height / 2 + 25;
    this.topLeftX = this.centerX - this.artW / 2;
    this.topLeftY = this.centerY - this.artH / 2;

    this.cleanArt = this.add.image(this.centerX, this.centerY, this.artifactData.textureKey);
    this.dirtLayer = this.add.renderTexture(this.topLeftX, this.topLeftY, this.artW, this.artH).setOrigin(0, 0);

    // Частицы
    this.particles = this.add.particles(0, 0, 'particle_dust', {
      lifespan: { min: 250, max: 450 },
      speed: { min: 60, max: 140 },
      scale: { start: 1.2, end: 0 },
      emitting: false
    });

    // Инструмент
    this.toolSprite = this.add.image(this.centerX, this.centerY, 'tool_brush_basic');
    this.toolSprite.setOrigin(0.5, 0.95);
    this.toolSprite.setAlpha(0);

    // Прогресс-бар внизу
    const barWidth = width * 0.7;
    this.add.rectangle(width / 2, height - 55, barWidth, 14, 0x111111);
    this.progressBar = this.add.rectangle(width / 2 - barWidth / 2, height - 55, 0, 14, 0x2ecc71).setOrigin(0, 0.5);

    // Кнопка Ультразвукового Бустера с шкалой энергии вокруг
    this.createBoosterUI(width - 45, height - 120);

    // Инициализация фазы
    this.startPhase(0);

    // Стирание: ТОЛЬКО ПРИ ДВИЖЕНИИ (устраняет чит с удержанием пальца)
    const processScrubbing = (pointer) => {
      if (!pointer.isDown || this.isPhaseTransition) return;

      if (!this.lastTouchPos) {
        this.lastTouchPos = { x: pointer.x, y: pointer.y };
        return;
      }

      // Вычисляем пройденную дистанцию
      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.lastTouchPos.x, this.lastTouchPos.y);
      if (dist < 6) {
        // Палец почти на месте — прогресс не начисляется
        return;
      }

      this.lastTouchPos = { x: pointer.x, y: pointer.y };

      this.toolSprite.setPosition(pointer.x, pointer.y - 15);
      this.toolSprite.setAlpha(1);

      const dx = pointer.x - pointer.prevPosition.x;
      this.toolSprite.setAngle(Phaser.Math.Clamp(dx * 2.5, -20, 20));

      const localX = pointer.x - this.topLeftX;
      const localY = pointer.y - this.topLeftY;

      if (localX >= 0 && localX <= this.artW && localY >= 0 && localY <= this.artH) {
        this.dirtLayer.erase(this.activeMaskKey, localX, localY);
        this.cleanedPixels += this.stepWeight;

        // Накопление заряда энергии бустера от реального труда
        if (this.boosterEnergy < this.maxBoosterEnergy) {
          this.boosterEnergy = Math.min(this.boosterEnergy + 0.35, this.maxBoosterEnergy);
          this.updateBoosterUI();
        }

        if (this.currentPhaseIndex === 0) AudioManager.playScrub();
        else if (this.currentPhaseIndex === 1) AudioManager.playWash();
        else AudioManager.playCloth();

        if (navigator.vibrate && Math.random() < 0.2) {
          navigator.vibrate(8);
        }

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

  createBoosterUI(x, y) {
    this.boosterBg = this.add.circle(x, y, 26, 0x221d19).setStrokeStyle(3, 0x444444);
    this.boosterBtn = this.add.image(x, y, 'icon_booster').setScale(0.85).setInteractive({ useHandCursor: true });
    this.boosterEnergyGfx = this.add.graphics();
    this.boosterEnergyText = this.add.text(x, y + 36, '0%', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#bdc3c7',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.updateBoosterUI();

    this.boosterBtn.on('pointerdown', () => {
      if (this.isPhaseTransition) return;

      // Если заряжен — применяем
      if (this.boosterEnergy >= this.maxBoosterEnergy) {
        this.activateBooster();
      } else {
        // Если энергии мало — предлагаем зарядить за просмотр рекламы
        YandexSDK.showRewardedVideo({
          onRewarded: () => {
            this.boosterEnergy = this.maxBoosterEnergy;
            this.activateBooster();
          }
        });
      }
    });
  }

  updateBoosterUI() {
    const pct = Math.floor((this.boosterEnergy / this.maxBoosterEnergy) * 100);
    this.boosterEnergyText.setText(pct >= 100 ? 'ГОТОВ' : `${pct}%`);
    this.boosterEnergyText.setColor(pct >= 100 ? '#2ecc71' : '#bdc3c7');

    this.boosterEnergyGfx.clear();
    const x = this.boosterBtn.x;
    const y = this.boosterBtn.y;

    if (pct >= 100) {
      this.boosterBg.setStrokeStyle(3, 0x2ecc71);
      this.boosterBtn.setAlpha(1);
    } else {
      this.boosterBg.setStrokeStyle(3, 0x444444);
      this.boosterBtn.setAlpha(0.6);

      // Дуга заполнения энергии вокруг кнопки
      this.boosterEnergyGfx.lineStyle(3, 0x9b59b6, 1);
      this.boosterEnergyGfx.beginPath();
      this.boosterEnergyGfx.arc(
        x,
        y,
        26,
        Phaser.Math.DegToRad(-90),
        Phaser.Math.DegToRad(-90 + (360 * (this.boosterEnergy / this.maxBoosterEnergy))),
        false
      );
      this.boosterEnergyGfx.strokePath();
    }
  }

  activateBooster() {
    this.boosterEnergy = 0;
    this.updateBoosterUI();

    AudioManager.playPulse();
    if (navigator.vibrate) navigator.vibrate([40, 60, 80]);

    const wave = this.add.circle(this.centerX, this.centerY, 20, 0x9b59b6, 0.7);
    wave.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: wave,
      radius: 240,
      alpha: 0,
      duration: 450,
      ease: 'Cubic.easeOut',
      onComplete: () => wave.destroy()
    });

    const boostAmount = Math.round(this.totalStepsTarget * 0.40);
    this.cleanedPixels += boostAmount;

    for (let i = 0; i < 10; i++) {
      this.dirtLayer.erase(
        'brush_mask_gold',
        Phaser.Math.Between(25, this.artW - 25),
        Phaser.Math.Between(25, this.artH - 25)
      );
    }

    this.updateProgress();
  }

  startPhase(phaseIdx) {
    this.currentPhaseIndex = phaseIdx;
    this.isPhaseTransition = false;
    this.cleanedPixels = 0;

    const phase = this.artifactData.phases[phaseIdx];
    this.phaseText.setText(`ЭТАП ${phaseIdx + 1}/3: ${phase.name.toUpperCase()}`);
    this.totalStepsTarget = phase.targetSteps;

    // Скорость и вес шагов под каждую фазу
    if (phaseIdx === 0) {
      // Фаза 1: грубая, вязкая очистка
      const equippedToolId = Storage.getEquippedTool();
      const tool = TOOLS.find(t => t.id === equippedToolId) || TOOLS[0];
      this.toolSprite.setTexture(tool.textureKey);
      this.activeMaskKey = tool.maskKey;
      this.stepWeight = Math.max(1, Math.round(tool.brushRadius / 35));
    } else if (phaseIdx === 1) {
      // Фаза 2: губка — средняя скорость
      this.toolSprite.setTexture('tool_sponge');
      this.activeMaskKey = 'brush_mask_wide';
      this.stepWeight = 2;
    } else {
      // Фаза 3: финишная замша — быстрая полировка
      this.toolSprite.setTexture('tool_cloth');
      this.activeMaskKey = 'brush_mask_gold';
      this.stepWeight = 3;
    }

    this.dirtLayer.clear();
    const dirtGfx = this.make.graphics({ x: 0, y: 0, add: false });
    dirtGfx.fillStyle(phase.color, phaseIdx === 2 ? 0.75 : 0.96);
    dirtGfx.fillRect(0, 0, this.artW, this.artH);

    dirtGfx.fillStyle(phase.spots, 0.92);
    for (let i = 0; i < 24; i++) {
      dirtGfx.fillCircle(
        Phaser.Math.Between(20, this.artW - 20),
        Phaser.Math.Between(20, this.artH - 20),
        Phaser.Math.Between(15, 55)
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
            this.time.delayedCall(300, () => {
              this.startPhase(this.currentPhaseIndex + 1);
            });
          } else {
            AudioManager.playShine();

            const elapsedSeconds = (performance.now() - this.startTime) / 1000;
            let stars = 3;
            if (elapsedSeconds > 60) stars = 1;
            else if (elapsedSeconds > 35) stars = 2;

            this.time.delayedCall(350, () => {
              this.scene.start('VictoryScene', { 
                artifact: this.artifactData,
                stars: stars
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
