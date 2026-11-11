import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const dpr = Math.max(window.devicePixelRatio || 1, 2.5);
    this.dpr = dpr;

    this.add.rectangle(width / 2, height / 2, width, height, 0x07090e).setDepth(0);

    this.returnToRestore = data && data.returnToRestore;
    this.activeTab = 'tools';

    // Генерируем уникальные векторные HD-текстуры для всех 12 инструментов
    this.generateHDToolTextures();

    // Заголовок
    const title = this.add.text(width / 2, 28, 'ЛАВКА МАСТЕРА', {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e2b35b',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(20);
    title.setResolution(dpr);

    this.coinsText = this.add.text(width / 2, 50, '', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(20);
    this.coinsText.setResolution(dpr);
    this.updateCoinsDisplay();

    // Переключатели вкладок
    const tabW = (width * 0.90) / 3;
    const tabY = 78;
    const startX = width * 0.05 + tabW / 2;

    this.tabToolsBtn = this.add.rectangle(startX, tabY, tabW - 4, 32, 0x141a24)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabToolsTxt = this.add.text(startX, tabY, 'Инструменты', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);
    this.tabToolsTxt.setResolution(dpr);

    this.tabWorkshopBtn = this.add.rectangle(startX + tabW, tabY, tabW - 4, 32, 0x141a24)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabWorkshopTxt = this.add.text(startX + tabW, tabY, 'Верстак', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);
    this.tabWorkshopTxt.setResolution(dpr);

    this.tabMuseumBtn = this.add.rectangle(startX + tabW * 2, tabY, tabW - 4, 32, 0x141a24)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabMuseumTxt = this.add.text(startX + tabW * 2, tabY, '🏛️ Музей', {
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);
    this.tabMuseumTxt.setResolution(dpr);

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

    // Скролл-контейнер
    this.listTopY = 108;
    this.listBottomY = height - 64;
    this.listHeight = this.listBottomY - this.listTopY;

    this.itemsContainer = this.add.container(0, this.listTopY).setDepth(5);

    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.listTopY, width, this.listHeight);
    this.itemsContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

    this.setupScroll();
    this.refreshTabs();
    this.renderContent();

    // Кнопка возврата
    this.add.rectangle(width / 2, height - 32, width, 64, 0x07090e, 0.95).setDepth(30);

    const backBtnY = height - 32;
    const backBtn = this.add.rectangle(width / 2, backBtnY, width * 0.88, 42, 0x141a24)
      .setStrokeStyle(1.5, 0x475569, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(31);

    const backLabel = this.returnToRestore ? 'Вернуться к артефакту' : 'В главное меню';
    const backTxt = this.add.text(width / 2, backBtnY, backLabel, {
      fontSize: '14.5px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(32);
    backTxt.setResolution(dpr);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      if (this.returnToRestore) {
        this.scene.start('RestoreScene');
      } else {
        this.scene.start('MenuScene');
      }
    });
  }

  // Генерация уникальных HD-иконок для всех 12 грейдов
  generateHDToolTextures() {
    const s = 96; // Высокое разрешение канваса иконки (96x96 пикселей)

    const drawItem = (key, drawFn) => {
      if (this.textures.exists(key)) return;
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      drawFn(gfx, s);
      gfx.generateTexture(key, s, s);
      gfx.destroy();
    };

    // 1. Скребок II: Латунный треугольный скребок
    drawItem('hd_scraper_2', (g, s) => {
      g.fillStyle(0x78350f, 1);
      g.fillRect(s * 0.44, s * 0.45, s * 0.12, s * 0.48); // Ручка
      g.fillStyle(0xd97706, 1);
      g.fillTriangle(s * 0.5, s * 0.12, s * 0.18, s * 0.46, s * 0.82, s * 0.46); // Латунное лезвие
      g.lineStyle(2, 0xfde047, 1);
      g.strokeTriangle(s * 0.5, s * 0.12, s * 0.18, s * 0.46, s * 0.82, s * 0.46);
    });

    // 2. Скальпель III: Стальное изогнутое хирургическое лезвие
    drawItem('hd_scraper_3', (g, s) => {
      g.fillStyle(0x334155, 1);
      g.fillRoundedRect(s * 0.42, s * 0.38, s * 0.16, s * 0.55, 4); // Металлическая рифленая ручка
      g.fillStyle(0xe2e8f0, 1);
      g.beginPath();
      g.moveTo(s * 0.5, s * 0.08);
      g.lineTo(s * 0.72, s * 0.38);
      g.lineTo(s * 0.5, s * 0.38);
      g.closePath();
      g.fillPath(); // Острое хирургическое перо
      g.lineStyle(2, 0x38bdf8, 0.9);
      g.strokeLineShape(new Phaser.Geom.Line(s * 0.5, s * 0.08, s * 0.72, s * 0.38));
    });

    // 3. Лазер IV: Высокотехнологичный эмиттер с неоновым ядром
    drawItem('hd_scraper_4', (g, s) => {
      g.fillStyle(0x0f172a, 1);
      g.fillRoundedRect(s * 0.40, s * 0.30, s * 0.20, s * 0.60, 6);
      g.lineStyle(2, 0xfacc15, 1);
      g.strokeRoundedRect(s * 0.40, s * 0.30, s * 0.20, s * 0.60, 6);
      // Кристалл лазера
      g.fillStyle(0x38bdf8, 1);
      g.fillTriangle(s * 0.5, s * 0.06, s * 0.38, s * 0.28, s * 0.62, s * 0.28);
      // Энергетический луч
      g.lineStyle(3, 0x06b6d4, 1);
      g.strokeLineShape(new Phaser.Geom.Line(s * 0.5, s * 0.06, s * 0.5, s * 0.00));
    });

    // 4. Кисть II: Классическая беличья круглая кисть
    drawItem('hd_brush_2', (g, s) => {
      g.fillStyle(0x9a3412, 1);
      g.fillRect(s * 0.45, s * 0.42, s * 0.10, s * 0.52);
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(s * 0.40, s * 0.34, s * 0.20, s * 0.10); // Обойма
      g.fillStyle(0xd97706, 1);
      g.fillCircle(s * 0.50, s * 0.22, s * 0.18); // Пышный ворс
    });

    // 5. Веерная кисть III: Расклешённый веер из тонкого волоса
    drawItem('hd_brush_3', (g, s) => {
      g.fillStyle(0x1e293b, 1);
      g.fillRect(s * 0.46, s * 0.44, s * 0.08, s * 0.50);
      g.fillStyle(0x38bdf8, 1);
      g.fillRect(s * 0.42, s * 0.38, s * 0.16, s * 0.08);
      g.fillStyle(0xf1f5f9, 0.95);
      g.beginPath();
      g.moveTo(s * 0.42, s * 0.38);
      g.lineTo(s * 0.12, s * 0.14);
      g.lineTo(s * 0.88, s * 0.14);
      g.lineTo(s * 0.58, s * 0.38);
      g.closePath();
      g.fillPath(); // Широкий веер
    });

    // 6. Ионизатор IV: Сопло антистатического обдува
    drawItem('hd_brush_4', (g, s) => {
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(s * 0.36, s * 0.32, s * 0.28, s * 0.60, 4);
      g.fillStyle(0xfacc15, 1);
      g.fillRect(s * 0.44, s * 0.16, s * 0.12, s * 0.18); // Сопло
      // Ионизирующее кольцо
      g.lineStyle(3, 0xa855f7, 0.9);
      g.strokeCircle(s * 0.5, s * 0.12, s * 0.14);
    });

    // 7. Реактив II: Стеклянная аптекарская склянка
    drawItem('hd_solvent_2', (g, s) => {
      g.fillStyle(0x065f46, 1);
      g.fillRoundedRect(s * 0.32, s * 0.32, s * 0.36, s * 0.56, 8); // Зеленая бутыль
      g.fillStyle(0xd97706, 1);
      g.fillRect(s * 0.44, s * 0.18, s * 0.12, s * 0.14); // Пробка
      g.fillStyle(0x34d399, 0.8);
      g.fillRect(s * 0.38, s * 0.46, s * 0.24, s * 0.26); // Этикетка
    });

    // 8. Царская эссенция III: Эрленмейеровская колба с фиолетовым составом
    drawItem('hd_solvent_3', (g, s) => {
      g.fillStyle(0x581c87, 0.9);
      g.beginPath();
      g.moveTo(s * 0.44, s * 0.20);
      g.lineTo(s * 0.56, s * 0.20);
      g.lineTo(s * 0.56, s * 0.38);
      g.lineTo(s * 0.84, s * 0.82);
      g.lineTo(s * 0.16, s * 0.82);
      g.lineTo(s * 0.44, s * 0.38);
      g.closePath();
      g.fillPath(); // Колба
      g.lineStyle(2, 0xc084fc, 1);
      g.strokePath();
    });

    // 9. Ультразвук IV: Хромированный сопловой распылитель
    drawItem('hd_solvent_4', (g, s) => {
      g.fillStyle(0x475569, 1);
      g.fillRoundedRect(s * 0.38, s * 0.26, s * 0.24, s * 0.64, 4);
      g.fillStyle(0x0284c7, 1);
      g.fillCircle(s * 0.5, s * 0.22, s * 0.16); // Ультразвуковая мембрана
      g.lineStyle(2, 0x38bdf8, 1);
      g.strokeCircle(s * 0.5, s * 0.22, s * 0.22);
    });

    // 10. Замша II: Свёрнутый рулон натуральной кожи
    drawItem('hd_polish_2', (g, s) => {
      g.fillStyle(0xd97706, 1);
      g.fillRoundedRect(s * 0.26, s * 0.36, s * 0.48, s * 0.36, 12);
      g.lineStyle(3, 0x92400e, 1);
      g.strokeCircle(s * 0.36, s * 0.54, s * 0.14); // Складка рулона
    });

    // 11. Паста ГОИ III: Брусок полировального компаунда
    drawItem('hd_polish_3', (g, s) => {
      g.fillStyle(0x15803d, 1); // Изумрудный оксид хрома
      g.fillRect(s * 0.22, s * 0.34, s * 0.56, s * 0.38);
      g.lineStyle(2, 0x4ade80, 1);
      g.strokeRect(s * 0.22, s * 0.34, s * 0.56, s * 0.38);
      // Салфетка из микрофибры
      g.fillStyle(0x0284c7, 0.85);
      g.fillTriangle(s * 0.22, s * 0.34, s * 0.50, s * 0.14, s * 0.78, s * 0.34);
    });

    // 12. Алмазная эмульсия IV: Профессиональный шприц-дозатор с кристаллом
    drawItem('hd_polish_4', (g, s) => {
      g.fillStyle(0x0284c7, 1);
      g.fillRect(s * 0.38, s * 0.28, s * 0.24, s * 0.48); // Корпус шприца
      g.fillStyle(0xe0f2fe, 1);
      g.fillRect(s * 0.46, s * 0.12, s * 0.08, s * 0.18); // Тонкая канюля
      g.fillStyle(0xfacc15, 1);
      g.fillTriangle(s * 0.5, s * 0.04, s * 0.42, s * 0.12, s * 0.58, s * 0.12); // Алмазный фокус
      g.lineStyle(2, 0x38bdf8, 1);
      g.strokeRect(s * 0.38, s * 0.28, s * 0.24, s * 0.48);
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
  // ВКЛАДКА 1: ИНСТРУМЕНТЫ (12 УНИКАЛЬНЫХ HD-ИКОНОК)
  // =========================================================================
  renderToolsUpgrades(width) {
    const dpr = this.dpr;

    const tools = [
      // СКРЕБКИ
      { id: 'scraper_2', name: 'Латунный скребок II', desc: '+20% к радиусу очистки слоя грязи', price: 180, icon: 'hd_scraper_2' },
      { id: 'scraper_3', name: 'Закалённый скальпель III', desc: '+40% к радиусу очистки, быстрый срез корки', price: 520, icon: 'hd_scraper_3' },
      { id: 'scraper_4', name: 'Лазерный микро-скальпель IV', desc: 'Прецизионное снятие породы в одно касание', price: 1400, icon: 'hd_scraper_4' },

      // КИСТИ
      { id: 'brush_2', name: 'Беличья кисть II', desc: 'Сметает пыль и песок за меньшее число мазков', price: 220, icon: 'hd_brush_2' },
      { id: 'brush_3', name: 'Соболиная веерная кисть III', desc: 'Широкий фронт сметания мелких фракций', price: 600, icon: 'hd_brush_3' },
      { id: 'brush_4', name: 'Ионизирующая кисть IV', desc: 'Сдувает частицы пыли за один лёгкий взмах', price: 1650, icon: 'hd_brush_4' },

      // РЕАКТИВЫ
      { id: 'solvent_2', name: 'Концентрированный состав II', desc: 'Быстро растворяет химический налёт и окислы', price: 260, icon: 'hd_solvent_2' },
      { id: 'solvent_3', name: 'Царская эссенция III', desc: 'Мгновенное растворение застарелой патины', price: 750, icon: 'hd_solvent_3' },
      { id: 'solvent_4', name: 'Ультразвуковой распылитель IV', desc: 'Безупречное удаление налёта без вреда основе', price: 1900, icon: 'hd_solvent_4' },

      // ПОЛИРОЛИ
      { id: 'polish_2', name: 'Шёлковая замша II', desc: 'Финишный глянец и устранение потёртостей', price: 300, icon: 'hd_polish_2' },
      { id: 'polish_3', name: 'Паста ГОИ и микрофибра III', desc: '+15% к идеальному блеску экспоната', price: 850, icon: 'hd_polish_3' },
      { id: 'polish_4', name: 'Алмазная эмульсия IV', desc: 'Зеркальный блеск высшей музейной пробы', price: 2400, icon: 'hd_polish_4' }
    ];

    const cardH = 76;
    const cardW = width * 0.90;

    tools.forEach((t, i) => {
      const cardY = i * (cardH + 8) + cardH / 2;
      const isBought = localStorage.getItem(`tool_upg_${t.id}`) === 'true';

      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1.5, isBought ? 0x10b981 : 0x273142, 0.85);

      // Чёткая HD-иконка
      const icon = this.add.image(-cardW / 2 + 38, 0, t.icon).setDisplaySize(48, 48);

      const title = this.add.text(-cardW / 2 + 72, -16, t.name, {
        fontSize: '12.5px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      title.setResolution(dpr);

      const desc = this.add.text(-cardW / 2 + 72, 2, t.desc, {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 160 }
      });
      desc.setResolution(dpr);

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const actionBg = this.add.rectangle(0, 0, 74, 30, isBought ? 0x1e293b : 0x10b981)
        .setStrokeStyle(1, isBought ? 0x334155 : 0x34d399)
        .setInteractive({ useHandCursor: !isBought });

      const actionTxt = this.add.text(0, 0, isBought ? 'КУПЛЕНО' : `${t.price} 🪙`, {
        fontSize: '10.5px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      actionTxt.setResolution(dpr);

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
        fontStyle: 'bold'
      });
      title.setResolution(dpr);

      const desc = this.add.text(-cardW / 2 + 18, 2, item.desc, {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 130 }
      });
      desc.setResolution(dpr);

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
        fontStyle: 'bold'
      }).setOrigin(0.5);
      actionTxt.setResolution(dpr);

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
        fontStyle: 'bold'
      });
      name.setResolution(dpr);

      const desc = this.add.text(-cardW / 2 + 18, 2, exp.desc, {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 130 }
      });
      desc.setResolution(dpr);

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const actionBg = this.add.rectangle(0, 0, 74, 30, isBought ? 0x1e293b : 0x10b981)
        .setStrokeStyle(1, isBought ? 0x334155 : 0x34d399)
        .setInteractive({ useHandCursor: !isBought });

      const actionTxt = this.add.text(0, 0, isBought ? 'КУПЛЕНО' : `${exp.price} 🪙`, {
        fontSize: '10.5px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      actionTxt.setResolution(dpr);

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
