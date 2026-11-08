import { YandexSDK } from '../utils/YandexSDK.js';
import { Storage } from '../utils/Storage.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  async create() {
    try {
      await Promise.race([
        Promise.all([
          YandexSDK && YandexSDK.init ? YandexSDK.init() : Promise.resolve(),
          Storage && Storage.loadFromYandexCloud ? Storage.loadFromYandexCloud() : Promise.resolve()
        ]),
        new Promise((resolve) => setTimeout(resolve, 600))
      ]);
    } catch (e) {
      console.warn('SDK init bypass:', e);
    }

    const { width, height } = this.scale;

    this.createCinematicBackgrounds(width, height);
    this.createHDToolIcons();

    // Маски высокого разрешения
    this.createSmoothMask('mask_scraper', 80);
    this.createSmoothMask('mask_brush', 70);
    this.createSmoothMask('mask_solvent', 110);
    this.createSmoothMask('mask_glue', 55);
    this.createSmoothMask('mask_polish', 125);

    this.createAll35HDArtifacts();
    this.createHDShards();
    this.createHDUIElements();

    this.time.delayedCall(50, () => {
      this.scene.start('MenuScene');
    });
  }

  createCanvasTexture(key, width, height, drawCallback) {
    if (this.textures.exists(key)) {
      this.textures.remove(key);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    try {
      drawCallback(ctx, width, height);
    } catch (err) {
      console.warn(`Texture generation error [${key}]:`, err);
      ctx.fillStyle = '#c5a059';
      ctx.fillRect(width * 0.2, height * 0.2, width * 0.6, height * 0.6);
    }
    ctx.restore();

    this.textures.addCanvas(key, canvas);
  }

  createSmoothMask(key, radius) {
    this.createCanvasTexture(key, radius * 2, radius * 2, (ctx) => {
      const grad = ctx.createRadialGradient(radius, radius, radius * 0.35, radius, radius, radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  createCinematicBackgrounds(w, h) {
    for (let tier = 1; tier <= 4; tier++) {
      // ФОН ВЕРСТАКА (Четкое дерево, видимый зеленый раскроечный мат, мягкий свет)
      this.createCanvasTexture(`bg_workshop_tier_${tier}`, w, h, (ctx) => {
        // Задняя стена мастерской
        const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
        wallGrad.addColorStop(0, '#120d0b');
        wallGrad.addColorStop(1, '#241712');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(0, 0, w, h * 0.45);

        // Полка с инструментами и склянками пигментов
        ctx.fillStyle = '#160d08';
        ctx.fillRect(0, h * 0.12, w, 32);
        ctx.fillStyle = '#c5a059';
        ctx.fillRect(0, h * 0.12 + 28, w, 4);

        const colors = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'];
        colors.forEach((col, i) => {
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.45;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(80 + i * 110, h * 0.12 - 50, 42, 50, 6);
          else ctx.rect(80 + i * 110, h * 0.12 - 50, 42, 50);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });

        // Мореная дубовая столешница
        const tableY = h * 0.22;
        const woodGrad = ctx.createLinearGradient(0, tableY, 0, h);
        woodGrad.addColorStop(0, '#382318');
        woodGrad.addColorStop(0.3, '#22140d');
        woodGrad.addColorStop(1, '#110906');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, tableY, w, h - tableY);

        ctx.fillStyle = '#c5a059';
        ctx.fillRect(0, tableY, w, 6);

        // Раскроечный мат реставратора
        const matX = w * 0.06, matY = h * 0.18, matW = w * 0.88, matH = 1050;
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 45;
        ctx.shadowOffsetY = 25;

        const matGrad = ctx.createLinearGradient(matX, matY, matX, matY + matH);
        matGrad.addColorStop(0, '#1c2826');
        matGrad.addColorStop(1, '#0e1715');
        ctx.fillStyle = matGrad;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(matX, matY, matW, matH, 32);
        else ctx.rect(matX, matY, matW, matH);
        ctx.fill();
        ctx.restore();

        // Четкая координатная сетка
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.12)';
        ctx.lineWidth = 1.5;
        for (let gx = matX + 50; gx < matX + matW; gx += 60) {
          ctx.beginPath(); ctx.moveTo(gx, matY); ctx.lineTo(gx, matY + matH); ctx.stroke();
        }
        for (let gy = matY + 50; gy < matY + matH; gy += 60) {
          ctx.beginPath(); ctx.moveTo(matX, gy); ctx.lineTo(matX + matW, gy); ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(197, 160, 89, 0.75)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(matX, matY, matW, matH, 32);
        else ctx.rect(matX, matY, matW, matH);
        ctx.stroke();

        // Мягкий свет софита
        const lamp = ctx.createRadialGradient(w / 2, h * 0.44, 100, w / 2, h * 0.44, 750);
        lamp.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
        lamp.addColorStop(0.55, 'rgba(245, 158, 11, 0.05)');
        lamp.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = lamp;
        ctx.fillRect(0, 0, w, h);
      });

      // ФОН ЛАВКИ
      this.createCanvasTexture(`bg_antique_shop_tier_${tier}`, w, h, (ctx) => {
        const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
        wallGrad.addColorStop(0, '#2b1a13');
        wallGrad.addColorStop(0.6, '#180e09');
        wallGrad.addColorStop(1, '#0c0704');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#1e110b';
        ctx.fillRect(0, h * 0.85, w, h * 0.15);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = 3;
        for (let px = 0; px < w; px += 90) {
          ctx.beginPath(); ctx.moveTo(px, h * 0.85); ctx.lineTo(px, h); ctx.stroke();
        }

        [300, 650, 1000, 1350].forEach((y) => {
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.85)';
          ctx.shadowBlur = 30;
          ctx.shadowOffsetY = 15;
          ctx.fillStyle = '#3a2216';
          ctx.fillRect(36, y, w - 72, 38);
          ctx.restore();

          const goldTrim = ctx.createLinearGradient(36, y + 30, w - 36, y + 30);
          goldTrim.addColorStop(0, '#b45309');
          goldTrim.addColorStop(0.5, '#fef08a');
          goldTrim.addColorStop(1, '#b45309');
          ctx.fillStyle = goldTrim;
          ctx.fillRect(36, y + 30, w - 72, 8);
        });
      });
    }
  }

  createHDToolIcons() {
    this.createCanvasTexture('slot_scraper', 160, 240, (ctx) => {
      const handle = ctx.createLinearGradient(60, 100, 100, 100);
      handle.addColorStop(0, '#1f2937'); handle.addColorStop(0.5, '#374151'); handle.addColorStop(1, '#111827');
      ctx.fillStyle = handle;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(60, 100, 40, 125, 12); else ctx.rect(60, 100, 40, 125);
      ctx.fill();

      ctx.fillStyle = '#d97706';
      ctx.fillRect(55, 80, 50, 20);

      const blade = ctx.createLinearGradient(35, 80, 125, 15);
      blade.addColorStop(0, '#cbd5e1'); blade.addColorStop(0.5, '#ffffff'); blade.addColorStop(1, '#64748b');
      ctx.fillStyle = blade;
      ctx.beginPath(); ctx.moveTo(35, 80); ctx.lineTo(125, 80); ctx.lineTo(80, 15); ctx.closePath(); ctx.fill();
    });

    this.createCanvasTexture('slot_brush_soft', 160, 240, (ctx) => {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(70, 90, 20, 135, 8); else ctx.rect(70, 90, 20, 135);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(64, 72, 32, 18);

      const fur = ctx.createLinearGradient(50, 20, 110, 20);
      fur.addColorStop(0, '#92400e'); fur.addColorStop(0.5, '#f59e0b'); fur.addColorStop(1, '#78350f');
      ctx.fillStyle = fur;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(52, 20, 56, 52, 12); else ctx.rect(52, 20, 56, 52);
      ctx.fill();
    });

    this.createCanvasTexture('slot_solvent', 160, 240, (ctx) => {
      const body = ctx.createLinearGradient(45, 70, 115, 70);
      body.addColorStop(0, '#047857'); body.addColorStop(0.5, '#10b981'); body.addColorStop(1, '#065f46');
      ctx.fillStyle = body;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(44, 70, 72, 145, 18); else ctx.rect(44, 70, 72, 145);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(64, 32, 32, 38);
    });

    this.createCanvasTexture('slot_glue', 160, 240, (ctx) => {
      const tube = ctx.createLinearGradient(52, 210, 108, 210);
      tube.addColorStop(0, '#d97706'); tube.addColorStop(0.5, '#f59e0b'); tube.addColorStop(1, '#b45309');
      ctx.fillStyle = tube;
      ctx.beginPath(); ctx.moveTo(52, 210); ctx.lineTo(108, 210); ctx.lineTo(92, 75); ctx.lineTo(68, 75); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(70, 32, 20, 44);
    });

    this.createCanvasTexture('slot_polish', 160, 240, (ctx) => {
      const pad = ctx.createRadialGradient(80, 120, 10, 80, 120, 65);
      pad.addColorStop(0, '#c084fc'); pad.addColorStop(1, '#7e22ce');
      ctx.fillStyle = pad;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(36, 72, 88, 105, 26); else ctx.rect(36, 72, 88, 105);
      ctx.fill();
    });
  }

  createAll35HDArtifacts() {
    // 1. МАСКА ТУТАНХАМОНА (Высокое разрешение 600x800, музейная прорисовка)
    this.createCanvasTexture('art_egypt_mask', 600, 800, (ctx) => {
      ctx.save();
      // Мягкая внешняя тень
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 20;

      // Капюшон Немес с изогнутыми крыльями
      const gold = ctx.createLinearGradient(100, 140, 500, 660);
      gold.addColorStop(0, '#fef08a');
      gold.addColorStop(0.3, '#f59e0b');
      gold.addColorStop(0.7, '#d97706');
      gold.addColorStop(1, '#78350f');

      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.moveTo(140, 160);
      ctx.bezierCurveTo(220, 90, 380, 90, 460, 160);
      ctx.bezierCurveTo(550, 280, 530, 480, 490, 560);
      ctx.lineTo(430, 560);
      ctx.lineTo(420, 460);
      ctx.lineTo(180, 460);
      ctx.lineTo(170, 560);
      ctx.lineTo(110, 560);
      ctx.bezierCurveTo(70, 480, 50, 280, 140, 160);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Инкрустированные полосы лазурита с легким внутренним объемом
      ctx.fillStyle = '#1e3a8a';
      [180, 230, 280, 330, 380, 430, 480].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(100, y);
        ctx.lineTo(500, y);
        ctx.lineTo(492, y + 22);
        ctx.lineTo(108, y + 22);
        ctx.closePath();
        ctx.fill();
      });

      // Лицо фараона с анатомическим объемом
      const faceGrad = ctx.createRadialGradient(290, 320, 30, 300, 340, 120);
      faceGrad.addColorStop(0, '#fef08a');
      faceGrad.addColorStop(0.5, '#f59e0b');
      faceGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.moveTo(220, 240);
      ctx.bezierCurveTo(220, 200, 380, 200, 380, 240);
      ctx.bezierCurveTo(390, 350, 350, 440, 300, 450);
      ctx.bezierCurveTo(250, 440, 210, 350, 220, 240);
      ctx.closePath();
      ctx.fill();

      // Глаза Гора (миндалевидная форма с обводкой)
      ctx.fillStyle = '#0f172a';
      // Левый глаз
      ctx.beginPath();
      ctx.moveTo(244, 296); ctx.quadraticCurveTo(266, 280, 284, 296); ctx.quadraticCurveTo(266, 312, 244, 296); ctx.fill();
      // Правый глаз
      ctx.beginPath();
      ctx.moveTo(316, 296); ctx.quadraticCurveTo(334, 280, 356, 296); ctx.quadraticCurveTo(334, 312, 316, 296); ctx.fill();

      // Зрачки с бликами
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(266, 296, 4, 0, Math.PI * 2); ctx.arc(336, 296, 4, 0, Math.PI * 2); ctx.fill();

      // Нос и губы с тенями
      ctx.strokeStyle = '#b45309'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(300, 296); ctx.lineTo(294, 344); ctx.lineTo(308, 344); ctx.stroke();
      ctx.fillStyle = '#991b1b';
      ctx.beginPath(); ctx.ellipse(300, 370, 22, 8, 0, 0, Math.PI * 2); ctx.fill();

      // Плетеная бородка Осириса
      const beard = ctx.createLinearGradient(284, 450, 316, 600);
      beard.addColorStop(0, '#1e3a8a'); beard.addColorStop(0.5, '#f59e0b'); beard.addColorStop(1, '#0f172a');
      ctx.fillStyle = beard;
      ctx.beginPath();
      ctx.moveTo(288, 450); ctx.lineTo(312, 450); ctx.lineTo(308, 590); ctx.lineTo(292, 590); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 3; ctx.stroke();

      // Урей (священная кобра)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(300, 164, 16, 0, Math.PI * 2); ctx.fill();
    });

    // 2. ЗОЛОТОЙ СКАРАБЕЙ (600x800)
    this.createCanvasTexture('art_egypt_scarab', 600, 800, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 20;

      ctx.strokeStyle = '#997300'; ctx.lineWidth = 20; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(200, 260); ctx.lineTo(90, 180); ctx.lineTo(60, 220);
      ctx.moveTo(400, 260); ctx.lineTo(510, 180); ctx.lineTo(540, 220);
      ctx.moveTo(170, 400); ctx.lineTo(60, 410);
      ctx.moveTo(430, 400); ctx.lineTo(540, 410);
      ctx.moveTo(190, 540); ctx.lineTo(90, 640);
      ctx.moveTo(410, 540); ctx.lineTo(510, 640);
      ctx.stroke();

      const gold = ctx.createRadialGradient(270, 350, 40, 300, 420, 230);
      gold.addColorStop(0, '#fef08a'); gold.addColorStop(0.3, '#facc15'); gold.addColorStop(1, '#854d0e');
      ctx.fillStyle = gold;
      ctx.beginPath(); ctx.ellipse(300, 420, 170, 230, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(300, 170, 72, 0, Math.PI * 2); ctx.fill();

      const lapis = ctx.createRadialGradient(276, 370, 20, 300, 424, 130);
      lapis.addColorStop(0, '#3b82f6'); lapis.addColorStop(0.5, '#1d4ed8'); lapis.addColorStop(1, '#0f172a');
      ctx.fillStyle = lapis;
      ctx.beginPath(); ctx.ellipse(300, 424, 84, 136, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // 3. АНКХ (600x800)
    this.createCanvasTexture('art_egypt_ankh', 600, 800, (ctx) => {
      const bronze = ctx.createLinearGradient(140, 140, 460, 740);
      bronze.addColorStop(0, '#fef08a'); bronze.addColorStop(0.4, '#d97706'); bronze.addColorStop(1, '#78350f');
      ctx.strokeStyle = bronze; ctx.lineWidth = 52; ctx.beginPath(); ctx.arc(300, 260, 96, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = bronze;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(150, 370, 300, 56, 12);
        ctx.roundRect(272, 370, 56, 360, 12);
      } else {
        ctx.rect(150, 370, 300, 56);
        ctx.rect(272, 370, 56, 360);
      }
      ctx.fill();
    });

    // 4. БАСТЕТ (600x800)
    this.createCanvasTexture('art_egypt_cat', 600, 800, (ctx) => {
      const dark = ctx.createLinearGradient(120, 120, 480, 720);
      dark.addColorStop(0, '#292524'); dark.addColorStop(0.5, '#44403c'); dark.addColorStop(1, '#1c1917');
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.ellipse(300, 480, 130, 220, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(300, 260, 90, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(220, 240); ctx.lineTo(250, 140); ctx.lineTo(290, 200); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(380, 240); ctx.lineTo(350, 140); ctx.lineTo(310, 200); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(212, 280, 20, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(388, 280, 20, 0, Math.PI * 2); ctx.stroke();
    });

    // 5. КАНОПА (600x800)
    this.createCanvasTexture('art_egypt_canopic', 600, 800, (ctx) => {
      const alab = ctx.createLinearGradient(160, 160, 440, 680);
      alab.addColorStop(0, '#fef3c7'); alab.addColorStop(0.6, '#fde68a'); alab.addColorStop(1, '#d97706');
      ctx.fillStyle = alab;
      ctx.beginPath(); ctx.ellipse(300, 480, 150, 230, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(300, 230, 84, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(300, 230); ctx.lineTo(350, 256); ctx.lineTo(300, 276); ctx.closePath(); ctx.fill();
    });

    // ОСТАЛЬНЫЕ РЕГИОНЫ В 600x800
    this.createOtherRegionsHD(ctx => {});
  }

  createOtherRegionsHD() {
    // ГРЕЦИЯ: АМФОРА
    this.createCanvasTexture('art_greece_amphora', 600, 800, (ctx) => {
      const terra = ctx.createRadialGradient(260, 340, 40, 300, 400, 280);
      terra.addColorStop(0, '#ea580c'); terra.addColorStop(0.6, '#c2410c'); terra.addColorStop(1, '#7c2d12');
      ctx.fillStyle = terra;
      ctx.beginPath(); ctx.ellipse(300, 400, 184, 264, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9a3412'; ctx.fillRect(220, 96, 160, 104); ctx.fillRect(230, 640, 140, 48);
      ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 32;
      ctx.beginPath(); ctx.arc(176, 320, 92, Math.PI * 0.4, Math.PI * 1.5, true); ctx.stroke();
      ctx.beginPath(); ctx.arc(424, 320, 92, Math.PI * 1.5, Math.PI * 0.6, false); ctx.stroke();
      ctx.fillStyle = '#18181b'; ctx.fillRect(144, 350, 312, 84);
    });

    // ШЛЕМ
    this.createCanvasTexture('art_greece_helmet', 600, 800, (ctx) => {
      const metal = ctx.createLinearGradient(140, 140, 460, 600);
      metal.addColorStop(0, '#fef08a'); metal.addColorStop(0.4, '#d97706'); metal.addColorStop(1, '#451a03');
      ctx.fillStyle = metal;
      ctx.beginPath(); ctx.arc(300, 340, 210, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(140, 360, 104, 240); ctx.fillRect(356, 360, 104, 240); ctx.fillRect(276, 320, 48, 260);
      const crest = ctx.createLinearGradient(100, 80, 500, 80);
      crest.addColorStop(0, '#dc2626'); crest.addColorStop(1, '#991b1b');
      ctx.fillStyle = crest;
      ctx.beginPath(); ctx.moveTo(100, 140); ctx.lineTo(500, 140); ctx.lineTo(430, 60); ctx.lineTo(170, 60); ctx.closePath(); ctx.fill();
    });

    // ТЕТРАДРАХМА
    this.createCanvasTexture('art_greece_coin', 600, 800, (ctx) => {
      const silver = ctx.createRadialGradient(270, 370, 40, 300, 400, 240);
      silver.addColorStop(0, '#f8fafc'); silver.addColorStop(0.5, '#94a3b8'); silver.addColorStop(1, '#334155');
      ctx.fillStyle = silver;
      ctx.beginPath(); ctx.arc(300, 400, 236, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.beginPath(); ctx.ellipse(300, 410, 84, 120, 0, 0, Math.PI * 2); ctx.arc(300, 290, 76, 0, Math.PI * 2); ctx.fill();
    });

    // КИЛИК
    this.createCanvasTexture('art_greece_kylix', 600, 800, (ctx) => {
      ctx.fillStyle = '#18181b';
      ctx.beginPath(); ctx.arc(300, 360, 200, 0, Math.PI, false); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c2410c';
      ctx.beginPath(); ctx.arc(300, 360, 170, 0, Math.PI, false); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#18181b'; ctx.fillRect(284, 360, 32, 180);
      ctx.beginPath(); ctx.ellipse(300, 540, 120, 32, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#18181b'; ctx.lineWidth = 20;
      ctx.beginPath(); ctx.moveTo(110, 360); ctx.lineTo(50, 330); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(490, 360); ctx.lineTo(550, 330); ctx.stroke();
    });

    // ЩИТ ГОПЛИТА
    this.createCanvasTexture('art_greece_shield', 600, 800, (ctx) => {
      const bronze = ctx.createRadialGradient(300, 400, 20, 300, 400, 260);
      bronze.addColorStop(0, '#fef08a'); bronze.addColorStop(0.5, '#d97706'); bronze.addColorStop(1, '#451a03');
      ctx.fillStyle = bronze;
      ctx.beginPath(); ctx.arc(300, 400, 250, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.moveTo(300, 220); ctx.lineTo(420, 460); ctx.lineTo(370, 460); ctx.lineTo(300, 320); ctx.lineTo(230, 460); ctx.lineTo(180, 460); ctx.closePath(); ctx.fill();
    });

    // ЕВРОПА: МЕЧ
    this.createCanvasTexture('art_europe_sword', 600, 800, (ctx) => {
      const blade = ctx.createLinearGradient(270, 200, 330, 200);
      blade.addColorStop(0, '#94a3b8'); blade.addColorStop(0.5, '#ffffff'); blade.addColorStop(1, '#64748b');
      ctx.fillStyle = blade;
      ctx.beginPath(); ctx.moveTo(272, 200); ctx.lineTo(328, 200); ctx.lineTo(300, 750); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(160, 190, 280, 36, 10); else ctx.rect(160, 190, 280, 36);
      ctx.arc(300, 80, 32, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3e2723'; ctx.fillRect(284, 90, 32, 110);
    });

    // ПОТИР
    this.createCanvasTexture('art_europe_chalice', 600, 800, (ctx) => {
      const gold = ctx.createLinearGradient(140, 140, 460, 560);
      gold.addColorStop(0, '#fef08a'); gold.addColorStop(0.5, '#f59e0b'); gold.addColorStop(1, '#78350f');
      ctx.fillStyle = gold;
      ctx.beginPath(); ctx.arc(300, 280, 152, 0, Math.PI, false); ctx.closePath(); ctx.fill();
      ctx.fillRect(280, 280, 40, 260);
      ctx.beginPath(); ctx.ellipse(300, 560, 120, 36, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(300, 400, 18, 0, Math.PI * 2); ctx.fill();
    });

    // ЩИТ ТАРЧ
    this.createCanvasTexture('art_europe_shield', 600, 800, (ctx) => {
      const steel = ctx.createLinearGradient(100, 120, 500, 700);
      steel.addColorStop(0, '#e2e8f0'); steel.addColorStop(0.5, '#64748b'); steel.addColorStop(1, '#1e293b');
      ctx.fillStyle = steel;
      ctx.beginPath(); ctx.moveTo(100, 120); ctx.lineTo(500, 120); ctx.lineTo(500, 440); ctx.lineTo(300, 700); ctx.lineTo(100, 440); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.fillRect(270, 150, 60, 420); ctx.fillRect(160, 280, 280, 60);
      ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 12; ctx.stroke();
    });

    // КОРОНА
    this.createCanvasTexture('art_europe_crown', 600, 800, (ctx) => {
      const gold = ctx.createLinearGradient(120, 280, 480, 520);
      gold.addColorStop(0, '#fef08a'); gold.addColorStop(0.5, '#f59e0b'); gold.addColorStop(1, '#b45309');
      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.moveTo(120, 480); ctx.lineTo(120, 300); ctx.lineTo(210, 380); ctx.lineTo(300, 240); ctx.lineTo(390, 380); ctx.lineTo(480, 300); ctx.lineTo(480, 480); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(300, 240, 24, 0, Math.PI * 2); ctx.fill();
    });

    // МАНУСКРИПТ
    this.createCanvasTexture('art_europe_book', 600, 800, (ctx) => {
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(140, 180, 320, 440, 24); else ctx.rect(140, 180, 320, 440);
      ctx.fill();
      ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 8; ctx.strokeRect(164, 204, 272, 392);
      ctx.fillStyle = '#d4af37'; ctx.beginPath(); ctx.arc(300, 400, 48, 0, Math.PI * 2); ctx.fill();
    });

    // ЯПОНИЯ: КАТАНА
    this.createCanvasTexture('art_japan_katana', 600, 800, (ctx) => {
      const steel = ctx.createLinearGradient(280, 180, 320, 750);
      steel.addColorStop(0, '#f8fafc'); steel.addColorStop(0.5, '#94a3b8'); steel.addColorStop(1, '#475569');
      ctx.fillStyle = steel;
      ctx.beginPath(); ctx.moveTo(288, 180); ctx.lineTo(316, 180); ctx.lineTo(308, 710); ctx.lineTo(284, 750); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d4af37'; ctx.beginPath(); ctx.arc(300, 180, 48, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(284, 70, 32, 104, 6); else ctx.rect(284, 70, 32, 104);
      ctx.fill();
    });

    // МАСКА МЭНГУ
    this.createCanvasTexture('art_japan_mask', 600, 800, (ctx) => {
      const urushi = ctx.createRadialGradient(300, 360, 40, 300, 360, 200);
      urushi.addColorStop(0, '#ef4444'); urushi.addColorStop(0.6, '#991b1b'); urushi.addColorStop(1, '#450a0a');
      ctx.fillStyle = urushi;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(120, 280, 360, 240, 44); else ctx.rect(120, 280, 360, 240);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.moveTo(230, 410); ctx.lineTo(250, 410); ctx.lineTo(240, 460); ctx.moveTo(350, 410); ctx.lineTo(370, 410); ctx.lineTo(360, 460); ctx.fill();
    });

    // НЭЦКЭ
    this.createCanvasTexture('art_japan_netsuke', 600, 800, (ctx) => {
      const ivory = ctx.createRadialGradient(280, 360, 40, 300, 400, 180);
      ivory.addColorStop(0, '#ffffff'); ivory.addColorStop(0.6, '#f5f5f4'); ivory.addColorStop(1, '#d6d3d1');
      ctx.fillStyle = ivory;
      ctx.beginPath(); ctx.arc(300, 400, 192, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(276, 284, 18, 0, Math.PI * 2); ctx.arc(324, 284, 18, 0, Math.PI * 2); ctx.fill();
    });

    // КАБУТО
    this.createCanvasTexture('art_japan_kabuto', 600, 800, (ctx) => {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(300, 380, 170, Math.PI, 0, false); ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.arc(300, 220, 90, Math.PI * 0.2, Math.PI * 0.8, false); ctx.arc(300, 236, 76, Math.PI * 0.8, Math.PI * 0.2, true); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#991b1b'; ctx.fillRect(160, 380, 280, 60);
    });

    // ЧАША ТЭММОКУ
    this.createCanvasTexture('art_japan_tea', 600, 800, (ctx) => {
      const cer = ctx.createRadialGradient(300, 380, 20, 300, 420, 180);
      cer.addColorStop(0, '#1c1917'); cer.addColorStop(0.7, '#292524'); cer.addColorStop(1, '#0c0a09');
      ctx.fillStyle = cer;
      ctx.beginPath(); ctx.arc(300, 360, 180, 0, Math.PI, false); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#065f46'; ctx.beginPath(); ctx.ellipse(300, 360, 150, 36, 0, 0, Math.PI * 2); ctx.fill();
    });

    // МЕЗОАМЕРИКА: МАСКА ПАКАЛЯ
    this.createCanvasTexture('art_meso_mask', 600, 800, (ctx) => {
      const jade = ctx.createRadialGradient(280, 360, 40, 300, 400, 200);
      jade.addColorStop(0, '#34d399'); jade.addColorStop(0.6, '#059669'); jade.addColorStop(1, '#064e3b');
      ctx.fillStyle = jade;
      ctx.beginPath(); ctx.ellipse(300, 400, 150, 210, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.arc(230, 350, 36, 0, Math.PI * 2); ctx.arc(370, 350, 36, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(230, 350, 16, 0, Math.PI * 2); ctx.arc(370, 350, 16, 0, Math.PI * 2); ctx.fill();
    });

    // ДИСК ТОНАТИУ
    this.createCanvasTexture('art_meso_disk', 600, 800, (ctx) => {
      const stone = ctx.createRadialGradient(280, 380, 40, 300, 400, 240);
      stone.addColorStop(0, '#94a3b8'); stone.addColorStop(0.7, '#475569'); stone.addColorStop(1, '#1e293b');
      ctx.fillStyle = stone;
      ctx.beginPath(); ctx.arc(300, 400, 244, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 8; ctx.stroke();
    });

    // ОБСИДИАНОВЫЙ КИНЖАЛ
    this.createCanvasTexture('art_meso_dagger', 600, 800, (ctx) => {
      const obs = ctx.createLinearGradient(270, 200, 330, 720);
      obs.addColorStop(0, '#475569'); obs.addColorStop(0.4, '#0f172a'); obs.addColorStop(1, '#020617');
      ctx.fillStyle = obs;
      ctx.beginPath(); ctx.moveTo(270, 200); ctx.lineTo(330, 200); ctx.lineTo(300, 720); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(250, 90, 100, 120, 20); else ctx.rect(250, 90, 100, 120);
      ctx.fill();
    });

    // КУРИЛЬНИЦА
    this.createCanvasTexture('art_meso_pipe', 600, 800, (ctx) => {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(200, 220, 200, 360, 36); else ctx.rect(200, 220, 200, 360);
      ctx.fill();
      ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(300, 340, 70, 0, Math.PI * 2); ctx.fill();
    });

    // ПЕКТОРАЛЬ
    this.createCanvasTexture('art_meso_gold', 600, 800, (ctx) => {
      const gold = ctx.createRadialGradient(300, 380, 20, 300, 380, 220);
      gold.addColorStop(0, '#fef08a'); gold.addColorStop(0.5, '#f59e0b'); gold.addColorStop(1, '#78350f');
      ctx.fillStyle = gold;
      ctx.beginPath(); ctx.arc(300, 380, 210, 0, Math.PI, false); ctx.closePath(); ctx.fill();
    });

    // ВИКИНГИ: ТОПОР
    this.createCanvasTexture('art_viking_axe', 600, 800, (ctx) => {
      ctx.fillStyle = '#573016';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(284, 120, 32, 600, 12); else ctx.rect(284, 120, 32, 600);
      ctx.fill();
      const blade = ctx.createLinearGradient(140, 160, 320, 340);
      blade.addColorStop(0, '#f8fafc'); blade.addColorStop(0.5, '#94a3b8'); blade.addColorStop(1, '#475569');
      ctx.fillStyle = blade;
      ctx.beginPath(); ctx.moveTo(284, 160); ctx.lineTo(120, 220); ctx.lineTo(150, 400); ctx.lineTo(284, 300); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 4; ctx.stroke();
    });

    // РОГ
    this.createCanvasTexture('art_viking_horn', 600, 800, (ctx) => {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(300, 400, 190, Math.PI * 0.1, Math.PI * 0.9, false); ctx.lineTo(300, 400); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(460, 320, 40, 120);
    });

    // ФИБУЛА
    this.createCanvasTexture('art_viking_brooch', 600, 800, (ctx) => {
      ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 32;
      ctx.beginPath(); ctx.arc(300, 400, 150, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(180, 260); ctx.lineTo(420, 540); ctx.stroke();
    });

    // ШЛЕМ ИЗ ГЬЁРМУНДБЮ
    this.createCanvasTexture('art_viking_helmet', 600, 800, (ctx) => {
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.arc(300, 360, 170, Math.PI, 0, false); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#64748b'; ctx.fillRect(180, 350, 240, 90);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(250, 400, 32, 0, Math.PI * 2); ctx.arc(350, 400, 32, 0, Math.PI * 2); ctx.fill();
    });

    // АМУЛЕТ ВОРОНА
    this.createCanvasTexture('art_viking_raven', 600, 800, (ctx) => {
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath(); ctx.ellipse(300, 400, 110, 170, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(300, 290, 16, 0, Math.PI * 2); ctx.fill();
    });

    // КИТАЙ: ВАЗА ТАН
    this.createCanvasTexture('art_china_vase', 600, 800, (ctx) => {
      const cel = ctx.createRadialGradient(260, 340, 40, 300, 420, 260);
      cel.addColorStop(0, '#f0fdf4'); cel.addColorStop(0.7, '#bbf7d0'); cel.addColorStop(1, '#86efac');
      ctx.fillStyle = cel;
      ctx.beginPath(); ctx.ellipse(300, 440, 170, 220, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(250, 150, 100, 120);
      ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.ellipse(300, 420, 100, 80, 0, 0, Math.PI * 2); ctx.stroke();
    });

    // ДРАКОН
    this.createCanvasTexture('art_china_dragon', 600, 800, (ctx) => {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.arc(300, 400, 170, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.arc(300, 400, 120, Math.PI * 0.2, Math.PI * 1.8, false); ctx.stroke();
    });

    // БРОНЗОВОЕ ЗЕРКАЛО
    this.createCanvasTexture('art_china_mirror', 600, 800, (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.beginPath(); ctx.arc(300, 400, 170, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 10; ctx.stroke();
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(300, 400, 36, 0, Math.PI * 2); ctx.fill();
    });

    // ИСИНСКИЙ ЧАЙНИК
    this.createCanvasTexture('art_china_teapot', 600, 800, (ctx) => {
      ctx.fillStyle = '#831843';
      ctx.beginPath(); ctx.ellipse(300, 420, 170, 116, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(270, 290, 60, 36);
      ctx.strokeStyle = '#831843'; ctx.lineWidth = 28;
      ctx.beginPath(); ctx.arc(160, 410, 70, Math.PI * 0.5, Math.PI * 1.5, false); ctx.stroke();
    });

    // МОНЕТА КИТАЯ
    this.createCanvasTexture('art_china_coin', 600, 800, (ctx) => {
      ctx.fillStyle = '#b45309';
      ctx.beginPath(); ctx.arc(300, 400, 170, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0a0c10'; ctx.fillRect(264, 364, 72, 72);
    });
  }

  createHDShards() {
    this.createCanvasTexture('shard_scarab_wing', 120, 120, (ctx) => {
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.ellipse(60, 60, 44, 56, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#854d0e'; ctx.lineWidth = 4; ctx.stroke();
    });
    this.createCanvasTexture('shard_mask_beard', 100, 140, (ctx) => {
      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(30, 20, 40, 100);
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 4; ctx.strokeRect(30, 20, 40, 100);
    });
    this.createCanvasTexture('shard_cat_ear', 120, 120, (ctx) => {
      ctx.fillStyle = '#44403c'; ctx.beginPath(); ctx.moveTo(20, 100); ctx.lineTo(60, 20); ctx.lineTo(100, 100); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_amphora', 130, 140, (ctx) => {
      ctx.fillStyle = '#ea580c'; ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(110, 36); ctx.lineTo(90, 120); ctx.lineTo(30, 90); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_helmet_cheek', 120, 150, (ctx) => {
      ctx.fillStyle = '#d97706'; ctx.fillRect(30, 20, 60, 110);
    });
    this.createCanvasTexture('shard_kylix_handle', 120, 120, (ctx) => {
      ctx.strokeStyle = '#18181b'; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(60, 60, 40, 0, Math.PI, false); ctx.stroke();
    });
    this.createCanvasTexture('shard_sword_tip', 120, 150, (ctx) => {
      ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(30, 20); ctx.lineTo(90, 20); ctx.lineTo(60, 130); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_chalice_gem', 100, 100, (ctx) => {
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(50, 50, 30, 0, Math.PI * 2); ctx.fill();
    });
    this.createCanvasTexture('shard_crown_cross', 120, 120, (ctx) => {
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(50, 20, 20, 80); ctx.fillRect(20, 50, 80, 20);
    });
    this.createCanvasTexture('shard_katana_tsuba', 120, 120, (ctx) => {
      ctx.fillStyle = '#d4af37'; ctx.beginPath(); ctx.arc(60, 60, 40, 0, Math.PI, false); ctx.fill();
    });
    this.createCanvasTexture('shard_mask_fang', 100, 120, (ctx) => {
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(30, 30); ctx.lineTo(70, 30); ctx.lineTo(50, 100); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_kabuto_crest', 130, 130, (ctx) => {
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(64, 64, 48, Math.PI * 0.2, Math.PI * 0.8, false); ctx.fill();
    });
    this.createCanvasTexture('shard_jade_piece', 130, 130, (ctx) => {
      ctx.fillStyle = '#10b981'; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(20, 20, 90, 90, 16); else ctx.rect(20, 20, 90, 90);
      ctx.fill();
    });
    this.createCanvasTexture('shard_dagger_blade', 120, 150, (ctx) => {
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.moveTo(30, 20); ctx.lineTo(90, 20); ctx.lineTo(60, 130); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_axe_notch', 120, 120, (ctx) => {
      ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(90, 30); ctx.lineTo(70, 90); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_brooch_needle', 100, 140, (ctx) => {
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(50, 20); ctx.lineTo(50, 120); ctx.stroke();
    });
    this.createCanvasTexture('shard_china_neck', 130, 130, (ctx) => {
      ctx.fillStyle = '#bbf7d0'; ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(110, 30); ctx.lineTo(90, 110); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_china_lid', 110, 110, (ctx) => {
      ctx.fillStyle = '#831843'; ctx.beginPath(); ctx.arc(54, 54, 40, 0, Math.PI * 2); ctx.fill();
    });
  }

  createHDUIElements() {
    this.createCanvasTexture('icon_lock', 80, 80, (ctx) => {
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(40, 28, 18, Math.PI, 0, false); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(16, 32, 48, 40, 10); else ctx.rect(16, 32, 48, 40);
      ctx.fill();
    });
    this.createCanvasTexture('icon_star', 80, 80, (ctx) => {
      ctx.fillStyle = '#facc15'; ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = (i % 2 === 0) ? 34 : 16;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const x = 40 + r * Math.cos(angle);
        const y = 40 + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('particle_dust', 16, 16, (ctx) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(8, 8, 7, 0, Math.PI * 2); ctx.fill();
    });
    this.createCanvasTexture('icon_home', 80, 80, (ctx) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(40, 16); ctx.lineTo(12, 40); ctx.lineTo(68, 40); ctx.closePath(); ctx.fill();
      ctx.fillRect(22, 40, 36, 28);
    });
    this.createCanvasTexture('icon_speaker', 80, 80, (ctx) => {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(12, 28, 16, 24);
      ctx.beginPath(); ctx.moveTo(28, 28); ctx.lineTo(52, 12); ctx.lineTo(52, 68); ctx.lineTo(28, 52); ctx.closePath(); ctx.fill();
    });
  }
}
