import { YandexSDK } from '../utils/YandexSDK.js';
import { Storage } from '../utils/Storage.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  async create() {
    await YandexSDK.init();
    await Storage.loadFromYandexCloud();

    const { width, height } = this.scale;

    // 1. ФОН РЕСТАВРАЦИОННОЙ МАСТЕРСКОЙ
    const bgGfx = this.make.graphics({ x: 0, y: 0, add: false });
    bgGfx.fillStyle(0x161311, 1);
    bgGfx.fillRect(0, 0, width, height);

    bgGfx.fillStyle(0x1b1714, 0.4);
    for (let y = 0; y < height; y += 45) {
      bgGfx.fillRect(0, y, width, 40);
    }

    // Теплый свет лампы над столом
    bgGfx.fillStyle(0xe67e22, 0.08);
    bgGfx.fillCircle(width / 2, height * 0.42, 280);
    bgGfx.fillStyle(0xf1c40f, 0.06);
    bgGfx.fillCircle(width / 2, height * 0.42, 190);
    bgGfx.generateTexture('bg_workshop', width, height);
    bgGfx.destroy();

    // 2. ИНСТРУМЕНТЫ В ЛОТОК ВЕРСТАКА

    // 2.1 Металлический скребок
    const scraper = this.make.graphics({ x: 0, y: 0, add: false });
    scraper.fillStyle(0x8e5d34, 1);
    scraper.fillRoundedRect(28, 55, 24, 60, 4);
    scraper.fillStyle(0xbdc3c7, 1);
    scraper.fillRect(24, 40, 32, 18);
    scraper.fillStyle(0x95a5a6, 1);
    scraper.fillTriangle(20, 40, 60, 40, 40, 10);
    scraper.generateTexture('slot_scraper', 80, 120);
    scraper.destroy();

    // 2.2 Растворитель / губка
    const solvent = this.make.graphics({ x: 0, y: 0, add: false });
    solvent.fillStyle(0x27ae60, 1);
    solvent.fillRoundedRect(18, 30, 44, 75, 8);
    solvent.fillStyle(0x2ecc71, 1);
    solvent.fillRect(28, 12, 24, 20);
    solvent.fillStyle(0xffffff, 0.3);
    solvent.fillRect(24, 40, 8, 55);
    solvent.generateTexture('slot_solvent', 80, 120);
    solvent.destroy();

    // 2.3 Золотой клей (Кинцуги)
    const glue = this.make.graphics({ x: 0, y: 0, add: false });
    glue.fillStyle(0xd4af37, 1);
    glue.beginPath();
    glue.moveTo(25, 110);
    glue.lineTo(55, 110);
    glue.lineTo(50, 40);
    glue.lineTo(30, 40);
    glue.closePath();
    glue.fillPath();
    glue.fillStyle(0xc0392b, 1);
    glue.fillRect(34, 15, 12, 25);
    glue.generateTexture('slot_glue', 80, 120);
    glue.destroy();

    // 2.4 Тонкая кисть с пигментом
    const brush = this.make.graphics({ x: 0, y: 0, add: false });
    brush.fillStyle(0x2c3e50, 1);
    brush.fillRoundedRect(36, 30, 8, 85, 3);
    brush.fillStyle(0xd4af37, 1);
    brush.fillRect(34, 24, 12, 8);
    brush.fillStyle(0xc0392b, 1);
    brush.fillTriangle(34, 24, 46, 24, 40, 5);
    brush.generateTexture('slot_brush', 80, 120);
    brush.destroy();

    // 2.5 Финишная замшевая салфетка
    const cloth = this.make.graphics({ x: 0, y: 0, add: false });
    cloth.fillStyle(0x8e44ad, 1);
    cloth.fillRoundedRect(15, 35, 50, 55, 10);
    cloth.fillStyle(0x9b59b6, 1);
    cloth.fillRoundedRect(22, 42, 36, 40, 6);
    cloth.generateTexture('slot_polish', 80, 120);
    cloth.destroy();

    // 3. МАСКИ ЛАСТИКОВ
    this.createCircleMask('mask_scraper', 28);
    this.createCircleMask('mask_solvent', 48);
    this.createCircleMask('mask_glue', 20);
    this.createCircleMask('mask_brush', 22);
    this.createCircleMask('mask_polish', 56);

    // 4. ГЕНЕРАЦИЯ ВСЕХ АРТЕФАКТОВ
    this.createAllArtifacts();

    // 5. ИКОНКИ И ЧАСТИЦЫ
    const lock = this.make.graphics({ x: 0, y: 0, add: false });
    lock.lineStyle(4, 0xbdc3c7, 1);
    lock.strokeCircle(20, 14, 10);
    lock.fillStyle(0x7f8c8d, 1);
    lock.fillRoundedRect(8, 16, 24, 20, 4);
    lock.fillStyle(0x111111, 1);
    lock.fillCircle(20, 24, 3);
    lock.generateTexture('icon_lock', 40, 40);
    lock.destroy();

    const star = this.make.graphics({ x: 0, y: 0, add: false });
    star.fillStyle(0xf1c40f, 1);
    star.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = (i % 2 === 0) ? 16 : 7;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const x = 20 + r * Math.cos(angle);
      const y = 20 + r * Math.sin(angle);
      if (i === 0) star.moveTo(x, y);
      else star.lineTo(x, y);
    }
    star.closePath();
    star.fillPath();
    star.generateTexture('icon_star', 40, 40);
    star.destroy();

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

    this.scene.start('MenuScene');
  }

  createCircleMask(key, radius) {
    const mask = this.make.graphics({ x: 0, y: 0, add: false });
    mask.fillStyle(0xffffff, 1);
    mask.fillCircle(radius, radius, radius);
    mask.generateTexture(key, radius * 2, radius * 2);
    mask.destroy();
  }

  createAllArtifacts() {
    // ==========================================
    // ДРЕВНИЙ ЕГИПЕТ
    // ==========================================
    // 1. Скарабей
    const scarab = this.make.graphics({ x: 0, y: 0, add: false });
    scarab.fillStyle(0xb7950b, 1);
    scarab.fillEllipse(150, 200, 165, 225);
    scarab.fillStyle(0xd4af37, 1);
    scarab.fillEllipse(150, 198, 155, 215);
    scarab.fillStyle(0x0f2b46, 1);
    scarab.fillEllipse(150, 195, 84, 144);
    scarab.fillStyle(0x1f618d, 1);
    scarab.fillEllipse(150, 190, 76, 134);
    scarab.fillStyle(0xd4af37, 1);
    scarab.fillCircle(150, 78, 32);
    scarab.lineStyle(12, 0x7d6608, 1);
    scarab.strokeLineShape(new Phaser.Geom.Line(95, 120, 35, 85));
    scarab.strokeLineShape(new Phaser.Geom.Line(205, 120, 265, 85));
    scarab.strokeLineShape(new Phaser.Geom.Line(75, 200, 25, 210));
    scarab.strokeLineShape(new Phaser.Geom.Line(225, 200, 275, 210));
    scarab.generateTexture('art_egypt_scarab', 300, 400);
    scarab.destroy();

    // 2. Маска Тутанхамона
    const mask = this.make.graphics({ x: 0, y: 0, add: false });
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
    mask.fillStyle(0xd4af37, 1);
    for (let y = 100; y < 290; y += 28) mask.fillRect(45, y, 210, 14);
    mask.fillStyle(0xf1c40f, 1);
    mask.fillEllipse(150, 180, 100, 130);
    mask.fillStyle(0x17202a, 1);
    mask.fillRect(142, 245, 16, 50);
    mask.generateTexture('art_egypt_mask', 300, 400);
    mask.destroy();

    // 3. Анкх
    const ankh = this.make.graphics({ x: 0, y: 0, add: false });
    ankh.lineStyle(24, 0xb7950b, 1);
    ankh.strokeCircle(150, 130, 50);
    ankh.lineStyle(16, 0xf1c40f, 1);
    ankh.strokeCircle(150, 128, 50);
    ankh.fillStyle(0xb7950b, 1);
    ankh.fillRect(75, 185, 150, 30);
    ankh.fillRect(135, 185, 30, 180);
    ankh.fillStyle(0xf39c12, 1);
    ankh.fillRect(80, 190, 140, 20);
    ankh.fillRect(140, 190, 20, 170);
    ankh.generateTexture('art_egypt_ankh', 300, 400);
    ankh.destroy();

    // ==========================================
    // АНТИЧНАЯ ГРЕЦИЯ
    // ==========================================
    // 1. Аттическая амфора со швом скола
    const amphora = this.make.graphics({ x: 0, y: 0, add: false });
    amphora.fillStyle(0xa04000, 1);
    amphora.fillEllipse(150, 200, 186, 266);
    amphora.fillStyle(0xd35400, 1);
    amphora.fillEllipse(145, 195, 176, 256);
    amphora.fillStyle(0x873600, 1);
    amphora.fillRect(110, 48, 80, 52);
    amphora.fillRect(115, 320, 70, 25);
    amphora.lineStyle(16, 0x6e2c00, 1);
    amphora.beginPath();
    amphora.arc(88, 160, 46, Phaser.Math.DegToRad(70), Phaser.Math.DegToRad(270), true);
    amphora.strokePath();
    amphora.beginPath();
    amphora.arc(212, 160, 46, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(110), false);
    amphora.strokePath();
    amphora.fillStyle(0x1a1614, 0.9);
    amphora.fillRect(75, 175, 150, 36);
    // Линия трещины
    amphora.lineStyle(3, 0x111111, 0.7);
    amphora.strokeLineShape(new Phaser.Geom.Line(125, 145, 175, 220));
    amphora.generateTexture('art_greece_amphora', 300, 400);
    amphora.destroy();

    // 1.1 Отколотый черепок амфоры для склейки
    const shard = this.make.graphics({ x: 0, y: 0, add: false });
    shard.fillStyle(0xd35400, 1);
    shard.beginPath();
    shard.moveTo(10, 10);
    shard.lineTo(55, 18);
    shard.lineTo(45, 60);
    shard.lineTo(15, 45);
    shard.closePath();
    shard.fillPath();
    shard.lineStyle(3, 0x873600, 1);
    shard.strokePath();
    shard.generateTexture('shard_amphora', 65, 70);
    shard.destroy();

    // 2. Коринфский шлем
    const helmet = this.make.graphics({ x: 0, y: 0, add: false });
    helmet.fillStyle(0x7d6608, 1);
    helmet.fillCircle(150, 170, 110);
    helmet.fillStyle(0xb7950b, 1);
    helmet.fillCircle(145, 165, 102);
    helmet.fillStyle(0x9a7d0a, 1);
    helmet.fillRect(70, 180, 50, 120);
    helmet.fillRect(180, 180, 50, 120);
    helmet.fillRect(138, 160, 24, 130);
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

    // 3. Афинская тетрадрахма
    const coin = this.make.graphics({ x: 0, y: 0, add: false });
    coin.fillStyle(0x7f8c8d, 1);
    coin.fillCircle(150, 200, 120);
    coin.fillStyle(0xbdc3c7, 1);
    coin.fillCircle(145, 195, 114);
    coin.fillStyle(0x566573, 1);
    coin.fillEllipse(150, 205, 80, 110);
    coin.fillCircle(150, 145, 38);
    coin.fillStyle(0xbdc3c7, 1);
    coin.fillCircle(136, 142, 14);
    coin.fillCircle(164, 142, 14);
    coin.fillStyle(0x1c2833, 1);
    coin.fillCircle(136, 142, 6);
    coin.fillCircle(164, 142, 6);
    coin.generateTexture('art_greece_coin', 300, 400);
    coin.destroy();

    // ==========================================
    // СРЕДНЕВЕКОВАЯ ЕВРОПА
    // ==========================================
    // 1. Рыцарский щит
    const shield = this.make.graphics({ x: 0, y: 0, add: false });
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
    shield.lineStyle(10, 0xbdc3c7, 1);
    shield.strokePath();
    shield.fillStyle(0xc0392b, 1);
    shield.fillRect(135, 75, 30, 210);
    shield.fillRect(80, 140, 140, 30);
    shield.generateTexture('art_europe_shield', 300, 400);
    shield.destroy();

    // 2. Меч крестоносца
    const sword = this.make.graphics({ x: 0, y: 0, add: false });
    sword.fillStyle(0x95a5a6, 1);
    sword.beginPath();
    sword.moveTo(136, 100);
    sword.lineTo(164, 100);
    sword.lineTo(158, 350);
    sword.lineTo(150, 375);
    sword.lineTo(142, 350);
    sword.closePath();
    sword.fillPath();
    sword.fillStyle(0xd4af37, 1);
    sword.fillRoundedRect(80, 95, 140, 18, 5);
    sword.fillStyle(0x5d4037, 1);
    sword.fillRoundedRect(142, 45, 16, 55, 3);
    sword.fillStyle(0xd4af37, 1);
    sword.fillCircle(150, 40, 16);
    sword.generateTexture('art_europe_sword', 300, 400);
    sword.destroy();

    // 3. Готический потир
    const chalice = this.make.graphics({ x: 0, y: 0, add: false });
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
    chalice.fillStyle(0xd4af37, 1);
    chalice.fillRect(140, 140, 20, 130);
    chalice.fillCircle(150, 200, 22);
    chalice.fillEllipse(150, 280, 120, 35);
    chalice.fillStyle(0xc0392b, 1);
    chalice.fillCircle(150, 200, 8);
    chalice.generateTexture('art_europe_chalice', 300, 400);
    chalice.destroy();

    // ==========================================
    // ФЕОДАЛЬНАЯ ЯПОНИЯ
    // ==========================================
    // 1. Катана самурая
    const katana = this.make.graphics({ x: 0, y: 0, add: false });
    katana.fillStyle(0xbdc3c7, 1);
    katana.beginPath();
    katana.moveTo(144, 90);
    katana.lineTo(158, 90);
    katana.lineTo(154, 355);
    katana.lineTo(142, 375);
    katana.lineTo(142, 350);
    katana.closePath();
    katana.fillPath();
    katana.fillStyle(0xecf0f1, 0.7);
    katana.fillRect(144, 95, 4, 260);
    katana.fillStyle(0xb7950b, 1);
    katana.fillCircle(150, 90, 24);
    katana.fillStyle(0x111111, 1);
    katana.fillRoundedRect(142, 35, 16, 52, 3);
    katana.generateTexture('art_japan_katana', 300, 400);
    katana.destroy();

    // 2. Маска Мэнгу
    const mengu = this.make.graphics({ x: 0, y: 0, add: false });
    mengu.fillStyle(0x78281f, 1);
    mengu.fillRoundedRect(60, 140, 180, 120, 20);
    mengu.fillStyle(0x1a1614, 1);
    mengu.fillEllipse(150, 155, 60, 30);
    mengu.fillRect(100, 205, 100, 16);
    mengu.fillStyle(0xf1c40f, 1);
    mengu.fillTriangle(115, 205, 125, 205, 120, 225);
    mengu.fillTriangle(175, 205, 185, 205, 180, 225);
    mengu.generateTexture('art_japan_mask', 300, 400);
    mengu.destroy();

    // 3. Нэцкэ «Дракон»
    const netsuke = this.make.graphics({ x: 0, y: 0, add: false });
    netsuke.fillStyle(0xd5dbdb, 1);
    netsuke.fillCircle(150, 200, 98);
    netsuke.lineStyle(16, 0xbdc3c7, 1);
    netsuke.strokeCircle(150, 200, 52);
    netsuke.fillStyle(0xd5dbdb, 1);
    netsuke.fillEllipse(150, 145, 60, 38);
    netsuke.fillStyle(0xd35400, 1);
    netsuke.fillCircle(138, 142, 9);
    netsuke.fillCircle(162, 142, 9);
    netsuke.generateTexture('art_japan_netsuke', 300, 400);
    netsuke.destroy();
  }
}
