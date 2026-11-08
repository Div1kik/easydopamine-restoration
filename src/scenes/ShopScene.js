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
    this.add.text(width / 2, 34, 'ЛАВКА МАСТЕРА', {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2,
      resolution: 2
    }).setOrigin(0.5).setDepth(10);

    this.coinsText = this.add.text(width / 2, 58, '', {
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: 2
    }).setOrigin(0.5).setDepth(10);
    this.updateCoinsDisplay();

    // Переключатель вкладок
    this.tabToolsBtn = this.add.rectangle(width / 2 - 76, 92, 130, 36, 0x141a26)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.tabToolsTxt = this.add.text(width / 2 - 76, 92, 'Инструменты', {
      fontSize: '12.5px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontStyle: 'bold',
      resolution: 2
    }).setOrigin(0.5).setDepth(11);

    this.tabWorkshopBtn = this.add.rectangle(width / 2 + 76, 92, 130, 36, 0x141a26)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.tabWorkshopTxt = this.add.text(width / 2 + 76, 92, 'Верстак', {
      fontSize: '12.5px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontStyle: 'bold',
      resolution: 2
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

    this.itemsContainer = this.add.container(0, 130).setDepth(5);

    this.refreshTabs();
    this.renderContent();

    // Кнопка возврата
    const backBtnY = height - 42;
    const backBtn = this.add.rectangle(width / 2, backBtnY, width * 0.88, 46, 0x141822)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(50);

    const backLabel = this.returnToRestore ? 'Вернуться к артефакту' : 'В главное меню';
    this.add.text(width / 2, backBtnY, backLabel, {
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: 2
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
    this.coinsText.setText(`Казна: ${coins} 💰`);
  }

  refreshTabs() {
    const isTools = (this.activeTab === 'tools');
    this.tabToolsBtn.setFillStyle(isTools ? 0xd4af37 : 0x141a26)
      .setStrokeStyle(1.5, isTools ? 0xfef08a : 0x273142);
    this.tabToolsTxt.setColor(isTools ? '#000000' : '#94a3b8');

    this.tabWorkshopBtn.setFillStyle(!isTools ? 0xd4af37 : 0x141a26)
      .setStrokeStyle(1.5, !isTools ? 0xfef08a : 0x273142);
    this.tabWorkshopTxt.setColor(!isTools ? '#000000' : '#94a3b8');
  }

  renderContent() {
    this.itemsContainer.removeAll(true);
    const { width } = this.scale;

    if (this.activeTab === 'tools') {
      this.renderToolsUpgrades(width);
    } else {
      this.renderWorkshopTiers(width);
    }
  }

  renderToolsUpgrades(width) {
    const tools = [
      { id: 'scraper', name: 'Латунный скребок II', desc: 'Увеличивает пятно очистки слоя грязи на 35%', price: 120, icon: 'slot_scraper' },
      { id: 'brush', name: 'Беличья кисть II', desc: 'Мягко сметает пыль за меньшее число мазков', price: 150, icon: 'slot_brush_soft' },
      { id: 'solvent', name: 'Концентрированный реактив', desc: 'Моментально растворяет плотную патину', price: 200, icon: 'slot_solvent' },
      { id: 'polish', name: 'Шелковая замша', desc: 'Финишный блеск и полировка музейного уровня', price: 180, icon: 'slot_polish' }
    ];

    const cardH = 88;
    const cardW = width * 0.90;

    tools.forEach((t, i) => {
      const cardY = i * (cardH + 8);
      const isBought = localStorage.getItem(`tool_upg_${t.id}`) === 'true';

      const card = this.add.container(width / 2, cardY + cardH / 2);
      const bg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1.5, isBought ? 0x10b981 : 0x253142, 0.8);

      const icon = this.add.image(-cardW / 2 + 42, 0, t.icon).setScale(0.65);

      const title = this.add.text(-cardW / 2 + 80, -22, t.name, {
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: 2
      });

      const desc = this.add.text(-cardW / 2 + 80, -2, t.desc, {
        fontSize: '10.5px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 170 },
        resolution: 2
      });

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const actionBg = this.add.rectangle(0, 0, 78, 34, isBought ? 0x1e293b : 0x10b981)
        .setStrokeStyle(1, isBought ? 0x334155 : 0x34d399)
        .setInteractive({ useHandCursor: !isBought });

      const actionTxt = this.add.text(0, 0, isBought ? 'КУПЛЕНО' : `${t.price} 💰`, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: 2
      }).setOrigin(0.5);

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

    const cardH = 88;
    const cardW = width * 0.90;

    tiers.forEach((item, i) => {
      const cardY = i * (cardH + 8);
      const isOwned = (item.tier <= currentTier);
      const isCurrent = (item.tier === currentTier);

      const card = this.add.container(width / 2, cardY + cardH / 2);
      const bg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1.5, isCurrent ? 0xe2b35b : 0x253142, 0.8);

      const title = this.add.text(-cardW / 2 + 20, -22, item.name, {
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: 2
      });

      const desc = this.add.text(-cardW / 2 + 20, -2, item.desc, {
        fontSize: '10.5px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 130 },
        resolution: 2
      });

      const actionBtn = this.add.container(cardW / 2 - 48, 0);
      const actionBg = this.add.rectangle(0, 0, 84, 34, isCurrent ? 0x1e293b : 0x10b981)
        .setStrokeStyle(1, isCurrent ? 0x334155 : 0x34d399)
        .setInteractive({ useHandCursor: !isOwned && (item.tier === currentTier + 1) });

      let btnLabel = isCurrent ? 'АКТИВЕН' : (isOwned ? 'ОТКРЫТ' : `${item.price} 💰`);
      const actionTxt = this.add.text(0, 0, btnLabel, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: 2
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
}
