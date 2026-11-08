export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.buildMasterAssets();
    this.scene.start('MenuScene');
  }

  buildMasterAssets() {
    const makeHD = (key, w, h, draw) => {
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

    // 1. ИНСТРУМЕНТЫ (Четкие, пропорциональные)
    makeHD('slot_scraper', 56, 56, (ctx) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(25, 26, 6, 22);
      const g = ctx.createLinearGradient(12, 26, 44, 8);
      g.addColorStop(0, '#d97706');
      g.addColorStop(0.5, '#fde047');
      g.addColorStop(1, '#b45309');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(12, 26); ctx.lineTo(44, 26); ctx.lineTo(28, 8);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.5; ctx.stroke();
    });

    makeHD('slot_brush_soft', 56, 56, (ctx) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(25, 28, 6, 20);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(22, 22, 12, 6);
      const bg = ctx.createLinearGradient(20, 8, 36, 22);
      bg.addColorStop(0, '#f59e0b');
      bg.addColorStop(1, '#b45309');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(22, 22);
      ctx.quadraticCurveTo(16, 8, 28, 6);
      ctx.quadraticCurveTo(40, 8, 34, 22);
      ctx.closePath(); ctx.fill();
    });

    makeHD('slot_solvent', 56, 56, (ctx) => {
      ctx.fillStyle = '#059669';
      ctx.beginPath(); ctx.roundRect(18, 20, 20, 30, 4); ctx.fill();
      ctx.fillStyle = '#34d399'; ctx.fillRect(23, 12, 10, 8);
      ctx.fillStyle = '#10b981'; ctx.fillRect(20, 10, 16, 3);
    });

    makeHD('slot_glue', 56, 56, (ctx) => {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(20, 48); ctx.lineTo(36, 48); ctx.lineTo(31, 16); ctx.lineTo(25, 16);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(26, 8, 4, 8);
    });

    makeHD('slot_polish', 56, 56, (ctx) => {
      const g = ctx.createRadialGradient(28, 28, 4, 28, 28, 16);
      g.addColorStop(0, '#f472b6'); g.addColorStop(1, '#9d174d');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.roundRect(14, 14, 28, 28, 6); ctx.fill();
      ctx.strokeStyle = '#fbcfe8'; ctx.lineWidth = 1; ctx.stroke();
    });

    // 2. МАСКИ СТИРАНИЯ
    const makeMask = (key, r) => {
      makeHD(key, r * 2, r * 2, (ctx) => {
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

    // 3. БИБЛИОТЕКА ВСЕХ АРТЕФАКТОВ (СТРОГО 200x240, ИДЕАЛЬНО ДЛЯ ВЕРСТАКА)
    const AW = 200, AH = 240;

    // --- ЕГИПЕТ ---
    // Скарабей
    makeHD('art_egypt_scarab', AW, AH, (ctx) => {
      const cx = 100, cy = 120;
      ctx.strokeStyle = '#854d0e'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 15); ctx.lineTo(cx - 50, cy - 35); ctx.lineTo(cx - 58, cy - 50);
      ctx.moveTo(cx + 20, cy - 15); ctx.lineTo(cx + 50, cy - 35); ctx.lineTo(cx + 58, cy - 50);
      ctx.moveTo(cx - 28, cy + 10); ctx.lineTo(cx - 58, cy + 15); ctx.lineTo(cx - 62, cy + 30);
      ctx.moveTo(cx + 28, cy + 10); ctx.lineTo(cx + 50, cy + 15); ctx.lineTo(cx + 62, cy + 30);
      ctx.moveTo(cx - 25, cy + 35); ctx.lineTo(cx - 50, cy + 55); ctx.lineTo(cx - 55, cy + 75);
      ctx.moveTo(cx + 25, cy + 35); ctx.lineTo(cx + 50, cy + 55); ctx.lineTo(cx + 55, cy + 75);
      ctx.stroke();

      const g = ctx.createLinearGradient(cx - 40, cy, cx + 40, cy);
      g.addColorStop(0, '#b45309'); g.addColorStop(0.5, '#facc15'); g.addColorStop(1, '#78350f');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(cx, cy + 12, 40, 52, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 2; ctx.stroke();

      ctx.strokeStyle = '#713f12'; ctx.beginPath();
      ctx.moveTo(cx, cy - 18); ctx.lineTo(cx, cy + 64); ctx.stroke();

      ctx.fillStyle = '#ca8a04';
      ctx.beginPath(); ctx.ellipse(cx, cy - 25, 28, 14, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#a16207';
      ctx.beginPath(); ctx.arc(cx, cy - 40, 14, Math.PI, 0); ctx.closePath(); ctx.fill();

      const l = ctx.createRadialGradient(cx, cy + 8, 2, cx, cy + 8, 16);
      l.addColorStop(0, '#60a5fa'); l.addColorStop(0.7, '#2563eb'); l.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = l;
      ctx.beginPath(); ctx.ellipse(cx, cy + 8, 15, 20, 0, 0, Math.PI * 2); ctx.fill();
    });

    // Маска Тутанхамона
    makeHD('art_egypt_mask', AW, AH, (ctx) => {
      const cx = 100, cy = 115;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 65); ctx.quadraticCurveTo(cx, cy - 75, cx + 22, cy - 65);
      ctx.lineTo(cx + 55, cy - 20); ctx.lineTo(cx + 44, cy + 35); ctx.lineTo(cx + 20, cy + 28);
      ctx.lineTo(cx + 14, cy + 72); ctx.lineTo(cx - 14, cy + 72); ctx.lineTo(cx - 20, cy + 28);
      ctx.lineTo(cx - 44, cy + 35); ctx.lineTo(cx - 55, cy - 20);
      ctx.closePath(); ctx.clip();

      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(cx - 70, cy - 85, 140, 170);
      ctx.fillStyle = '#facc15';
      for (let y = cy - 85; y < cy + 85; y += 12) ctx.fillRect(cx - 70, y, 140, 6);
      ctx.restore();

      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 65); ctx.quadraticCurveTo(cx, cy - 75, cx + 22, cy - 65);
      ctx.lineTo(cx + 55, cy - 20); ctx.lineTo(cx + 44, cy + 35); ctx.lineTo(cx + 20, cy + 28);
      ctx.lineTo(cx + 14, cy + 72); ctx.lineTo(cx - 14, cy + 72); ctx.lineTo(cx - 20, cy + 28);
      ctx.lineTo(cx - 44, cy + 35); ctx.lineTo(cx - 55, cy - 20);
      ctx.closePath(); ctx.stroke();

      const fG = ctx.createLinearGradient(cx - 20, cy, cx + 20, cy);
      fG.addColorStop(0, '#ca8a04'); fG.addColorStop(0.5, '#fef08a'); fG.addColorStop(1, '#a16207');
      ctx.fillStyle = fG;
      ctx.beginPath(); ctx.ellipse(cx, cy - 5, 24, 30, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 12, cy - 8, 6, 3); ctx.fillRect(cx + 6, cy - 8, 6, 3);
      ctx.fillStyle = '#991b1b'; ctx.fillRect(cx - 4, cy + 10, 8, 3);
      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(cx - 4, cy + 20, 8, 22);
    });

    // Анкх
    makeHD('art_egypt_ankh', AW, AH, (ctx) => {
      const cx = 100, cy = 115;
      const b = ctx.createLinearGradient(cx - 35, 0, cx + 35, 0);
      b.addColorStop(0, '#78350f'); b.addColorStop(0.5, '#f59e0b'); b.addColorStop(1, '#92400e');
      ctx.fillStyle = b;
      ctx.fillRect(cx - 9, cy - 15, 18, 100);
      ctx.fillRect(cx - 38, cy - 10, 76, 16);
      ctx.lineWidth = 14; ctx.strokeStyle = b;
      ctx.beginPath(); ctx.ellipse(cx, cy - 42, 20, 28, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy - 2, 7, 0, Math.PI * 2); ctx.fill();
    });

    // Бастет (Кошка)
    makeHD('art_egypt_bastet', AW, AH, (ctx) => {
      const cx = 100, cy = 120;
      const cG = ctx.createLinearGradient(cx - 30, cy, cx + 30, cy);
      cG.addColorStop(0, '#111827'); cG.addColorStop(0.5, '#374151'); cG.addColorStop(1, '#1f2937');
      ctx.fillStyle = cG;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 15);
      ctx.bezierCurveTo(cx - 35, cy + 15, cx - 32, cy + 65, cx - 24, cy + 85);
      ctx.lineTo(cx + 24, cy + 85);
      ctx.bezierCurveTo(cx + 32, cy + 65, cx + 35, cy + 15, cx + 15, cy - 15);
      ctx.closePath(); ctx.fill();

      ctx.beginPath(); ctx.arc(cx, cy - 30, 18, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 36); ctx.lineTo(cx - 10, cy - 58); ctx.lineTo(cx - 3, cy - 42); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 15, cy - 36); ctx.lineTo(cx + 10, cy - 58); ctx.lineTo(cx + 3, cy - 42); ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy - 14, 14, 0.2, Math.PI - 0.2); ctx.stroke();
    });

    // Канопа
    makeHD('art_egypt_canopic', AW, AH, (ctx) => {
      const cx = 100, cy = 120;
      const alG = ctx.createLinearGradient(cx - 35, cy, cx + 35, cy);
      alG.addColorStop(0, '#d97706'); alG.addColorStop(0.5, '#fef3c7'); alG.addColorStop(1, '#b45309');
      ctx.fillStyle = alG;
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 12);
      ctx.bezierCurveTo(cx - 44, cy + 20, cx - 38, cy + 70, cx - 24, cy + 85);
      ctx.lineTo(cx + 24, cy + 85);
      ctx.bezierCurveTo(cx + 38, cy + 70, cx + 44, cy + 20, cx + 24, cy - 12);
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy - 28, 20, 0, Math.PI * 2); ctx.fill();
    });

    // --- АНТИЧНОСТЬ ---
    // Греческая амфора
    makeHD('art_antique_amphora', AW, AH, (ctx) => {
      const cx = 100, cy = 120;
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 45);
      ctx.bezierCurveTo(cx - 45, cy - 10, cx - 40, cy + 50, cx - 18, cy + 75);
      ctx.lineTo(cx + 18, cy + 75);
      ctx.bezierCurveTo(cx + 40, cy + 50, cx + 45, cy - 10, cx + 18, cy - 45);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 3;
      // Ручки
      ctx.beginPath();
      ctx.arc(cx - 28, cy - 10, 16, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(cx + 28, cy - 10, 16, Math.PI * 1.5, Math.PI * 0.5);
      ctx.stroke();
    });

    // Шлем спартанца
    makeHD('art_antique_helmet', AW, AH, (ctx) => {
      const cx = 100, cy = 120;
      ctx.fillStyle = '#b45309';
      ctx.beginPath(); ctx.arc(cx, cy - 10, 36, Math.PI, 0);
      ctx.lineTo(cx + 34, cy + 35); ctx.lineTo(cx + 12, cy + 45);
      ctx.lineTo(cx + 6, cy + 15); ctx.lineTo(cx - 6, cy + 15);
      ctx.lineTo(cx - 12, cy + 45); ctx.lineTo(cx - 34, cy + 35);
      ctx.closePath(); ctx.fill();
      // Гребень
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 5, cy - 55, 10, 42);
    });

    // --- ЕВРОПА (СРЕДНЕВЕКОВЬЕ) ---
    // Рыцарский кубок
    makeHD('art_europe_grail', AW, AH, (ctx) => {
      const cx = 100, cy = 120;
      ctx.fillStyle = '#e2b35b';
      ctx.beginPath();
      ctx.arc(cx, cy - 15, 30, 0, Math.PI);
      ctx.lineTo(cx + 6, cy + 40); ctx.lineTo(cx + 24, cy + 65);
      ctx.lineTo(cx - 24, cy + 65); ctx.lineTo(cx - 6, cy + 40);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2; ctx.stroke();
    });

    // --- ЯПОНИЯ ---
    // Маска самурая (Мэнгу)
    makeHD('art_japan_mask', AW, AH, (ctx) => {
      const cx = 100, cy = 120;
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy - 20); ctx.lineTo(cx + 35, cy - 20);
      ctx.lineTo(cx + 25, cy + 45); ctx.lineTo(cx, cy + 60);
      ctx.lineTo(cx - 25, cy + 45); ctx.closePath(); ctx.fill();
      // Золотые усы и зубы
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 18, cy + 10, 36, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 12, cy + 22, 24, 6);
    });

    // --- АЦТЕКИ ---
    // Нефритовый идол
    makeHD('art_aztec_idol', AW, AH, (ctx) => {
      const cx = 100, cy = 120;
      ctx.fillStyle = '#065f46';
      ctx.beginPath(); ctx.roundRect(cx - 30, cy - 45, 60, 90, 8); ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.fillRect(cx - 20, cy - 25, 14, 10); ctx.fillRect(cx + 6, cy - 25, 14, 10);
      ctx.fillRect(cx - 16, cy + 8, 32, 12);
    });

    // --- ВИКИНГИ ---
    // Бронзовый топор
    makeHD('art_viking_axe', AW, AH, (ctx) => {
      const cx = 100, cy = 120;
      ctx.fillStyle = '#78350f'; ctx.fillRect(cx - 6, cy - 50, 12, 120);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(cx + 4, cy - 40);
      ctx.quadraticCurveTo(cx + 45, cy - 45, cx + 50, cy - 10);
      ctx.quadraticCurveTo(cx + 35, cy + 10, cx + 4, cy);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.stroke();
    });

    // Осколок для склейки
    makeHD('shard_amphora', 48, 48, (ctx) => {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(10, 10); ctx.lineTo(38, 8); ctx.lineTo(30, 38); ctx.lineTo(12, 32);
      ctx.closePath(); ctx.fill();
    });

    // Частицы
    makeHD('particle_dust', 6, 6, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(3, 3, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    // Иконка Домой
    makeHD('icon_home', 40, 40, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(20, 8); ctx.lineTo(8, 20); ctx.lineTo(13, 20);
      ctx.lineTo(13, 32); ctx.lineTo(27, 32); ctx.lineTo(27, 20); ctx.lineTo(32, 20);
      ctx.closePath(); ctx.fill();
    });
  }
}
