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
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      fn(ctx, w, h);
      if (this.textures.exists(key)) this.textures.remove(key);
      this.textures.addCanvas(key, c);
    };

    // ЗВЕЗДЫ
    const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx, y = cy;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius; y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y); rot += step;
        x = cx + Math.cos(rot) * innerRadius; y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y); rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    };

    make('icon_star', 64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 28, 4, 32, 32, 28);
      g.addColorStop(0, '#fffbeb'); g.addColorStop(0.3, '#fde047');
      g.addColorStop(0.7, '#eab308'); g.addColorStop(1, '#b45309');
      ctx.fillStyle = g;
      drawStar(ctx, 32, 32, 5, 26, 12);
      ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2; ctx.stroke();
    });

    make('icon_star_empty', 64, 64, (ctx) => {
      ctx.fillStyle = '#1e293b';
      drawStar(ctx, 32, 32, 5, 24, 11);
      ctx.fill();
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.stroke();
    });

    // ИНСТРУМЕНТЫ
    make('slot_scraper', 56, 56, (ctx) => {
      ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.roundRect(25, 26, 6, 22, 2); ctx.fill();
      const metal = ctx.createLinearGradient(10, 26, 46, 8);
      metal.addColorStop(0, '#b45309'); metal.addColorStop(0.3, '#fde047');
      metal.addColorStop(0.7, '#facc15'); metal.addColorStop(1, '#78350f');
      ctx.fillStyle = metal;
      ctx.beginPath(); ctx.moveTo(10, 26); ctx.lineTo(46, 26); ctx.lineTo(28, 8); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.2; ctx.stroke();
    });

    make('slot_brush_soft', 56, 56, (ctx) => {
      ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.roundRect(26, 28, 4, 20, 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(23, 23, 10, 5);
      const hair = ctx.createLinearGradient(18, 6, 38, 23);
      hair.addColorStop(0, '#d97706'); hair.addColorStop(0.4, '#f59e0b'); hair.addColorStop(1, '#78350f');
      ctx.fillStyle = hair;
      ctx.beginPath(); ctx.moveTo(23, 23); ctx.quadraticCurveTo(16, 10, 28, 6); ctx.quadraticCurveTo(40, 10, 33, 23); ctx.closePath(); ctx.fill();
    });

    make('slot_solvent', 56, 56, (ctx) => {
      const bot = ctx.createLinearGradient(18, 0, 38, 0);
      bot.addColorStop(0, '#047857'); bot.addColorStop(0.5, '#10b981'); bot.addColorStop(1, '#064e3b');
      ctx.fillStyle = bot; ctx.beginPath(); ctx.roundRect(18, 20, 20, 30, 4); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(24, 14, 8, 6);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(19, 10, 18, 4); ctx.fillRect(16, 11, 4, 2);
    });

    make('slot_glue', 56, 56, (ctx) => {
      const tube = ctx.createLinearGradient(18, 0, 38, 0);
      tube.addColorStop(0, '#c2410c'); tube.addColorStop(0.5, '#fb923c'); tube.addColorStop(1, '#9a3412');
      ctx.fillStyle = tube;
      ctx.beginPath(); ctx.moveTo(19, 48); ctx.lineTo(37, 48); ctx.lineTo(32, 18); ctx.lineTo(24, 18); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fde047'; ctx.fillRect(26, 8, 4, 10);
    });

    make('slot_polish', 56, 56, (ctx) => {
      const cloth = ctx.createRadialGradient(28, 28, 4, 28, 28, 18);
      cloth.addColorStop(0, '#f472b6'); cloth.addColorStop(0.7, '#c026d3'); cloth.addColorStop(1, '#701a75');
      ctx.fillStyle = cloth; ctx.beginPath(); ctx.roundRect(14, 14, 28, 28, 7); ctx.fill();
      ctx.strokeStyle = '#fbcfe8'; ctx.lineWidth = 1; ctx.stroke();
    });

    // МАСКИ СТИРАНИЯ
    const makeMask = (key, r) => {
      make(key, r * 2, r * 2, (ctx) => {
        const rad = ctx.createRadialGradient(r, r, 0, r, r, r);
        rad.addColorStop(0, 'rgba(0,0,0,1)'); rad.addColorStop(0.75, 'rgba(0,0,0,0.9)'); rad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rad; ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI * 2); ctx.fill();
      });
    };
    makeMask('mask_scraper', 32);
    makeMask('mask_brush', 38);
    makeMask('mask_solvent', 34);
    makeMask('mask_glue', 28);
    makeMask('mask_polish', 40);

    // СЛУЖЕБНЫЕ АССЕТЫ
    make('icon_home', 40, 40, (ctx) => {
      ctx.fillStyle = '#cbd5e1'; ctx.beginPath();
      ctx.moveTo(20, 8); ctx.lineTo(8, 20); ctx.lineTo(13, 20); ctx.lineTo(13, 32); ctx.lineTo(27, 32); ctx.lineTo(27, 20); ctx.lineTo(32, 20);
      ctx.closePath(); ctx.fill();
    });

    make('particle_dust', 6, 6, (ctx) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(3, 3, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    make('shard_amphora', 48, 48, (ctx) => {
      ctx.fillStyle = '#f59e0b'; ctx.beginPath();
      ctx.moveTo(10, 12); ctx.lineTo(38, 8); ctx.lineTo(32, 38); ctx.lineTo(12, 30); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5; ctx.stroke();
    });

    // ВСЕ 35 КРУПНЫХ МОДЕЛЕЙ (320 x 400)
    const W = 320, H = 400;

    // --- ЕГИПЕТ ---
    make('art_egypt_scarab', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 32, cy - 25); ctx.lineTo(cx - 75, cy - 60); ctx.lineTo(cx - 90, cy - 85);
      ctx.moveTo(cx + 32, cy - 25); ctx.lineTo(cx + 75, cy - 60); ctx.lineTo(cx + 90, cy - 85);
      ctx.moveTo(cx - 42, cy + 16); ctx.lineTo(cx - 88, cy + 24); ctx.lineTo(cx - 95, cy + 50);
      ctx.moveTo(cx + 42, cy + 16); ctx.lineTo(cx + 88, cy + 24); ctx.lineTo(cx + 95, cy + 50);
      ctx.moveTo(cx - 36, cy + 55); ctx.lineTo(cx - 75, cy + 90); ctx.lineTo(cx - 82, cy + 120);
      ctx.moveTo(cx + 36, cy + 55); ctx.lineTo(cx + 75, cy + 90); ctx.lineTo(cx + 82, cy + 120);
      ctx.stroke();

      const sg = ctx.createRadialGradient(cx - 20, cy - 10, 15, cx, cy + 20, 95);
      sg.addColorStop(0, '#fef08a'); sg.addColorStop(0.3, '#facc15'); sg.addColorStop(0.7, '#ca8a04'); sg.addColorStop(1, '#713f12');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(cx, cy + 20, 64, 82, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(cx, cy - 30); ctx.lineTo(cx, cy + 102); ctx.stroke();
      ctx.fillStyle = '#ca8a04'; ctx.beginPath(); ctx.ellipse(cx, cy - 38, 46, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a16207'; ctx.beginPath(); ctx.arc(cx, cy - 58, 24, Math.PI, 0); ctx.closePath(); ctx.fill();

      const gg = ctx.createRadialGradient(cx - 6, cy + 10, 4, cx, cy + 14, 28);
      gg.addColorStop(0, '#93c5fd'); gg.addColorStop(0.3, '#3b82f6'); gg.addColorStop(0.8, '#1d4ed8'); gg.addColorStop(1, '#0f172a');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(cx, cy + 14, 24, 32, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2.5; ctx.stroke();
    });

    make('art_egypt_mask', W, H, (ctx) => {
      const cx = 160, cy = 195;
      ctx.save(); ctx.beginPath();
      ctx.moveTo(cx - 40, cy - 110); ctx.quadraticCurveTo(cx, cy - 126, cx + 40, cy - 110);
      ctx.lineTo(cx + 92, cy - 32); ctx.lineTo(cx + 74, cy + 56); ctx.lineTo(cx + 30, cy + 44);
      ctx.lineTo(cx + 20, cy + 115); ctx.lineTo(cx - 20, cy + 115); ctx.lineTo(cx - 30, cy + 44);
      ctx.lineTo(cx - 74, cy + 56); ctx.lineTo(cx - 92, cy - 32); ctx.closePath(); ctx.clip();

      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(cx - 110, cy - 135, 220, 270);
      const gs = ctx.createLinearGradient(cx - 80, 0, cx + 80, 0);
      gs.addColorStop(0, '#ca8a04'); gs.addColorStop(0.5, '#fef08a'); gs.addColorStop(1, '#a16207');
      ctx.fillStyle = gs;
      for (let y = cy - 135; y < cy + 135; y += 18) ctx.fillRect(cx - 110, y, 220, 9);
      ctx.restore();

      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(cx - 40, cy - 110); ctx.quadraticCurveTo(cx, cy - 126, cx + 40, cy - 110);
      ctx.lineTo(cx + 92, cy - 32); ctx.lineTo(cx + 74, cy + 56); ctx.lineTo(cx + 30, cy + 44);
      ctx.lineTo(cx + 20, cy + 115); ctx.lineTo(cx - 20, cy + 115); ctx.lineTo(cx - 30, cy + 44);
      ctx.lineTo(cx - 74, cy + 56); ctx.lineTo(cx - 92, cy - 32); ctx.closePath(); ctx.stroke();

      const fg = ctx.createRadialGradient(cx - 6, cy - 16, 6, cx, cy - 8, 42);
      fg.addColorStop(0, '#fef08a'); fg.addColorStop(0.4, '#eab308'); fg.addColorStop(0.85, '#ca8a04'); fg.addColorStop(1, '#854d0e');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(cx, cy - 10, 38, 48, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.ellipse(cx - 18, cy - 15, 9, 5, 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 18, cy - 15, 9, 5, -0.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 18, cy - 15, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 18, cy - 15, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#991b1b'; ctx.beginPath(); ctx.ellipse(cx, cy + 14, 14, 5.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(cx, cy - 85, 7, 0, Math.PI * 2); ctx.fill();
    });

    make('art_egypt_ankh', W, H, (ctx) => {
      const cx = 160, cy = 195;
      const bg = ctx.createLinearGradient(cx - 50, cy - 65, cx + 50, cy + 65);
      bg.addColorStop(0, '#78350f'); bg.addColorStop(0.35, '#f59e0b'); bg.addColorStop(0.65, '#fef08a'); bg.addColorStop(1, '#92400e');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(cx - 14, cy - 25, 28, 160, 5); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx - 60, cy - 16, 120, 24, 5); ctx.fill();
      ctx.lineWidth = 22; ctx.strokeStyle = bg;
      ctx.beginPath(); ctx.ellipse(cx, cy - 68, 30, 46, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy - 4, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2.5; ctx.stroke();
    });

    make('art_egypt_bastet', W, H, (ctx) => {
      const cx = 160, cy = 200;
      const cg = ctx.createRadialGradient(cx - 10, cy + 16, 16, cx, cy + 40, 100);
      cg.addColorStop(0, '#374151'); cg.addColorStop(0.4, '#1f2937'); cg.addColorStop(1, '#090d16');
      ctx.fillStyle = cg; ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 24); ctx.bezierCurveTo(cx - 56, cy + 24, cx - 50, cy + 105, cx - 40, cy + 135);
      ctx.lineTo(cx + 40, cy + 135); ctx.bezierCurveTo(cx + 50, cy + 105, cx + 56, cy + 24, cx + 24, cy - 24); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy - 48, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.ellipse(cx - 11, cy - 48, 5.5, 3, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 11, cy - 48, 5.5, 3, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.arc(cx, cy - 24, 24, 0.2, Math.PI - 0.2); ctx.stroke();
    });

    make('art_egypt_canopic', W, H, (ctx) => {
      const cx = 160, cy = 200;
      const ag = ctx.createLinearGradient(cx - 60, 0, cx + 60, 0);
      ag.addColorStop(0, '#b45309'); ag.addColorStop(0.3, '#fef3c7'); ag.addColorStop(0.7, '#fffbeb'); ag.addColorStop(1, '#92400e');
      ctx.fillStyle = ag; ctx.beginPath();
      ctx.moveTo(cx - 36, cy - 20); ctx.bezierCurveTo(cx - 70, cy + 30, cx - 60, cy + 110, cx - 40, cy + 138);
      ctx.lineTo(cx + 40, cy + 138); ctx.bezierCurveTo(cx + 60, cy + 110, cx + 70, cy + 30, cx + 36, cy - 20); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy - 44, 32, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ca8a04'; ctx.beginPath(); ctx.moveTo(cx - 7, cy - 40); ctx.lineTo(cx + 7, cy - 40); ctx.lineTo(cx, cy - 26); ctx.closePath(); ctx.fill();
    });

    // --- АНТИЧНОСТЬ ---
    make('art_antique_amphora', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#c2410c'; ctx.beginPath();
      ctx.moveTo(cx - 28, cy - 70); ctx.bezierCurveTo(cx - 70, cy - 14, cx - 62, cy + 80, cx - 28, cy + 120);
      ctx.lineTo(cx + 28, cy + 120); ctx.bezierCurveTo(cx + 62, cy + 80, cx + 70, cy - 14, cx + 28, cy - 70); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx - 42, cy - 14, 25, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(cx + 42, cy - 14, 25, Math.PI * 1.5, Math.PI * 0.5); ctx.stroke();
    });

    make('art_antique_helmet', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(cx, cy - 14, 55, Math.PI, 0);
      ctx.lineTo(cx + 52, cy + 52); ctx.lineTo(cx + 20, cy + 68); ctx.lineTo(cx + 8, cy + 22);
      ctx.lineTo(cx - 8, cy + 22); ctx.lineTo(cx - 20, cy + 68); ctx.lineTo(cx - 52, cy + 52); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.fillRect(cx - 8, cy - 82, 16, 62);
    });

    make('art_antique_coin', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(cx, cy, 75, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 6; ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.arc(cx - 18, cy - 10, 16, 0, Math.PI * 2); ctx.arc(cx + 18, cy - 10, 16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 8, cy + 10); ctx.lineTo(cx + 8, cy + 10); ctx.lineTo(cx, cy + 28); ctx.closePath(); ctx.fill();
    });

    make('art_antique_harp', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 14; ctx.beginPath();
      ctx.moveTo(cx - 45, cy + 90); ctx.lineTo(cx - 55, cy - 50); ctx.lineTo(cx + 55, cy - 50); ctx.lineTo(cx + 45, cy + 90); ctx.stroke();
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
      for (let x = cx - 30; x <= cx + 30; x += 15) {
        ctx.beginPath(); ctx.moveTo(x, cy - 45); ctx.lineTo(x, cy + 85); ctx.stroke();
      }
    });

    make('art_antique_statue', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#e2e8f0'; ctx.beginPath();
      ctx.ellipse(cx, cy - 30, 45, 55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 28, cy + 20, 56, 50);
      ctx.fillRect(cx - 55, cy + 65, 110, 30);
    });

    // --- ЕВРОПА ---
    make('art_europe_grail', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#e2b35b'; ctx.beginPath(); ctx.arc(cx, cy - 20, 48, 0, Math.PI);
      ctx.lineTo(cx + 8, cy + 60); ctx.lineTo(cx + 36, cy + 98); ctx.lineTo(cx - 36, cy + 98); ctx.lineTo(cx - 8, cy + 60); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 3.5; ctx.stroke();
    });

    make('art_europe_sword', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx - 8, cy - 110, 16, 210);
      ctx.beginPath(); ctx.moveTo(cx - 8, cy - 110); ctx.lineTo(cx + 8, cy - 110); ctx.lineTo(cx, cy - 135); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d97706'; ctx.fillRect(cx - 36, cy + 95, 72, 12);
      ctx.fillStyle = '#78350f'; ctx.fillRect(cx - 6, cy + 107, 12, 35);
    });

    make('art_europe_crown', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#facc15'; ctx.beginPath();
      ctx.moveTo(cx - 65, cy + 50); ctx.lineTo(cx + 65, cy + 50); ctx.lineTo(cx + 70, cy - 25);
      ctx.lineTo(cx + 35, cy + 10); ctx.lineTo(cx, cy - 45); ctx.lineTo(cx - 35, cy + 10);
      ctx.lineTo(cx - 70, cy - 25); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy - 15, 8, 0, Math.PI * 2); ctx.fill();
    });

    make('art_europe_shield', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#1e3a8a'; ctx.beginPath();
      ctx.moveTo(cx - 60, cy - 80); ctx.lineTo(cx + 60, cy - 80); ctx.lineTo(cx + 55, cy + 20);
      ctx.lineTo(cx, cy + 90); ctx.lineTo(cx - 55, cy + 20); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 6; ctx.stroke();
    });

    make('art_europe_book', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.roundRect(cx - 55, cy - 75, 110, 150, 6); ctx.fill();
      ctx.fillStyle = '#fde047'; ctx.fillRect(cx - 10, cy - 20, 20, 40);
    });

    // --- ЯПОНИЯ ---
    make('art_japan_mask', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#991b1b'; ctx.beginPath();
      ctx.moveTo(cx - 52, cy - 28); ctx.lineTo(cx + 52, cy - 28); ctx.lineTo(cx + 38, cy + 66);
      ctx.lineTo(cx, cy + 90); ctx.lineTo(cx - 38, cy + 66); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.fillRect(cx - 28, cy + 14, 56, 8);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 20, cy + 30, 40, 8);
    });

    make('art_japan_katana', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 10; ctx.beginPath();
      ctx.arc(cx - 60, cy, 140, -0.4, 0.4); ctx.stroke();
      ctx.fillStyle = '#ca8a04'; ctx.beginPath(); ctx.ellipse(cx + 35, cy + 50, 14, 18, 0.4, 0, Math.PI * 2); ctx.fill();
    });

    make('art_japan_fan', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(cx, cy + 40, 95, Math.PI * 1.15, Math.PI * 1.85);
      ctx.lineTo(cx, cy + 40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(cx, cy - 15, 24, 0, Math.PI * 2); ctx.fill();
    });

    make('art_japan_netsuke', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.roundRect(cx - 35, cy - 45, 70, 90, 16); ctx.fill();
      ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.arc(cx, cy - 15, 14, 0, Math.PI * 2); ctx.fill();
    });

    make('art_japan_tea', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#1e1b4b'; ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI); ctx.fill();
      ctx.strokeStyle = '#4338ca'; ctx.lineWidth = 4; ctx.stroke();
    });

    // --- АЦТЕКИ ---
    make('art_aztec_idol', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#065f46'; ctx.beginPath(); ctx.roundRect(cx - 46, cy - 68, 92, 136, 12); ctx.fill();
      ctx.fillStyle = '#34d399'; ctx.fillRect(cx - 30, cy - 38, 22, 16); ctx.fillRect(cx + 8, cy - 38, 22, 16);
      ctx.fillRect(cx - 24, cy + 12, 48, 18);
    });

    make('art_aztec_mask', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#0891b2'; ctx.beginPath(); ctx.ellipse(cx, cy, 55, 68, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(cx - 20, cy - 12, 12, 7, 0, 0, Math.PI * 2); ctx.ellipse(cx + 20, cy - 12, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ef4444'; ctx.fillRect(cx - 15, cy + 24, 30, 8);
    });

    make('art_aztec_calendar', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#78716c'; ctx.beginPath(); ctx.arc(cx, cy, 75, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fill();
    });

    make('art_aztec_dagger', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.moveTo(cx, cy - 110); ctx.lineTo(cx + 22, cy + 40); ctx.lineTo(cx - 22, cy + 40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ca8a04'; ctx.fillRect(cx - 18, cy + 40, 36, 45);
    });

    make('art_aztec_vessel', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#ea580c'; ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fde047'; ctx.fillRect(cx - 35, cy - 10, 70, 20);
    });

    // --- ВИКИНГИ ---
    make('art_viking_axe', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#78350f'; ctx.fillRect(cx - 8, cy - 75, 16, 175);
      ctx.fillStyle = '#64748b'; ctx.beginPath();
      ctx.moveTo(cx + 7, cy - 60); ctx.quadraticCurveTo(cx + 68, cy - 68, cx + 75, cy - 14);
      ctx.quadraticCurveTo(cx + 52, cy + 14, cx + 7, cy); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5; ctx.stroke();
    });

    make('art_viking_brooch', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(cx, cy, 55, 0.4, Math.PI * 2 - 0.4); ctx.stroke();
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(cx - 8, cy - 75, 16, 150);
    });

    make('art_viking_horn', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(cx - 40, cy - 60); ctx.quadraticCurveTo(cx + 65, cy, cx - 25, cy + 85);
      ctx.quadraticCurveTo(cx + 25, cy + 10, cx - 40, cy - 60); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 6; ctx.stroke();
    });

    make('art_viking_mjolnir', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#64748b'; ctx.fillRect(cx - 10, cy - 70, 20, 85);
      ctx.beginPath(); ctx.roundRect(cx - 50, cy + 10, 100, 50, 8); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.stroke();
    });

    make('art_viking_ship', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#78350f'; ctx.beginPath();
      ctx.moveTo(cx - 40, cy + 80); ctx.quadraticCurveTo(cx - 20, cy - 30, cx + 45, cy - 60);
      ctx.lineTo(cx + 45, cy - 40); ctx.quadraticCurveTo(cx, cy - 10, cx - 10, cy + 80); ctx.closePath(); ctx.fill();
    });

    // --- РЕНЕССАНС ---
    make('art_renaissance_astrolabe', W, H, (ctx) => {
      const cx = 160, cy = 200;
      const bGrad = ctx.createRadialGradient(cx - 10, cy - 10, 8, cx, cy, 70);
      bGrad.addColorStop(0, '#fef08a'); bGrad.addColorStop(0.5, '#eab308'); bGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = bGrad; ctx.beginPath(); ctx.arc(cx, cy, 65, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - 60, cy); ctx.lineTo(cx + 60, cy); ctx.moveTo(cx, cy - 60); ctx.lineTo(cx, cy + 60); ctx.stroke();
    });

    make('art_renaissance_mona', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#ca8a04'; ctx.beginPath(); ctx.roundRect(cx - 55, cy - 75, 110, 150, 4); ctx.fill();
      ctx.fillStyle = '#064e3b'; ctx.fillRect(cx - 45, cy - 65, 90, 130);
      ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(cx, cy - 20, 24, 0, Math.PI * 2); ctx.fill();
    });

    make('art_renaissance_clock', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.ellipse(cx, cy, 48, 65, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, 32, 0, Math.PI * 2); ctx.fill();
    });

    make('art_renaissance_compass', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.roundRect(cx - 55, cy - 55, 110, 110, 8); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 35); ctx.lineTo(cx - 6, cy); ctx.closePath(); ctx.fill();
    });

    make('art_renaissance_goblet', W, H, (ctx) => {
      const cx = 160, cy = 200;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.7)'; ctx.beginPath();
      ctx.moveTo(cx - 35, cy - 60); ctx.lineTo(cx + 35, cy - 60); ctx.lineTo(cx + 15, cy + 20); ctx.lineTo(cx - 15, cy + 20); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 3; ctx.stroke();
    });
  }
}
