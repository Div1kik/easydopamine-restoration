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
    // 1. ДРЕВНИЙ ЕГИПЕТ (9 HD АРТЕФАКТОВ)
    // ==========================================
    this.createEgyptArtifacts();

    // ==========================================
    // 2. АНТИЧНАЯ ГРЕЦИЯ (9 HD АРТЕФАКТОВ)
    // ==========================================
    this.createGreeceArtifacts();

    // ==========================================
    // 3. СРЕДНЕВЕКОВАЯ ЕВРОПА (9 HD АРТЕФАКТОВ)
    // ==========================================
    this.createEuropeArtifacts();

    // ==========================================
    // 4. ФЕОДАЛЬНАЯ ЯПОНИЯ (9 HD АРТЕФАКТОВ)
    // ==========================================
    this.createJapanArtifacts();

    // ==========================================
    // 5. ИНСТРУМЕНТЫ И ИНТЕРФЕЙС
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

    // Бустер
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

    // Замок
    const lock = this.make.graphics({ x: 0, y: 0, add: false });
    lock.lineStyle(4, 0xbdc3c7, 1);
    lock.strokeCircle(20, 14, 10);
    lock.fillStyle(0x7f8c8d, 1);
    lock.fillRoundedRect(8, 16, 24, 20, 4);
    lock.fillStyle(0x111111, 1);
    lock.fillCircle(20, 24, 3);
    lock.generateTexture('icon_lock', 40, 40);
    lock.destroy();

    // Частицы
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

  // ==================== РЕНДЕР ЕГИПТА ====================
  createEgyptArtifacts() {
    // 1. Скарабей
    const scarab = this.make.graphics({ x: 0, y: 0, add: false });
    scarab.fillStyle(0x0a0908, 0.45); scarab.fillEllipse(150, 215, 175, 235);
    scarab.fillStyle(0xb7950b, 1); scarab.fillEllipse(150, 200, 165, 225);
    scarab.fillStyle(0xd4af37, 1); scarab.fillEllipse(150, 198, 155, 215);
    scarab.fillStyle(0xf1c40f, 0.4); scarab.fillEllipse(135, 185, 90, 160);
    scarab.fillStyle(0x0f2b46, 1); scarab.fillEllipse(150, 195, 84, 144);
    scarab.fillStyle(0x1f618d, 1); scarab.fillEllipse(150, 190, 76, 134);
    scarab.fillStyle(0x5dade2, 0.5); scarab.fillEllipse(145, 180, 45, 90);
    scarab.fillStyle(0x9a7d0a, 1); scarab.fillCircle(150, 80, 36);
    scarab.fillStyle(0xd4af37, 1); scarab.fillCircle(150, 78, 30);
    scarab.lineStyle(10, 0x7d6608, 1);
    scarab.strokeLineShape(new Phaser.Geom.Line(95, 120, 35, 85));
    scarab.strokeLineShape(new Phaser.Geom.Line(205, 120, 265, 85));
    scarab.strokeLineShape(new Phaser.Geom.Line(75, 200, 25, 210));
    scarab.strokeLineShape(new Phaser.Geom.Line(225, 200, 275, 210));
    scarab.strokeLineShape(new Phaser.Geom.Line(95, 280, 45, 335));
    scarab.strokeLineShape(new Phaser.Geom.Line(205, 280, 255, 335));
    scarab.generateTexture('art_egypt_scarab', 300, 400); scarab.destroy();

    // 2. Маска
    const mask = this.make.graphics({ x: 0, y: 0, add: false });
    mask.fillStyle(0x0a0908, 0.4); mask.fillEllipse(150, 205, 185, 245);
    mask.fillStyle(0x1a5276, 1);
    mask.beginPath(); mask.moveTo(50, 80); mask.lineTo(250, 80); mask.lineTo(270, 260); mask.lineTo(220, 310); mask.lineTo(80, 310); mask.lineTo(30, 260); mask.closePath(); mask.fillPath();
    mask.fillStyle(0xd4af37, 1);
    for (let y = 100; y < 290; y += 28) mask.fillRect(45, y, 210, 14);
    mask.fillStyle(0xb7950b, 1); mask.fillEllipse(150, 185, 110, 140);
    mask.fillStyle(0xf1c40f, 1); mask.fillEllipse(150, 180, 100, 130);
    mask.fillStyle(0x17202a, 1); mask.fillRect(142, 245, 16, 50);
    mask.fillStyle(0x2980b9, 1); mask.fillRect(144, 250, 12, 40);
    mask.fillEllipse(125, 170, 24, 12); mask.fillEllipse(175, 170, 24, 12);
    mask.generateTexture('art_egypt_mask', 300, 400); mask.destroy();

    // 3. Анкх
    const ankh = this.make.graphics({ x: 0, y: 0, add: false });
    ankh.fillStyle(0x0a0908, 0.4); ankh.fillCircle(150, 135, 65); ankh.fillRect(132, 195, 36, 180);
    ankh.lineStyle(24, 0xb7950b, 1); ankh.strokeCircle(150, 130, 50);
    ankh.lineStyle(16, 0xf1c40f, 1); ankh.strokeCircle(150, 128, 50);
    ankh.fillStyle(0xb7950b, 1); ankh.fillRect(75, 185, 150, 30); ankh.fillRect(135, 185, 30, 180);
    ankh.fillStyle(0xf39c12, 1); ankh.fillRect(80, 190, 140, 20); ankh.fillRect(140, 190, 20, 170);
    ankh.generateTexture('art_egypt_ankh', 300, 400); ankh.destroy();

    // 4. Нефертити
    const nef = this.make.graphics({ x: 0, y: 0, add: false });
    nef.fillStyle(0x0a0908, 0.4); nef.fillEllipse(150, 210, 140, 240);
    // Высокая синяя корона
    nef.fillStyle(0x1f4e79, 1);
    nef.beginPath(); nef.moveTo(90, 160); nef.lineTo(210, 160); nef.lineTo(235, 55); nef.lineTo(65, 55); nef.closePath(); nef.fillPath();
    nef.fillStyle(0xd4af37, 1); nef.fillRect(78, 145, 144, 14);
    // Лицо и шея
    nef.fillStyle(0xd4a373, 1); nef.fillEllipse(150, 205, 75, 95); nef.fillRect(132, 245, 36, 75);
    nef.fillStyle(0xe76f51, 1); nef.fillEllipse(150, 225, 20, 8); // губы
    nef.generateTexture('art_egypt_nefertiti', 300, 400); nef.destroy();

    // 5. Око Гора
    const eye = this.make.graphics({ x: 0, y: 0, add: false });
    eye.fillStyle(0x0a0908, 0.4); eye.fillEllipse(150, 205, 190, 130);
    eye.lineStyle(18, 0xd4af37, 1); eye.beginPath(); eye.arc(150, 190, 80, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(150), false); eye.strokePath();
    eye.beginPath(); eye.arc(150, 190, 80, Phaser.Math.DegToRad(210), Phaser.Math.DegToRad(330), false); eye.strokePath();
    eye.fillStyle(0x1a5276, 1); eye.fillCircle(150, 190, 36);
    eye.fillStyle(0x111111, 1); eye.fillCircle(150, 190, 20);
    eye.fillStyle(0xffffff, 1); eye.fillCircle(144, 184, 8);
    eye.generateTexture('art_egypt_eye', 300, 400); eye.destroy();

    // 6. Канопа
    const canopic = this.make.graphics({ x: 0, y: 0, add: false });
    canopic.fillStyle(0x0a0908, 0.4); canopic.fillEllipse(150, 255, 140, 180);
    canopic.fillStyle(0xd5dbdb, 1); canopic.fillEllipse(150, 250, 130, 170); // сосуд
    canopic.fillStyle(0x1a1614, 1); // голова шакала
    canopic.fillCircle(150, 120, 40); canopic.fillTriangle(115, 120, 130, 60, 140, 120); canopic.fillTriangle(185, 120, 170, 60, 160, 120);
    canopic.fillStyle(0xd4af37, 1); canopic.fillRect(110, 155, 80, 12);
    canopic.generateTexture('art_egypt_canopic', 300, 400); canopic.destroy();

    // 7. Хопеш
    const khopesh = this.make.graphics({ x: 0, y: 0, add: false });
    khopesh.fillStyle(0x0a0908, 0.4); khopesh.fillRect(145, 50, 25, 320);
    khopesh.fillStyle(0xb7950b, 1); khopesh.fillRect(142, 220, 16, 130); // рукоять
    khopesh.fillStyle(0xd4af37, 1); // серповидный клинок
    khopesh.beginPath(); khopesh.moveTo(150, 220); khopesh.lineTo(150, 120); khopesh.arc(190, 100, 60, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(330), false);
    khopesh.lineTo(165, 45); khopesh.closePath(); khopesh.fillPath();
    khopesh.generateTexture('art_egypt_khopesh', 300, 400); khopesh.destroy();

    // 8. Систр
    const sistrum = this.make.graphics({ x: 0, y: 0, add: false });
    sistrum.fillStyle(0x0a0908, 0.4); sistrum.fillEllipse(150, 210, 130, 250);
    sistrum.fillStyle(0x8e5d34, 1); sistrum.fillRect(140, 240, 20, 120); // ручка
    sistrum.lineStyle(16, 0xd4af37, 1); sistrum.strokeCircle(150, 150, 65); // кольцо
    sistrum.fillStyle(0xb7950b, 1);
    sistrum.fillRect(95, 130, 110, 8); sistrum.fillRect(95, 165, 110, 8);
    sistrum.generateTexture('art_egypt_sistrum', 300, 400); sistrum.destroy();

    // 9. Сфинкс
    const sphinx = this.make.graphics({ x: 0, y: 0, add: false });
    sphinx.fillStyle(0x0a0908, 0.4); sphinx.fillRoundedRect(50, 185, 205, 130, 25);
    sphinx.fillStyle(0xb7950b, 1); sphinx.fillRoundedRect(50, 175, 195, 120, 20); // тело
    sphinx.fillStyle(0xd4af37, 1); sphinx.fillCircle(195, 130, 40); // голова
    sphinx.fillStyle(0x1a5276, 1); sphinx.fillRect(175, 95, 40, 12);
    sphinx.generateTexture('art_egypt_sphinx', 300, 400); sphinx.destroy();
  }

  // ==================== РЕНДЕР ГРЕЦИИ ====================
  createGreeceArtifacts() {
    // 1. Амфора
    const amphora = this.make.graphics({ x: 0, y: 0, add: false });
    amphora.fillStyle(0x0a0908, 0.4); amphora.fillEllipse(150, 210, 195, 275);
    amphora.fillStyle(0xa04000, 1); amphora.fillEllipse(150, 200, 186, 266);
    amphora.fillStyle(0xd35400, 1); amphora.fillEllipse(145, 195, 176, 256);
    amphora.fillStyle(0xe59866, 0.35); amphora.fillEllipse(130, 185, 100, 200);
    amphora.fillStyle(0x873600, 1);
    amphora.fillRect(110, 48, 80, 52); amphora.fillEllipse(150, 44, 102, 24);
    amphora.fillRect(115, 320, 70, 25); amphora.fillEllipse(150, 345, 112, 22);
    amphora.lineStyle(16, 0x6e2c00, 1);
    amphora.beginPath(); amphora.arc(88, 160, 46, Phaser.Math.DegToRad(70), Phaser.Math.DegToRad(270), true); amphora.strokePath();
    amphora.beginPath(); amphora.arc(212, 160, 46, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(110), false); amphora.strokePath();
    amphora.fillStyle(0x1a1614, 0.85); amphora.fillRect(75, 175, 150, 36); amphora.strokeCircle(150, 193, 14);
    amphora.generateTexture('art_greece_amphora', 300, 400); amphora.destroy();

    // 2. Шлем
    const helmet = this.make.graphics({ x: 0, y: 0, add: false });
    helmet.fillStyle(0x0a0908, 0.4); helmet.fillCircle(150, 185, 120);
    helmet.fillStyle(0x7d6608, 1); helmet.fillCircle(150, 170, 110);
    helmet.fillStyle(0xb7950b, 1); helmet.fillCircle(145, 165, 102);
    helmet.fillStyle(0x9a7d0a, 1);
    helmet.fillRect(70, 180, 50, 120); helmet.fillRect(180, 180, 50, 120); helmet.fillRect(138, 160, 24, 130);
    helmet.fillStyle(0xc0392b, 1);
    helmet.beginPath(); helmet.moveTo(50, 70); helmet.lineTo(250, 70); helmet.lineTo(210, 30); helmet.lineTo(90, 30); helmet.closePath(); helmet.fillPath();
    helmet.generateTexture('art_greece_helmet', 300, 400); helmet.destroy();

    // 3. Монета
    const coin = this.make.graphics({ x: 0, y: 0, add: false });
    coin.fillStyle(0x0a0908, 0.4); coin.fillCircle(150, 205, 125);
    coin.fillStyle(0x7f8c8d, 1); coin.fillCircle(150, 200, 120);
    coin.fillStyle(0xbdc3c7, 1); coin.fillCircle(145, 195, 114);
    coin.fillStyle(0x566573, 1);
    coin.fillEllipse(150, 205, 80, 110); coin.fillCircle(150, 145, 38);
    coin.fillStyle(0xbdc3c7, 1); coin.fillCircle(136, 142, 14); coin.fillCircle(164, 142, 14);
    coin.fillStyle(0x1c2833, 1); coin.fillCircle(136, 142, 6); coin.fillCircle(164, 142, 6);
    coin.generateTexture('art_greece_coin', 300, 400); coin.destroy();

    // 4. Щит Аспис
    const shield = this.make.graphics({ x: 0, y: 0, add: false });
    shield.fillStyle(0x0a0908, 0.4); shield.fillCircle(150, 205, 135);
    shield.fillStyle(0x9a7d0a, 1); shield.fillCircle(150, 200, 130);
    shield.fillStyle(0xd4af37, 1); shield.fillCircle(150, 200, 118);
    // Буква Лямбда (Спарта)
    shield.lineStyle(24, 0xc0392b, 1);
    shield.beginPath(); shield.moveTo(105, 260); shield.lineTo(150, 135); shield.lineTo(195, 260); shield.strokePath();
    shield.generateTexture('art_greece_shield', 300, 400); shield.destroy();

    // 5. Ника
    const nike = this.make.graphics({ x: 0, y: 0, add: false });
    nike.fillStyle(0x0a0908, 0.4); nike.fillEllipse(150, 210, 140, 240);
    nike.fillStyle(0xd5dbdb, 1); nike.fillEllipse(150, 220, 75, 150); // тело
    // Крылья
    nike.fillStyle(0xbdc3c7, 1);
    nike.fillTriangle(140, 150, 40, 60, 110, 220);
    nike.fillTriangle(160, 150, 260, 60, 190, 220);
    nike.generateTexture('art_greece_nike', 300, 400); nike.destroy();

    // 6. Светильник
    const lamp = this.make.graphics({ x: 0, y: 0, add: false });
    lamp.fillStyle(0x0a0908, 0.4); lamp.fillEllipse(150, 225, 170, 110);
    lamp.fillStyle(0xa04000, 1); lamp.fillEllipse(150, 220, 160, 95);
    lamp.fillStyle(0xd35400, 1); lamp.fillCircle(120, 220, 45); // резервуар
    lamp.fillRect(145, 205, 75, 30); // носик
    lamp.fillStyle(0xf39c12, 1); lamp.fillCircle(220, 220, 12); // огонек
    lamp.generateTexture('art_greece_lamp', 300, 400); lamp.destroy();

    // 7. Диск метателя
    const discus = this.make.graphics({ x: 0, y: 0, add: false });
    discus.fillStyle(0x0a0908, 0.4); discus.fillCircle(150, 205, 130);
    discus.fillStyle(0x7d6608, 1); discus.fillCircle(150, 200, 125);
    discus.fillStyle(0xb7950b, 1); discus.fillCircle(150, 200, 115);
    discus.lineStyle(8, 0x5d4c06, 1); discus.strokeCircle(150, 200, 60);
    discus.generateTexture('art_greece_discus', 300, 400); discus.destroy();

    // 8. Килик
    const kylix = this.make.graphics({ x: 0, y: 0, add: false });
    kylix.fillStyle(0x0a0908, 0.4); kylix.fillEllipse(150, 225, 190, 120);
    kylix.fillStyle(0xa04000, 1); kylix.fillEllipse(150, 200, 180, 80);
    kylix.fillStyle(0x1a1614, 1); kylix.fillEllipse(150, 195, 160, 60);
    kylix.fillRect(142, 220, 16, 70); kylix.fillEllipse(150, 290, 80, 18); // ножка
    kylix.generateTexture('art_greece_kylix', 300, 400); kylix.destroy();

    // 9. Лира
    const lyre = this.make.graphics({ x: 0, y: 0, add: false });
    lyre.fillStyle(0x0a0908, 0.4); lyre.fillRoundedRect(70, 75, 160, 260, 30);
    lyre.fillStyle(0x6e2c00, 1); lyre.fillCircle(150, 250, 65); // панцирь
    lyre.lineStyle(16, 0xd4af37, 1);
    lyre.strokeLineShape(new Phaser.Geom.Line(95, 230, 85, 90));
    lyre.strokeLineShape(new Phaser.Geom.Line(205, 230, 215, 90));
    lyre.strokeLineShape(new Phaser.Geom.Line(80, 100, 220, 100)); // перекладина
    lyre.generateTexture('art_greece_lyre', 300, 400); lyre.destroy();
  }

  // ==================== РЕНДЕР ЕВРОПЫ ====================
  createEuropeArtifacts() {
    // 1. Щит
    const shield = this.make.graphics({ x: 0, y: 0, add: false });
    shield.fillStyle(0x0a0908, 0.4);
    shield.beginPath(); shield.moveTo(50, 68); shield.lineTo(250, 68); shield.lineTo(250, 228); shield.lineTo(150, 358); shield.lineTo(50, 228); shield.closePath(); shield.fillPath();
    shield.fillStyle(0x4d5656, 1);
    shield.beginPath(); shield.moveTo(50, 60); shield.lineTo(250, 60); shield.lineTo(250, 220); shield.lineTo(150, 350); shield.lineTo(50, 220); shield.closePath(); shield.fillPath();
    shield.fillStyle(0x7f8c8d, 1);
    shield.beginPath(); shield.moveTo(58, 68); shield.lineTo(242, 68); shield.lineTo(242, 215); shield.lineTo(150, 338); shield.lineTo(58, 215); shield.closePath(); shield.fillPath();
    shield.lineStyle(10, 0xbdc3c7, 1); shield.strokePath();
    shield.fillStyle(0xc0392b, 1); shield.fillRect(135, 75, 30, 210); shield.fillRect(80, 140, 140, 30);
    shield.generateTexture('art_europe_shield', 300, 400); shield.destroy();

    // 2. Меч
    const sword = this.make.graphics({ x: 0, y: 0, add: false });
    sword.fillStyle(0x0a0908, 0.4); sword.fillRect(144, 48, 22, 330);
    sword.fillStyle(0x95a5a6, 1);
    sword.beginPath(); sword.moveTo(136, 100); sword.lineTo(164, 100); sword.lineTo(158, 350); sword.lineTo(150, 375); sword.lineTo(142, 350); sword.closePath(); sword.fillPath();
    sword.fillStyle(0x515a5a, 1); sword.fillRect(148, 105, 4, 230);
    sword.fillStyle(0xd4af37, 1); sword.fillRoundedRect(80, 95, 140, 18, 5);
    sword.fillStyle(0x5d4037, 1); sword.fillRoundedRect(142, 45, 16, 55, 3);
    sword.fillStyle(0xd4af37, 1); sword.fillCircle(150, 40, 16);
    sword.generateTexture('art_europe_sword', 300, 400); sword.destroy();

    // 3. Потир
    const chalice = this.make.graphics({ x: 0, y: 0, add: false });
    chalice.fillStyle(0x0a0908, 0.4); chalice.fillEllipse(150, 210, 170, 240);
    chalice.fillStyle(0xb7950b, 1);
    chalice.beginPath(); chalice.arc(150, 140, 80, 0, Math.PI, false); chalice.closePath(); chalice.fillPath();
    chalice.fillStyle(0xf1c40f, 1);
    chalice.beginPath(); chalice.arc(150, 138, 72, 0, Math.PI, false); chalice.closePath(); chalice.fillPath();
    chalice.fillStyle(0xd4af37, 1);
    chalice.fillRect(140, 140, 20, 130); chalice.fillCircle(150, 200, 22); chalice.fillEllipse(150, 280, 120, 35);
    chalice.fillStyle(0xc0392b, 1); chalice.fillCircle(150, 200, 8); chalice.fillCircle(115, 160, 6); chalice.fillCircle(185, 160, 6);
    chalice.generateTexture('art_europe_chalice', 300, 400); chalice.destroy();

    // 4. Корона
    const crown = this.make.graphics({ x: 0, y: 0, add: false });
    crown.fillStyle(0x0a0908, 0.4); crown.fillRoundedRect(50, 160, 205, 120, 10);
    crown.fillStyle(0xb7950b, 1); crown.fillRect(60, 200, 180, 60);
    crown.fillStyle(0xd4af37, 1);
    crown.fillTriangle(60, 200, 95, 120, 130, 200);
    crown.fillTriangle(115, 200, 150, 95, 185, 200);
    crown.fillTriangle(170, 200, 205, 120, 240, 200);
    crown.fillStyle(0xc0392b, 1); crown.fillCircle(150, 125, 10);
    crown.fillStyle(0x2980b9, 1); crown.fillCircle(95, 145, 8); crown.fillCircle(205, 145, 8);
    crown.generateTexture('art_europe_crown', 300, 400); crown.destroy();

    // 5. Секира
    const axe = this.make.graphics({ x: 0, y: 0, add: false });
    axe.fillStyle(0x0a0908, 0.4); axe.fillRect(142, 45, 24, 330);
    axe.fillStyle(0x5d4037, 1); axe.fillRect(140, 40, 20, 320); // топорище
    axe.fillStyle(0x7f8c8d, 1);
    axe.beginPath(); axe.moveTo(150, 90); axe.lineTo(240, 60); axe.arc(240, 130, 70, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(90), false); axe.lineTo(150, 170); axe.closePath(); axe.fillPath();
    axe.generateTexture('art_europe_axe', 300, 400); axe.destroy();

    // 6. Бацинет
    const bascinet = this.make.graphics({ x: 0, y: 0, add: false });
    bascinet.fillStyle(0x0a0908, 0.4); bascinet.fillCircle(150, 185, 115);
    bascinet.fillStyle(0x566573, 1); bascinet.fillCircle(150, 170, 105);
    // Вытянутое забрало
    bascinet.fillStyle(0x7f8c8d, 1);
    bascinet.beginPath(); bascinet.moveTo(120, 160); bascinet.lineTo(235, 195); bascinet.lineTo(120, 230); bascinet.closePath(); bascinet.fillPath();
    bascinet.generateTexture('art_europe_bascinet', 300, 400); bascinet.destroy();

    // 7. Книга
    const book = this.make.graphics({ x: 0, y: 0, add: false });
    book.fillStyle(0x0a0908, 0.4); book.fillRoundedRect(65, 85, 175, 240, 10);
    book.fillStyle(0x4a235a, 1); book.fillRoundedRect(60, 80, 170, 230, 8); // бархат
    book.fillStyle(0xbdc3c7, 1); // серебряный оклад
    book.strokeRect(75, 95, 140, 200); book.fillRect(135, 120, 20, 150); book.fillRect(95, 165, 100, 20);
    book.generateTexture('art_europe_book', 300, 400); book.destroy();

    // 8. Перчатка
    const gaunt = this.make.graphics({ x: 0, y: 0, add: false });
    gaunt.fillStyle(0x0a0908, 0.4); gaunt.fillRoundedRect(95, 95, 115, 230, 20);
    gaunt.fillStyle(0x7f8c8d, 1); gaunt.fillRoundedRect(90, 90, 110, 220, 16);
    gaunt.fillStyle(0x95a5a6, 1);
    for (let y = 130; y < 270; y += 30) gaunt.fillRect(95, y, 100, 18); // сегменты
    gaunt.generateTexture('art_europe_gauntlet', 300, 400); gaunt.destroy();

    // 9. Рог
    const horn = this.make.graphics({ x: 0, y: 0, add: false });
    horn.fillStyle(0x0a0908, 0.4); horn.fillCircle(150, 205, 125);
    horn.fillStyle(0x3e2723, 1);
    horn.beginPath(); horn.arc(150, 190, 90, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(200), false); horn.lineTo(150, 280); horn.closePath(); horn.fillPath();
    horn.fillStyle(0xbdc3c7, 1); horn.fillRect(195, 160, 35, 30); // оправа
    horn.generateTexture('art_europe_horn', 300, 400); horn.destroy();
  }

  // ==================== РЕНДЕР ЯПОНИИ ====================
  createJapanArtifacts() {
    // 1. Катана
    const katana = this.make.graphics({ x: 0, y: 0, add: false });
    katana.fillStyle(0x0a0908, 0.4); katana.fillRect(144, 40, 26, 340);
    katana.fillStyle(0xbdc3c7, 1);
    katana.beginPath(); katana.moveTo(144, 90); katana.lineTo(158, 90); katana.lineTo(154, 355); katana.lineTo(142, 375); katana.lineTo(142, 350); katana.closePath(); katana.fillPath();
    katana.fillStyle(0xecf0f1, 0.7); katana.fillRect(144, 95, 4, 260); // хамон
    katana.fillStyle(0xb7950b, 1); katana.fillCircle(150, 90, 24);
    katana.fillStyle(0x111111, 1); katana.fillRoundedRect(142, 35, 16, 52, 3);
    katana.generateTexture('art_japan_katana', 300, 400); katana.destroy();

    // 2. Маска Мэнгу
    const mengu = this.make.graphics({ x: 0, y: 0, add: false });
    mengu.fillStyle(0x0a0908, 0.4); mengu.fillEllipse(150, 205, 190, 160);
    mengu.fillStyle(0x78281f, 1); mengu.fillRoundedRect(60, 140, 180, 120, 20);
    mengu.fillStyle(0xc0392b, 0.5); mengu.fillEllipse(150, 175, 120, 45);
    mengu.fillStyle(0x1a1614, 1); mengu.fillEllipse(150, 155, 60, 30); mengu.fillRect(100, 205, 100, 16);
    mengu.fillStyle(0xf1c40f, 1);
    mengu.fillTriangle(115, 205, 125, 205, 120, 225); mengu.fillTriangle(175, 205, 185, 205, 180, 225);
    mengu.generateTexture('art_japan_mask', 300, 400); mengu.destroy();

    // 3. Нэцкэ
    const netsuke = this.make.graphics({ x: 0, y: 0, add: false });
    netsuke.fillStyle(0x0a0908, 0.4); netsuke.fillCircle(150, 205, 105);
    netsuke.fillStyle(0xd5dbdb, 1); netsuke.fillCircle(150, 200, 98);
    netsuke.fillStyle(0xfdfefe, 1); netsuke.fillCircle(145, 195, 90);
    netsuke.lineStyle(16, 0xbdc3c7, 1); netsuke.strokeCircle(150, 200, 52);
    netsuke.fillStyle(0xd5dbdb, 1); netsuke.fillEllipse(150, 145, 60, 38);
    netsuke.fillStyle(0xd35400, 1); netsuke.fillCircle(138, 142, 9); netsuke.fillCircle(162, 142, 9);
    netsuke.generateTexture('art_japan_netsuke', 300, 400); netsuke.destroy();

    // 4. Кабуто
    const kabuto = this.make.graphics({ x: 0, y: 0, add: false });
    kabuto.fillStyle(0x0a0908, 0.4); kabuto.fillCircle(150, 205, 120);
    kabuto.fillStyle(0x1a1614, 1); kabuto.fillCircle(150, 190, 100);
    // Золотой серп-маэдатэ
    kabuto.fillStyle(0xd4af37, 1);
    kabuto.beginPath(); kabuto.arc(150, 140, 75, Phaser.Math.DegToRad(170), Phaser.Math.DegToRad(370), false);
    kabuto.arc(150, 130, 65, Phaser.Math.DegToRad(370), Phaser.Math.DegToRad(170), true); kabuto.closePath(); kabuto.fillPath();
    kabuto.generateTexture('art_japan_kabuto', 300, 400); kabuto.destroy();

    // 5. Тэссэн
    const tessen = this.make.graphics({ x: 0, y: 0, add: false });
    tessen.fillStyle(0x0a0908, 0.4); tessen.fillCircle(150, 215, 130);
    tessen.fillStyle(0x7f8c8d, 1);
    tessen.beginPath(); tessen.moveTo(150, 290); tessen.lineTo(60, 120); tessen.arc(150, 290, 190, Phaser.Math.DegToRad(205), Phaser.Math.DegToRad(335), false); tessen.closePath(); tessen.fillPath();
    tessen.fillStyle(0xc0392b, 1); tessen.fillCircle(150, 185, 32); // красное солнце
    tessen.generateTexture('art_japan_tessen', 300, 400); tessen.destroy();

    // 6. Сацума
    const satsuma = this.make.graphics({ x: 0, y: 0, add: false });
    satsuma.fillStyle(0x0a0908, 0.4); satsuma.fillEllipse(150, 220, 150, 220);
    satsuma.fillStyle(0xf5eef8, 1); satsuma.fillEllipse(150, 215, 140, 210);
    satsuma.fillStyle(0xd4af37, 1); satsuma.fillRect(115, 95, 70, 25); satsuma.strokeCircle(150, 215, 35);
    satsuma.generateTexture('art_japan_satsuma', 300, 400); satsuma.destroy();

    // 7. Танто
    const tanto = this.make.graphics({ x: 0, y: 0, add: false });
    tanto.fillStyle(0x0a0908, 0.4); tanto.fillRect(144, 70, 22, 270);
    tanto.fillStyle(0x111111, 1); tanto.fillRoundedRect(142, 60, 18, 140, 4); // ножны
    tanto.fillStyle(0xbdc3c7, 1); tanto.fillRect(144, 205, 14, 115); // клинок
    tanto.generateTexture('art_japan_tanto', 300, 400); tanto.destroy();

    // 8. Шкатулка
    const box = this.make.graphics({ x: 0, y: 0, add: false });
    box.fillStyle(0x0a0908, 0.4); box.fillRoundedRect(65, 135, 175, 155, 15);
    box.fillStyle(0x140d0d, 1); box.fillRoundedRect(60, 130, 170, 150, 12);
    box.fillStyle(0xd4af37, 1); box.fillCircle(145, 195, 18); box.fillCircle(175, 175, 12); // золотая сакура
    box.generateTexture('art_japan_box', 300, 400); box.destroy();

    // 9. Бонсё
    const bell = this.make.graphics({ x: 0, y: 0, add: false });
    bell.fillStyle(0x0a0908, 0.4); bell.fillRoundedRect(85, 105, 135, 210, 20);
    bell.fillStyle(0x273746, 1); bell.fillRoundedRect(80, 100, 130, 200, 16);
    bell.fillStyle(0xd4af37, 1);
    for (let y = 140; y < 230; y += 28) {
      bell.fillCircle(110, y, 6); bell.fillCircle(150, y, 6); bell.fillCircle(190, y, 6);
    }
    bell.generateTexture('art_japan_bell', 300, 400); bell.destroy();
  }
}
