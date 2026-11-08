export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createHiResTextures();
    this.scene.start('MenuScene');
  }

  createHiResTextures() {
    const createHD = (key, width, height, drawCallback) => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.scale(2, 2);
      drawCallback(ctx, width, height);
      if (this.textures.exists(key)) this.textures.remove(key);
      this.textures.addCanvas(key, canvas);
    };

    // 1. Иконки инструментов
    createHD('slot_scraper', 64, 64, (ctx) => {
      ctx.fillStyle = '#334155';
      ctx.fillRect(28, 30, 8, 24);
      const grad = ctx.createLinearGradient(14, 30, 50, 10);
      grad.addColorStop(0, '#d97706');
      grad.addColorStop(0.5, '#fde047');
      grad.addColorStop(1, '#b45309');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(14, 30);
      ctx.lineTo(50, 30);
      ctx.lineTo(32, 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    createHD('slot_brush_soft', 64, 64, (ctx) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(29, 32, 6, 24);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(26, 26, 12, 6);
      const bGrad = ctx.createLinearGradient(22, 10, 42, 26);
      bGrad.addColorStop(0, '#f59e0b');
      bGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.moveTo(26, 26);
      ctx.quadraticCurveTo(20, 14, 32, 10);
      ctx.quadraticCurveTo(44, 14, 38, 26);
      ctx.closePath();
      ctx.fill();
    });

    createHD('slot_solvent', 64, 64, (ctx) => {
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.roundRect(22, 22, 20, 34, 4);
      ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.fillRect(27, 14, 10, 8);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(24, 11, 16, 4);
    });

    createHD('slot_glue', 64, 64, (ctx) => {
      const gGrad = ctx.createLinearGradient(20, 20, 44, 54);
      gGrad.addColorStop(0, '#f97316');
      gGrad.addColorStop(1, '#c2410c');
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.moveTo(24, 54);
      ctx.lineTo(40, 54);
      ctx.lineTo(35, 20);
      ctx.lineTo(29, 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(30, 10, 4, 10);
    });

    createHD('slot_polish', 64, 64, (ctx) => {
      const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 18);
      grad.addColorStop(0, '#f472b6');
      grad.addColorStop(1, '#9d174d');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(16, 16, 32, 32, 8);
      ctx.fill();
    });

    // 2. Маски очистки
    const createMask = (key, r) => {
      createHD(key, r * 2, r * 2, (ctx) => {
        const rad = ctx.createRadialGradient(r, r, 0, r, r, r);
        rad.addColorStop(0, 'rgba(0,0,0,1)');
        rad.addColorStop(0.7, 'rgba(0,0,0,0.85)');
        rad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(r, r, r, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    createMask('mask_scraper', 32);
    createMask('mask_brush', 42);
    createMask('mask_solvent', 36);
    createMask('mask_glue', 28);
    createMask('mask_polish', 44);

    // 3. Золотой скарабей (с лапками, анатомией надкрылий и лазуритом)
    createHD('art_egypt_scarab', 300, 400, (ctx) => {
      const cx = 150, cy = 205;

      // Лапки скарабея (бронзовые зубчатые)
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';

      // Верхние лапки
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy - 30);
      ctx.lineTo(cx - 85, cy - 65);
      ctx.lineTo(cx - 95, cy - 95);
      ctx.moveTo(cx + 35, cy - 30);
      ctx.lineTo(cx + 85, cy - 65);
      ctx.lineTo(cx + 95, cy - 95);

      // Средние лапки
      ctx.moveTo(cx - 50, cy + 10);
      ctx.lineTo(cx - 95, cy + 15);
      ctx.lineTo(cx - 105, cy + 45);
      ctx.moveTo(cx + 50, cy + 10);
      ctx.lineTo(cx + 95, cy + 15);
      ctx.lineTo(cx + 105, cy + 45);

      // Задние лапки
      ctx.moveTo(cx - 40, cy + 50);
      ctx.lineTo(cx - 85, cy + 85);
      ctx.lineTo(cx - 90, cy + 125);
      ctx.moveTo(cx + 40, cy + 50);
      ctx.lineTo(cx + 85, cy + 85);
      ctx.lineTo(cx + 90, cy + 125);
      ctx.stroke();

      // Панцирь (золотой овальный)
      const gGrad = ctx.createLinearGradient(cx - 65, cy, cx + 65, cy);
      gGrad.addColorStop(0, '#a16207');
      gGrad.addColorStop(0.3, '#facc15');
      gGrad.addColorStop(0.7, '#fef08a');
      gGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 15, 62, 78, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Линия надкрылий
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 30);
      ctx.lineTo(cx, cy + 92);
      ctx.stroke();

      // Переднеспинка (грудной щит)
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 42, 45, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Головной щиток с лучевыми зубцами
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.arc(cx, cy - 65, 22, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Лазуритовая вставка в центре
      const lGrad = ctx.createRadialGradient(cx, cy + 10, 2, cx, cy + 10, 26);
      lGrad.addColorStop(0, '#60a5fa');
      lGrad.addColorStop(0.6, '#2563eb');
      lGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = lGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 24, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });

    // 4. Маска Тутанхамона (анатомическая, с правильным платком немес)
    createHD('art_egypt_mask', 300, 400, (ctx) => {
      const cx = 150, cy = 195;

      // Немес: трапециевидная форма с расширением кверху
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy - 110);
      ctx.quadraticCurveTo(cx, cy - 125, cx + 35, cy - 110);
      ctx.lineTo(cx + 85, cy - 40);
      ctx.lineTo(cx + 70, cy + 55);
      ctx.lineTo(cx + 35, cy + 45);
      ctx.lineTo(cx + 25, cy + 110);
      ctx.lineTo(cx - 25, cy + 110);
      ctx.lineTo(cx - 35, cy + 45);
      ctx.lineTo(cx - 70, cy + 55);
      ctx.lineTo(cx - 85, cy - 40);
      ctx.closePath();
      ctx.clip();

      // Синий фон немеса
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(cx - 100, cy - 130, 200, 260);

      // Золотые полосы
      ctx.fillStyle = '#facc15';
      for (let y = cy - 130; y < cy + 130; y += 18) {
        ctx.fillRect(cx - 100, y, 200, 9);
      }
      ctx.restore();

      // Золотой контур немеса
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy - 110);
      ctx.quadraticCurveTo(cx, cy - 125, cx + 35, cy - 110);
      ctx.lineTo(cx + 85, cy - 40);
      ctx.lineTo(cx + 70, cy + 55);
      ctx.lineTo(cx + 35, cy + 45);
      ctx.lineTo(cx + 25, cy + 110);
      ctx.lineTo(cx - 25, cy + 110);
      ctx.lineTo(cx - 35, cy + 45);
      ctx.lineTo(cx - 70, cy + 55);
      ctx.lineTo(cx - 85, cy - 40);
      ctx.closePath();
      ctx.stroke();

      // Лицо фараона (золотой овал)
      const faceGrad = ctx.createLinearGradient(cx - 35, cy, cx + 35, cy);
      faceGrad.addColorStop(0, '#ca8a04');
      faceGrad.addColorStop(0.5, '#fef08a');
      faceGrad.addColorStop(1, '#a16207');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 8, 36, 46, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Глаза с подводкой
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(cx - 16, cy - 14, 8, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 16, cy - 14, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Губы
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 16, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Бородка фараона
      const bGrad = ctx.createLinearGradient(cx - 7, cy, cx + 7, cy);
      bGrad.addColorStop(0, '#1e3a8a');
      bGrad.addColorStop(0.5, '#facc15');
      bGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = bGrad;
      ctx.fillRect(cx - 6, cy + 30, 12, 34);
      ctx.strokeRect(cx - 6, cy + 30, 12, 34);

      // Урей (кобра на лбу)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, cy - 54, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Обрядовый Анкх
    createHD('art_egypt_ankh', 300, 400, (ctx) => {
      const cx = 150, cy = 185;
      const bGrad = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0);
      bGrad.addColorStop(0, '#78350f');
      bGrad.addColorStop(0.4, '#f59e0b');
      bGrad.addColorStop(0.7, '#fef08a');
      bGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = bGrad;

      // Ножка
      ctx.fillRect(cx - 13, cy - 20, 26, 145);
      // Перекладина
      ctx.fillRect(cx - 60, cy - 12, 120, 24);

      // Верхняя петля
      ctx.lineWidth = 22;
      ctx.strokeStyle = bGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 65, 30, 44, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Камень в средокрестии
      const rGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 12);
      rGrad.addColorStop(0, '#f87171');
      rGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 6. Статуэтка Бастет
    createHD('art_egypt_bastet', 300, 400, (ctx) => {
      const cx = 150, cy = 200;
      const catGrad = ctx.createLinearGradient(cx - 45, cy, cx + 45, cy);
      catGrad.addColorStop(0, '#09090b');
      catGrad.addColorStop(0.5, '#27272a');
      catGrad.addColorStop(1, '#18181b');
      ctx.fillStyle = catGrad;

      // Сидящее тело кошки
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 24);
      ctx.bezierCurveTo(cx - 52, cy + 20, cx - 48, cy + 105, cx - 38, cy + 130);
      ctx.lineTo(cx + 38, cy + 130);
      ctx.bezierCurveTo(cx + 48, cy + 105, cx + 52, cy + 20, cx + 24, cy - 24);
      ctx.closePath();
      ctx.fill();

      // Голова
      ctx.beginPath();
      ctx.arc(cx, cy - 46, 26, 0, Math.PI * 2);
      ctx.fill();

      // Острые ушки
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 54);
      ctx.lineTo(cx - 16, cy - 84);
      ctx.lineTo(cx - 4, cy - 60);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 24, cy - 54);
      ctx.lineTo(cx + 16, cy - 84);
      ctx.lineTo(cx + 4, cy - 60);
      ctx.closePath();
      ctx.fill();

      // Золотое колье и серьги
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 24, 20, 0.2, Math.PI - 0.2);
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx - 22, cy - 40, 3, 0, Math.PI * 2);
      ctx.arc(cx + 22, cy - 40, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 7. Алебастровая канопа
    createHD('art_egypt_canopic', 300, 400, (ctx) => {
      const cx = 150, cy = 205;
      const alabGrad = ctx.createLinearGradient(cx - 50, cy, cx + 50, cy);
      alabGrad.addColorStop(0, '#d97706');
      alabGrad.addColorStop(0.3, '#fef3c7');
      alabGrad.addColorStop(0.7, '#fef9c3');
      alabGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = alabGrad;

      // Тело кувшина
      ctx.beginPath();
      ctx.moveTo(cx - 38, cy - 18);
      ctx.bezierCurveTo(cx - 68, cy + 30, cx - 58, cy + 110, cx - 36, cy + 130);
      ctx.lineTo(cx + 36, cy + 130);
      ctx.bezierCurveTo(cx + 58, cy + 110, cx + 68, cy + 30, cx + 38, cy - 18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Крышка с головой
      ctx.beginPath();
      ctx.arc(cx, cy - 44, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Осколок для склейки
    createHD('shard_amphora', 60, 60, (ctx) => {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(12, 14);
      ctx.lineTo(48, 10);
      ctx.lineTo(38, 48);
      ctx.lineTo(14, 40);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Иконка возврата (четкая векторная стрелка)
    createHD('icon_home', 48, 48, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(32, 12);
      ctx.lineTo(16, 24);
      ctx.lineTo(32, 36);
      ctx.lineTo(32, 28);
      ctx.lineTo(38, 28);
      ctx.lineTo(38, 20);
      ctx.lineTo(32, 20);
      ctx.closePath();
      ctx.fill();
    });

    createHD('particle_dust', 8, 8, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
