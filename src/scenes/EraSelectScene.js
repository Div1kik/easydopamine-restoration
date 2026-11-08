import { REGIONS, ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class EraSelectScene extends Phaser.Scene {
  constructor() {
    super('EraSelectScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x090c13).setDepth(0);

    const xp = Storage.getXP ? Storage.getXP() : 0;
    const rank = Math.floor(xp / 100) + 1;
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    const inventory = Storage.getInventory ? Storage.getInventory() : [];

    // Строгий линейный порядок разблокировки эпох (от Египта до Возрождения)
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

    // Шапка сцены
    this.add.text(width / 2, 34, 'КАРТА ЭКСПЕДИЦИЙ', {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(10);

    this.add.text(width / 2, 58, `Ранг Мастера: ${rank}  •  Казна: ${coins} 💰`, {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    // Кнопка сброса прогресса с модалкой
    const resetBtn = this.add.container(width - 34, 34).setDepth(20);
    const resetBg = this.add.circle(0, 0, 14, 0x1e2430)
      .setStrokeStyle(1, 0xef4444, 0.7)
      .setInteractive({ useHandCursor: true });
    const resetIcon = this.add.text(0, 0, '🗑', { fontSize: '11px' }).setOrigin(0.5);
    resetBtn.add([resetBg, resetIcon]);

    resetBg.on('pointerdown', () => this.showResetModal());

    // Горизонтальный скролл/контейнер вкладок эпох (аккуратный вид без обрезки)
    this.createTabs(width, 92);

    // Контейнер списка артефактов
    this.listContainer = this.add.container(0, 140).setDepth(5);
    this.renderArtifactsList();

    // Нижняя кнопка возврата в меню
    const backBtn = this.add.container(width / 2, height - 44).setDepth(20);
    const btnBg = this.add.rectangle(0, 0, width * 0.85, 44, 0x141822)
      .setStrokeStyle(1.5, 0x334155, 0.8)
      .setInteractive({ useHandCursor: true });
    const btnText = this.add.text(0, 0, 'В главное меню', {
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2e8f0',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    backBtn.add([btnBg, btnText]);

    btnBg.on('pointerdown', () => {
      AudioManager.playClick();
      this.scene.start('MenuScene');
    });
  }

  createTabs(width, y) {
    if (this.tabsContainer) this.tabsContainer.destroy();
    this.tabsContainer = this.add.container(0, y).setDepth(10);

    const tabWidth = 98;
    const spacing = 6;
    const startX = 16;

    this.tabButtons = [];

    this.eras.forEach((era, i) => {
      const tabX = startX + i * (tabWidth + spacing);
      const isSelected = (i === this.selectedEraIndex);

      const tabCont = this.add.container(tabX, 0);
      const bg = this.add.rectangle(tabWidth / 2, 18, tabWidth, 34, isSelected ? 0xd4af37 : 0x121722)
        .setStrokeStyle(1, isSelected ? 0xfef08a : 0x273142, 0.8)
        .setInteractive({ useHandCursor: true });

      const lockPrefix = era.unlocked ? '' : '🔒 ';
      // Компактные читаемые имена
      const shortNames = ['Египет', 'Античность', 'Европа', 'Япония', 'Ацтеки', 'Викинги', 'Ренессанс'];
      const title = `${lockPrefix}${shortNames[i] || era.name}`;

      const text = this.add.text(tabWidth / 2, 18, title, {
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

      tabCont.add([bg, text]);
      this.tabsContainer.add(tabCont);
    });
  }

  renderArtifactsList() {
    this.listContainer.removeAll(true);
    const { width } = this.scale;
    const currentEra = this.eras[this.selectedEraIndex];

    if (!currentEra.unlocked) {
      const lockBox = this.add.rectangle(width / 2, 180, width * 0.88, 140, 0x111622)
        .setStrokeStyle(1, 0xef4444, 0.5);
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
    const cardH = 92;
    const cardW = width * 0.90;

    eraArtifacts.forEach((art, index) => {
      const cardY = index * (cardH + 8);
      const card = this.add.container(width / 2, cardY + cardH / 2);

      const bg = this.add.rectangle(0, 0, cardW, cardH, 0x121722, 0.95)
        .setStrokeStyle(1, 0x273142, 0.7);

      const texKey = this.textures.exists(art.textureKey) ? art.textureKey : 'art_egypt_scarab';
      const icon = this.add.image(-cardW / 2 + 46, 0, texKey).setDisplaySize(58, 58);

      const title = this.add.text(-cardW / 2 + 84, -24, art.name, {
        fontSize: '15px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      });

      const desc = this.add.text(-cardW / 2 + 84, -4, art.description || 'Древняя историческая ценность', {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 100 }
      });

      const takeBtn = this.add.text(-cardW / 2 + 84, 20, '▶ ВЗЯТЬ НА ВЕРСТАК', {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#10b981',
        fontStyle: 'bold'
      }).setInteractive({ useHandCursor: true });

      takeBtn.on('pointerdown', () => {
        AudioManager.playClick();
        this.scene.start('RestoreScene', {
          regionId: currentEra.id,
          templateId: art.id
        });
      });

      card.add([bg, icon, title, desc, takeBtn]);
      this.listContainer.add(card);
    });
  }

  showResetModal() {
    const { width, height } = this.scale;
    const modalCont = this.add.container(0, 0).setDepth(100);

    const darkOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.82)
      .setInteractive();

    const box = this.add.rectangle(width / 2, height / 2, width * 0.84, 210, 0x121724)
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

    // Кнопка подтверждения сброса
    const confirmBtn = this.add.rectangle(width / 2 - 66, height / 2 + 56, 110, 36, 0xef4444)
      .setInteractive({ useHandCursor: true });
    const confirmTxt = this.add.text(width / 2 - 66, height / 2 + 56, 'СБРОСИТЬ', {
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

    // Кнопка отмены
    const cancelBtn = this.add.rectangle(width / 2 + 66, height / 2 + 56, 110, 36, 0x334155)
      .setInteractive({ useHandCursor: true });
    const cancelTxt = this.add.text(width / 2 + 66, height / 2 + 56, 'ОТМЕНА', {
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
