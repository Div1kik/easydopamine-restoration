export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // 1. ЕГИПЕТ: Золотой скарабей с лазуритом
    const scarab = this.make.graphics({ x: 0, y: 0, add: false });
    // Крылья и тело
    scarab.fillStyle(0xd4af37, 1);
    scarab.fillEllipse(150, 200, 160, 220);
    scarab.fillStyle(0x1a5276, 1); // Лазуритовый центр
    scarab.fillEllipse(150, 190, 80, 140);
    // Голова и лапки
    scarab.fillStyle(0xb7950b, 1);
    scarab.fillCircle(150, 80, 35);
    scarab.lineStyle(12, 0x9a7d0a, 1);
    // Лапы
    scarab.strokeLineShape(new Phaser.Geom.Line(90, 120, 30, 90));
    scarab.strokeLineShape(new Phaser.Geom.Line(210, 120, 270, 90));
    scarab.strokeLineShape(new Phaser.Geom.Line(70, 200, 20, 210));
    scarab.strokeLineShape(new Phaser.Geom.Line(230, 200, 280, 210));
    scarab.strokeLineShape(new Phaser.Geom.Line(90, 280, 40, 330));
    scarab.strokeLineShape(new Phaser.Geom.Line(210, 280, 260, 330));
    scarab.generateTexture('art_egypt_scarab', 300, 400);
    scarab.destroy();

    // 2. ГРЕЦИЯ: Терракотовая амфора
    const amphora = this.make.graphics({ x: 0, y: 0, add: false });
    amphora.fillStyle(0xd35400, 1);
    amphora.fillEllipse(150, 200, 180, 260);
    amphora.fillRect(110, 50, 80, 50);
    amphora.fillEllipse(150, 45, 100, 24);
    amphora.fillRect(115, 320, 70, 25);
    amphora.fillEllipse(150, 345, 110, 20);
    amphora.lineStyle(16, 0xa04000, 1);
    amphora.beginPath();
    amphora.arc(90, 160, 45, Phaser.Math.DegToRad(70), Phaser.Math.DegToRad(270), true);
    amphora.strokePath();
    amphora.beginPath();
    amphora.arc(210, 160, 45, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(110), false);
    amphora.strokePath();
    amphora.lineStyle(4, 0x1a1614, 0.7);
    amphora.strokeRect(80, 180, 140, 30);
    amphora.strokeCircle(150, 195, 12);
    amphora.generateTexture('art_greece_amphora', 300, 400);
    amphora.destroy();

    // 3. ЕВРОПА: Стальной рыцарский щит
    const shield = this.make.graphics({ x: 0, y: 0, add: false });
    shield.fillStyle(0x7f8c8d, 1); // Полированная сталь
    shield.beginPath();
    shield.moveTo(50, 60);
    shield.lineTo(250, 60);
    shield.lineTo(250, 220);
    shield.lineTo(150, 350);
    shield.lineTo(50, 220);
    shield.closePath();
    shield.fillPath();
    // Окантовка и золотой геральдический крест
    shield.lineStyle(10, 0xbdc3c7, 1);
    shield.strokePath();
    shield.fillStyle(0xc0392b, 1); // Красное знамя внутри
    shield.fillRect(135, 75, 30, 200);
    shield.fillRect(80, 140, 140, 30);
    shield.generateTexture('art_europe_shield', 300, 400);
    shield.destroy();

    // 4. Кисть для очистки
    const brush = this.make.graphics({ x: 0, y: 0, add: false });
    brush.fillStyle(0xffffff, 1);
    brush.fillCircle(30, 30, 30);
    brush.generateTexture('brush', 60, 60);
    brush.destroy();

    this.scene.start('RestoreScene');
  }
}
