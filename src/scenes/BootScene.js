  createHDAntiqueShop(w, h) {
    for (let tier = 1; tier <= 4; tier++) {
      this.createCanvasTexture(`bg_antique_shop_tier_${tier}`, w, h, (ctx) => {
        // Базовый фон стен лавки
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        if (tier === 1) {
          bgGrad.addColorStop(0, '#1c140e'); bgGrad.addColorStop(1, '#0e0906');
        } else if (tier === 2) {
          bgGrad.addColorStop(0, '#261b14'); bgGrad.addColorStop(1, '#120d09');
        } else if (tier === 3) {
          bgGrad.addColorStop(0, '#1e2430'); bgGrad.addColorStop(1, '#0c0f14');
        } else {
          bgGrad.addColorStop(0, '#2d241c'); bgGrad.addColorStop(1, '#18120d');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // ДЕТАЛИ ИНТЕРЬЕРА ЛАВКИ
        if (tier === 1) {
          // Уровень 1: Старый чердак / подвал старьевщика
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          for (let x = 0; x < w; x += 36) ctx.fillRect(x, 0, 18, h);
          // Деревянные сколоченные полки
          [125, 280, 435, 590].forEach(y => {
            ctx.fillStyle = '#3a2215'; ctx.fillRect(18, y, w - 36, 16);
            ctx.fillStyle = '#1e1109'; ctx.fillRect(18, y + 14, w - 36, 4);
          });
        } else if (tier === 2) {
          // Уровень 2: Уютная винтажная лавка с книжными корешками и часами
          ctx.fillStyle = 'rgba(217, 119, 6, 0.05)';
          for (let x = 0; x < w; x += 28) ctx.fillRect(x, 0, 14, h);

          // Полки с расставленными старинными фолиантами
          [125, 280, 435, 590].forEach((y, i) => {
            ctx.fillStyle = '#451a03'; ctx.fillRect(18, y, w - 36, 16);
            ctx.fillStyle = '#d97706'; ctx.fillRect(18, y + 14, w - 36, 3);
            // Книги на заднем плане
            ctx.fillStyle = '#78350f'; ctx.fillRect(25, y - 24, 18, 24);
            ctx.fillStyle = '#1e3a8a'; ctx.fillRect(45, y - 28, 22, 28);
            ctx.fillStyle = '#14532d'; ctx.fillRect(70, y - 22, 16, 22);
          });
        } else if (tier === 3) {
          // Уровень 3: Кабинет редкостей (синий бархат, золотые молдинги)
          ctx.fillStyle = '#0f172a'; ctx.fillRect(14, 80, w - 28, h - 160);
          ctx.strokeStyle = '#c5a059'; ctx.lineWidth = 3;
          ctx.strokeRect(14, 80, w - 28, h - 160);

          [125, 280, 435, 590].forEach(y => {
            ctx.fillStyle = '#1e293b'; ctx.fillRect(18, y, w - 36, 18);
            const goldTrim = ctx.createLinearGradient(18, y + 15, w - 18, y + 15);
            goldTrim.addColorStop(0, '#997300'); goldTrim.addColorStop(0.5, '#fef08a'); goldTrim.addColorStop(1, '#997300');
            ctx.fillStyle = goldTrim; ctx.fillRect(18, y + 15, w - 36, 3);
          });
        } else {
          // Уровень 4: Королевская антикварная галерея (мраморные выступы и подсветка)
          [125, 280, 435, 590].forEach(y => {
            ctx.fillStyle = '#e2e8f0'; ctx.fillRect(18, y, w - 36, 18);
            ctx.fillStyle = '#f59e0b'; ctx.fillRect(18, y + 15, w - 36, 3);
            // Спот подсветки каждого стенда
            const spot = ctx.createRadialGradient(w / 2, y - 40, 10, w / 2, y, 120);
            spot.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
            spot.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = spot; ctx.fillRect(18, y - 80, w - 36, 80);
          });
        }

        // Мягкое общее виньетирование
        const vin = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, h * 0.65);
        vin.addColorStop(0, 'rgba(0,0,0,0)');
        vin.addColorStop(1, 'rgba(0,0,0,0.65)');
        ctx.fillStyle = vin; ctx.fillRect(0, 0, w, h);
      });
    }
  }
