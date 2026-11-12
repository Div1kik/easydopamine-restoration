import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MuseumScene extends Phaser.Scene {
  constructor() {
    super('MuseumScene');
  }

  create() {
    const { width, height } = this.scale;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;

    const bg = this.add.graphics().setDepth(0);
    bg.fillStyle(0x07090e, 1);
    bg.fillRect(0, 0, width, height);

    if (AudioManager.playShopBell) {
      AudioManager.playShopBell();
    }

    const title = this.add.text(width / 2, 26, '🏛️ ЗАЛ СЛАВЫ МУЗЕЯ', {
      fontSize: '18px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2,
      resolution: dpr
    }).setOrigin(0.5).setDepth(20);

    this.infoText = this.add.text(width / 2, 46, '', {
      fontSize: '11.5px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
      color: '#94a3b8',
      resolution: dpr
    }).setOrigin(0.5).setDepth(20);

    this.incomeText = this.add.text(width / 2, 62, '', {
      fontSize: '11px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
      color: '#34d399',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(20);

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

    this.add.rectangle(width / 2, height - 33, width, 66, 0x07090e, 0.95).setDepth(30);

    const backBtn = this.add.rectangle(width / 2, height - 33, width * 0.88, 42, 0x141a24)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(31);

    this.add.text(width / 2, height - 33, 'В главное меню', {
      fontSize: '14.5px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(32);

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

    const cols = 2;
    const gap = 12;
    const padX = 16;
    const tileW = (width - padX * 2 - gap) / cols;
    const tileH = 210;

    const totalSlots = Math.max(inventory.length, maxSlots);

    for (let i = 0; i < totalSlots; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tileX = padX + tileW / 2 + col * (tileW + gap);
      const tileY = 8 + tileH / 2 + row * (tileH + gap);

      const tile = this.add.container(tileX, tileY);
      const item = inventory[i];

      if (item) {
        const isDamaged = (item.stars === 1);

        // Фон витрины (тёмный мрамор / королевский антрацит)
        const bgHex = custom.hasRoyalHall ? 0x16120c : 0x0e131d;
        const borderHex = isDamaged
          ? 0xef4444
          : (custom.hasRoyalHall ? 0xe2b35b : (custom.hasDome ? 0x38bdf8 : 0x273142));

        const cardBg = this.add.graphics();
        cardBg.fillStyle(bgHex, 0.96);
        cardBg.fillRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, 14);
        cardBg.lineStyle(custom.hasRoyalHall ? 1.8 : 1.2, borderHex, 0.85);
        cardBg.strokeRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, 14);
        tile.add(cardBg);

        // Луч софита сверху (мягкий световой конус вместо грубой коробки)
        const spotlight = this.add.graphics();
        const beamColor = custom.hasRoyalHall ? 0xfacc15 : (custom.hasDome ? 0x38bdf8 : 0x94a3b8);
        spotlight.fillStyle(beamColor, custom.hasDome ? 0.12 : 0.06);
        spotlight.beginPath();
        spotlight.moveTo(-22, -tileH / 2 + 2);
        spotlight.lineTo(22, -tileH / 2 + 2);
        spotlight.lineTo(tileW * 0.42, 24);
        spotlight.lineTo(-tileW * 0.42, 24);
        spotlight.closePath();
        spotlight.fillPath();
        tile.add(spotlight);

        // Объёмный двухступенчатый постамент
        const pedGfx = this.add.graphics();
        const pedBase = custom.hasVelvet ? 0x881337 : 0x1e293b;
        const pedTop = custom.hasRoyalHall ? 0xca8a04 : (custom.hasVelvet ? 0xbe123c : 0x334155);

        // Нижняя ступенька
        pedGfx.fillStyle(pedBase, 1);
        pedGfx.fillRoundedRect(-tileW * 0.34, 22, tileW * 0.68, 10, 4);
        // Верхняя плита постамента
        pedGfx.fillStyle(pedTop, 1);
        pedGfx.fillRoundedRect(-tileW * 0.28, 16, tileW * 0.56, 7, 3);
        // Тень от артефакта на постаменте
        pedGfx.fillStyle(0x000000, 0.35);
        pedGfx.fillEllipse(0, 16, tileW * 0.38, 6);
        tile.add(pedGfx);

        // Крупный артефакт в центре композиции
        const tex = this.textures.exists(item.textureKey) ? item.textureKey : 'art_egypt_scarab';
        const icon = this.add.image(0, -24, tex).setDisplaySize(86, 86);
        tile.add(icon);

        // Деликатный стеклянный блик (если куплен купол V)
        if (custom.hasDome) {
          const glassShine = this.add.graphics();
          glassShine.lineStyle(1.5, 0xbae6fd, 0.28);
          glassShine.beginPath();
          glassShine.arc(0, -24, 46, Math.PI * 1.15, Math.PI * 1.45);
          glassShine.strokePath();
          tile.add(glassShine);
        }

        // Звёзды качества вверху
        const starsBadge = item.stars ? '⭐'.repeat(item.stars) : '⭐⭐⭐';
        const starsTxt = this.add.text(0, -tileH / 2 + 14, item.isKintsugi ? `${starsBadge} ✨` : starsBadge, {
          fontSize: '10px',
          resolution: dpr
        }).setOrigin(0.5);

        // Музейная табличка с названием
        const nameTxt = this.add.text(0, 48, item.name || 'Реликвия', {
          fontSize: '11.5px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
          color: '#f8fafc',
          fontStyle: 'bold',
          align: 'center',
          wordWrap: { width: tileW - 18 },
          resolution: dpr
        }).setOrigin(0.5);

        // Кнопка продажи внизу карточки
        const sellPrice = item.marketValue || 100;
        const btnBg = this.add.rectangle(0, tileH / 2 - 22, tileW - 22, 26, isDamaged ? 0x450a0a : 0x064e3b)
          .setStrokeStyle(1, isDamaged ? 0xef4444 : 0x10b981, 0.85)
          .setInteractive({ useHandCursor: true });

        const btnLabel = isDamaged ? `СКУПЩИКУ ${sellPrice} 🪙` : `ПРОДАТЬ ${sellPrice} 🪙`;
        const btnTxt = this.add.text(0, tileH / 2 - 22, btnLabel, {
          fontSize: '9.5px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
          color: isDamaged ? '#fca5a5' : '#34d399',
          fontStyle: 'bold',
          resolution: dpr
        }).setOrigin(0.5);

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
            scale: 0.88,
            duration: 180,
            onComplete: () => this.renderExhibitGrid()
          });
        });

        tile.add([starsTxt, nameTxt, btnBg, btnTxt]);
      } else {
        // Пустая витрина с силуэтом постамента
        const emptyGfx = this.add.graphics();
        emptyGfx.fillStyle(0x0a0e17, 0.7);
        emptyGfx.fillRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, 14);
        emptyGfx.lineStyle(1, 0x1e293b, 0.8);
        emptyGfx.strokeRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, 14);

        emptyGfx.fillStyle(0x1e293b, 0.9);
        emptyGfx.fillRoundedRect(-tileW * 0.28, 16, tileW * 0.56, 8, 3);
        tile.add(emptyGfx);

        const iconEmpty = this.add.text(0, -22, '🏛️', {
          fontSize: '28px',
          alpha: 0.25,
          resolution: dpr
        }).setOrigin(0.5);

        const emptyTitle = this.add.text(0, 46, 'Свободная витрина', {
          fontSize: '11px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
          color: '#475569',
          fontStyle: 'bold',
          resolution: dpr
        }).setOrigin(0.5);

        const emptySub = this.add.text(0, 64, 'Отреставрируйте находку', {
          fontSize: '9.5px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
          color: '#334155',
          resolution: dpr
        }).setOrigin(0.5);

        tile.add([iconEmpty, emptyTitle, emptySub]);
      }

      this.listCont.add(tile);
    }

    const totalRows = Math.ceil(totalSlots / cols);
    const totalHeight = totalRows * (tileH + gap) + 24;
    this.minScrollY = Math.min(this.listTopY, this.listBottomY - totalHeight);
  }
}
