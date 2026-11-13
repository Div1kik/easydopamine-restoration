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

    // Активный фон верстака из assets/workbenches/*.webp
    const activeSkin = Storage.getActiveWorkbenchSkin
      ? Storage.getActiveWorkbenchSkin()
      : (localStorage.getItem('active_workbench_skin') || 'workbench_bg_1');
    this.load.image(activeSkin, `assets/workbenches/${activeSkin}.webp`);

    // Предзагрузка растровых иллюстраций артефактов из assets/artifacts/*.webp
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

    // HD-текстура сундука верстаков (192x192 для 3x Retina без лесенок)
    if (!this.textures.exists('lootbox_chest')) {
      const cvs = this.textures.createCanvas('lootbox_chest', 192, 192);
      const ctx = cvs.getContext();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const bodyGrad = ctx.createLinearGradient(20, 36, 20, 156);
      bodyGrad.addColorStop(0, '#5c371c');
      bodyGrad.addColorStop(1, '#261509');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(22, 36, 148, 120, 20);
      ctx.fill();

      // Золотая окантовка и замок
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#eab308';
      ctx.fillRect(82, 54, 28, 84);
      ctx.beginPath();
      ctx.arc(96, 96, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.stroke();

      cvs.refresh();
    }

    // HD-текстура ларя инструментов (192x192)
    if (!this.textures.exists('toolbox_chest')) {
      const cvs = this.textures.createCanvas('toolbox_chest', 192, 192);
      const ctx = cvs.getContext();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const bodyGrad = ctx.createLinearGradient(20, 40, 20, 152);
      bodyGrad.addColorStop(0, '#1e293b');
      bodyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(22, 40, 148, 112, 20);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(82, 58, 28, 76);

      cvs.refresh();
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

    const drawStar = (ctx, scx, scy, spikes, outerRadius, innerRadius) => {
      let rot = (Math.PI / 2) * 3;
      let x = scx;
      let y = scy;
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

    // HD-звёзды (128x128 вместо 64x64 для плавного сглаживания на экране победы)
    make('icon_star', 128, 128, (ctx) => {
      const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 56);
      g.addColorStop(0, '#fffbeb');
      g.addColorStop(0.45, '#facc15');
      g.addColorStop(1, '#ca8a04');
      ctx.fillStyle = g;
      drawStar(ctx, 64, 64, 5, 52, 24);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.stroke();
    });

    make('icon_star_empty', 128, 128, (ctx) => {
      ctx.fillStyle = '#1e293b';
      drawStar(ctx, 64, 64, 5, 52, 24);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.stroke();
    });

    make('particle_dust', 24, 24, (ctx) => {
      const g = ctx.createRadialGradient(12, 12, 1, 12, 12, 10);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    // Резервные заглушки для артефактов (сработают только для тех, чьи .webp ещё не загружены в assets/artifacts/)
    const W = 640;
    const H = 800;
    const cx = 320;
    const cy = 400;

    make('art_egypt_scarab', W, H, (ctx) => {
      const bg = ctx.createLinearGradient(cx - 140, cy, cx + 140, cy);
      bg.addColorStop(0, '#ca8a04');
      bg.addColorStop(0.4, '#fde047');
      bg.addColorStop(1, '#854d0e');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 30, 130, 175, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.ellipse(cx - 56, cy + 40, 48, 105, -0.15, 0, Math.PI * 2);
      ctx.ellipse(cx + 56, cy + 40, 48, 105, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 120, 88, 52, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ARTIFACT_TEMPLATES.forEach((art, index) => {
      make(art.textureKey, W, H, (ctx) => {
        const hue = (index * 37) % 360;
        const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 200);
        grad.addColorStop(0, `hsl(${hue}, 65%, 65%)`);
        grad.addColorStop(0.6, `hsl(${hue}, 55%, 42%)`);
        grad.addColorStop(1, `hsl(${hue}, 45%, 22%)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(cx - 140, cy - 190, 280, 380, 42);
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 10;
        ctx.stroke();
      });
    });
  }
}
