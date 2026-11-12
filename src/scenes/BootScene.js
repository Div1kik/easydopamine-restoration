import { Storage } from '../utils/Storage.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Основные фоны сцен
    this.load.image('menu_bg', 'assets/backgrounds/menu_bg.png');
    this.load.image('museum_bg', 'assets/backgrounds/museum_bg.png');
    this.load.image('shop_bg', 'assets/backgrounds/shop_bg.png');
    this.load.image('expedition_bg', 'assets/backgrounds/expedition_bg.png');
    this.load.image('victory_bg', 'assets/backgrounds/victory_bg.png');

    // Ленивая стратегия: на старте грузим ТОЛЬКО активный скин верстака (1 файл вместо 15)
    const activeSkin = Storage.getActiveWorkbenchSkin
      ? Storage.getActiveWorkbenchSkin()
      : (localStorage.getItem('active_workbench_skin') || 'workbench_bg_1');
    this.load.image(activeSkin, `assets/backgrounds/${activeSkin}.png`);
  }

  create() {
    try {
      this.createRestorationAssets();
    } catch (err) {
      console.error('Ошибка createRestorationAssets:', err);
    }

    // Текстура сундука-лутбокса для Лавки мастера
    if (!this.textures.exists('lootbox_chest')) {
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      gfx.fillStyle(0x3d2614, 1);
      gfx.fillRoundedRect(10, 15, 76, 60, 10);
      gfx.fillStyle(0xeab308, 1);
      gfx.fillRect(40, 25, 16, 40);
      gfx.lineStyle(3, 0xc89d54, 1);
      gfx.strokeRoundedRect(10, 15, 76, 60, 10);
      gfx.generateTexture('lootbox_chest', 96, 96);
      gfx.destroy();
    }

    this.scene.start('MenuScene');
  }

  createRestorationAssets() {
    const make = (key, w, h, fn) => {
      try {
        if (this.textures.exists(key)) return;
        const cvs = this.textures.createCanvas(key, w, h);
        if (!cvs) return;
        const ctx = cvs.getContext();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        fn(ctx);
        cvs.refresh();
      } catch (e) {
        console.warn(`Не удалось создать текстуру ${key}:`, e);
      }
    };

    const drawRoundRect = (ctx, x, y, width, height, radius = 8) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    // =========================================================================
    // 1. ИКОНКИ СЛОТОВ ИНСТРУМЕНТОВ (SHOP & RESTORE)
    // =========================================================================
    make('slot_scraper', 96, 96, (ctx) => {
      ctx.clearRect(0, 0, 96, 96);
      ctx.fillStyle = '#451a03';
      drawRoundRect(ctx, 42, 46, 12, 44, 4); ctx.fill();
      ctx.fillStyle = '#ca8a04'; ctx.fillRect(40, 40, 16, 8);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath(); ctx.moveTo(48, 8); ctx.lineTo(76, 40); ctx.lineTo(20, 40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.moveTo(48, 8); ctx.lineTo(54, 40); ctx.lineTo(48, 40); ctx.closePath(); ctx.fill();
    });

    const drawBrushSlot = (ctx) => {
      ctx.clearRect(0, 0, 96, 96);
      ctx.fillStyle = '#78350f';
      drawRoundRect(ctx, 43, 48, 10, 42, 4); ctx.fill();
      ctx.fillStyle = '#cbd5e1'; ctx.fillRect(38, 34, 20, 16);
      const bg = ctx.createLinearGradient(48, 8, 48, 34);
      bg.addColorStop(0, '#1c1917'); bg.addColorStop(0.6, '#b45309'); bg.addColorStop(1, '#fef08a');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.ellipse(48, 22, 16, 16, 0, 0, Math.PI * 2); ctx.fill();
    };
    make('slot_brush', 96, 96, drawBrushSlot);
    make('slot_brush_soft', 96, 96, drawBrushSlot);

    make('slot_solvent', 96, 96, (ctx) => {
      ctx.clearRect(0, 0, 96, 96);
      const fg = ctx.createLinearGradient(32, 32, 64, 32);
      fg.addColorStop(0, '#064e3b'); fg.addColorStop(0.5, '#059669'); fg.addColorStop(1, '#022c22');
      ctx.fillStyle = fg;
      drawRoundRect(ctx, 32, 32, 32, 56, 8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(36, 36, 4, 48);
      ctx.fillStyle = '#d97706'; ctx.fillRect(42, 18, 12, 14);
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(36, 12, 22, 8); ctx.fillRect(54, 6, 14, 8);
    });

    make('slot_glue', 96, 96, (ctx) => {
      ctx.clearRect(0, 0, 96, 96);
      const pg = ctx.createLinearGradient(30, 36, 66, 36);
      pg.addColorStop(0, '#0f172a'); pg.addColorStop(0.5, '#334155'); pg.addColorStop(1, '#020617');
      ctx.fillStyle = pg;
      drawRoundRect(ctx, 30, 36, 36, 52, 8); ctx.fill();
      ctx.fillStyle = '#d4af37'; ctx.fillRect(36, 50, 24, 22);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(40, 24, 16, 14);
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(48, 18, 10, 0, Math.PI * 2); ctx.fill();
    });

    make('slot_polish', 96, 96, (ctx) => {
      ctx.clearRect(0, 0, 96, 96);
      const zg = ctx.createRadialGradient(48, 48, 6, 48, 48, 36);
      zg.addColorStop(0, '#fde68a'); zg.addColorStop(0.6, '#d97706'); zg.addColorStop(1, '#92400e');
      ctx.fillStyle = zg;
      drawRoundRect(ctx, 26, 26, 44, 44, 12); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(46, 46, 12, 0.4, Math.PI * 1.3); ctx.stroke();
    });

    make('slot_laser', 96, 96, (ctx) => {
      ctx.clearRect(0, 0, 96, 96);
      ctx.fillStyle = '#1e293b'; drawRoundRect(ctx, 40, 20, 16, 68, 6); ctx.fill();
      ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(48, 16, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 3; ctx.stroke();
    });

    make('slot_emulsion', 96, 96, (ctx) => {
      ctx.clearRect(0, 0, 96, 96);
      ctx.fillStyle = '#831843'; drawRoundRect(ctx, 30, 28, 36, 60, 10); ctx.fill();
      ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.arc(48, 56, 10, 0, Math.PI * 2); ctx.fill();
    });

    make('slot_resin', 96, 96, (ctx) => {
      ctx.clearRect(0, 0, 96, 96);
      ctx.fillStyle = '#78350f'; drawRoundRect(ctx, 32, 28, 32, 58, 8); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.fillRect(36, 44, 24, 24);
    });

    // =========================================================================
    // 2. ИКОНКИ ЗВЕЗД, МАСОК И ЧАСТИЦ
    // =========================================================================
    const drawStar = (ctx, scx, scy, spikes, outerRadius, innerRadius) => {
      let rot = Math.PI / 2 * 3;
      let x = scx, y = scy;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(scx, scy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = scx + Math.cos(rot) * outerRadius;
        y = scy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = scx + Math.cos(rot) * innerRadius;
        y = scy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(scx, scy - outerRadius);
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

    // --- 1. ДРЕВНИЙ ЕГИПЕТ ---
    make('art_egypt_bastet', W, H, (ctx) => {
      const bg = ctx.createLinearGradient(cx - 150, cy, cx + 150, cy);
      bg.addColorStop(0, '#0a0d14'); bg.addColorStop(0.35, '#262d3d'); bg.addColorStop(0.65, '#181d28'); bg.addColorStop(1, '#07090e');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(cx - 65, cy - 130);
      ctx.bezierCurveTo(cx - 110, cy - 40, cx - 170, cy + 110, cx - 175, cy + 280);
      ctx.quadraticCurveTo(cx, cy + 320, cx + 175, cy + 280);
      ctx.bezierCurveTo(cx + 170, cy + 110, cx + 110, cy - 40, cx + 65, cy - 130);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#1b202e'; ctx.lineWidth = 24; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy + 265, 160, 0.2, Math.PI * 0.95); ctx.stroke();

      ctx.fillStyle = '#161b26';
      drawRoundRect(ctx, cx - 52, cy + 140, 38, 150, 14); ctx.fill();
      drawRoundRect(ctx, cx + 14, cy + 140, 38, 150, 14); ctx.fill();

      ctx.beginPath(); ctx.ellipse(cx, cy - 160, 95, 105, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#222938';
      ctx.beginPath(); ctx.moveTo(cx - 80, cy - 200); ctx.lineTo(cx - 75, cy - 310); ctx.lineTo(cx - 20, cy - 240); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 80, cy - 200); ctx.lineTo(cx + 75, cy - 310); ctx.lineTo(cx + 20, cy - 240); ctx.closePath(); ctx.fill();

      ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.beginPath(); ctx.moveTo(cx - 70, cy - 210); ctx.lineTo(cx - 68, cy - 290); ctx.lineTo(cx - 28, cy - 240); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 70, cy - 210); ctx.lineTo(cx + 68, cy - 290); ctx.lineTo(cx + 28, cy - 240); ctx.closePath(); ctx.fill();

      const gold = ctx.createLinearGradient(cx - 120, cy, cx + 120, cy);
      gold.addColorStop(0, '#b48a28'); gold.addColorStop(0.5, '#fde047'); gold.addColorStop(1, '#856417');
      ctx.strokeStyle = gold; ctx.lineWidth = 20;
      ctx.beginPath(); ctx.arc(cx, cy - 150, 105, 0.4, Math.PI - 0.4); ctx.stroke();

      const eye = ctx.createLinearGradient(0, cy - 180, 0, cy - 150);
      eye.addColorStop(0, '#10b981'); eye.addColorStop(1, '#064e3b');
      ctx.fillStyle = eye;
      ctx.beginPath(); ctx.ellipse(cx - 36, cy - 165, 20, 12, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 36, cy - 165, 20, 12, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#051b11';
      ctx.beginPath(); ctx.ellipse(cx - 36, cy - 165, 6, 12, 0, 0, Math.PI * 2); ctx.ellipse(cx + 36, cy - 165, 6, 12, 0, 0, Math.PI * 2); ctx.fill();
    });

    make('art_egypt_canopic', W, H, (ctx) => {
      const jg = ctx.createLinearGradient(cx - 160, cy, cx + 160, cy);
      jg.addColorStop(0, '#d1c7ac'); jg.addColorStop(0.2, '#f5eedb'); jg.addColorStop(0.5, '#fffdf7'); jg.addColorStop(0.8, '#ede3cb'); jg.addColorStop(1, '#b8ad91');
      ctx.fillStyle = jg;

      ctx.beginPath();
      ctx.moveTo(cx - 85, cy - 80);
      ctx.bezierCurveTo(cx - 185, cy, cx - 190, cy + 220, cx - 110, cy + 300);
      ctx.lineTo(cx + 110, cy + 300);
      ctx.bezierCurveTo(cx + 190, cy + 220, cx + 185, cy, cx + 85, cy - 80);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = 'rgba(180, 160, 130, 0.35)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx - 110, cy + 20); ctx.quadraticCurveTo(cx - 20, cy + 90, cx - 50, cy + 230); ctx.stroke();

      ctx.fillStyle = 'rgba(212, 175, 55, 0.5)';
      drawRoundRect(ctx, cx - 60, cy + 40, 120, 160, 12); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 3; ctx.stroke();

      const hg = ctx.createLinearGradient(cx - 80, cy - 200, cx + 80, cy - 200);
      hg.addColorStop(0, '#c7bc9f'); hg.addColorStop(0.5, '#f5eedb'); hg.addColorStop(1, '#b5a98d');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.ellipse(cx, cy - 170, 88, 98, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#856417';
      ctx.beginPath(); ctx.moveTo(cx - 20, cy - 160); ctx.lineTo(cx, cy - 115); ctx.lineTo(cx + 20, cy - 160); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(cx - 36, cy - 180, 8, 0, Math.PI * 2); ctx.arc(cx + 36, cy - 180, 8, 0, Math.PI * 2); ctx.fill();
    });

    make('art_egypt_scarab', W, H, (ctx) => {
      ctx.strokeStyle = '#b48a28'; ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy - 110); ctx.lineTo(cx - 150, cy - 200); ctx.lineTo(cx - 80, cy - 260);
      ctx.moveTo(cx + 80, cy - 110); ctx.lineTo(cx + 150, cy - 200); ctx.lineTo(cx + 80, cy - 260);
      ctx.moveTo(cx - 110, cy); ctx.lineTo(cx - 190, cy + 20); ctx.lineTo(cx - 160, cy + 100);
      ctx.moveTo(cx + 110, cy); ctx.lineTo(cx + 190, cy + 20); ctx.lineTo(cx + 160, cy + 100);
      ctx.moveTo(cx - 80, cy + 120); ctx.lineTo(cx - 160, cy + 220); ctx.lineTo(cx - 90, cy + 290);
      ctx.moveTo(cx + 80, cy + 120); ctx.lineTo(cx + 160, cy + 220); ctx.lineTo(cx + 90, cy + 290);
      ctx.stroke();

      const sg = ctx.createRadialGradient(cx, cy - 250, 10, cx, cy - 250, 56);
      sg.addColorStop(0, '#fef08a'); sg.addColorStop(0.7, '#f59e0b'); sg.addColorStop(1, '#b45309');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy - 250, 52, 0, Math.PI * 2); ctx.fill();

      const bg = ctx.createLinearGradient(cx - 140, cy, cx + 140, cy);
      bg.addColorStop(0, '#ca8a04'); bg.addColorStop(0.4, '#fde047'); bg.addColorStop(0.7, '#eab308'); bg.addColorStop(1, '#854d0e');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.ellipse(cx, cy + 30, 130, 175, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath(); ctx.ellipse(cx - 56, cy + 40, 48, 105, -0.15, 0, Math.PI * 2); ctx.ellipse(cx + 56, cy + 40, 48, 105, 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx, cy - 120); ctx.lineTo(cx, cy + 205); ctx.stroke();
      ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.ellipse(cx, cy - 120, 88, 52, 0, 0, Math.PI * 2); ctx.fill();
    });

    make('art_egypt_ankh', W, H, (ctx) => {
      const ag = ctx.createLinearGradient(cx - 90, cy, cx + 90, cy);
      ag.addColorStop(0, '#92400e'); ag.addColorStop(0.5, '#fde047'); ag.addColorStop(1, '#78350f');
      ctx.strokeStyle = ag; ctx.lineWidth = 36; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.ellipse(cx, cy - 120, 68, 100, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 140, cy); ctx.lineTo(cx + 140, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 30); ctx.lineTo(cx, cy + 280); ctx.stroke();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
    });

    make('art_egypt_mask', W, H, (ctx) => {
      const nemesBg = ctx.createLinearGradient(cx - 200, cy, cx + 200, cy);
      nemesBg.addColorStop(0, '#ca8a04'); nemesBg.addColorStop(0.5, '#fde047'); nemesBg.addColorStop(1, '#854d0e');
      ctx.fillStyle = nemesBg;

      ctx.beginPath();
      ctx.moveTo(cx - 200, cy - 170);
      ctx.quadraticCurveTo(cx, cy - 250, cx + 200, cy - 170);
      ctx.bezierCurveTo(cx + 220, cy + 70, cx + 150, cy + 260, cx + 110, cy + 290);
      ctx.lineTo(cx - 110, cy + 290);
      ctx.bezierCurveTo(cx - 150, cy + 260, cx - 220, cy + 70, cx - 200, cy - 170);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 18;
      for (let y = cy - 170; y <= cy + 250; y += 36) {
        ctx.beginPath(); ctx.moveTo(cx - 180, y); ctx.lineTo(cx + 180, y); ctx.stroke();
      }

      const faceGrad = ctx.createRadialGradient(cx, cy - 20, 30, cx, cy - 20, 150);
      faceGrad.addColorStop(0, '#fffbeb'); faceGrad.addColorStop(0.4, '#fde047'); faceGrad.addColorStop(0.85, '#eab308'); faceGrad.addColorStop(1, '#a16207');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 105, cy - 120);
      ctx.quadraticCurveTo(cx, cy - 150, cx + 105, cy - 120);
      ctx.bezierCurveTo(cx + 110, cy, cx + 80, cy + 120, cx + 50, cy + 160);
      ctx.quadraticCurveTo(cx, cy + 190, cx - 50, cy + 160);
      ctx.bezierCurveTo(cx - 80, cy + 120, cx - 110, cy, cx - 105, cy - 120);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#1e3a8a';
      drawRoundRect(ctx, cx - 20, cy + 175, 40, 125, 8); ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(cx - 44, cy - 30, 26, 13, -0.05, 0, Math.PI * 2); ctx.ellipse(cx + 44, cy - 30, 26, 13, 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.beginPath(); ctx.arc(cx - 44, cy - 30, 10, 0, Math.PI * 2); ctx.arc(cx + 44, cy - 30, 10, 0, Math.PI * 2); ctx.fill();
    });

    // --- 2. АНТИЧНОСТЬ ---
    make('art_antique_coin', W, H, (ctx) => {
      const cg = ctx.createRadialGradient(cx - 50, cy - 50, 30, cx, cy, 190);
      cg.addColorStop(0, '#f8fafc'); cg.addColorStop(0.5, '#cbd5e1'); cg.addColorStop(1, '#64748b');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, 185, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 12; ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.ellipse(cx, cy + 15, 75, 95, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 32, cy - 60, 38, 0, Math.PI * 2); ctx.arc(cx + 32, cy - 60, 38, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.arc(cx - 32, cy - 60, 15, 0, Math.PI * 2); ctx.arc(cx + 32, cy - 60, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d97706'; ctx.font = 'bold 44px serif'; ctx.fillText('ΑΘΕ', cx - 52, cy + 145);
    });

    make('art_antique_amphora', W, H, (ctx) => {
      const ag = ctx.createLinearGradient(cx - 150, cy, cx + 150, cy);
      ag.addColorStop(0, '#7c2d12'); ag.addColorStop(0.4, '#ea580c'); ag.addColorStop(1, '#431407');
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.moveTo(cx - 65, cy - 240); ctx.lineTo(cx + 65, cy - 240);
      ctx.bezierCurveTo(cx + 200, cy - 60, cx + 185, cy + 200, cx + 65, cy + 310);
      ctx.lineTo(cx - 65, cy + 310);
      ctx.bezierCurveTo(cx - 185, cy + 200, cx - 200, cy - 60, cx - 65, cy - 240);
      ctx.fill();
      ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 26; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx - 130, cy - 40, 68, 1.2, 4.8); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 130, cy - 40, 68, -1.6, 2.0); ctx.stroke();
      ctx.fillStyle = '#0f172a'; ctx.fillRect(cx - 135, cy + 15, 270, 60);
      ctx.strokeStyle = '#ea580c'; ctx.lineWidth = 6; ctx.strokeRect(cx - 130, cy + 22, 260, 46);
    });

    make('art_antique_harp', W, H, (ctx) => {
      const hg = ctx.createLinearGradient(cx - 110, cy, cx + 110, cy);
      hg.addColorStop(0, '#b45309'); hg.addColorStop(0.5, '#fde047'); hg.addColorStop(1, '#78350f');
      ctx.strokeStyle = hg; ctx.lineWidth = 32; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy + 260); ctx.bezierCurveTo(cx - 165, cy, cx - 130, cy - 200, cx - 60, cy - 270);
      ctx.quadraticCurveTo(cx, cy - 230, cx + 60, cy - 270);
      ctx.bezierCurveTo(cx + 130, cy - 200, cx + 165, cy, cx + 120, cy + 260);
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = '#78350f'; drawRoundRect(ctx, cx - 140, cy + 220, 280, 52, 14); ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)'; ctx.lineWidth = 3.5;
      for (let x = cx - 80; x <= cx + 80; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, cy - 235); ctx.lineTo(x, cy + 220); ctx.stroke();
      }
    });

    make('art_antique_statue', W, H, (ctx) => {
      const pedGrad = ctx.createLinearGradient(cx - 90, 0, cx + 90, 0);
      pedGrad.addColorStop(0, '#94a3b8'); pedGrad.addColorStop(0.5, '#e2e8f0'); pedGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = pedGrad;
      drawRoundRect(ctx, cx - 95, cy + 240, 190, 65, 8); ctx.fill();
      drawRoundRect(ctx, cx - 75, cy + 200, 150, 40, 6); ctx.fill();

      const mg = ctx.createLinearGradient(cx - 150, cy, cx + 150, cy);
      mg.addColorStop(0, '#94a3b8'); mg.addColorStop(0.3, '#f1f5f9'); mg.addColorStop(0.7, '#cbd5e1'); mg.addColorStop(1, '#64748b');
      ctx.fillStyle = mg;

      ctx.beginPath();
      ctx.moveTo(cx - 155, cy + 200); ctx.lineTo(cx + 155, cy + 200);
      ctx.bezierCurveTo(cx + 130, cy + 20, cx + 95, cy - 70, cx + 55, cy - 130);
      ctx.lineTo(cx - 55, cy - 130);
      ctx.bezierCurveTo(cx - 95, cy - 70, cx - 130, cy + 20, cx - 155, cy + 200);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 90, cy + 180); ctx.quadraticCurveTo(cx - 20, cy + 60, cx + 70, cy - 60);
      ctx.moveTo(cx - 50, cy + 195); ctx.quadraticCurveTo(cx + 20, cy + 90, cx + 100, cy - 20);
      ctx.moveTo(cx - 130, cy + 160); ctx.quadraticCurveTo(cx - 60, cy + 70, cx - 10, cy + 10);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      drawRoundRect(ctx, cx - 38, cy - 150, 76, 55, 10); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy - 190, 85, 105, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath(); ctx.moveTo(cx - 8, cy - 215); ctx.lineTo(cx + 8, cy - 165); ctx.lineTo(cx - 16, cy - 165); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#64748b';
      for (let a = 0; a < Math.PI * 1.2; a += 0.28) {
        ctx.beginPath(); ctx.arc(cx + Math.cos(a + Math.PI * 0.9) * 82, cy - 220 + Math.sin(a + Math.PI * 0.9) * 65, 24, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = -50; i <= 50; i += 22) {
        ctx.beginPath(); ctx.arc(cx + i, cy - 120 + Math.abs(i) * 0.3, 18, 0, Math.PI * 2); ctx.fill();
      }
    });

    make('art_antique_helmet', W, H, (ctx) => {
      const bg = ctx.createLinearGradient(cx - 140, cy, cx + 140, cy);
      bg.addColorStop(0, '#854d0e'); bg.addColorStop(0.4, '#eab308'); bg.addColorStop(1, '#713f12');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(cx, cy - 60, 135, Math.PI, 0);
      ctx.lineTo(cx + 120, cy + 130); ctx.lineTo(cx + 35, cy + 250); ctx.lineTo(cx + 14, cy + 60);
      ctx.lineTo(cx - 14, cy + 60); ctx.lineTo(cx - 35, cy + 250); ctx.lineTo(cx - 120, cy + 130);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0f172a';
      drawRoundRect(ctx, cx - 100, cy - 25, 74, 40, 8); ctx.fill();
      drawRoundRect(ctx, cx + 26, cy - 25, 74, 40, 8); ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.ellipse(cx, cy - 195, 34, 90, 0, 0, Math.PI * 2); ctx.fill();
    });

    // --- 3. ЕВРОПА / СРЕДНЕВЕКОВЬЕ ---
    make('art_europe_shield', W, H, (ctx) => {
      const sg = ctx.createLinearGradient(cx - 150, cy, cx + 150, cy);
      sg.addColorStop(0, '#991b1b'); sg.addColorStop(0.5, '#dc2626'); sg.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(cx - 150, cy - 250); ctx.lineTo(cx + 150, cy - 250);
      ctx.lineTo(cx + 150, cy + 60); ctx.quadraticCurveTo(cx, cy + 320, cx, cy + 320);
      ctx.quadraticCurveTo(cx - 150, cy + 60, cx - 150, cy + 60);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 20; ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.ellipse(cx, cy - 15, 68, 88, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy - 105, 34, 0, Math.PI * 2); ctx.fill();
    });

    make('art_europe_book', W, H, (ctx) => {
      ctx.fillStyle = '#451a03';
      drawRoundRect(ctx, cx - 155, cy - 240, 310, 480, 20); ctx.fill();
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = 14; ctx.stroke();
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(cx - 162, cy - 90, 34, 56); ctx.fillRect(cx - 162, cy + 30, 34, 56);
      ctx.beginPath(); ctx.arc(cx, cy, 75, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(cx, cy, 45, 0, Math.PI * 2); ctx.fill();
    });

    make('art_europe_sword', W, H, (ctx) => {
      const kg = ctx.createLinearGradient(cx - 34, 0, cx + 34, 0);
      kg.addColorStop(0, '#64748b'); kg.addColorStop(0.5, '#f8fafc'); kg.addColorStop(1, '#334155');
      ctx.fillStyle = kg;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 290); ctx.lineTo(cx + 34, cy - 240); ctx.lineTo(cx + 26, cy + 170);
      ctx.lineTo(cx - 26, cy + 170); ctx.lineTo(cx - 34, cy - 240); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy - 240); ctx.lineTo(cx, cy + 155); ctx.stroke();
      ctx.fillStyle = '#d4af37'; drawRoundRect(ctx, cx - 120, cy + 170, 240, 26, 8); ctx.fill();
      ctx.fillStyle = '#451a03'; ctx.fillRect(cx - 14, cy + 196, 28, 80);
      ctx.fillStyle = '#d4af37'; ctx.beginPath(); ctx.arc(cx, cy + 295, 25, 0, Math.PI * 2); ctx.fill();
    });

    make('art_europe_grail', W, H, (ctx) => {
      const gg = ctx.createLinearGradient(cx - 130, cy, cx + 130, cy);
      gg.addColorStop(0, '#ca8a04'); gg.addColorStop(0.4, '#fde047'); gg.addColorStop(1, '#854d0e');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(cx, cy - 70, 135, 0, Math.PI);
      ctx.lineTo(cx - 135, cy - 140); ctx.lineTo(cx + 135, cy - 140);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(cx - 26, cy + 65, 52, 155);
      ctx.beginPath(); ctx.ellipse(cx, cy + 260, 110, 36, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dc2626';
      for (let x = cx - 100; x <= cx + 100; x += 50) {
        ctx.beginPath(); ctx.arc(x, cy - 105, 11, 0, Math.PI * 2); ctx.fill();
      }
    });

    make('art_europe_crown', W, H, (ctx) => {
      const cg = ctx.createLinearGradient(cx - 170, cy, cx + 170, cy);
      cg.addColorStop(0, '#ca8a04'); cg.addColorStop(0.5, '#fde047'); cg.addColorStop(1, '#854d0e');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.moveTo(cx - 155, cy + 180); ctx.lineTo(cx + 155, cy + 180);
      ctx.lineTo(cx + 170, cy - 60); ctx.lineTo(cx + 100, cy + 50);
      ctx.lineTo(cx, cy - 100); ctx.lineTo(cx - 100, cy + 50); ctx.lineTo(cx - 170, cy - 60);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy - 100, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(cx - 170, cy - 60, 17, 0, Math.PI * 2); ctx.arc(cx + 170, cy - 60, 17, 0, Math.PI * 2); ctx.fill();
    });

    // --- 4. ЯПОНИЯ ---
    make('art_japan_fan', W, H, (ctx) => {
      ctx.fillStyle = '#991b1b';
      ctx.beginPath(); ctx.moveTo(cx, cy + 200); ctx.arc(cx, cy + 200, 320, Math.PI * 1.15, Math.PI * 1.85); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(cx, cy + 30, 80, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 5;
      for (let a = Math.PI * 1.18; a <= Math.PI * 1.82; a += 0.14) {
        ctx.beginPath(); ctx.moveTo(cx, cy + 200); ctx.lineTo(cx + Math.cos(a) * 320, cy + 200 + Math.sin(a) * 320); ctx.stroke();
      }
    });

    make('art_japan_netsuke', W, H, (ctx) => {
      const ng = ctx.createRadialGradient(cx - 30, cy - 30, 20, cx, cy, 200);
      ng.addColorStop(0, '#fef08a'); ng.addColorStop(0.4, '#eab308'); ng.addColorStop(0.8, '#b45309'); ng.addColorStop(1, '#78350f');
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy - 170);
      ctx.bezierCurveTo(cx + 170, cy - 180, cx + 200, cy + 100, cx + 60, cy + 200);
      ctx.bezierCurveTo(cx - 85, cy + 260, cx - 185, cy + 110, cx - 155, cy - 15);
      ctx.bezierCurveTo(cx - 130, cy - 115, cx - 115, cy - 155, cx - 60, cy - 170);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#451a03';
      ctx.beginPath(); ctx.ellipse(cx - 20, cy + 35, 40, 54, -0.2, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(cx - 65, cy - 165, 60, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 70, cy - 210); ctx.quadraticCurveTo(cx - 110, cy - 270, cx - 150, cy - 255);
      ctx.moveTo(cx - 40, cy - 210); ctx.quadraticCurveTo(cx - 50, cy - 280, cx - 70, cy - 295);
      ctx.stroke();

      const pearl = ctx.createRadialGradient(cx + 50, cy + 30, 6, cx + 50, cy + 30, 36);
      pearl.addColorStop(0, '#ffffff'); pearl.addColorStop(0.6, '#38bdf8'); pearl.addColorStop(1, '#0369a1');
      ctx.fillStyle = pearl; ctx.beginPath(); ctx.arc(cx + 50, cy + 30, 34, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(cx - 80, cy - 170, 8, 0, Math.PI * 2); ctx.fill();
    });

    make('art_japan_tea', W, H, (ctx) => {
      const tg = ctx.createLinearGradient(cx - 145, cy, cx + 145, cy);
      tg.addColorStop(0, '#1c1917'); tg.addColorStop(0.4, '#44403c'); tg.addColorStop(1, '#0c0a09');
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.moveTo(cx - 150, cy - 100); ctx.lineTo(cx + 150, cy - 100);
      ctx.bezierCurveTo(cx + 135, cy + 155, cx + 90, cy + 250, cx + 78, cy + 250);
      ctx.lineTo(cx - 78, cy + 250);
      ctx.bezierCurveTo(cx - 90, cy + 250, cx - 135, cy + 155, cx - 150, cy - 100);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 100, cy - 100); ctx.lineTo(cx - 30, cy + 15); ctx.lineTo(cx - 60, cy + 130); ctx.lineTo(cx + 15, cy + 250); ctx.stroke();
    });

    make('art_japan_mask', W, H, (ctx) => {
      const mg = ctx.createLinearGradient(cx - 140, cy, cx + 140, cy);
      mg.addColorStop(0, '#18181b'); mg.addColorStop(0.3, '#7f1d1d'); mg.addColorStop(0.7, '#991b1b'); mg.addColorStop(1, '#09090b');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.moveTo(cx - 155, cy - 100);
      ctx.quadraticCurveTo(cx - 85, cy - 55, cx - 50, cy - 65);
      ctx.lineTo(cx + 50, cy - 65);
      ctx.quadraticCurveTo(cx + 85, cy - 55, cx + 155, cy - 100);
      ctx.bezierCurveTo(cx + 170, cy + 40, cx + 120, cy + 170, cx + 65, cy + 210);
      ctx.quadraticCurveTo(cx, cy + 240, cx - 65, cy + 210);
      ctx.bezierCurveTo(cx - 120, cy + 170, cx - 170, cy + 40, cx - 155, cy - 100);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#450a0a';
      ctx.beginPath(); ctx.moveTo(cx - 40, cy - 65); ctx.lineTo(cx, cy - 135); ctx.lineTo(cx + 40, cy - 65); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(cx - 16, cy - 70, 6, 0, Math.PI * 2); ctx.arc(cx + 16, cy - 70, 6, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#09090b';
      drawRoundRect(ctx, cx - 85, cy + 50, 170, 52, 8); ctx.fill();
      ctx.fillStyle = '#f8fafc';
      for (let x = cx - 68; x <= cx + 68; x += 22) {
        ctx.fillRect(x, cy + 54, 16, 20); ctx.fillRect(x, cy + 78, 16, 20);
      }

      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 115, cy + 30); ctx.quadraticCurveTo(cx - 30, cy + 20, cx - 15, cy + 50);
      ctx.moveTo(cx + 115, cy + 30); ctx.quadraticCurveTo(cx + 30, cy + 20, cx + 15, cy + 50);
      ctx.stroke();

      ctx.fillStyle = '#1c1917';
      drawRoundRect(ctx, cx - 110, cy + 230, 220, 34, 8); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 4; ctx.stroke();
    });

    make('art_japan_katana', W, H, (ctx) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.35);

      const bladeGrad = ctx.createLinearGradient(-22, -330, 22, 90);
      bladeGrad.addColorStop(0, '#f8fafc'); bladeGrad.addColorStop(0.3, '#cbd5e1'); bladeGrad.addColorStop(0.7, '#94a3b8'); bladeGrad.addColorStop(1, '#475569');
      ctx.fillStyle = bladeGrad;

      ctx.beginPath();
      ctx.moveTo(-9, -330); ctx.lineTo(12, -300); ctx.lineTo(18, 70); ctx.lineTo(-12, 70);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-6, -315);
      for (let y = -285; y <= 65; y += 28) {
        ctx.quadraticCurveTo(y % 56 === 0 ? 6 : -2, y - 14, -3, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      drawRoundRect(ctx, -15, 60, 30, 26, 4); ctx.fill();

      ctx.fillStyle = '#1c1917';
      ctx.beginPath(); ctx.ellipse(0, 92, 54, 40, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 4; ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-13, 98, 26, 220);

      ctx.fillStyle = '#09090b';
      for (let hy = 104; hy <= 300; hy += 22) {
        ctx.beginPath();
        ctx.moveTo(0, hy); ctx.lineTo(13, hy + 11); ctx.lineTo(0, hy + 22); ctx.lineTo(-13, hy + 11);
        ctx.closePath(); ctx.fill();
      }

      ctx.fillStyle = '#d4af37';
      drawRoundRect(ctx, -14, 318, 28, 16, 6); ctx.fill();
      ctx.restore();
    });

    // --- 5. АЦТЕКИ ---
    make('art_aztec_vessel', W, H, (ctx) => {
      const clayGrad = ctx.createRadialGradient(cx - 50, cy + 40, 40, cx, cy + 40, 230);
      clayGrad.addColorStop(0, '#ea580c');
      clayGrad.addColorStop(0.45, '#c2410c');
      clayGrad.addColorStop(0.85, '#9a3412');
      clayGrad.addColorStop(1, '#431407');
      ctx.fillStyle = clayGrad;

      ctx.beginPath();
      ctx.moveTo(cx - 100, cy - 70);
      ctx.bezierCurveTo(cx - 200, cy, cx - 210, cy + 180, cx - 110, cy + 280);
      ctx.lineTo(cx + 110, cy + 280);
      ctx.bezierCurveTo(cx + 210, cy + 180, cx + 200, cy, cx + 100, cy - 70);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#7c2d12';
      ctx.beginPath(); ctx.ellipse(cx, cy - 75, 105, 28, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 4; ctx.stroke();

      ctx.fillStyle = '#9a3412';
      drawRoundRect(ctx, cx - 145, cy + 220, 65, 45, 12); ctx.fill();
      drawRoundRect(ctx, cx + 80, cy + 220, 65, 45, 12); ctx.fill();
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(cx - 138 + i * 18, cy + 252, 12, 14);
        ctx.fillRect(cx + 87 + i * 18, cy + 252, 12, 14);
      }

      const headGrad = ctx.createRadialGradient(cx, cy - 130, 20, cx, cy - 130, 95);
      headGrad.addColorStop(0, '#ea580c'); headGrad.addColorStop(0.7, '#9a3412'); headGrad.addColorStop(1, '#531705');
      ctx.fillStyle = headGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy - 130, 95, 80, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#7c2d12';
      ctx.beginPath(); ctx.arc(cx - 75, cy - 190, 32, 0, Math.PI * 2); ctx.arc(cx + 75, cy - 190, 32, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(cx - 75, cy - 190, 16, 0, Math.PI * 2); ctx.arc(cx + 75, cy - 190, 16, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#1c1917';
      ctx.beginPath(); ctx.ellipse(cx, cy - 90, 56, 32, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - 36, cy - 105); ctx.lineTo(cx - 24, cy - 75); ctx.lineTo(cx - 16, cy - 105);
      ctx.moveTo(cx + 16, cy - 105); ctx.lineTo(cx + 24, cy - 75); ctx.lineTo(cx + 36, cy - 105);
      ctx.moveTo(cx - 26, cy - 75); ctx.lineTo(cx - 18, cy - 95); ctx.lineTo(cx - 10, cy - 75);
      ctx.moveTo(cx + 10, cy - 75); ctx.lineTo(cx + 18, cy - 95); ctx.lineTo(cx + 26, cy - 75);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#06b6d4';
      ctx.beginPath(); ctx.ellipse(cx - 40, cy - 145, 20, 13, -0.15, 0, Math.PI * 2); ctx.ellipse(cx + 40, cy - 145, 20, 13, 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(cx - 40, cy - 145, 20, 13, -0.15, 0, Math.PI * 2); ctx.ellipse(cx + 40, cy - 145, 20, 13, 0.15, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#082f49';
      ctx.beginPath(); ctx.ellipse(cx - 40, cy - 145, 6, 12, 0, 0, Math.PI * 2); ctx.ellipse(cx + 40, cy - 145, 6, 12, 0, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#431407'; ctx.lineWidth = 5;
      const spots = [
        { x: cx - 110, y: cy + 30 }, { x: cx - 60, y: cy + 120 }, { x: cx - 120, y: cy + 170 },
        { x: cx + 110, y: cy + 30 }, { x: cx + 60, y: cy + 120 }, { x: cx + 120, y: cy + 170 },
        { x: cx, y: cy + 70 }, { x: cx, y: cy + 190 }
      ];
      spots.forEach(s => {
        ctx.beginPath(); ctx.arc(s.x, s.y, 16, 0.3, Math.PI * 1.8); ctx.stroke();
        ctx.fillStyle = '#7c2d12'; ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, Math.PI * 2); ctx.fill();
      });
    });

    make('art_aztec_dagger', W, H, (ctx) => {
      const og = ctx.createLinearGradient(cx - 40, 0, cx + 40, 0);
      og.addColorStop(0, '#09090b'); og.addColorStop(0.5, '#27272a'); og.addColorStop(1, '#09090b');
      ctx.fillStyle = og;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 300); ctx.lineTo(cx + 48, cy + 70); ctx.lineTo(cx - 48, cy + 70); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#eab308';
      drawRoundRect(ctx, cx - 34, cy + 70, 68, 205, 14); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy + 120, 17, 0, Math.PI * 2); ctx.fill();
    });

    make('art_aztec_idol', W, H, (ctx) => {
      const ig = ctx.createLinearGradient(cx - 130, cy, cx + 130, cy);
      ig.addColorStop(0, '#064e3b'); ig.addColorStop(0.5, '#059669'); ig.addColorStop(1, '#022c22');
      ctx.fillStyle = ig;
      drawRoundRect(ctx, cx - 120, cy - 230, 240, 490, 30); ctx.fill();
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 20;
      ctx.beginPath(); ctx.arc(cx - 50, cy - 90, 36, 0, Math.PI * 2); ctx.arc(cx + 50, cy - 90, 36, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(cx - 65, cy + 35, 130, 34);
    });

    make('art_aztec_mask', W, H, (ctx) => {
      const mg = ctx.createRadialGradient(cx, cy - 10, 40, cx, cy - 10, 200);
      mg.addColorStop(0, '#67e8f9'); mg.addColorStop(0.35, '#06b6d4'); mg.addColorStop(0.75, '#0891b2'); mg.addColorStop(1, '#155e75');
      ctx.fillStyle = mg;

      ctx.beginPath();
      ctx.moveTo(cx - 145, cy - 180);
      ctx.quadraticCurveTo(cx, cy - 230, cx + 145, cy - 180);
      ctx.bezierCurveTo(cx + 175, cy, cx + 140, cy + 180, cx + 75, cy + 245);
      ctx.quadraticCurveTo(cx, cy + 275, cx - 75, cy + 245);
      ctx.bezierCurveTo(cx - 140, cy + 180, cx - 175, cy, cx - 145, cy - 180);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)'; ctx.lineWidth = 2.5;
      for (let y = cy - 180; y <= cy + 230; y += 32) {
        ctx.beginPath(); ctx.moveTo(cx - 140, y); ctx.lineTo(cx + 140, y); ctx.stroke();
      }
      for (let x = cx - 120; x <= cx + 120; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, cy - 200); ctx.lineTo(x, cy + 240); ctx.stroke();
      }

      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.arc(cx - 155, cy + 20, 32, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 155, cy + 20, 32, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx - 155, cy + 20, 32, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 155, cy + 20, 32, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(cx - 55, cy - 35, 34, 18, 0, 0, Math.PI * 2); ctx.ellipse(cx + 55, cy - 35, 34, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(cx - 55, cy - 35, 12, 0, Math.PI * 2); ctx.arc(cx + 55, cy - 35, 12, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#881337';
      drawRoundRect(ctx, cx - 65, cy + 110, 130, 42, 10); ctx.fill();
      ctx.fillStyle = '#f8fafc';
      for (let tx = cx - 50; tx <= cx + 50; tx += 20) {
        ctx.fillRect(tx, cy + 114, 14, 16);
      }
    });

    make('art_aztec_calendar', W, H, (ctx) => {
      const cg = ctx.createRadialGradient(cx - 40, cy - 40, 30, cx, cy, 210);
      cg.addColorStop(0, '#78716c'); cg.addColorStop(0.6, '#44403c'); cg.addColorStop(1, '#1c1917');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, 195, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#a8a29e'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(cx, cy, 160, 0, Math.PI * 2); ctx.arc(cx, cy, 105, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(cx, cy, 62, 0, Math.PI * 2); ctx.fill();
    });

    // --- 6. ВИКИНГИ ---
    make('art_viking_horn', W, H, (ctx) => {
      const hornGrad = ctx.createLinearGradient(cx - 150, cy - 150, cx + 150, cy + 200);
      hornGrad.addColorStop(0, '#fef3c7');
      hornGrad.addColorStop(0.3, '#d97706');
      hornGrad.addColorStop(0.7, '#451a03');
      hornGrad.addColorStop(1, '#1c1917');
      ctx.fillStyle = hornGrad;

      ctx.beginPath();
      ctx.moveTo(cx - 130, cy - 220);
      ctx.bezierCurveTo(cx + 190, cy - 140, cx + 220, cy + 180, cx + 110, cy + 270);
      ctx.quadraticCurveTo(cx + 60, cy + 280, cx + 30, cy + 180);
      ctx.bezierCurveTo(cx - 20, cy + 60, cx - 50, cy - 30, cx - 130, cy - 110);
      ctx.closePath();
      ctx.fill();

      const silverGrad = ctx.createLinearGradient(cx - 140, 0, cx - 120, 0);
      silverGrad.addColorStop(0, '#64748b'); silverGrad.addColorStop(0.5, '#f8fafc'); silverGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = silverGrad;
      ctx.beginPath();
      ctx.ellipse(cx - 130, cy - 165, 30, 60, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 14; ctx.stroke();

      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 22;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 20); ctx.lineTo(cx + 70, cy + 30);
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(cx + 110, cy + 270);
      ctx.lineTo(cx + 140, cy + 320);
      ctx.lineTo(cx + 80, cy + 285);
      ctx.closePath();
      ctx.fill();
    });

    make('art_viking_brooch', W, H, (ctx) => {
      const ringGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, 190);
      ringGrad.addColorStop(0, '#94a3b8'); ringGrad.addColorStop(0.6, '#f1f5f9'); ringGrad.addColorStop(1, '#475569');
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 36;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.arc(cx, cy, 155, 0.55, Math.PI * 2 - 0.55);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      const endAngle1 = 0.55;
      const endAngle2 = Math.PI * 2 - 0.55;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(endAngle1) * 155, cy + Math.sin(endAngle1) * 155, 26, 0, Math.PI * 2);
      ctx.arc(cx + Math.cos(endAngle2) * 155, cy + Math.sin(endAngle2) * 155, 26, 0, Math.PI * 2);
      ctx.fill();

      const needleGrad = ctx.createLinearGradient(cx - 200, cy + 160, cx + 180, cy - 180);
      needleGrad.addColorStop(0, '#334155'); needleGrad.addColorStop(0.5, '#f8fafc'); needleGrad.addColorStop(1, '#94a3b8');
      ctx.strokeStyle = needleGrad;
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 170, cy + 180);
      ctx.lineTo(cx + 170, cy - 180);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(cx - 90, cy + 95, 28, 0, Math.PI * 2);
      ctx.stroke();
    });

    make('art_viking_axe', W, H, (ctx) => {
      const wood = ctx.createLinearGradient(cx - 20, 0, cx + 20, 0);
      wood.addColorStop(0, '#451a03'); wood.addColorStop(0.5, '#78350f'); wood.addColorStop(1, '#290f02');
      ctx.fillStyle = wood;
      drawRoundRect(ctx, cx - 18, cy - 250, 36, 530, 8); ctx.fill();

      ctx.fillStyle = '#1c1917';
      for (let y = cy + 120; y <= cy + 250; y += 22) {
        ctx.fillRect(cx - 20, y, 40, 14);
      }

      const steel = ctx.createLinearGradient(cx, cy - 200, cx + 190, cy - 70);
      steel.addColorStop(0, '#1e293b'); steel.addColorStop(0.4, '#475569'); steel.addColorStop(0.8, '#94a3b8'); steel.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = steel;

      ctx.beginPath();
      ctx.moveTo(cx - 25, cy - 200); ctx.lineTo(cx + 35, cy - 200);
      ctx.quadraticCurveTo(cx + 150, cy - 230, cx + 195, cy - 70);
      ctx.bezierCurveTo(cx + 160, cy + 50, cx + 50, cy - 30, cx + 18, cy - 65);
      ctx.lineTo(cx - 25, cy - 65);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#0f172a';
      drawRoundRect(ctx, cx - 28, cy - 206, 56, 148, 6); ctx.fill();

      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + 195, cy - 70);
      ctx.bezierCurveTo(cx + 160, cy + 50, cx + 50, cy - 30, cx + 18, cy - 65);
      ctx.stroke();

      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx + 60, cy - 150); ctx.lineTo(cx + 120, cy - 130); ctx.lineTo(cx + 90, cy - 90);
      ctx.stroke();
    });

    make('art_viking_mjolnir', W, H, (ctx) => {
      const mg = ctx.createLinearGradient(cx - 140, cy, cx + 140, cy);
      mg.addColorStop(0, '#475569'); mg.addColorStop(0.5, '#cbd5e1'); mg.addColorStop(1, '#1e293b');
      ctx.fillStyle = mg;
      drawRoundRect(ctx, cx - 155, cy + 70, 310, 120, 22); ctx.fill();
      ctx.fillRect(cx - 25, cy - 225, 50, 310);
      ctx.beginPath(); ctx.arc(cx, cy - 225, 36, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 6;
      ctx.strokeRect(cx - 125, cy + 90, 250, 80);
    });

    make('art_viking_ship', W, H, (ctx) => {
      const wood = ctx.createLinearGradient(cx - 170, cy, cx + 170, cy);
      wood.addColorStop(0, '#2b1408'); wood.addColorStop(0.4, '#5c2d13'); wood.addColorStop(0.8, '#78350f'); wood.addColorStop(1, '#1f0d04');
      ctx.fillStyle = wood;

      ctx.beginPath();
      ctx.moveTo(cx - 60, cy + 310);
      ctx.bezierCurveTo(cx - 200, cy + 90, cx - 170, cy - 80, cx - 30, cy - 190);
      ctx.lineTo(cx + 115, cy - 270);
      ctx.lineTo(cx + 145, cy - 200);
      ctx.lineTo(cx + 60, cy - 170);
      ctx.lineTo(cx + 120, cy - 130);
      ctx.lineTo(cx + 50, cy - 90);
      ctx.bezierCurveTo(cx + 15, cy + 60, cx + 65, cy + 170, cx + 80, cy + 310);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(cx + 65, cy - 195); ctx.lineTo(cx + 85, cy - 190); ctx.lineTo(cx + 75, cy - 175);
      ctx.moveTo(cx + 80, cy - 120); ctx.lineTo(cx + 100, cy - 115); ctx.lineTo(cx + 85, cy - 100);
      ctx.fill();

      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(cx, cy - 195, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(cx, cy - 195, 6, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 70, cy + 250); ctx.bezierCurveTo(cx - 120, cy + 90, cx - 100, cy - 30, cx - 15, cy - 110);
      ctx.stroke();
    });

    // --- 7. РЕНЕССАНС ---
    make('art_renaissance_compass', W, H, (ctx) => {
      const boxGrad = ctx.createLinearGradient(cx - 170, cy - 170, cx + 170, cy + 170);
      boxGrad.addColorStop(0, '#582910'); boxGrad.addColorStop(0.5, '#78350f'); boxGrad.addColorStop(1, '#2b1206');
      ctx.fillStyle = boxGrad;
      drawRoundRect(ctx, cx - 165, cy - 165, 330, 330, 24); ctx.fill();

      ctx.fillStyle = '#d4af37';
      const corners = [
        { x: cx - 160, y: cy - 160 }, { x: cx + 125, y: cy - 160 },
        { x: cx - 160, y: cy + 125 }, { x: cx + 125, y: cy + 125 }
      ];
      corners.forEach(c => {
        drawRoundRect(ctx, c.x, c.y, 35, 35, 6); ctx.fill();
      });

      const bowlGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 140);
      bowlGrad.addColorStop(0, '#fef08a'); bowlGrad.addColorStop(0.7, '#eab308'); bowlGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = bowlGrad;
      ctx.beginPath(); ctx.arc(cx, cy, 138, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.arc(cx, cy, 115, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.stroke();

      drawStar(ctx, cx, cy, 8, 95, 28);
      ctx.fillStyle = '#b45309'; ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(cx + 18, cy); ctx.lineTo(cx, cy - 105);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(cx - 18, cy); ctx.lineTo(cx, cy + 105);
      ctx.closePath(); ctx.fill();
    });

    make('art_renaissance_goblet', W, H, (ctx) => {
      const glassGrad = ctx.createLinearGradient(cx - 130, cy, cx + 130, cy);
      glassGrad.addColorStop(0, 'rgba(191, 219, 254, 0.45)');
      glassGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.85)');
      glassGrad.addColorStop(0.7, 'rgba(147, 197, 253, 0.5)');
      glassGrad.addColorStop(1, 'rgba(96, 165, 250, 0.45)');
      ctx.fillStyle = glassGrad;

      ctx.beginPath();
      ctx.moveTo(cx - 120, cy - 220); ctx.lineTo(cx + 120, cy - 220);
      ctx.bezierCurveTo(cx + 110, cy + 20, cx + 35, cy + 70, cx + 22, cy + 85);
      ctx.lineTo(cx - 22, cy + 85);
      ctx.bezierCurveTo(cx - 35, cy + 70, cx - 110, cy + 20, cx - 120, cy - 220);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy - 200); ctx.quadraticCurveTo(cx, cy - 60, cx + 60, cy - 160);
      ctx.moveTo(cx + 80, cy - 200); ctx.quadraticCurveTo(cx, cy - 40, cx - 60, cy - 140);
      ctx.stroke();

      const goldGrad = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0);
      goldGrad.addColorStop(0, '#ca8a04'); goldGrad.addColorStop(0.5, '#fde047'); goldGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = goldGrad;

      ctx.beginPath(); ctx.ellipse(cx, cy + 120, 32, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 14, cy + 85, 28, 160);

      ctx.beginPath(); ctx.ellipse(cx, cy + 265, 125, 38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 4; ctx.stroke();
    });

    make('art_renaissance_astrolabe', W, H, (ctx) => {
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 22;
      ctx.beginPath(); ctx.arc(cx, cy - 240, 52, 0, Math.PI * 2); ctx.stroke();

      const brassGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 210);
      brassGrad.addColorStop(0, '#fef08a');
      brassGrad.addColorStop(0.5, '#eab308');
      brassGrad.addColorStop(0.85, '#b45309');
      brassGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = brassGrad;
      ctx.beginPath(); ctx.arc(cx, cy, 195, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 6; ctx.stroke();

      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 175, 0, Math.PI * 2); ctx.stroke();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 18) {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 175, cy + Math.sin(a) * 175);
        ctx.lineTo(cx + Math.cos(a) * 192, cy + Math.sin(a) * 192);
        ctx.stroke();
      }

      ctx.strokeStyle = '#291205'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.moveTo(cx - 170, cy); ctx.lineTo(cx + 170, cy);
      ctx.moveTo(cx, cy - 170); ctx.lineTo(cx, cy + 170);
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(0.65);
      drawRoundRect(ctx, -195, -12, 390, 24, 6); ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
    });

    make('art_renaissance_clock', W, H, (ctx) => {
      const goldEgg = ctx.createRadialGradient(cx - 40, cy - 40, 40, cx, cy, 220);
      goldEgg.addColorStop(0, '#fffbeb');
      goldEgg.addColorStop(0.35, '#fde047');
      goldEgg.addColorStop(0.7, '#eab308');
      goldEgg.addColorStop(1, '#854d0e');
      ctx.fillStyle = goldEgg;

      ctx.beginPath();
      ctx.ellipse(cx, cy, 150, 215, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#713f12'; ctx.lineWidth = 6; ctx.stroke();

      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(cx, cy, 105, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.arc(cx, cy, 95, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3; ctx.stroke();

      ctx.strokeStyle = '#09090b'; ctx.lineWidth = 3;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 82, cy + Math.sin(a) * 82);
        ctx.lineTo(cx + Math.cos(a) * 92, cy + Math.sin(a) * 92);
        ctx.stroke();
      }

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 8, cy - 25);
      ctx.lineTo(cx, cy - 70);
      ctx.lineTo(cx - 8, cy - 25);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#eab308';
      drawRoundRect(ctx, cx - 22, cy - 245, 44, 34, 6); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(cx, cy - 260, 28, 0, Math.PI * 2); ctx.stroke();
    });

    make('art_renaissance_mona', W, H, (ctx) => {
      const frameGrad = ctx.createLinearGradient(cx - 170, cy - 260, cx + 170, cy + 260);
      frameGrad.addColorStop(0, '#78350f');
      frameGrad.addColorStop(0.5, '#d4af37');
      frameGrad.addColorStop(1, '#451a03');
      ctx.fillStyle = frameGrad;
      drawRoundRect(ctx, cx - 160, cy - 250, 320, 500, 18); ctx.fill();

      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 8;
      ctx.strokeRect(cx - 138, cy - 228, 276, 456);

      const canvasBg = ctx.createRadialGradient(cx, cy - 40, 20, cx, cy, 210);
      canvasBg.addColorStop(0, '#1e293b'); canvasBg.addColorStop(0.7, '#0f172a'); canvasBg.addColorStop(1, '#020617');
      ctx.fillStyle = canvasBg;
      ctx.fillRect(cx - 130, cy - 220, 260, 440);

      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.moveTo(cx - 95, cy + 215);
      ctx.lineTo(cx + 95, cy + 215);
      ctx.bezierCurveTo(cx + 80, cy + 60, cx + 55, cy - 10, cx + 32, cy - 40);
      ctx.lineTo(cx - 32, cy - 40);
      ctx.bezierCurveTo(cx - 55, cy - 10, cx - 80, cy + 60, cx - 95, cy + 215);
      ctx.closePath();
      ctx.fill();

      const skinGrad = ctx.createLinearGradient(cx - 40, cy - 120, cx + 40, cy - 60);
      skinGrad.addColorStop(0, '#ffedd5'); skinGrad.addColorStop(1, '#fed7aa');
      ctx.fillStyle = skinGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy - 80, 58, 72, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(cx - 65, cy - 80);
      ctx.quadraticCurveTo(cx, cy - 170, cx + 65, cy - 80);
      ctx.bezierCurveTo(cx + 75, cy + 20, cx + 60, cy + 90, cx + 45, cy + 110);
      ctx.lineTo(cx - 45, cy + 110);
      ctx.bezierCurveTo(cx - 60, cy + 90, cx - 75, cy + 20, cx - 65, cy - 80);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy - 10, 36, 0.2, Math.PI - 0.2); ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.arc(cx, cy + 26, 8, 0, Math.PI * 2); ctx.fill();
    });
  }
}
