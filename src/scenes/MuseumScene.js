import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MuseumScene extends Phaser.Scene {
  constructor() {
    super('MuseumScene');
  }

  create() {
    const { width, height } = this.scale;

    // Звон колокольчиков над дверью и мелодия лавки
    AudioManager.playDoorBells();
    AudioManager.playEraMusic('shop');

    // Интерьер лавки с резными полками
    this.add.image(width / 2, height / 2, 'bg_antique_shop').setDepth(0);

    // Заголовок лавки
    this.add.text(width / 2, 38, 'ЛАВКА ДРЕВНОСТЕЙ', {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#d4af37',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(2);

    this.balanceText = this.add.text(width / 2, 65, `Касса лавки: ${Storage.getCoins()} золота`, {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    this.container = this.add.container(0, 0).setDepth(3);
    this.renderShelves();

    // Кнопка возврата в меню
    const backBtn = this.add.rectangle(width / 2, height - 42, 220, 44, 0x34495e)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.add.text(width / 2, height - 42, 'Выйти из лавки', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    backBtn.on('pointerdown', () => {
      AudioManager.stopMusic();
      this.scene.start('MenuScene');
    });
  }

  renderShelves() {
    const { width } = this.scale;
    this.container.removeAll(true);

    const inventory = Storage.getInventory();

    if (inventory.length === 0) {
      const emptyBg = this.add.rectangle(width / 2, 380, width * 0.88, 300, 0x141210, 0.9)
        .setStrokeStyle(1.5, 0x444444);
      const emptyText = this.add.text(width / 2, 350, 'ПОЛКИ ЛАВКИ ПУСТЫ', {
        fontSize: '20px',
        fontFamily: 'sans-serif',
        color: '#7f8c8d',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const hintText = this.add.text(width / 2, 400, 'Отреставрируйте новые заказы на верстаке,\nчтобы выставить их на полку для покупателей.', {
        fontSize: '13px',
        fontFamily: 'sans-serif',
        color: '#bdc3c7',
        align: 'center'
      }).setOrigin(0.5);

      this.container.add([emptyBg, emptyText, hintText]);
      return;
    }

    const startY = 95;
    const cardH = 148;

    inventory.forEach((item, idx) => {
      const cardY = startY + idx * cardH;
      if (cardY > 660) return;

      // Подставка под предмет на полке
      const bg = this.add.rectangle(width / 2, cardY + 50, width * 0.9, 130, 0x1e1510, 0.95)
        .setStrokeStyle(1.5, 0xd4af37, 0.8);

      const thumb = this.add.image(width * 0.22, cardY + 50, item.textureKey).setScale(0.26);

      const textX = width * 0.38;
      const title = this.add.text(textX, cardY + 12, item.name, {
        fontSize: '15px',
        fontFamily: 'sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      });

      const origin = this.add.text(textX, cardY + 32, item.regionName, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: '#e67e22',
        fontStyle: 'bold'
      });

      const desc = this.add.text(textX, cardY + 50, item.museumDesc, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: '#bdc3c7',
        wordWrap: { width: width * 0.52 }
      });

      // Кнопка продажи артефакта покупателю
      const sellBtn = this.add.rectangle(textX + 70, cardY + 92, 140, 30, 0x27ae60)
        .setInteractive({ useHandCursor: true });
      const sellTxt = this.add.text(textX + 70, cardY + 92, `ПРОДАТЬ (+${item.marketValue})`, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      sellBtn.on('pointerdown', () => {
        Storage.addCoins(item.marketValue);
        Storage.removeArtifactFromInventory(item.instanceId);
        AudioManager.playCoin();
        if (navigator.vibrate) navigator.vibrate([20, 30]);

        this.balanceText.setText(`Касса лавки: ${Storage.getCoins()} золота`);
        this.renderShelves();
      });

      this.container.add([bg, thumb, title, origin, desc, sellBtn, sellTxt]);
    });
  }
}
