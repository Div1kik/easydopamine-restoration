import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;

    // Глубокий темный фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x07090e).setDepth(0);

    this.returnToRestore = data && data.returnToRestore;
    this.activeTab = 'tools';

    // Шапка сцены
    this.add.text(width / 2, 28, 'ЛАВКА МАСТЕРА', {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2,
      resolution: dpr
    }).setOrigin(0.5).setDepth(20);

    this.coinsText = this.add.text(width / 2, 50, '', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(20);
    this.updateCoinsDisplay();

    // Переключатели трех вкладок
    const tabW = (width * 0.90) / 3;
    const tabY = 78;
    const startX = width * 0.05 + tabW / 2;

    this.tabToolsBtn = this.add.rectangle(startX, tabY, tabW - 4, 32, 0x141a24)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabToolsTxt = this.add.text(startX, tabY, 'Инструменты', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(21);

    this.tabWorkshopBtn = this.add.rectangle(startX + tabW, tabY, tabW - 4, 32, 0x141a24)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabWorkshopTxt = this.add.text(startX + tabW, tabY, 'Верстак', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(21);

    this.tabMuseumBtn = this.add.rectangle(startX + tabW * 2, tabY, tabW - 4, 32, 0x141a24)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabMuseumTxt = this.add.text(startX + tabW * 2, tabY, '🏛️ Музей', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(21);

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

    // Границы области со скроллом
    this.listTopY = 104;
    this.listBottomY = height - 64;
    this.listHeight = this.listBottomY - this.listTopY;

    this.itemsContainer = this.add.container(0, this.listTopY).setDepth(5);

    // Маска скролла (чтобы карточки не вылезали на кнопки)
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.listTopY, width, this.listHeight);
    this.itemsContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

    this.setupScroll();

    this.refreshTabs();
    this.renderContent();

    // Нижняя плашка возврата
    this.add.rectangle(width / 2, height - 32, width, 64, 0x07090e, 0.95).setDepth(30);

    const backBtnY = height - 32;
    const backBtn = this.add.rectangle(width / 2, backBtnY, width * 0.88, 42, 0x141a24)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(31);

    const backLabel = this.returnToRestore ? 'Вернуться к артефакту' : 'В главное меню';
    this.add.text(width / 2, backBtnY, backLabel, {
      fontSize: '14.5px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(32);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      if (this.returnToRestore) {
        this.scene.start('RestoreScene');
      } else {
        this.scene.start('MenuScene');
      }
    });
  }

  setupScroll() {
    let startY = 0;
    let containerStartY = 0;
    this.isDragging = false;

    this.input.on('pointerdown', (p) => {
      if (p.y >= this.listTopY && p.y <= this.listBottomY) {
        startY = p.y;
        containerStartY = this.itemsContainer.y;
        this.isDragging = false;
      }
    });

    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      if (p.y >= this.listTopY && p.y <= this.listBottomY) {
        const dy = p.y - startY;
        if (Math.abs(dy) > 6) {
          this.isDragging = true;
        }
        this.itemsContainer.y = Phaser.Math.Clamp(
          containerStartY + dy,
          this.minScrollY || this.listTopY,
          this.listTopY
        );
      }
    });
  }

  updateCoinsDisplay() {
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    this.coinsText.setText(`Казна: ${coins} 🪙`);
  }

  refreshTabs() {
    const setBtn = (btn, txt, active) => {
      btn.setFillStyle(active ? 0xca8a04 : 0x141a24);
      btn.setStrokeStyle(1.5, active ? 0xfacc15 : 0x273142);
      txt.setColor(active ? '#000000' : '#94a3b8');
    };

    setBtn(this.tabToolsBtn, this.tabToolsTxt, this.activeTab === 'tools');
    setBtn(this.tabWorkshopBtn, this.tabWorkshopTxt, this.activeTab === 'workshop');
    setBtn(this.tabMuseumBtn, this.tabMuseumTxt, this.activeTab === 'museum');
  }

  renderContent() {
    this.itemsContainer.removeAll(true);
    this.itemsContainer.y = this.listTopY;
    const { width } = this.scale;

    if (this.activeTab === 'tools') {
      this.renderToolsUpgrades(width);
    } else if (this.activeTab === 'workshop') {
      this.renderWorkshopTiers(width);
    } else if (this.activeTab === 'museum') {
      this.renderMuseumExpansions(width);
    }
  }

  // =========================================================================
  // ВКЛАДКА 1: ИНСТРУМЕНТЫ (ПОЛНАЯ ЭВОЛЮЦИЯ II, III, IV РАНГОВ)
  // =========================================================================
  renderToolsUpgrades(width) {
    const dpr = this.dpr;

    const tools = [
      // СКРЕБОК
      { id: 'scraper_2', name: 'Латунный скребок II', desc: '+20% к радиусу очистки слоя грязи', price: 180, icon: 'slot_scraper' },
      { id: 'scraper_3', name: 'Закалённый скальпель III', desc: '+40% к радиусу очистки, быстрый срез корки', price: 520, icon: 'slot_scraper' },
      { id: 'scraper_4', name: 'Лазерный микро-скальпель IV', desc: 'Прецизионное снятие породы в одно касание', price: 1400, icon: 'slot_scraper' },

      // КИСТЬ
      { id: 'brush_2', name: 'Беличья кисть II', desc: 'Сметает пыль и песок за меньшее число мазков', price: 220, icon: 'slot_brush' },
      { id: 'brush_3', name: 'Соболиная веерная кисть III', desc: 'Широкий фронт сметания мелких фракций', price: 600, icon: 'slot_brush' },
      { id: 'brush_4', name: 'Ионизирующая кисть IV', desc: 'Сдувает частицы пыли за один лёгкий взмах', price: 1650, icon: 'slot_brush' },

      // РЕАКТИВ
      { id: 'solvent_2', name: 'Концентрированный состав II', desc: 'Быстро растворяет химический налёт и окислы', price: 260, icon: 'slot_solvent' },
      { id: 'solvent_3', name: 'Царская эссенция III', desc: 'Мгновенное растворение застарелой патины', price: 750, icon: 'slot_solvent' },
      { id: 'solvent_4', name: 'Ультразвуковой распылитель IV', desc: 'Безупречное удаление налёта без вреда основе', price: 1900, icon: 'slot_solvent' },

      // ПОЛИРОЛЬ
      { id: 'polish_2', name: 'Шёлковая замша II', desc: 'Финишный глянец и устранение потёртостей', price: 300, icon: 'slot_polish' },
      { id: 'polish_3', name: 'Паста ГОИ и микрофибра III', desc: '+15% к идеальному блеску экспоната', price: 850, icon: 'slot_polish' },
      { id: 'polish_4', name: 'Алмазная эмульсия IV', desc: 'Зеркальный блеск высшей музейной пробы', price: 2400, icon: 'slot_polish' }
    ];

    const cardH = 76;
    const cardW = width * 0.90;

    tools.forEach((t, i) => {
      const cardY = i * (cardH + 8) + cardH / 2;
      const isBought = localStorage.getItem(`tool_upg_${t.id}`) === 'true';

      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1.5, isBought ? 0x10b981 : 0x273142, 0.85);

      // Проверка текстуры перед добавлением (защита от краша)
      const iconKey = this.textures.exists(t.icon) ? t.icon : 'slot_scraper';
      const icon = this.add.image(-cardW / 2 + 36, 0, iconKey).setScale(0.64);

      const title = this.add.text(-cardW / 2 + 72, -16, t.name, {
        fontSize: '12.5px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 72, 2, t.desc, {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 160 },
        resolution: dpr
      });

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const actionBg = this.add.rectangle(0, 0, 74, 30, isBought ? 0x1e293b : 0x10b981)
        .setStrokeStyle(1, isBought ? 0x334155 : 0x34d399)
        .setInteractive({ useHandCursor: !isBought });

      const actionTxt = this.add.text(0, 0, isBought ? 'КУПЛЕНО' : `${t.price} 🪙`, {
        fontSize: '10.5px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      actionBtn.add([actionBg, actionTxt]);

      if (!isBought) {
        actionBg.on('pointerdown', () => {
          if (this.isDragging) return;
          const coins = Storage.getCoins ? Storage.getCoins() : 0;
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

      card.add([cardBg, icon, title, desc, actionBtn]);
      this.itemsContainer.add(card);
    });

    const totalH = tools.length * (cardH + 8) + 20;
    this.minScrollY = Math.min(this.listTopY, this.listBottomY - totalH);
  }

  // =========================================================================
  // ВКЛАДКА 2: ВЕРСТАК (ТИРЫ СТОЛОВ)
  // =========================================================================
  renderWorkshopTiers(width) {
    const dpr = this.dpr;
    const currentTier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;

    const tiers = [
      { tier: 1, name: 'Сырой подвал', desc: 'Рабочий стол с латунной окантовкой и защитным ковриком', price: 0 },
      { tier: 2, name: 'Чердак антиквара', desc: 'Уютный рабочий стол из дуба с естественным светом', price: 300 },
      { tier: 3, name: 'Лавка редкостей', desc: 'Изумрудный бархат, позолота и антикварные тиски', price: 750 },
      { tier: 4, name: 'Императорская лаборатория', desc: 'Чёрный мрамор, подсветка и ювелирные держатели', price: 1800 }
    ];

    const cardH = 76;
    const cardW = width * 0.90;

    tiers.forEach((item, i) => {
      const cardY = i * (cardH + 8) + cardH / 2;
      const isOwned = item.tier <= currentTier;
      const isCurrent = (item.tier === currentTier);

      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1.5, isCurrent ? 0xca8a04 : 0x273142, 0.85);

      const title = this.add.text(-cardW / 2 + 18, -16, item.name, {
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 18, 2, item.desc, {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 130 },
        resolution: dpr
      });

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const canBuy = (!isOwned && item.tier === currentTier + 1);

      const actionBg = this.add.rectangle(0, 0, 74, 30, isCurrent ? 0x1e293b : (canBuy ? 0x10b981 : 0x0f172a))
        .setStrokeStyle(1, isCurrent ? 0xca8a04 : (canBuy ? 0x34d399 : 0x1e293b))
        .setInteractive({ useHandCursor: canBuy });

      let btnLabel = isCurrent ? 'АКТИВЕН' : (isOwned ? 'ОТКРЫТ' : `${item.price} 🪙`);
      const actionTxt = this.add.text(0, 0, btnLabel, {
        fontSize: '10.5px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: isCurrent ? '#facc15' : '#ffffff',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      actionBtn.add([actionBg, actionTxt]);

      if (canBuy) {
        actionBg.on('pointerdown', () => {
          if (this.isDragging) return;
          const coins = Storage.getCoins ? Storage.getCoins() : 0;
          if (coins >= item.price) {
            Storage.addCoins(-item.price);
            if (Storage.setWorkshopTier) Storage.setWorkshopTier(item.tier);

            if (AudioManager.playCoin) AudioManager.playCoin();
            this.updateCoinsDisplay();
            this.renderContent();
          } else {
            if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
          }
        });
      }

      card.add([cardBg, title, desc, actionBtn]);
      this.itemsContainer.add(card);
    });

    const totalH = tiers.length * (cardH + 8) + 20;
    this.minScrollY = Math.min(this.listTopY, this.listBottomY - totalH);
  }

  // =========================================================================
  // ВКЛАДКА 3: МУЗЕЙ (ИНТЕРЬЕР И ПОСТАМЕНТЫ)
  // =========================================================================
  renderMuseumExpansions(width) {
    const dpr = this.dpr;

    const expansions = [
      { id: 'pedestal_1', name: 'Бархатный постамент IV', desc: '+1 слот витрины и +10% к офлайн-билетам', price: 1200 },
      { id: 'pedestal_2', name: 'Стеклянный купол с подсветкой V', desc: '+1 слот витрины и +25% к офлайн-билетам', price: 2800 },
      { id: 'hall_antique', name: 'Зал Средиземноморья', desc: 'Удваивает пассивную выручку от античных реликвий', price: 5800 },
      { id: 'hall_royal', name: 'Королевская галерея славы', desc: 'Престиж музея максимального уровня: +50% ко всей казне', price: 14000 }
    ];

    const cardH = 76;
    const cardW = width * 0.90;

    expansions.forEach((exp, i) => {
      const cardY = i * (cardH + 8) + cardH / 2;
      const isBought = localStorage.getItem(`museum_upg_${exp.id}`) === 'true';

      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1.5, isBought ? 0x10b981 : 0x273142, 0.85);

      const name = this.add.text(-cardW / 2 + 18, -16, exp.name, {
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 18, 2, exp.desc, {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 130 },
        resolution: dpr
      });

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const actionBg = this.add.rectangle(0, 0, 74, 30, isBought ? 0x1e293b : 0x10b981)
        .setStrokeStyle(1, isBought ? 0x334155 : 0x34d399)
        .setInteractive({ useHandCursor: !isBought });

      const actionTxt = this.add.text(0, 0, isBought ? 'КУПЛЕНО' : `${exp.price} 🪙`, {
        fontSize: '10.5px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      actionBtn.add([actionBg, actionTxt]);

      if (!isBought) {
        actionBg.on('pointerdown', () => {
          if (this.isDragging) return;
          const coins = Storage.getCoins ? Storage.getCoins() : 0;
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

      card.add([cardBg, name, desc, actionBtn]);
      this.itemsContainer.add(card);
    });

    const totalH = expansions.length * (cardH + 8) + 20;
    this.minScrollY = Math.min(this.listTopY, this.listBottomY - totalH);
  }
}
