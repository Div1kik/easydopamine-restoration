import { Storage } from '../utils/Storage.js';
import { ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { YandexSDK } from '../utils/YandexSDK.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const { width, height } = this.scale;
    const dpr = 3;
    const FONT_TITLE = '"Cormorant Garamond", Georgia, serif';
    const FONT_UI = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    // Тёплый виньеточный фон
    const bgGfx = this.add.graphics();
    bgGfx.fillGradientStyle(0x1f140c, 0x1f140c, 0x0b0704, 0x0b0704, 1);
    bgGfx.fillRect(0, 0, width, height);

    // Декоративная внешняя рамка экрана
    const framePad = 14;
    bgGfx.lineStyle(1.5, 0xc89d54, 0.35);
    bgGfx.strokeRoundedRect(framePad, framePad, width - framePad * 2, height - framePad * 2, 16);

    // Центральная карточка загрузки в стиле мастерской
    const cardW = Math.min(width * 0.84, 380);
    const cardH = 260;
    const cardX = width / 2 - cardW / 2;
    const cardY = height / 2 - cardH / 2;

    const cardGfx = this.add.graphics();
    cardGfx.fillStyle(0x050302, 0.65);
    cardGfx.fillRoundedRect(cardX, cardY + 5, cardW, cardH, 16);

    cardGfx.fillGradientStyle(0x261a10, 0x261a10, 0x140d08, 0x140d08, 0.96);
    cardGfx.fillRoundedRect(cardX, cardY, cardW, cardH, 16);

    cardGfx.lineStyle(1.8, 0xc89d54, 0.85);
    cardGfx.strokeRoundedRect(cardX, cardY, cardW, cardH, 16);

    cardGfx.lineStyle(1, 0xfef08a, 0.22);
    cardGfx.strokeRoundedRect(cardX + 6, cardY + 6, cardW - 12, cardH - 12, 12);

    // Латунные заклёпки по углам карточки
    [
      { x: cardX + 14, y: cardY + 14 },
      { x: cardX + cardW - 14, y: cardY + 14 },
      { x: cardX + 14, y: cardY + cardH - 14 },
      { x: cardX + cardW - 14, y: cardY + cardH - 14 }
    ].forEach((pt) => {
      cardGfx.fillStyle(0xc89d54, 0.9);
      cardGfx.fillCircle(pt.x, pt.y, 2.5);
    });

    // Эмблема латунного компаса
    const compassCont = this.add.container(width / 2, cardY + 66);
    const compGfx = this.add.graphics();
    compGfx.fillStyle(0xfacc15, 0.12);
    compGfx.fillCircle(0, 0, 36);
    compGfx.lineStyle(2.5, 0xfacc15, 0.9);
    compGfx.strokeCircle(0, 0, 28);
    compGfx.lineStyle(1, 0xc89d54, 0.65);
    compGfx.strokeCircle(0, 0, 22);
    compassCont.add(compGfx);

    const needleGfx = this.add.graphics();
    needleGfx.fillStyle(0xfacc15, 1);
    needleGfx.beginPath();
    needleGfx.moveTo(0, -18);
    needleGfx.lineTo(5, 0);
    needleGfx.lineTo(0, 4);
    needleGfx.lineTo(-5, 0);
    needleGfx.closePath();
    needleGfx.fill();

    needleGfx.fillStyle(0x9c8265, 0.85);
    needleGfx.beginPath();
    needleGfx.moveTo(0, 18);
    needleGfx.lineTo(4, 0);
    needleGfx.lineTo(-4, 0);
    needleGfx.closePath();
    needleGfx.fill();

    needleGfx.fillStyle(0x1a1004, 1);
    needleGfx.fillCircle(0, 0, 2.5);
    compassCont.add(needleGfx);

    this.tweens.add({
      targets: needleGfx,
      angle: { from: -28, to: 28 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const studioTxt = this.add.text(width / 2, cardY + 112, 'EASY DOPAMINE GAMES', {
      fontSize: '10.5px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      fontStyle: 'bold',
      letterSpacing: 1.8,
      resolution: dpr
    }).setOrigin(0.5);

    const titleTxt = this.add.text(width / 2, cardY + 138, 'АРТЕФАКТЫ ВРЕМЕНИ', {
      fontSize: '21px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1,
      resolution: dpr
    }).setOrigin(0.5);

    const statusTxt = this.add.text(width / 2, cardY + 170, 'Подготовка верстака и каталогов...', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: dpr
    }).setOrigin(0.5);

    // Прогресс-бар в бронзовой оправе
    const barW = cardW - 48;
    const barH = 12;
    const barY = cardY + 202;

    const barFrame = this.add.graphics();
    barFrame.fillStyle(0x0d0805, 0.96);
    barFrame.fillRoundedRect(width / 2 - barW / 2, barY - barH / 2, barW, barH, 6);
    barFrame.lineStyle(1.2, 0xc89d54, 0.8);
    barFrame.strokeRoundedRect(width / 2 - barW / 2, barY - barH / 2, barW, barH, 6);

    const barFill = this.add.rectangle(width / 2 - barW / 2 + 2, barY, 4, barH - 4, 0xfacc15)
      .setOrigin(0, 0.5);

    const pctTxt = this.add.text(width / 2, barY + 22, '0%', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    this.load.maxParallelDownloads = 4;

    const retriedKeys = new Set();
    this.load.on('loaderror', (fileObj) => {
      if (!fileObj || !fileObj.key || retriedKeys.has(fileObj.key)) return;
      retriedKeys.add(fileObj.key);
      // dig_bg опционален на случай, если файл ещё не загружен в папку
      if (fileObj.key === 'dig_bg') return;
      this.load.image(fileObj.key, fileObj.url);
    });

    this.load.on('progress', (val) => {
      const innerMax = barW - 4;
      barFill.width = Math.max(4, innerMax * val);
      const pct = Math.round(val * 100);
      pctTxt.setText(`${pct}%`);

      if (val < 0.35) {
        statusTxt.setText('Распаковка карт экспедиций...');
      } else if (val < 0.75) {
        statusTxt.setText('Сверка реестра древних реликвий...');
      } else {
        statusTxt.setText('Зажигаем лампы мастерской...');
      }
    });

    this.load.once('complete', () => {
      [bgGfx, cardGfx, compassCont, studioTxt, titleTxt, statusTxt, barFrame, barFill, pctTxt].forEach((o) => {
        if (o && o.destroy) o.destroy();
      });
    });

    this.load.image('menu_bg', 'assets/backgrounds/menu_bg.webp');
    this.load.image('museum_bg', 'assets/backgrounds/museum_bg.webp');
    this.load.image('shop_bg', 'assets/backgrounds/shop_bg.webp');
    this.load.image('expedition_bg', 'assets/backgrounds/expedition_bg.webp');
    this.load.image('dig_bg', 'assets/backgrounds/dig_bg.webp');
    this.load.image('victory_bg', 'assets/backgrounds/victory_bg.webp');

    let activeSkin = Storage.getActiveWorkbenchSkin
      ? Storage.getActiveWorkbenchSkin()
      : 'workbench_bg_1';
    if (!activeSkin || !String(activeSkin).startsWith('workbench_bg_')) {
      activeSkin = 'workbench_bg_1';
    }

    this.load.image(activeSkin, `assets/workbenches/${activeSkin}.webp`);
    if (activeSkin !== 'workbench_bg_1') {
      this.load.image('workbench_bg_1', 'assets/workbenches/workbench_bg_1.webp');
    }

    const loadedKeys = new Set();
    ARTIFACT_TEMPLATES.forEach((art) => {
      if (art.textureKey && !loadedKeys.has(art.textureKey)) {
        loadedKeys.add(art.textureKey);
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
