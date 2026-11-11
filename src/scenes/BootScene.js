export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createRestorationAssets();
    this.scene.start('MenuScene');
  }

  createRestorationAssets() {
    const make = (key, w, h, fn) => {
      if (this.textures.exists(key)) return;
      const cvs = this.textures.createCanvas(key, w, h);
      const ctx = cvs.getContext();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      fn(ctx);
      cvs.refresh();
    };

    // =========================================================================
    // 1. ИКОНКИ МАГАЗИНА И ЛОТКА (ВОССТАНОВЛЕНИЕ СЛОТОВ ДЛЯ SHOP И RESTORE)
    // =========================================================================
    const drawSlotBg = (ctx) => {
      ctx.clearRect(0, 0, 96, 96);
    };

    // Скребок
    const makeScraperSlot = (ctx) => {
      drawSlotBg(ctx);
      ctx.fillStyle = '#451a03';
      ctx.beginPath(); ctx.roundRect(42, 46, 12, 44, 4); ctx.fill();
      ctx.fillStyle = '#ca8a04'; ctx.fillRect(40, 40, 16, 8);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath(); ctx.moveTo(48, 8); ctx.lineTo(76, 40); ctx.lineTo(20, 40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.moveTo(48, 8); ctx.lineTo(54, 40); ctx.lineTo(48, 40); ctx.closePath(); ctx.fill();
    };
    make('slot_scraper', 96, 96, makeScraperSlot);

    // Кисть
    const makeBrushSlot = (ctx) => {
      drawSlotBg(ctx);
      ctx.fillStyle = '#78350f';
      ctx.beginPath(); ctx.roundRect(43, 48, 10, 42, 4); ctx.fill();
      ctx.fillStyle = '#cbd5e1'; ctx.fillRect(38, 34, 20, 16);
      const bg = ctx.createLinearGradient(48, 8, 48, 34);
      bg.addColorStop(0, '#1c1917'); bg.addColorStop(0.6, '#b45309'); bg.addColorStop(1, '#fef08a');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.ellipse(48, 22, 16, 16, 0, 0, Math.PI * 2); ctx.fill();
    };
    make('slot_brush', 96, 96, makeBrushSlot);
    make('slot_brush_soft', 96, 96, makeBrushSlot);

    // Спрей
    make('slot_solvent', 96, 96, (ctx) => {
      drawSlotBg(ctx);
      const fg = ctx.createLinearGradient(32, 32, 64, 32);
      fg.addColorStop(0, '#064e3b'); fg.addColorStop(0.5, '#059669'); fg.addColorStop(1, '#022c22');
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.roundRect(32, 32, 32, 56, 8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(36, 36, 4, 48);
      ctx.fillStyle = '#d97706'; ctx.fillRect(42, 18, 12, 14);
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(36, 12, 22, 8); ctx.fillRect(54, 6, 14, 8);
    });

    // Клей
    make('slot_glue', 96, 96, (ctx) => {
      drawSlotBg(ctx);
      const pg = ctx.createLinearGradient(30, 36, 66, 36);
      pg.addColorStop(0, '#0f172a'); pg.addColorStop(0.5, '#334155'); pg.addColorStop(1, '#020617');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.roundRect(30, 36, 36, 52, 8); ctx.fill();
      ctx.fillStyle = '#d4af37'; ctx.fillRect(36, 50, 24, 22);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(40, 24, 16, 14);
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(48, 18, 10, 0, Math.PI * 2); ctx.fill();
    });

    // Замша
    make('slot_polish', 96, 96, (ctx) => {
      drawSlotBg(ctx);
      const zg = ctx.createRadialGradient(48, 48, 6, 48, 48, 36);
      zg.addColorStop(0, '#fde68a'); zg.addColorStop(0.6, '#d97706'); zg.addColorStop(1, '#92400e');
      ctx.fillStyle = zg;
      ctx.beginPath(); ctx.roundRect(26, 26, 44, 44, 12); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(46, 46, 12, 0.4, Math.PI * 1.3); ctx.stroke();
    });

    // Премиальные инструменты (для ShopScene)
    make('slot_laser', 96, 96, (ctx) => {
      drawSlotBg(ctx);
      ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.roundRect(40, 20, 16, 68, 6); ctx.fill();
      ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(48, 16, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 3; ctx.stroke();
    });

    make('slot_emulsion', 96, 96, (ctx) => {
      drawSlotBg(ctx);
      ctx.fillStyle = '#831843'; ctx.beginPath(); ctx.roundRect(30, 28, 36, 60, 10); ctx.fill();
      ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.arc(48, 56, 10, 0, Math.PI * 2); ctx.fill();
    });

    make('slot_resin', 96, 96, (ctx) => {
      drawSlotBg(ctx);
      ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.roundRect(32, 28, 32, 58, 8); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.fillRect(36, 44, 24, 24);
    });

    // =========================================================================
    // 2. ИКОНКИ ЗВЕЗД, МАСОК И ЧАСТИЦ
    // =========================================================================
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
      g.addColorStop(0, '#fffbeb'); g.addColorStop(0.4, '#facc15'); g.addColorStop(1, '#ca8a04');
      ctx.fillStyle = g;
      drawStar(ctx, 32, 32, 5, 26, 12);
      ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2.5; ctx.stroke();
    });

    make('icon_star_empty', 64, 64, (ctx) => {
      ctx.fillStyle = '#1e293b';
      drawStar(ctx, 32, 32, 5, 26, 12);
      ctx.fill();
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.stroke();
    });

    make('mask_scraper', 64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.75, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(32, 32, 30, 0, Math.PI * 2); ctx.fill();
    });

    make('mask_brush', 72, 72, (ctx) => {
      const g = ctx.createRadialGradient(36, 36, 0, 36, 36, 34);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.8, 'rgba(0,0,0,0.7)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(36, 36, 34, 0, Math.PI * 2); ctx.fill();
    });

    make('mask_solvent', 64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.85, 'rgba(0,0,0,0.8)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(32, 32, 30, 0, Math.PI * 2); ctx.fill();
    });

    make('mask_glue', 64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(32, 32, 28, 0, Math.PI * 2); ctx.fill();
    });

    make('mask_polish', 72, 72, (ctx) => {
      const g = ctx.createRadialGradient(36, 36, 0, 36, 36, 35);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.8, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(36, 36, 35, 0, Math.PI * 2); ctx.fill();
    });

    make('particle_dust', 12, 12, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.fill();
    });

    // =========================================================================
    // 3. ПОЛНАЯ ГАЛЕРЕЯ АРТЕФАКТОВ (Hi-Res 640x800)
    // =========================================================================
    const W = 640;
    const H = 800;
    const cx = 320;
    const cy = 400;

    const shadow = (ctx, rx = 120, ry = 28, yOff = 230) => {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + yOff, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    // --- ЕГИПЕТ ---
    make('art_egypt_bastet', W, H, (ctx) => {
      shadow(ctx, 130, 35, 240);
      const bg = ctx.createLinearGradient(cx - 120, cy, cx + 120, cy);
      bg.addColorStop(0, '#0a0d14'); bg.addColorStop(0.35, '#222836'); bg.addColorStop(0.65, '#161a24'); bg.addColorStop(1, '#07090e');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy - 80);
      ctx.bezierCurveTo(cx - 75, cy - 20, cx - 110, cy + 80, cx - 115, cy + 220);
      ctx.quadraticCurveTo(cx, cy + 245, cx + 115, cy + 220);
      ctx.bezierCurveTo(cx + 110, cy + 80, cx + 75, cy - 20, cx + 45, cy - 80);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#1b202e'; ctx.lineWidth = 18; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy + 215, 110, 0.2, Math.PI * 0.95); ctx.stroke();

      ctx.fillStyle = '#161b26';
      ctx.beginPath(); ctx.roundRect(cx - 36, cy + 120, 26, 110, 10); ctx.roundRect(cx + 10, cy + 120, 26, 110, 10); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy - 100, 68, 75, 0, 0, Math.PI * 2); ctx.fill();

      const earGrad = ctx.createLinearGradient(cx, cy - 210, cx, cy - 140);
      earGrad.addColorStop(0, '#384152'); earGrad.addColorStop(1, '#11151e');
      ctx.fillStyle = earGrad;
      ctx.beginPath(); ctx.moveTo(cx - 56, cy - 130); ctx.lineTo(cx - 52, cy - 210); ctx.lineTo(cx - 15, cy - 155); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 56, cy - 130); ctx.lineTo(cx + 52, cy - 210); ctx.lineTo(cx + 15, cy - 155); ctx.closePath(); ctx.fill();

      ctx.fillStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.beginPath(); ctx.moveTo(cx - 48, cy - 135); ctx.lineTo(cx - 45, cy - 195); ctx.lineTo(cx - 20, cy - 155); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 48, cy - 135); ctx.lineTo(cx + 45, cy - 195); ctx.lineTo(cx + 20, cy - 155); ctx.closePath(); ctx.fill();

      const gold = ctx.createLinearGradient(cx - 80, cy, cx + 80, cy);
      gold.addColorStop(0, '#b48a28'); gold.addColorStop(0.5, '#fde047'); gold.addColorStop(1, '#856417');
      ctx.strokeStyle = gold; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(cx, cy - 90, 72, 0.4, Math.PI - 0.4); ctx.stroke();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx, cy - 90, 84, 0.45, Math.PI - 0.45); ctx.stroke();
      ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(cx, cy - 14, 12, 0, Math.PI * 2); ctx.fill();

      const eye = ctx.createLinearGradient(0, cy - 110, 0, cy - 90);
      eye.addColorStop(0, '#10b981'); eye.addColorStop(1, '#064e3b');
      ctx.fillStyle = eye;
      ctx.beginPath(); ctx.ellipse(cx - 26, cy - 105, 14, 8, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 26, cy - 105, 14, 8, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#051b11';
      ctx.beginPath(); ctx.ellipse(cx - 26, cy - 105, 4, 8, 0, 0, Math.PI * 2); ctx.ellipse(cx + 26, cy - 105, 4, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 28, cy - 107, 2.5, 0, Math.PI * 2); ctx.arc(cx + 24, cy - 107, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    make('art_egypt_canopic', W, H, (ctx) => {
      shadow(ctx, 120, 28, 245);
      const jg = ctx.createLinearGradient(cx - 120, cy, cx + 120, cy);
      jg.addColorStop(0, '#d1c7ac'); jg.addColorStop(0.2, '#f5eedb'); jg.addColorStop(0.5, '#fffdf7'); jg.addColorStop(0.8, '#ede3cb'); jg.addColorStop(1, '#b8ad91');
      ctx.fillStyle = jg;
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy - 40);
      ctx.bezierCurveTo(cx - 130, cy + 20, cx - 135, cy + 180, cx - 80, cy + 235);
      ctx.lineTo(cx + 80, cy + 235);
      ctx.bezierCurveTo(cx + 135, cy + 180, cx + 130, cy + 20, cx + 60, cy - 40);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = 'rgba(180, 160, 130, 0.28)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - 80, cy + 30); ctx.quadraticCurveTo(cx - 20, cy + 80, cx - 40, cy + 180); ctx.stroke();
      ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.beginPath(); ctx.roundRect(cx - 42, cy + 40, 84, 110, 8); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 2; ctx.stroke();

      ctx.fillStyle = '#e2d9bf';
      ctx.beginPath(); ctx.ellipse(cx, cy - 45, 75, 18, 0, 0, Math.PI * 2); ctx.fill();
      const hg = ctx.createLinearGradient(cx - 60, cy - 140, cx + 60, cy - 140);
      hg.addColorStop(0, '#c7bc9f'); hg.addColorStop(0.5, '#f5eedb'); hg.addColorStop(1, '#b5a98d');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.ellipse(cx, cy - 120, 62, 70, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#856417';
      ctx.beginPath(); ctx.moveTo(cx - 14, cy - 110); ctx.lineTo(cx, cy - 80); ctx.lineTo(cx + 14, cy - 110); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(cx - 26, cy - 125, 6, 0, Math.PI * 2); ctx.arc(cx + 26, cy - 125, 6, 0, Math.PI * 2); ctx.fill();
    });

    make('art_egypt_scarab', W, H, (ctx) => {
      shadow(ctx, 140, 160, 20);
      ctx.strokeStyle = '#b48a28'; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy - 90); ctx.lineTo(cx - 110, cy - 160); ctx.lineTo(cx - 60, cy - 200);
      ctx.moveTo(cx + 60, cy - 90); ctx.lineTo(cx + 110, cy - 160); ctx.lineTo(cx + 60, cy - 200);
      ctx.moveTo(cx - 80, cy); ctx.lineTo(cx - 140, cy + 10); ctx.lineTo(cx - 120, cy + 70);
      ctx.moveTo(cx + 80, cy); ctx.lineTo(cx + 140, cy + 10); ctx.lineTo(cx + 120, cy + 70);
      ctx.moveTo(cx - 60, cy + 90); ctx.lineTo(cx - 120, cy + 160); ctx.lineTo(cx - 70, cy + 210);
      ctx.moveTo(cx + 60, cy + 90); ctx.lineTo(cx + 120, cy + 160); ctx.lineTo(cx + 70, cy + 210);
      ctx.stroke();

      const sg = ctx.createRadialGradient(cx, cy - 200, 8, cx, cy - 200, 42);
      sg.addColorStop(0, '#fef08a'); sg.addColorStop(0.7, '#f59e0b'); sg.addColorStop(1, '#b45309');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy - 200, 38, 0, Math.PI * 2); ctx.fill();

      const bg = ctx.createLinearGradient(cx - 100, cy, cx + 100, cy);
      bg.addColorStop(0, '#ca8a04'); bg.addColorStop(0.4, '#fde047'); bg.addColorStop(0.7, '#eab308'); bg.addColorStop(1, '#854d0e');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.ellipse(cx, cy + 30, 95, 125, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath(); ctx.ellipse(cx - 42, cy + 35, 34, 75, -0.15, 0, Math.PI * 2); ctx.ellipse(cx + 42, cy + 35, 34, 75, 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx, cy - 90); ctx.lineTo(cx, cy + 155); ctx.stroke();
      ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.ellipse(cx, cy - 90, 65, 38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a16207'; ctx.beginPath(); ctx.arc(cx, cy - 120, 34, Math.PI, 0); ctx.fill();
    });

    make('art_egypt_ankh', W, H, (ctx) => {
      shadow(ctx, 80, 24, 190);
      const ag = ctx.createLinearGradient(cx - 60, cy, cx + 60, cy);
      ag.addColorStop(0, '#92400e'); ag.addColorStop(0.5, '#fde047'); ag.addColorStop(1, '#78350f');
      ctx.strokeStyle = ag; ctx.lineWidth = 26; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.ellipse(cx, cy - 90, 48, 70, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 100, cy); ctx.lineTo(cx + 100, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 200); ctx.stroke();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
    });

    // 1.5 МАСКА ТУТАНХАМОНА (ПОЛНОЦЕННЫЙ ЦАРСКИЙ ЛИК И НЕМЕС)
    make('art_egypt_mask', W, H, (ctx) => {
      shadow(ctx, 130, 30, 225);
      // Немес: крылья царского платка
      const nemesBg = ctx.createLinearGradient(cx - 150, cy, cx + 150, cy);
      nemesBg.addColorStop(0, '#ca8a04'); nemesBg.addColorStop(0.5, '#fde047'); nemesBg.addColorStop(1, '#854d0e');
      ctx.fillStyle = nemesBg;

      ctx.beginPath();
      ctx.moveTo(cx - 145, cy - 120);
      ctx.quadraticCurveTo(cx, cy - 180, cx + 145, cy - 120);
      ctx.bezierCurveTo(cx + 160, cy + 50, cx + 110, cy + 190, cx + 80, cy + 210);
      ctx.lineTo(cx - 80, cy + 210);
      ctx.bezierCurveTo(cx - 110, cy + 190, cx - 160, cy + 50, cx - 145, cy - 120);
      ctx.closePath();
      ctx.fill();

      // Лазуритовые полосы немеса
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 14;
      for (let y = cy - 120; y <= cy + 180; y += 28) {
        ctx.beginPath();
        const curveOffset = Math.sin((y - cy) / 100) * 20;
        ctx.moveTo(cx - 130 + curveOffset, y);
        ctx.lineTo(cx + 130 - curveOffset, y);
        ctx.stroke();
      }

      // Лицо из чистого полированного золота
      const faceGrad = ctx.createRadialGradient(cx, cy - 10, 20, cx, cy - 10, 110);
      faceGrad.addColorStop(0, '#fffbeb');
      faceGrad.addColorStop(0.4, '#fde047');
      faceGrad.addColorStop(0.85, '#eab308');
      faceGrad.addColorStop(1, '#a16207');
      ctx.fillStyle = faceGrad;

      ctx.beginPath();
      ctx.moveTo(cx - 75, cy - 90);
      ctx.quadraticCurveTo(cx, cy - 110, cx + 75, cy - 90);
      ctx.bezierCurveTo(cx + 80, cy, cx + 60, cy + 85, cx + 38, cy + 115);
      ctx.quadraticCurveTo(cx, cy + 135, cx - 38, cy + 115);
      ctx.bezierCurveTo(cx - 60, cy + 85, cx - 80, cy, cx - 75, cy - 90);
      ctx.closePath();
      ctx.fill();

      // Фараонская бородка
      const beardGrad = ctx.createLinearGradient(cx - 15, cy + 120, cx + 15, cy + 120);
      beardGrad.addColorStop(0, '#1e3a8a'); beardGrad.addColorStop(0.5, '#2563eb'); beardGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = beardGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 14, cy + 125, 28, 95, 6);
      ctx.fill();
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2.5;
      for (let by = cy + 135; by <= cy + 210; by += 12) {
        ctx.strokeRect(cx - 14, by, 28, 6);
      }

      // Урей (Кобра и коршун) на челе
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(cx, cy - 110, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(cx, cy - 126, 7, 0, Math.PI * 2); ctx.fill();

      // Глаза с лазуритовой подводкой и миндалевидным разрезом
      ctx.fillStyle = '#0f172a';
      // Подводка
      ctx.lineWidth = 5; ctx.strokeStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.ellipse(cx - 32, cy - 20, 22, 11, -0.05, 0, Math.PI * 2);
      ctx.ellipse(cx + 32, cy - 20, 22, 11, 0.05, 0, Math.PI * 2);
      ctx.stroke();

      // Белки
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx - 32, cy - 20, 18, 9, -0.05, 0, Math.PI * 2);
      ctx.ellipse(cx + 32, cy - 20, 18, 9, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Зрачки
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(cx - 32, cy - 20, 7, 0, Math.PI * 2);
      ctx.arc(cx + 32, cy - 20, 7, 0, Math.PI * 2);
      ctx.fill();

      // Царственные брови
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.roundRect(cx - 56, cy - 38, 42, 6, 3);
      ctx.roundRect(cx + 14, cy - 38, 42, 6, 3);
      ctx.fill();
    });

    // --- АНТИЧНОСТЬ ---
    make('art_antique_coin', W, H, (ctx) => {
      shadow(ctx, 110, 25, 170);
      const cg = ctx.createRadialGradient(cx - 40, cy - 40, 20, cx, cy, 140);
      cg.addColorStop(0, '#f8fafc'); cg.addColorStop(0.5, '#cbd5e1'); cg.addColorStop(1, '#64748b');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, 130, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 8; ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.ellipse(cx, cy + 10, 52, 68, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 22, cy - 45, 26, 0, Math.PI * 2); ctx.arc(cx + 22, cy - 45, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.arc(cx - 22, cy - 45, 10, 0, Math.PI * 2); ctx.arc(cx + 22, cy - 45, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d97706'; ctx.font = 'bold 32px serif'; ctx.fillText('ΑΘΕ', cx - 36, cy + 105);
    });

    make('art_antique_amphora', W, H, (ctx) => {
      shadow(ctx, 100, 28, 235);
      const ag = ctx.createLinearGradient(cx - 110, cy, cx + 110, cy);
      ag.addColorStop(0, '#7c2d12'); ag.addColorStop(0.4, '#ea580c'); ag.addColorStop(1, '#431407');
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy - 170); ctx.lineTo(cx + 45, cy - 170);
      ctx.bezierCurveTo(cx + 140, cy - 40, cx + 130, cy + 140, cx + 45, cy + 220);
      ctx.lineTo(cx - 45, cy + 220);
      ctx.bezierCurveTo(cx - 130, cy + 140, cx - 140, cy - 40, cx - 45, cy - 170);
      ctx.fill();
      ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 18; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx - 90, cy - 30, 48, 1.2, 4.8); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 90, cy - 30, 48, -1.6, 2.0); ctx.stroke();
      ctx.fillStyle = '#0f172a'; ctx.fillRect(cx - 95, cy + 10, 190, 42);
      ctx.strokeStyle = '#ea580c'; ctx.lineWidth = 4;
      ctx.strokeRect(cx - 90, cy + 16, 180, 30);
    });

    make('art_antique_harp', W, H, (ctx) => {
      shadow(ctx, 110, 26, 210);
      const hg = ctx.createLinearGradient(cx - 80, cy, cx + 80, cy);
      hg.addColorStop(0, '#b45309'); hg.addColorStop(0.5, '#fde047'); hg.addColorStop(1, '#78350f');
      ctx.strokeStyle = hg; ctx.lineWidth = 22; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 85, cy + 190); ctx.bezierCurveTo(cx - 115, cy, cx - 90, cy - 140, cx - 40, cy - 190);
      ctx.quadraticCurveTo(cx, cy - 160, cx + 40, cy - 190);
      ctx.bezierCurveTo(cx + 90, cy - 140, cx + 115, cy, cx + 85, cy + 190);
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.roundRect(cx - 100, cy + 160, 200, 36, 10); ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; ctx.lineWidth = 2.5;
      for (let x = cx - 55; x <= cx + 55; x += 18) {
        ctx.beginPath(); ctx.moveTo(x, cy - 165); ctx.lineTo(x, cy + 160); ctx.stroke();
      }
    });

    make('art_antique_statue', W, H, (ctx) => {
      shadow(ctx, 115, 28, 225);
      const mg = ctx.createLinearGradient(cx - 100, cy, cx + 100, cy);
      mg.addColorStop(0, '#cbd5e1'); mg.addColorStop(0.4, '#f8fafc'); mg.addColorStop(1, '#94a3b8');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy + 210); ctx.lineTo(cx + 120, cy + 210);
      ctx.bezierCurveTo(cx + 90, cy + 70, cx + 70, cy, cx + 40, cy - 40);
      ctx.lineTo(cx - 40, cy - 40);
      ctx.bezierCurveTo(cx - 70, cy, cx - 90, cy + 70, cx - 120, cy + 210);
      ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy - 95, 62, 78, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#64748b';
      for (let a = 0; a < Math.PI; a += 0.35) {
        ctx.beginPath(); ctx.arc(cx + Math.cos(a + Math.PI) * 58, cy - 120 + Math.sin(a + Math.PI) * 45, 18, 0, Math.PI * 2); ctx.fill();
      }
    });

    make('art_antique_helmet', W, H, (ctx) => {
      shadow(ctx, 110, 28, 205);
      const bg = ctx.createLinearGradient(cx - 100, cy, cx + 100, cy);
      bg.addColorStop(0, '#854d0e'); bg.addColorStop(0.4, '#eab308'); bg.addColorStop(1, '#713f12');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(cx, cy - 40, 95, Math.PI, 0);
      ctx.lineTo(cx + 85, cy + 90); ctx.lineTo(cx + 25, cy + 180); ctx.lineTo(cx + 10, cy + 40);
      ctx.lineTo(cx - 10, cy + 40); ctx.lineTo(cx - 25, cy + 180); ctx.lineTo(cx - 85, cy + 90);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.roundRect(cx - 70, cy - 15, 52, 28, 6); ctx.roundRect(cx + 18, cy - 15, 52, 28, 6); ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.ellipse(cx, cy - 135, 24, 65, 0, 0, Math.PI * 2); ctx.fill();
    });

    // --- ЕВРОПА / СРЕДНЕВЕКОВЬЕ ---
    make('art_europe_shield', W, H, (ctx) => {
      shadow(ctx, 120, 26, 230);
      const sg = ctx.createLinearGradient(cx - 110, cy, cx + 110, cy);
      sg.addColorStop(0, '#991b1b'); sg.addColorStop(0.5, '#dc2626'); sg.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(cx - 105, cy - 180); ctx.lineTo(cx + 105, cy - 180);
      ctx.lineTo(cx + 105, cy + 40); ctx.quadraticCurveTo(cx, cy + 225, cx, cy + 225);
      ctx.quadraticCurveTo(cx - 105, cy + 40, cx - 105, cy + 40);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 14; ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.ellipse(cx, cy - 10, 48, 62, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy - 75, 24, 0, Math.PI * 2); ctx.fill();
    });

    make('art_europe_book', W, H, (ctx) => {
      shadow(ctx, 130, 28, 195);
      ctx.fillStyle = '#451a03';
      ctx.beginPath(); ctx.roundRect(cx - 110, cy - 170, 220, 340, 14); ctx.fill();
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = 10; ctx.stroke();
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(cx - 115, cy - 60, 24, 40);
      ctx.fillRect(cx - 115, cy + 20, 24, 40);
      ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(cx, cy, 32, 0, Math.PI * 2); ctx.fill();
    });

    make('art_europe_sword', W, H, (ctx) => {
      shadow(ctx, 60, 18, 225);
      const kg = ctx.createLinearGradient(cx - 24, 0, cx + 24, 0);
      kg.addColorStop(0, '#64748b'); kg.addColorStop(0.5, '#f8fafc'); kg.addColorStop(1, '#334155');
      ctx.fillStyle = kg;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 210); ctx.lineTo(cx + 24, cy - 170); ctx.lineTo(cx + 18, cy + 120);
      ctx.lineTo(cx - 18, cy + 120); ctx.lineTo(cx - 24, cy - 170); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy - 170); ctx.lineTo(cx, cy + 110); ctx.stroke();
      ctx.fillStyle = '#d4af37'; ctx.beginPath(); ctx.roundRect(cx - 85, cy + 120, 170, 18, 6); ctx.fill();
      ctx.fillStyle = '#451a03'; ctx.fillRect(cx - 10, cy + 138, 20, 58);
      ctx.fillStyle = '#d4af37'; ctx.beginPath(); ctx.arc(cx, cy + 210, 18, 0, Math.PI * 2); ctx.fill();
    });

    make('art_europe_grail', W, H, (ctx) => {
      shadow(ctx, 110, 26, 215);
      const gg = ctx.createLinearGradient(cx - 90, cy, cx + 90, cy);
      gg.addColorStop(0, '#ca8a04'); gg.addColorStop(0.4, '#fde047'); gg.addColorStop(1, '#854d0e');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(cx, cy - 50, 95, 0, Math.PI);
      ctx.lineTo(cx - 95, cy - 100); ctx.lineTo(cx + 95, cy - 100);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(cx - 18, cy + 45, 36, 110);
      ctx.beginPath(); ctx.ellipse(cx, cy + 185, 78, 26, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dc2626';
      for (let x = cx - 70; x <= cx + 70; x += 35) {
        ctx.beginPath(); ctx.arc(x, cy - 75, 8, 0, Math.PI * 2); ctx.fill();
      }
    });

    make('art_europe_crown', W, H, (ctx) => {
      shadow(ctx, 130, 26, 170);
      const cg = ctx.createLinearGradient(cx - 120, cy, cx + 120, cy);
      cg.addColorStop(0, '#ca8a04'); cg.addColorStop(0.5, '#fde047'); cg.addColorStop(1, '#854d0e');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.moveTo(cx - 110, cy + 130); ctx.lineTo(cx + 110, cy + 130);
      ctx.lineTo(cx + 120, cy - 40); ctx.lineTo(cx + 70, cy + 40);
      ctx.lineTo(cx, cy - 70); ctx.lineTo(cx - 70, cy + 40); ctx.lineTo(cx - 120, cy - 40);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy - 70, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(cx - 120, cy - 40, 12, 0, Math.PI * 2); ctx.arc(cx + 120, cy - 40, 12, 0, Math.PI * 2); ctx.fill();
    });

    // --- ЯПОНИЯ ---
    make('art_japan_fan', W, H, (ctx) => {
      shadow(ctx, 130, 26, 190);
      ctx.fillStyle = '#991b1b';
      ctx.beginPath(); ctx.moveTo(cx, cy + 140); ctx.arc(cx, cy + 140, 230, Math.PI * 1.15, Math.PI * 1.85); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(cx, cy + 20, 56, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 4;
      for (let a = Math.PI * 1.18; a <= Math.PI * 1.82; a += 0.14) {
        ctx.beginPath(); ctx.moveTo(cx, cy + 140); ctx.lineTo(cx + Math.cos(a) * 230, cy + 140 + Math.sin(a) * 230); ctx.stroke();
      }
    });

    // 4.2 НЭЦКЭ ДРАКОНА (РЕЗНАЯ ФИГУРКА ИЗ САМШИТА)
    make('art_japan_netsuke', W, H, (ctx) => {
      shadow(ctx, 120, 30, 200);
      const ng = ctx.createRadialGradient(cx - 20, cy - 20, 15, cx, cy, 140);
      ng.addColorStop(0, '#fef08a');
      ng.addColorStop(0.4, '#eab308');
      ng.addColorStop(0.8, '#b45309');
      ng.addColorStop(1, '#78350f');
      ctx.fillStyle = ng;

      // Монолитное свернувшееся туловище дракона
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy - 120);
      ctx.bezierCurveTo(cx + 120, cy - 130, cx + 140, cy + 70, cx + 40, cy + 140);
      ctx.bezierCurveTo(cx - 60, cy + 180, cx - 130, cy + 80, cx - 110, cy - 10);
      ctx.bezierCurveTo(cx - 90, cy - 80, cx - 80, cy - 110, cx - 40, cy - 120);
      ctx.closePath();
      ctx.fill();

      // Внутреннее отверстие химотоси (для шнура нэцкэ)
      ctx.fillStyle = '#451a03';
      ctx.beginPath(); ctx.ellipse(cx - 15, cy + 25, 28, 38, -0.2, 0, Math.PI * 2); ctx.fill();

      // Выразительная голова дракона с рогами
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(cx - 45, cy - 115, 42, 0, Math.PI * 2); ctx.fill();

      // Рога дракона
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy - 145); ctx.quadraticCurveTo(cx - 80, cy - 190, cx - 105, cy - 180);
      ctx.moveTo(cx - 30, cy - 145); ctx.quadraticCurveTo(cx - 35, cy - 195, cx - 50, cy - 205);
      ctx.stroke();

      // Жемчужина мудрости в лапах дракона
      const pearl = ctx.createRadialGradient(cx + 35, cy + 20, 4, cx + 35, cy + 20, 26);
      pearl.addColorStop(0, '#ffffff'); pearl.addColorStop(0.6, '#38bdf8'); pearl.addColorStop(1, '#0369a1');
      ctx.fillStyle = pearl;
      ctx.beginPath(); ctx.arc(cx + 35, cy + 20, 24, 0, Math.PI * 2); ctx.fill();

      // Рельефная чешуя резчика
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2.5;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(cx + 45 - i * 14, cy - 40 + i * 18, 14, 0, Math.PI);
        ctx.stroke();
      }

      // Глаз дракона из черного обсидиана
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(cx - 55, cy - 120, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 57, cy - 122, 2, 0, Math.PI * 2); ctx.fill();
    });

    make('art_japan_tea', W, H, (ctx) => {
      shadow(ctx, 110, 28, 200);
      const tg = ctx.createLinearGradient(cx - 100, cy, cx + 100, cy);
      tg.addColorStop(0, '#1c1917'); tg.addColorStop(0.4, '#44403c'); tg.addColorStop(1, '#0c0a09');
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.moveTo(cx - 105, cy - 70); ctx.lineTo(cx + 105, cy - 70);
      ctx.bezierCurveTo(cx + 95, cy + 110, cx + 65, cy + 175, cx + 55, cy + 175);
      ctx.lineTo(cx - 55, cy + 175);
      ctx.bezierCurveTo(cx - 65, cy + 175, cx - 95, cy + 110, cx - 105, cy - 70);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 70, cy - 70); ctx.lineTo(cx - 20, cy + 10); ctx.lineTo(cx - 40, cy + 90); ctx.lineTo(cx + 10, cy + 175); ctx.stroke();
    });

    // 4.4 МАСКА МЭНПО (БОЕВАЯ САМУРАЙСКАЯ ПОЛУМАСКА)
    make('art_japan_mask', W, H, (ctx) => {
      shadow(ctx, 120, 28, 220);
      const mg = ctx.createLinearGradient(cx - 100, cy, cx + 100, cy);
      mg.addColorStop(0, '#18181b'); mg.addColorStop(0.3, '#7f1d1d'); mg.addColorStop(0.7, '#991b1b'); mg.addColorStop(1, '#09090b');
      ctx.fillStyle = mg;

      // Скульптурные скулы и мощный подбородок Мэнпо
      ctx.beginPath();
      ctx.moveTo(cx - 110, cy - 70);
      ctx.quadraticCurveTo(cx - 60, cy - 40, cx - 35, cy - 45); // Вырез под нос
      ctx.lineTo(cx + 35, cy - 45);
      ctx.quadraticCurveTo(cx + 60, cy - 40, cx + 110, cy - 70);
      ctx.bezierCurveTo(cx + 120, cy + 30, cx + 85, cy + 120, cx + 45, cy + 150);
      ctx.quadraticCurveTo(cx, cy + 170, cx - 45, cy + 150);
      ctx.bezierCurveTo(cx - 85, cy + 120, cx - 120, cy + 30, cx - 110, cy - 70);
      ctx.closePath();
      ctx.fill();

      // Грозный нос-накладка с ноздрями
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.moveTo(cx - 28, cy - 45); ctx.lineTo(cx, cy - 95); ctx.lineTo(cx + 28, cy - 45); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(cx - 12, cy - 50, 4, 0, Math.PI * 2); ctx.arc(cx + 12, cy - 50, 4, 0, Math.PI * 2); ctx.fill();

      // Оскаленная пасть с серебряными зубами
      ctx.fillStyle = '#09090b';
      ctx.beginPath(); ctx.roundRect(cx - 60, cy + 35, 120, 36, 6); ctx.fill();
      ctx.fillStyle = '#f8fafc';
      for (let x = cx - 48; x <= cx + 48; x += 16) {
        ctx.fillRect(x, cy + 38, 12, 14);
        ctx.fillRect(x, cy + 54, 12, 14);
      }

      // Золотые усы самурая
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy + 20); ctx.quadraticCurveTo(cx - 20, cy + 15, cx - 10, cy + 35);
      ctx.moveTo(cx + 80, cy + 20); ctx.quadraticCurveTo(cx + 20, cy + 15, cx + 10, cy + 35);
      ctx.stroke();

      // Защитная пластина горла (Нодава)
      ctx.fillStyle = '#1c1917';
      ctx.beginPath(); ctx.roundRect(cx - 80, cy + 165, 160, 24, 6); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 3; ctx.stroke();
    });

    // 4.5 КАТАНА МАСТЕРА (ПОЛНОЦЕННЫЙ КЛИНОК С ЦУБОЙ И ОПЛЕТКОЙ)
    make('art_japan_katana', W, H, (ctx) => {
      shadow(ctx, 80, 20, 220);

      // Клинок по диагонали верстака
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.35);

      // Стальное лезвие с изгибом сори
      const bladeGrad = ctx.createLinearGradient(-15, -230, 15, 60);
      bladeGrad.addColorStop(0, '#f8fafc');
      bladeGrad.addColorStop(0.3, '#cbd5e1');
      bladeGrad.addColorStop(0.7, '#94a3b8');
      bladeGrad.addColorStop(1, '#475569');
      ctx.fillStyle = bladeGrad;

      ctx.beginPath();
      ctx.moveTo(-6, -230); // Острие киссаки
      ctx.lineTo(8, -210);
      ctx.lineTo(12, 50);
      ctx.lineTo(-8, 50);
      ctx.closePath();
      ctx.fill();

      // Волнистая линия закалки (Хамон)
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-4, -220);
      for (let y = -200; y <= 45; y += 20) {
        ctx.quadraticCurveTo(y % 40 === 0 ? 4 : -1, y - 10, -2, y);
      }
      ctx.stroke();

      // Золотая муфта Хабаки у основания лезвия
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.roundRect(-10, 42, 20, 18, 3); ctx.fill();

      // Фигурная резная гарда Цуба из черненой бронзы
      ctx.fillStyle = '#1c1917';
      ctx.beginPath(); ctx.ellipse(0, 64, 38, 28, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 3; ctx.stroke();

      // Рукоять Цука с шелковой оплеткой Ито
      ctx.fillStyle = '#f8fafc'; // Кожа ската самэ
      ctx.fillRect(-9, 68, 18, 155);

      // Черная ромбовидная оплетка
      ctx.fillStyle = '#09090b';
      for (let hy = 72; hy <= 210; hy += 16) {
        ctx.beginPath();
        ctx.moveTo(0, hy); ctx.lineTo(9, hy + 8); ctx.lineTo(0, hy + 16); ctx.lineTo(-9, hy + 8);
        ctx.closePath(); ctx.fill();
      }

      // Золотое навершие Касира
      ctx.fillStyle = '#d4af37';
      ctx.beginPath(); ctx.roundRect(-10, 222, 20, 12, 4); ctx.fill();

      ctx.restore();
    });

    // --- АЦТЕКИ ---
    make('art_aztec_vessel', W, H, (ctx) => {
      shadow(ctx, 110, 26, 215);
      const vg = ctx.createRadialGradient(cx - 40, cy, 30, cx, cy, 140);
      vg.addColorStop(0, '#f97316'); vg.addColorStop(0.6, '#c2410c'); vg.addColorStop(1, '#7c2d12');
      ctx.fillStyle = vg;
      ctx.beginPath(); ctx.arc(cx, cy + 20, 115, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7c2d12'; ctx.beginPath(); ctx.arc(cx, cy - 80, 52, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#06b6d4'; ctx.beginPath(); ctx.arc(cx - 20, cy - 85, 10, 0, Math.PI * 2); ctx.arc(cx + 20, cy - 85, 10, 0, Math.PI * 2); ctx.fill();
    });

    make('art_aztec_dagger', W, H, (ctx) => {
      shadow(ctx, 70, 18, 225);
      const og = ctx.createLinearGradient(cx - 28, 0, cx + 28, 0);
      og.addColorStop(0, '#09090b'); og.addColorStop(0.5, '#27272a'); og.addColorStop(1, '#09090b');
      ctx.fillStyle = og;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 210); ctx.lineTo(cx + 34, cy + 50); ctx.lineTo(cx - 34, cy + 50); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#eab308';
      ctx.beginPath(); ctx.roundRect(cx - 24, cy + 50, 48, 145, 10); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy + 85, 12, 0, Math.PI * 2); ctx.fill();
    });

    make('art_aztec_idol', W, H, (ctx) => {
      shadow(ctx, 115, 28, 220);
      const ig = ctx.createLinearGradient(cx - 90, cy, cx + 90, cy);
      ig.addColorStop(0, '#064e3b'); ig.addColorStop(0.5, '#059669'); ig.addColorStop(1, '#022c22');
      ctx.fillStyle = ig;
      ctx.beginPath(); ctx.roundRect(cx - 85, cy - 160, 170, 350, 22); ctx.fill();
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(cx - 35, cy - 65, 26, 0, Math.PI * 2); ctx.arc(cx + 35, cy - 65, 26, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(cx - 45, cy + 25, 90, 24);
    });

    make('art_aztec_mask', W, H, (ctx) => {
      shadow(ctx, 115, 28, 205);
      const mg = ctx.createRadialGradient(cx, cy, 30, cx, cy, 140);
      mg.addColorStop(0, '#22d3ee'); mg.addColorStop(0.7, '#0891b2'); mg.addColorStop(1, '#164e63');
      ctx.fillStyle = mg;
      ctx.beginPath(); ctx.ellipse(cx, cy - 10, 105, 135, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(cx - 38, cy - 25, 22, 12, 0, 0, Math.PI * 2); ctx.ellipse(cx + 38, cy - 25, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(cx - 38, cy - 25, 8, 0, Math.PI * 2); ctx.arc(cx + 38, cy - 25, 8, 0, Math.PI * 2); ctx.fill();
    });

    make('art_aztec_calendar', W, H, (ctx) => {
      shadow(ctx, 125, 28, 185);
      const cg = ctx.createRadialGradient(cx - 30, cy - 30, 20, cx, cy, 150);
      cg.addColorStop(0, '#78716c'); cg.addColorStop(0.6, '#44403c'); cg.addColorStop(1, '#1c1917');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, 140, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#a8a29e'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx, cy, 115, 0, Math.PI * 2); ctx.arc(cx, cy, 75, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2); ctx.fill();
    });

    // --- ВИКИНГИ ---
    make('art_viking_horn', W, H, (ctx) => {
      shadow(ctx, 110, 26, 210);
      const hg = ctx.createLinearGradient(cx - 100, cy, cx + 100, cy);
      hg.addColorStop(0, '#fef3c7'); hg.addColorStop(0.5, '#78350f'); hg.addColorStop(1, '#1c1917');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.moveTo(cx - 90, cy - 130);
      ctx.quadraticCurveTo(cx + 140, cy - 60, cx + 110, cy + 180);
      ctx.quadraticCurveTo(cx + 60, cy + 190, cx + 25, cy + 90);
      ctx.quadraticCurveTo(cx - 30, cy + 20, cx - 90, cy - 60);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.moveTo(cx - 90, cy - 130); ctx.lineTo(cx - 90, cy - 60); ctx.stroke();
    });

    make('art_viking_brooch', W, H, (ctx) => {
      shadow(ctx, 115, 26, 175);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 22; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy, 110, 0.4, Math.PI * 2 - 0.4); ctx.stroke();
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.moveTo(cx - 130, cy + 70); ctx.lineTo(cx + 120, cy - 80); ctx.stroke();
    });

    make('art_viking_axe', W, H, (ctx) => {
      shadow(ctx, 90, 22, 225);
      ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.roundRect(cx - 12, cy - 180, 24, 380, 6); ctx.fill();
      const lg = ctx.createLinearGradient(cx, cy - 150, cx + 130, cy - 60);
      lg.addColorStop(0, '#334155'); lg.addColorStop(0.5, '#94a3b8'); lg.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 140);
      ctx.quadraticCurveTo(cx + 110, cy - 165, cx + 135, cy - 50);
      ctx.bezierCurveTo(cx + 110, cy + 25, cx + 35, cy - 40, cx, cy - 60);
      ctx.closePath(); ctx.fill();
    });

    make('art_viking_mjolnir', W, H, (ctx) => {
      shadow(ctx, 120, 26, 205);
      const mg = ctx.createLinearGradient(cx - 100, cy, cx + 100, cy);
      mg.addColorStop(0, '#475569'); mg.addColorStop(0.5, '#cbd5e1'); mg.addColorStop(1, '#1e293b');
      ctx.fillStyle = mg;
      ctx.beginPath(); ctx.roundRect(cx - 110, cy + 50, 220, 85, 16); ctx.fill();
      ctx.fillRect(cx - 18, cy - 160, 36, 220);
      ctx.beginPath(); ctx.arc(cx, cy - 160, 26, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 4;
      ctx.strokeRect(cx - 90, cy + 65, 180, 55);
    });

    // 6.5 ШТЕВЕНЬ ДРАККАРА (МОЩНЫЙ НОС КОРАБЛЯ С ГОЛОВОЙ ДРАКОНА)
    make('art_viking_ship', W, H, (ctx) => {
      shadow(ctx, 120, 26, 225);
      const wood = ctx.createLinearGradient(cx - 120, cy, cx + 120, cy);
      wood.addColorStop(0, '#2b1408');
      wood.addColorStop(0.4, '#5c2d13');
      wood.addColorStop(0.8, '#78350f');
      wood.addColorStop(1, '#1f0d04');
      ctx.fillStyle = wood;

      // Мощный форштевень драккара
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy + 220);
      ctx.bezierCurveTo(cx - 140, cy + 60, cx - 120, cy - 60, cx - 20, cy - 130);
      // Верхняя пасть дракона
      ctx.lineTo(cx + 80, cy - 190);
      ctx.lineTo(cx + 100, cy - 140);
      ctx.lineTo(cx + 40, cy - 120); // Пасть
      // Нижняя челюсть
      ctx.lineTo(cx + 85, cy - 90);
      ctx.lineTo(cx + 35, cy - 60);
      // Шея и переход в киль
      ctx.bezierCurveTo(cx + 10, cy + 40, cx + 45, cy + 120, cx + 55, cy + 220);
      ctx.closePath();
      ctx.fill();

      // Острые зубы в пасти дракона
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(cx + 45, cy - 135); ctx.lineTo(cx + 60, cy - 130); ctx.lineTo(cx + 52, cy - 120);
      ctx.moveTo(cx + 55, cy - 85); ctx.lineTo(cx + 70, cy - 80); ctx.lineTo(cx + 60, cy - 70);
      ctx.fill();

      // Свирепый глаз чудовища
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.arc(cx, cy - 135, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(cx, cy - 135, 4, 0, Math.PI * 2); ctx.fill();

      // Резная руническая вязь вдоль борта
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy + 180);
      ctx.bezierCurveTo(cx - 85, cy + 60, cx - 70, cy - 20, cx - 10, cy - 80);
      ctx.stroke();

      // Стыки досок обшивки (клинкерная кладка)
      ctx.strokeStyle = '#180a03'; ctx.lineWidth = 4;
      for (let y = cy - 20; y <= cy + 180; y += 40) {
        ctx.beginPath();
        ctx.moveTo(cx - 85, y); ctx.lineTo(cx + 25, y + 25);
        ctx.stroke();
      }
    });

    // --- РЕНЕССАНС ---
    make('art_renaissance_compass', W, H, (ctx) => {
      shadow(ctx, 120, 26, 185);
      ctx.fillStyle = '#451a03'; ctx.beginPath(); ctx.roundRect(cx - 115, cy - 115, 230, 230, 16); ctx.fill();
      const lg = ctx.createRadialGradient(cx, cy, 20, cx, cy, 85);
      lg.addColorStop(0, '#fef08a'); lg.addColorStop(0.7, '#eab308'); lg.addColorStop(1, '#854d0e');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(cx, cy, 88, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 14, cy); ctx.lineTo(cx, cy - 72); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 14, cy); ctx.lineTo(cx, cy + 72); ctx.closePath(); ctx.fill();
    });

    make('art_renaissance_goblet', W, H, (ctx) => {
      shadow(ctx, 100, 24, 215);
      const gg = ctx.createLinearGradient(cx - 80, cy, cx + 80, cy);
      gg.addColorStop(0, 'rgba(147, 197, 253, 0.55)'); gg.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)'); gg.addColorStop(1, 'rgba(59, 130, 246, 0.55)');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.moveTo(cx - 75, cy - 120); ctx.lineTo(cx + 75, cy - 120);
      ctx.bezierCurveTo(cx + 65, cy + 20, cx + 18, cy + 50, cx + 12, cy + 60);
      ctx.lineTo(cx - 12, cy + 60);
      ctx.bezierCurveTo(cx - 18, cy + 50, cx - 65, cy + 20, cx - 75, cy - 120);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#eab308';
      ctx.fillRect(cx - 8, cy + 60, 16, 95);
      ctx.beginPath(); ctx.ellipse(cx, cy + 170, 68, 22, 0, 0, Math.PI * 2); ctx.fill();
    });

    make('art_renaissance_astrolabe', W, H, (ctx) => {
      shadow(ctx, 120, 26, 185);
      const ag = ctx.createRadialGradient(cx, cy, 20, cx, cy, 130);
      ag.addColorStop(0, '#fef08a'); ag.addColorStop(0.6, '#d97706'); ag.addColorStop(1, '#78350f');
      ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, cy, 125, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#b45309'; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(cx, cy - 150, 32, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, 95, 0, Math.PI * 2); ctx.arc(cx, cy, 55, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 110, cy); ctx.lineTo(cx + 110, cy); ctx.moveTo(cx, cy - 110); ctx.lineTo(cx, cy + 110); ctx.stroke();
    });

    make('art_renaissance_clock', W, H, (ctx) => {
      shadow(ctx, 105, 24, 205);
      const og = ctx.createRadialGradient(cx - 30, cy - 30, 20, cx, cy, 130);
      og.addColorStop(0, '#fef08a'); og.addColorStop(0.6, '#eab308'); og.addColorStop(1, '#854d0e');
      ctx.fillStyle = og; ctx.beginPath(); ctx.ellipse(cx, cy, 95, 135, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(cx, cy, 58, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 58, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#020617'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 38); ctx.moveTo(cx, cy); ctx.lineTo(cx + 26, cy); ctx.stroke();
    });

    make('art_renaissance_mona', W, H, (ctx) => {
      shadow(ctx, 120, 26, 215);
      ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.roundRect(cx - 105, cy - 160, 210, 320, 10); ctx.fill();
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 10; ctx.stroke();
      ctx.fillStyle = '#064e3b'; ctx.fillRect(cx - 85, cy - 140, 170, 280);
      ctx.fillStyle = '#1c1917'; ctx.beginPath(); ctx.ellipse(cx, cy + 40, 68, 90, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.ellipse(cx, cy - 40, 38, 48, 0, 0, Math.PI * 2); ctx.fill();
    });
  }
}
