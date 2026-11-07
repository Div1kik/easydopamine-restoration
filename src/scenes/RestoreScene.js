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

    // Название текущей эпохи и артефакта (по центру)
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

    // Габариты и точные координаты артефакта
    const artW = 300;
    const artH = 400;
    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const topLeftX = centerX - artW / 2;
    const topLeftY = centerY - artH / 2;

    // 1. Чистый артефакт (базовый слой)
    this.add.image(centerX, centerY, this.artifactData.textureKey);

    // 2. Слой загрязнения: привязываем origin к (0, 0), чтобы он сидел ровно на объекте
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

    // Параметры прогресса
    this.cleanedPixels = 0;
    this.totalStepsTarget = 240;
    this.isCompleted = false;

    // Прогресс-бар внизу
    const barWidth = width * 0.7;
    this.add.rectangle(width / 2, height - 60, barWidth, 14, 0x111111);
    this.progressBar = this.add.rectangle(width / 2 - barWidth / 2, height - 60, 0, 14, 0x2ecc71).setOrigin(0, 0.5);

    // Ввод / Стирание без смещения
    const handleErase = (pointer) => {
      if (!pointer.isDown || this.isCompleted) return;

      // Локальные координаты относительно верхнего левого угла холста грязи
      const localX = pointer.x - topLeftX;
      const localY = pointer.y - topLeftY;

      if (localX >= 0 && localX <= artW && localY >= 0 && localY <= artH) {
        this.dirtLayer.erase('brush', localX, localY);
        this.cleanedPixels++;
        this.updateProgress();
      }
    };

    this.input.on('pointermove', handleErase);
    this.input.on('pointerdown', handleErase);
  }

  updateProgress() {
    const ratio = Math.min(this.cleanedPixels / this.totalStepsTarget, 1);
    const maxWidth = this.scale.width * 0.7;
    this.progressBar.width = ratio * maxWidth;

    if (ratio >= 1 && !this.isCompleted) {
      this.isCompleted = true;
      this.time.delayedCall(350, () => {
        this.scene.start('VictoryScene', { artifact: this.artifactData });
      });
    }
  }
}
