import { YandexSDK } from '../utils/YandexSDK.js';
import { Storage } from '../utils/Storage.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  async create() {
    await YandexSDK.init();
    await Storage.loadFromYandexCloud();

    const { width, height } = this.scale;

    // 1. СОВРЕМЕННЫЕ НЕО-ФОНЫ
    this.createCinematicBackgrounds(width, height);

    // 2. ИКОНКИ ИНСТРУМЕНТОВ ЛОТКА
    this.createHDToolIcons();

    // 3. МАСКИ ДЛЯ ЧИСТКИ С МЯГКИМ СГЛАЖИВАНИЕМ
    this.createSmoothMask('mask_scraper', 36);
    this.createSmoothMask('mask_brush', 32);
    this.createSmoothMask('mask_solvent', 52);
    this.createSmoothMask('mask_glue', 24);
    this.createSmoothMask('mask_polish', 58);

    // 4. ВСЕ 15 HD-АРТЕФАКТОВ
    this.createAllHDArtifacts();
    this.createHDShards();
    this.createHDUIElements();

    this.scene.start('MenuScene');
  }

  createCanvasTexture(key, width, height, drawCallback) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawCallback(ctx, width, height);

    if (this.textures.exists(key)) {
      this.textures.remove(key);
    }
    this.textures.addCanvas(key, canvas);
  }

  createSmoothMask(key, radius) {
    this.createCanvasTexture(key, radius * 2, radius * 2, (ctx, w, h) => {
      const grad = ctx.createRadialGradient(radius, radius, radius * 0.4, radius, radius, radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  createCinematicBackgrounds(w, h) {
    // Современный минималистичный верстак реставратора
    for (let tier = 1; tier <= 4; tier++) {
      this.createCanvasTexture(`bg_workshop_tier_${tier}`, w, h, (ctx) => {
        const bgGrad = ctx.createRadialGradient(w / 2, h * 0.35, 40, w / 2, h * 0.45, h * 0.75);
        bgGrad.addColorStop(0, '#1a1e26');
        bgGrad.addColorStop(0.55, '#11141a');
        bgGrad.addColorStop(1, '#0a0c10');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        const tableY = h * 0.24;
        const tableGrad = ctx.createLinearGradient(0, tableY, 0, h);
        tableGrad.addColorStop(0, '#151921');
        tableGrad.addColorStop(1, '#0d1015');
        ctx.fillStyle = tableGrad;
        ctx.fillRect(0, tableY, w, h - tableY);

        const lineGrad = ctx.createLinearGradient(0, tableY, w, tableY);
        lineGrad.addColorStop(0, 'rgba(255,255,255,0)');
        lineGrad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
        lineGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = lineGrad;
        ctx.fillRect(0, tableY, w, 1);

        const padX = w * 0.06, padY = h * 0.17, padW = w * 0.88, padH = 450, r = 24;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;

        const padGrad = ctx.createLinearGradient(padX, padY, padX, padY + padH);
        padGrad.addColorStop(0, '#1c222c');
        padGrad.addColorStop(1, '#141820');
        ctx.fillStyle = padGrad;
        ctx.beginPath();
        ctx.roundRect(padX, padY, padW, padH, r);
        ctx.fill();
        ctx.restore();

        const strokeGrad = ctx.createLinearGradient(padX, padY, padX + padW, padY + padH);
        strokeGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        strokeGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
        strokeGrad.addColorStop(1, 'rgba(16, 185, 129, 0.25)');
        ctx.strokeStyle = strokeGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(padX, padY, padW, padH, r);
        ctx.stroke();

        const spot = ctx.createRadialGradient(w / 2, h * 0.42, 30, w / 2, h * 0.42, 320);
        spot.addColorStop(0, 'rgba(254, 243, 199, 0.12)');
        spot.addColorStop(0.5, 'rgba(245, 158, 11, 0.03)');
        spot.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, w, h);
      });
    }

    // Современная витрина лавки
    for (let tier = 1; tier <= 4; tier++) {
      this.createCanvasTexture(`bg_antique_shop_tier_${tier}`, w, h, (ctx) => {
        const bgGrad = ctx.createRadialGradient(w / 2, h * 0.4, 50, w / 2, h * 0.4, h * 0.7);
        bgGrad.addColorStop(0, '#181d26');
        bgGrad.addColorStop(1, '#0a0d12');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        [135, 290, 445, 600].forEach(y => {
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 24;
          ctx.shadowOffsetY = 12;
          ctx.fillStyle = '#1c222d';
          ctx.beginPath();
          ctx.roundRect(22, y, w - 44, 14, 7);
          ctx.fill();
          ctx.restore();

          const lightLine = ctx.createLinearGradient(22, y, w - 22, y);
          lightLine.addColorStop(0, 'rgba(245, 158, 11, 0.1)');
          lightLine.addColorStop(0.5, 'rgba(245, 158, 11, 0.6)');
          lightLine.addColorStop(1, 'rgba(245, 158, 11, 0.1)');
          ctx.fillStyle = lightLine;
          ctx.fillRect(22, y, w - 44, 2);
        });
      });
    }
  }

  createHDToolIcons() {
    // 1. Скребок
    this.createCanvasTexture('slot_scraper', 80, 120, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;

      const handle = ctx.createLinearGradient(30, 52, 50, 52);
      handle.addColorStop(0, '#2d3748');
      handle.addColorStop(1, '#1a202c');
      ctx.fillStyle = handle;
      ctx.beginPath();
      ctx.roundRect(30, 50, 20, 62, 8);
      ctx.fill();

      const blade = ctx.createLinearGradient(18, 42, 62, 8);
      blade.addColorStop(0, '#cbd5e1');
      blade.addColorStop(0.4, '#ffffff');
      blade.addColorStop(1, '#94a3b8');
      ctx.fillStyle = blade;
      ctx.beginPath();
      ctx.moveTo(18, 42); ctx.lineTo(62, 42); ctx.lineTo(40, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // 2. Археологическая кисть
    this.createCanvasTexture('slot_brush_soft', 80, 120, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(35, 45, 10, 68, 5);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(32, 36, 16, 9);

      const fur = ctx.createLinearGradient(25, 10, 55, 10);
      fur.addColorStop(0, '#b45309'); fur.addColorStop(0.5, '#fbbf24'); fur.addColorStop(1, '#78350f');
      ctx.fillStyle = fur;
      ctx.beginPath();
      ctx.roundRect(26, 10, 28, 26, 6);
      ctx.fill();
      ctx.restore();
    });

    // 3. Растворитель
    this.createCanvasTexture('slot_solvent', 80, 120, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;

      const body = ctx.createLinearGradient(22, 34, 58, 34);
      body.addColorStop(0, '#047857'); body.addColorStop(0.5, '#10b981'); body.addColorStop(1, '#065f46');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.roundRect(22, 34, 36, 72, 10);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(32, 16, 16, 18);
      ctx.restore();
    });

    // 4. Клей
    this.createCanvasTexture('slot_glue', 80, 120, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;

      const tube = ctx.createLinearGradient(26, 105, 54, 105);
      tube.addColorStop(0, '#d97706'); tube.addColorStop(0.5, '#f59e0b'); tube.addColorStop(1, '#b45309');
      ctx.fillStyle = tube;
      ctx.beginPath();
      ctx.moveTo(26, 105); ctx.lineTo(54, 105); ctx.lineTo(46, 38); ctx.lineTo(34, 38);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(35, 16, 10, 22);
      ctx.restore();
    });

    // 5. Замша
    this.createCanvasTexture('slot_polish', 80, 120, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;

      const pad = ctx.createRadialGradient(40, 60, 5, 40, 60, 32);
      pad.addColorStop(0, '#c084fc'); pad.addColorStop(1, '#7e22ce');
      ctx.fillStyle = pad;
      ctx.beginPath();
      ctx.roundRect(18, 36, 44, 52, 14);
      ctx.fill();
      ctx.restore();
    });
  }

  createAllHDArtifacts() {
    // 1. ЕГИПЕТ: ЗОЛОТОЙ СКАРАБЕЙ
    this.createCanvasTexture('art_egypt_scarab', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 8;

      ctx.strokeStyle = '#997300';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(100, 130); ctx.lineTo(45, 90); ctx.lineTo(30, 110);
      ctx.moveTo(200, 130); ctx.lineTo(255, 90); ctx.lineTo(270, 110);
      ctx.moveTo(85, 200); ctx.lineTo(30, 205);
      ctx.moveTo(215, 200); ctx.lineTo(270, 205);
      ctx.moveTo(95, 270); ctx.lineTo(45, 320);
      ctx.moveTo(205, 270); ctx.lineTo(255, 320);
      ctx.stroke();
      ctx.restore();

      const goldBody = ctx.createRadialGradient(135, 175, 20, 150, 210, 115);
      goldBody.addColorStop(0, '#fef08a');
      goldBody.addColorStop(0.3, '#facc15');
      goldBody.addColorStop(0.7, '#ca8a04');
      goldBody.addColorStop(1, '#854d0e');

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = goldBody;
      ctx.beginPath();
      ctx.ellipse(150, 210, 85, 115, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = goldBody;
      ctx.beginPath();
      ctx.arc(150, 85, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(125, 68); ctx.lineTo(135, 50); ctx.lineTo(142, 68);
      ctx.moveTo(144, 62); ctx.lineTo(150, 42); ctx.lineTo(156, 62);
      ctx.moveTo(158, 68); ctx.lineTo(165, 50); ctx.lineTo(175, 68);
      ctx.fill();

      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(150, 120); ctx.lineTo(150, 322);
      ctx.stroke();

      const lapis = ctx.createRadialGradient(138, 185, 10, 150, 212, 65);
      lapis.addColorStop(0, '#3b82f6');
      lapis.addColorStop(0.4, '#1d4ed8');
      lapis.addColorStop(0.8, '#1e3a8a');
      lapis.addColorStop(1, '#0f172a');

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = lapis;
      ctx.beginPath();
      ctx.ellipse(150, 212, 42, 68, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(138, 180, 2.5, 0, Math.PI * 2);
      ctx.arc(162, 205, 2, 0, Math.PI * 2);
      ctx.arc(144, 245, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.ellipse(136, 175, 8, 24, -Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. ЕГИПЕТ: МАСКА ТУТАНХАМОНА
    this.createCanvasTexture('art_egypt_mask', 300, 400, (ctx) => {
      const nemes = ctx.createLinearGradient(40, 80, 260, 310);
      nemes.addColorStop(0, '#1e3a8a');
      nemes.addColorStop(1, '#0f172a');
      ctx.fillStyle = nemes;
      ctx.beginPath();
      ctx.moveTo(50, 80); ctx.lineTo(250, 80); ctx.lineTo(270, 260);
      ctx.lineTo(220, 310); ctx.lineTo(80, 310); ctx.lineTo(30, 260);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#facc15';
      for (let y = 96; y < 290; y += 26) ctx.fillRect(45, y, 210, 13);

      const face = ctx.createRadialGradient(140, 165, 15, 150, 180, 75);
      face.addColorStop(0, '#fef08a'); face.addColorStop(0.5, '#f59e0b'); face.addColorStop(1, '#b45309');
      ctx.fillStyle = face;
      ctx.beginPath();
      ctx.ellipse(150, 180, 52, 68, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(142, 248, 16, 56);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.strokeRect(142, 248, 16, 56);
    });

    // 3. ЕГИПЕТ: ОБРЯДОВЫЙ АНКХ
    this.createCanvasTexture('art_egypt_ankh', 300, 400, (ctx) => {
      const bronze = ctx.createLinearGradient(70, 70, 230, 370);
      bronze.addColorStop(0, '#fef08a'); bronze.addColorStop(0.4, '#d97706'); bronze.addColorStop(1, '#78350f');

      ctx.strokeStyle = bronze;
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(150, 130, 48, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = bronze;
      ctx.beginPath();
      ctx.roundRect(75, 185, 150, 28, 6);
      ctx.roundRect(136, 185, 28, 180, 6);
      ctx.fill();
    });

    // 4. ГРЕЦИЯ: АТТИЧЕСКАЯ АМФОРА
    this.createCanvasTexture('art_greece_amphora', 300, 400, (ctx) => {
      const terra = ctx.createRadialGradient(130, 170, 20, 150, 200, 140);
      terra.addColorStop(0, '#ea580c'); terra.addColorStop(0.6, '#c2410c'); terra.addColorStop(1, '#7c2d12');
      ctx.fillStyle = terra;
      ctx.beginPath();
      ctx.ellipse(150, 200, 92, 132, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#9a3412';
      ctx.fillRect(110, 48, 80, 52);
      ctx.fillRect(115, 320, 70, 24);

      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(88, 160, 46, Math.PI * 0.4, Math.PI * 1.5, true);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(212, 160, 46, Math.PI * 1.5, Math.PI * 0.6, false);
      ctx.stroke();

      ctx.fillStyle = '#18181b';
      ctx.fillRect(72, 175, 156, 42);
    });

    // 5. ГРЕЦИЯ: КОРИНФСКИЙ ШЛЕМ
    this.createCanvasTexture('art_greece_helmet', 300, 400, (ctx) => {
      const metal = ctx.createLinearGradient(70, 70, 230, 300);
      metal.addColorStop(0, '#fef08a'); metal.addColorStop(0.4, '#d97706'); metal.addColorStop(1, '#451a03');
      ctx.fillStyle = metal;
      ctx.beginPath();
      ctx.arc(150, 170, 105, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(70, 180, 52, 120);
      ctx.fillRect(178, 180, 52, 120);
      ctx.fillRect(138, 160, 24, 130);

      const crest = ctx.createLinearGradient(50, 40, 250, 40);
      crest.addColorStop(0, '#dc2626'); crest.addColorStop(1, '#991b1b');
      ctx.fillStyle = crest;
      ctx.beginPath();
      ctx.moveTo(50, 70); ctx.lineTo(250, 70); ctx.lineTo(215, 30); ctx.lineTo(85, 30);
      ctx.closePath();
      ctx.fill();
    });

    // 6. ГРЕЦИЯ: ТЕТРАДРАХМА
    this.createCanvasTexture('art_greece_coin', 300, 400, (ctx) => {
      const silver = ctx.createRadialGradient(135, 185, 20, 150, 200, 120);
      silver.addColorStop(0, '#f8fafc'); silver.addColorStop(0.5, '#94a3b8'); silver.addColorStop(1, '#334155');
      ctx.fillStyle = silver;
      ctx.beginPath();
      ctx.arc(150, 200, 118, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(150, 205, 42, 60, 0, 0, Math.PI * 2);
      ctx.arc(150, 145, 38, 0, Math.PI * 2);
      ctx.fill();
    });

    // 7. ЕВРОПА: ЩИТ
    this.createCanvasTexture('art_europe_shield', 300, 400, (ctx) => {
      const steel = ctx.createLinearGradient(50, 60, 250, 350);
      steel.addColorStop(0, '#e2e8f0'); steel.addColorStop(0.5, '#64748b'); steel.addColorStop(1, '#1e293b');
      ctx.fillStyle = steel;
      ctx.beginPath();
      ctx.moveTo(50, 60); ctx.lineTo(250, 60); ctx.lineTo(250, 220);
      ctx.lineTo(150, 350); ctx.lineTo(50, 220);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(135, 75, 30, 210);
      ctx.fillRect(80, 140, 140, 30);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 6;
      ctx.stroke();
    });

    // 8. ЕВРОПА: МЕЧ КРЕСТОНОСЦА
    this.createCanvasTexture('art_europe_sword', 300, 400, (ctx) => {
      const blade = ctx.createLinearGradient(135, 100, 165, 100);
      blade.addColorStop(0, '#94a3b8'); blade.addColorStop(0.5, '#ffffff'); blade.addColorStop(1, '#64748b');
      ctx.fillStyle = blade;
      ctx.beginPath();
      ctx.moveTo(136, 100); ctx.lineTo(164, 100); ctx.lineTo(150, 375);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.roundRect(80, 95, 140, 18, 5);
      ctx.arc(150, 40, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(142, 45, 16, 55);
    });

    // 9. ЕВРОПА: ГОТИЧЕСКИЙ ПОТИР
    this.createCanvasTexture('art_europe_chalice', 300, 400, (ctx) => {
      const gold = ctx.createLinearGradient(70, 70, 230, 280);
      gold.addColorStop(0, '#fef08a'); gold.addColorStop(0.5, '#f59e0b'); gold.addColorStop(1, '#78350f');
      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.arc(150, 140, 76, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();

      ctx.fillRect(140, 140, 20, 130);
      ctx.beginPath();
      ctx.ellipse(150, 280, 60, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(150, 200, 9, 0, Math.PI * 2);
      ctx.fill();
    });

    // 10. ЯПОНИЯ: КАТАНА
    this.createCanvasTexture('art_japan_katana', 300, 400, (ctx) => {
      const steel = ctx.createLinearGradient(140, 90, 160, 375);
      steel.addColorStop(0, '#f8fafc'); steel.addColorStop(0.5, '#94a3b8'); steel.addColorStop(1, '#475569');
      ctx.fillStyle = steel;
      ctx.beginPath();
      ctx.moveTo(144, 90); ctx.lineTo(158, 90); ctx.lineTo(154, 355); ctx.lineTo(142, 375);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(146, 95);
      for (let y = 100; y < 350; y += 20) {
        ctx.quadraticCurveTo(148, y + 10, 145, y + 20);
      }
      ctx.stroke();

      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(150, 90, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(142, 35, 16, 52, 3);
      ctx.fill();
    });

    // 11. ЯПОНИЯ: МАСКА МЭНГУ
    this.createCanvasTexture('art_japan_mask', 300, 400, (ctx) => {
      const urushi = ctx.createRadialGradient(150, 180, 20, 150, 180, 100);
      urushi.addColorStop(0, '#ef4444'); urushi.addColorStop(0.6, '#991b1b'); urushi.addColorStop(1, '#450a0a');
      ctx.fillStyle = urushi;
      ctx.beginPath();
      ctx.roundRect(60, 140, 180, 120, 22);
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(115, 205); ctx.lineTo(125, 205); ctx.lineTo(120, 230);
      ctx.moveTo(175, 205); ctx.lineTo(185, 205); ctx.lineTo(180, 230);
      ctx.fill();
    });

    // 12. ЯПОНИЯ: НЭЦКЭ «ДРАКОН»
    this.createCanvasTexture('art_japan_netsuke', 300, 400, (ctx) => {
      const ivory = ctx.createRadialGradient(140, 180, 20, 150, 200, 90);
      ivory.addColorStop(0, '#ffffff'); ivory.addColorStop(0.6, '#f5f5f4'); ivory.addColorStop(1, '#d6d3d1');
      ctx.fillStyle = ivory;
      ctx.beginPath();
      ctx.arc(150, 200, 96, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(138, 142, 9, 0, Math.PI * 2);
      ctx.arc(162, 142, 9, 0, Math.PI * 2);
      ctx.fill();
    });

    // 13. МЕЗОАМЕРИКА: НЕФРИТОВАЯ МАСКА МАЙЯ
    this.createCanvasTexture('art_meso_mask', 300, 400, (ctx) => {
      const jade = ctx.createRadialGradient(140, 180, 20, 150, 200, 100);
      jade.addColorStop(0, '#34d399'); jade.addColorStop(0.6, '#059669'); jade.addColorStop(1, '#064e3b');
      ctx.fillStyle = jade;
      ctx.beginPath();
      ctx.ellipse(150, 200, 75, 105, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(115, 175, 18, 0, Math.PI * 2);
      ctx.arc(185, 175, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(115, 175, 8, 0, Math.PI * 2);
      ctx.arc(185, 175, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 14. МЕЗОАМЕРИКА: СОЛЯРНЫЙ ДИСК
    this.createCanvasTexture('art_meso_disk', 300, 400, (ctx) => {
      const stone = ctx.createRadialGradient(140, 190, 20, 150, 200, 120);
      stone.addColorStop(0, '#94a3b8'); stone.addColorStop(0.7, '#475569'); stone.addColorStop(1, '#1e293b');
      ctx.fillStyle = stone;
      ctx.beginPath();
      ctx.arc(150, 200, 122, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.stroke();
    });

    // 15. МЕЗОАМЕРИКА: ОБСИДИАНОВЫЙ КИНЖАЛ
    this.createCanvasTexture('art_meso_dagger', 300, 400, (ctx) => {
      const obsidian = ctx.createLinearGradient(135, 100, 165, 360);
      obsidian.addColorStop(0, '#475569'); obsidian.addColorStop(0.4, '#0f172a'); obsidian.addColorStop(1, '#020617');
      ctx.fillStyle = obsidian;
      ctx.beginPath();
      ctx.moveTo(135, 100); ctx.lineTo(165, 100); ctx.lineTo(150, 360);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(125, 45, 50, 60, 10);
      ctx.fill();
    });
  }

  createHDShards() {
    this.createCanvasTexture('shard_amphora', 65, 70, (ctx) => {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(10, 10); ctx.lineTo(55, 18); ctx.lineTo(45, 60); ctx.lineTo(15, 45);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    this.createCanvasTexture('shard_scarab_wing', 60, 60, (ctx) => {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(30, 30, 22, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    this.createCanvasTexture('shard_sword_tip', 60, 75, (ctx) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(15, 10); ctx.lineTo(45, 10); ctx.lineTo(30, 65);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    this.createCanvasTexture('shard_jade_piece', 65, 65, (ctx) => {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(10, 10, 45, 45, 8);
      ctx.fill();
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  createHDUIElements() {
    this.createCanvasTexture('icon_lock', 40, 40, (ctx) => {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(20, 14, 9, Math.PI, 0, false);
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(8, 16, 24, 20, 5);
      ctx.fill();
    });

    this.createCanvasTexture('icon_star', 40, 40, (ctx) => {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = (i % 2 === 0) ? 17 : 8;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const x = 20 + r * Math.cos(angle);
        const y = 20 + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    });

    this.createCanvasTexture('particle_dust', 8, 8, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    this.createCanvasTexture('icon_home', 40, 40, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(20, 8); ctx.lineTo(6, 20); ctx.lineTo(34, 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(11, 20, 18, 14);
    });

    this.createCanvasTexture('icon_speaker', 40, 40, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 14, 8, 12);
      ctx.beginPath();
      ctx.moveTo(14, 14); ctx.lineTo(26, 6); ctx.lineTo(26, 34); ctx.lineTo(14, 26);
      ctx.closePath();
      ctx.fill();
    });
  }
}
