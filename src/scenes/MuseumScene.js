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

    // Шапка
    this.add.text(width / 2, 34, 'МУЗЕЙНАЯ ВИТРИНА', {
      fontSize: '18px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    this.infoText = this.add.text(width / 2, 56, '', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#94a3b8'
    }).setOrigin(0.5).setDepth(10);

    this.listCont = this.add.container(0, 84).setDepth(5);
    this.renderExhibitList();

    // Нижняя кнопка возврата в меню
    const backBtn = this.add.rectangle(width / 2, height - 34, width * 0.88, 44, 0x141a24)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    this.add.text(width / 2, height - 34, 'В главное меню', {
      fontSize: '15px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(31);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });
  }

  renderExhibitList() {
    this.listCont.removeAll(true);
    const { width, height } = this.scale;
    const inventory = Storage.getInventory ? Storage.getInventory() : [];
    const coins = Storage.getCoins ? Storage.getCoins() : 0;

    this.infoText.setText(`Экспонатов: ${inventory.length}  •  Казна: ${coins} 💰`);

    if (inventory.length === 0) {
      const box = this.add.rectangle(width / 2, height * 0.38, width * 0.88, 130, 0x111622)
        .setStrokeStyle(1.5, 0x334155, 0.7);
      const t1 = this.add.text(width / 2, height * 0.38 - 16, 'ВИТРИНЫ ПОКА ПУСТЫ', {
        fontSize: '15px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#64748b',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      const t2 = this.add.text(width / 2, height * 0.38 + 14, 'Отреставрируйте реликвии в экспедициях,\nчтобы выставить их на продажу или показ.', {
        fontSize: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#475569',
        align: 'center'
      }).setOrigin(0.5);
      this.listCont.add([box, t1, t2]);
      return;
    }

    const cardH = 82;
    const cardW = width * 0.90;

    inventory.forEach((item, idx) => {
      const cardY = idx * (cardH + 10);
      const card = this.add.container(width / 2, cardY + cardH / 2);

      const cardBg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1, 0x273142, 0.8);

      const tex = this.textures.exists(item.textureKey) ? item.textureKey : 'art_egypt_scarab';
      const icon = this.add.image(-cardW / 2 + 38, 0, tex).setDisplaySize(48, 48);

      const name = this.add.text(-cardW / 2 + 70, -18, item.name || 'Артефакт', {
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      });

      const val = this.add.text(-cardW / 2 + 70, 8, `Ценность: ${item.marketValue || 200} 💰`, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#facc15',
        fontStyle: 'bold'
      });

      // КНОПКА ПРОДАЖИ АРТЕФАКТА
      const sellPrice = item.marketValue || 200;
      const sellBtnBg = this.add.rectangle(cardW / 2 - 48, 0, 84, 34, 0x16241a)
        .setStrokeStyle(1.5, 0x22c55e, 0.8)
        .setInteractive({ useHandCursor: true });

      const sellBtnTxt = this.add.text(cardW / 2 - 48, 0, `ПРОДАТЬ`, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#22c55e',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      sellBtnBg.on('pointerdown', () => {
        if (AudioManager.playCoin) AudioManager.playCoin();
        Storage.addCoins(sellPrice);
        Storage.removeArtifactFromInventory(item.instanceId);

        // Анимация продажи с удалением карточки
        this.tweens.add({
          targets: card,
          alpha: 0,
          scaleX: 0.9,
          duration: 200,
          onComplete: () => {
            this.renderExhibitList();
          }
        });
      });

      card.add([cardBg, icon, name, val, sellBtnBg, sellBtnTxt]);
      this.listCont.add(card);
    });
  }
}
