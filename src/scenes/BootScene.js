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

    // 1. ВИЗУАЛЬНАЯ ЭВОЛЮЦИЯ МАСТЕРСКОЙ (4 РЕАЛЬНЫХ ТЕМЫ ИНТЕРЬЕРА)
    this.createWorkshopThemes(width, height);

    // 2. ИНСТРУМЕНТЫ В ЛОТОК
    this.createToolIcons();

    // 3. МАСКИ ЛАСТИКОВ
    this.createCircleMask('mask_scraper', 28);
    this.createCircleMask('mask_solvent', 48);
    this.createCircleMask('mask_glue', 20);
    this.createCircleMask('mask_brush', 22);
    this.createCircleMask('mask_polish', 56);

    // 4. ГЕНЕРАЦИЯ АРТЕФАКТОВ ВСЕХ 5 РЕГИОНОВ
    this.createAllArtifacts();

    // 5. ТЕКСТУРЫ СКОЛОВ И ОСКОЛКОВ
    this.createShardTextures();

    // 6. ИНТЕРФЕЙС И ЧАСТИЦЫ
    this.createUIElements();

    this.scene.start('MenuScene');
  }

  createWorkshopThemes(w, h) {
    // ТЕМА 1: Сырой подвал мастера (грубый старый дуб, кирпич, керосинка)
    const t1 = this.make.graphics({ x: 0, y: 0, add: false });
    t1.fillStyle(0x13110f, 1); t1.fillRect(0, 0, w, h);
    t1.fillStyle(0x211a14, 0.45);
    for (let y = 0; y < h; y += 45) t1.fillRect(0, y, w, 38);
    t1.fillStyle(0xd35400, 0.12); t1.fillCircle(w / 2, h * 0.42, 220); // тусклое пламя
    t1.generateTexture('bg_workshop_tier_1', w, h); t1.destroy();

    // ТЕМА 2: Лавка антиквара (лакированный ясень, зеленый абажур, бархатный лоток)
    const t2 = this.make.graphics({ x: 0, y: 0, add: false });
    t2.fillStyle(0x181a17, 1); t2.fillRect(0, 0, w, h);
    t2.fillStyle(0x2d3429, 0.5);
    for (let y = 0; y < h; y += 50) t2.fillRect(0, y, w, 44);
    t2.fillStyle(0x27ae60, 0.10); t2.fillCircle(w / 2, h * 0.42, 260); // зеленый свет лампы
    t2.fillStyle(0x1e272c, 0.85); t2.fillRoundedRect(w * 0.08, h * 0.22, w * 0.84, 380, 16); // сукно стола
    t2.generateTexture('bg_workshop_tier_2', w, h); t2.destroy();

    // ТЕМА 3: Гильдия реставраторов (темный орех, золотая инкрустация, синее сукно)
    const t3 = this.make.graphics({ x: 0, y: 0, add: false });
    t3.fillStyle(0x12141a, 1); t3.fillRect(0, 0, w, h);
    t3.fillStyle(0x1a2130, 0.5);
    for (let y = 0; y < h; y += 55) t3.fillRect(0, y, w, 50);
    t3.fillStyle(0x2980b9, 0.12); t3.fillCircle(w / 2, h * 0.42, 280);
    t3.fillStyle(0x152238, 0.9); t3.fillRoundedRect(w * 0.07, h * 0.20, w * 0.86, 400, 20);
    t3.lineStyle(2, 0xd4af37, 0.6); t3.strokeRoundedRect(w * 0.07, h * 0.20, w * 0.86, 400, 20);
    t3.generateTexture('bg_workshop_tier_3', w, h); t3.destroy();

    // ТЕМА 4: Императорская лаборатория (каррарский мрамор, споты, латунь)
    const t4 = this.make.graphics({ x: 0, y: 0, add: false });
    t4.fillStyle(0x19191d, 1); t4.fillRect(0, 0, w, h);
    t4.fillStyle(0x2b2b36, 0.3); t4.fillRect(0, 0, w, h);
    t4.fillStyle(0xffffff, 0.15); t4.fillCircle(w / 2, h * 0.42, 300); // яркий софит
    t4.fillStyle(0xd5dbdb, 0.95); t4.fillRoundedRect(w * 0.06, h * 0.19, w * 0.88, 410, 22); // мраморная плита
    // Прожилки мрамора
    t4.lineStyle(2, 0x95a5a6, 0.4);
    t4.strokeLineShape(new Phaser.Geom.Line(w * 0.1, h * 0.25, w * 0.4, h * 0.5));
    t4.strokeLineShape(new Phaser.Geom.Line(w * 0.5, h * 0.3, w * 0.85, h * 0.45));
    t4.lineStyle(3, 0xd4af37, 0.8); t4.strokeRoundedRect(w * 0.06, h * 0.19, w * 0.88, 410, 22);
    t4.generateTexture('bg_workshop_tier_4', w, h); t4.destroy();
  }

  createToolIcons() {
    // Скребок
    const scraper = this.make.graphics({ x: 0, y: 0, add: false });
    scraper.fillStyle(0x8e5d34, 1); scraper.fillRoundedRect(28, 55, 24, 60, 4);
    scraper.fillStyle(0xbdc3c7, 1); scraper.fillRect(24, 40, 32, 18);
    scraper.fillStyle(0x95a5a6, 1); scraper.fillTriangle(20, 40, 60, 40, 40, 10);
    scraper.generateTexture('slot_scraper', 80, 120); scraper.destroy();

    // Растворитель
    const solvent = this.make.graphics({ x: 0, y: 0, add: false });
    solvent.fillStyle(0x27ae60, 1); solvent.fillRoundedRect(18, 30, 44, 75, 8);
    solvent.fillStyle(0x2ecc71, 1); solvent.fillRect(28, 12, 24, 20);
    solvent.fillStyle(0xffffff, 0.3); solvent.fillRect(24, 40, 8, 55);
    solvent.generateTexture('slot_solvent', 80, 120); solvent.destroy();

    // Клей Кинцуги
    const glue = this.make.graphics({ x: 0, y: 0, add: false });
    glue.fillStyle(0xd4af37, 1);
    glue.beginPath(); glue.moveTo(25, 110); glue.lineTo(55, 110); glue.lineTo(50, 40); glue.lineTo(30, 40); glue.closePath(); glue.fillPath();
    glue.fillStyle(0xc0392b, 1); glue.fillRect(34, 15, 12, 25);
    glue.generateTexture('slot_glue', 80, 120); glue.destroy();

    // Кисть
    const brush = this.make.graphics({ x: 0, y: 0, add: false });
    brush.fillStyle(0x2c3e50, 1); brush.fillRoundedRect(36, 30, 8, 85, 3);
    brush.fillStyle(0xd4af37, 1); brush.fillRect(34, 24, 12, 8);
    brush.fillStyle(0xc0392b, 1); brush.fillTriangle(34, 24, 46, 24, 40, 5);
    brush.generateTexture('slot_brush', 80, 120); brush.destroy();

    // Замша
    const cloth = this.make.graphics({ x: 0, y: 0, add: false });
    cloth.fillStyle(0x8e44ad, 1); cloth.fillRoundedRect(15, 35, 50, 55, 10);
    cloth.fillStyle(0x9b59b6, 1); cloth.fillRoundedRect(22, 42, 36, 40, 6);
    cloth.generateTexture('slot_polish', 80, 120); cloth.destroy();
  }

  createShardTextures() {
    // 1. Ручка амфоры
    const s1 = this.make.graphics({ x: 0, y: 0, add: false });
    s1.fillStyle(0xd35400, 1);
    s1.beginPath(); s1.moveTo(10, 10); s1.lineTo(55, 18); s1.lineTo(45, 60); s1.lineTo(15, 45); s1.closePath(); s1.fillPath();
    s1.lineStyle(3, 0x873600, 1); s1.strokePath();
    s1.generateTexture('shard_amphora', 65, 70); s1.destroy();

    // 2. Крыло скарабея
    const s2 = this.make.graphics({ x: 0, y: 0, add: false });
    s2.fillStyle(0xd4af37, 1); s2.fillEllipse(30, 30, 25, 40);
    s2.fillStyle(0x1f618d, 1); s2.fillCircle(30, 30, 12);
    s2.generateTexture('shard_scarab_wing', 60, 60); s2.destroy();

    // 3. Острие меча
    const s3 = this.make.graphics({ x: 0, y: 0, add: false });
    s3.fillStyle(0xbdc3c7, 1);
    s3.fillTriangle(15, 10, 45, 10, 30, 65);
    s3.generateTexture('shard_sword_tip', 60, 75); s3.destroy();

    // 4. Нефритовая плитка Майя
    const s4 = this.make.graphics({ x: 0, y: 0, add: false });
    s4.fillStyle(0x1abc9c, 1); s4.fillRoundedRect(10, 10, 45, 45, 6);
    s4.fillStyle(0x16a085, 1); s4.fillCircle(32, 32, 10);
    s4.generateTexture('shard_jade_piece', 65, 65); s4.destroy();
  }

  createCircleMask(key, radius) {
    const mask = this.make.graphics({ x: 0, y: 0, add: false });
    mask.fillStyle(0xffffff, 1);
    mask.fillCircle(radius, radius, radius);
    mask.generateTexture(key, radius * 2, radius * 2);
    mask.destroy();
  }

  createAllArtifacts() {
    // ЕГИПЕТ
    const scarab = this.make.graphics({ x: 0, y: 0, add: false });
    scarab.fillStyle(0xb7950b, 1); scarab.fillEllipse(150, 200, 165, 225);
    scarab.fillStyle(0xd4af37, 1); scarab.fillEllipse(150, 198, 155, 215);
    scarab.fillStyle(0x0f2b46, 1); scarab.fillEllipse(150, 195, 84, 144);
    scarab.fillStyle(0xd4af37, 1); scarab.fillCircle(150, 78, 32);
    scarab.generateTexture('art_egypt_scarab', 300, 400); scarab.destroy();

    const mask = this.make.graphics({ x: 0, y: 0, add: false });
    mask.fillStyle(0x1a5276, 1);
    mask.beginPath(); mask.moveTo(50, 80); mask.lineTo(250, 80); mask.lineTo(270, 260); mask.lineTo(220, 310); mask.lineTo(80, 310); mask.lineTo(30, 260); mask.closePath(); mask.fillPath();
    mask.fillStyle(0xd4af37, 1); for (let y = 100; y < 290; y += 28) mask.fillRect(45, y, 210, 14);
    mask.fillStyle(0xf1c40f, 1); mask.fillEllipse(150, 180, 100, 130);
    mask.generateTexture('art_egypt_mask', 300, 400); mask.destroy();

    const ankh = this.make.graphics({ x: 0, y: 0, add: false });
    ankh.lineStyle(22, 0xb7950b, 1); ankh.strokeCircle(150, 130, 50);
    ankh.fillStyle(0xb7950b, 1); ankh.fillRect(75, 185, 150, 30); ankh.fillRect(135, 185, 30, 180);
    ankh.generateTexture('art_egypt_ankh', 300, 400); ankh.destroy();

    // ГРЕЦИЯ
    const amphora = this.make.graphics({ x: 0, y: 0, add: false });
    amphora.fillStyle(0xa04000, 1); amphora.fillEllipse(150, 200, 186, 266);
    amphora.fillStyle(0xd35400, 1); amphora.fillEllipse(145, 195, 176, 256);
    amphora.fillStyle(0x873600, 1); amphora.fillRect(110, 48, 80, 52); amphora.fillRect(115, 320, 70, 25);
    amphora.generateTexture('art_greece_amphora', 300, 400); amphora.destroy();

    const helmet = this.make.graphics({ x: 0, y: 0, add: false });
    helmet.fillStyle(0x7d6608, 1); helmet.fillCircle(150, 170, 110);
    helmet.fillStyle(0xb7950b, 1); helmet.fillCircle(145, 165, 102);
    helmet.fillRect(70, 180, 50, 120); helmet.fillRect(180, 180, 50, 120);
    helmet.generateTexture('art_greece_helmet', 300, 400); helmet.destroy();

    const coin = this.make.graphics({ x: 0, y: 0, add: false });
    coin.fillStyle(0x7f8c8d, 1); coin.fillCircle(150, 200, 120);
    coin.fillStyle(0xbdc3c7, 1); coin.fillCircle(145, 195, 114);
    coin.generateTexture('art_greece_coin', 300, 400); coin.destroy();

    // ЕВРОПА
    const shield = this.make.graphics({ x: 0, y: 0, add: false });
    shield.fillStyle(0x4d5656, 1);
    shield.beginPath(); shield.moveTo(50, 60); shield.lineTo(250, 60); shield.lineTo(250, 220); shield.lineTo(150, 350); shield.lineTo(50, 220); shield.closePath(); shield.fillPath();
    shield.fillStyle(0xc0392b, 1); shield.fillRect(135, 75, 30, 210); shield.fillRect(80, 140, 140, 30);
    shield.generateTexture('art_europe_shield', 300, 400); shield.destroy();

    const sword = this.make.graphics({ x: 0, y: 0, add: false });
    sword.fillStyle(0x95a5a6, 1);
    sword.beginPath(); sword.moveTo(136, 100); sword.lineTo(164, 100); sword.lineTo(158, 350); sword.lineTo(150, 375); sword.lineTo(142, 350); sword.closePath(); sword.fillPath();
    sword.fillStyle(0xd4af37, 1); sword.fillRoundedRect(80, 95, 140, 18, 5); sword.fillCircle(150, 40, 16);
    sword.generateTexture('art_europe_sword', 300, 400); sword.destroy();

    const chalice = this.make.graphics({ x: 0, y: 0, add: false });
    chalice.fillStyle(0xb7950b, 1);
    chalice.beginPath(); chalice.arc(150, 140, 80, 0, Math.PI, false); chalice.closePath(); chalice.fillPath();
    chalice.fillRect(140, 140, 20, 130); chalice.fillEllipse(150, 280, 120, 35);
    chalice.generateTexture('art_europe_chalice', 300, 400); chalice.destroy();

    // ЯПОНИЯ
    const katana = this.make.graphics({ x: 0, y: 0, add: false });
    katana.fillStyle(0xbdc3c7, 1);
    katana.beginPath(); katana.moveTo(144, 90); katana.lineTo(158, 90); katana.lineTo(154, 355); katana.lineTo(142, 375); katana.lineTo(142, 350); katana.closePath(); katana.fillPath();
    katana.fillStyle(0xb7950b, 1); katana.fillCircle(150, 90, 24);
    katana.generateTexture('art_japan_katana', 300, 400); katana.destroy();

    const mengu = this.make.graphics({ x: 0, y: 0, add: false });
    mengu.fillStyle(0x78281f, 1); mengu.fillRoundedRect(60, 140, 180, 120, 20);
    mengu.fillStyle(0xf1c40f, 1); mengu.fillTriangle(115, 205, 125, 205, 120, 225); mengu.fillTriangle(175, 205, 185, 205, 180, 225);
    mengu.generateTexture('art_japan_mask', 300, 400); mengu.destroy();

    const netsuke = this.make.graphics({ x: 0, y: 0, add: false });
    netsuke.fillStyle(0xd5dbdb, 1); netsuke.fillCircle(150, 200, 98);
    netsuke.fillStyle(0xd35400, 1); netsuke.fillCircle(138, 142, 9); netsuke.fillCircle(162, 142, 9);
    netsuke.generateTexture('art_japan_netsuke', 300, 400); netsuke.destroy();

    // МЕЗОАМЕРИКА (МАЙЯ)
    const mesoMask = this.make.graphics({ x: 0, y: 0, add: false });
    mesoMask.fillStyle(0x16a085, 1); mesoMask.fillEllipse(150, 200, 150, 210);
    mesoMask.fillStyle(0x1abc9c, 1); mesoMask.fillEllipse(150, 195, 140, 195);
    mesoMask.fillStyle(0xf1c40f, 1); mesoMask.fillCircle(115, 175, 18); mesoMask.fillCircle(185, 175, 18); // золотые глаза
    mesoMask.fillStyle(0x111111, 1); mesoMask.fillCircle(115, 175, 8); mesoMask.fillCircle(185, 175, 8);
    mesoMask.generateTexture('art_meso_mask', 300, 400); mesoMask.destroy();

    const mesoDisk = this.make.graphics({ x: 0, y: 0, add: false });
    mesoDisk.fillStyle(0x566573, 1); mesoDisk.fillCircle(150, 200, 125);
    mesoDisk.fillStyle(0xd4af37, 1); mesoDisk.fillCircle(150, 200, 110);
    mesoDisk.fillStyle(0x7f8c8d, 1); mesoDisk.fillCircle(150, 200, 60);
    mesoDisk.generateTexture('art_meso_disk', 300, 400); mesoDisk.destroy();

    const mesoDag = this.make.graphics({ x: 0, y: 0, add: false });
    mesoDag.fillStyle(0x1a1a1a, 1); // черное вулканическое стекло (обсидиан)
    mesoDag.beginPath(); mesoDag.moveTo(135, 100); mesoDag.lineTo(165, 100); mesoDag.lineTo(150, 360); mesoDag.closePath(); mesoDag.fillPath();
    mesoDag.fillStyle(0xd4af37, 1); mesoDag.fillRoundedRect(125, 45, 50, 60, 10); // золотая голова ягуара
    mesoDag.generateTexture('art_meso_dagger', 300, 400); mesoDag.destroy();
  }

  createUIElements() {
    const lock = this.make.graphics({ x: 0, y: 0, add: false });
    lock.lineStyle(4, 0xbdc3c7, 1); lock.strokeCircle(20, 14, 10);
    lock.fillStyle(0x7f8c8d, 1); lock.fillRoundedRect(8, 16, 24, 20, 4);
    lock.fillStyle(0x111111, 1); lock.fillCircle(20, 24, 3);
    lock.generateTexture('icon_lock', 40, 40); lock.destroy();

    const star = this.make.graphics({ x: 0, y: 0, add: false });
    star.fillStyle(0xf1c40f, 1); star.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = (i % 2 === 0) ? 16 : 7;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const x = 20 + r * Math.cos(angle);
      const y = 20 + r * Math.sin(angle);
      if (i === 0) star.moveTo(x, y); else star.lineTo(x, y);
    }
    star.closePath(); star.fillPath();
    star.generateTexture('icon_star', 40, 40); star.destroy();

    const conf = this.make.graphics({ x: 0, y: 0, add: false });
    conf.fillStyle(0xffffff, 1); conf.fillRect(0, 0, 8, 8);
    conf.generateTexture('particle_confetti', 8, 8); conf.destroy();

    const dust = this.make.graphics({ x: 0, y: 0, add: false });
    dust.fillStyle(0xffffff, 1); dust.fillCircle(4, 4, 4);
    dust.generateTexture('particle_dust', 8, 8); dust.destroy();

    const home = this.make.graphics({ x: 0, y: 0, add: false });
    home.fillStyle(0xffffff, 1); home.beginPath(); home.moveTo(20, 8); home.lineTo(6, 20); home.lineTo(34, 20); home.closePath(); home.fillPath(); home.fillRect(11, 20, 18, 14);
    home.generateTexture('icon_home', 40, 40); home.destroy();

    const speaker = this.make.graphics({ x: 0, y: 0, add: false });
    speaker.fillStyle(0xffffff, 1); speaker.fillRect(6, 14, 8, 12);
    speaker.beginPath(); speaker.moveTo(14, 14); speaker.lineTo(26, 6); speaker.lineTo(26, 34); speaker.lineTo(14, 26); speaker.closePath(); speaker.fillPath();
    speaker.generateTexture('icon_speaker', 40, 40); speaker.destroy();
  }
}
