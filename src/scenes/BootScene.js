export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createMasterAssets();
    this.scene.start('MenuScene');
  }

  createMasterAssets() {
    const make = (key, w, h, fn) => {
      const c = document.createElement('canvas');
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

    // 1. СЛУЖЕБНЫЕ АССЕТЫ
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

    // 2. ИНСТРУМЕНТЫ ЛОТКА (Качественные, детализированные)
    make('slot_scraper', 56, 56, (ctx) => {
      ctx.fillStyle = '#334155'; ctx.fillRect(25, 26, 6, 22);
      const g = ctx.createLinearGradient(12, 26, 44, 8);
      g.addColorStop(0, '#d97706'); g.addColorStop(0.5, '#fde047'); g.addColorStop(1, '#b45309');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(12, 26); ctx.lineTo(44, 26); ctx.lineTo(28, 8);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.2; ctx.stroke();
    });

    make('slot_brush_soft', 56, 56, (ctx) => {
      ctx.fillStyle = '#475569'; ctx.fillRect(25, 28, 6, 20);
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(22, 22, 12, 6);
      const bg = ctx.createLinearGradient(20, 8, 36, 22);
      bg.addColorStop(0, '#f59e0b'); bg.addColorStop(1, '#b45309');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(22, 22);
      ctx.quadraticCurveTo(16, 8, 28, 6);
      ctx.quadraticCurveTo(40, 8, 34, 22);
      ctx.closePath(); ctx.fill();
    });

    make('slot_solvent', 56, 56, (ctx) => {
      ctx.fillStyle = '#059669';
      ctx.beginPath(); ctx.roundRect(18, 20, 20, 30, 4); ctx.fill();
      ctx.fillStyle = '#34d399'; ctx.fillRect(23, 12, 10, 8);
      ctx.fillStyle = '#10b981'; ctx.fillRect(20, 10, 16, 3);
    });

    make('slot_glue', 56, 56, (ctx) => {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(20, 48); ctx.lineTo(36, 48); ctx.lineTo(31, 16); ctx.lineTo(25, 16);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(26, 8, 4, 8);
    });

    make('slot_polish', 56, 56, (ctx) => {
      const g = ctx.createRadialGradient(28, 28, 4, 28, 28, 16);
      g.addColorStop(0, '#f472b6'); g.addColorStop(1, '#9d174d');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.roundRect(14, 14, 28, 28, 6); ctx.fill();
      ctx.strokeStyle = '#fbcfe8'; ctx.lineWidth = 1; ctx.stroke();
    });

    // 3. МАСКИ ОЧИСТКИ
    const makeMask = (key, r) => {
      make(key, r * 2, r * 2, (ctx) => {
        const rad = ctx.createRadialGradient(r, r, 0, r, r, r);
        rad.addColorStop(0, 'rgba(0,0,0,1)');
        rad.addColorStop(0.7, 'rgba(0,0,0,0.85)');
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

    // 4. ЭТАЛОННЫЕ МОДЕЛИ АРТЕФАКТОВ (СТАНДАРТ 200x240, ИДЕАЛЬНАЯ ПОСАДКА НА СТОЛ)
    const W = 200, H = 240;

    // --- ДРЕВНИЙ ЕГИПЕТ ---
    // Скарабей (аккуратный, сбалансированный, золотой с лазуритом)
    make('art_egypt_scarab', W, H, (ctx) => {
      const cx = 100, cy = 120;
      ctx.strokeStyle = '#854d0e'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      // Передние лапки
      ctx.moveTo(cx - 20, cy - 15); ctx.lineTo(cx - 45, cy - 35); ctx.lineTo(cx - 52, cy - 48);
      ctx.moveTo(cx + 20, cy - 15); ctx.lineTo(cx + 45, cy - 35); ctx.lineTo(cx + 52, cy - 48);
      // Средние лапки
      ctx.moveTo(cx - 28, cy + 10); ctx.lineTo(cx - 52, cy + 14); ctx.lineTo(cx - 56, cy + 28);
      ctx.moveTo(cx + 28, cy + 10); ctx.lineTo(cx + 52, cy + 14); ctx.lineTo(cx + 56, cy + 28);
      // Задние лапки
      ctx.moveTo(cx - 24, cy + 32); ctx.lineTo(cx - 46, cy + 50); ctx.lineTo(cx - 50, cy + 68);
      ctx.moveTo(cx + 24, cy + 32); ctx.lineTo(cx + 46, cy + 50); ctx.lineTo(cx + 50, cy + 68);
      ctx.stroke();

      const g = ctx.createLinearGradient(cx - 36, cy, cx + 36, cy);
      g.addColorStop(0, '#b45309'); g.addColorStop(0.5, '#facc15'); g.addColorStop(1, '#78350f');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(cx, cy + 10, 36, 48, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 2; ctx.stroke();

      ctx.strokeStyle = '#713f12'; ctx.beginPath();
      ctx.moveTo(cx, cy - 16); ctx.lineTo(cx, cy + 58); ctx.stroke();

      ctx.fillStyle = '#ca8a04';
      ctx.beginPath(); ctx.ellipse(cx, cy - 22, 24, 12, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#a16207';
      ctx.beginPath(); ctx.arc(cx, cy - 34, 12, Math.PI, 0); ctx.closePath(); ctx.fill();

      const l = ctx.createRadialGradient(cx, cy + 8, 2, cx, cy + 8, 14);
      l.addColorStop(0, '#60a5fa'); l.addColorStop(0.7, '#2563eb'); l.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = l;
      ctx.beginPath(); ctx.ellipse(cx, cy + 8, 13, 17, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.5; ctx.stroke();
    });

    // Маска Тутанхамона
    make('art_egypt_mask', W, H, (ctx) => {
      const cx = 100, cy = 115;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 62); ctx.quadraticCurveTo(cx, cy - 72, cx + 24, cy - 62);
      ctx.lineTo(cx + 52, cy - 18); ctx.lineTo(cx + 42, cy + 34); ctx.lineTo(cx + 18, cy + 26);
      ctx.lineTo(cx + 12, cy + 68); ctx.lineTo(cx - 12, cy + 68); ctx.lineTo(cx - 18, cy + 26);
      ctx.lineTo(cx - 42, cy + 34); ctx.lineTo(cx - 52, cy - 18);
      ctx.closePath(); ctx.clip();

      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(cx - 60, cy - 80, 120, 160);
      ctx.fillStyle = '#facc15';
      for (let y = cy - 80; y < cy + 80; y += 12) ctx.fillRect(cx - 60, y, 120, 6);
      ctx.restore();

      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 62); ctx.quadraticCurveTo(cx, cy - 72, cx + 24, cy - 62);
      ctx.lineTo(cx + 52, cy - 18); ctx.lineTo(cx + 42, cy + 34); ctx.lineTo(cx + 18, cy + 26);
      ctx.lineTo(cx + 12, cy + 68); ctx.lineTo(cx - 12, cy + 68); ctx.lineTo(cx - 18, cy + 26);
      ctx.lineTo(cx - 42, cy + 34); ctx.lineTo(cx - 52, cy - 18);
      ctx.closePath(); ctx.stroke();

      const fG = ctx.createLinearGradient(cx - 18, cy, cx + 18, cy);
      fG.addColorStop(0, '#ca8a04'); fG.addColorStop(0.5, '#fef08a'); fG.addColorStop(1, '#a16207');
      ctx.fillStyle = fG;
      ctx.beginPath(); ctx.ellipse(cx, cy - 6, 22, 28, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 11, cy - 9, 6, 3); ctx.fillRect(cx + 5, cy - 9, 6, 3);
      ctx.fillStyle = '#991b1b'; ctx.fillRect(cx - 4, cy + 8, 8, 3);
      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(cx - 4, cy + 18, 8, 20);
    });

    // Обрядовый Анкх
    make('art_egypt_ankh', W, H, (ctx) => {
      const cx = 100, cy = 115;
      const b = ctx.createLinearGradient(cx - 30, 0, cx + 30, 0);
      b.addColorStop(0, '#78350f'); b.addColorStop(0.5, '#f59e0b'); b.addColorStop(1, '#92400e');
      ctx.fillStyle = b;
      ctx.fillRect(cx - 8, cy - 14, 16, 95);
      ctx.fillRect(cx - 34, cy - 10, 68, 14);
      ctx.lineWidth = 13; ctx.strokeStyle = b;
      ctx.beginPath(); ctx.ellipse(cx, cy - 40, 18, 26, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy - 3, 6, 0, Math.PI * 2); ctx.fill();
    });

    // Статуэтка Бастет (Черная кошка с золотым колье)
    make('art_egypt_bastet', W, H, (ctx) => {
      const cx = 100, cy = 120;
      const cG = ctx.createLinearGradient(cx - 26, cy, cx + 26, cy);
      cG.addColorStop(0, '#111827'); cG.addColorStop(0.5, '#374151'); cG.addColorStop(1, '#1f2937');
      ctx.fillStyle = cG;
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy - 14);
      ctx.bezierCurveTo(cx - 32, cy + 14, cx - 28, cy + 60, cx - 22, cy + 78);
      ctx.lineTo(cx + 22, cy + 78);
      ctx.bezierCurveTo(cx + 28, cy + 60, cx + 32, cy + 14, cx + 14, cy - 14);
      ctx.closePath(); ctx.fill();

      ctx.beginPath(); ctx.arc(cx, cy - 28, 16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy - 32); ctx.lineTo(cx - 9, cy - 52); ctx.lineTo(cx - 3, cy - 38); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 14, cy - 32); ctx.lineTo(cx + 9, cy - 52); ctx.lineTo(cx + 3, cy - 38); ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy - 14, 13, 0.2, Math.PI - 0.2); ctx.stroke();
    });

    // Алебастровая канопа
    make('art_egypt_canopic', W, H, (ctx) => {
      const cx = 100, cy = 120;
      const alG = ctx.createLinearGradient(cx - 32, cy, cx + 32, cy);
      alG.addColorStop(0, '#d97706'); alG.addColorStop(0.5, '#fef3c7'); alG.addColorStop(1, '#b45309');
      ctx.fillStyle = alG;
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 12);
      ctx.bezierCurveTo(cx - 40, cy + 18, cx - 35, cy + 65, cx - 22, cy + 80);
      ctx.lineTo(cx + 22, cy + 80);
      ctx.bezierCurveTo(cx + 35, cy + 65, cx + 40, cy + 18, cx + 22, cy - 12);
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy - 26, 18, 0, Math.PI * 2); ctx.fill();
    });

    // --- АНТИЧНОСТЬ ---
    make('art_antique_amphora', W, H, (ctx) => {
      const cx = 100, cy = 120;
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy - 40);
      ctx.bezierCurveTo(cx - 40, cy - 8, cx - 36, cy + 46, cx - 16, cy + 70);
      ctx.lineTo(cx + 16, cy + 70);
      ctx.bezierCurveTo(cx + 36, cy + 46, cx + 40, cy - 8, cx + 16, cy - 40);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx - 24, cy - 8, 14, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(cx + 24, cy - 8, 14, Math.PI * 1.5, Math.PI * 0.5);
      ctx.stroke();
    });

    make('art_antique_helmet', W, H, (ctx) => {
      const cx = 100, cy = 120;
      ctx.fillStyle = '#b45309';
      ctx.beginPath(); ctx.arc(cx, cy - 8, 32, Math.PI, 0);
      ctx.lineTo(cx + 30, cy + 30); ctx.lineTo(cx + 10, cy + 40);
      ctx.lineTo(cx + 5, cy + 12); ctx.lineTo(cx - 5, cy + 12);
      ctx.lineTo(cx - 10, cy + 40); ctx.lineTo(cx - 30, cy + 30);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.fillRect(cx - 4, cy - 48, 8, 36);
    });

    // --- ЕВРОПА ---
    make('art_europe_grail', W, H, (ctx) => {
      const cx = 100, cy = 120;
      ctx.fillStyle = '#e2b35b';
      ctx.beginPath();
      ctx.arc(cx, cy - 12, 26, 0, Math.PI);
      ctx.lineTo(cx + 5, cy + 35); ctx.lineTo(cx + 20, cy + 58);
      ctx.lineTo(cx - 20, cy + 58); ctx.lineTo(cx - 5, cy + 35);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2; ctx.stroke();
    });

    // --- ЯПОНИЯ ---
    make('art_japan_mask', W, H, (ctx) => {
      const cx = 100, cy = 120;
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 16); ctx.lineTo(cx + 30, cy - 16);
      ctx.lineTo(cx + 22, cy + 38); ctx.lineTo(cx, cy + 52);
      ctx.lineTo(cx - 22, cy + 38); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.fillRect(cx - 16, cy + 8, 32, 5);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 10, cy + 18, 20, 5);
    });

    // --- АЦТЕКИ ---
    make('art_aztec_idol', W, H, (ctx) => {
      const cx = 100, cy = 120;
      ctx.fillStyle = '#065f46';
      ctx.beginPath(); ctx.roundRect(cx - 26, cy - 40, 52, 80, 7); ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.fillRect(cx - 18, cy - 22, 12, 9); ctx.fillRect(cx + 6, cy - 22, 12, 9);
      ctx.fillRect(cx - 14, cy + 6, 28, 10);
    });

    // --- ВИКИНГИ ---
    make('art_viking_axe', W, H, (ctx) => {
      const cx = 100, cy = 120;
      ctx.fillStyle = '#78350f'; ctx.fillRect(cx - 5, cy - 45, 10, 105);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(cx + 4, cy - 35);
      ctx.quadraticCurveTo(cx + 40, cy - 40, cx + 44, cy - 8);
      ctx.quadraticCurveTo(cx + 30, cy + 8, cx + 4, cy);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.stroke();
    });
  }
}
