import { Storage } from '../utils/Storage.js';

export class RestoreScene extends Phaser.Scene {
  constructor() {
    super('RestoreScene');
  }

  create() {
    const { width, height } = this.scale;

    // Фон стола реставратора (темное сукно)
    this.add.rectangle(width / 2, height / 2, width, height, 0x221d1a);

    // Верхняя панель: монетный счет
    const coins = Storage.getCoins();
    this.coinsText = this.add.text(24, 28, `Золото: ${coins}`, {
      fontSize: '20px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    });

    // Инструкция
    this.hintText = this.add.text(width / 2, 70, 'Очистите налет с артефакта', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#bdc3c7'
    }).setOrigin(0.5);

    // Центр сцены — артефакт
    const centerX = width / 2;
    const centerY = height / 2;

    // Чистый артефакт (подложка)
    this.cleanArtifact = this.add.image(centerX, centerY, 'artifact_clean');

    // Слой грязи/патины через RenderTexture
    const artW = 300;
    const artH = 400;
    this.dirtLayer = this.add.renderTexture(centerX - artW / 2, centerY - artH / 2, artW, artH);

    // Заливаем слой серо-зеленой вековой грязью
    const dirtColor = this.make.graphics({ x: 0, y: 0, add: false });
    dirtColor.fillStyle(0x4a4737, 0.96);
    dirtColor.fillRect(0, 0, artW, artH);
    // Добавляем пятна для неоднородности
    dirtColor.fillStyle(0x2f3528, 0.95);
    for (let i = 0; i < 15; i++) {
      dirtColor.fillCircle(Phaser.Math.Between(20, artW - 20), Phaser.Math.Between(20, artH - 20), Phaser.Math.Between(20, 50));
    }
    this.dirtLayer.draw(dirtColor, 0, 0);
    dirtColor.destroy();

    // Переменные прогресса очистки
    this.cleanedPixels = 0;
    this.totalStepsTarget = 240; // Количество касаний для полной очистки
    this.isCompleted = false;

    // Шкала прогресса внизу
    this.progressBg = this.add.rectangle(width / 2, height - 70, width * 0.7, 16, 0x111111);
    this.progressBar = this.add.rectangle(width / 2 - (width * 0.7) / 2, height - 70, 0, 16, 0x2ecc71).setOrigin(0, 0.5);

    // Ввод: очистка ластиком (стирание через ERASE)
    this.input.on('pointermove', (pointer) => {
      if (!pointer.isDown || this.isCompleted) return;

      const localX = pointer.x - (centerX - artW / 2);
      const localY = pointer.y - (centerY - artH / 2);

      if (localX >= 0 && localX <= artW && localY >= 0 && localY <= artH) {
        this.dirtLayer.erase('brush', localX, localY);
        this.cleanedPixels++;
        this.updateProgress();
      }
    });
  }

  updateProgress() {
    const ratio = Math.min(this.cleanedPixels / this.totalStepsTarget, 1);
    const maxWidth = this.scale.width * 0.7;
    this.progressBar.width = ratio * maxWidth;

    if (ratio >= 1 && !this.isCompleted) {
      this.isCompleted = true;
      this.time.delayedCall(400, () => {
        this.scene.start('VictoryScene', { artifactName: 'Античная амфора V в. до н.э.' });
      });
    }
  }
}
