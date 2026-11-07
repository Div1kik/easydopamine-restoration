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

    // 1. ВЕРСТАКИ И МАСТЕРСКИЕ
    this.createWorkshopThemes(width, height);
    this.createShopRoom(width, height);

    // 2. ИНСТРУМЕНТЫ (СКРЕБОК, КИСТЬ, РАСТВОРИТЕЛЬ, КЛЕЙ, ЗАМША)
    this.createToolIcons();

    // 3. МАСКИ ЛАСТИКОВ
    this.createCircleMask('mask_scraper', 32);
    this.createCircleMask('mask_solvent', 48);
    this.createCircleMask('mask_brush', 28);
    this.createCircleMask('mask_glue', 22);
    this.createCircleMask('mask_polish', 54);

    // 4. ДЕТАЛИЗИРОВАННЫЕ АРТЕФАКТЫ
    this.createHDArtifacts();
    this.createShardTextures();
    this.createUIElements();

    this.scene.start('MenuScene');
  }

  createWorkshopThemes(w, h) {
    // 1. АТМОСФЕРНЫЙ ДУБОВЫЙ ВЕРСТАК (ВЫСОКИЙ УРОВЕНЬ ДЕТАЛИЗАЦИИ)
    const t1 = this.make.graphics({ x: 0, y: 0, add: false });

    // Стена мастерской
    t1.fillStyle(0x1a1512, 1); t1.fillRect(0, 0, w, h);
    t1.fillStyle(0x241d18, 0.6);
    for (let y = 0; y < h * 0.36; y += 28) {
      t1.fillRect(0, y, w, 24);
      t1.fillStyle(0x140f0c, 0.4);
      t1.fillRect(0, y + 24, w, 4);
      t1.fillStyle(0x241d18, 0.6);
    }

    // Теплое окно на заднем плане с мягким светом
    t1.fillStyle(0xdbe7ed, 0.25);
    t1.fillRoundedRect(w * 0.62, 35, 120, 160, { tl: 60, tr: 60, bl: 0, br: 0 });
    t1.lineStyle(5, 0x3d2b1f, 1);
    t1.strokeRoundedRect(w * 0.62, 35, 120, 160, { tl: 60, tr: 60, bl: 0, br: 0 });
    t1.strokeLineShape(new Phaser.Geom.Line(w * 0.62 + 60, 35, w * 0.62 + 60, 195));
    t1.strokeLineShape(new Phaser.Geom.Line(w * 0.62, 115, w * 0.62 + 120, 115));

    // Настенная доска с силуэтами ручного инструмента
    t1.fillStyle(0x2a1c14, 0.95);
    t1.fillRoundedRect(25, 45, 135, 140, 8);
    t1.lineStyle(2, 0x4a3224, 1);
    t1.strokeRoundedRect(25, 45, 135, 140, 8);
    t1.fillStyle(0x120d09, 0.8);
    t1.fillRect(45, 65, 8, 85); t1.fillRect(35, 65, 28, 14); // молоток
    t1.fillRect(90, 60, 6, 95); t1.fillTriangle(90, 60, 130, 125, 90, 125); // лучковая пила

    // Столешница верстака (массивный мореный дуб)
    t1.fillStyle(0x281a12, 1); t1.fillRect(0, h * 0.30, w, h * 0.70);
    // Доски верстака
    t1.fillStyle(0x362318, 0.5);
    for (let y = h * 0.30; y < h; y += 42) t1.fillRect(0, y, w, 38);

    // Кожаный подкладочный коврик под артефакт с аккуратной строчкой
    t1.fillStyle(0x1c2125, 0.96);
    t1.fillRoundedRect(w * 0.05, h * 0.17, w * 0.90, 440, 18);
    t1.lineStyle(2, 0xd4af37, 0.75);
    t1.strokeRoundedRect(w * 0.05, h * 0.17, w * 0.90, 440, 18);
    // Декоративная строчка шва
    t1.lineStyle(1.5, 0x8a7238, 0.6);
    t1.strokeRoundedRect(w * 0.06, h * 0.18, w * 0.88, 425, 14);

    // Мягкое виньетирование и теплый свет лампы
    t1.fillStyle(0xfff1d0, 0.13);
    t1.fillCircle(w / 2, h * 0.42, 290);
    t1.fillStyle(0xf39c12, 0.06);
    t1.fillCircle(w / 2, h * 0.42, 180);

    t1.generateTexture('bg_workshop_tier_1', w, h); t1.destroy();

    // Темы 2, 3, 4 создаются на базе аналогичных глубоких тонов
    this.createTierBg(2, 0x1b4332, 0x52b788, w, h);
    this.createTierBg(3, 0x1e3a8a, 0x60a5fa, w, h);
    this.createTierBg(4, 0xf4f4f5, 0xffffff, w, h);
  }

  createTierBg(tier, matColor, lightColor, w, h) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x141210, 1); g.fillRect(0, 0, w, h);
    g.fillStyle(0x221a14, 1); g.fillRect(0, h * 0.30, w, h * 0.70);
    g.fillStyle(matColor, 0.95);
    g.fillRoundedRect(w * 0.05, h * 0.17, w * 0.90, 440, 18);
    g.lineStyle(2, 0xd4af37, 0.8);
    g.strokeRoundedRect(w * 0.05, h * 0.17, w * 0.90, 440, 18);
    g.fillStyle(lightColor, 0.14);
    g.fillCircle(w / 2, h * 0.42, 290);
    g.generateTexture(`bg_workshop_tier_${tier}`, w, h);
    g.destroy();
  }

  createShopRoom(w, h) {
    const s = this.make.graphics({ x: 0, y: 0, add: false });
    s.fillStyle(0x241812, 1); s.fillRect(0, 0, w, h);
    s.fillStyle(0x312018, 0.6);
    for (let x = 0; x < w; x += 36) s.fillRect(x, 0, 18, h);

    // Полки лавки
    [120, 270, 420, 570].forEach(y => {
      s.fillStyle(0x160f0b, 0.95);
      s.fillRect(20, y, w - 40, 18);
      s.fillStyle(0xd4af37, 0.85);
      s.fillRect(20, y + 16, w - 40, 4);
    });

    s.fillStyle(0xffb703, 0.12);
    s.fillCircle(w / 2, h * 0.45, 300);
    s.generateTexture('bg_antique_shop', w, h);
    s.destroy();
  }

  // Текстуры лотка: четкие, контрастные и всегда сгенерированные
  createToolIcons() {
    // 1. СКРЕБОК (исправлен, больше не исчезает)
    const sc = this.make.graphics({ x: 0, y: 0, add: false });
    sc.fillStyle(0x6d4c41, 1); sc.fillRoundedRect(28, 55, 24, 60, 4);
    sc.fillStyle(0xd4af37, 1); sc.fillRect(26, 46, 28, 10);
    sc.fillStyle(0xcfd8dc, 1); sc.fillTriangle(18, 46, 62, 46, 40, 8);
    sc.lineStyle(1.5, 0x90a4ae, 1); sc.strokeTriangle(18, 46, 62, 46, 40, 8);
    sc.generateTexture('slot_scraper', 80, 120); sc.destroy();

    // 2. МЯГКАЯ АРХЕОЛОГИЧЕСКАЯ КИСТЬ (для бережной очистки)
    const br = this.make.graphics({ x: 0, y: 0, add: false });
    br.fillStyle(0x3e2723, 1); br.fillRoundedRect(34, 45, 12, 70, 4);
    br.fillStyle(0xd4af37, 1); br.fillRect(30, 36, 20, 12);
    // Пушистая щетина кисти
    br.fillStyle(0xd7ccc8, 1); br.fillRoundedRect(24, 10, 32, 28, 6);
    br.fillStyle(0x8d6e63, 0.7);
    for (let x = 27; x < 54; x += 4) br.fillRect(x, 10, 2, 26);
    br.generateTexture('slot_brush_soft', 80, 120); br.destroy();

    // 3. РАСТВОРИТЕЛЬ / ПУЗЫРЕК С ЭКСТРАКТОМ
    const sol = this.make.graphics({ x: 0, y: 0, add: false });
    sol.fillStyle(0x1b5e20, 1); sol.fillRoundedRect(20, 32, 40, 75, 8);
    sol.fillStyle(0x81c784, 1); sol.fillRect(30, 14, 20, 20);
    sol.fillStyle(0xffffff, 0.4); sol.fillRect(25, 42, 6, 52);
    sol.generateTexture('slot_solvent', 80, 120); sol.destroy();

    // 4. ЗОЛОТОЙ КЛЕЙ (КИНЦУГИ)
    const gl = this.make.graphics({ x: 0, y: 0, add: false });
    gl.fillStyle(0xf59e0b, 1);
    gl.beginPath(); gl.moveTo(25, 110); gl.lineTo(55, 110); gl.lineTo(48, 40); gl.lineTo(32, 40); gl.closePath(); gl.fillPath();
    gl.fillStyle(0xb91c1c, 1); gl.fillRect(34, 15, 12, 26);
    gl.generateTexture('slot_glue', 80, 120); gl.destroy();

    // 5. ЗАМША ДЛЯ ПОЛИРОВКИ
    const cl = this.make.graphics({ x: 0, y: 0, add: false });
    cl.fillStyle(0x6b21a8, 1); cl.fillRoundedRect(16, 35, 48, 55, 10);
    cl.fillStyle(0xc084fc, 1); cl.fillRoundedRect(22, 42, 36, 40, 6);
    cl.generateTexture('slot_polish', 80, 120); cl.destroy();
  }

  createCircleMask(key, radius) {
    const mask = this.make.graphics({ x: 0, y: 0, add: false });
    mask.fillStyle(0xffffff, 1);
    mask.fillCircle(radius, radius, radius);
    mask.generateTexture(key, radius * 2, radius * 2);
    mask.destroy();
  }

  // Объемные, детальные артефакты
  createHDArtifacts() {
    // 1. НАСТОЯЩИЙ ЗОЛОТОЙ СКАРАБЕЙ (с рельефом, лапками и лазуритом)
    const sc = this.make.graphics({ x: 0, y: 0, add: false });

    // Чеканные золотые лапки скарабея
    sc.lineStyle(10, 0x997300, 1);
    // Передние лапки с зазубринами
    sc.strokeLineShape(new Phaser.Geom.Line(100, 130, 45, 90));
    sc.strokeLineShape(new Phaser.Geom.Line(45, 90, 30, 110));
    sc.strokeLineShape(new Phaser.Geom.Line(200, 130, 255, 90));
    sc.strokeLineShape(new Phaser.Geom.Line(255, 90, 270, 110));
    // Средние лапки
    sc.strokeLineShape(new Phaser.Geom.Line(85, 200, 30, 205));
    sc.strokeLineShape(new Phaser.Geom.Line(215, 200, 270, 205));
    // Задние лапки
    sc.strokeLineShape(new Phaser.Geom.Line(95, 270, 45, 320));
    sc.strokeLineShape(new Phaser.Geom.Line(205, 270, 255, 320));

    // Основа тела (золотой панцирь)
    sc.fillStyle(0xb7860b, 1); sc.fillEllipse(150, 210, 175, 235);
    sc.fillStyle(0xd4af37, 1); sc.fillEllipse(150, 208, 165, 225);
    sc.fillStyle(0xf1c40f, 1); sc.fillEllipse(145, 204, 155, 215);

    // Головной щиток (clypeus) с лучами солнца
    sc.fillStyle(0xb7860b, 1); sc.fillCircle(150, 85, 38);
    sc.fillStyle(0xf1c40f, 1); sc.fillCircle(150, 83, 34);
    sc.fillStyle(0xd4af37, 1);
    sc.fillTriangle(120, 65, 135, 50, 140, 65);
    sc.fillTriangle(142, 60, 150, 44, 158, 60);
    sc.fillTriangle(160, 65, 165, 50, 180, 65);

    // Разделительная линия надкрылий
    sc.lineStyle(4, 0x7c5a03, 1);
    sc.strokeLineShape(new Phaser.Geom.Line(150, 120, 150, 320));

    // Глубокий овальный кабошон из лазурита
    sc.fillStyle(0x0a192f, 1); sc.fillEllipse(150, 215, 90, 145);
    sc.fillStyle(0x153b6b, 1); sc.fillEllipse(150, 212, 82, 135);
    sc.fillStyle(0x1d4ed8, 1); sc.fillEllipse(147, 208, 72, 122);
    // Золотые крупицы пирита внутри лазурита
    sc.fillStyle(0xfacc15, 0.85);
    sc.fillCircle(135, 175, 3); sc.fillCircle(160, 195, 2.5); sc.fillCircle(145, 240, 3);
    // Блик света на камне
    sc.fillStyle(0xffffff, 0.45); sc.fillEllipse(132, 170, 18, 38);

    sc.generateTexture('art_egypt_scarab', 300, 400); sc.destroy();

    // 2. МАСКА ТУТАНХАМОНА
    const mk = this.make.graphics({ x: 0, y: 0, add: false });
    mk.fillStyle(0x1e3a8a, 1);
    mk.beginPath(); mk.moveTo(50, 80); mk.lineTo(250, 80); mk.lineTo(270, 260); mk.lineTo(220, 310); mk.lineTo(80, 310); mk.lineTo(30, 260); mk.closePath(); mk.fillPath();
    mk.fillStyle(0xf59e0b, 1);
    for (let y = 95; y < 290; y += 26) mk.fillRect(45, y, 210, 13);
    mk.fillStyle(0xfbbf24, 1); mk.fillEllipse(150, 180, 105, 130);
    mk.fillStyle(0x172554, 1); mk.fillRect(142, 245, 16, 55);
    mk.generateTexture('art_egypt_mask', 300, 400); mk.destroy();

    // 3. АНКХ
    const an = this.make.graphics({ x: 0, y: 0, add: false });
    an.lineStyle(24, 0xb45309, 1); an.strokeCircle(150, 130, 50);
    an.lineStyle(16, 0xfbbf24, 1); an.strokeCircle(150, 128, 50);
    an.fillStyle(0xb45309, 1); an.fillRect(75, 185, 150, 30); an.fillRect(135, 185, 30, 180);
    an.fillStyle(0xfbbf24, 1); an.fillRect(80, 190, 140, 20); an.fillRect(140, 190, 20, 170);
    an.generateTexture('art_egypt_ankh', 300, 400); an.destroy();

    // 4. АМФОРА
    const am = this.make.graphics({ x: 0, y: 0, add: false });
    am.fillStyle(0x9a3412, 1); am.fillEllipse(150, 200, 186, 266);
    am.fillStyle(0xc2410c, 1); am.fillEllipse(145, 195, 176, 256);
    am.fillStyle(0x7c2d12, 1); am.fillRect(110, 48, 80, 52); am.fillRect(115, 320, 70, 25);
    am.lineStyle(16, 0x431407, 1);
    am.beginPath(); am.arc(88, 160, 46, Phaser.Math.DegToRad(70), Phaser.Math.DegToRad(270), true); am.strokePath();
    am.beginPath(); am.arc(212, 160, 46, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(110), false); am.strokePath();
    am.fillStyle(0x18181b, 0.95); am.fillRect(75, 175, 150, 38);
    am.generateTexture('art_greece_amphora', 300, 400); am.destroy();

    // Фоллбэки остальных предметов
    this.createSimpleArt('art_greece_helmet', 0x78350f, 0xf59e0b);
    this.createSimpleArt('art_greece_coin', 0x475569, 0xcfd8dc);
    this.createSimpleArt('art_europe_shield', 0x334155, 0xdc2626);
    this.createSimpleArt('art_europe_sword', 0x64748b, 0xf59e0b);
    this.createSimpleArt('art_europe_chalice', 0xb45309, 0xfbbf24);
    this.createSimpleArt('art_japan_katana', 0x475569, 0xe2e8f0);
    this.createSimpleArt('art_japan_mask', 0x991b1b, 0xf59e0b);
    this.createSimpleArt('art_japan_netsuke', 0x78716c, 0xf5f5f4);
    this.createSimpleArt('art_meso_mask', 0x065f46, 0x10b981);
    this.createSimpleArt('art_meso_disk', 0x374151, 0xf59e0b);
    this.createSimpleArt('art_meso_dagger', 0x09090b, 0xf59e0b);
  }

  createSimpleArt(key, c1, c2) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(c1, 1); g.fillRoundedRect(50, 50, 200, 300, 20);
    g.fillStyle(c2, 1); g.fillCircle(150, 200, 75);
    g.generateTexture(key, 300, 400); g.destroy();
  }

  createShardTextures() {
    const s1 = this.make.graphics({ x: 0, y: 0, add: false });
    s1.fillStyle(0xc2410c, 1);
    s1.beginPath(); s1.moveTo(10, 10); s1.lineTo(55, 18); s1.lineTo(45, 60); s1.lineTo(15, 45); s1.closePath(); s1.fillPath();
    s1.generateTexture('shard_amphora', 65, 70); s1.destroy();

    const s2 = this.make.graphics({ x: 0, y: 0, add: false });
    s2.fillStyle(0xf59e0b, 1); s2.fillEllipse(30, 30, 25, 40);
    s2.generateTexture('shard_scarab_wing', 60, 60); s2.destroy();

    const s3 = this.make.graphics({ x: 0, y: 0, add: false });
    s3.fillStyle(0xcfd8dc, 1); s3.fillTriangle(15, 10, 45, 10, 30, 65);
    s3.generateTexture('shard_sword_tip', 60, 75); s3.destroy();

    const s4 = this.make.graphics({ x: 0, y: 0, add: false });
    s4.fillStyle(0x10b981, 1); s4.fillRoundedRect(10, 10, 45, 45, 6);
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
