import { YandexSDK } from '../utils/YandexSDK.js';
import { Storage } from '../utils/Storage.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  async create() {
    await YandexSDK.init();
    await Storage.loadFromYandexCloud();

    // ==========================================
    // 1. ДРЕВНИЙ ЕГИПЕТ
    // ==========================================

    // 1.1 Золотой Скарабей
    const scarab = this.make.graphics({ x: 0, y: 0, add: false });
    // Тень под объектом
    scarab.fillStyle(0x0a0908, 0.45);
    scarab.fillEllipse(150, 215, 175, 235);
    // Крылья с золотым градиентным объемом
    scarab.fillStyle(0xb7950b, 1);
    scarab.fillEllipse(150, 200, 165, 225);
    scarab.fillStyle(0xd4af37, 1);
    scarab.fillEllipse(150, 198, 155, 215);
    scarab.fillStyle(0xf1c40f, 0.4);
    scarab.fillEllipse(135, 185, 90, 160);
    // Сердцевина из лазурита
    scarab.fillStyle(0x0f2b46, 1);
    scarab.fillEllipse(150, 195, 84, 144);
    scarab.fillStyle(0x1f618d, 1);
    scarab.fillEllipse(150, 190, 76, 134);
    scarab.fillStyle(0x5dade2, 0.5);
    scarab.fillEllipse(145, 180, 45, 90);
    // Голова и резные лапки
    scarab.fillStyle(0x9a7d0a, 1);
    scarab.fillCircle(150, 80, 36);
    scarab.fillStyle(0xd4af37, 1);
    scarab.fillCircle(150, 78, 30);
    scarab.lineStyle(10, 0x7d6608, 1);
    scarab.strokeLineShape(new Phaser.Geom.Line(95, 120, 35, 85));
    scarab.strokeLineShape(new Phaser.Geom.Line(205, 120, 265, 85));
    scarab.strokeLineShape(new Phaser.Geom.Line(75, 200, 25, 210));
    scarab.strokeLineShape(new Phaser.Geom.Line(225, 200, 275, 210));
    scarab.strokeLineShape(new Phaser.Geom.Line(95, 280, 45, 335));
    scarab.strokeLineShape(new Phaser.Geom.Line(205, 280, 255, 335));
    scarab.generateTexture('art_egypt_scarab', 300, 400);
    scarab.destroy();

    // 1.2 Маска Тутанхамона
    const mask = this.make.graphics({ x: 0, y: 0, add: false });
    mask.fillStyle(0x0a0908, 0.4);
    mask.fillEllipse(150, 205, 185, 245);
    // Немес (полосатый платок)
    mask.fillStyle(0x1a5276, 1);
    mask.beginPath();
    mask.moveTo(50, 80);
    mask.lineTo(250, 80);
    mask.lineTo(270, 260);
    mask.lineTo(220, 310);
    mask.lineTo(80, 310);
    mask.lineTo(30, 260);
    mask.closePath();
    mask.fillPath();
    // Золотые полосы немеса
    mask.fillStyle(0xd4af37, 1);
    for (let y = 100; y < 290; y += 28) {
      mask.fillRect(45, y, 210, 14);
    }
    // Лицо фараона
    mask.fillStyle(0xb7950b, 1);
    mask.fillEllipse(150, 185, 110, 140);
    mask.fillStyle(0xf1c40f, 1);
    mask.fillEllipse(150, 180, 100, 130);
    // Глаза и бородка
    mask.fillStyle(0x17202a, 1);
    mask.fillRect(142, 245, 16, 50); // бородка
    mask.fillStyle(0x2980b9, 1);
    mask.fillRect(144, 250, 12, 40);
    mask.fillEllipse(125, 170, 24, 12);
    mask.fillEllipse(175, 170, 24, 12);
    mask.generateTexture('art_egypt_mask', 300, 400);
    mask.destroy();

    // 1.3 Анкх Жизни
    const ankh = this.make.graphics({ x: 0, y: 0, add: false });
    ankh.fillStyle(0x0a0908, 0.4);
    ankh.fillCircle(150, 135, 65);
    ankh.fillRect(132, 195, 36, 180);
    // Петля
    ankh.lineStyle(24, 0xb7950b, 1);
    ankh.strokeCircle(150, 130, 50);
    ankh.lineStyle(16, 0xf1c40f, 1);
    ankh.strokeCircle(150, 128, 50);
    // Тело и перекладина
    ankh.fillStyle(0xb7950b, 1);
    ankh.fillRect(75, 185, 150, 30);
    ankh.fillRect(135, 185, 30, 180);
    ankh.fillStyle(0xf39c12, 1);
    ankh.fillRect(80, 190, 140, 20);
    ankh.fillRect(140, 190, 20, 170);
    ankh.generateTexture('art_egypt_ankh', 300, 400);
    ankh.destroy();

    // ==========================================
    // 2. АНТИЧНАЯ ГРЕЦИЯ
    // ==========================================

    // 2.1 Амфора
    const amphora = this.make.graphics({ x: 0, y: 0, add: false });
    amphora.fillStyle(0x0a0908, 0.4);
    amphora.fillEllipse(150, 210, 195, 275);
    // Терракотовый объемный корпус
    amphora.fillStyle(0xa04000, 1);
    amphora.fillEllipse(150, 200, 186, 266);
    amphora.fillStyle(0xd35400, 1);
    amphora.fillEllipse(145, 195, 176, 256);
    amphora.fillStyle(0xe59866, 0.35);
    amphora.fillEllipse(130, 185, 100, 200);
    // Горлышко и ножка
    amphora.fillStyle(0x873600, 1);
    amphora.fillRect(110, 48, 80, 52);
    amphora.fillEllipse(150, 44, 102, 24);
    amphora.fillRect(115, 320, 70, 25);
    amphora.fillEllipse(150, 345, 112, 22);
    // Ручки
    amphora.lineStyle(16, 0x6e2c00, 1);
    amphora.beginPath();
    amphora.arc(88, 160, 46, Phaser.Math.DegToRad(70), Phaser.Math.DegToRad(270), true);
    amphora.strokePath();
    amphora.beginPath();
    amphora.arc(212, 160, 46, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(110), false);
    amphora.strokePath();
    // Чернофигурный орнамент
    amphora.fillStyle(0x1a1614, 0.85);
    amphora.fillRect(75, 175, 150, 36);
    amphora.strokeCircle(150, 193, 14);
    amphora.generateTexture('art_greece_amphora', 300, 400);
    amphora.destroy();

    // 2.2 Коринфский Шлем
    const helmet = this.make.graphics({ x: 0, y: 0, add: false });
    helmet.fillStyle(0x0a0908, 0.4);
    helmet.fillCircle(150, 185, 120);
    // Бронзовый купол
    helmet.fillStyle(0x7d6608, 1);
    helmet.fillCircle(150, 170, 110);
    helmet.fillStyle(0xb7950b, 1);
    helmet.fillCircle(145, 165, 102);
    // Нащечники и носовая пластина
    helmet.fillStyle(0x9a7d0a, 1);
    helmet.fillRect(70, 180, 50, 120);
    helmet.fillRect(180, 180, 50, 120);
    helmet.fillRect(138, 160, 24, 130);
    // Гребень из конского волоса
    helmet.fillStyle(0xc0392b, 1);
    helmet.beginPath();
    helmet.moveTo(50, 70);
    helmet.lineTo(250, 70);
    helmet.lineTo(210, 30);
    helmet.lineTo(90, 30);
    helmet.closePath();
    helmet.fillPath();
    helmet.generateTexture('art_greece_helmet', 300, 400);
    helmet.destroy();

    // 2.3 Афинская монета (Сова)
    const coin = this.make.graphics({ x: 0, y: 0, add: false });
    coin.fillStyle(0x0a0908, 0.4);
    coin.fillCircle(150, 205, 125);
    // Массивное серебро
    coin.fillStyle(0x7f8c8d, 1);
    coin.fillCircle(150, 200, 120);
    coin.fillStyle(0xbdc3c7, 1);
    coin.fillCircle(145, 195, 114);
    coin.fillStyle(0xecf0f1, 0.4);
    coin.fillCircle(130, 180, 70);
    // Рельефная сова
    coin.fillStyle(0x566573, 1);
    coin.fillEllipse(150, 205, 80, 110); // тело
    coin.fillCircle(150, 145, 38); // голова
    coin.fillStyle(0xbdc3c7, 1);
    coin.fillCircle(136, 142, 14); // огромные глаза
    coin.fillCircle(164, 142, 14);
    coin.fillStyle(0x1c2833, 1);
    coin.fillCircle(136, 142, 6);
    coin.fillCircle(164, 142, 6);
    coin.generateTexture('art_greece_coin', 300, 400);
    coin.destroy();

    // ==========================================
    // 3. СРЕДНЕВЕКОВАЯ ЕВРОПА
    // ==========================================

    // 3.1 Рыцарский Щит
    const shield = this.make.graphics({ x: 0, y: 0, add: false });
    shield.fillStyle(0x0a0908, 0.4);
    shield.beginPath();
    shield.moveTo(50, 68);
    shield.lineTo(250, 68);
    shield.lineTo(250, 228);
    shield.lineTo(150, 358);
    shield.lineTo(50, 228);
    shield.closePath();
    shield.fillPath();
    // Стальной лист с градиентом
    shield.fillStyle(0x4d5656, 1);
    shield.beginPath();
    shield.moveTo(50, 60);
    shield.lineTo(250, 60);
    shield.lineTo(250, 220);
    shield.lineTo(150, 350);
    shield.lineTo(50, 220);
    shield.closePath();
    shield.fillPath();
    shield.fillStyle(0x7f8c8d, 1);
    shield.beginPath();
    shield.moveTo(58, 68);
    shield.lineTo(242, 68);
    shield.lineTo(242, 215);
    shield.lineTo(150, 338);
    shield.lineTo(58, 215);
    shield.closePath();
    shield.fillPath();
    // Заклепки и гербовый крест
    shield.lineStyle(10, 0xbdc3c7, 1);
    shield.strokePath();
    shield.fillStyle(0xc0392b, 1);
    shield.fillRect(135, 75, 30, 210);
    shield.fillRect(80, 140, 140, 30);
    shield.generateTexture('art_europe_shield', 300, 400);
    shield.destroy();

    // 3.2 Меч Рыцаря
    const sword = this.make.graphics({ x: 0, y: 0, add: false });
    sword.fillStyle(0x0a0908, 0.4);
    sword.fillRect(144, 48, 22, 330);
    // Клинок из дамаска
    sword.fillStyle(0x95a5a6, 1);
    sword.beginPath();
    sword.moveTo(136, 100);
    sword.lineTo(164, 100);
    sword.lineTo(158, 350);
    sword.lineTo(150, 375);
    sword.lineTo(142, 350);
    sword.closePath();
    sword.fillPath();
    // Дол клинка
    sword.fillStyle(0x515a5a, 1);
    sword.fillRect(148, 105, 4, 230);
    // Гарда и яблоко
    sword.fillStyle(0xd4af37, 1);
    sword.fillRoundedRect(80, 95, 140, 18, 5);
    sword.fillStyle(0x5d4037, 1);
    sword.fillRoundedRect(142, 45, 16, 55, 3); // рукоять
    sword.fillStyle(0xd4af37, 1);
    sword.fillCircle(150, 40, 16); // навершие
    sword.generateTexture('art_europe_sword', 300, 400);
    sword.destroy();

    // 3.3 Готический Потир
    const chalice = this.make.graphics({ x: 0, y: 0, add: false });
    chalice.fillStyle(0x0a0908, 0.4);
    chalice.fillEllipse(150, 210, 170, 240);
    // Чаша кубка
    chalice.fillStyle(0xb7950b, 1);
    chalice.beginPath();
    chalice.arc(150, 140, 80, 0, Math.PI, false);
    chalice.closePath();
    chalice.fillPath();
    chalice.fillStyle(0xf1c40f, 1);
    chalice.beginPath();
    chalice.arc(150, 138, 72, 0, Math.PI, false);
    chalice.closePath();
    chalice.fillPath();
    // Ножка и база
    chalice.fillStyle(0xd4af37, 1);
    chalice.fillRect(140, 140, 20, 130);
    chalice.fillCircle(150, 200, 22); // утолщение ножки
    chalice.fillEllipse(150, 280, 120, 35);
    // Рубины
    chalice.fillStyle(0xc0392b, 1);
    chalice.fillCircle(150, 200, 8);
    chalice.fillCircle(115, 160, 6);
    chalice.fillCircle(185, 160, 6);
    chalice.generateTexture('art_europe_chalice', 300, 400);
    chalice.destroy();

    // ==========================================
    // 4. СИСТЕМНЫЕ ИНСТРУМЕНТЫ И ИКОНКИ
    // ==========================================
    this.buildBrush('basic', 0x8e5d34, 0xbdc3c7, 0xecd8a5, 35);
    this.buildBrush('wide', 0x2c3e50, 0x95a5a6, 0xdfe6e9, 50);
    this.buildBrush('gold', 0xd4af37, 0xf39c12, 0xfff9d2, 65);

    // Губка
    const sponge = this.make.graphics({ x: 0, y: 0, add: false });
    sponge.fillStyle(0x27ae60, 1);
    sponge.fillRoundedRect(10, 20, 60, 45, 12);
    sponge.fillStyle(0x2ecc71, 1);
    sponge.fillCircle(25, 35, 6);
    sponge.fillCircle(45, 42, 8);
    sponge.fillCircle(35, 52, 5);
    sponge.generateTexture('tool_sponge', 80, 80);
    sponge.destroy();

    // Замша
    const cloth = this.make.graphics({ x: 0, y: 0, add: false });
    cloth.fillStyle(0x9b59b6, 1);
    cloth.fillRoundedRect(15, 15, 50, 50, 8);
    cloth.fillStyle(0x8e44ad, 1);
    cloth.fillRect(25, 25, 30, 30);
    cloth.generateTexture('tool_cloth', 80, 80);
    cloth.destroy();

    // Звезда
    const star = this.make.graphics({ x: 0, y: 0, add: false });
    star.fillStyle(0xf1c40f, 1);
    star.beginPath();
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? 16 : 7;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = 20 + r * Math.cos(angle);
      const y = 20 + r * Math.sin(angle);
      if (i === 0) star.moveTo(x, y);
      else star.lineTo(x, y);
    }
    star.closePath();
    star.fillPath();
    star.generateTexture('icon_star', 40, 40);
    star.destroy();

    // Бустер (Молния)
    const booster = this.make.graphics({ x: 0, y: 0, add: false });
    booster.fillStyle(0x9b59b6, 1);
    booster.fillCircle(24, 24, 22);
    booster.fillStyle(0xffffff, 1);
    booster.beginPath();
    booster.moveTo(25, 8);
    booster.lineTo(14, 24);
    booster.lineTo(23, 24);
    booster.lineTo(21, 38);
    booster.lineTo(34, 20);
    booster.lineTo(26, 20);
    booster.closePath();
    booster.fillPath();
    booster.generateTexture('icon_booster', 48, 48);
    booster.destroy();

    // Замок блокировки эпохи/предмета
    const lock = this.make.graphics({ x: 0, y: 0, add: false });
    lock.lineStyle(4, 0xbdc3c7, 1);
    lock.strokeCircle(20, 14, 10);
    lock.fillStyle(0x7f8c8d, 1);
    lock.fillRoundedRect(8, 16, 24, 20, 4);
    lock.fillStyle(0x111111, 1);
    lock.fillCircle(20, 24, 3);
    lock.generateTexture('icon_lock', 40, 40);
    lock.destroy();

    // Конфетти и пыль
    const conf = this.make.graphics({ x: 0, y: 0, add: false });
    conf.fillStyle(0xffffff, 1);
    conf.fillRect(0, 0, 8, 8);
    conf.generateTexture('particle_confetti', 8, 8);
    conf.destroy();

    const dust = this.make.graphics({ x: 0, y: 0, add: false });
    dust.fillStyle(0xffffff, 1);
    dust.fillCircle(4, 4, 4);
    dust.generateTexture('particle_dust', 8, 8);
    dust.destroy();

    // Звук
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

    // Домой
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

  buildBrush(id, handleColor, ferruleColor, bristleColor, radius) {
    const mask = this.make.graphics({ x: 0, y: 0, add: false });
    mask.fillStyle(0xffffff, 1);
    mask.fillCircle(radius, radius, radius);
    mask.generateTexture(`brush_mask_${id}`, radius * 2, radius * 2);
    mask.destroy();

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
