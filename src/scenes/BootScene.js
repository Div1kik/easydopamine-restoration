export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createHiResTextures();
    this.scene.start('MenuScene');
  }

  createHiResTextures() {
    const makeTex = (key, w, h, draw) => {
      const c = document.createElement('canvas');
      c.width = w * 2;
      c.height = h * 2;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.scale(2, 2);
      draw(ctx, w, h);
      if (this.textures.exists(key)) this.textures.remove(key);
      this.textures.addCanvas(key, c);
    };

    // Иконка возврата
    makeTex('icon_home', 48, 48, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(32, 10);
      ctx.lineTo(14, 24);
      ctx.lineTo(32, 38);
      ctx.lineTo(32, 30);
      ctx.lineTo(38, 30);
      ctx.lineTo(38, 18);
      ctx.lineTo(32, 18);
      ctx.closePath();
      ctx.fill();
    });

    // Инструменты
    makeTex('slot_scraper', 64, 64, (ctx) => {
      ctx.fillStyle = '#334155';
      ctx.fillRect(28, 30, 8, 24);
      const g = ctx.createLinearGradient(14, 30, 50, 10);
      g.addColorStop(0, '#d97706');
      g.addColorStop(0.5, '#fde047');
      g.addColorStop(1, '#b45309');
      ctx.fillStyle = g;
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

    makeTex('slot_brush_soft', 64, 64, (ctx) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(29, 32, 6, 24);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(26, 26, 12, 6);
      const bG = ctx.createLinearGradient(22, 10, 42, 26);
      bG.addColorStop(0, '#f59e0b');
      bG.addColorStop(1, '#b45309');
      ctx.fillStyle = bG;
      ctx.beginPath();
      ctx.moveTo(26, 26);
      ctx.quadraticCurveTo(20, 14, 32, 10);
      ctx.quadraticCurveTo(44, 14, 38, 26);
      ctx.closePath();
      ctx.fill();
    });

    makeTex('slot_solvent', 64, 64, (ctx) => {
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.roundRect(22, 22, 20, 34, 4);
      ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.fillRect(27, 14, 10, 8);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(24, 11, 16, 4);
    });

    makeTex('slot_glue', 64, 64, (ctx) => {
      const g = ctx.createLinearGradient(20, 20, 44, 54);
      g.addColorStop(0, '#f97316');
      g.addColorStop(1, '#c2410c');
      ctx.fillStyle = g;
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

    makeTex('slot_polish', 64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 32, 4, 32, 32, 18);
      g.addColorStop(0, '#f472b6');
      g.addColorStop(1, '#9d174d');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(16, 16, 32, 32, 8);
      ctx.fill();
    });

    // Маски стирания
    const makeMask = (key, r) => {
      makeTex(key, r * 2, r * 2, (ctx) => {
        const rad = ctx.createRadialGradient(r, r, 0, r, r, r);
        rad.addColorStop(0, 'rgba(0,0,0,1)');
        rad.addColorStop(0.75, 'rgba(0,0,0,0.85)');
        rad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(r, r, r, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    makeMask('mask_scraper', 32);
    makeMask('mask_brush', 42);
    makeMask('mask_solvent', 36);
    makeMask('mask_glue', 28);
    makeMask('mask_polish', 44);

    // 1. Золотой скарабей (анатомический, с лапками и надкрыльями)
    makeTex('art_egypt_scarab', 300, 400, (ctx) => {
      const cx = 150, cy = 205;
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';

      // Лапки
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy - 30);
      ctx.lineTo(cx - 85, cy - 65);
      ctx.lineTo(cx - 95, cy - 95);
      ctx.moveTo(cx + 35, cy - 30);
      ctx.lineTo(cx + 85, cy - 65);
      ctx.lineTo(cx + 95, cy - 95);

      ctx.moveTo(cx - 50, cy + 10);
      ctx.lineTo(cx - 95, cy + 15);
      ctx.lineTo(cx - 105, cy + 45);
      ctx.moveTo(cx + 50, cy + 10);
      ctx.lineTo(cx + 95, cy + 15);
      ctx.lineTo(cx + 105, cy + 45);

      ctx.moveTo(cx - 40, cy + 50);
      ctx.lineTo(cx - 85, cy + 85);
      ctx.lineTo(cx - 90, cy + 125);
      ctx.moveTo(cx + 40, cy + 50);
      ctx.lineTo(cx + 85, cy + 85);
      ctx.lineTo(cx + 90, cy + 125);
      ctx.stroke();

      // Панцирь
      const g = ctx.createLinearGradient(cx - 65, cy, cx + 65, cy);
      g.addColorStop(0, '#a16207');
      g.addColorStop(0.3, '#facc15');
      g.addColorStop(0.7, '#fef08a');
      g.addColorStop(1, '#854d0e');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 15, 62, 78, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 30);
      ctx.lineTo(cx, cy + 92);
      ctx.stroke();

      // Переднеспинка
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 42, 45, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Головной щиток
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.arc(cx, cy - 65, 22, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Лазуритовая вставка
      const l = ctx.createRadialGradient(cx, cy + 10, 2, cx, cy + 10, 26);
      l.addColorStop(0, '#60a5fa');
      l.addColorStop(0.6, '#2563eb');
      l.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = l;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 24, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });

    // 2. Маска Тутанхамона (закругленный правильный немес)
    makeTex('art_egypt_mask', 300, 400, (ctx) => {
      const cx = 150, cy = 195;
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

      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(cx - 100, cy - 130, 200, 260);

      ctx.fillStyle = '#facc15';
      for (let y = cy - 130; y < cy + 130; y += 18) {
        ctx.fillRect(cx - 100, y, 200, 9);
      }
      ctx.restore();

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

      // Лицо
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

      // Глаза
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

      // Бородка
      const bG = ctx.createLinearGradient(cx - 7, cy, cx + 7, cy);
      bG.addColorStop(0, '#1e3a8a');
      bG.addColorStop(0.5, '#facc15');
      bG.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = bG;
      ctx.fillRect(cx - 6, cy + 30, 12, 34);
      ctx.strokeRect(cx - 6, cy + 30, 12, 34);

      // Урей
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, cy - 54, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Обрядовый Анкх
    makeTex('art_egypt_ankh', 300, 400, (ctx) => {
      const cx = 150, cy = 185;
      const bG = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0);
      bG.addColorStop(0, '#78350f');
      bG.addColorStop(0.4, '#f59e0b');
      bG.addColorStop(0.7, '#fef08a');
      bG.addColorStop(1, '#92400e');
      ctx.fillStyle = bG;

      ctx.fillRect(cx - 13, cy - 20, 26, 145);
      ctx.fillRect(cx - 60, cy - 12, 120, 24);

      ctx.lineWidth = 22;
      ctx.strokeStyle = bG;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 65, 30, 44, 0, 0, Math.PI * 2);
      ctx.stroke();

      const rG = ctx.createRadialGradient(cx, cy, 2, cx, cy, 12);
      rG.addColorStop(0, '#f87171');
      rG.addColorStop(1, '#991b1b');
      ctx.fillStyle = rG;
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 4. Статуэтка Бастет
    makeTex('art_egypt_bastet', 300, 400, (ctx) => {
      const cx = 150, cy = 200;
      const cG = ctx.createLinearGradient(cx - 45, cy, cx + 45, cy);
      cG.addColorStop(0, '#09090b');
      cG.addColorStop(0.5, '#27272a');
      cG.addColorStop(1, '#18181b');
      ctx.fillStyle = cG;

      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 24);
      ctx.bezierCurveTo(cx - 52, cy + 20, cx - 48, cy + 105, cx - 38, cy + 130);
      ctx.lineTo(cx + 38, cy + 130);
      ctx.bezierCurveTo(cx + 48, cy + 105, cx + 52, cy + 20, cx + 24, cy - 24);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy - 46, 26, 0, Math.PI * 2);
      ctx.fill();

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

    // 5. Алебастровая канопа
    makeTex('art_egypt_canopic', 300, 400, (ctx) => {
      const cx = 150, cy = 205;
      const alG = ctx.createLinearGradient(cx - 50, cy, cx + 50, cy);
      alG.addColorStop(0, '#d97706');
      alG.addColorStop(0.3, '#fef3c7');
      alG.addColorStop(0.7, '#fef9c3');
      alG.addColorStop(1, '#b45309');
      ctx.fillStyle = alG;

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

      ctx.beginPath();
      ctx.arc(cx, cy - 44, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    makeTex('shard_amphora', 60, 60, (ctx) => {
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

    makeTex('particle_dust', 8, 8, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
