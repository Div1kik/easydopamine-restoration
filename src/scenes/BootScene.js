  createCinematicBackgrounds(w, h) {
    // Современный минималистичный верстак реставратора
    for (let tier = 1; tier <= 4; tier++) {
      this.createCanvasTexture(`bg_workshop_tier_${tier}`, w, h, (ctx) => {
        // Мягкий матовый градиент интерьера (Dark Slate & Warm Studio)
        const bgGrad = ctx.createRadialGradient(w / 2, h * 0.35, 40, w / 2, h * 0.45, h * 0.75);
        bgGrad.addColorStop(0, '#1a1e26');
        bgGrad.addColorStop(0.55, '#11141a');
        bgGrad.addColorStop(1, '#0a0c10');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Столешница верстака (чистый скандинавский минимализм)
        const tableY = h * 0.24;
        const tableGrad = ctx.createLinearGradient(0, tableY, 0, h);
        tableGrad.addColorStop(0, '#151921');
        tableGrad.addColorStop(1, '#0d1015');
        ctx.fillStyle = tableGrad;
        ctx.fillRect(0, tableY, w, h - tableY);

        // Тонкая разделительная световая линия стола
        const lineGrad = ctx.createLinearGradient(0, tableY, w, tableY);
        lineGrad.addColorStop(0, 'rgba(255,255,255,0)');
        lineGrad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
        lineGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = lineGrad;
        ctx.fillRect(0, tableY, w, 1);

        // Рабочая станция под артефакт (Glassmorphic Tray с рассеянной тенью)
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

        // Нео-окантовка с мягким акцентным градиентом
        const strokeGrad = ctx.createLinearGradient(padX, padY, padX + padW, padY + padH);
        strokeGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        strokeGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
        strokeGrad.addColorStop(1, 'rgba(16, 185, 129, 0.25)');
        ctx.strokeStyle = strokeGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(padX, padY, padW, padH, r);
        ctx.stroke();

        // Атмосферный световой спот (Мягкое студийное освещение)
        const spot = ctx.createRadialGradient(w / 2, h * 0.42, 30, w / 2, h * 0.42, 320);
        spot.addColorStop(0, 'rgba(254, 243, 199, 0.12)');
        spot.addColorStop(0.5, 'rgba(245, 158, 11, 0.03)');
        spot.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, w, h);
      });
    }

    // Современная витрина лавки (Clean Boutique)
    for (let tier = 1; tier <= 4; tier++) {
      this.createCanvasTexture(`bg_antique_shop_tier_${tier}`, w, h, (ctx) => {
        const bgGrad = ctx.createRadialGradient(w / 2, h * 0.4, 50, w / 2, h * 0.4, h * 0.7);
        bgGrad.addColorStop(0, '#181d26');
        bgGrad.addColorStop(1, '#0a0d12');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Минималистичные парящие полки-плинтусы со светодиодной контурной подсветкой
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

          // Тонкая световая грань полки
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

  // Современные аккуратные карточки инструментов (Flat / Skeuominimalism)
  createHDToolIcons() {
    // 1. Скребок
    this.createCanvasTexture('slot_scraper', 80, 120, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;

      // Матовая рукоять графитового цвета
      const handle = ctx.createLinearGradient(30, 52, 50, 52);
      handle.addColorStop(0, '#2d3748'); handle.addColorStop(1, '#1a202c');
      ctx.fillStyle = handle;
      ctx.beginPath();
      ctx.roundRect(30, 50, 20, 62, 8);
      ctx.fill();

      // Шлифованная титановая лопатка с фаской
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

      // Густой ровный ворс
      const fur = ctx.createLinearGradient(25, 10, 55, 10);
      fur.addColorStop(0, '#b45309'); fur.addColorStop(0.5, '#fbbf24'); fur.addColorStop(1, '#78350f');
      ctx.fillStyle = fur;
      ctx.beginPath();
      ctx.roundRect(26, 10, 28, 26, 6);
      ctx.fill();
      ctx.restore();
    });

    // 3. Растворитель (минималистичный флакон-дроппер)
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

    // 4. Клей (стильный диспенсер)
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

    // 5. Замша (матовая микрофибра)
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
