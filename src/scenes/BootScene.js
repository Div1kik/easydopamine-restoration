  createAllHDArtifacts() {
    // 1. ЕГИПЕТ: ЗОЛОТОЙ СКАРАБЕЙ
    this.createCanvasTexture('art_egypt_scarab', 300, 400, (ctx) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;
      ctx.strokeStyle = '#997300';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
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

      ctx.fillStyle = goldBody;
      ctx.beginPath();
      ctx.ellipse(150, 210, 85, 115, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(150, 85, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(150, 120); ctx.lineTo(150, 322);
      ctx.stroke();

      const lapis = ctx.createRadialGradient(138, 185, 10, 150, 212, 65);
      lapis.addColorStop(0, '#3b82f6');
      lapis.addColorStop(0.5, '#1d4ed8');
      lapis.addColorStop(1, '#0f172a');
      ctx.fillStyle = lapis;
      ctx.beginPath();
      ctx.ellipse(150, 212, 42, 68, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.ellipse(136, 175, 8, 24, -Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. ЕГИПЕТ: МАСКА ТУТАНХАМОНА
    this.createCanvasTexture('art_egypt_mask', 300, 400, (ctx) => {
      const nemes = ctx.createLinearGradient(40, 80, 260, 310);
      nemes.addColorStop(0, '#1e3a8a'); nemes.addColorStop(1, '#0f172a');
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

    // 6. ГРЕЦИЯ: СЕРЕБРЯНАЯ ТЕТРАДРАХМА
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

    // 7. ЕВРОПА: РЫЦАРСКИЙ ЩИТ
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

    // 10. ЯПОНИЯ: КАТАНА САМУРАЯ
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
