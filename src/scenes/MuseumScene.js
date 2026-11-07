import { ARTIFACTS } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';

export class MuseumScene extends Phaser.Scene {
  constructor() {
    super('MuseumScene');
  }

  create() {
    const { width, height } = this.scale;
    const unlocked = Storage.getUnlockedArtifacts();

    this.add.rectangle(width / 2, height / 2, width, height, 0x141210);

    // Заголовок
    this.add.text(width / 2, 45, 'ЗАЛ РЕДКОСТЕЙ', {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#d4af37',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.add.text(width / 2, 75, `Открыто экспонатов: ${unlocked.length} / ${ARTIFACTS.length}`, {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#7f8c8d'
    }).setOrigin(0.5);

    // Витрина: список из 3 артефактов в виде карточек
    const startY = 130;
    const cardH = 175;

    ARTIFACTS.forEach((item, idx) => {
      const cardY = startY + idx * cardH;
      const isUnlocked = unlocked.includes(item.id);

      // Подложка карточки
      const bg = this.add.rectangle(width / 2, cardY + 65, width * 0.9, 150, isUnlocked ? 0x221d19 : 0x1a1816)
        .setStrokeStyle(1.5, isUnlocked ? 0xd4af37 : 0x333333, 0.6);

      // Миниатюра предмета слева
      const thumb = this.add.image(width * 0.22, cardY + 65, item.textureKey);
      thumb.setScale(0.28);

      if (!isUnlocked) {
        thumb.setTint(0x111111);
        thumb.setAlpha(0.4);
      }

      // Тексты справа
      const textX = width * 0.38;
      this.add.text(textX, cardY + 25, item.eraName.toUpperCase(), {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: isUnlocked ? '#e67e22' : '#555555',
        fontStyle: 'bold'
      });

      this.add.text(textX, cardY + 45, isUnlocked ? item.name : 'Неизвестный артефакт', {
        fontSize: '15px',
        fontFamily: 'sans-serif',
        color: isUnlocked ? '#ffffff' : '#777777',
        fontStyle: 'bold'
      });

      this.add.text(textX, cardY + 75, isUnlocked ? item.museumDesc : 'Отреставрируйте этот предмет в мастерской, чтобы выставить его в музее.', {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: isUnlocked ? '#bdc3c7' : '#555555',
        wordWrap: { width: width * 0.5 }
      });
    });

    // Кнопка возврата в меню
    const backBtn = this.add.rectangle(width / 2, height - 55, 220, 48, 0x34495e)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height - 55, 'В главное меню', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    backBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
