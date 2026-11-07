import { ARTIFACTS, ERAS } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';

export class MuseumScene extends Phaser.Scene {
  constructor() {
    super('MuseumScene');
  }

  create() {
    const { width, height } = this.scale;
    this.currentEraIndex = 0; // Активная вкладка

    this.add.rectangle(width / 2, height / 2, width, height, 0x141210);

    // Заголовок
    this.add.text(width / 2, 38, 'ЗАЛ РЕДКОСТЕЙ', {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#d4af37',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Контейнер для динамического рендера карточек эпохи
    this.eraContainer = this.add.container(0, 0);

    // Вкладки переключения эпох
    this.createEraTabs();
    this.renderCurrentEra();

    // Кнопка возврата в меню
    const backBtn = this.add.rectangle(width / 2, height - 42, 220, 44, 0x34495e)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height - 42, 'В главное меню', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  createEraTabs() {
    const { width } = this.scale;
    const tabY = 75;
    const tabWidth = width / ERAS.length;

    this.tabButtons = [];

    ERAS.forEach((era, idx) => {
      const tabX = tabWidth * idx + tabWidth / 2;
      const isUnlocked = Storage.isEraUnlocked(era.id);

      const tabText = this.add.text(tabX, tabY, era.name.split(' ')[1] || era.name, {
        fontSize: '13px',
        fontFamily: 'sans-serif',
        color: idx === this.currentEraIndex ? '#f1c40f' : (isUnlocked ? '#bdc3c7' : '#555555'),
        fontStyle: 'bold'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      tabText.on('pointerdown', () => {
        this.currentEraIndex = idx;
        this.updateTabStyles();
        this.renderCurrentEra();
      });

      this.tabButtons.push(tabText);
    });
  }

  updateTabStyles() {
    this.tabButtons.forEach((tab, idx) => {
      const isUnlocked = Storage.isEraUnlocked(ERAS[idx].id);
      tab.setColor(idx === this.currentEraIndex ? '#f1c40f' : (isUnlocked ? '#bdc3c7' : '#555555'));
    });
  }

  renderCurrentEra() {
    const { width, height } = this.scale;
    this.eraContainer.removeAll(true);

    const era = ERAS[this.currentEraIndex];
    const isUnlocked = Storage.isEraUnlocked(era.id);

    // Если эпоха заблокирована
    if (!isUnlocked) {
      const lockBg = this.add.rectangle(width / 2, height * 0.46, width * 0.88, 380, 0x1a1816)
        .setStrokeStyle(1.5, 0x444444, 0.6);
      const lockIcon = this.add.image(width / 2, height * 0.40, 'icon_lock').setScale(1.5);
      
      const lockText = this.add.text(width / 2, height * 0.50, `${era.name.toUpperCase()}\nЗАБЛОКИРОВАНА`, {
        fontSize: '18px',
        fontFamily: 'sans-serif',
        color: '#7f8c8d',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);

      const hintText = this.add.text(width / 2, height * 0.58, 'Восстановите все артефакты\nпредыдущей эпохи, чтобы открыть доступ.', {
        fontSize: '13px',
        fontFamily: 'sans-serif',
        color: '#555555',
        align: 'center'
      }).setOrigin(0.5);

      this.eraContainer.add([lockBg, lockIcon, lockText, hintText]);
      return;
    }

    // Если эпоха открыта — показываем 3 артефакта
    const eraArtifacts = ARTIFACTS.filter(a => a.eraId === era.id);
    const unlocked = Storage.getUnlockedArtifacts();
    const startY = 110;
    const cardH = 175;

    eraArtifacts.forEach((item, idx) => {
      const cardY = startY + idx * cardH;
      const isItemUnlocked = unlocked.includes(item.id);
      const stars = Storage.getStars(item.id);

      const bg = this.add.rectangle(width / 2, cardY + 65, width * 0.9, 150, isItemUnlocked ? 0x221d19 : 0x1a1816)
        .setStrokeStyle(1.5, isItemUnlocked ? 0xd4af37 : 0x333333, 0.6);

      if (isItemUnlocked) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => {
          this.scene.start('ArtifactDetailScene', { artifact: item });
        });
      }

      // Миниатюра
      const thumb = this.add.image(width * 0.22, cardY + 65, item.textureKey);
      thumb.setScale(0.28);

      if (!isItemUnlocked) {
        thumb.setTint(0x0a0a0a);
        thumb.setAlpha(0.3);
      }

      // Тексты
      const textX = width * 0.38;
      const eraTitle = this.add.text(textX, cardY + 16, item.eraName.toUpperCase(), {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: isItemUnlocked ? '#e67e22' : '#555555',
        fontStyle: 'bold'
      });

      const nameTitle = this.add.text(textX, cardY + 36, isItemUnlocked ? item.name : 'Неизвестная реликвия', {
        fontSize: '15px',
        fontFamily: 'sans-serif',
        color: isItemUnlocked ? '#ffffff' : '#666666',
        fontStyle: 'bold'
      });

      const descTitle = this.add.text(textX, cardY + 76, isItemUnlocked ? item.museumDesc : 'Скройте слой многовековой пыли в мастерской, чтобы выставить этот шедевр в зале.', {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        color: isItemUnlocked ? '#bdc3c7' : '#555555',
        wordWrap: { width: width * 0.52 }
      });

      this.eraContainer.add([bg, thumb, eraTitle, nameTitle, descTitle]);

      if (isItemUnlocked && stars > 0) {
        for (let s = 0; s < stars; s++) {
          const starIcon = this.add.image(textX + s * 22, cardY + 58, 'icon_star');
          starIcon.setScale(0.5);
          this.eraContainer.add(starIcon);
        }
      }
    });
  }
}
