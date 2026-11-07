export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // 1. ЕГИПЕТ
    const scarab = this.make.graphics({ x: 0, y: 0, add: false });
    scarab.fillStyle(0xd4af37, 1);
    scarab.fillEllipse(150, 200, 160, 220);
    scarab.fillStyle(0x1a5276, 1);
    scarab.fillEllipse(150, 190, 80, 140);
    scarab.fillStyle(0xb7950b, 1);
    scarab.fillCircle(150, 80, 35);
    scarab.lineStyle(12, 0x9a7d0a, 1);
    scarab.strokeLineShape(new Phaser.Geom.Line(90, 120, 30, 90));
    scarab.strokeLineShape(new Phaser.Geom.Line(210, 120, 270, 90));
    scarab.strokeLineShape(new Phaser.Geom.Line(70, 200, 20, 210));
    scarab.strokeLineShape(new Phaser.Geom.Line(230, 200, 280, 210));
    scarab.strokeLineShape(new Phaser.Geom.Line(90, 280, 40, 330));
    scarab.strokeLineShape(new Phaser.Geom.Line(210, 280, 260, 330));
    scarab.generateTexture('art_egypt_scarab', 300, 400);
    scarab.destroy();

    // 2. ГРЕЦИЯ
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

    // 3. ЕВРОПА
    const shield = this.make.graphics({ x: 0, y: 0, add: false });
    shield.fillStyle(0x7f8c8d, 1);
    shield.beginPath();
    shield.moveTo(50, 60);
    shield.lineTo(250, 60);
    shield.lineTo(250, 220);
    shield.lineTo(150, 350);
    shield.lineTo(50, 220);
    shield.closePath();
    shield.fillPath();
    shield.lineStyle(10, 0xbdc3c7, 1);
    shield.strokePath();
    shield.fillStyle(0xc0392b, 1);
    shield.fillRect(135, 75, 30, 200);
    shield.fillRect(80, 140, 140, 30);
    shield.generateTexture('art_europe_shield', 300, 400);
    shield.destroy();

    // 4. Текстуры кистей и масок
    // Базовая кисть (радиус 35)
    this.createBrushAsset('basic', 0x8e5d34, 0xbdc3c7, 0xecd8a5, 35);
    // Широкая кисть (радиус 50)
    this.createBrushAsset('wide', 0x2c3e50, 0x95a5a6, 0xdfe6e9, 50);
    // Золотая кисть (радиус 65)
    this.createBrushAsset('gold', 0xd4af37, 0xf39c12, 0xfff9d2, 65);

    // 5. Частицы пыли
    const dust = this.make.graphics({ x: 0, y: 0, add: false });
    dust.fillStyle(0xffffff, 1);
    dust.fillCircle(4, 4, 4);
    dust.generateTexture('particle_dust', 8, 8);
    dust.destroy();

    // 6. Иконка звука
    const speaker = this.make.graphics({ x: 0, y: 0, add: false });
    speaker.fillStyle(0xffffff, 1);
    speaker.fillRect(6, 14, 8, 12);
    speaker.beginPath();
    speaker.moveTo(14, 14);
    speaker.lineTo(26, 6);
    speaker.lineTo(26, 34);
    speaker.lineTo(14, 26);
    speaker.closePath();
    speaker.fillPath();
    speaker.generateTexture('icon_speaker', 40, 40);
    speaker.destroy();

    // 7. Иконка "Домой" (стрелка назад / меню)
    const home = this.make.graphics({ x: 0, y: 0, add: false });
    home.fillStyle(0xffffff, 1);
    home.beginPath();
    home.moveTo(20, 8);
    home.lineTo(6, 20);
    home.lineTo(34, 20);
    home.closePath();
    home.fillPath();
    home.fillRect(11, 20, 18, 14);
    home.generateTexture('icon_home', 40, 40);
    home.destroy();

    this.scene.start('MenuScene');
  }

  createBrushAsset(id, handleColor, ferruleColor, bristleColor, radius) {
    // Маска стирания
    const mask = this.make.graphics({ x: 0, y: 0, add: false });
    mask.fillStyle(0xffffff, 1);
    mask.fillCircle(radius, radius, radius);
    mask.generateTexture(`brush_mask_${id}`, radius * 2, radius * 2);
    mask.destroy();

    // Визуальный инструмент
    const tool = this.make.graphics({ x: 0, y: 0, add: false });
    tool.fillStyle(handleColor, 1);
    tool.fillRoundedRect(32, 0, 16, 75, 6);
    tool.fillStyle(ferruleColor, 1);
    tool.fillRect(26, 70, 28, 15);
    tool.fillStyle(bristleColor, 1);
    tool.beginPath();
    tool.moveTo(26, 85);
    tool.lineTo(54, 85);
    tool.lineTo(60 + (radius - 35) * 0.4, 120);
    tool.lineTo(20 - (radius - 35) * 0.4, 120);
    tool.closePath();
    tool.fillPath();
    tool.generateTexture(`tool_brush_${id}`, 80, 130);
    tool.destroy();
  }
}
