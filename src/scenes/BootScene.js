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

    this.createSmoothMask('mask_scraper', 42);
    this.createSmoothMask('mask_brush', 36);
    this.createSmoothMask('mask_solvent', 56);
    this.createSmoothMask('mask_glue', 28);
    this.createSmoothMask('mask_polish', 64);

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
    // 1. ФОН КАБИНЕТА (Для Главного меню и Карты экспедиций)
    this.createCanvasTexture('bg_main_cabinet', w, h, (ctx) => {
      const bgGrad = ctx.createRadialGradient(w / 2, h * 0.4, 40, w / 2, h * 0.5, h * 0.75);
      bgGrad.addColorStop(0, '#1c1f26');
      bgGrad.addColorStop(0.6, '#101318');
      bgGrad.addColorStop(1, '#090a0d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(197, 160, 89, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, w - 24, h - 24);
    });

    // 2. ФОН ВЕРСТАКА (Только для RestoreScene)
    for (let tier = 1; tier <= 4; tier++) {
      this.createCanvasTexture(`bg_workshop_tier_${tier}`, w, h, (ctx) => {
        const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.35);
        wallGrad.addColorStop(0, '#14171d');
        wallGrad.addColorStop(1, '#1b2029');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(0, 0, w, h * 0.35);

        const tableY = h * 0.22;
        const woodGrad = ctx.createLinearGradient(0, tableY, 0, h);
        woodGrad.addColorStop(0, '#2e1c12');
        woodGrad.addColorStop(0.4, '#1c100a');
        woodGrad.addColorStop(1, '#0d0704');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, tableY, w, h - tableY);

        ctx.fillStyle = '#c5a059';
        ctx.fillRect(0, tableY, w, 3);

        const matX = w * 0.05, matY = h * 0.17, matW = w * 0.90, matH = 460;
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 15;

        const matGrad = ctx.createLinearGradient(matX, matY, matX, matY + matH);
        matGrad.addColorStop(0, '#1a2723');
        matGrad.addColorStop(1, '#0e1714');
        ctx.fillStyle = matGrad;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(matX, matY, matW, matH, 18); else ctx.rect(matX, matY, matW, matH);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = 'rgba(52, 211, 153, 0.1)';
        ctx.lineWidth = 1;
        for (let gx = matX + 25; gx < matX + matW; gx += 28) {
          ctx.beginPath(); ctx.moveTo(gx, matY); ctx.lineTo(gx, matY + matH); ctx.stroke();
        }
        for (let gy = matY + 25; gy < matY + matH; gy += 28) {
          ctx.beginPath(); ctx.moveTo(matX, gy); ctx.lineTo(matX + matW, gy); ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(197, 160, 89, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(matX, matY, matW, matH, 18); else ctx.rect(matX, matY, matW, matH);
        ctx.stroke();

        const lamp = ctx.createRadialGradient(w / 2, h * 0.42, 40, w / 2, h * 0.42, 320);
        lamp.addColorStop(0, 'rgba(254, 240, 138, 0.18)');
        lamp.addColorStop(0.55, 'rgba(245, 158, 11, 0.04)');
        lamp.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = lamp;
        ctx.fillRect(0, 0, w, h);
      });

      // 3. ФОН ЛАВКИ
      this.createCanvasTexture(`bg_antique_shop_tier_${tier}`, w, h, (ctx) => {
        const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
        wallGrad.addColorStop(0, '#241610');
        wallGrad.addColorStop(0.6, '#150d09');
        wallGrad.addColorStop(1, '#0a0604');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#160d08';
        ctx.fillRect(0, h * 0.85, w, h * 0.15);

        [125, 275, 425, 575].forEach((y) => {
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.85)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetY = 10;
          ctx.fillStyle = '#3a2216';
          ctx.fillRect(16, y, w - 32, 18);
          ctx.restore();

          const goldTrim = ctx.createLinearGradient(16, y + 14, w - 16, y + 14);
          goldTrim.addColorStop(0, '#b45309');
          goldTrim.addColorStop(0.5, '#fef08a');
          goldTrim.addColorStop(1, '#b45309');
          ctx.fillStyle = goldTrim;
          ctx.fillRect(16, y + 14, w - 32, 4);
        });
      });
    }
  }

  createHDToolIcons() {
    this.createCanvasTexture('slot_scraper', 80, 120, (ctx) => {
      const handle = ctx.createLinearGradient(30, 50, 50, 50);
      handle.addColorStop(0, '#1f2937'); handle.addColorStop(0.5, '#374151'); handle.addColorStop(1, '#111827');
      ctx.fillStyle = handle;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(30, 50, 20, 62, 6); else ctx.rect(30, 50, 20, 62);
      ctx.fill();

      ctx.fillStyle = '#d97706'; ctx.fillRect(27, 40, 26, 10);

      const blade = ctx.createLinearGradient(18, 40, 62, 8);
      blade.addColorStop(0, '#cbd5e1'); blade.addColorStop(0.5, '#ffffff'); blade.addColorStop(1, '#64748b');
      ctx.fillStyle = blade;
      ctx.beginPath(); ctx.moveTo(18, 40); ctx.lineTo(62, 40); ctx.lineTo(40, 8); ctx.closePath(); ctx.fill();
    });

    this.createCanvasTexture('slot_brush_soft', 80, 120, (ctx) => {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(35, 45, 10, 68, 4); else ctx.rect(35, 45, 10, 68);
      ctx.fill();

      ctx.fillStyle = '#f59e0b'; ctx.fillRect(32, 36, 16, 9);

      const fur = ctx.createLinearGradient(26, 10, 54, 10);
      fur.addColorStop(0, '#92400e'); fur.addColorStop(0.5, '#f59e0b'); fur.addColorStop(1, '#78350f');
      ctx.fillStyle = fur;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(26, 10, 28, 26, 6); else ctx.rect(26, 10, 28, 26);
      ctx.fill();
    });

    this.createCanvasTexture('slot_solvent', 80, 120, (ctx) => {
      const body = ctx.createLinearGradient(22, 35, 58, 35);
      body.addColorStop(0, '#047857'); body.addColorStop(0.5, '#10b981'); body.addColorStop(1, '#065f46');
      ctx.fillStyle = body;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(22, 35, 36, 72, 9); else ctx.rect(22, 35, 36, 72);
      ctx.fill();

      ctx.fillStyle = '#0f172a'; ctx.fillRect(32, 16, 16, 19);
    });

    this.createCanvasTexture('slot_glue', 80, 120, (ctx) => {
      const tube = ctx.createLinearGradient(26, 105, 54, 105);
      tube.addColorStop(0, '#d97706'); tube.addColorStop(0.5, '#f59e0b'); tube.addColorStop(1, '#b45309');
      ctx.fillStyle = tube;
      ctx.beginPath(); ctx.moveTo(26, 105); ctx.lineTo(54, 105); ctx.lineTo(46, 38); ctx.lineTo(34, 38); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#ef4444'; ctx.fillRect(35, 16, 10, 22);
    });

    this.createCanvasTexture('slot_polish', 80, 120, (ctx) => {
      const pad = ctx.createRadialGradient(40, 60, 5, 40, 60, 32);
      pad.addColorStop(0, '#c084fc'); pad.addColorStop(1, '#7e22ce');
      ctx.fillStyle = pad;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(18, 36, 44, 52, 13); else ctx.rect(18, 36, 44, 52);
      ctx.fill();
    });
  }

  createAll35HDArtifacts() {
    // -------------------------------------------------------------
    // 1. ДРЕВНИЙ ЕГИПЕТ
    // -------------------------------------------------------------
    this.createCanvasTexture('art_egypt_mask', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const gold = ctx.createLinearGradient(50, 70, 250, 330);
      gold.addColorStop(0, '#fef08a'); gold.addColorStop(0.3, '#f59e0b'); gold.addColorStop(0.7, '#d97706'); gold.addColorStop(1, '#78350f');
      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.moveTo(70, 80); ctx.bezierCurveTo(110, 45, 190, 45, 230, 80);
      ctx.bezierCurveTo(275, 140, 265, 240, 245, 280); ctx.lineTo(215, 280); ctx.lineTo(210, 230);
      ctx.lineTo(90, 230); ctx.lineTo(85, 280); ctx.lineTo(55, 280); ctx.bezierCurveTo(35, 240, 25, 140, 70, 80);
      ctx.closePath(); ctx.fill(); ctx.restore();

      ctx.fillStyle = '#1e3a8a';
      [90, 115, 140, 165, 190, 215, 240].forEach((y) => {
        ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(250, y); ctx.lineTo(246, y + 11); ctx.lineTo(54, y + 11); ctx.closePath(); ctx.fill();
      });

      const faceGrad = ctx.createRadialGradient(145, 160, 15, 150, 170, 60);
      faceGrad.addColorStop(0, '#fef08a'); faceGrad.addColorStop(0.6, '#f59e0b'); faceGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.moveTo(110, 120); ctx.bezierCurveTo(110, 100, 190, 100, 190, 120);
      ctx.bezierCurveTo(195, 175, 175, 220, 150, 225); ctx.bezierCurveTo(125, 220, 105, 175, 110, 120); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.moveTo(122, 148); ctx.quadraticCurveTo(133, 140, 142, 148); ctx.quadraticCurveTo(133, 156, 122, 148); ctx.fill();
      ctx.beginPath(); ctx.moveTo(158, 148); ctx.quadraticCurveTo(167, 140, 178, 148); ctx.quadraticCurveTo(167, 156, 158, 148); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(133, 148, 2.5, 0, Math.PI * 2); ctx.arc(168, 148, 2.5, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(150, 148); ctx.lineTo(147, 172); ctx.lineTo(154, 172); ctx.stroke();
      ctx.fillStyle = '#991b1b'; ctx.beginPath(); ctx.ellipse(150, 185, 11, 4, 0, 0, Math.PI * 2); ctx.fill();

      const beard = ctx.createLinearGradient(142, 225, 158, 295);
      beard.addColorStop(0, '#1e3a8a'); beard.addColorStop(0.5, '#f59e0b'); beard.addColorStop(1, '#0f172a');
      ctx.fillStyle = beard;
      ctx.beginPath(); ctx.moveTo(144, 225); ctx.lineTo(156, 225); ctx.lineTo(154, 295); ctx.lineTo(146, 295); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(150, 82, 8, 0, Math.PI * 2); ctx.fill();
    });

    this.createCanvasTexture('art_egypt_scarab', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const goldLegs = ctx.createLinearGradient(40, 80, 260, 340);
      goldLegs.addColorStop(0, '#fef08a'); goldLegs.addColorStop(0.5, '#ca8a04'); goldLegs.addColorStop(1, '#713f12');
      ctx.strokeStyle = goldLegs; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(115, 140); ctx.lineTo(60, 95); ctx.lineTo(40, 110);
      ctx.moveTo(185, 140); ctx.lineTo(240, 95); ctx.lineTo(260, 110);
      ctx.moveTo(105, 205); ctx.lineTo(45, 200); ctx.lineTo(35, 230);
      ctx.moveTo(195, 205); ctx.lineTo(255, 200); ctx.lineTo(265, 230);
      ctx.moveTo(115, 280); ctx.lineTo(55, 335); ctx.lineTo(75, 360);
      ctx.moveTo(185, 280); ctx.lineTo(245, 335); ctx.lineTo(225, 360);
      ctx.stroke();

      const bodyGrad = ctx.createRadialGradient(135, 185, 20, 150, 220, 110);
      bodyGrad.addColorStop(0, '#fef08a'); bodyGrad.addColorStop(0.4, '#eab308'); bodyGrad.addColorStop(0.8, '#a16207'); bodyGrad.addColorStop(1, '#451a03');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.ellipse(150, 225, 78, 105, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(150, 105, 36, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(126, 88); ctx.lineTo(135, 68); ctx.lineTo(142, 88);
      ctx.moveTo(144, 84); ctx.lineTo(150, 62); ctx.lineTo(156, 84);
      ctx.moveTo(158, 88); ctx.lineTo(165, 68); ctx.lineTo(174, 88);
      ctx.fill();

      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(150, 140); ctx.lineTo(150, 328); ctx.stroke();

      const lapis = ctx.createRadialGradient(138, 205, 8, 150, 225, 55);
      lapis.addColorStop(0, '#60a5fa'); lapis.addColorStop(0.3, '#2563eb'); lapis.addColorStop(0.7, '#1e3a8a'); lapis.addColorStop(1, '#0f172a');
      ctx.fillStyle = lapis;
      ctx.beginPath(); ctx.ellipse(150, 225, 38, 58, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.restore();
    });

    this.createCanvasTexture('art_egypt_ankh', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const bronze = ctx.createLinearGradient(70, 60, 230, 370);
      bronze.addColorStop(0, '#fef08a'); bronze.addColorStop(0.3, '#d97706'); bronze.addColorStop(0.7, '#92400e'); bronze.addColorStop(1, '#451a03');

      ctx.strokeStyle = bronze; ctx.lineWidth = 28;
      ctx.beginPath(); ctx.ellipse(150, 130, 46, 56, 0, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = bronze;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(72, 186, 156, 28, 6);
        ctx.roundRect(136, 186, 28, 184, 6);
      } else {
        ctx.rect(72, 186, 156, 28);
        ctx.rect(136, 186, 28, 184);
      }
      ctx.fill();

      const ruby = ctx.createRadialGradient(146, 196, 3, 150, 200, 16);
      ruby.addColorStop(0, '#f87171'); ruby.addColorStop(0.5, '#dc2626'); ruby.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = ruby;
      ctx.beginPath(); ctx.arc(150, 200, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    });

    this.createCanvasTexture('art_egypt_cat', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 12;
      const basalt = ctx.createRadialGradient(130, 160, 20, 150, 230, 140);
      basalt.addColorStop(0, '#3f3f46'); basalt.addColorStop(0.5, '#27272a'); basalt.addColorStop(1, '#09090b');
      ctx.fillStyle = basalt;
      ctx.beginPath();
      ctx.moveTo(115, 360); ctx.bezierCurveTo(80, 360, 85, 270, 110, 220);
      ctx.bezierCurveTo(115, 175, 125, 145, 130, 120);
      ctx.lineTo(118, 70); ctx.lineTo(142, 95);
      ctx.bezierCurveTo(146, 92, 154, 92, 158, 95);
      ctx.lineTo(182, 70); ctx.lineTo(170, 120);
      ctx.bezierCurveTo(175, 145, 185, 175, 190, 220);
      ctx.bezierCurveTo(215, 270, 220, 360, 185, 360);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(150, 165, 32, Math.PI * 0.15, Math.PI * 0.85, false); ctx.stroke();
      ctx.beginPath(); ctx.arc(150, 175, 36, Math.PI * 0.2, Math.PI * 0.8, false); ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.ellipse(138, 125, 7, 4, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(162, 125, 7, 4, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(138, 125, 2, 0, Math.PI * 2); ctx.arc(162, 125, 2, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(120, 105, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(180, 105, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });

    this.createCanvasTexture('art_egypt_canopic', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const alab = ctx.createLinearGradient(90, 100, 220, 360);
      alab.addColorStop(0, '#fef9c3'); alab.addColorStop(0.3, '#fde68a'); alab.addColorStop(0.7, '#d97706'); alab.addColorStop(1, '#78350f');
      ctx.fillStyle = alab;
      ctx.beginPath();
      ctx.moveTo(110, 160); ctx.bezierCurveTo(70, 210, 75, 310, 105, 350);
      ctx.lineTo(195, 350); ctx.bezierCurveTo(225, 310, 230, 210, 190, 160);
      ctx.closePath(); ctx.fill();

      ctx.beginPath(); ctx.arc(150, 120, 42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath(); ctx.moveTo(150, 118); ctx.lineTo(178, 130); ctx.lineTo(150, 140); ctx.closePath(); ctx.fill();

      ctx.fillStyle = 'rgba(69, 26, 3, 0.65)';
      for (let y = 200; y < 330; y += 30) {
        ctx.fillRect(135, y, 30, 3);
        ctx.fillRect(142, y + 8, 16, 12);
      }
      ctx.restore();
    });

    // -------------------------------------------------------------
    // 2. АНТИЧНАЯ ГРЕЦИЯ
    // -------------------------------------------------------------
    this.createCanvasTexture('art_greece_amphora', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const terra = ctx.createRadialGradient(130, 180, 20, 150, 220, 140);
      terra.addColorStop(0, '#fb923c'); terra.addColorStop(0.5, '#ea580c'); terra.addColorStop(0.8, '#c2410c'); terra.addColorStop(1, '#431407');
      ctx.fillStyle = terra;
      ctx.beginPath();
      ctx.moveTo(115, 60); ctx.lineTo(185, 60); ctx.lineTo(175, 110);
      ctx.bezierCurveTo(240, 140, 245, 270, 185, 335);
      ctx.lineTo(170, 355); ctx.lineTo(130, 355); ctx.lineTo(115, 335);
      ctx.bezierCurveTo(55, 270, 60, 140, 125, 110);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#431407'; ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(125, 95); ctx.bezierCurveTo(75, 110, 70, 195, 110, 205); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(175, 95); ctx.bezierCurveTo(225, 110, 230, 195, 190, 205); ctx.stroke();

      ctx.fillStyle = '#0f172a'; ctx.fillRect(80, 180, 140, 65);
      ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 85; x < 215; x += 16) {
        ctx.moveTo(x, 184); ctx.lineTo(x + 10, 184); ctx.lineTo(x + 10, 192); ctx.lineTo(x + 4, 192);
      }
      ctx.stroke(); ctx.restore();
    });

    this.createCanvasTexture('art_greece_helmet', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const crest = ctx.createLinearGradient(60, 30, 240, 70);
      crest.addColorStop(0, '#b91c1c'); crest.addColorStop(0.5, '#ef4444'); crest.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = crest;
      ctx.beginPath();
      ctx.moveTo(60, 95); ctx.bezierCurveTo(80, 25, 220, 25, 240, 95);
      ctx.lineTo(215, 95); ctx.bezierCurveTo(195, 45, 105, 45, 85, 95);
      ctx.closePath(); ctx.fill();

      const bronze = ctx.createLinearGradient(70, 70, 230, 310);
      bronze.addColorStop(0, '#fef08a'); bronze.addColorStop(0.4, '#d97706'); bronze.addColorStop(0.8, '#92400e'); bronze.addColorStop(1, '#451a03');
      ctx.fillStyle = bronze;
      ctx.beginPath();
      ctx.arc(150, 160, 85, Math.PI, 0, false);
      ctx.lineTo(235, 270); ctx.lineTo(195, 285); ctx.lineTo(168, 220);
      ctx.lineTo(150, 275); ctx.lineTo(132, 220); ctx.lineTo(105, 285); ctx.lineTo(65, 270);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.moveTo(90, 175); ctx.lineTo(135, 175); ctx.lineTo(132, 215); ctx.lineTo(95, 205); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(165, 175); ctx.lineTo(210, 175); ctx.lineTo(205, 205); ctx.lineTo(168, 215); ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    this.createCanvasTexture('art_greece_coin', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
      const silver = ctx.createRadialGradient(135, 180, 20, 150, 200, 110);
      silver.addColorStop(0, '#ffffff'); silver.addColorStop(0.5, '#cbd5e1'); silver.addColorStop(0.8, '#64748b'); silver.addColorStop(1, '#1e293b');
      ctx.fillStyle = silver;
      ctx.beginPath();
      ctx.moveTo(150, 85); ctx.bezierCurveTo(255, 80, 265, 160, 260, 215);
      ctx.bezierCurveTo(255, 295, 230, 315, 150, 315); ctx.bezierCurveTo(65, 320, 40, 270, 42, 200);
      ctx.bezierCurveTo(45, 110, 85, 90, 150, 85); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.ellipse(150, 220, 38, 55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath(); ctx.arc(136, 175, 14, 0, Math.PI * 2); ctx.arc(164, 175, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(136, 175, 6, 0, Math.PI * 2); ctx.arc(164, 175, 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    this.createCanvasTexture('art_greece_kylix', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const terra = ctx.createLinearGradient(50, 130, 250, 240);
      terra.addColorStop(0, '#c2410c'); terra.addColorStop(0.5, '#ea580c'); terra.addColorStop(1, '#7c2d12');
      ctx.fillStyle = '#18181b';
      ctx.beginPath(); ctx.arc(150, 190, 95, 0, Math.PI, false); ctx.closePath(); ctx.fill();
      ctx.fillStyle = terra;
      ctx.beginPath(); ctx.arc(150, 190, 80, 0, Math.PI, false); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#18181b'; ctx.fillRect(144, 190, 12, 80);
      ctx.beginPath(); ctx.ellipse(150, 270, 52, 14, 0, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#18181b'; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(60, 190); ctx.bezierCurveTo(20, 175, 25, 230, 65, 215); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(240, 190); ctx.bezierCurveTo(280, 175, 275, 230, 235, 215); ctx.stroke();
      ctx.restore();
    });

    this.createCanvasTexture('art_greece_shield', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 12;
      const bronze = ctx.createRadialGradient(130, 180, 20, 150, 200, 125);
      bronze.addColorStop(0, '#fef08a'); bronze.addColorStop(0.4, '#d97706'); bronze.addColorStop(0.75, '#92400e'); bronze.addColorStop(1, '#291004');
      ctx.fillStyle = bronze;
      ctx.beginPath(); ctx.arc(150, 200, 118, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 8; ctx.stroke();

      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(150, 115); ctx.lineTo(205, 245); ctx.lineTo(182, 245);
      ctx.lineTo(150, 168); ctx.lineTo(118, 245); ctx.lineTo(95, 245);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    // -------------------------------------------------------------
    // 3. СРЕДНЕВЕКОВАЯ ЕВРОПА
    // -------------------------------------------------------------
    this.createCanvasTexture('art_europe_sword', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const steel = ctx.createLinearGradient(135, 100, 165, 100);
      steel.addColorStop(0, '#94a3b8'); steel.addColorStop(0.4, '#f8fafc'); steel.addColorStop(0.6, '#cbd5e1'); steel.addColorStop(1, '#475569');
      ctx.fillStyle = steel;
      ctx.beginPath(); ctx.moveTo(138, 100); ctx.lineTo(162, 100); ctx.lineTo(150, 375); ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#334155'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(150, 105); ctx.lineTo(150, 310); ctx.stroke();

      const brass = ctx.createLinearGradient(70, 95, 230, 95);
      brass.addColorStop(0, '#ca8a04'); brass.addColorStop(0.5, '#fef08a'); brass.addColorStop(1, '#854d0e');
      ctx.fillStyle = brass;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(80, 95, 140, 18, 5); else ctx.rect(80, 95, 140, 18);
      ctx.fill();

      ctx.fillStyle = '#3e2723'; ctx.fillRect(143, 48, 14, 48);
      ctx.fillStyle = brass;
      ctx.beginPath(); ctx.arc(150, 42, 16, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    this.createCanvasTexture('art_europe_chalice', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const gold = ctx.createLinearGradient(80, 70, 220, 300);
      gold.addColorStop(0, '#fef08a'); gold.addColorStop(0.4, '#eab308'); gold.addColorStop(0.8, '#a16207'); gold.addColorStop(1, '#581c87');
      ctx.fillStyle = gold;
      ctx.beginPath(); ctx.arc(150, 145, 72, 0, Math.PI, false); ctx.closePath(); ctx.fill();
      ctx.fillRect(142, 145, 16, 125);
      ctx.beginPath(); ctx.ellipse(150, 205, 22, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(150, 280, 65, 18, 0, 0, Math.PI * 2); ctx.fill();

      const ruby = ctx.createRadialGradient(147, 142, 2, 150, 145, 10);
      ruby.addColorStop(0, '#f87171'); ruby.addColorStop(0.5, '#dc2626'); ruby.addColorStop(1, '#450a0a');
      ctx.fillStyle = ruby;
      ctx.beginPath(); ctx.arc(150, 145, 9, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    this.createCanvasTexture('art_europe_shield', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 12;
      const steel = ctx.createLinearGradient(50, 70, 250, 340);
      steel.addColorStop(0, '#f8fafc'); steel.addColorStop(0.5, '#64748b'); steel.addColorStop(1, '#1e293b');
      ctx.fillStyle = steel;
      ctx.beginPath();
      ctx.moveTo(60, 70); ctx.lineTo(210, 70); ctx.bezierCurveTo(240, 75, 245, 105, 225, 125);
      ctx.lineTo(240, 145); ctx.lineTo(240, 220); ctx.lineTo(150, 345); ctx.lineTo(60, 220);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(138, 75, 24, 230); ctx.fillRect(75, 140, 150, 24);
      ctx.restore();
    });

    this.createCanvasTexture('art_europe_crown', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const gold = ctx.createLinearGradient(60, 120, 240, 260);
      gold.addColorStop(0, '#fef08a'); gold.addColorStop(0.4, '#eab308'); gold.addColorStop(0.8, '#a16207'); gold.addColorStop(1, '#451a03');
      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.moveTo(60, 240); ctx.lineTo(60, 160); ctx.lineTo(95, 190); ctx.lineTo(125, 140);
      ctx.lineTo(150, 105); ctx.lineTo(175, 140); ctx.lineTo(205, 190); ctx.lineTo(240, 160); ctx.lineTo(240, 240);
      ctx.closePath(); ctx.fill();

      const gems = ['#3b82f6', '#10b981', '#ef4444', '#10b981', '#3b82f6'];
      gems.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(85 + i * 32, 215, 7, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = gold;
      ctx.fillRect(145, 75, 10, 32); ctx.fillRect(136, 85, 28, 9);
      ctx.restore();
    });

    this.createCanvasTexture('art_europe_book', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 12;
      const leather = ctx.createRadialGradient(140, 190, 30, 150, 200, 120);
      leather.addColorStop(0, '#581c87'); leather.addColorStop(0.6, '#3b0764'); leather.addColorStop(1, '#1e053a');
      ctx.fillStyle = leather;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(70, 85, 160, 230, 12); else ctx.rect(70, 85, 160, 230);
      ctx.fill();

      ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 4;
      ctx.strokeRect(82, 97, 136, 206);
      ctx.fillStyle = '#d4af37';
      ctx.beginPath(); ctx.arc(150, 200, 28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3b0764'; ctx.beginPath(); ctx.arc(150, 200, 16, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // -------------------------------------------------------------
    // 4. ФЕОДАЛЬНАЯ ЯПОНИЯ
    // -------------------------------------------------------------
    this.createCanvasTexture('art_japan_katana', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const steel = ctx.createLinearGradient(135, 90, 165, 370);
      steel.addColorStop(0, '#ffffff'); steel.addColorStop(0.4, '#cbd5e1'); steel.addColorStop(1, '#475569');
      ctx.fillStyle = steel;
      ctx.beginPath();
      ctx.moveTo(144, 90); ctx.bezierCurveTo(154, 180, 150, 300, 138, 370);
      ctx.lineTo(148, 360); ctx.bezierCurveTo(162, 290, 164, 180, 156, 90);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(146, 95);
      for (let y = 100; y < 350; y += 18) {
        ctx.quadraticCurveTo(150, y + 9, 146, y + 18);
      }
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.ellipse(150, 90, 26, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 1.5; ctx.stroke();

      ctx.fillStyle = '#0f172a'; ctx.fillRect(143, 30, 14, 58);
      ctx.restore();
    });

    this.createCanvasTexture('art_japan_mask', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const urushi = ctx.createRadialGradient(140, 190, 20, 150, 200, 100);
      urushi.addColorStop(0, '#ef4444'); urushi.addColorStop(0.5, '#991b1b'); urushi.addColorStop(1, '#450a0a');
      ctx.fillStyle = urushi;
      ctx.beginPath();
      ctx.moveTo(70, 150); ctx.bezierCurveTo(90, 130, 210, 130, 230, 150);
      ctx.lineTo(225, 220); ctx.bezierCurveTo(220, 275, 175, 290, 150, 295);
      ctx.bezierCurveTo(125, 290, 80, 275, 75, 220);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.ellipse(150, 225, 45, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(125, 215); ctx.lineTo(133, 235); ctx.lineTo(141, 215);
      ctx.moveTo(159, 215); ctx.lineTo(167, 235); ctx.lineTo(175, 215);
      ctx.fill();

      ctx.fillStyle = '#1c1917';
      [275, 295, 315].forEach((y, i) => {
        ctx.fillRect(95 - i * 8, y, 110 + i * 16, 12);
      });
      ctx.restore();
    });

    this.createCanvasTexture('art_japan_netsuke', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
      const ivory = ctx.createRadialGradient(135, 185, 20, 150, 200, 95);
      ivory.addColorStop(0, '#ffffff'); ivory.addColorStop(0.5, '#fef08a'); ivory.addColorStop(0.85, '#d4d4d8'); ivory.addColorStop(1, '#71717a');
      ctx.fillStyle = ivory;
      ctx.beginPath(); ctx.arc(150, 200, 92, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#a1a1aa'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(150, 200, 60, Math.PI * 0.2, Math.PI * 1.7, false); ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(138, 150, 5, 0, Math.PI * 2); ctx.arc(162, 150, 5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    this.createCanvasTexture('art_japan_kabuto', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const iron = ctx.createLinearGradient(70, 120, 230, 260);
      iron.addColorStop(0, '#475569'); iron.addColorStop(0.5, '#1e293b'); iron.addColorStop(1, '#020617');
      ctx.fillStyle = iron;
      ctx.beginPath(); ctx.arc(150, 195, 82, Math.PI, 0, false); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(150, 115, 52, Math.PI * 0.2, Math.PI * 0.8, false);
      ctx.arc(150, 125, 44, Math.PI * 0.8, Math.PI * 0.2, true);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#991b1b';
      [195, 215, 235, 255].forEach((y, i) => {
        ctx.fillRect(80 - i * 6, y, 140 + i * 12, 14);
      });
      ctx.restore();
    });

    this.createCanvasTexture('art_japan_tea', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const glazed = ctx.createRadialGradient(150, 180, 10, 150, 200, 90);
      glazed.addColorStop(0, '#1c1917'); glazed.addColorStop(0.6, '#0f172a'); glazed.addColorStop(1, '#020617');
      ctx.fillStyle = glazed;
      ctx.beginPath(); ctx.arc(150, 185, 88, 0, Math.PI, false); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#15803d';
      ctx.beginPath(); ctx.ellipse(150, 185, 75, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // -------------------------------------------------------------
    // 5. МЕЗОАМЕРИКА
    // -------------------------------------------------------------
    this.createCanvasTexture('art_meso_mask', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const jade = ctx.createRadialGradient(135, 175, 20, 150, 200, 105);
      jade.addColorStop(0, '#6ee7b7'); jade.addColorStop(0.4, '#10b981'); jade.addColorStop(0.8, '#047857'); jade.addColorStop(1, '#064e3b');
      ctx.fillStyle = jade;
      ctx.beginPath();
      ctx.moveTo(105, 120); ctx.bezierCurveTo(110, 85, 190, 85, 195, 120);
      ctx.bezierCurveTo(205, 180, 190, 270, 150, 290);
      ctx.bezierCurveTo(110, 270, 95, 180, 105, 120);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#064e3b'; ctx.lineWidth = 1.5;
      for (let y = 110; y < 275; y += 22) {
        ctx.beginPath(); ctx.moveTo(110, y); ctx.lineTo(190, y); ctx.stroke();
      }

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.ellipse(132, 175, 11, 7, -0.15, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(168, 175, 11, 7, 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#020617';
      ctx.beginPath(); ctx.arc(134, 175, 4, 0, Math.PI * 2); ctx.arc(166, 175, 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    this.createCanvasTexture('art_meso_disk', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const basalt = ctx.createRadialGradient(135, 185, 20, 150, 200, 120);
      basalt.addColorStop(0, '#94a3b8'); basalt.addColorStop(0.5, '#475569'); basalt.addColorStop(1, '#0f172a');
      ctx.fillStyle = basalt;
      ctx.beginPath(); ctx.arc(150, 200, 116, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(150, 200, 90, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(150, 200, 60, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(150, 200, 32, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    this.createCanvasTexture('art_meso_dagger', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const obs = ctx.createLinearGradient(135, 100, 165, 360);
      obs.addColorStop(0, '#64748b'); obs.addColorStop(0.3, '#1e293b'); obs.addColorStop(1, '#020617');
      ctx.fillStyle = obs;
      ctx.beginPath();
      ctx.moveTo(136, 110); ctx.lineTo(164, 110); ctx.lineTo(150, 360);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(125, 45, 50, 68, 10); else ctx.rect(125, 45, 50, 68);
      ctx.fill();
      ctx.restore();
    });

    this.createCanvasTexture('art_meso_pipe', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(95, 120, 110, 175, 18); else ctx.rect(95, 120, 110, 175);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      for (let y = 140; y < 270; y += 28) {
        ctx.beginPath(); ctx.arc(85, y, 16, 0, Math.PI * 2); ctx.arc(215, y, 16, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    });

    this.createCanvasTexture('art_meso_gold', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const gold = ctx.createLinearGradient(50, 120, 250, 280);
      gold.addColorStop(0, '#fef08a'); gold.addColorStop(0.5, '#f59e0b'); gold.addColorStop(1, '#78350f');
      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.arc(150, 160, 105, 0, Math.PI, false); ctx.lineTo(150, 290);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    // -------------------------------------------------------------
    // 6. ЭПОХА ВИКИНГОВ
    // -------------------------------------------------------------
    this.createCanvasTexture('art_viking_axe', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(142, 60, 16, 305, 6); else ctx.rect(142, 60, 16, 305);
      ctx.fill();

      const steel = ctx.createLinearGradient(60, 90, 160, 210);
      steel.addColorStop(0, '#f8fafc'); steel.addColorStop(0.5, '#94a3b8'); steel.addColorStop(1, '#334155');
      ctx.fillStyle = steel;
      ctx.beginPath();
      ctx.moveTo(142, 85); ctx.lineTo(60, 115); ctx.bezierCurveTo(65, 165, 80, 205, 142, 160);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(110, 135, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });

    this.createCanvasTexture('art_viking_horn', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const horn = ctx.createLinearGradient(70, 120, 240, 280);
      horn.addColorStop(0, '#27272a'); horn.addColorStop(0.6, '#18181b'); horn.addColorStop(1, '#09090b');
      ctx.fillStyle = horn;
      ctx.beginPath();
      ctx.moveTo(80, 160); ctx.bezierCurveTo(120, 120, 210, 140, 235, 230);
      ctx.bezierCurveTo(240, 275, 190, 310, 135, 300);
      ctx.bezierCurveTo(180, 260, 190, 210, 80, 190);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#cbd5e1'; ctx.fillRect(70, 155, 22, 42);
      ctx.restore();
    });

    this.createCanvasTexture('art_viking_brooch', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const bronze = ctx.createRadialGradient(140, 185, 20, 150, 200, 85);
      bronze.addColorStop(0, '#fef08a'); bronze.addColorStop(0.5, '#d97706'); bronze.addColorStop(1, '#78350f');
      ctx.strokeStyle = bronze; ctx.lineWidth = 18;
      ctx.beginPath(); ctx.arc(150, 200, 72, Math.PI * 0.15, Math.PI * 1.85, false); ctx.stroke();

      const steel = ctx.createLinearGradient(85, 120, 215, 280);
      steel.addColorStop(0, '#ffffff'); steel.addColorStop(1, '#475569');
      ctx.strokeStyle = steel; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(85, 120); ctx.lineTo(215, 280); ctx.stroke();
      ctx.restore();
    });

    this.createCanvasTexture('art_viking_helmet', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 12;
      const iron = ctx.createLinearGradient(70, 120, 230, 270);
      iron.addColorStop(0, '#64748b'); iron.addColorStop(0.5, '#334155'); iron.addColorStop(1, '#0f172a');
      ctx.fillStyle = iron;
      ctx.beginPath();
      ctx.moveTo(65, 205); ctx.bezierCurveTo(75, 110, 225, 110, 235, 205);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(85, 195, 130, 50, 8); else ctx.rect(85, 195, 130, 50);
      ctx.fill();

      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath(); ctx.arc(120, 220, 14, 0, Math.PI * 2); ctx.arc(180, 220, 14, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    this.createCanvasTexture('art_viking_raven', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
      const silver = ctx.createLinearGradient(110, 110, 190, 310);
      silver.addColorStop(0, '#f8fafc'); silver.addColorStop(0.5, '#94a3b8'); silver.addColorStop(1, '#334155');
      ctx.fillStyle = silver;
      ctx.beginPath(); ctx.ellipse(150, 210, 52, 85, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(150, 155, 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // -------------------------------------------------------------
    // 7. ИМПЕРАТОРСКИЙ КИТАЙ
    // -------------------------------------------------------------
    this.createCanvasTexture('art_china_vase', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const celadon = ctx.createRadialGradient(130, 175, 20, 150, 220, 130);
      celadon.addColorStop(0, '#f0fdf4'); celadon.addColorStop(0.4, '#bbf7d0'); celadon.addColorStop(0.8, '#4ade80'); celadon.addColorStop(1, '#15803d');
      ctx.fillStyle = celadon;
      ctx.beginPath();
      ctx.moveTo(125, 75); ctx.lineTo(175, 75); ctx.lineTo(168, 130);
      ctx.bezierCurveTo(245, 170, 240, 290, 180, 340);
      ctx.lineTo(120, 340); ctx.bezierCurveTo(60, 290, 55, 170, 132, 130);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(150, 235, 45, 0, Math.PI * 1.6, false); ctx.stroke();
      ctx.restore();
    });

    this.createCanvasTexture('art_china_dragon', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const jade = ctx.createRadialGradient(135, 185, 20, 150, 200, 95);
      jade.addColorStop(0, '#ffffff'); jade.addColorStop(0.5, '#dcfce7'); jade.addColorStop(0.8, '#86efac'); jade.addColorStop(1, '#16a34a');
      ctx.fillStyle = jade;
      ctx.beginPath(); ctx.arc(150, 200, 88, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(150, 200, 42, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#059669'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(150, 200, 65, Math.PI * 0.2, Math.PI * 1.8, false); ctx.stroke();
      ctx.restore();
    });

    this.createCanvasTexture('art_china_mirror', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const bronze = ctx.createRadialGradient(135, 185, 20, 150, 200, 95);
      bronze.addColorStop(0, '#fef08a'); bronze.addColorStop(0.4, '#d97706'); bronze.addColorStop(0.8, '#78350f'); bronze.addColorStop(1, '#271711');
      ctx.fillStyle = bronze;
      ctx.beginPath(); ctx.arc(150, 200, 88, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(150, 200, 20, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(150, 200, 62, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });

    this.createCanvasTexture('art_china_teapot', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
      const clay = ctx.createRadialGradient(135, 200, 20, 150, 220, 90);
      clay.addColorStop(0, '#9f1239'); clay.addColorStop(0.6, '#881337'); clay.addColorStop(1, '#4c0519');
      ctx.fillStyle = clay;
      ctx.beginPath(); ctx.ellipse(150, 220, 84, 58, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(150, 164, 38, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(150, 148, 10, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#881337'; ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(85, 215); ctx.bezierCurveTo(45, 195, 55, 255, 80, 245); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(215, 215); ctx.bezierCurveTo(255, 200, 260, 160, 235, 155); ctx.stroke();
      ctx.restore();
    });

    this.createCanvasTexture('art_china_coin', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
      const copper = ctx.createRadialGradient(135, 185, 20, 150, 200, 95);
      copper.addColorStop(0, '#fef08a'); copper.addColorStop(0.4, '#b45309'); copper.addColorStop(0.8, '#78350f'); copper.addColorStop(1, '#1c1917');
      ctx.fillStyle = copper;
      ctx.beginPath(); ctx.arc(150, 200, 88, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#0f172a'; ctx.fillRect(132, 182, 36, 36);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(146, 130, 8, 28);
      ctx.fillRect(146, 242, 8, 28);
      ctx.fillRect(80, 196, 28, 8);
      ctx.fillRect(192, 196, 28, 8);
      ctx.restore();
    });
  }

  createHDShards() {
    this.createCanvasTexture('shard_scarab_wing', 60, 60, (ctx) => {
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.ellipse(30, 30, 22, 28, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#854d0e'; ctx.lineWidth = 2; ctx.stroke();
    });
    this.createCanvasTexture('shard_mask_beard', 50, 70, (ctx) => {
      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(15, 10, 20, 50);
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2; ctx.strokeRect(15, 10, 20, 50);
    });
    this.createCanvasTexture('shard_cat_ear', 60, 60, (ctx) => {
      ctx.fillStyle = '#44403c'; ctx.beginPath(); ctx.moveTo(10, 50); ctx.lineTo(30, 10); ctx.lineTo(50, 50); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_amphora', 65, 70, (ctx) => {
      ctx.fillStyle = '#ea580c'; ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(55, 18); ctx.lineTo(45, 60); ctx.lineTo(15, 45); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_helmet_cheek', 60, 75, (ctx) => {
      ctx.fillStyle = '#d97706'; ctx.fillRect(15, 10, 30, 55);
    });
    this.createCanvasTexture('shard_kylix_handle', 60, 60, (ctx) => {
      ctx.strokeStyle = '#18181b'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(30, 30, 20, 0, Math.PI, false); ctx.stroke();
    });
    this.createCanvasTexture('shard_sword_tip', 60, 75, (ctx) => {
      ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(15, 10); ctx.lineTo(45, 10); ctx.lineTo(30, 65); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_chalice_gem', 50, 50, (ctx) => {
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(25, 25, 15, 0, Math.PI * 2); ctx.fill();
    });
    this.createCanvasTexture('shard_crown_cross', 60, 60, (ctx) => {
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(25, 10, 10, 40); ctx.fillRect(10, 25, 40, 10);
    });
    this.createCanvasTexture('shard_katana_tsuba', 60, 60, (ctx) => {
      ctx.fillStyle = '#d4af37'; ctx.beginPath(); ctx.arc(30, 30, 20, 0, Math.PI, false); ctx.fill();
    });
    this.createCanvasTexture('shard_mask_fang', 50, 60, (ctx) => {
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(15, 15); ctx.lineTo(35, 15); ctx.lineTo(25, 50); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_kabuto_crest', 65, 65, (ctx) => {
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(32, 32, 24, Math.PI * 0.2, Math.PI * 0.8, false); ctx.fill();
    });
    this.createCanvasTexture('shard_jade_piece', 65, 65, (ctx) => {
      ctx.fillStyle = '#10b981'; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(10, 10, 45, 45, 8); else ctx.rect(10, 10, 45, 45);
      ctx.fill();
    });
    this.createCanvasTexture('shard_dagger_blade', 60, 75, (ctx) => {
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.moveTo(15, 10); ctx.lineTo(45, 10); ctx.lineTo(30, 65); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_axe_notch', 60, 60, (ctx) => {
      ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(45, 15); ctx.lineTo(35, 45); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_brooch_needle', 50, 70, (ctx) => {
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(25, 10); ctx.lineTo(25, 60); ctx.stroke();
    });
    this.createCanvasTexture('shard_china_neck', 65, 65, (ctx) => {
      ctx.fillStyle = '#bbf7d0'; ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(55, 15); ctx.lineTo(45, 55); ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('shard_china_lid', 55, 55, (ctx) => {
      ctx.fillStyle = '#831843'; ctx.beginPath(); ctx.arc(27, 27, 20, 0, Math.PI * 2); ctx.fill();
    });
  }

  createHDUIElements() {
    this.createCanvasTexture('icon_lock', 40, 40, (ctx) => {
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(20, 14, 9, Math.PI, 0, false); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(8, 16, 24, 20, 5); else ctx.rect(8, 16, 24, 20);
      ctx.fill();
    });
    this.createCanvasTexture('icon_star', 40, 40, (ctx) => {
      ctx.fillStyle = '#facc15'; ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = (i % 2 === 0) ? 17 : 8;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const x = 20 + r * Math.cos(angle);
        const y = 20 + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();
    });
    this.createCanvasTexture('particle_dust', 8, 8, (ctx) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(4, 4, 3.5, 0, Math.PI * 2); ctx.fill();
    });
    this.createCanvasTexture('icon_home', 40, 40, (ctx) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(20, 8); ctx.lineTo(6, 20); ctx.lineTo(34, 20); ctx.closePath(); ctx.fill();
      ctx.fillRect(11, 20, 18, 14);
    });
    this.createCanvasTexture('icon_speaker', 40, 40, (ctx) => {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(6, 14, 8, 12);
      ctx.beginPath(); ctx.moveTo(14, 14); ctx.lineTo(26, 6); ctx.lineTo(26, 34); ctx.lineTo(14, 26); ctx.closePath(); ctx.fill();
    });
  }
}
