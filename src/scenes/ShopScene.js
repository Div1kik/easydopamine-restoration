import { TOOLS } from '../data/tools.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x161311);

    this.add.text(width / 2, 45, 'ИНСТРУМЕНТЫ', {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#d4af37',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    const currentCoins = Storage.getCoins();
    this.coinsText = this.add.text(width / 2, 75, `Баланс: ${currentCoins} золота`, {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.renderCards();

    // Кнопка возврата в меню
    const backBtn = this.add.rectangle(width / 2, height - 55, 220, 48, 0x34495e)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height - 55, 'В главное меню', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  renderCards() {
    const { width } = this.scale;
    const startY = 120;
    const cardH = 175;
    const owned = Storage.getOwnedTools();
    const equipped = Storage.getEquippedTool();

    TOOLS.forEach((tool, idx) => {
      const cardY = startY + idx * cardH;
      const isOwned = owned.includes(tool.id);
      const isEquipped = equipped === tool.id;

      // Подложка
      this.add.rectangle(width / 2, cardY + 65, width * 0.9, 150, 0x221d19)
        .setStrokeStyle(1.5, isEquipped ? 0x2ecc71 : 0x444444, 0.8);

      // Иконка
      const icon = this.add.image(width * 0.22, cardY + 65, tool.textureKey);
      icon.setScale(0.85);

      // Тексты
      const textX = width * 0.38;
      this.add.text(textX, cardY + 20, tool.name, {
        fontSize: '16px',
        fontFamily: 'sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      });

      this.add.text(textX, cardY + 45, tool.desc, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: '#bdc3c7',
        wordWrap: { width: width * 0.52 }
      });

      this.add.text(textX, cardY + 80, `Радиус: ${tool.brushRadius}px`, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: '#e67e22'
      });

      // Кнопка
      const btnX = width * 0.72;
      const btnY = cardY + 115;
      const btn = this.add.rectangle(btnX, btnY, 130, 36, isEquipped ? 0x27ae60 : (isOwned ? 0x2980b9 : 0xd35400))
        .setInteractive({ useHandCursor: true });

      let btnLabel = `КУПИТЬ ${tool.price}`;
      if (isEquipped) {
        btnLabel = 'АКТИВНА';
      } else if (isOwned) {
        btnLabel = 'ВЫБРАТЬ';
      }

      this.add.text(btnX, btnY, btnLabel, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        if (isEquipped) return;

        if (isOwned) {
          Storage.equipTool(tool.id);
          this.scene.restart();
        } else {
          if (Storage.buyTool(tool.id, tool.price)) {
            AudioManager.playCoin();
            this.scene.restart();
          } else {
            this.tweens.add({
              targets: this.coinsText,
              scale: 1.2,
              duration: 120,
              yoyo: true
            });
          }
        }
      });
    });
  }
}
