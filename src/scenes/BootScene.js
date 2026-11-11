export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createRestorationAssets();
    this.scene.start('MenuScene');
  }

  createRestorationAssets() {
    // Вспомогательный генератор текстур
    const make = (key, w, h, fn) => {
      if (this.textures.exists(key)) return;
      const cvs = this.textures.createCanvas(key, w, h);
      const ctx = cvs.getContext();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      fn(ctx);
      cvs.refresh();
    };

    // --- ИКОНКИ ЗВЕЗД ---
    const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
      let rot = Math.PI / 2 * 3;
      let x = cx, y = cy;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    };

    make('icon_star', 64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 32, 4, 32, 32, 28);
      g.addColorStop(0, '#fffbeb');
      g.addColorStop(0.4, '#facc15');
      g.addColorStop(1, '#ca8a04');
      ctx.fillStyle = g;
      drawStar(ctx, 32, 32, 5, 26, 12);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });

    make('icon_star_empty', 64, 64, (ctx) => {
      ctx.fillStyle = '#1e293b';
      drawStar(ctx, 32, 32, 5, 26, 12);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // --- МАСКИ И ЧАСТИЦЫ ---
    make('mask_scraper', 64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.75, 'rgba(0,0,0,0.85)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fill();
    });

    make('mask_brush', 72, 72, (ctx) => {
      const g = ctx.createRadialGradient(36, 36, 0, 36, 36, 34);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.8, 'rgba(0,0,0,0.7)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(36, 36, 34, 0, Math.PI * 2);
      ctx.fill();
    });

    make('mask_solvent', 64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.85, 'rgba(0,0,0,0.8)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fill();
    });

    make('mask_glue', 64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.fill();
    });

    make('mask_polish', 72, 72, (ctx) => {
      const g = ctx.createRadialGradient(36, 36, 0, 36, 36, 35);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.8, 'rgba(0,0,0,0.6)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(36, 36, 35, 0, Math.PI * 2);
      ctx.fill();
    });

    make('particle_dust', 12, 12, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, 6, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // =========================================================================
    // ГЕНЕРАЦИЯ ДЕТАЛИЗИРОВАННЫХ АРТЕФАКТОВ (Hi-Res 640x800)
    // =========================================================================
    const W = 640;
    const H = 800;
    const cx = 320;
    const cy = 400;

    // --- 1. ДРЕВНИЙ ЕГИПЕТ ---

    // 1.1 СТАТУЭТКА БАСТЕТ (Грациозная базальтовая кошка)
    make('art_egypt_bastet', W, H, (ctx) => {
      // Контактная тень у лап
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 240, 130, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Тело кошки с изгибом
      const bodyGrad = ctx.createLinearGradient(cx - 120, cy, cx + 120, cy);
      bodyGrad.addColorStop(0, '#0a0d14');
      bodyGrad.addColorStop(0.35, '#222836');
      bodyGrad.addColorStop(0.65, '#161a24');
      bodyGrad.addColorStop(1, '#07090e');
      ctx.fillStyle = bodyGrad;

      // Силуэт сидящей кошки
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy - 80);
      ctx.bezierCurveTo(cx - 75, cy - 20, cx - 110, cy + 80, cx - 115, cy + 220);
      ctx.quadraticCurveTo(cx, cy + 245, cx + 115, cy + 220);
      ctx.bezierCurveTo(cx + 110, cy + 80, cx + 75, cy - 20, cx + 45, cy - 80);
      ctx.closePath();
      ctx.fill();

      // Хвост, обёрнутый вокруг лап
      ctx.strokeStyle = '#1b202e';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy + 215, 110, 0.2, Math.PI * 0.95);
      ctx.stroke();

      // Передние лапы
      ctx.fillStyle = '#161b26';
      ctx.beginPath();
      ctx.roundRect(cx - 36, cy + 120, 26, 110, 10);
      ctx.roundRect(cx + 10, cy + 120, 26, 110, 10);
      ctx.fill();

      // Шея и голова
      ctx.beginPath();
      ctx.ellipse(cx, cy - 100, 68, 75, 0, 0, Math.PI * 2);
      ctx.fill();

      // Острые ушки Бастет
      const earGrad = ctx.createLinearGradient(cx, cy - 210, cx, cy - 140);
      earGrad.addColorStop(0, '#384152');
      earGrad.addColorStop(1, '#11151e');
      ctx.fillStyle = earGrad;

      // Левое ухо
      ctx.beginPath();
      ctx.moveTo(cx - 56, cy - 130);
      ctx.lineTo(cx - 52, cy - 210);
      ctx.lineTo(cx - 15, cy - 155);
      ctx.closePath();
      ctx.fill();

      // Правое ухо
      ctx.beginPath();
      ctx.moveTo(cx + 56, cy - 130);
      ctx.lineTo(cx + 52, cy - 210);
      ctx.lineTo(cx + 15, cy - 155);
      ctx.closePath();
      ctx.fill();

      // Внутреннее свечение ушей
      ctx.fillStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.beginPath();
      ctx.moveTo(cx - 48, cy - 135);
      ctx.lineTo(cx - 45, cy - 195);
      ctx.lineTo(cx - 20, cy - 155);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 48, cy - 135);
      ctx.lineTo(cx + 45, cy - 195);
      ctx.lineTo(cx + 20, cy - 155);
      ctx.closePath();
      ctx.fill();

      // Золотой ритуальный воротник (Усех)
      const goldGrad = ctx.createLinearGradient(cx - 80, cy, cx + 80, cy);
      goldGrad.addColorStop(0, '#b48a28');
      goldGrad.addColorStop(0.5, '#fde047');
      goldGrad.addColorStop(1, '#856417');
      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(cx, cy - 90, 72, 0.4, Math.PI - 0.4);
      ctx.stroke();

      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy - 90, 84, 0.45, Math.PI - 0.45);
      ctx.stroke();

      // Подвеска скарабея на груди
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(cx, cy - 14, 12, 0, Math.PI * 2);
      ctx.fill();

      // Изумрудные миндалевидные глаза
      const eyeGrad = ctx.createLinearGradient(0, cy - 110, 0, cy - 90);
      eyeGrad.addColorStop(0, '#10b981');
      eyeGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = eyeGrad;

      // Левый глаз
      ctx.beginPath();
      ctx.ellipse(cx - 26, cy - 105, 14, 8, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // Правый глаз
      ctx.beginPath();
      ctx.ellipse(cx + 26, cy - 105, 14, 8, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Вертикальные зрачки
      ctx.fillStyle = '#051b11';
      ctx.beginPath();
      ctx.ellipse(cx - 26, cy - 105, 4, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 26, cy - 105, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Блики в глазах
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 28, cy - 107, 2.5, 0, Math.PI * 2);
      ctx.arc(cx + 24, cy - 107, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 1.2 АЛЕБАСТРОВАЯ КАНОПА (Ритуальный сосуд из полупрозрачного камня)
    make('art_egypt_canopic', W, H, (ctx) => {
      // Контактная тень
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 245, 120, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Тело сосуда (Алебастр с мягким золотистым свечением)
      const jarGrad = ctx.createLinearGradient(cx - 120, cy, cx + 120, cy);
      jarGrad.addColorStop(0, '#d1c7ac');
      jarGrad.addColorStop(0.2, '#f5eedb');
      jarGrad.addColorStop(0.5, '#fffdf7');
      jarGrad.addColorStop(0.8, '#ede3cb');
      jarGrad.addColorStop(1, '#b8ad91');
      ctx.fillStyle = jarGrad;

      ctx.beginPath();
      ctx.moveTo(cx - 60, cy - 40);
      ctx.bezierCurveTo(cx - 130, cy + 20, cx - 135, cy + 180, cx - 80, cy + 235);
      ctx.lineTo(cx + 80, cy + 235);
      ctx.bezierCurveTo(cx + 135, cy + 180, cx + 130, cy + 20, cx + 60, cy - 40);
      ctx.closePath();
      ctx.fill();

      // Прожилки алебастра
      ctx.strokeStyle = 'rgba(180, 160, 130, 0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy + 30);
      ctx.quadraticCurveTo(cx - 20, cy + 80, cx - 40, cy + 180);
      ctx.moveTo(cx + 40, cy + 10);
      ctx.quadraticCurveTo(cx + 70, cy + 110, cx + 30, cy + 210);
      ctx.stroke();

      // Иероглифическая пластина на пузе
      ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.beginPath();
      ctx.roundRect(cx - 42, cy + 40, 84, 110, 8);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Горлышко кувшина
      ctx.fillStyle = '#e2d9bf';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 45, 75, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b8ad91';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Крышка в форме головы сокола (Квебехсенуф)
      const headGrad = ctx.createLinearGradient(cx - 60, cy - 140, cx + 60, cy - 140);
      headGrad.addColorStop(0, '#c7bc9f');
      headGrad.addColorStop(0.5, '#f5eedb');
      headGrad.addColorStop(1, '#b5a98d');
      ctx.fillStyle = headGrad;

      ctx.beginPath();
      ctx.ellipse(cx, cy - 120, 62, 70, 0, 0, Math.PI * 2);
      ctx.fill();

      // Клюв сокола
      ctx.fillStyle = '#856417';
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy - 110);
      ctx.lineTo(cx, cy - 80);
      ctx.lineTo(cx + 14, cy - 110);
      ctx.closePath();
      ctx.fill();

      // Глаз Гора (Уаджет)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx - 26, cy - 125, 6, 0, Math.PI * 2);
      ctx.arc(cx + 26, cy - 125, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // 1.3 ЗОЛОТОЙ СКАРАБЕЙ (art_egypt_scarab)
    make('art_egypt_scarab', W, H, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 20, 140, 160, 0, 0, Math.PI * 2);
      ctx.fill();

      // Лапки скарабея
      ctx.strokeStyle = '#b48a28';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      // Верхние лапки держат солнце
      ctx.moveTo(cx - 60, cy - 90); ctx.lineTo(cx - 110, cy - 160); ctx.lineTo(cx - 60, cy - 200);
      ctx.moveTo(cx + 60, cy - 90); ctx.lineTo(cx + 110, cy - 160); ctx.lineTo(cx + 60, cy - 200);
      // Средние
      ctx.moveTo(cx - 80, cy); ctx.lineTo(cx - 140, cy + 10); ctx.lineTo(cx - 120, cy + 70);
      ctx.moveTo(cx + 80, cy); ctx.lineTo(cx + 140, cy + 10); ctx.lineTo(cx + 120, cy + 70);
      // Задние
      ctx.moveTo(cx - 60, cy + 90); ctx.lineTo(cx - 120, cy + 160); ctx.lineTo(cx - 70, cy + 210);
      ctx.moveTo(cx + 60, cy + 90); ctx.lineTo(cx + 120, cy + 160); ctx.lineTo(cx + 70, cy + 210);
      ctx.stroke();

      // Солнечный диск над головой
      const sunGrad = ctx.createRadialGradient(cx, cy - 200, 8, cx, cy - 200, 42);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.7, '#f59e0b');
      sunGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(cx, cy - 200, 38, 0, Math.PI * 2);
      ctx.fill();

      // Тело скарабея (Золото + лазурит)
      const goldGrad = ctx.createLinearGradient(cx - 100, cy, cx + 100, cy);
      goldGrad.addColorStop(0, '#ca8a04');
      goldGrad.addColorStop(0.4, '#fde047');
      goldGrad.addColorStop(0.7, '#eab308');
      goldGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = goldGrad;

      // Брюшко
      ctx.beginPath();
      ctx.ellipse(cx, cy + 30, 95, 125, 0, 0, Math.PI * 2);
      ctx.fill();

      // Вставки из лазурита на надкрыльях
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.ellipse(cx - 42, cy + 35, 34, 75, -0.15, 0, Math.PI * 2);
      ctx.ellipse(cx + 42, cy + 35, 34, 75, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Разделительная золотая линия надкрылий
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 90);
      ctx.lineTo(cx, cy + 155);
      ctx.stroke();

      // Головогрудь
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 90, 65, 38, 0, 0, Math.PI * 2);
      ctx.fill();

      // Голова с зубцами
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.arc(cx, cy - 120, 34, Math.PI, 0);
      ctx.fill();
    });

    // 1.4 ОБРЯДОВЫЙ АНКХ (art_egypt_ankh)
    make('art_egypt_ankh', W, H, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 190, 80, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      const ankhGrad = ctx.createLinearGradient(cx - 60, cy, cx + 60, cy);
      ankhGrad.addColorStop(0, '#92400e');
      ankhGrad.addColorStop(0.5, '#fde047');
      ankhGrad.addColorStop(1, '#78350f');

      ctx.strokeStyle = ankhGrad;
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';

      // Петля
      ctx.beginPath();
      ctx.ellipse(cx, cy - 90, 48, 70, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Перекладина
      ctx.beginPath();
      ctx.moveTo(cx - 100, cy);
      ctx.lineTo(cx + 100, cy);
      ctx.stroke();

      // Вертикальная стойка
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx, cy + 200);
      ctx.stroke();

      // Рубин в центре
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 1.5 МАСКА ТУТАНХАМОНА (art_egypt_mask)
    make('art_egypt_mask', W, H, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 200, 110, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Немес (полосатый платок)
      const nemesGrad = ctx.createLinearGradient(cx - 120, cy, cx + 120, cy);
      nemesGrad.addColorStop(0, '#ca8a04');
      nemesGrad.addColorStop(0.5, '#fde047');
      nemesGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = nemesGrad;

      ctx.beginPath();
      ctx.moveTo(cx - 125, cy - 80);
      ctx.lineTo(cx + 125, cy - 80);
      ctx.lineTo(cx + 90, cy + 140);
      ctx.lineTo(cx - 90, cy + 140);
      ctx.closePath();
      ctx.fill();

      // Синие полосы немеса
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 10;
      for (let y = cy - 70; y < cy + 120; y += 24) {
        ctx.beginPath();
        ctx.moveTo(cx - 110, y);
        ctx.lineTo(cx + 110, y);
        ctx.stroke();
      }

      // Лицо правителя
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 20, 68, 85, 0, 0, Math.PI * 2);
      ctx.fill();

      // Бородка фараона
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(cx - 12, cy + 65, 24, 75);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 12, cy + 65, 24, 75);

      // Глаза с египетской подводкой
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx - 26, cy - 25, 14, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 26, cy - 25, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx - 26, cy - 25, 5, 0, Math.PI * 2);
      ctx.arc(cx + 26, cy - 25, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 44, cy - 25); ctx.lineTo(cx - 10, cy - 25);
      ctx.moveTo(cx + 10, cy - 25); ctx.lineTo(cx + 44, cy - 25);
      ctx.stroke();
    });

    // ОСТАЛЬНЫЕ АРТЕФАКТЫ (Античность, Средневековье, Япония и т.д.)
    // Базовый процедурный генератор для всех остальных ключей
    const templates = [
      'art_antique_coin', 'art_antique_amphora', 'art_antique_harp', 'art_antique_statue', 'art_antique_helmet',
      'art_europe_shield', 'art_europe_book', 'art_europe_sword', 'art_europe_grail', 'art_europe_crown',
      'art_japan_fan', 'art_japan_netsuke', 'art_japan_tea', 'art_japan_mask', 'art_japan_katana',
      'art_aztec_vessel', 'art_aztec_dagger', 'art_aztec_idol', 'art_aztec_mask', 'art_aztec_calendar',
      'art_viking_horn', 'art_viking_brooch', 'art_viking_axe', 'art_viking_mjolnir', 'art_viking_ship',
      'art_renaissance_compass', 'art_renaissance_goblet', 'art_renaissance_astrolabe', 'art_renaissance_clock', 'art_renaissance_mona'
    ];

    templates.forEach(key => {
      make(key, W, H, (ctx) => {
        // Контактная тень
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 220, 110, 26, 0, 0, Math.PI * 2);
        ctx.fill();

        const grad = ctx.createRadialGradient(cx - 30, cy - 30, 20, cx, cy, 180);
        grad.addColorStop(0, '#fde047');
        grad.addColorStop(0.5, '#b45309');
        grad.addColorStop(1, '#451a03');
        ctx.fillStyle = grad;

        // Фигурная реликвия
        ctx.beginPath();
        ctx.roundRect(cx - 100, cy - 160, 200, 320, 28);
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 60, 0, Math.PI * 2);
        ctx.stroke();
      });
    });
  }
}
