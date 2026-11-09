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

    // 1. ЗОЛОТЫЕ ЗВЕЗДЫ ДЛЯ ЭКРАНА ПОБЕДЫ (Устраняют зеленые квадраты)
    const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
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
      const g = ctx.createRadialGradient(32, 28, 4, 32, 32, 28);
      g.addColorStop(0, '#fffbeb');
      g.addColorStop(0.3, '#fde047');
      g.addColorStop(0.7, '#eab308');
      g.addColorStop(1, '#b45309');
      ctx.fillStyle = g;
      drawStar(ctx, 32, 32, 5, 26, 12);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    make('icon_star_empty', 64, 64, (ctx) => {
      ctx.fillStyle = '#1e293b';
      drawStar(ctx, 32, 32, 5, 24, 11);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 2. ИКОНКИ ИНСТРУМЕНТОВ
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

    // 3. МАСКИ СТИРАНИЯ
    const makeMask = (key, r) => {
      make(key, r * 2, r * 2, (ctx) => {
        const rad = ctx.createRadialGradient(r, r, 0, r, r, r);
        rad.addColorStop(0, 'rgba(0,0,0,1)');
        rad.addColorStop(0.75, 'rgba(0,0,0,0.9)');
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

    // 4. ВСЕ АРТЕФАКТЫ (СТРОГО 240x300, ЦЕНТР 120, 150)
    const W = 240, H = 300;

    // --- ЕГИПЕТ: СКАРАБЕЙ ---
    make('art_egypt_scarab', W, H, (ctx) => {
      const cx = 120, cy = 150;
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 20); ctx.lineTo(cx - 55, cy - 45); ctx.lineTo(cx - 65, cy - 65);
      ctx.moveTo(cx + 24, cy - 20); ctx.lineTo(cx + 55, cy - 45); ctx.lineTo(cx + 65, cy - 65);
      ctx.moveTo(cx - 32, cy + 12); ctx.lineTo(cx - 65, cy + 18); ctx.lineTo(cx - 70, cy + 38);
      ctx.moveTo(cx + 32, cy + 12); ctx.lineTo(cx + 65, cy + 18); ctx.lineTo(cx + 70, cy + 38);
      ctx.moveTo(cx - 28, cy + 42); ctx.lineTo(cx - 56, cy + 68); ctx.lineTo(cx - 62, cy + 92);
      ctx.moveTo(cx + 28, cy + 42); ctx.lineTo(cx + 56, cy + 68); ctx.lineTo(cx + 62, cy + 92);
      ctx.stroke();

      const shellGrad = ctx.createRadialGradient(cx - 15, cy - 5, 10, cx, cy + 15, 70);
      shellGrad.addColorStop(0, '#fef08a');
      shellGrad.addColorStop(0.3, '#facc15');
      shellGrad.addColorStop(0.7, '#ca8a04');
      shellGrad.addColorStop(1, '#713f12');
      ctx.fillStyle = shellGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy + 15, 48, 62, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2; ctx.stroke();

      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy - 22); ctx.lineTo(cx, cy + 76); ctx.stroke();

      ctx.fillStyle = '#ca8a04';
      ctx.beginPath(); ctx.ellipse(cx, cy - 28, 34, 18, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#a16207';
      ctx.beginPath(); ctx.arc(cx, cy - 44, 18, Math.PI, 0); ctx.closePath(); ctx.fill();

      const gemGrad = ctx.createRadialGradient(cx - 4, cy + 6, 2, cx, cy + 10, 20);
      gemGrad.addColorStop(0, '#93c5fd');
      gemGrad.addColorStop(0.3, '#3b82f6');
      gemGrad.addColorStop(0.8, '#1d4ed8');
      gemGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = gemGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy + 10, 18, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2; ctx.stroke();
    });

    // --- ЕГИПЕТ: МАСКА ТУТАНХАМОНА ---
    make('art_egypt_mask', W, H, (ctx) => {
      const cx = 120, cy = 145;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 80); ctx.quadraticCurveTo(cx, cy - 92, cx + 30, cy - 80);
      ctx.lineTo(cx + 68, cy - 24); ctx.lineTo(cx + 54, cy + 42); ctx.lineTo(cx + 22, cy + 32);
      ctx.lineTo(cx + 15, cy + 85); ctx.lineTo(cx - 15, cy + 85); ctx.lineTo(cx - 22, cy + 32);
      ctx.lineTo(cx - 54, cy + 42); ctx.lineTo(cx - 68, cy - 24);
      ctx.closePath(); ctx.clip();

      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(cx - 80, cy - 100, 160, 200);
      const goldStripe = ctx.createLinearGradient(cx - 60, 0, cx + 60, 0);
      goldStripe.addColorStop(0, '#ca8a04'); goldStripe.addColorStop(0.5, '#fef08a'); goldStripe.addColorStop(1, '#a16207');
      ctx.fillStyle = goldStripe;
      for (let y = cy - 100; y < cy + 100; y += 14) ctx.fillRect(cx - 80, y, 160, 7);
      ctx.restore();

      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 80); ctx.quadraticCurveTo(cx, cy - 92, cx + 30, cy - 80);
      ctx.lineTo(cx + 68, cy - 24); ctx.lineTo(cx + 54, cy + 42); ctx.lineTo(cx + 22, cy + 32);
      ctx.lineTo(cx + 15, cy + 85); ctx.lineTo(cx - 15, cy + 85); ctx.lineTo(cx - 22, cy + 32);
      ctx.lineTo(cx - 54, cy + 42); ctx.lineTo(cx - 68, cy - 24);
      ctx.closePath(); ctx.stroke();

      const faceGrad = ctx.createRadialGradient(cx - 5, cy - 12, 5, cx, cy - 6, 32);
      faceGrad.addColorStop(0, '#fef08a');
      faceGrad.addColorStop(0.4, '#eab308');
      faceGrad.addColorStop(0.85, '#ca8a04');
      faceGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = faceGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy - 8, 28, 36, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#854d0e'; ctx.lineWidth = 1.2; ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.ellipse(cx - 13, cy - 11, 7, 3.5, 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 13, cy - 11, 7, 3.5, -0.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 13, cy - 11, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 13, cy - 11, 2, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#991b1b';
      ctx.beginPath(); ctx.ellipse(cx, cy + 10, 10, 4, 0, 0, Math.PI * 2); ctx.fill();

      const bG = ctx.createLinearGradient(cx - 6, 0, cx + 6, 0);
      bG.addColorStop(0, '#1e3a8a'); bG.addColorStop(0.5, '#facc15'); bG.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = bG;
      ctx.beginPath(); ctx.roundRect(cx - 6, cy + 22, 12, 28, 2); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 1.2; ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(cx, cy - 62, 5.5, 0, Math.PI * 2); ctx.fill();
    });

    // --- ЕГИПЕТ: АНКХ ---
    make('art_egypt_ankh', W, H, (ctx) => {
      const cx = 120, cy = 145;
      const bronzeGrad = ctx.createLinearGradient(cx - 40, cy - 50, cx + 40, cy + 50);
      bronzeGrad.addColorStop(0, '#78350f');
      bronzeGrad.addColorStop(0.35, '#f59e0b');
      bronzeGrad.addColorStop(0.65, '#fef08a');
      bronzeGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = bronzeGrad;

      ctx.beginPath(); ctx.roundRect(cx - 10, cy - 18, 20, 120, 4); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx - 45, cy - 12, 90, 18, 4); ctx.fill();

      ctx.lineWidth = 17;
      ctx.strokeStyle = bronzeGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy - 50, 22, 34, 0, 0, Math.PI * 2); ctx.stroke();

      const rubyGrad = ctx.createRadialGradient(cx - 2, cy - 6, 1, cx, cy - 3, 10);
      rubyGrad.addColorStop(0, '#f87171');
      rubyGrad.addColorStop(0.5, '#dc2626');
      rubyGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = rubyGrad;
      ctx.beginPath(); ctx.arc(cx, cy - 3, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2; ctx.stroke();
    });

    // --- ЕГИПЕТ: БАСТЕТ ---
    make('art_egypt_bastet', W, H, (ctx) => {
      const cx = 120, cy = 150;
      const catGrad = ctx.createRadialGradient(cx - 8, cy + 12, 12, cx, cy + 30, 75);
      catGrad.addColorStop(0, '#374151');
      catGrad.addColorStop(0.4, '#1f2937');
      catGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = catGrad;

      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 18);
      ctx.bezierCurveTo(cx - 42, cy + 18, cx - 38, cy + 78, cx - 30, cy + 100);
      ctx.lineTo(cx + 30, cy + 100);
      ctx.bezierCurveTo(cx + 38, cy + 78, cx + 42, cy + 18, cx + 18, cy - 18);
      ctx.closePath(); ctx.fill();

      ctx.beginPath(); ctx.arc(cx, cy - 36, 22, 0, Math.PI * 2); ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 40); ctx.lineTo(cx - 12, cy - 68); ctx.lineTo(cx - 4, cy - 48); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 18, cy - 40); ctx.lineTo(cx + 12, cy - 68); ctx.lineTo(cx + 4, cy - 48); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.ellipse(cx - 8, cy - 36, 4, 2.2, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 8, cy - 36, 4, 2.2, 0.2, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.arc(cx, cy - 18, 18, 0.2, Math.PI - 0.2); ctx.stroke();
    });

    // --- ЕГИПЕТ: КАНОПА ---
    make('art_egypt_canopic', W, H, (ctx) => {
      const cx = 120, cy = 150;
      const alGrad = ctx.createLinearGradient(cx - 45, 0, cx + 45, 0);
      alGrad.addColorStop(0, '#b45309');
      alGrad.addColorStop(0.3, '#fef3c7');
      alGrad.addColorStop(0.7, '#fffbeb');
      alGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = alGrad;

      ctx.beginPath();
      ctx.moveTo(cx - 28, cy - 15);
      ctx.bezierCurveTo(cx - 52, cy + 22, cx - 45, cy + 80, cx - 30, cy + 102);
      ctx.lineTo(cx + 30, cy + 102);
      ctx.bezierCurveTo(cx + 45, cy + 80, cx + 52, cy + 22, cx + 28, cy - 15);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2; ctx.stroke();

      ctx.beginPath(); ctx.arc(cx, cy - 32, 24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2; ctx.stroke();

      ctx.fillStyle = '#ca8a04';
      ctx.beginPath(); ctx.moveTo(cx - 5, cy - 30); ctx.lineTo(cx + 5, cy - 30); ctx.lineTo(cx, cy - 20); ctx.closePath(); ctx.fill();
    });

    // --- АНТИЧНОСТЬ: АМФОРА ---
    make('art_antique_amphora', W, H, (ctx) => {
      const cx = 120, cy = 150;
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 50);
      ctx.bezierCurveTo(cx - 50, cy - 10, cx - 45, cy + 58, cx - 20, cy + 88);
      ctx.lineTo(cx + 20, cy + 88);
      ctx.bezierCurveTo(cx + 45, cy + 58, cx + 50, cy - 10, cx + 20, cy - 50);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx - 30, cy - 10, 18, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(cx + 30, cy - 10, 18, Math.PI * 1.5, Math.PI * 0.5);
      ctx.stroke();
    });

    // --- АНТИЧНОСТЬ: ШЛЕМ ---
    make('art_antique_helmet', W, H, (ctx) => {
      const cx = 120, cy = 150;
      ctx.fillStyle = '#b45309';
      ctx.beginPath(); ctx.arc(cx, cy - 10, 40, Math.PI, 0);
      ctx.lineTo(cx + 38, cy + 38); ctx.lineTo(cx + 14, cy + 50);
      ctx.lineTo(cx + 6, cy + 16); ctx.lineTo(cx - 6, cy + 16);
      ctx.lineTo(cx - 14, cy + 50); ctx.lineTo(cx - 38, cy + 38);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.fillRect(cx - 6, cy - 60, 12, 46);
    });

    // --- ЕВРОПА: КУБОК ---
    make('art_europe_grail', W, H, (ctx) => {
      const cx = 120, cy = 150;
      ctx.fillStyle = '#e2b35b';
      ctx.beginPath();
      ctx.arc(cx, cy - 15, 34, 0, Math.PI);
      ctx.lineTo(cx + 6, cy + 44); ctx.lineTo(cx + 26, cy + 72);
      ctx.lineTo(cx - 26, cy + 72); ctx.lineTo(cx - 6, cy + 44);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2.5; ctx.stroke();
    });

    // --- ЯПОНИЯ: МАСКА МЭНГУ ---
    make('art_japan_mask', W, H, (ctx) => {
      const cx = 120, cy = 150;
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(cx - 38, cy - 20); ctx.lineTo(cx + 38, cy - 20);
      ctx.lineTo(cx + 28, cy + 48); ctx.lineTo(cx, cy + 66);
      ctx.lineTo(cx - 28, cy + 48); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.fillRect(cx - 20, cy + 10, 40, 6);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 14, cy + 22, 28, 6);
    });

    // --- АЦТЕКИ: ИДОЛ ---
    make('art_aztec_idol', W, H, (ctx) => {
      const cx = 120, cy = 150;
      ctx.fillStyle = '#065f46';
      ctx.beginPath(); ctx.roundRect(cx - 34, cy - 50, 68, 100, 8); ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.fillRect(cx - 22, cy - 28, 16, 12); ctx.fillRect(cx + 6, cy - 28, 16, 12);
      ctx.fillRect(cx - 18, cy + 8, 36, 14);
    });

    // --- ВИКИНГИ: ТОПОР ---
    make('art_viking_axe', W, H, (ctx) => {
      const cx = 120, cy = 150;
      ctx.fillStyle = '#78350f'; ctx.fillRect(cx - 6, cy - 55, 12, 130);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(cx + 5, cy - 44);
      ctx.quadraticCurveTo(cx + 50, cy - 50, cx + 55, cy - 10);
      ctx.quadraticCurveTo(cx + 38, cy + 10, cx + 5, cy);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.stroke();
    });

    // Служебные
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
