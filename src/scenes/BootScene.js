export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createCleanTextures();
    this.scene.start('MenuScene');
  }

  createCleanTextures() {
    const make = (key, w, h, fn) => {
      const c = document.createElement('canvas');
      // Рендерим на холсте двойного разрешения для идеальной гладкости линий и бликов
      c.width = w * 2;
      c.height = h * 2;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.scale(2, 2);
      fn(ctx, w, h);
      if (this.textures.exists(key)) this.textures.remove(key);
      this.textures.addCanvas(key, c);
    };

    // 1. ИКОНКИ ИНСТРУМЕНТОВ
    make('slot_scraper', 56, 56, (ctx) => {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.roundRect(25, 26, 6, 22, 2); ctx.fill();
      const metalGrad = ctx.createLinearGradient(10, 26, 46, 8);
      metalGrad.addColorStop(0, '#b45309');
      metalGrad.addColorStop(0.3, '#fde047');
      metalGrad.addColorStop(0.7, '#facc15');
      metalGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = metalGrad;
      ctx.beginPath();
      ctx.moveTo(10, 26); ctx.lineTo(46, 26); ctx.lineTo(28, 8);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.2; ctx.stroke();
    });

    make('slot_brush_soft', 56, 56, (ctx) => {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.roundRect(26, 28, 4, 20, 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(23, 23, 10, 5);
      const hairGrad = ctx.createLinearGradient(18, 6, 38, 23);
      hairGrad.addColorStop(0, '#d97706');
      hairGrad.addColorStop(0.4, '#f59e0b');
      hairGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = hairGrad;
      ctx.beginPath();
      ctx.moveTo(23, 23);
      ctx.quadraticCurveTo(16, 10, 28, 6);
      ctx.quadraticCurveTo(40, 10, 33, 23);
      ctx.closePath(); ctx.fill();
    });

    make('slot_solvent', 56, 56, (ctx) => {
      const botGrad = ctx.createLinearGradient(18, 0, 38, 0);
      botGrad.addColorStop(0, '#047857');
      botGrad.addColorStop(0.5, '#10b981');
      botGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = botGrad;
      ctx.beginPath(); ctx.roundRect(18, 20, 20, 30, 4); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(24, 14, 8, 6);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(19, 10, 18, 4);
      ctx.fillRect(16, 11, 4, 2);
    });

    make('slot_glue', 56, 56, (ctx) => {
      const tubeGrad = ctx.createLinearGradient(18, 0, 38, 0);
      tubeGrad.addColorStop(0, '#c2410c');
      tubeGrad.addColorStop(0.5, '#fb923c');
      tubeGrad.addColorStop(1, '#9a3412');
      ctx.fillStyle = tubeGrad;
      ctx.beginPath();
      ctx.moveTo(19, 48); ctx.lineTo(37, 48); ctx.lineTo(32, 18); ctx.lineTo(24, 18);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fde047'; ctx.fillRect(26, 8, 4, 10);
    });

    make('slot_polish', 56, 56, (ctx) => {
      const clothGrad = ctx.createRadialGradient(28, 28, 4, 28, 28, 18);
      clothGrad.addColorStop(0, '#f472b6');
      clothGrad.addColorStop(0.7, '#c026d3');
      clothGrad.addColorStop(1, '#701a75');
      ctx.fillStyle = clothGrad;
      ctx.beginPath(); ctx.roundRect(14, 14, 28, 28, 7); ctx.fill();
      ctx.strokeStyle = '#fbcfe8'; ctx.lineWidth = 1; ctx.stroke();
    });

    // 2. МАСКИ СТИРАНИЯ
    const makeMask = (key, r) => {
      make(key, r * 2, r * 2, (ctx) => {
        const rad = ctx.createRadialGradient(r, r, 0, r, r, r);
        rad.addColorStop(0, 'rgba(0,0,0,1)');
        rad.addColorStop(0.75, 'rgba(0,0,0,0.85)');
        rad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rad;
        ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI * 2); ctx.fill();
      });
    };
    makeMask('mask_scraper', 26);
    makeMask('mask_brush', 32);
    makeMask('mask_solvent', 28);
    makeMask('mask_glue', 22);
    makeMask('mask_polish', 34);

    // 3. ОБЪЕМНЫЕ ДЕТАЛИЗИРОВАННЫЕ МОДЕЛИ (200x240)
    const W = 200, H = 240;

    // --- ЗОЛОТОЙ СКАРАБЕЙ ---
    make('art_egypt_scarab', W, H, (ctx) => {
      const cx = 100, cy = 120;

      // Тени под лапками
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 13); ctx.lineTo(cx - 43, cy - 33); ctx.lineTo(cx - 50, cy - 46);
      ctx.moveTo(cx + 20, cy - 13); ctx.lineTo(cx + 43, cy - 33); ctx.lineTo(cx + 50, cy - 46);
      ctx.moveTo(cx - 26, cy + 12); ctx.lineTo(cx - 50, cy + 16); ctx.lineTo(cx - 54, cy + 30);
      ctx.moveTo(cx + 26, cy + 12); ctx.lineTo(cx + 50, cy + 16); ctx.lineTo(cx + 54, cy + 30);
      ctx.moveTo(cx - 22, cy + 34); ctx.lineTo(cx - 44, cy + 52); ctx.lineTo(cx - 48, cy + 70);
      ctx.moveTo(cx + 22, cy + 34); ctx.lineTo(cx + 44, cy + 52); ctx.lineTo(cx + 48, cy + 70);
      ctx.stroke();

      // Сегментированные лапки
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 15); ctx.lineTo(cx - 45, cy - 35); ctx.lineTo(cx - 52, cy - 48);
      ctx.moveTo(cx + 20, cy - 15); ctx.lineTo(cx + 45, cy - 35); ctx.lineTo(cx + 52, cy - 48);
      ctx.moveTo(cx - 28, cy + 10); ctx.lineTo(cx - 52, cy + 14); ctx.lineTo(cx - 56, cy + 28);
      ctx.moveTo(cx + 28, cy + 10); ctx.lineTo(cx + 52, cy + 14); ctx.lineTo(cx + 56, cy + 28);
      ctx.moveTo(cx - 24, cy + 32); ctx.lineTo(cx - 46, cy + 50); ctx.lineTo(cx - 50, cy + 68);
      ctx.moveTo(cx + 24, cy + 32); ctx.lineTo(cx + 46, cy + 50); ctx.lineTo(cx + 50, cy + 68);
      ctx.stroke();

      // Панцирь с объемной градиентной светотенью
      const shellGrad = ctx.createRadialGradient(cx - 10, cy - 10, 8, cx, cy + 10, 55);
      shellGrad.addColorStop(0, '#fef08a');
      shellGrad.addColorStop(0.3, '#facc15');
      shellGrad.addColorStop(0.7, '#ca8a04');
      shellGrad.addColorStop(1, '#713f12');
      ctx.fillStyle = shellGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy + 10, 38, 50, 0, 0, Math.PI * 2); ctx.fill();

      // Золотая окантовка панциря
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Прорезь между надкрыльями
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx, cy - 18); ctx.lineTo(cx, cy + 59); ctx.stroke();

      // Переднеспинка (щиток)
      const thoraxGrad = ctx.createLinearGradient(cx - 25, cy - 25, cx + 25, cy - 15);
      thoraxGrad.addColorStop(0, '#eab308');
      thoraxGrad.addColorStop(0.5, '#fef08a');
      thoraxGrad.addColorStop(1, '#a16207');
      ctx.fillStyle = thoraxGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy - 22, 26, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#713f12'; ctx.lineWidth = 1.5; ctx.stroke();

      // Головной щиток
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath(); ctx.arc(cx, cy - 34, 13, Math.PI, 0); ctx.closePath(); ctx.fill();

      // Лазуритовая вставка с глубоким кабошоном и бликом
      const gemGrad = ctx.createRadialGradient(cx - 3, cy + 5, 2, cx, cy + 8, 16);
      gemGrad.addColorStop(0, '#93c5fd');
      gemGrad.addColorStop(0.25, '#3b82f6');
      gemGrad.addColorStop(0.75, '#1d4ed8');
      gemGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = gemGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy + 8, 14, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2; ctx.stroke();

      // Блик света на камне
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath(); ctx.ellipse(cx - 5, cy + 3, 4, 2.5, -0.4, 0, Math.PI * 2); ctx.fill();
    });

    // --- МАСКА ТУТАНХАМОНА ---
    make('art_egypt_mask', W, H, (ctx) => {
      const cx = 100, cy = 115;

      // Тень под маской
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(cx, cy + 72, 35, 12, 0, 0, Math.PI * 2); ctx.fill();

      // Немес
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 62); ctx.quadraticCurveTo(cx, cy - 74, cx + 24, cy - 62);
      ctx.lineTo(cx + 54, cy - 18); ctx.lineTo(cx + 42, cy + 34); ctx.lineTo(cx + 18, cy + 26);
      ctx.lineTo(cx + 12, cy + 68); ctx.lineTo(cx - 12, cy + 68); ctx.lineTo(cx - 18, cy + 26);
      ctx.lineTo(cx - 42, cy + 34); ctx.lineTo(cx - 54, cy - 18);
      ctx.closePath(); ctx.clip();

      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(cx - 60, cy - 80, 120, 160);
      const goldStripe = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0);
      goldStripe.addColorStop(0, '#ca8a04'); goldStripe.addColorStop(0.5, '#fef08a'); goldStripe.addColorStop(1, '#a16207');
      ctx.fillStyle = goldStripe;
      for (let y = cy - 80; y < cy + 80; y += 12) ctx.fillRect(cx - 60, y, 120, 6);
      ctx.restore();

      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 62); ctx.quadraticCurveTo(cx, cy - 74, cx + 24, cy - 62);
      ctx.lineTo(cx + 54, cy - 18); ctx.lineTo(cx + 42, cy + 34); ctx.lineTo(cx + 18, cy + 26);
      ctx.lineTo(cx + 12, cy + 68); ctx.lineTo(cx - 12, cy + 68); ctx.lineTo(cx - 18, cy + 26);
      ctx.lineTo(cx - 42, cy + 34); ctx.lineTo(cx - 54, cy - 18);
      ctx.closePath(); ctx.stroke();

      // Золотое лицо
      const faceGrad = ctx.createRadialGradient(cx - 4, cy - 10, 4, cx, cy - 5, 26);
      faceGrad.addColorStop(0, '#fef08a');
      faceGrad.addColorStop(0.4, '#eab308');
      faceGrad.addColorStop(0.85, '#ca8a04');
      faceGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = faceGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy - 6, 23, 29, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#854d0e'; ctx.lineWidth = 1; ctx.stroke();

      // Глаза с подводкой
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.ellipse(cx - 11, cy - 9, 6, 3, 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 11, cy - 9, 6, 3, -0.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 11, cy - 9, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 11, cy - 9, 1.8, 0, Math.PI * 2); ctx.fill();

      // Губы
      ctx.fillStyle = '#991b1b';
      ctx.beginPath(); ctx.ellipse(cx, cy + 8, 8, 3.5, 0, 0, Math.PI * 2); ctx.fill();

      // Бородка фараона
      const bG = ctx.createLinearGradient(cx - 5, 0, cx + 5, 0);
      bG.addColorStop(0, '#1e3a8a'); bG.addColorStop(0.5, '#facc15'); bG.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = bG;
      ctx.beginPath(); ctx.roundRect(cx - 5, cy + 18, 10, 22, 2); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 1; ctx.stroke();

      // Урей (кобра)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(cx, cy - 50, 4.5, 0, Math.PI * 2); ctx.fill();
    });

    // --- ОБРЯДОВЫЙ АНКХ ---
    make('art_egypt_ankh', W, H, (ctx) => {
      const cx = 100, cy = 115;
      const bronzeGrad = ctx.createLinearGradient(cx - 32, cy - 40, cx + 32, cy + 40);
      bronzeGrad.addColorStop(0, '#78350f');
      bronzeGrad.addColorStop(0.35, '#f59e0b');
      bronzeGrad.addColorStop(0.65, '#fef08a');
      bronzeGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = bronzeGrad;

      // Ножка
      ctx.beginPath(); ctx.roundRect(cx - 8, cy - 14, 16, 95, 3); ctx.fill();
      // Перекладина
      ctx.beginPath(); ctx.roundRect(cx - 36, cy - 10, 72, 14, 3); ctx.fill();

      // Верхняя петля
      ctx.lineWidth = 14;
      ctx.strokeStyle = bronzeGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy - 40, 18, 26, 0, 0, Math.PI * 2); ctx.stroke();

      // Камень в средокрестии с бликом
      const rubyGrad = ctx.createRadialGradient(cx - 2, cy - 5, 1, cx, cy - 3, 8);
      rubyGrad.addColorStop(0, '#f87171');
      rubyGrad.addColorStop(0.5, '#dc2626');
      rubyGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = rubyGrad;
      ctx.beginPath(); ctx.arc(cx, cy - 3, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.5; ctx.stroke();
    });

    // --- СТАТУЭТКА БАСТЕТ ---
    make('art_egypt_bastet', W, H, (ctx) => {
      const cx = 100, cy = 120;

      // Базальтовое гладкое тело с мягким переходом
      const catGrad = ctx.createRadialGradient(cx - 6, cy + 10, 10, cx, cy + 25, 60);
      catGrad.addColorStop(0, '#374151');
      catGrad.addColorStop(0.4, '#1f2937');
      catGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = catGrad;

      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 14);
      ctx.bezierCurveTo(cx - 34, cy + 14, cx - 30, cy + 62, cx - 24, cy + 80);
      ctx.lineTo(cx + 24, cy + 80);
      ctx.bezierCurveTo(cx + 30, cy + 62, cx + 34, cy + 14, cx + 15, cy - 14);
      ctx.closePath(); ctx.fill();

      // Голова
      ctx.beginPath(); ctx.arc(cx, cy - 28, 17, 0, Math.PI * 2); ctx.fill();

      // Ушки
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 32); ctx.lineTo(cx - 10, cy - 54); ctx.lineTo(cx - 3, cy - 38); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 15, cy - 32); ctx.lineTo(cx + 10, cy - 54); ctx.lineTo(cx + 3, cy - 38); ctx.closePath(); ctx.fill();

      // Изумрудные глаза
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.ellipse(cx - 6, cy - 28, 3, 1.8, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 6, cy - 28, 3, 1.8, 0.2, 0, Math.PI * 2); ctx.fill();

      // Золотое колье и серьги
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy - 14, 14, 0.2, Math.PI - 0.2); ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.arc(cx - 15, cy - 25, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 15, cy - 25, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    // --- АЛЕБАСТРОВАЯ КАНОПА ---
    make('art_egypt_canopic', W, H, (ctx) => {
      const cx = 100, cy = 120;
      const alGrad = ctx.createLinearGradient(cx - 35, 0, cx + 35, 0);
      alGrad.addColorStop(0, '#b45309');
      alGrad.addColorStop(0.3, '#fef3c7');
      alGrad.addColorStop(0.7, '#fffbeb');
      alGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = alGrad;

      // Тело кувшина
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 12);
      ctx.bezierCurveTo(cx - 42, cy + 18, cx - 36, cy + 65, cx - 24, cy + 82);
      ctx.lineTo(cx + 24, cy + 82);
      ctx.bezierCurveTo(cx + 36, cy + 65, cx + 42, cy + 18, cx + 22, cy - 12);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5; ctx.stroke();

      // Крышка с головой сокола
      ctx.beginPath(); ctx.arc(cx, cy - 26, 19, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5; ctx.stroke();

      // Клюв
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath(); ctx.moveTo(cx - 4, cy - 24); ctx.lineTo(cx + 4, cy - 24); ctx.lineTo(cx, cy - 16); ctx.closePath(); ctx.fill();
    });

    // Служебные ассеты
    make('icon_home', 40, 40, (ctx) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(20, 8); ctx.lineTo(8, 20); ctx.lineTo(13, 20);
      ctx.lineTo(13, 32); ctx.lineTo(27, 32); ctx.lineTo(27, 20); ctx.lineTo(32, 20);
      ctx.closePath(); ctx.fill();
    });

    make('particle_dust', 6, 6, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(3, 3, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    make('shard_amphora', 48, 48, (ctx) => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(10, 12); ctx.lineTo(38, 8); ctx.lineTo(32, 38); ctx.lineTo(12, 30);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5; ctx.stroke();
    });
  }
}
