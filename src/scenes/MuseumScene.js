import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MuseumScene extends Phaser.Scene {
  constructor() {
    super('MuseumScene');
  }

  create() {
    const { width, height } = this.scale;
    const dpr = Math.max(window.devicePixelRatio || 1, 2.5);
    this.dpr = dpr;

    // Фон музея
    const bg = this.add.graphics().setDepth(0);
    bg.fillStyle(0x07090e, 1);
    bg.fillRect(0, 0, width, height);

    if (AudioManager.playShopBell) {
      AudioManager.playShopBell();
    }

    // Шапка
    const title = this.add.text(width / 2, 26, '🏛️ ЗАЛ СЛАВЫ МУЗЕЯ', {
      fontSize: '18px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(20);
    title.setResolution(dpr);

    this.infoText = this.add.text(width / 2, 46, '', {
      fontSize: '11.5px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#94a3b8'
    }).setOrigin(0.5).setDepth(20);
    this.infoText.setResolution(dpr);

    this.incomeText = this.add.text(width / 2, 62, '', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#34d399',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(20);
    this.incomeText.setResolution(dpr);

    this.listTopY = 82;
    this.listBottomY = height - 66;
    this.listHeight = this.listBottomY - this.listTopY;

    this.listCont = this.add.container(0, this.listTopY).setDepth(5);

    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.listTopY, width, this.listHeight);
    this.listCont.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

    this.setupScroll();
    this.renderExhibitGrid();

    // Нижняя кнопка возврата
    this.add.rectangle(width / 2, height - 33, width, 66, 0x07090e, 0.95).setDepth(30);

    const backBtn = this.add.rectangle(width / 2, height - 33, width * 0.88, 42, 0x141a24)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(31);

    const backTxt = this.add.text(width / 2, height - 33, 'В главное меню', {
      fontSize: '14.5px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(32);
    backTxt.setResolution(dpr);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });
  }

  getMuseumCustomizations() {
    return {
      hasVelvet: localStorage.getItem('museum_upg_pedestal_1') === 'true',
      hasDome: localStorage.getItem('museum_upg_pedestal_2') === 'true',
      hasAntiqueHall: localStorage.getItem('museum_upg_hall_antique') === 'true',
      hasRoyalHall: localStorage.getItem('museum_upg_hall_royal') === 'true'
    };
  }

  updateHeader() {
    const inventory = Storage.getInventory ? Storage.getInventory() : [];
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    const custom = this.getMuseumCustomizations();
    const bonusSlots = (custom.hasVelvet ? 1 : 0) + (custom.hasDome ? 1 : 0);
    const maxSlots = (Storage.getMaxMuseumCapacity ? Storage.getMaxMuseumCapacity() : 6) + bonusSlots;

    const validExhibits = inventory.filter(item => (item.stars === undefined || item.stars >= 2));
    let mult = 1.0;
    if (custom.hasVelvet) mult += 0.10;
    if (custom.hasDome) mult += 0.25;
    if (custom.hasRoyalHall) mult += 0.50;

    const incomePerHour = Math.round(validExhibits.length * 12 * mult);

    this.infoText.setText(`Витрины: ${inventory.length}/${maxSlots}  |  Казна: ${coins} 🪙`);
    this.incomeText.setText(`Доход посетителей: +${incomePerHour} 🪙/час`);
  }

  setupScroll() {
    let startY = 0;
    let containerStartY = 0;
    this.isDragging = false;

    this.input.on('pointerdown', (p) => {
      if (p.y >= this.listTopY && p.y <= this.listBottomY) {
        startY = p.y;
        containerStartY = this.listCont.y;
        this.isDragging = false;
      }
    });

    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      if (p.y >= this.listTopY && p.y <= this.listBottomY) {
        const dy = p.y - startY;
        if (Math.abs(dy) > 6) {
          this.isDragging = true;
        }
        this.listCont.y = Phaser.Math.Clamp(
          containerStartY + dy,
          this.minScrollY || this.listTopY,
          this.listTopY
        );
      }
    });
  }

  renderExhibitGrid() {
    this.listCont.removeAll(true);
    this.listCont.y = this.listTopY;

    const { width } = this.scale;
    const dpr = this.dpr;
    const inventory = Storage.getInventory ? Storage.getInventory() : [];
    const custom = this.getMuseumCustomizations();
    const bonusSlots = (custom.hasVelvet ? 1 : 0) + (custom.hasDome ? 1 : 0);
    const maxSlots = (Storage.getMaxMuseumCapacity ? Storage.getMaxMuseumCapacity() : 6) + bonusSlots;

    this.updateHeader();

    // Параметры сетки 2xN (плитка)
    const cols = 2;
    const gap = 12;
    const padX = 16;
    const tileW = (width - padX * 2 - gap) / cols;
    const tileH = 196;

    const totalSlots = Math.max(inventory.length, maxSlots);

    for (let i = 0; i < totalSlots; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tileX = padX + tileW / 2 + col * (tileW + gap);
      const tileY = 10 + tileH / 2 + row * (tileH + gap);

      const tile = this.add.container(tileX, tileY);
      const item = inventory[i];

      if (item) {
        const isDamaged = (item.stars === 1);

        // Фон витрины (меняется от купленных апгрейдов)
        const bgColor = custom.hasRoyalHall ? 0x1a150e : (custom.hasVelvet ? 0x1e1018 : 0x111622);
        const strokeColor = isDamaged
          ? 0xef4444
          : (custom.hasRoyalHall ? 0xfacc15 : (custom.hasDome ? 0x38bdf8 : 0x273142));

        const cardBg = this.add.rectangle(0, 0, tileW, tileH, bgColor, 0.96)
          .setStrokeStyle(custom.hasRoyalHall ? 2 : 1.5, strokeColor, 0.9);

        // Неоновая подсветка снизу (если куплена в лавке)
        if (custom.hasDome && !isDamaged) {
          const glow = this.add.ellipse(0, 12, tileW * 0.65, 24, 0x38bdf8, 0.25);
          tile.add(glow);
        }

        // Постамент под артефактом
        const pedestalColor = custom.hasVelvet ? 0x881337 : 0x334155;
        const pedestal = this.add.rectangle(0, 22, tileW * 0.62, 12, pedestalColor)
          .setStrokeStyle(1, custom.hasRoyalHall ? 0xfacc15 : 0x64748b, 0.8);

        // Спрайт артефакта
        const tex = this.textures.exists(item.textureKey) ? item.textureKey : 'art_egypt_scarab';
        const icon = this.add.image(0, -18, tex).setDisplaySize(72, 72);

        tile.add([cardBg, pedestal, icon]);

        // Стеклянный купол поверх (если куплен в лавке)
        if (custom.hasDome) {
          const dome = this.add.graphics();
          dome.lineStyle(1.5, 0xbae6fd, 0.45);
          dome.strokeRoundedRect(-tileW * 0.36, -62, tileW * 0.72, 86, { tl: 36, tr: 36, bl: 4, br: 4 });
          dome.fillStyle(0xe0f2fe, 0.06);
          dome.fillRoundedRect(-tileW * 0.36, -62, tileW * 0.72, 86, { tl: 36, tr: 36, bl: 4, br: 4 });
          tile.add(dome);
        }

        // Звезды и статус
        const starsBadge = item.stars ? '⭐'.repeat(item.stars) : '⭐⭐⭐';
        const starsTxt = this.add.text(0, -78, item.isKintsugi ? `${starsBadge} ✨` : starsBadge, {
          fontSize: '10px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);
        starsTxt.setResolution(dpr);

        // Название артефакта
        const nameTxt = this.add.text(0, 42, item.name || 'Реликвия', {
          fontSize: '12px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#ffffff',
          fontStyle: 'bold',
          align: 'center',
          wordWrap: { width: tileW - 16 }
        }).setOrigin(0.5);
        nameTxt.setResolution(dpr);

        // Кнопка продажи с ценой внизу плитки
        const sellPrice = item.marketValue || 100;
        const btnBg = this.add.rectangle(0, 74, tileW - 24, 28, isDamaged ? 0x450a0a : 0x064e3b)
          .setStrokeStyle(1, isDamaged ? 0xef4444 : 0x10b981, 0.9)
          .setInteractive({ useHandCursor: true });

        const btnLabel = isDamaged ? `СКУПЩИКУ ${sellPrice} 🪙` : `ПРОДАТЬ ${sellPrice} 🪙`;
        const btnTxt = this.add.text(0, 74, btnLabel, {
          fontSize: '10px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: isDamaged ? '#fca5a5' : '#34d399',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        btnTxt.setResolution(dpr);

        let isSold = false;
        btnBg.on('pointerup', () => {
          if (this.isDragging || isSold) return;
          isSold = true;
          btnBg.disableInteractive();

          if (AudioManager.playCoin) AudioManager.playCoin();
          Storage.addCoins(sellPrice);
          Storage.removeArtifactFromInventory(item.instanceId);

          this.tweens.add({
            targets: tile,
            alpha: 0,
            scale: 0.85,
            duration: 180,
            onComplete: () => this.renderExhibitGrid()
          });
        });

        tile.add([starsTxt, nameTxt, btnBg, btnTxt]);
      } else {
        // Пустой свободный постамент
        const emptyBg = this.add.rectangle(0, 0, tileW, tileH, 0x0a0e17, 0.75)
          .setStrokeStyle(1, 0x1e293b, 0.8);

        const pedestal = this.add.rectangle(0, 14, tileW * 0.55, 10, 0x1e293b);

        const plusTxt = this.add.text(0, -18, '🏛️', {
          fontSize: '26px',
          alpha: 0.35
        }).setOrigin(0.5);

        const emptyTitle = this.add.text(0, 44, 'Свободный стенд', {
          fontSize: '11px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#475569',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        emptyTitle.setResolution(dpr);

        const emptySub = this.add.text(0, 62, 'Место для реликвии', {
          fontSize: '9.5px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#334155'
        }).setOrigin(0.5);
        emptySub.setResolution(dpr);

        tile.add([emptyBg, pedestal, plusTxt, emptyTitle, emptySub]);
      }

      this.listCont.add(tile);
    }

    const totalRows = Math.ceil(totalSlots / cols);
    const totalHeight = totalRows * (tileH + gap) + 24;
    this.minScrollY = Math.min(this.listTopY, this.listBottomY - totalHeight);
  }
}
