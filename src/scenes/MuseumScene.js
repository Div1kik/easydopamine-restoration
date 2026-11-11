import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MuseumScene extends Phaser.Scene {
  constructor() {
    super('MuseumScene');
  }

  create() {
    const { width, height } = this.scale;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Глубокий фон залов музея
    const bg = this.add.graphics().setDepth(0);
    bg.fillStyle(0x07090e, 1);
    bg.fillRect(0, 0, width, height);

    if (AudioManager.playShopBell) {
      AudioManager.playShopBell();
    }

    // Верхняя плашка и заголовок
    this.add.text(width / 2, 28, '🏛️ ЗАЛ СЛАВЫ МУЗЕЯ', {
      fontSize: '18px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2,
      resolution: dpr
    }).setOrigin(0.5).setDepth(20);

    this.infoText = this.add.text(width / 2, 48, '', {
      fontSize: '11.5px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#94a3b8',
      resolution: dpr
    }).setOrigin(0.5).setDepth(20);

    this.incomeText = this.add.text(width / 2, 64, '', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#34d399',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(20);

    // Границы списка витрин
    this.listTopY = 82;
    this.listBottomY = height - 68;
    this.listHeight = this.listBottomY - this.listTopY;

    this.listCont = this.add.container(0, this.listTopY).setDepth(5);

    // Маска скролла
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.listTopY, width, this.listHeight);
    this.listCont.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

    this.setupScroll();
    this.renderExhibitList();

    // Нижняя плашка возврата
    this.add.rectangle(width / 2, height - 34, width, 68, 0x07090e, 0.95).setDepth(30);

    const backBtn = this.add.rectangle(
      width / 2,
      height - 34,
      width * 0.88,
      44,
      0x141a24
    )
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(31);

    this.add.text(width / 2, height - 34, 'В главное меню', {
      fontSize: '15px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(32);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) {
        AudioManager.playClick();
      }
      this.scene.start('MenuScene');
    });
  }

  updateHeader() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const inventory = Storage.getInventory ? Storage.getInventory() : [];
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    const maxSlots = Storage.getMaxMuseumCapacity ? Storage.getMaxMuseumCapacity() : 6;

    // Считаем экспонаты, приносящие доход (без сколов / со звездами >= 2)
    const validExhibits = inventory.filter(item => (item.stars === undefined || item.stars >= 2));
    const incomePerHour = validExhibits.length * 12; // 2 монеты за каждые 10 минут = 12/час

    this.infoText.setText(`Экспонаты: ${inventory.length}/${maxSlots}  |  Казна: ${coins} 🪙`);
    this.incomeText.setText(`Доход посетителей: +${incomePerHour} 🪙/час (${validExhibits.length} на витринах)`);
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

  renderExhibitList() {
    this.listCont.removeAll(true);
    this.listCont.y = this.listTopY;

    const { width, height } = this.scale;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const inventory = Storage.getInventory ? Storage.getInventory() : [];
    const maxSlots = Storage.getMaxMuseumCapacity ? Storage.getMaxMuseumCapacity() : 6;
    this.updateHeader();

    const cardH = 88;
    const spacing = 10;
    const cardW = width * 0.90;

    // Пустой музей
    if (inventory.length === 0) {
      this.minScrollY = this.listTopY;
      const box = this.add.rectangle(
        width / 2,
        height * 0.38 - this.listTopY,
        width * 0.88,
        130,
        0x111622
      ).setStrokeStyle(1.5, 0x334155, 0.7);

      const t1 = this.add.text(
        width / 2,
        height * 0.38 - this.listTopY - 16,
        'ВИТРИНЫ МУЗЕЯ ПУСТЫ',
        {
          fontSize: '15px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#64748b',
          fontStyle: 'bold',
          resolution: dpr
        }
      ).setOrigin(0.5);

      const t2 = this.add.text(
        width / 2,
        height * 0.38 - this.listTopY + 16,
        'Отреставрируйте артефакты в экспедициях,\nчтобы выставить их на всеобщее обозрение.',
        {
          fontSize: '12px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#475569',
          align: 'center',
          resolution: dpr
        }
      ).setOrigin(0.5);

      this.listCont.add([box, t1, t2]);
      return;
    }

    // 1. Отрисовка существующих экспонатов
    inventory.forEach((item, idx) => {
      const cardY = idx * (cardH + spacing) + cardH / 2 + 6;
      const card = this.add.container(width / 2, cardY);

      const isDamaged = (item.stars === 1);
      const cardBg = this.add.rectangle(
        0,
        0,
        cardW,
        cardH,
        0x111622,
        0.96
      ).setStrokeStyle(1.5, isDamaged ? 0xef4444 : 0x273142, 0.85);

      // Текстура артефакта
      const tex = this.textures.exists(item.textureKey)
        ? item.textureKey
        : 'art_egypt_scarab';
      const icon = this.add.image(-cardW / 2 + 42, 0, tex).setDisplaySize(58, 58);

      const name = this.add.text(
        -cardW / 2 + 80,
        -20,
        item.name || 'Артефакт',
        {
          fontSize: '14.5px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#ffffff',
          fontStyle: 'bold',
          resolution: dpr
        }
      );

      const sellPrice = item.marketValue || 100;
      const starsBadge = item.stars ? '⭐'.repeat(item.stars) : '⭐⭐⭐';
      const statusColor = isDamaged ? '#ef4444' : '#22c55e';
      const statusText = isDamaged ? 'СКОЛЫ (НЕТ БИЛЕТОВ)' : 'В ЭКСПОЗИЦИИ';

      const val = this.add.text(
        -cardW / 2 + 80,
        10,
        `${sellPrice} 🪙  ${starsBadge} ${statusText}`,
        {
          fontSize: '11px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: statusColor,
          fontStyle: 'bold',
          resolution: dpr
        }
      );

      // Кнопка продажи
      const btnBgColor = isDamaged ? 0x261418 : 0x16241a;
      const btnStroke = isDamaged ? 0xef4444 : 0x22c55e;
      const btnLabel = isDamaged ? 'СКУПЩИКУ' : 'ПРОДАТЬ';

      const sellBtnBg = this.add.rectangle(
        cardW / 2 - 50,
        0,
        80,
        36,
        btnBgColor
      )
        .setStrokeStyle(1.5, btnStroke, 0.8)
        .setInteractive({ useHandCursor: true });

      const sellBtnTxt = this.add.text(
        cardW / 2 - 50,
        0,
        btnLabel,
        {
          fontSize: '10.5px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: isDamaged ? '#fca5a5' : '#22c55e',
          fontStyle: 'bold',
          resolution: dpr
        }
      ).setOrigin(0.5);

      let isSold = false;
      sellBtnBg.on('pointerup', () => {
        if (this.isDragging || isSold) return;
        isSold = true;
        sellBtnBg.disableInteractive();

        if (AudioManager.playCoin) {
          AudioManager.playCoin();
        }

        Storage.addCoins(sellPrice);
        Storage.removeArtifactFromInventory(item.instanceId);

        this.updateHeader();

        sellBtnBg.setFillStyle(0x334155, 0.5);
        sellBtnTxt.setText('ПРОДАНО');
        sellBtnTxt.setColor('#94a3b8');

        this.tweens.add({
          targets: card,
          alpha: 0,
          scaleX: 0.85,
          scaleY: 0.85,
          duration: 180,
          ease: 'Power2',
          onComplete: () => {
            this.renderExhibitList();
          }
        });
      });

      card.add([cardBg, icon, name, val, sellBtnBg, sellBtnTxt]);
      this.listCont.add(card);
    });

    // 2. Отрисовка свободных витринных мест
    const freeSlots = Math.max(0, maxSlots - inventory.length);
    let currentTotalItems = inventory.length;

    for (let i = 0; i < freeSlots; i++) {
      const slotY = currentTotalItems * (cardH + spacing) + cardH / 2 + 6;
      const emptySlot = this.add.container(width / 2, slotY);

      const slotBg = this.add.rectangle(0, 0, cardW, cardH, 0x090d14, 0.7)
        .setStrokeStyle(1, 0x1e293b, 0.8);

      const slotTxt = this.add.text(0, -8, '🏛️ СВОБОДНЫЙ СТЕНД', {
        fontSize: '12.5px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#475569',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      const slotSub = this.add.text(0, 12, 'Отреставрируйте артефакт, чтобы занять место', {
        fontSize: '10.5px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#334155',
        resolution: dpr
      }).setOrigin(0.5);

      emptySlot.add([slotBg, slotTxt, slotSub]);
      this.listCont.add(emptySlot);
      currentTotalItems++;
    }

    const totalHeight = currentTotalItems * (cardH + spacing) + 20;
    this.minScrollY = Math.min(this.listTopY, this.listBottomY - totalHeight);
  }
}
