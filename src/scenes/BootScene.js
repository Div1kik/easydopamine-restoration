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

    // 1. АТМОСФЕРНЫЕ ИНТЕРЬЕРЫ (МАСТЕРСКАЯ И ЛАВКА)
    this.createWorkshopRooms(width, height);
    this.createShopRoom(width, height);

    // 2. ИНСТРУМЕНТЫ РАЗНЫХ УРОВНЕЙ (ВИЗУАЛЬНО МЕНЯЮТСЯ)
    this.createUpgradableToolTextures();

    // 3. МАСКИ ЛАСТИКОВ
    this.createCircleMask('mask_scraper', 32);
    this.createCircleMask('mask_solvent', 46);
    this.createCircleMask('mask_glue', 22);
    this.createCircleMask('mask_brush', 24);
    this.createCircleMask('mask_polish', 54);

    // 4. АРТЕФАКТЫ И ОСКОЛКИ
    this.createArtifacts();
    this.createShardTextures();
    this.createUIElements();

    this.scene.start('MenuScene');
  }

  // Настоящие помещения мастерской
  createWorkshopRooms(w, h) {
    // 1. БАЗОВАЯ МАСТЕРСКАЯ: Деревянная стена, окно со светом, стеллаж с инструментами и дубовый верстак
    const r1 = this.make.graphics({ x: 0, y: 0, add: false });
    // Стена из бревен/досок
    r1.fillStyle(0x211a15, 1); r1.fillRect(0, 0, w, h);
    r1.fillStyle(0x191410, 0.6);
    for (let y = 0; y < h * 0.45; y += 36) r1.fillRect(0, y, w, 32);

    // Арочное окно на заднем плане
    r1.fillStyle(0x87ceeb, 0.25); r1.fillRoundedRect(w * 0.65, 45, 110, 150, { tl: 55, tr: 55, bl: 0, br: 0 });
    r1.lineStyle(4, 0x3e2723, 1); r1.strokeRoundedRect(w * 0.65, 45, 110, 150, { tl: 55, tr: 55, bl: 0, br: 0 });
    r1.strokeLineShape(new Phaser.Geom.Line(w * 0.65 + 55, 45, w * 0.65 + 55, 195));
    r1.strokeLineShape(new Phaser.Geom.Line(w * 0.65, 120, w * 0.65 + 110, 120));

    // Настенная доска с инструментами слева
    r1.fillStyle(0x3e2723, 0.9); r1.fillRoundedRect(25, 55, 140, 130, 8);
    r1.lineStyle(2, 0x5d4037, 1); r1.strokeRoundedRect(25, 55, 140, 130, 8);
    // Силуэты молотка и пилы на стене
    r1.fillStyle(0x111111, 0.7);
    r1.fillRect(45, 75, 10, 80); r1.fillRect(35, 75, 30, 14); // молоток
    r1.fillRect(95, 70, 8, 90); r1.fillTriangle(95, 70, 135, 140, 95, 140); // ножовка

    // Столешница верстака (тяжелый массив дуба)
    r1.fillStyle(0x2c1f16, 1); r1.fillRect(0, h * 0.38, w, h * 0.62);
    r1.fillStyle(0x3e2c20, 0.85); r1.fillRect(w * 0.04, h * 0.23, w * 0.92, 390); // рабочая зона
    r1.lineStyle(4, 0x1a120c, 1); r1.strokeRect(w * 0.04, h * 0.23, w * 0.92, 390);
    // Тиски на краю стола
    r1.fillStyle(0x424242, 1); r1.fillRoundedRect(10, h * 0.40, 32, 55, 4);

    // Конус света от лампы
    r1.fillStyle(0xfff3e0, 0.12); r1.fillCircle(w / 2, h * 0.42, 280);
    r1.generateTexture('bg_workshop_tier_1', w, h); r1.destroy();

    // 2. ВИНТАЖНАЯ МАСТЕРСКАЯ: Изумрудный свет, лакированный ясень, чертежи
    const r2 = this.make.graphics({ x: 0, y: 0, add: false });
    r2.fillStyle(0x1a211a, 1); r2.fillRect(0, 0, w, h);
    r2.fillStyle(0x243324, 0.4);
    for (let y = 0; y < h * 0.45; y += 40) r2.fillRect(0, y, w, 36);
    // Стол с зеленым сукном
    r2.fillStyle(0x2d1f18, 1); r2.fillRect(0, h * 0.38, w, h * 0.62);
    r2.fillStyle(0x1b4332, 0.95); r2.fillRoundedRect(w * 0.04, h * 0.22, w * 0.92, 395, 14);
    r2.lineStyle(3, 0xd4af37, 0.7); r2.strokeRoundedRect(w * 0.04, h * 0.22, w * 0.92, 395, 14);
    r2.fillStyle(0x52b788, 0.14); r2.fillCircle(w / 2, h * 0.42, 280);
    r2.generateTexture('bg_workshop_tier_2', w, h); r2.destroy();

    // 3. КОРОЛЕВСКАЯ ГИЛЬДИЯ: Мореный дуб, синий бархат, витраж
    const r3 = this.make.graphics({ x: 0, y: 0, add: false });
    r3.fillStyle(0x12151e, 1); r3.fillRect(0, 0, w, h);
    r3.fillStyle(0x1d2436, 0.5);
    for (let y = 0; y < h * 0.45; y += 44) r3.fillRect(0, y, w, 40);
    r3.fillStyle(0x1a1528, 1); r3.fillRect(0, h * 0.36, w, h * 0.64);
    r3.fillStyle(0x1e3a8a, 0.95); r3.fillRoundedRect(w * 0.04, h * 0.21, w * 0.92, 405, 18);
    r3.lineStyle(4, 0xf59e0b, 0.85); r3.strokeRoundedRect(w * 0.04, h * 0.21, w * 0.92, 405, 18);
    r3.fillStyle(0x60a5fa, 0.14); r3.fillCircle(w / 2, h * 0.42, 290);
    r3.generateTexture('bg_workshop_tier_3', w, h); r3.destroy();

    // 4. ИМПЕРАТОРСКАЯ ЛАБОРАТОРИЯ: Белый каррарский мрамор, софиты
    const r4 = this.make.graphics({ x: 0, y: 0, add: false });
    r4.fillStyle(0x18181b, 1); r4.fillRect(0, 0, w, h);
    r4.fillStyle(0x27272a, 0.6); r4.fillRect(0, 0, w, h * 0.35);
    r4.fillStyle(0x09090b, 1); r4.fillRect(0, h * 0.35, w, h * 0.65);
    r4.fillStyle(0xf4f4f5, 0.98); r4.fillRoundedRect(w * 0.04, h * 0.20, w * 0.92, 415, 20);
    r4.lineStyle(2, 0xa1a1aa, 0.5);
    r4.strokeLineShape(new Phaser.Geom.Line(w * 0.1, h * 0.26, w * 0.45, h * 0.5));
    r4.strokeLineShape(new Phaser.Geom.Line(w * 0.45, h * 0.32, w * 0.88, h * 0.44));
    r4.lineStyle(4, 0xd4af37, 1); r4.strokeRoundedRect(w * 0.04, h * 0.20, w * 0.92, 415, 20);
    r4.fillStyle(0xffffff, 0.24); r4.fillCircle(w / 2, h * 0.42, 300);
    r4.generateTexture('bg_workshop_tier_4', w, h); r4.destroy();
  }

  // Интерьер антикварной лавки с деревянными стеллажами
  createShopRoom(w, h) {
    const s = this.make.graphics({ x: 0, y: 0, add: false });
    // Теплые обои в полоску
    s.fillStyle(0x2b1d16, 1); s.fillRect(0, 0, w, h);
    s.fillStyle(0x38251c, 0.6);
    for (let x = 0; x < w; x += 35) s.fillRect(x, 0, 18, h);

    // Деревянные полки витрины
    s.fillStyle(0x1a120d, 0.9);
    s.fillRect(20, 120, w - 40, 16);
    s.fillRect(20, 270, w - 40, 16);
    s.fillRect(20, 420, w - 40, 16);
    s.fillRect(20, 570, w - 40, 16);

    // Золотая окантовка полок
    s.fillStyle(0xd4af37, 0.7);
    s.fillRect(20, 134, w - 40, 4);
    s.fillRect(20, 284, w - 40, 4);
    s.fillRect(20, 434, w - 40, 4);
    s.fillRect(20, 584, w - 40, 4);

    // Мягкое янтарное освещение лавки
    s.fillStyle(0xffb703, 0.10); s.fillCircle(w / 2, h * 0.45, 300);
    s.generateTexture('bg_antique_shop', w, h); s.destroy();
  }

  // Инструменты меняют вид при покупке
  createUpgradableToolTextures() {
    // 1. СКРЕБКИ (Костяной -> Стальной -> Алмазный)
    // 1.1 Костяной
    const sc1 = this.make.graphics({ x: 0, y: 0, add: false });
    sc1.fillStyle(0x8d6e63, 1); sc1.fillRoundedRect(28, 55, 24, 60, 4);
    sc1.fillStyle(0xd7ccc8, 1); sc1.fillTriangle(20, 45, 60, 45, 40, 12);
    sc1.generateTexture('tool_scraper_tier_1', 80, 120); sc1.destroy();

    // 1.2 Стальной резной
    const sc2 = this.make.graphics({ x: 0, y: 0, add: false });
    sc2.fillStyle(0x212121, 1); sc2.fillRoundedRect(28, 55, 24, 60, 4);
    sc2.fillStyle(0xd4af37, 1); sc2.fillRect(26, 45, 28, 10);
    sc2.fillStyle(0x90a4ae, 1); sc2.fillTriangle(18, 45, 62, 45, 40, 8);
    sc2.generateTexture('tool_scraper_tier_2', 80, 120); sc2.destroy();

    // 1.3 Алмазный ультразвуковой
    const sc3 = this.make.graphics({ x: 0, y: 0, add: false });
    sc3.fillStyle(0xd4af37, 1); sc3.fillRoundedRect(28, 50, 24, 65, 4);
    sc3.fillStyle(0x00e5ff, 1); sc3.fillTriangle(18, 45, 62, 45, 40, 5); // сверкающее лезвие
    sc3.generateTexture('tool_scraper_tier_3', 80, 120); sc3.destroy();

    // Иконки в лоток
    this.buildSlotIcon('slot_scraper', 'tool_scraper_tier_1');
    this.buildSlotIcon('slot_solvent', 'tool_scraper_tier_2'); // фоллбэки
    this.buildSlotIcon('slot_glue', 'tool_scraper_tier_3');

    // Растворитель
    const sol = this.make.graphics({ x: 0, y: 0, add: false });
    sol.fillStyle(0x2e7d32, 1); sol.fillRoundedRect(18, 30, 44, 75, 8);
    sol.fillStyle(0x81c784, 1); sol.fillRect(28, 12, 24, 20);
    sol.fillStyle(0xffffff, 0.4); sol.fillRect(24, 40, 8, 55);
    sol.generateTexture('slot_solvent', 80, 120); sol.destroy();

    // Клей
    const glue = this.make.graphics({ x: 0, y: 0, add: false });
    glue.fillStyle(0xd4af37, 1);
    glue.beginPath(); glue.moveTo(25, 110); glue.lineTo(55, 110); glue.lineTo(50, 40); glue.lineTo(30, 40); glue.closePath(); glue.fillPath();
    glue.fillStyle(0xc0392b, 1); glue.fillRect(34, 15, 12, 25);
    glue.generateTexture('slot_glue', 80, 120); glue.destroy();

    // Кисть
    const brush = this.make.graphics({ x: 0, y: 0, add: false });
    brush.fillStyle(0x37474f, 1); brush.fillRoundedRect(36, 30, 8, 85, 3);
    brush.fillStyle(0xd4af37, 1); brush.fillRect(34, 24, 12, 8);
    brush.fillStyle(0xc0392b, 1); brush.fillTriangle(34, 24, 46, 24, 40, 5);
    brush.generateTexture('slot_brush', 80, 120); brush.destroy();

    // Замша
    const cloth = this.make.graphics({ x: 0, y: 0, add: false });
    cloth.fillStyle(0x6a1b9a, 1); cloth.fillRoundedRect(15, 35, 50, 55, 10);
    cloth.fillStyle(0xba68c8, 1); cloth.fillRoundedRect(22, 42, 36, 40, 6);
    cloth.generateTexture('slot_polish', 80, 120); cloth.destroy();
  }

  buildSlotIcon(key, srcKey) {
    // Вспомогательный билд
    const img = this.make.image({ key: srcKey, add: false });
    if (img) img.destroy();
  }

  createCircleMask(key, radius) {
    const mask = this.make.graphics({ x: 0, y: 0, add: false });
    mask.fillStyle(0xffffff, 1);
    mask.fillCircle(radius, radius, radius);
    mask.generateTexture(key, radius * 2, radius * 2);
    mask.destroy();
  }

  createArtifacts() {
    // 1. Скарабей
    const scarab = this.make.graphics({ x: 0, y: 0, add: false });
    scarab.fillStyle(0xb7950b, 1); scarab.fillEllipse(150, 200, 165, 225);
    scarab.fillStyle(0xd4af37, 1); scarab.fillEllipse(150, 198, 155, 215);
    scarab.fillStyle(0x0f2b46, 1); scarab.fillEllipse(150, 195, 84, 144);
    scarab.fillStyle(0xd4af37, 1); scarab.fillCircle(150, 78, 32);
    scarab.generateTexture('art_egypt_scarab', 300, 400); scarab.destroy();

    // 2. Маска
    const mask = this.make.graphics({ x: 0, y: 0, add: false });
    mask.fillStyle(0x1a5276, 1);
    mask.beginPath(); mask.moveTo(50, 80); mask.lineTo(250, 80); mask.lineTo(270, 260); mask.lineTo(220, 310); mask.lineTo(80, 310); mask.lineTo(30, 260); mask.closePath(); mask.fillPath();
    mask.fillStyle(0xd4af37, 1); for (let y = 100; y < 290; y += 28) mask.fillRect(45, y, 210, 14);
    mask.fillStyle(0xf1c40f, 1); mask.fillEllipse(150, 180, 100, 130);
    mask.generateTexture('art_egypt_mask', 300, 400); mask.destroy();

    // 3. Анкх
    const ankh = this.make.graphics({ x: 0, y: 0, add: false });
    ankh.lineStyle(22, 0xb7950b, 1); ankh.strokeCircle(150, 130, 50);
    ankh.fillStyle(0xb7950b, 1); ankh.fillRect(75, 185, 150, 30); ankh.fillRect(135, 185, 30, 180);
    ankh.generateTexture('art_egypt_ankh', 300, 400); ankh.destroy();

    // 4. Амфора
    const amphora = this.make.graphics({ x: 0, y: 0, add: false });
    amphora.fillStyle(0xa04000, 1); amphora.fillEllipse(150, 200, 186, 266);
    amphora.fillStyle(0xd35400, 1); amphora.fillEllipse(145, 195, 176, 256);
    amphora.fillStyle(0x873600, 1); amphora.fillRect(110, 48, 80, 52); amphora.fillRect(115, 320, 70, 25);
    amphora.generateTexture('art_greece_amphora', 300, 400); amphora.destroy();

    // 5. Шлем
    const helmet = this.make.graphics({ x: 0, y: 0, add: false });
    helmet.fillStyle(0x7d6608, 1); helmet.fillCircle(150, 170, 110);
    helmet.fillStyle(0xb7950b, 1); helmet.fillCircle(145, 165, 102);
    helmet.fillRect(70, 180, 50, 120); helmet.fillRect(180, 180, 50, 120);
    helmet.generateTexture('art_greece_helmet', 300, 400); helmet.destroy();

    // 6. Монета
    const coin = this.make.graphics({ x: 0, y: 0, add: false });
    coin.fillStyle(0x7f8c8d, 1); coin.fillCircle(150, 200, 120);
    coin.fillStyle(0xbdc3c7, 1); coin.fillCircle(145, 195, 114);
    coin.generateTexture('art_greece_coin', 300, 400); coin.destroy();

    // 7. Щит
    const shield = this.make.graphics({ x: 0, y: 0, add: false });
    shield.fillStyle(0x4d5656, 1);
    shield.beginPath(); shield.moveTo(50, 60); shield.lineTo(250, 60); shield.lineTo(250, 220); shield.lineTo(150, 350); shield.lineTo(50, 220); shield.closePath(); shield.fillPath();
    shield.fillStyle(0xc0392b, 1); shield.fillRect(135, 75, 30, 210); shield.fillRect(80, 140, 140, 30);
    shield.generateTexture('art_europe_shield', 300, 400); shield.destroy();

    // 8. Меч
    const sword = this.make.graphics({ x: 0, y: 0, add: false });
    sword.fillStyle(0x95a5a6, 1);
    sword.beginPath(); sword.moveTo(136, 100); sword.lineTo(164, 100); sword.lineTo(158, 350); sword.lineTo(150, 375); sword.lineTo(142, 350); sword.closePath(); sword.fillPath();
    sword.fillStyle(0xd4af37, 1); sword.fillRoundedRect(80, 95, 140, 18, 5); sword.fillCircle(150, 40, 16);
    sword.generateTexture('art_europe_sword', 300, 400); sword.destroy();

    // 9. Потир
    const chalice = this.make.graphics({ x: 0, y: 0, add: false });
    chalice.fillStyle(0xb7950b, 1);
    chalice.beginPath(); chalice.arc(150, 140, 80, 0, Math.PI, false); chalice.closePath(); chalice.fillPath();
    chalice.fillRect(140, 140, 20, 130); chalice.fillEllipse(150, 280, 120, 35);
    chalice.generateTexture('art_europe_chalice', 300, 400); chalice.destroy();

    // 10. Катана
    const katana = this.make.graphics({ x: 0, y: 0, add: false });
    katana.fillStyle(0xbdc3c7, 1);
    katana.beginPath(); katana.moveTo(144, 90); katana.lineTo(158, 90); katana.lineTo(154, 355); katana.lineTo(142, 375); katana.lineTo(142, 350); katana.closePath(); katana.fillPath();
    katana.fillStyle(0xb7950b, 1); katana.fillCircle(150, 90, 24);
    katana.generateTexture('art_japan_katana', 300, 400); katana.destroy();

    // 11. Маска Мэнгу
    const mengu = this.make.graphics({ x: 0, y: 0, add: false });
    mengu.fillStyle(0x78281f, 1); mengu.fillRoundedRect(60, 140, 180, 120, 20);
    mengu.fillStyle(0xf1c40f, 1); mengu.fillTriangle(115, 205, 125, 205, 120, 225); mengu.fillTriangle(175, 205, 185, 205, 180, 225);
    mengu.generateTexture('art_japan_mask', 300, 400); mengu.destroy();

    // 12. Нэцкэ
    const netsuke = this.make.graphics({ x: 0, y: 0, add: false });
    netsuke.fillStyle(0xd5dbdb, 1); netsuke.fillCircle(150, 200, 98);
    netsuke.fillStyle(0xd35400, 1); netsuke.fillCircle(138, 142, 9); netsuke.fillCircle(162, 142, 9);
    netsuke.generateTexture('art_japan_netsuke', 300, 400); netsuke.destroy();

    // 13. Нефритовая маска Майя
    const mesoMask = this.make.graphics({ x: 0, y: 0, add: false });
    mesoMask.fillStyle(0x16a085, 1); mesoMask.fillEllipse(150, 200, 150, 210);
    mesoMask.fillStyle(0x1abc9c, 1); mesoMask.fillEllipse(150, 195, 140, 195);
    mesoMask.fillStyle(0xf1c40f, 1); mesoMask.fillCircle(115, 175, 18); mesoMask.fillCircle(185, 175, 18);
    mesoMask.generateTexture('art_meso_mask', 300, 400); mesoMask.destroy();

    // 14. Диск
    const mesoDisk = this.make.graphics({ x: 0, y: 0, add: false });
    mesoDisk.fillStyle(0x566573, 1); mesoDisk.fillCircle(150, 200, 125);
    mesoDisk.fillStyle(0xd4af37, 1); mesoDisk.fillCircle(150, 200, 110);
    mesoDisk.generateTexture('art_meso_disk', 300, 400); mesoDisk.destroy();

    // 15. Кинжал
    const mesoDag = this.make.graphics({ x: 0, y: 0, add: false });
    mesoDag.fillStyle(0x1a1a1a, 1);
    mesoDag.beginPath(); mesoDag.moveTo(135, 100); mesoDag.lineTo(165, 100); mesoDag.lineTo(150, 360); mesoDag.closePath(); mesoDag.fillPath();
    mesoDag.fillStyle(0xd4af37, 1); mesoDag.fillRoundedRect(125, 45, 50, 60, 10);
    mesoDag.generateTexture('art_meso_dagger', 300, 400); mesoDag.destroy();
  }

  createShardTextures() {
    const s1 = this.make.graphics({ x: 0, y: 0, add: false });
    s1.fillStyle(0xd35400, 1);
    s1.beginPath(); s1.moveTo(10, 10); s1.lineTo(55, 18); s1.lineTo(45, 60); s1.lineTo(15, 45); s1.closePath(); s1.fillPath();
    s1.generateTexture('shard_amphora', 65, 70); s1.destroy();

    const s2 = this.make.graphics({ x: 0, y: 0, add: false });
    s2.fillStyle(0xd4af37, 1); s2.fillEllipse(30, 30, 25, 40);
    s2.generateTexture('shard_scarab_wing', 60, 60); s2.destroy();

    const s3 = this.make.graphics({ x: 0, y: 0, add: false });
    s3.fillStyle(0xbdc3c7, 1); s3.fillTriangle(15, 10, 45, 10, 30, 65);
    s3.generateTexture('shard_sword_tip', 60, 75); s3.destroy();

    const s4 = this.make.graphics({ x: 0, y: 0, add: false });
    s4.fillStyle(0x1abc9c, 1); s4.fillRoundedRect(10, 10, 45, 45, 6);
    s4.generateTexture('shard_jade_piece', 65, 65); s4.destroy();
  }

  createUIElements() {
    const lock = this.make.graphics({ x: 0, y: 0, add: false });
    lock.lineStyle(4, 0xbdc3c7, 1); lock.strokeCircle(20, 14, 10);
    lock.fillStyle(0x7f8c8d, 1); lock.fillRoundedRect(8, 16, 24, 20, 4);
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
