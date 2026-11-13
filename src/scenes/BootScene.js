import { Storage } from '../utils/Storage.js';
import { ARTIFACT_TEMPLATES } from '../data/artifacts.js';

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

    // Новый путь к .webp фонам верстака (обход кэша GitHub Pages)
    const activeSkin = Storage.getActiveWorkbenchSkin
      ? Storage.getActiveWorkbenchSkin()
      : (localStorage.getItem('active_workbench_skin') || 'workbench_bg_1');
    this.load.image(activeSkin, `assets/workbenches/${activeSkin}.webp`);

    // Попытка предзагрузки растровых иллюстраций артефактов из assets/artifacts/*.webp
    // Если файл ещё не залит — Phaser тихо пропустит ошибку, а createRestorationAssets создаст резервный рисунок
    ARTIFACT_TEMPLATES.forEach((art) => {
      if (art.textureKey) {
        this.load.image(art.textureKey, `assets/artifacts/${art.textureKey}.webp`);
      }
    });
  }

  create() {
    try {
      this.createRestorationAssets();
    } catch (err) {
      console.error('Ошибка createRestorationAssets:', err);
    }

    // Текстура сундука верстаков
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

    // Текстура сундука инструментов (лазурно-золотой)
    if (!this.textures.exists('toolbox_chest')) {
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      gfx.fillStyle(0x1e293b, 1);
      gfx.fillRoundedRect(10, 18, 76, 56, 10);
      gfx.fillStyle(0x38bdf8, 1);
      gfx.fillRect(40, 26, 16, 38);
      gfx.lineStyle(3, 0xfacc15, 1);
      gfx.strokeRoundedRect(10, 18, 76, 56, 10);
      gfx.generateTexture('toolbox_chest', 96, 96);
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

    // ИКОНКИ СЛОТОВ ИНСТРУМЕНТОВ
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

    make('particle_dust', 12, 12, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.fill();
    });

    // Резервные процедурные артефакты (создаются только если растровый .webp ещё не загружен)
    const W = 640, H = 800, cx = 320, cy = 400;

    make('art_egypt_scarab', W, H, (ctx) => {
      const bg = ctx.createLinearGradient(cx - 140, cy, cx + 140, cy);
      bg.addColorStop(0, '#ca8a04'); bg.addColorStop(0.4, '#fde047'); bg.addColorStop(1, '#854d0e');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.ellipse(cx, cy + 30, 130, 175, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath(); ctx.ellipse(cx - 56, cy + 40, 48, 105, -0.15, 0, Math.PI * 2); ctx.ellipse(cx + 56, cy + 40, 48, 105, 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.ellipse(cx, cy - 120, 88, 52, 0, 0, Math.PI * 2); ctx.fill();
    });

    // Гарантируем наличие текстуры для каждого артефакта из каталога
    ARTIFACT_TEMPLATES.forEach((art, index) => {
      make(art.textureKey, W, H, (ctx) => {
        const hue = (index * 37) % 360;
        const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 200);
        grad.addColorStop(0, `hsl(${hue}, 65%, 65%)`);
        grad.addColorStop(0.6, `hsl(${hue}, 55%, 42%)`);
        grad.addColorStop(1, `hsl(${hue}, 45%, 22%)`);
        ctx.fillStyle = grad;
        drawRoundRect(ctx, cx - 140, cy - 190, 280, 380, 42);
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 10;
        ctx.stroke();
      });
    });
  }
}
