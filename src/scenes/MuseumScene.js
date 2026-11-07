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

    this.add.text(width / 2, 72, `Открыто: ${unlocked.length} из ${ARTIFACTS.length} (нажмите для осмотра)`, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#7f8c8d'
    }).setOrigin(0.5);

    // Карточки
    const startY = 110;
    const cardH = 175;

    ARTIFACTS.forEach((item, idx) => {
      const cardY = startY + idx * cardH;
      const isUnlocked = unlocked.includes(item.id);

      const bg = this.add.rectangle(width / 2, cardY + 65, width * 0.9, 150, isUnlocked ? 0x221d19 : 0x1a1816)
        .setStrokeStyle(1.5, isUnlocked ? 0xd4af37 : 0x333333, 0.6);

      if (isUnlocked) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => {
          this.scene.start('ArtifactDetailScene', { artifact: item });
        });
      }

      // Миниатюра
      const thumb = this.add.image(width * 0.22, cardY + 65, item.textureKey);
      thumb.setScale(0.28);

      if (!isUnlocked) {
        thumb.setTint(0x111111);
        thumb.setAlpha(0.4);
      }

      // Тексты
      const textX = width * 0.38;
      this.add.text(textX, cardY + 20, item.eraName.toUpperCase(), {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: isUnlocked ? '#e67e22' : '#555555',
        fontStyle: 'bold'
      });

      this.add.text(textX, cardY + 40, isUnlocked ? item.name : 'Неизвестный артефакт', {
        fontSize: '15px',
        fontFamily: 'sans-serif',
        color: isUnlocked ? '#ffffff' : '#777777',
        fontStyle: 'bold'
      });

      this.add.text(textX, cardY + 65, isUnlocked ? item.museumDesc : 'Отреставрируйте этот предмет в мастерской, чтобы открыть его историю.', {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: isUnlocked ? '#bdc3c7' : '#555555',
        wordWrap: { width: width * 0.52 }
      });
    });

    // Назад
    const backBtn = this.add.rectangle(width / 2, height - 50, 220, 46, 0x34495e)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height - 50, 'В главное меню', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
