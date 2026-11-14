import { Storage } from '../utils/Storage.js';
import { ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { YandexSDK } from '../utils/YandexSDK.js';
import { TextureLoader } from '../utils/TextureLoader.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Грузим ТОЛЬКО главный экран и текущий верстак — игра открывается мгновенно
    this.load.image('menu_bg', 'assets/backgrounds/menu_bg.png');

    const activeSkin = Storage.getActiveWorkbenchSkin
      ? Storage.getActiveWorkbenchSkin()
      : (localStorage.getItem('active_workbench_skin') || 'workbench_bg_1');
    this.load.image(activeSkin, `assets/workbenches/${activeSkin}.webp`);
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

    // Фоновая подгрузка остальных экранов и артефактов без задержки входа в меню
    this.time.delayedCall(200, () => {
      ['museum_bg', 'shop_bg', 'expedition_bg', 'victory_bg'].forEach((bgKey) => {
        TextureLoader.loadImage(this, bgKey, `assets/backgrounds/${bgKey}.png`);
      });

      // Сначала грузим стартовый Египет и текущую сессию
      const priorityArts = ARTIFACT_TEMPLATES.filter((a) => a.regionId === 'egypt');
      const otherArts = ARTIFACT_TEMPLATES.filter((a) => a.regionId !== 'egypt');

      priorityArts.forEach((art) => {
        TextureLoader.loadImage(this, art.textureKey, `assets/artifacts/${art.textureKey}.webp`);
      });

      this.time.delayedCall(1200, () => {
        otherArts.forEach((art) => {
          TextureLoader.loadImage(this, art.textureKey, `assets/artifacts/${art.textureKey}.webp`);
        });
      });
    });

    YandexSDK.notifyLoadingReady();
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

    make('icon_star', 128, 128, (ctx) => {
      const cx = 64;
      const cy = 66;
      const pts = getStarPoints(cx, cy, 52, 23);

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

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.strokeStyle = '#fef9c3';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.stroke();
    });

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
  }
}
