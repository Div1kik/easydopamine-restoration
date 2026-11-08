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

    const inventory = Storage.getInventory ? Storage.getInventory() : [];

    // Шапка
    this.add.text(width / 2, 34, 'МУЗЕЙНАЯ ВИТРИНА', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    this.add.text(width / 2, 56, `Экспонатов: ${inventory.length}`, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#94a3b8'
    }).setOrigin(0.5).setDepth(10);

    const listCont = this.add.container(0, 90).setDepth(5);

    if (inventory.length === 0) {
      const box = this.add.rectangle(width / 2, height * 0.4, width * 0.88, 120, 0x111622)
        .setStrokeStyle(1.5, 0x334155, 0.7);
      const t1 = this.add.text(width / 2, height * 0.4 - 14, 'ВИТРИНЫ ПОКА ПУСТЫ', {
        fontSize: '15px',
        fontFamily: 'sans-serif',
        color: '#64748b',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      const t2 = this.add.text(width / 2, height * 0.4 + 14, 'Отреставрируйте артефакты в экспедициях.', {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: '#475569'
      }).setOrigin(0.5);
      listCont.add([box, t1, t2]);
    } else {
      const cardH = 76;
      const cardW = width * 0.90;

      inventory.slice(0, 6).forEach((item, idx) => {
        const cardY = idx * (cardH + 8);
        const card = this.add.container(width / 2, cardY + cardH / 2);

        const cardBg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
          .setStrokeStyle(1, 0x273142, 0.8);

        const tex = this.textures.exists(item.textureKey) ? item.textureKey : 'art_egypt_scarab';
        const icon = this.add.image(-cardW / 2 + 38, 0, tex).setDisplaySize(44, 44);

        const name = this.add.text(-cardW / 2 + 70, -16, item.name || 'Артефакт', {
          fontSize: '14px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          fontStyle: 'bold'
        });

        const val = this.add.text(-cardW / 2 + 70, 10, `Оценка: ${item.marketValue || 200} 💰`, {
          fontSize: '11px',
          fontFamily: 'sans-serif',
          color: '#22c55e',
          fontStyle: 'bold'
        });

        card.add([cardBg, icon, name, val]);
        listCont.add(card);
      });
    }

    // Нижняя кнопка возврата
    const backBtn = this.add.rectangle(width / 2, height - 34, width * 0.88, 44, 0x141a24)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(30);

    this.add.text(width / 2, height - 34, 'В главное меню', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(31);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });
  }
}
