import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MuseumScene extends Phaser.Scene {
  constructor() {
    super('MuseumScene');
  }

  create() {
    const { width, height } = this.scale;
    this.dpr = 2.5;

    const FONT_TITLE = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';
    const FONT_UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    this.FONT_UI = FONT_UI;

    if (this.textures.exists('museum_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'museum_bg').setDepth(0);
      bg.setScale(Math.max(width / bg.width, height / bg.height));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0906, 0.24).setDepth(0);
    } else {
      const bg = this.add.graphics().setDepth(0);
      bg.fillGradientStyle(0x1f150d, 0x1f150d, 0x0d0805, 0x0d0805, 1);
      bg.fillRect(0, 0, width, height);
    }

    if (AudioManager.playShopBell) {
      AudioManager.playShopBell();
    }

    // Верхняя шапка музея
    const headerBg = this.add.graphics().setDepth(18);
    headerBg.fillGradientStyle(0x24180f, 0x24180f, 0x140d08, 0x140d08, 0.90);
    headerBg.fillRect(0, 0, width, 82);
    headerBg.lineStyle(1.5, 0xc89d54, 0.65);
    headerBg.lineBetween(0, 82, width, 82);

    this.add.text(width / 2, 20, '🏛 ЗАЛ СЛАВЫ МУЗЕЯ', {
      fontSize: '18px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(20);

    this.infoText = this.add.text(width / 2, 45, '', {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(20);

    this.incomeText = this.add.text(width / 2, 65, '', {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#86efac',
      fontStyle: 'bold',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(20);

    this.listTopY = 88;
    this.listBottomY = height - 68;
    this.listHeight = this.listBottomY - this.listTopY;

    this.listCont = this.add.container(0, this.listTopY).setDepth(5);

    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.listTopY, width, this.listHeight);
    this.listCont.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

    this.setupScroll();
    this.renderExhibitGrid();

    // Нижняя панель с кнопкой возврата
    const footerBg = this.add.graphics().setDepth(30);
    footerBg.fillGradientStyle(0x1f140c, 0x1f140c, 0x120b07, 0x120b07, 0.92);
    footerBg.fillRect(0, height - 66, width, 66);
    footerBg.lineStyle(1.5, 0xc89d54, 0.65);
    footerBg.lineBetween(0, height - 66, width, height - 66);

    const btnW = width * 0.88;
    const btnH = 44;
    const btnY = height - 33;

    const backGfx = this.add.graphics().setDepth(31);
    backGfx.fillGradientStyle(0x332215, 0x332215, 0x1e130b, 0x1e130b, 1);
    backGfx.fillRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 11);
    backGfx.lineStyle(1.5, 0xc89d54, 0.9);
    backGfx.strokeRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 11);

    const backZone = this.add.zone(width / 2, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .setDepth(33);

    this.add.text(width / 2, btnY, 'В главное меню', {
      fontSize: '15px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(32);

    backZone.on('pointerdown', () => {
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
    const inventory = Storage.getInventory();
    const coins = Storage.getCoins();
    const custom = this.getMuseumCustomizations();
    const bonusSlots = (custom.hasVelvet ? 1 : 0) + (custom.hasDome ? 1 : 0);
    const maxSlots = Storage.getMaxMuseumCapacity() + bonusSlots;

    const validExhibits = inventory.filter((item) => item.stars === undefined || item.stars >= 2);
    let mult = 1.0;
    if (custom.hasVelvet) mult += 0.15;
    if (custom.hasDome) mult += 0.25;
    if (custom.hasRoyalHall) mult += 0.50;

    const incomePerHour = Math.round(validExhibits.length * 15 * mult);

    this.infoText.setText(`Витрины: ${inventory.length}/${maxSlots}  |  Казна: ${coins} 🪙`);
    this.incomeText.setText(`Доход посетителей: +${incomePerHour} 🪙 / час`);
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
    const FONT_UI = this.FONT_UI;
    const inventory = Storage.getInventory();
    const custom = this.getMuseumCustomizations();
    const bonusSlots = (custom.hasVelvet ? 1 : 0) + (custom.hasDome ? 1 : 0);
    const maxSlots = Storage.getMaxMuseumCapacity() + bonusSlots;

    this.updateHeader();

    const cols = 2;
    const gap = 12;
    const padX = 16;
    const tileW = (width - padX * 2 - gap) / cols;
    const tileH = 236;

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

        const topHex = custom.hasRoyalHall ? 0x2b1814 : 0x1a110a;
        const bottomHex = custom.hasRoyalHall ? 0x1a0d0a : 0x120b07;
        const borderHex = isDamaged
          ? 0xf43f5e
          : (custom.hasRoyalHall ? 0xfacc15 : (custom.hasDome ? 0xe2b866 : 0xb08948));

        const cardBg = this.add.graphics();
        cardBg.fillGradientStyle(topHex, topHex, bottomHex, bottomHex, 0.44);
        cardBg.fillRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, 14);

        cardBg.fillStyle(0x120b07, 0.76);
        cardBg.fillRoundedRect(-tileW / 2 + 1, 30, tileW - 2, tileH / 2 - 31, { tl: 0, tr: 0, bl: 13, br: 13 });

        cardBg.lineStyle(custom.hasRoyalHall ? 1.8 : 1.3, borderHex, 0.88);
        cardBg.strokeRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, 14);
        tile.add(cardBg);

        // Пьедестал
        const pedGfx = this.add.graphics();
        const pedDark = custom.hasVelvet ? 0x5c1111 : 0x24160b;
        const pedMid = custom.hasVelvet ? 0x8a1c1c : 0x3d2614;
        const pedTop = custom.hasVelvet ? 0xb91c1c : 0x59391f;

        pedGfx.fillGradientStyle(pedMid, pedMid, pedDark, pedDark, 1);
        pedGfx.fillRoundedRect(-tileW * 0.35, 20, tileW * 0.70, 10, 4);
        pedGfx.fillGradientStyle(pedTop, pedTop, pedMid, pedMid, 1);
        pedGfx.fillRoundedRect(-tileW * 0.29, 14, tileW * 0.58, 7, 3);
        tile.add(pedGfx);

        const tex = this.textures.exists(item.textureKey) ? item.textureKey : 'art_egypt_scarab';
        const icon = this.add.image(0, -28, tex).setDisplaySize(86, 86);
        tile.add(icon);

        // Тап по экспонату открывает детальный 360-осмотр
        const inspectZone = this.add.zone(0, -30, tileW - 12, 110).setInteractive({ useHandCursor: true });
        inspectZone.on('pointerup', () => {
          if (this.isDragging) return;
          if (AudioManager.playClick) AudioManager.playClick();
          this.scene.start('ArtifactDetailScene', { artifact: item });
        });
        tile.add(inspectZone);

        const starsBadge = item.stars ? '★'.repeat(item.stars) : '★★★';
        const starsTxt = this.add.text(0, -tileH / 2 + 14, item.isKintsugi ? `✨ ${starsBadge}` : starsBadge, {
          fontSize: '12px',
          fontFamily: FONT_UI,
          color: '#facc15',
          resolution: dpr
        }).setOrigin(0.5).setShadow(0, 1, '#000000', 4, false, true);

        const nameTxt = this.add.text(0, 48, item.name || 'Реликвия', {
          fontSize: '12.5px',
          fontFamily: FONT_UI,
          color: '#fdf6e3',
          fontStyle: 'bold',
          align: 'center',
          wordWrap: { width: tileW - 16 },
          resolution: dpr
        }).setOrigin(0.5);

        const sellPrice = item.marketValue || 100;
        const btnW = tileW - 20;
        const btnH = 32;
        const btnY = tileH / 2 - 23;

        const btnGfx = this.add.graphics();
        btnGfx.fillStyle(isDamaged ? 0x4c1d24 : 0x1e3322, 0.95);
        btnGfx.fillRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
        btnGfx.lineStyle(1, isDamaged ? 0xfb7185 : 0x4ade80, 0.85);
        btnGfx.strokeRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 8);

        const btnZone = this.add.zone(0, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
        const btnLabel = `ПРОДАТЬ (${sellPrice} 🪙)`;

        const btnTxt = this.add.text(0, btnY, btnLabel, {
          fontSize: '12px',
          fontFamily: FONT_UI,
          color: isDamaged ? '#fda4af' : '#86efac',
          fontStyle: 'bold',
          resolution: dpr
        }).setOrigin(0.5);

        let isSold = false;
        btnZone.on('pointerup', () => {
          if (this.isDragging || isSold) return;
          isSold = true;
          btnZone.disableInteractive();

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

        tile.add([starsTxt, nameTxt, btnGfx, btnTxt, btnZone]);
      } else {
        const emptyGfx = this.add.graphics();
        emptyGfx.fillStyle(0x140d08, 0.36);
        emptyGfx.fillRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, 14);
        emptyGfx.lineStyle(1, 0x8c6239, 0.55);
        emptyGfx.strokeRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, 14);

        emptyGfx.fillStyle(0x2b1d12, 0.75);
        emptyGfx.fillRoundedRect(-tileW * 0.34, 20, tileW * 0.68, 9, 4);
        emptyGfx.fillStyle(0x3d2614, 0.85);
        emptyGfx.fillRoundedRect(-tileW * 0.28, 14, tileW * 0.56, 7, 3);
        tile.add(emptyGfx);

        const iconEmpty = this.add.text(0, -24, '🏛', {
          fontSize: '28px',
          alpha: 0.25,
          resolution: dpr
        }).setOrigin(0.5);

        const emptyTitle = this.add.text(0, 48, 'Свободная витрина', {
          fontSize: '12.5px',
          fontFamily: FONT_UI,
          color: '#b89f82',
          fontStyle: 'bold',
          resolution: dpr
        }).setOrigin(0.5);

        const emptySub = this.add.text(0, 68, 'Отреставрируйте находку', {
          fontSize: '12px',
          fontFamily: FONT_UI,
          color: '#8c735b',
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
