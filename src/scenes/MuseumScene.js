import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MuseumScene extends Phaser.Scene {
  constructor() {
    super('MuseumScene');
  }

  create() {
    const { width, height } = this.scale;
    const bg = this.add.graphics().setDepth(0);

    bg.fillStyle(0x07090e, 1);
    bg.fillRect(0, 0, width, height);

    if (AudioManager.playShopBell) {
      AudioManager.playShopBell();
    }

    // Шапка
    this.add.text(width / 2, 34, 'ВИТРИНА МАГАЗИНА', {
      fontSize: '18px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(20);

    this.infoText = this.add.text(width / 2, 56, '', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#94a3b8'
    }).setOrigin(0.5).setDepth(20);

    // Границы списка витрины
    this.listTopY = 82;
    this.listBottomY = height - 68;
    this.listHeight = this.listBottomY - this.listTopY;

    this.listCont = this.add.container(0, this.listTopY).setDepth(5);

    // Маска видимости списка
    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.listTopY, width, this.listHeight);
    this.listCont.setMask(maskShape.createGeometryMask());

    this.setupScroll();
    this.renderExhibitList();

    // Нижняя плашка
    this.add.rectangle(width / 2, height - 34, width, 68, 0x07090e).setDepth(30);

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
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(32);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) {
        AudioManager.playClick();
      }
      this.scene.start('MenuScene');
    });
  }

  updateHeader() {
    const inventory = Storage.getInventory ? Storage.getInventory() : [];
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.infoText.setText(`Товаров на витрине: ${inventory.length} • Казна: ${coins} 🪙`);
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
    const inventory = Storage.getInventory ? Storage.getInventory() : [];
    this.updateHeader();

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
        'ВИТРИНА ПОКА ПУСТА',
        {
          fontSize: '15px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#64748b',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

      const t2 = this.add.text(
        width / 2,
        height * 0.38 - this.listTopY + 14,
        'Отреставрируйте артефакты в экспедициях,\nчтобы выставить их на витрину магазина.',
        {
          fontSize: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#475569',
          align: 'center'
        }
      ).setOrigin(0.5);

      this.listCont.add([box, t1, t2]);
      return;
    }

    const cardH = 88;
    const spacing = 10;
    const cardW = width * 0.90;

    inventory.forEach((item, idx) => {
      const cardY = idx * (cardH + spacing) + cardH / 2 + 6;
      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1, 0x273142, 0.8);

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
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      );

      const sellPrice = item.marketValue || 200;

      const val = this.add.text(
        -cardW / 2 + 80,
        10,
        `Ценность: ${sellPrice} 🪙`,
        {
          fontSize: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#facc15',
          fontStyle: 'bold'
        }
      );

      const sellBtnBg = this.add.rectangle(
        cardW / 2 - 50,
        0,
        80,
        36,
        0x16241a
      )
        .setStrokeStyle(1.5, 0x22c55e, 0.8)
        .setInteractive({ useHandCursor: true });

      const sellBtnTxt = this.add.text(
        cardW / 2 - 50,
        0,
        'ПРОДАТЬ',
        {
          fontSize: '11px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#22c55e',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

      let isSold = false;

      sellBtnBg.on('pointerup', () => {
        if (!this.isDragging && !isSold) {
          isSold = true;
          sellBtnBg.disableInteractive();

          // 1. Звук монет
          if (AudioManager.playCoin) AudioManager.playCoin();

          // 2. Мгновенное начисление и удаление из Storage
          Storage.addCoins(sellPrice);
          Storage.removeArtifactFromInventory(item.instanceId);

          // 3. Мгновенно обновляем шапку
          this.updateHeader();

          // 4. Визуальная анимация продажи
          sellBtnBg.setFillStyle(0x334155, 0.5);
          sellBtnTxt.setText('ПРОДАНО').setColor('#94a3b8');

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
        }
      });

      card.add([cardBg, icon, name, val, sellBtnBg, sellBtnTxt]);
      this.listCont.add(card);
    });

    const totalHeight = inventory.length * (cardH + spacing) + 20;
    this.minScrollY = Math.min(this.listTopY, this.listBottomY - totalHeight);
  }
}
