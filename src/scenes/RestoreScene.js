import { ARTIFACTS } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';

export class RestoreScene extends Phaser.Scene {
  constructor() {
    super('RestoreScene');
  }

  create() {
    const { width, height } = this.scale;
    const currentIdx = Storage.getCurrentLevelIndex();
    this.artifactData = ARTIFACTS[currentIdx] || ARTIFACTS[0];

    // Фон рабочей зоны
    this.add.rectangle(width / 2, height / 2, width, height, 0x1f1b18);

    // Верхний интерфейс
    const coins = Storage.getCoins();
    this.coinsText = this.add.text(24, 28, `Золото: ${coins}`, {
      fontSize: '20px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    });

    // Заголовки
    this.add.text(width / 2, 70, this.artifactData.eraName.toUpperCase(), {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#e67e22',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.add.text(width / 2, 98, this.artifactData.name, {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Размеры и координаты
    const artW = 300;
    const artH = 400;
    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const topLeftX = centerX - artW / 2;
    const topLeftY = centerY - artH / 2;

    // Чистый артефакт
    this.cleanArt = this.add.image(centerX, centerY, this.artifactData.textureKey);

    // Слой загрязнения
    this.dirtLayer = this.add.renderTexture(topLeftX, topLeftY, artW, artH).setOrigin(0, 0);

    const dirtGfx = this.make.graphics({ x: 0, y: 0, add: false });
    dirtGfx.fillStyle(this.artifactData.dirtColor, 0.96);
    dirtGfx.fillRect(0, 0, artW, artH);

    dirtGfx.fillStyle(this.artifactData.dirtSpots, 0.95);
    for (let i = 0; i < 20; i++) {
      dirtGfx.fillCircle(
        Phaser.Math.Between(25, artW - 25),
        Phaser.Math.Between(25, artH - 25),
        Phaser.Math.Between(20, 55)
      );
    }
    this.dirtLayer.draw(dirtGfx, 0, 0);
    dirtGfx.destroy();

    // Эмиттер частиц пыли (под цвет грязи)
    this.particles = this.add.particles(0, 0, 'particle_dust', {
      lifespan: { min: 250, max: 450 },
      speed: { min: 60, max: 140 },
      scale: { start: 1.2, end: 0 },
      tint: this.artifactData.dirtColor,
      emitting: false
    });

    // Инструмент в руках игрока (смещен чуть выше пальца для видимости)
    this.toolSprite = this.add.image(centerX, centerY, 'tool_brush');
    this.toolSprite.setOrigin(0.5, 0.95);
    this.toolSprite.setScale(0.8);
    this.toolSprite.setAlpha(0); // Появляется только при касании

    // Прогресс
    this.cleanedPixels = 0;
    this.totalStepsTarget = 240;
    this.isCompleted = false;

    // Прогресс-бар
    const barWidth = width * 0.7;
    this.add.rectangle(width / 2, height - 60, barWidth, 14, 0x111111);
    this.progressBar = this.add.rectangle(width / 2 - barWidth / 2, height - 60, 0, 14, 0x2ecc71).setOrigin(0, 0.5);

    // Логика стирания
    const processScrubbing = (pointer) => {
      if (!pointer.isDown || this.isCompleted) return;

      this.toolSprite.setPosition(pointer.x, pointer.y - 15);
      this.toolSprite.setAlpha(1);

      // Легкий наклон инструмента в сторону движения
      const dx = pointer.x - pointer.prevPosition.x;
      this.toolSprite.setAngle(Phaser.Math.Clamp(dx * 2.5, -20, 20));

      const localX = pointer.x - topLeftX;
      const localY = pointer.y - topLeftY;

      if (localX >= 0 && localX <= artW && localY >= 0 && localY <= artH) {
        this.dirtLayer.erase('brush', localX, localY);
        this.cleanedPixels++;

        // Выброс частиц из-под кончика кисти
        this.particles.emitParticleAt(pointer.x, pointer.y, 2);
        this.updateProgress();
      }
    };

    this.input.on('pointerdown', (pointer) => {
      processScrubbing(pointer);
    });

    this.input.on('pointermove', (pointer) => {
      processScrubbing(pointer);
    });

    this.input.on('pointerup', () => {
      this.toolSprite.setAlpha(0);
    });
  }

  updateProgress() {
    const ratio = Math.min(this.cleanedPixels / this.totalStepsTarget, 1);
    const maxWidth = this.scale.width * 0.7;
    this.progressBar.width = ratio * maxWidth;

    if (ratio >= 1 && !this.isCompleted) {
      this.isCompleted = true;
      this.toolSprite.setAlpha(0);

      // Полное стирание остатков и победная вспышка
      this.dirtLayer.clear();

      // Дофаминовый блеск: волна света по артефакту
      const flash = this.add.rectangle(
        this.cleanArt.x,
        this.cleanArt.y,
        this.cleanArt.width,
        this.cleanArt.height,
        0xffffff,
        0.8
      );
      flash.setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: flash,
        alpha: 0,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 450,
        ease: 'Quad.easeOut',
        onComplete: () => {
          flash.destroy();
          this.time.delayedCall(250, () => {
            this.scene.start('VictoryScene', { artifact: this.artifactData });
          });
        }
      });
    }
  }
}
