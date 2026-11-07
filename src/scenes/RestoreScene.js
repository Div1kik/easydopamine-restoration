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

    // Получаем текущую экипированную кисть
    const equippedToolId = Storage.getEquippedTool();
    this.currentTool = TOOLS.find(t => t.id === equippedToolId) || TOOLS[0];

    // Фон рабочей зоны
    this.add.rectangle(width / 2, height / 2, width, height, 0x1f1b18);

    // Кнопка выхода в главное меню слева
    const homeBtn = this.add.image(36, 36, 'icon_home').setInteractive({ useHandCursor: true });
    homeBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    // Монеты по центру-слева
    const coins = Storage.getCoins();
    this.coinsText = this.add.text(70, 26, `${coins}`, {
      fontSize: '20px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    });

    // Кнопка Mute в правом верхнем углу
    this.createMuteButton(width - 36, 36);

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

    // Координаты и холст
    const artW = 300;
    const artH = 400;
    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const topLeftX = centerX - artW / 2;
    const topLeftY = centerY - artH / 2;

    this.cleanArt = this.add.image(centerX, centerY, this.artifactData.textureKey);

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

    // Частицы
    this.particles = this.add.particles(0, 0, 'particle_dust', {
      lifespan: { min: 250, max: 450 },
      speed: { min: 60, max: 140 },
      scale: { start: 1.2, end: 0 },
      tint: this.artifactData.dirtColor,
      emitting: false
    });

    // Спрайт экипированного инструмента
    this.toolSprite = this.add.image(centerX, centerY, this.currentTool.textureKey);
    this.toolSprite.setOrigin(0.5, 0.95);
    this.toolSprite.setScale(0.85);
    this.toolSprite.setAlpha(0);

    // Прогресс (с учетом радиуса кисти)
    this.cleanedPixels = 0;
    // Чем шире кисть, тем быстрее заполняется цель
    this.stepWeight = Math.round(this.currentTool.brushRadius / 25);
    this.totalStepsTarget = 240;
    this.isCompleted = false;

    const barWidth = width * 0.7;
    this.add.rectangle(width / 2, height - 60, barWidth, 14, 0x111111);
    this.progressBar = this.add.rectangle(width / 2 - barWidth / 2, height - 60, 0, 14, 0x2ecc71).setOrigin(0, 0.5);

    // Стирание
    const processScrubbing = (pointer) => {
      if (!pointer.isDown || this.isCompleted) return;

      this.toolSprite.setPosition(pointer.x, pointer.y - 15);
      this.toolSprite.setAlpha(1);

      const dx = pointer.x - pointer.prevPosition.x;
      this.toolSprite.setAngle(Phaser.Math.Clamp(dx * 2.5, -20, 20));

      const localX = pointer.x - topLeftX;
      const localY = pointer.y - topLeftY;

      if (localX >= 0 && localX <= artW && localY >= 0 && localY <= artH) {
        // Стираем маской выбранной кисти
        this.dirtLayer.erase(this.currentTool.maskKey, localX, localY);
        this.cleanedPixels += this.stepWeight;

        AudioManager.playScrub();

        // Микровибрация при наличии поддержки на смартфоне
        if (navigator.vibrate && Math.random() < 0.25) {
          navigator.vibrate(8);
        }

        this.particles.emitParticleAt(pointer.x, pointer.y, 2);
        this.updateProgress();
      }
    };

    this.input.on('pointerdown', processScrubbing);
    this.input.on('pointermove', processScrubbing);
    this.input.on('pointerup', () => {
      this.toolSprite.setAlpha(0);
    });
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

  updateProgress() {
    const ratio = Math.min(this.cleanedPixels / this.totalStepsTarget, 1);
    const maxWidth = this.scale.width * 0.7;
    this.progressBar.width = ratio * maxWidth;

    if (ratio >= 1 && !this.isCompleted) {
      this.isCompleted = true;
      this.toolSprite.setAlpha(0);
      this.dirtLayer.clear();

      AudioManager.playCoin();

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
