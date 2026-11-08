import { REGIONS, ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class EraSelectScene extends Phaser.Scene {
  constructor() {
    super('EraSelectScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0d14).setDepth(0);

    const xp = Storage.getXP ? Storage.getXP() : 0;
    const rank = Math.floor(xp / 100) + 1;
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    const inventory = Storage.getInventory ? Storage.getInventory() : [];

    // Строгий линейный порядок разблокировки эпох
    const requiredRestoredPerEra = [0, 2, 4, 6, 8, 10, 12];

    this.eras = REGIONS.map((region, idx) => {
      const neededCount = requiredRestoredPerEra[idx] || 0;
      const isUnlocked = (inventory.length >= neededCount) || (idx === 0);
      return {
        ...region,
        unlocked: isUnlocked,
        needed: neededCount
      };
    });

    this.selectedEraIndex = 0;

    // Шапка
    this.add.text(width / 2, 36, 'КАРТА ЭКСПЕДИЦИЙ', {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(10);

    this.add.text(width / 2, 60, `Ранг Мастера: ${rank}  •  Казна: ${coins} 💰`, {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    // Кнопка сброса с безопасным подтверждением
    const resetBg = this.add.circle(width - 36, 36, 16, 0x1e2430)
      .setStrokeStyle(1.5, 0xef4444, 0.8)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.add.text(width - 36, 36, '🗑', { fontSize: '13px' }).setOrigin(0.5).setDepth(21);

    resetBg.on('pointerdown', () => this.showResetModal());

    // Вкладки эпох
    this.createTabs(width, 94);

    // Контейнер артефактов
    this.listContainer = this.add.container(0, 142).setDepth(5);
    this.renderArtifactsList();

    // Нижняя кнопка возврата с широкой интерактивной зоной
    const backBtnY = height - 42;
    const backBtnBg = this.add.rectangle(width / 2, backBtnY, width * 0.88, 44, 0x141822)
      .setStrokeStyle(1.5, 0x334155, 0.8)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);

    const backBtnText = this.add.text(width / 2, backBtnY, 'В главное меню', {
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2e8f0',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);

    backBtnBg.on('pointerdown', () => {
      AudioManager.playClick();
      this.scene.start('MenuScene');
    });
  }

  createTabs(width, y) {
    if (this.tabsContainer) this.tabsContainer.destroy();
    this.tabsContainer = this.add.container(0, y).setDepth(10);

    const tabWidth = 92;
    const spacing = 6;
    const startX = 14;

    const shortNames = ['Египет', 'Античность', 'Европа', 'Япония', 'Ацтеки', 'Викинги', 'Ренессанс'];

    this.eras.forEach((era, i) => {
      const tabX = startX + i * (tabWidth + spacing);
      const isSelected = (i === this.selectedEraIndex);

      const bg = this.add.rectangle(tabX + tabWidth / 2, 18, tabWidth, 34, isSelected ? 0xd4af37 : 0x121722)
        .setStrokeStyle(1.5, isSelected ? 0xfef08a : 0x273142, 0.9)
        .setInteractive({ useHandCursor: true });

      const lockPrefix = era.unlocked ? '' : '🔒 ';
      const title = `${lockPrefix}${shortNames[i] || era.name}`;

      const text = this.add.text(tabX + tabWidth / 2, 18, title, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: isSelected ? '#000000' : (era.unlocked ? '#94a3b8' : '#475569'),
        fontStyle: 'bold'
      }).setOrigin(0.5);

      bg.on('pointerdown', () => {
        AudioManager.playClick();
        this.selectedEraIndex = i;
        this.createTabs(width, y);
        this.renderArtifactsList();
      });

      this.tabsContainer.add([bg, text]);
    });
  }

  renderArtifactsList() {
    this.listContainer.removeAll(true);
    const { width } = this.scale;
    const currentEra = this.eras[this.selectedEraIndex];

    if (!currentEra.unlocked) {
      const lockBox = this.add.rectangle(width / 2, 180, width * 0.88, 140, 0x111622)
        .setStrokeStyle(1.5, 0xef4444, 0.6);
      const lockTxt = this.add.text(width / 2, 160, '🔒 ЭПОХА ЗАБЛОКИРОВАНА', {
        fontSize: '15px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ef4444',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      const reqTxt = this.add.text(width / 2, 195, `Отреставрируйте ещё минимум предметов,\nчтобы набрать ${currentEra.needed} экспонатов в музей.`, {
        fontSize: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5);
      this.listContainer.add([lockBox, lockTxt, reqTxt]);
      return;
    }

    const eraArtifacts = ARTIFACT_TEMPLATES.filter(a => a.regionId === currentEra.id);
    const cardH = 88;
    const cardW = width * 0.90;

    eraArtifacts.forEach((art, index) => {
      const cardY = index * (cardH + 8);

      const bg = this.add.rectangle(width / 2, cardY + cardH / 2, cardW, cardH, 0x121722, 0.95)
        .setStrokeStyle(1, 0x273142, 0.8)
        .setInteractive({ useHandCursor: true });

      const texKey = this.textures.exists(art.textureKey) ? art.textureKey : 'art_egypt_scarab';
      const icon = this.add.image(width / 2 - cardW / 2 + 44, cardY + cardH / 2, texKey)
        .setDisplaySize(54, 54);

      const title = this.add.text(width / 2 - cardW / 2 + 78, cardY + cardH / 2 - 24, art.name, {
        fontSize: '15px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      });

      const desc = this.add.text(width / 2 - cardW / 2 + 78, cardY + cardH / 2 - 4, art.description || 'Древняя историческая ценность', {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 90 }
      });

      const takeBtn = this.add.text(width / 2 - cardW / 2 + 78, cardY + cardH / 2 + 18, '▶ ВЗЯТЬ НА ВЕРСТАК', {
        fontSize: '11.5px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#10b981',
        fontStyle: 'bold'
      });

      // Клик по всей плашке карточки
      bg.on('pointerdown', () => {
        AudioManager.playClick();
        this.scene.start('RestoreScene', {
          regionId: currentEra.id,
          templateId: art.id
        });
      });

      this.listContainer.add([bg, icon, title, desc, takeBtn]);
    });
  }

  showResetModal() {
    const { width, height } = this.scale;
    const modalCont = this.add.container(0, 0).setDepth(100);

    const darkOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85)
      .setInteractive();

    const box = this.add.rectangle(width / 2, height / 2, width * 0.86, 210, 0x121724)
      .setStrokeStyle(1.5, 0xef4444, 0.9);

    const title = this.add.text(width / 2, height / 2 - 64, 'СБРОС ПРОГРЕССА?', {
      fontSize: '17px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const msg = this.add.text(width / 2, height / 2 - 18, 'Все отреставрированные артефакты,\nмонеты, открытые эпохи и улучшения\nбудут удалены безвозвратно.', {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#cbd5e1',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);

    const confirmBtn = this.add.rectangle(width / 2 - 64, height / 2 + 56, 110, 36, 0xef4444)
      .setInteractive({ useHandCursor: true });
    const confirmTxt = this.add.text(width / 2 - 64, height / 2 + 56, 'СБРОСИТЬ', {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    confirmBtn.on('pointerdown', () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    });

    const cancelBtn = this.add.rectangle(width / 2 + 64, height / 2 + 56, 110, 36, 0x334155)
      .setInteractive({ useHandCursor: true });
    const cancelTxt = this.add.text(width / 2 + 64, height / 2 + 56, 'ОТМЕНА', {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    cancelBtn.on('pointerdown', () => {
      modalCont.destroy();
    });

    modalCont.add([darkOverlay, box, title, msg, confirmBtn, confirmTxt, cancelBtn, cancelTxt]);
  }
}
