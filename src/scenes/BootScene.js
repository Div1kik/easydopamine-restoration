import { Storage } from '../utils/Storage.js';
import { ARTIFACT_TEMPLATES } from '../data/artifacts.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('menu_bg', 'assets/backgrounds/menu_bg.png');
    this.load.image('museum_bg', 'assets/backgrounds/museum_bg.png');
    this.load.image('shop_bg', 'assets/backgrounds/shop_bg.png');
    this.load.image('expedition_bg', 'assets/backgrounds/expedition_bg.png');
    this.load.image('victory_bg', 'assets/backgrounds/victory_bg.png');

    const activeSkin = Storage.getActiveWorkbenchSkin
      ? Storage.getActiveWorkbenchSkin()
      : (localStorage.getItem('active_workbench_skin') || 'workbench_bg_1');
    this.load.image(activeSkin, `assets/workbenches/${activeSkin}.webp`);

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

    const getStarPoints = (cx, cy, outerR, innerR) => {
      const pts = [];
      let rot = -Math.PI / 2;
      const step = Math.PI / 5;
      for (let i = 0; i < 5; i++) {
        pts.push({ x: cx + Math.cos(rot) * outerR, y: cy + Math.sin(rot) * outerR });
        rot += step;
        pts.push({ x: cx + Math.cos(rot) * innerR, y: cy + Math.sin(rot) * innerR });
        rot += step;
      }
      return pts;
    };

    // Ювелирная объёмная звезда с 10 гранями и золотой окантовкой
    make('icon_star', 128, 128, (ctx) => {
      const cx = 64;
      const cy = 66;
      const pts = getStarPoints(cx, cy, 52, 23);

      // Мягкая тень под звездой
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();

      const baseGrad = ctx.createLinearGradient(20, 14, 108, 114);
      baseGrad.addColorStop(0, '#fef08a');
      baseGrad.addColorStop(0.5, '#eab308');
      baseGrad.addColorStop(1, '#a16207');
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.restore();

      // Огранка от центра к вершинам (левая грань светлее, правая темнее)
      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % pts.length];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.fillStyle = (i % 2 === 0) ? 'rgba(255, 251, 235, 0.38)' : 'rgba(120, 53, 15, 0.28)';
        ctx.fill();
      }

      // Чёткий золотой контур
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.strokeStyle = '#fef9c3';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.stroke();
    });

    // Пустая звезда в едином ювелирном стиле
    make('icon_star_empty', 128, 128, (ctx) => {
      const cx = 64;
      const cy = 66;
      const pts = getStarPoints(cx, cy, 50, 22);

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();

      ctx.fillStyle = 'rgba(24, 16, 10, 0.78)';
      ctx.fill();
      ctx.strokeStyle = '#785532';
      ctx.lineWidth = 2.5;
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
