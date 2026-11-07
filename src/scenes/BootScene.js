export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // 1. Создаем текстуру античной амфоры (чистый вид)
    const vaseGfx = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Корпус амфоры (терракота)
    vaseGfx.fillStyle(0xd35400, 1);
    vaseGfx.fillEllipse(150, 200, 180, 260);

    // Горлышко и подставка
    vaseGfx.fillRect(110, 50, 80, 50);
    vaseGfx.fillEllipse(150, 45, 100, 24);
    vaseGfx.fillRect(115, 320, 70, 25);
    vaseGfx.fillEllipse(150, 345, 110, 20);

    // Ручки
    vaseGfx.lineStyle(16, 0xa04000, 1);
    vaseGfx.beginPath();
    vaseGfx.arc(90, 160, 45, Phaser.Math.DegToRad(70), Phaser.Math.DegToRad(270), true);
    vaseGfx.strokePath();

    vaseGfx.beginPath();
    vaseGfx.arc(210, 160, 45, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(110), false);
    vaseGfx.strokePath();

    // Декоративный орнамент
    vaseGfx.lineStyle(4, 0x1a1614, 0.7);
    vaseGfx.strokeRect(80, 180, 140, 30);
    vaseGfx.strokeCircle(150, 195, 12);

    vaseGfx.generateTexture('artifact_clean', 300, 400);
    vaseGfx.destroy();

    // 2. Создаем текстуру кисти/губки для стирания
    const brushGfx = this.make.graphics({ x: 0, y: 0, add: false });
    brushGfx.fillStyle(0xffffff, 1);
    brushGfx.fillCircle(30, 30, 30);
    brushGfx.generateTexture('brush', 60, 60);
    brushGfx.destroy();

    // Переход к игровой сцене
    this.scene.start('RestoreScene');
  }
}
