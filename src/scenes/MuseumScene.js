import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MuseumScene extends Phaser.Scene {
  constructor() {
    super('MuseumScene');
  }

  create() {
    const { width, height } = this.scale;

    AudioManager.playDoorBells();
    AudioManager.playEraMusic('shop');

    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;
    // Фон лавки строго по центру
    this.add.image(width / 2, height / 2, `bg_antique_shop_tier_${tier}`).setDepth(0);

    // Шапка
    this.add.rectangle(width / 2, 45, width, 90, 0x0a0c10, 0.92).setDepth(20);
    this.add.text(width / 2, 30, 'ЛАВКА ДРЕВНОСТЕЙ', {
      fontSize: '18px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#d4af37',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(21);

    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.balanceText = this.add.text(width / 2, 52, `Касса лавки: ${coins} золота`, {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);

    // Контейнер скролла полок с маской
    this.scrollContainer = this.add.container(0, 0).setDepth(5);
    const maskShape = this.make.graphics();
    maskShape.fillRect(0, 90, width, height - 150);
    this.scrollContainer.setMask(maskShape.createGeometryMask());

    this.setupScroll(height);
    this.renderShelves();

    // Подвал
    this.add.rectangle(width / 2, height - 32, width, 64, 0x0a0c10, 0.95).setDepth(20);
    const backBtn = this.add.rectangle(width / 2, height - 32, 220, 38, 0x161b24, 0.95)
      .setStrokeStyle(1.5, 0xffffff, 0.2)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    this.add.text(width / 2, height - 32, 'Выйти из лавки', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(22);

    backBtn.on('pointerdown', () => {
      AudioManager.stopMusic();
      this.scene.start('MenuScene');
    });
  }

  setupScroll(height) {
    let startY = 0;
    this.input.on('pointerdown', (p) => {
      if (p.y > 90 && p.y < height - 60) startY = p.y - this.scrollContainer.y;
    });
    this.input.on('pointermove', (p) => {
      if (p.isDown && p.y > 90 && p.y < height - 60) {
        this.scrollContainer.y = Phaser.Math.Clamp(p.y - startY, this.minScrollY, 0);
      }
    });
  }

  renderShelves() {
    const { width, height } = this.scale;
    this.scrollContainer.removeAll(true);
    this.scrollContainer.y = 0;

    const inventory = Storage.getInventory ? Storage.getInventory() : [];

    if (inventory.length === 0) {
      const emptyBg = this.add.rectangle(width / 2, height * 0.44, width * 0.88, 220, 0x141210, 0.9)
        .setStrokeStyle(1.5, 0x444444);
      const emptyText = this.add.text(width / 2, height * 0.41, 'ПОЛКИ ЛАВКИ ПУСТЫ', {
        fontSize: '17px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#7f8c8d',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const hintText = this.add.text(width / 2, height * 0.47, 'Отреставрируйте новые заказы на верстаке,\nчтобы выставить их на полку покупателям.', {
        fontSize: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5);

      this.scrollContainer.add([emptyBg, emptyText, hintText]);
      this.minScrollY = 0;
      return;
    }

    const startY = 105;
    const cardH = 135;

    inventory.forEach((item, idx) => {
      const cardY = startY + idx * cardH;

      const bg = this.add.rectangle(width / 2, cardY + 55, width * 0.9, 120, 0x141822, 0.95)
        .setStrokeStyle(1.5, 0xd4af37, 0.8);

      // ГАРАНТИРОВАННАЯ ТЕКСТУРА: НИКАКИХ ЗЕЛЕНЫХ КВАДРАТОВ
      const texKey = (item.textureKey && this.textures.exists(item.textureKey)) 
        ? item.textureKey 
        : 'art_egypt_scarab';
      const thumb = this.add.image(width * 0.22, cardY + 55, texKey).setScale(0.24);

      const textX = width * 0.38;
      const title = this.add.text(textX, cardY + 12, item.name || 'Реликвия', {
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      });

      const origin = this.add.text(textX, cardY + 30, item.regionName || 'Экспедиция', {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#e67e22',
        fontStyle: 'bold'
      });

      const desc = this.add.text(textX, cardY + 46, item.museumDesc || '', {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: width * 0.52 }
      });

      const sellBtn = this.add.rectangle(textX + 70, cardY + 88, 140, 28, 0x10b981)
        .setInteractive({ useHandCursor: true });
      const sellTxt = this.add.text(textX + 70, cardY + 88, `ПРОДАТЬ (+${item.marketValue})`, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      sellBtn.on('pointerdown', () => {
        Storage.addCoins(item.marketValue);
        Storage.removeArtifactFromInventory(item.instanceId);
        AudioManager.playCoin();
        this.balanceText.setText(`Касса лавки: ${Storage.getCoins()} золота`);
        this.renderShelves();
      });

      this.scrollContainer.add([bg, thumb, title, origin, desc, sellBtn, sellTxt]);
    });

    const totalHeight = startY + inventory.length * cardH + 40;
    this.minScrollY = Math.min(0, (height - 65) - totalHeight);
  }
}
