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

    // 1. АТМОСФЕРНЫЕ ИНТЕРЬЕРЫ
    this.createHDWorkshops(width, height);
    this.createHDAntiqueShop(width, height);

    // 2. ИКОНКИ ИНСТРУМЕНТОВ ЛОТКА
    this.createHDToolIcons();

    // 3. МАСКИ СТИРАНИЯ С МЯГКИМИ КРАЯМИ
    this.createSmoothMask('mask_scraper', 34);
    this.createSmoothMask('mask_brush', 30);
    this.createSmoothMask('mask_solvent', 50);
    this.createSmoothMask('mask_glue', 24);
    this.createSmoothMask('mask_polish', 56);

    // 4. ВСЕ 14 HD-АРТЕФАКТОВ
    this.createAllHDArtifacts();

    // 5. ОСКОЛКИ ДЛЯ СКЛЕЙКИ
    this.createHDShards();

    // 6. ИНТЕРФЕЙС И ЧАСТИЦЫ
    this.createHDUIElements();

    this.scene.start('MenuScene');
  }

  // Вспомогательный метод создания Canvas с нативным 2D-контекстом
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
      const grad = ctx.createRadialGradient(radius, radius, radius * 0.5, radius, radius, radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 1. ВЕРСТАКИ С МЯГКИМ ОСВЕЩЕНИЕМ И ГЛУБИНОЙ
  createHDWorkshops(w, h) {
    for (let tier = 1; tier <= 4; tier++) {
      this.createCanvasTexture(`bg_workshop_tier_${tier}`, w, h, (ctx) => {
        // Фоновая стена
        const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
        wallGrad.addColorStop(0, '#100c0a');
        wallGrad.addColorStop(1, '#1c1612');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(0, 0, w, h * 0.4);

        // Дощатая кладка с мягким швом
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        for (let y = 0; y < h * 0.36; y += 32) {
          ctx.fillRect(0, y, w, 2);
        }

        // Арочное окно с небесным светом
        const winX = w * 0.62, winY = 35, winW = 120, winH = 150;
        const winLight = ctx.createRadialGradient(winX + 60, winY + 60, 10, winX + 60, winY + 60, 90);
        winLight.addColorStop(0, 'rgba(224, 242, 254, 0.35)');
        winLight.addColorStop(1, 'rgba(186, 230, 253, 0.08)');
        ctx.fillStyle = winLight;
        ctx.beginPath();
        ctx.arc(winX + 60, winY + 60, 60, Math.PI, 0, false);
        ctx.rect(winX, winY + 60, winW, winH - 60);
        ctx.fill();

        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Столешница верстака
        const deskGrad = ctx.createLinearGradient(0, h * 0.32, 0, h);
        if (tier === 4) {
          deskGrad.addColorStop(0, '#f8fafc');
          deskGrad.addColorStop(1, '#cbd5e1');
        } else if (tier === 3) {
          deskGrad.addColorStop(0, '#1e293b');
          deskGrad.addColorStop(1, '#0f172a');
        } else if (tier === 2) {
          deskGrad.addColorStop(0, '#1c2826');
          deskGrad.addColorStop(1, '#0b1311');
        } else {
          deskGrad.addColorStop(0, '#2b1d16');
          deskGrad.addColorStop(1, '#180f0a');
        }
        ctx.fillStyle = deskGrad;
        ctx.fillRect(0, h * 0.32, w, h * 0.68);

        // Кожаный простроченный коврик
        const padX = w * 0.05, padY = h * 0.17, padW = w * 0.90, padH = 440;
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetY = 12;

        const padGrad = ctx.createLinearGradient(padX, padY, padX, padY + padH);
        padGrad.addColorStop(0, '#1e232a');
        padGrad.addColorStop(1, '#13171c');
        ctx.fillStyle = padGrad;
        ctx.beginPath();
        ctx.roundRect(padX, padY, padW, padH, 20);
        ctx.fill();
        ctx.restore();

        // Золотая окантовка и декоративная строчка
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(padX, padY, padW, padH, 20);
        ctx.stroke();

        ctx.strokeStyle = '#8a7333';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.roundRect(padX + 7, padY + 7, padW - 14, padH - 14, 15);
        ctx.stroke();
        ctx.setLineDash([]);

        // Мягкий конус света лампы сверху
        const lampLight = ctx.createRadialGradient(w / 2, h * 0.42, 40, w / 2, h * 0.42, 300);
        lampLight.addColorStop(0, 'rgba(254, 243, 199, 0.16)');
        lampLight.addColorStop(0.6, 'rgba(245, 158, 11, 0.06)');
        lampLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = lampLight;
        ctx.fillRect(0, 0, w, h);
      });
    }
  }

  // 2. АНТИКВАРНАЯ ЛАВКА
  createHDAntiqueShop(w, h) {
    this.createCanvasTexture('bg_antique_shop', w, h, (ctx) => {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#1c130e');
      bgGrad.addColorStop(1, '#120b08');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Винтажные полосы обоев
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let x = 0; x < w; x += 32) {
        ctx.fillRect(x, 0, 16, h);
      }

      // Полки со скошенной гранью и золотом
      [125, 280, 435, 590].forEach(y => {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = '#2d1a10';
        ctx.fillRect(20, y, w - 40, 16);
        ctx.restore();

        const goldTrim = ctx.createLinearGradient(20, y + 14, w - 20, y + 14);
        goldTrim.addColorStop(0, '#997300');
        goldTrim.addColorStop(0.5, '#fef08a');
        goldTrim.addColorStop(1, '#997300');
        ctx.fillStyle = goldTrim;
        ctx.fillRect(20, y + 14, w - 40, 3);
      });

      // Мягкое виньетирование
      const vin = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, 450);
      vin.addColorStop(0, 'rgba(0,0,0,0)');
      vin.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = vin;
      ctx.fillRect(0, 0, w, h);
    });
  }

  // 3. ИНСТРУМЕНТЫ В ЛОТОК (ОБЪЕМНЫЕ СВЕТОТЕНИ)
  createHDToolIcons() {
    // 1. Стальной археологический скребок
    this.createCanvasTexture('slot_scraper', 80, 120, (ctx) => {
      // Деревянная рукоять
      const handle = ctx.createLinearGradient(28, 55, 52, 55);
      handle.addColorStop(0, '#3e2723');
      handle.addColorStop(0.5, '#8d6e63');
      handle.addColorStop(1, '#3e2723');
      ctx.fillStyle = handle;
      ctx.beginPath();
      ctx.roundRect(28, 55, 24, 58, 6);
      ctx.fill();

      // Золотая втулка
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(26, 45, 28, 10);

      // Стальное лезвие со скосом
      const blade = ctx.createLinearGradient(18, 45, 62, 10);
      blade.addColorStop(0, '#94a3b8');
      blade.addColorStop(0.4, '#f8fafc');
      blade.addColorStop(1, '#64748b');
      ctx.fillStyle = blade;
      ctx.beginPath();
      ctx.moveTo(18, 45);
      ctx.lineTo(62, 45);
      ctx.lineTo(40, 8);
      ctx.closePath();
      ctx.fill();
    });

    // 2. Мягкая беличья кисть
    this.createCanvasTexture('slot_brush_soft', 80, 120, (ctx) => {
      const handle = ctx.createLinearGradient(34, 45, 46, 45);
      handle.addColorStop(0, '#1e293b');
      handle.addColorStop(0.5, '#475569');
      handle.addColorStop(1, '#0f172a');
      ctx.fillStyle = handle;
      ctx.beginPath();
      ctx.roundRect(34, 45, 12, 68, 4);
      ctx.fill();

      ctx.fillStyle = '#d4af37';
      ctx.fillRect(30, 36, 20, 10);

      // Ворс кисти
      const fur = ctx.createLinearGradient(24, 10, 56, 10);
      fur.addColorStop(0, '#78350f');
      fur.addColorStop(0.5, '#d97706');
      fur.addColorStop(1, '#92400e');
      ctx.fillStyle = fur;
      ctx.beginPath();
      ctx.roundRect(24, 10, 32, 27, 8);
      ctx.fill();
    });

    // 3. Флакон с растворителем (изумрудное стекло)
    this.createCanvasTexture('slot_solvent', 80, 120, (ctx) => {
      const glass = ctx.createLinearGradient(20, 32, 60, 32);
      glass.addColorStop(0, '#064e3b');
      glass.addColorStop(0.3, '#10b981');
      glass.addColorStop(0.7, '#34d399');
      glass.addColorStop(1, '#065f46');
      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.roundRect(20, 32, 40, 75, 10);
      ctx.fill();

      // Горлышко и пробка
      ctx.fillStyle = '#a16207';
      ctx.fillRect(30, 14, 20, 18);
      // Блик стекла
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(25, 40, 5, 55);
    });

    // 4. Тюбик с клеем Кинцуги
    this.createCanvasTexture('slot_glue', 80, 120, (ctx) => {
      const tube = ctx.createLinearGradient(25, 110, 55, 110);
      tube.addColorStop(0, '#b45309');
      tube.addColorStop(0.5, '#fbbf24');
      tube.addColorStop(1, '#78350f');
      ctx.fillStyle = tube;
      ctx.beginPath();
      ctx.moveTo(25, 110);
      ctx.lineTo(55, 110);
      ctx.lineTo(48, 40);
      ctx.lineTo(32, 40);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(34, 14, 12, 26);
    });

    // 5. Замшевая подушечка
    this.createCanvasTexture('slot_polish', 80, 120, (ctx) => {
      const pad = ctx.createRadialGradient(40, 62, 10, 40, 62, 35);
      pad.addColorStop(0, '#a855f7');
      pad.addColorStop(1, '#581c87');
      ctx.fillStyle = pad;
      ctx.beginPath();
      ctx.roundRect(16, 35, 48, 55, 12);
      ctx.fill();

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  // 4. ГЕНЕРАЦИЯ ВСЕХ HD-АРТЕФАКТОВ
  createAllHDArtifacts() {
    // -------------------------------------------------------------------------
    // 1. ЕГИПЕТ: ЗОЛОТОЙ СКАРАБЕЙ
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_egypt_scarab', 300, 400, (ctx) => {
      // Тень лапок
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;

      // Золотые чеканные лапки
      ctx.strokeStyle = '#997300';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Лапки
      ctx.beginPath();
      ctx.moveTo(100, 130); ctx.lineTo(45, 90); ctx.lineTo(30, 110);
      ctx.moveTo(200, 130); ctx.lineTo(255, 90); ctx.lineTo(270, 110);
      ctx.moveTo(85, 200); ctx.lineTo(30, 205);
      ctx.moveTo(215, 200); ctx.lineTo(270, 205);
      ctx.moveTo(95, 270); ctx.lineTo(45, 320);
      ctx.moveTo(205, 270); ctx.lineTo(255, 320);
      ctx.stroke();
      ctx.restore();

      // Золотое тело (многослойный градиент золота)
      const goldBody = ctx.createRadialGradient(135, 175, 20, 150, 210, 115);
      goldBody.addColorStop(0, '#fef08a');
      goldBody.addColorStop(0.3, '#facc15');
      goldBody.addColorStop(0.7, '#ca8a04');
      goldBody.addColorStop(1, '#854d0e');

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = goldBody;
      ctx.beginPath();
      ctx.ellipse(150, 210, 85, 115, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Головной щиток скарабея с короной солнца
      ctx.fillStyle = goldBody;
      ctx.beginPath();
      ctx.arc(150, 85, 36, 0, Math.PI * 2);
      ctx.fill();

      // Зубцы головного венца
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(125, 68); ctx.lineTo(135, 50); ctx.lineTo(142, 68);
      ctx.moveTo(144, 62); ctx.lineTo(150, 42); ctx.lineTo(156, 62);
      ctx.moveTo(158, 68); ctx.lineTo(165, 50); ctx.lineTo(175, 68);
      ctx.fill();

      // Линия шва надкрылий
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(150, 120); ctx.lineTo(150, 322);
      ctx.stroke();

      // Вставка глубокого лазурита (овальный кабошон с золотым пиритом)
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

      // Золотые крупицы в лазурите
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(138, 180, 2.5, 0, Math.PI * 2);
      ctx.arc(162, 205, 2, 0, Math.PI * 2);
      ctx.arc(144, 245, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Мягкий изогнутый блик полированного камня
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.ellipse(136, 175, 8, 24, -Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // -------------------------------------------------------------------------
    // 2. ЕГИПЕТ: МАСКА ТУТАНХАМОНА
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_egypt_mask', 300, 400, (ctx) => {
      // Полосатый клафт (немес)
      const nemes = ctx.createLinearGradient(40, 80, 260, 310);
      nemes.addColorStop(0, '#1e3a8a');
      nemes.addColorStop(1, '#0f172a');
      ctx.fillStyle = nemes;
      ctx.beginPath();
      ctx.moveTo(50, 80); ctx.lineTo(250, 80); ctx.lineTo(270, 260);
      ctx.lineTo(220, 310); ctx.lineTo(80, 310); ctx.lineTo(30, 260);
      ctx.closePath();
      ctx.fill();

      // Золотые полосы немеса
      ctx.fillStyle = '#facc15';
      for (let y = 96; y < 290; y += 26) {
        ctx.fillRect(45, y, 210, 13);
      }

      // Золотое лицо фараона
      const face = ctx.createRadialGradient(140, 165, 15, 150, 180, 75);
      face.addColorStop(0, '#fef08a');
      face.addColorStop(0.5, '#f59e0b');
      face.addColorStop(1, '#b45309');
      ctx.fillStyle = face;
      ctx.beginPath();
      ctx.ellipse(150, 180, 52, 68, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ритуальная бородка из лазурита
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.roundRect(142, 248, 16, 56, 4);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // -------------------------------------------------------------------------
    // 3. ЕГИПЕТ: ОБРЯДОВЫЙ АНКХ
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_egypt_ankh', 300, 400, (ctx) => {
      const bronze = ctx.createLinearGradient(70, 70, 230, 370);
      bronze.addColorStop(0, '#fef08a');
      bronze.addColorStop(0.4, '#d97706');
      bronze.addColorStop(1, '#78350f');

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

      // Резной внутренний кант
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(150, 130, 48, 0, Math.PI * 2);
      ctx.stroke();
    });

    // -------------------------------------------------------------------------
    // 4. ГРЕЦИЯ: АТТИЧЕСКАЯ АМФОРА
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_greece_amphora', 300, 400, (ctx) => {
      // Терракотовое обожженное тело
      const terra = ctx.createRadialGradient(130, 170, 20, 150, 200, 140);
      terra.addColorStop(0, '#ea580c');
      terra.addColorStop(0.6, '#c2410c');
      terra.addColorStop(1, '#7c2d12');

      ctx.fillStyle = terra;
      ctx.beginPath();
      ctx.ellipse(150, 200, 92, 132, 0, 0, Math.PI * 2);
      ctx.fill();

      // Горлышко и основание
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(110, 48, 80, 52);
      ctx.fillRect(115, 320, 70, 24);

      // Ручки сосуда
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(88, 160, 46, Math.PI * 0.4, Math.PI * 1.5, true);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(212, 160, 46, Math.PI * 1.5, Math.PI * 0.6, false);
      ctx.stroke();

      // Чернофигурный пояс с греческим орнаментом меандр
      ctx.fillStyle = '#18181b';
      ctx.fillRect(72, 175, 156, 42);
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 3;
      ctx.strokeRect(72, 175, 156, 42);
    });

    // -------------------------------------------------------------------------
    // 5. ГРЕЦИЯ: КОРИНФСКИЙ ШЛЕМ
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_greece_helmet', 300, 400, (ctx) => {
      const metal = ctx.createLinearGradient(70, 70, 230, 300);
      metal.addColorStop(0, '#fef08a');
      metal.addColorStop(0.3, '#d97706');
      metal.addColorStop(0.8, '#92400e');
      metal.addColorStop(1, '#451a03');

      ctx.fillStyle = metal;
      ctx.beginPath();
      ctx.arc(150, 170, 105, 0, Math.PI * 2);
      ctx.fill();

      // Нащечники и носовая пластина
      ctx.fillRect(70, 180, 52, 120);
      ctx.fillRect(178, 180, 52, 120);
      ctx.fillRect(138, 160, 24, 130);

      // Алый спартанский гребень
      const crest = ctx.createLinearGradient(50, 40, 250, 40);
      crest.addColorStop(0, '#dc2626');
      crest.addColorStop(0.5, '#f87171');
      crest.addColorStop(1, '#991b1b');
      ctx.fillStyle = crest;
      ctx.beginPath();
      ctx.moveTo(50, 70); ctx.lineTo(250, 70); ctx.lineTo(215, 30); ctx.lineTo(85, 30);
      ctx.closePath();
      ctx.fill();
    });

    // -------------------------------------------------------------------------
    // 6. ГРЕЦИЯ: СЕРЕБРЯНАЯ ТЕТРАДРАХМА
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_greece_coin', 300, 400, (ctx) => {
      const silver = ctx.createRadialGradient(135, 185, 20, 150, 200, 120);
      silver.addColorStop(0, '#f8fafc');
      silver.addColorStop(0.4, '#cbd5e1');
      silver.addColorStop(0.8, '#64748b');
      silver.addColorStop(1, '#334155');

      ctx.fillStyle = silver;
      ctx.beginPath();
      ctx.arc(150, 200, 118, 0, Math.PI * 2);
      ctx.fill();

      // Рельеф совы Афины
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(150, 205, 42, 60, 0, 0, Math.PI * 2);
      ctx.arc(150, 145, 38, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(136, 142, 14, 0, Math.PI * 2);
      ctx.arc(164, 142, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(136, 142, 6, 0, Math.PI * 2);
      ctx.arc(164, 142, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // -------------------------------------------------------------------------
    // 7. ЕВРОПА: РЫЦАРСКИЙ ЩИТ
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_europe_shield', 300, 400, (ctx) => {
      const steel = ctx.createLinearGradient(50, 60, 250, 350);
      steel.addColorStop(0, '#cbd5e1');
      steel.addColorStop(0.5, '#64748b');
      steel.addColorStop(1, '#1e293b');

      ctx.fillStyle = steel;
      ctx.beginPath();
      ctx.moveTo(50, 60); ctx.lineTo(250, 60); ctx.lineTo(250, 220);
      ctx.lineTo(150, 350); ctx.lineTo(50, 220);
      ctx.closePath();
      ctx.fill();

      // Геральдический крест
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(135, 75, 30, 210);
      ctx.fillRect(80, 140, 140, 30);

      // Стальная кромка с заклепками
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 6;
      ctx.stroke();
    });

    // -------------------------------------------------------------------------
    // 8. ЕВРОПА: МЕЧ КРЕСТОНОСЦА
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_europe_sword', 300, 400, (ctx) => {
      // Стальной клинок с гранью дола
      const bladeL = ctx.createLinearGradient(135, 100, 150, 100);
      bladeL.addColorStop(0, '#94a3b8'); bladeL.addColorStop(1, '#f8fafc');
      ctx.fillStyle = bladeL;
      ctx.beginPath();
      ctx.moveTo(136, 100); ctx.lineTo(150, 100); ctx.lineTo(150, 375); ctx.lineTo(142, 350);
      ctx.closePath();
      ctx.fill();

      const bladeR = ctx.createLinearGradient(150, 100, 165, 100);
      bladeR.addColorStop(0, '#64748b'); bladeR.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = bladeR;
      ctx.beginPath();
      ctx.moveTo(150, 100); ctx.lineTo(164, 100); ctx.lineTo(158, 350); ctx.lineTo(150, 375);
      ctx.closePath();
      ctx.fill();

      // Золотая гарда и дисковидное яблоко
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.roundRect(80, 95, 140, 18, 5);
      ctx.arc(150, 40, 16, 0, Math.PI * 2);
      ctx.fill();

      // Рукоять из кожи
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(142, 45, 16, 55);
    });

    // -------------------------------------------------------------------------
    // 9. ЕВРОПА: ГОТИЧЕСКИЙ ПОТИР
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_europe_chalice', 300, 400, (ctx) => {
      const gold = ctx.createLinearGradient(70, 70, 230, 280);
      gold.addColorStop(0, '#fef08a');
      gold.addColorStop(0.5, '#f59e0b');
      gold.addColorStop(1, '#78350f');

      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.arc(150, 140, 76, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();

      ctx.fillRect(140, 140, 20, 130);
      ctx.beginPath();
      ctx.ellipse(150, 280, 60, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Рубин в центре ножки
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(150, 200, 9, 0, Math.PI * 2);
      ctx.fill();
    });

    // -------------------------------------------------------------------------
    // 10. ЯПОНИЯ: КАТАНА САМУРАЯ
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_japan_katana', 300, 400, (ctx) => {
      // Изогнутый стальной клинок
      const steel = ctx.createLinearGradient(140, 90, 160, 375);
      steel.addColorStop(0, '#f8fafc');
      steel.addColorStop(0.5, '#94a3b8');
      steel.addColorStop(1, '#475569');

      ctx.fillStyle = steel;
      ctx.beginPath();
      ctx.moveTo(144, 90); ctx.lineTo(158, 90); ctx.lineTo(154, 355); ctx.lineTo(142, 375);
      ctx.closePath();
      ctx.fill();

      // Волнообразная линия закалки (хамон)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(146, 95);
      for (let y = 100; y < 350; y += 20) {
        ctx.quadraticCurveTo(148, y + 10, 145, y + 20);
      }
      ctx.stroke();

      // Круглая цуба с позолотой
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(150, 90, 24, 0, Math.PI * 2);
      ctx.fill();

      // Плетеная черная рукоять (цука)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(142, 35, 16, 52, 3);
      ctx.fill();
    });

    // -------------------------------------------------------------------------
    // 11. ЯПОНИЯ: МАСКА МЭНГУ
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_japan_mask', 300, 400, (ctx) => {
      const urushi = ctx.createRadialGradient(150, 180, 20, 150, 180, 100);
      urushi.addColorStop(0, '#ef4444');
      urushi.addColorStop(0.6, '#991b1b');
      urushi.addColorStop(1, '#450a0a');

      ctx.fillStyle = urushi;
      ctx.beginPath();
      ctx.roundRect(60, 140, 180, 120, 22);
      ctx.fill();

      // Золотые клыки Они
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(115, 205); ctx.lineTo(125, 205); ctx.lineTo(120, 230);
      ctx.moveTo(175, 205); ctx.lineTo(185, 205); ctx.lineTo(180, 230);
      ctx.fill();
    });

    // -------------------------------------------------------------------------
    // 12. ЯПОНИЯ: НЭЦКЭ «ДРАКОН»
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_japan_netsuke', 300, 400, (ctx) => {
      const ivory = ctx.createRadialGradient(140, 180, 20, 150, 200, 90);
      ivory.addColorStop(0, '#ffffff');
      ivory.addColorStop(0.6, '#f5f5f4');
      ivory.addColorStop(1, '#d6d3d1');

      ctx.fillStyle = ivory;
      ctx.beginPath();
      ctx.arc(150, 200, 96, 0, Math.PI * 2);
      ctx.fill();

      // Янтарные глаза
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(138, 142, 9, 0, Math.PI * 2);
      ctx.arc(162, 142, 9, 0, Math.PI * 2);
      ctx.fill();
    });

    // -------------------------------------------------------------------------
    // 13. МЕЗОАМЕРИКА: НЕФРИТОВАЯ МАСКА МАЙЯ
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_meso_mask', 300, 400, (ctx) => {
      const jade = ctx.createRadialGradient(140, 180, 20, 150, 200, 100);
      jade.addColorStop(0, '#34d399');
      jade.addColorStop(0.6, '#059669');
      jade.addColorStop(1, '#064e3b');

      ctx.fillStyle = jade;
      ctx.beginPath();
      ctx.ellipse(150, 200, 75, 105, 0, 0, Math.PI * 2);
      ctx.fill();

      // Глаза из раковин и обсидиана
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

    // -------------------------------------------------------------------------
    // 14. МЕЗОАМЕРИКА: СОЛЯРНЫЙ ДИСК
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_meso_disk', 300, 400, (ctx) => {
      const stone = ctx.createRadialGradient(140, 190, 20, 150, 200, 120);
      stone.addColorStop(0, '#94a3b8');
      stone.addColorStop(0.7, '#475569');
      stone.addColorStop(1, '#1e293b');

      ctx.fillStyle = stone;
      ctx.beginPath();
      ctx.arc(150, 200, 122, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.stroke();
    });

    // -------------------------------------------------------------------------
    // 15. МЕЗОАМЕРИКА: ОБСИДИАНОВЫЙ КИНЖАЛ
    // -------------------------------------------------------------------------
    this.createCanvasTexture('art_meso_dagger', 300, 400, (ctx) => {
      const obsidian = ctx.createLinearGradient(135, 100, 165, 360);
      obsidian.addColorStop(0, '#334155');
      obsidian.addColorStop(0.4, '#0f172a');
      obsidian.addColorStop(1, '#020617');

      ctx.fillStyle = obsidian;
      ctx.beginPath();
      ctx.moveTo(135, 100); ctx.lineTo(165, 100); ctx.lineTo(150, 360);
      ctx.closePath();
      ctx.fill();

      // Рукоять в виде ягуара
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
