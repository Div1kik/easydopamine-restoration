import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create(data) {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x07090e).setDepth(0);

    this.returnToRestore = data && data.returnToRestore;
    this.activeTab = 'tools';

    // Шапка
    this.add.text(width / 2, 30, 'ЛАВКА МАСТЕРА', {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(10);

    this.coinsText = this.add.text(width / 2, 52, '', {
      fontSize: '13.5px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
    this.updateCoinsDisplay();

    // Переключатель 3 вкладок
    const tabW = (width * 0.90) / 3;
    const tabY = 82;
    const startX = width * 0.05 + tabW / 2;

    // Вкладка 1: Инструменты
    this.tabToolsBtn = this.add.rectangle(startX, tabY, tabW - 4, 34, 0x141a26)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.tabToolsTxt = this.add.text(startX, tabY, 'Инструменты', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    // Вкладка 2: Верстак
    this.tabWorkshopBtn = this.add.rectangle(startX + tabW, tabY, tabW - 4, 34, 0x141a26)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.tabWorkshopTxt = this.add.text(startX + tabW, tabY, 'Верстак', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    // Вкладка 3: Музей
    this.tabMuseumBtn = this.add.rectangle(startX + tabW * 2, tabY, tabW - 4, 34, 0x141a26)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.tabMuseumTxt = this.add.text(startX + tabW * 2, tabY, '🏛️ Музей', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    this.tabToolsBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.activeTab = 'tools';
      this.refreshTabs();
      this.renderContent();
    });

    this.tabWorkshopBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.activeTab = 'workshop';
      this.refreshTabs();
      this.renderContent();
    });

    this.tabMuseumBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.activeTab = 'museum';
      this.refreshTabs();
      this.renderContent();
    });

    this.itemsContainer = this.add.container(0, 114).setDepth(5);

    this.refreshTabs();
    this.renderContent();

    // Кнопка возврата
    const backBtnY = height - 38;
    const backBtn = this.add.rectangle(width / 2, backBtnY, width * 0.88, 44, 0x141a24)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(50);

    const backLabel = this.returnToRestore ? 'Вернуться к артефакту' : 'В главное меню';
    this.add.text(width / 2, backBtnY, backLabel, {
      fontSize: '14.5px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(51);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      if (this.returnToRestore) {
        this.scene.start('RestoreScene');
      } else {
        this.scene.start('MenuScene');
      }
    });
  }

  updateCoinsDisplay() {
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.coinsText.setText(`Казна: ${coins} 🪙`);
  }

  refreshTabs() {
    const setBtn = (btn, txt, active) => {
      btn.setFillStyle(active ? 0xd4af37 : 0x141a26);
      btn.setStrokeStyle(1.5, active ? 0xefbe08 : 0x273142);
      txt.setColor(active ? '#000000' : '#94a3b8');
    };

    setBtn(this.tabToolsBtn, this.tabToolsTxt, this.activeTab === 'tools');
    setBtn(this.tabWorkshopBtn, this.tabWorkshopTxt, this.activeTab === 'workshop');
    setBtn(this.tabMuseumBtn, this.tabMuseumTxt, this.activeTab === 'museum');
  }

  renderContent() {
    this.itemsContainer.removeAll(true);
    const { width } = this.scale;

    if (this.activeTab === 'tools') {
      this.renderToolsUpgrades(width);
    } else if (this.activeTab === 'workshop') {
      this.renderWorkshopTiers(width);
    } else if (this.activeTab === 'museum') {
      this.renderMuseumExpansions(width);
    }
  }

  renderToolsUpgrades(width) {
    const tools = [
      { id: 'scraper_2', name: 'Латунный скребок II', desc: 'Увеличивает пятно очистки слоя грязи на 20%', price: 180, icon: 'slot_scraper' },
      { id: 'brush_2', name: 'Беличья кисть II', desc: 'Мягко сметает пыль за меньшее число мазков', price: 240, icon: 'slot_brush_soft' },
      { id: 'solvent_2', name: 'Концентрированный реактив II', desc: 'Быстро растворяет химический налёт', price: 320, icon: 'slot_solvent' },
      { id: 'polish_2', name: 'Шелковая замша II', desc: 'Финишный блеск и глянец высшей пробы', price: 290, icon: 'slot_polish' },
      { id: 'scraper_3', name: 'Лазерный микро-скальпель III', desc: 'Прецизионное снятие породы без риска царапин', price: 950, icon: 'slot_scraper' },
      { id: 'polish_3', name: 'Алмазная эмульсия IV', desc: 'Удваивает шанс идеального зеркального блеска', price: 1600, icon: 'slot_polish' }
    ];

    const cardH = 82;
    const cardW = width * 0.90;

    tools.forEach((t, i) => {
      const cardY = i * (cardH + 8);
      const isBought = localStorage.getItem(`tool_upg_${t.id}`) === 'true';

      const card = this.add.container(width / 2, cardY + cardH / 2);

      const bg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1.5, isBought ? 0x10b981 : 0x253142, 0.8);

      const icon = this.add.image(-cardW / 2 + 38, 0, t.icon).setScale(0.65);

      const title = this.add.text(-cardW / 2 + 76, -20, t.name, {
        fontSize: '13px',
        fontFamily: 'sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      });

      const desc = this.add.text(-cardW / 2 + 76, -2, t.desc, {
        fontSize: '10px',
        fontFamily: 'sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 165 }
      });

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const actionBg = this.add.rectangle(
        0, 0, 76, 32,
        isBought ? 0x1e293b : 0x10b981
      )
        .setStrokeStyle(1, isBought ? 0x334155 : 0x34d399)
        .setInteractive({ useHandCursor: !isBought });

      const actionTxt = this.add.text(
        0, 0,
        isBought ? 'КУПЛЕНО' : `${t.price} 🪙`,
        {
          fontSize: '11px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

      actionBtn.add([actionBg, actionTxt]);

      if (!isBought) {
        actionBg.on('pointerdown', () => {
          const coins = Storage.getCoins();
          if (coins >= t.price) {
            Storage.addCoins(-t.price);
            localStorage.setItem(`tool_upg_${t.id}`, 'true');
            if (AudioManager.playCoin) AudioManager.playCoin();
            this.updateCoinsDisplay();
            this.renderContent();
          } else {
            if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
          }
        });
      }

      card.add([bg, icon, title, desc, actionBtn]);
      this.itemsContainer.add(card);
    });
  }

  renderWorkshopTiers(width) {
    const currentTier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;

    const tiers = [
      { tier: 1, name: 'Сырой подвал', desc: 'Рабочий стол с латунной окантовкой и защитным ковриком', price: 0 },
      { tier: 2, name: 'Чердак антиквара', desc: 'Уютный рабочий стол из дуба с естественным светом', price: 300 },
      { tier: 3, name: 'Лавка редкостей', desc: 'Изумрудный бархат, позолота и антикварные тиски', price: 750 },
      { tier: 4, name: 'Императорская лаборатория', desc: 'Черный мрамор, подсветка и ювелирные держатели', price: 1500 }
    ];

    const cardH = 82;
    const cardW = width * 0.90;

    tiers.forEach((item, i) => {
      const cardY = i * (cardH + 8);
      const isOwned = (item.tier <= currentTier);
      const isCurrent = (item.tier === currentTier);

      const card = this.add.container(width / 2, cardY + cardH / 2);

      const bg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1.5, isCurrent ? 0xe2b35b : 0x253142, 0.8);

      const title = this.add.text(-cardW / 2 + 20, -20, item.name, {
        fontSize: '13.5px',
        fontFamily: 'sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      });

      const desc = this.add.text(-cardW / 2 + 20, -2, item.desc, {
        fontSize: '10px',
        fontFamily: 'sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 130 }
      });

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const actionBg = this.add.rectangle(
        0, 0, 76, 32,
        isCurrent ? 0x1e293b : 0x10b981
      )
        .setStrokeStyle(1, isCurrent ? 0x334155 : 0x34d399)
        .setInteractive({ useHandCursor: !isOwned && (item.tier === currentTier + 1) });

      let btnLabel = isCurrent ? 'АКТИВЕН' : (isOwned ? 'ОТКРЫТ' : `${item.price} 🪙`);

      const actionTxt = this.add.text(0, 0, btnLabel, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      actionBtn.add([actionBg, actionTxt]);

      if (!isOwned && item.tier === currentTier + 1) {
        actionBg.on('pointerdown', () => {
          const coins = Storage.getCoins();
          if (coins >= item.price) {
            Storage.addCoins(-item.price);
            Storage.setWorkshopTier(item.tier);
            if (AudioManager.playCoin) AudioManager.playCoin();
            this.updateCoinsDisplay();
            this.renderContent();
          } else {
            if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
          }
        });
      }

      card.add([bg, title, desc, actionBtn]);
      this.itemsContainer.add(card);
    });
  }

  // Вкладка «Музей»: крупные траты казны на пассивный доход
  renderMuseumExpansions(width) {
    const expansions = [
      { id: 'pedestal_1', name: 'Бархатный пьедестал IV', desc: '+1 слот витрины и +15% к оффлайн-билетам', price: 1200 },
      { id: 'pedestal_2', name: 'Стеклянный купол с подсветкой V', desc: '+1 слот витрины и +25% к оффлайн-билетам', price: 2800 },
      { id: 'hall_antique', name: 'Зал Средиземноморья', desc: 'Удваивает пассивную выручку от античных реликвий', price: 5000 },
      { id: 'hall_royal', name: 'Королевская галерея славы', desc: 'Престиж музея максимального уровня. +50% ко всей кассе', price: 10000 }
    ];

    const cardH = 82;
    const cardW = width * 0.90;

    expansions.forEach((exp, i) => {
      const cardY = i * (cardH + 8);
      const isBought = localStorage.getItem(`museum_upg_${exp.id}`) === 'true';

      const card = this.add.container(width / 2, cardY + cardH / 2);

      const bg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1.5, isBought ? 0x10b981 : 0x3b82f6, 0.8);

      const title = this.add.text(-cardW / 2 + 18, -20, exp.name, {
        fontSize: '13px',
        fontFamily: 'sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      });

      const desc = this.add.text(-cardW / 2 + 18, -2, exp.desc, {
        fontSize: '10px',
        fontFamily: 'sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 135 }
      });

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const actionBg = this.add.rectangle(
        0, 0, 78, 32,
        isBought ? 0x1e293b : 0x1d4ed8
      )
        .setStrokeStyle(1, isBought ? 0x334155 : 0x60a5fa)
        .setInteractive({ useHandCursor: !isBought });

      const actionTxt = this.add.text(
        0, 0,
        isBought ? 'ПОСТРОЕНО' : `${exp.price} 🪙`,
        {
          fontSize: '10.5px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

      actionBtn.add([actionBg, actionTxt]);

      if (!isBought) {
        actionBg.on('pointerdown', () => {
          const coins = Storage.getCoins();
          if (coins >= exp.price) {
            Storage.addCoins(-exp.price);
            localStorage.setItem(`museum_upg_${exp.id}`, 'true');
            if (AudioManager.playCoin) AudioManager.playCoin();
            this.updateCoinsDisplay();
            this.renderContent();
          } else {
            if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
          }
        });
      }

      card.add([bg, title, desc, actionBtn]);
      this.itemsContainer.add(card);
    });
  }
}
