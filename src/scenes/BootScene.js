export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createHiResTextures();
    this.scene.start('MenuScene');
  }

  createHiResTextures() {
    // Вспомогательная функция для генерации ультра-четких текстур
    const createHDTexture = (key, width, height, drawCallback) => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.scale(2, 2);
      drawCallback(ctx, width, height);
      if (this.textures.exists(key)) this.textures.remove(key);
      this.textures.addCanvas(key, canvas);
    };

    // 1. Иконки инструментов лотка (четкие векторы)
    createHDTexture('slot_scraper', 64, 64, (ctx) => {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(28, 30, 8, 26);
      ctx.fillStyle = '#e2b35b';
      ctx.beginPath();
      ctx.moveTo(14, 30);
      ctx.lineTo(50, 30);
      ctx.lineTo(32, 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    createHDTexture('slot_brush_soft', 64, 64, (ctx) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(29, 32, 6, 24);
      ctx.fillStyle = '#c5a059';
      ctx.fillRect(26, 26, 12, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(32, 20, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    createHDTexture('slot_solvent', 64, 64, (ctx) => {
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.roundRect(22, 24, 20, 32, 4);
      ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.fillRect(28, 14, 8, 10);
      ctx.fillRect(24, 12, 16, 4);
    });

    createHDTexture('slot_glue', 64, 64, (ctx) => {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(24, 54);
      ctx.lineTo(40, 54);
      ctx.lineTo(35, 22);
      ctx.lineTo(29, 22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(30, 12, 4, 10);
    });

    createHDTexture('slot_polish', 64, 64, (ctx) => {
      const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 18);
      grad.addColorStop(0, '#e879f9');
      grad.addColorStop(1, '#a21caf');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(16, 16, 32, 32, 8);
      ctx.fill();
    });

    // 2. Маски ластика
    const createMask = (key, r) => {
      createHDTexture(key, r * 2, r * 2, (ctx) => {
        const rad = ctx.createRadialGradient(r, r, 0, r, r, r);
        rad.addColorStop(0, 'rgba(0,0,0,1)');
        rad.addColorStop(0.7, 'rgba(0,0,0,0.8)');
        rad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(r, r, r, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    createMask('mask_scraper', 32);
    createMask('mask_brush', 40);
    createMask('mask_solvent', 36);
    createMask('mask_glue', 28);
    createMask('mask_polish', 44);

    // 3. Артефакты (детализированные векторные формы высокого разрешения)
    createHDTexture('art_egypt_scarab', 300, 400, (ctx) => {
      const cx = 150, cy = 200;
      // Золотой панцирь
      const goldGrad = ctx.createLinearGradient(cx - 70, cy, cx + 70, cy);
      goldGrad.addColorStop(0, '#b45309');
      goldGrad.addColorStop(0.5, '#facc15');
      goldGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 75, 95, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Лазуритовое сердце
      const gemGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 35);
      gemGrad.addColorStop(0, '#60a5fa');
      gemGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = gemGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 32, 44, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Голова и жвала
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(cx, cy - 90, 26, 0, Math.PI, true);
      ctx.fill();
    });

    createHDTexture('art_egypt_ankh', 300, 400, (ctx) => {
      const cx = 150, cy = 180;
      const bronzeGrad = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0);
      bronzeGrad.addColorStop(0, '#92400e');
      bronzeGrad.addColorStop(0.5, '#f59e0b');
      bronzeGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = bronzeGrad;

      // Ножка
      ctx.fillRect(cx - 14, cy - 20, 28, 150);
      // Перекладина
      ctx.fillRect(cx - 65, cy - 10, 130, 26);
      // Верхняя петля
      ctx.lineWidth = 24;
      ctx.strokeStyle = bronzeGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 65, 34, 46, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Рубин в центре
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, cy + 3, 11, 0, Math.PI * 2);
      ctx.fill();
    });

    createHDTexture('art_egypt_mask', 300, 400, (ctx) => {
      const cx = 150, cy = 190;
      // Немес (полосатый платок)
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.roundRect(cx - 85, cy - 75, 170, 150, 20);
      ctx.fill();

      // Полосы золота
      ctx.fillStyle = '#eab308';
      for (let y = cy - 65; y < cy + 70; y += 22) {
        ctx.fillRect(cx - 85, y, 170, 10);
      }

      // Золотое лицо
      const faceGrad = ctx.createLinearGradient(cx - 40, cy, cx + 40, cy);
      faceGrad.addColorStop(0, '#ca8a04');
      faceGrad.addColorStop(0.5, '#fef08a');
      faceGrad.addColorStop(1, '#a16207');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 42, 54, 0, 0, Math.PI * 2);
      ctx.fill();

      // Глаза и бородка
      ctx.fillStyle = '#000000';
      ctx.fillRect(cx - 24, cy - 6, 14, 5);
      ctx.fillRect(cx + 10, cy - 6, 14, 5);
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(cx - 7, cy + 50, 14, 30);
    });

    createHDTexture('art_egypt_canopic', 300, 400, (ctx) => {
      const cx = 150, cy = 200;
      const canGrad = ctx.createLinearGradient(cx - 55, cy, cx + 55, cy);
      canGrad.addColorStop(0, '#d97706');
      canGrad.addColorStop(0.5, '#fef3c7');
      canGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = canGrad;

      // Тело сосуда
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy - 20);
      ctx.bezierCurveTo(cx - 65, cy + 30, cx - 55, cy + 110, cx - 35, cy + 130);
      ctx.lineTo(cx + 35, cy + 130);
      ctx.bezierCurveTo(cx + 55, cy + 110, cx + 65, cy + 30, cx + 40, cy - 20);
      ctx.closePath();
      ctx.fill();

      // Крышка с головой Гора
      ctx.beginPath();
      ctx.arc(cx, cy - 45, 36, 0, Math.PI * 2);
      ctx.fill();
    });

    createHDTexture('art_egypt_bastet', 300, 400, (ctx) => {
      const cx = 150, cy = 200;
      ctx.fillStyle = '#18181b';
      // Тело кошки
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 20);
      ctx.bezierCurveTo(cx - 50, cy + 40, cx - 45, cy + 110, cx - 35, cy + 130);
      ctx.lineTo(cx + 35, cy + 130);
      ctx.bezierCurveTo(cx + 45, cy + 110, cx + 50, cy + 40, cx + 30, cy - 20);
      ctx.closePath();
      ctx.fill();

      // Голова и ушки
      ctx.beginPath();
      ctx.arc(cx, cy - 45, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 55);
      ctx.lineTo(cx - 14, cy - 82);
      ctx.lineTo(cx - 4, cy - 60);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 24, cy - 55);
      ctx.lineTo(cx + 14, cy - 82);
      ctx.lineTo(cx + 4, cy - 60);
      ctx.closePath();
      ctx.fill();

      // Золотой ошейник
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 22, 0.2, Math.PI - 0.2);
      ctx.stroke();
    });

    createHDTexture('shard_amphora', 60, 60, (ctx) => {
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(10, 15);
      ctx.lineTo(48, 12);
      ctx.lineTo(40, 48);
      ctx.lineTo(15, 42);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    createHDTexture('icon_home', 48, 48, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(24, 8);
      ctx.lineTo(40, 22);
      ctx.lineTo(34, 22);
      ctx.lineTo(34, 40);
      ctx.lineTo(14, 40);
      ctx.lineTo(14, 22);
      ctx.lineTo(8, 22);
      ctx.closePath();
      ctx.fill();
    });

    createHDTexture('particle_dust', 8, 8, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
