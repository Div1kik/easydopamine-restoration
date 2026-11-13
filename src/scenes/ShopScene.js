import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { YandexSDK } from '../utils/YandexSDK.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create(data) {
    const { width, height } = this.scale;
    this.dpr = 2.5;

    const FONT_TITLE = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';
    const FONT_UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    this.FONT_UI = FONT_UI;

    if (this.textures.exists('shop_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'shop_bg').setDepth(0);
      bg.setScale(Math.max(width / bg.width, height / bg.height));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0906, 0.28).setDepth(0);
    } else {
      const bg = this.add.graphics().setDepth(0);
      bg.fillGradientStyle(0x21160d, 0x21160d, 0x0d0805, 0x0d0805, 1);
      bg.fillRect(0, 0, width, height);
    }

    this.returnToRestore = data && data.returnToRestore;
    this.activeTab = 'tools';

    this.generateHDToolVariants();

    // Верхняя шапка лавки
    const headerBg = this.add.graphics().setDepth(18);
    headerBg.fillGradientStyle(0x24180f, 0x24180f, 0x140d08, 0x140d08, 0.88);
    headerBg.fillRect(0, 0, width, 108);
    headerBg.lineStyle(1.5, 0xc89d54, 0.65);
    headerBg.lineBetween(0, 108, width, 108);

    this.add.text(width / 2, 20, '🕯 ЛАВКА МАСТЕРА', {
      fontSize: '18px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(20);

    this.coinsText = this.add.text(width / 2, 44, '', {
      fontSize: '13.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(20);
    this.updateCoinsDisplay();

    // Переключатели вкладок
    const tabW = (width * 0.90) / 3;
    const tabH = 34;
    const startX = width * 0.05 + tabW / 2;
    const tabY = 78;

    this.tabToolsBg = this.add.rectangle(startX, tabY, tabW - 4, tabH, 0x1e130b, 0.85)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabToolsTxt = this.add.text(startX, tabY, 'Инструменты', {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      fontStyle: 'bold',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(21);

    this.tabWorkshopBg = this.add.rectangle(startX + tabW, tabY, tabW - 4, tabH, 0x1e130b, 0.85)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabWorkshopTxt = this.add.text(startX + tabW, tabY, 'Верстак', {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      fontStyle: 'bold',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(21);

    this.tabMuseumBg = this.add.rectangle(startX + tabW * 2, tabY, tabW - 4, tabH, 0x1e130b, 0.85)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabMuseumTxt = this.add.text(startX + tabW * 2, tabY, 'Музей', {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      fontStyle: 'bold',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(21);

    this.tabToolsBg.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.activeTab = 'tools';
      this.refreshTabs();
      this.renderContent();
    });

    this.tabWorkshopBg.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.activeTab = 'workshop';
      this.refreshTabs();
      this.renderContent();
    });

    this.tabMuseumBg.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.activeTab = 'museum';
      this.refreshTabs();
      this.renderContent();
    });

    this.listTopY = 114;
    this.listBottomY = height - 68;
    this.listHeight = this.listBottomY - this.listTopY;

    this.itemsContainer = this.add.container(0, this.listTopY).setDepth(5);

    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.listTopY, width, this.listHeight);
    this.itemsContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

    this.setupScroll();
    this.refreshTabs();
    this.renderContent();

    // Нижняя панель с кнопкой возврата
    const footerBg = this.add.graphics().setDepth(30);
    footerBg.fillGradientStyle(0x1f140c, 0x1f140c, 0x120b07, 0x120b07, 0.90);
    footerBg.fillRect(0, height - 66, width, 66);
    footerBg.lineStyle(1.5, 0xc89d54, 0.65);
    footerBg.lineBetween(0, height - 66, width, height - 66);

    const btnW = width * 0.88;
    const btnH = 44;
    const btnY = height - 33;

    const backGfx = this.add.graphics().setDepth(31);
    backGfx.fillGradientStyle(0x332215, 0x332215, 0x1e130b, 0x1e130b, 0.96);
    backGfx.fillRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 11);
    backGfx.lineStyle(1.5, 0xc89d54, 0.9);
    backGfx.strokeRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 11);

    const backZone = this.add.zone(width / 2, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .setDepth(33);

    const backLabel = this.returnToRestore ? 'Вернуться к артефакту' : 'В главное меню';
    this.add.text(width / 2, btnY, backLabel, {
      fontSize: '15px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(32);

    backZone.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      if (this.returnToRestore) {
        this.scene.start('RestoreScene');
      } else {
        this.scene.start('MenuScene');
      }
    });
  }

  generateHDToolVariants() {
    const s = 96;
    const drawIcon = (key, drawFn) => {
      if (this.textures.exists(key)) return;
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      drawFn(gfx, s);
      gfx.generateTexture(key, s, s);
      gfx.destroy();
    };

    drawIcon('hd_scraper_2', (g, s) => {
      g.fillStyle(0x92400e, 1);
      g.fillRoundedRect(s * 0.44, s * 0.48, s * 0.12, s * 0.42, 4);
      g.fillStyle(0xd97706, 1);
      g.fillTriangle(s * 0.5, s * 0.12, s * 0.18, s * 0.48, s * 0.82, s * 0.48);
    });
    drawIcon('hd_scraper_3', (g, s) => {
      g.fillStyle(0x94a3b8, 1);
      g.fillRoundedRect(s * 0.45, s * 0.46, s * 0.10, s * 0.44, 3);
      g.lineStyle(3.5, 0x38bdf8, 0.9);
      g.strokeLineShape(new Phaser.Geom.Line(s * 0.5, s * 0.08, s * 0.72, s * 0.38));
    });
    drawIcon('hd_scraper_4', (g, s) => {
      g.fillStyle(0x0f172a, 1);
      g.fillRoundedRect(s * 0.38, s * 0.36, s * 0.24, s * 0.48, 5);
      g.fillStyle(0x38bdf8, 1);
      g.fillRoundedRect(s * 0.42, s * 0.28, s * 0.16, s * 0.12, 3);
    });
    drawIcon('hd_brush_2', (g, s) => {
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(s * 0.45, s * 0.52, s * 0.10, s * 0.38, 4);
      g.fillStyle(0xfef3c7, 1);
      g.fillRoundedRect(s * 0.28, s * 0.10, s * 0.44, s * 0.28, 6);
    });
    drawIcon('hd_brush_3', (g, s) => {
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(s * 0.46, s * 0.54, s * 0.08, s * 0.36, 4);
      g.fillStyle(0xfdf8f6, 0.96);
      g.fillCircle(s * 0.5, s * 0.24, s * 0.2);
    });
    drawIcon('hd_brush_4', (g, s) => {
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(s * 0.44, s * 0.42, s * 0.12, s * 0.48, 5);
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(s * 0.5, s * 0.26, s * 0.14);
    });
    drawIcon('hd_solvent_2', (g, s) => {
      g.fillStyle(0x0284c7, 0.88);
      g.fillRoundedRect(s * 0.32, s * 0.34, s * 0.36, s * 0.52, 8);
    });
    drawIcon('hd_solvent_3', (g, s) => {
      g.fillStyle(0x0d9488, 0.9);
      g.fillRoundedRect(s * 0.3, s * 0.34, s * 0.4, s * 0.52, 10);
    });
    drawIcon('hd_solvent_4', (g, s) => {
      g.fillStyle(0x6366f1, 1);
      g.fillRoundedRect(s * 0.28, s * 0.44, s * 0.44, s * 0.42, 8);
    });
    drawIcon('hd_polish_2', (g, s) => {
      g.fillStyle(0xd97706, 1);
      g.fillRoundedRect(s * 0.26, s * 0.46, s * 0.48, s * 0.36, 10);
    });
    drawIcon('hd_polish_3', (g, s) => {
      g.fillStyle(0xf59e0b, 1);
      g.fillCircle(s * 0.5, s * 0.58, s * 0.26);
    });
    drawIcon('hd_polish_4', (g, s) => {
      g.fillStyle(0xeab308, 1);
      g.fillRoundedRect(s * 0.26, s * 0.48, s * 0.48, s * 0.34, 8);
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
    const coins = Storage.getCoins();
    const lacquer = Storage.getKintsugiLacquer();
    this.coinsText.setText(`Казна: ${coins} 🪙   |   Лак Кинцуги: ${lacquer} ✨`);
  }

  refreshTabs() {
    const setTab = (bg, txt, active) => {
      bg.setFillStyle(active ? 0xd99b26 : 0x24180f, active ? 0.96 : 0.82);
      bg.setStrokeStyle(1.5, active ? 0xfef08a : 0x8c6239);
      txt.setColor(active ? '#1a1004' : '#d6c3a5');
    };

    setTab(this.tabToolsBg, this.tabToolsTxt, this.activeTab === 'tools');
    setTab(this.tabWorkshopBg, this.tabWorkshopTxt, this.activeTab === 'workshop');
    setTab(this.tabMuseumBg, this.tabMuseumTxt, this.activeTab === 'museum');
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

  renderToolsUpgrades(width) {
    const dpr = this.dpr;
    const FONT_UI = this.FONT_UI;
    const cardH = 82;
    const cardW = width * 0.90;
    let cardIdx = 0;

    // 1. СУНДУК ИНСТРУМЕНТОВ ЗА ЗОЛОТО (с кастомными скинами инструментов и лаком)
    {
      const cardY = cardIdx * (cardH + 8) + cardH / 2;
      const boxCont = this.add.container(width / 2, cardY);

      const boxBg = this.add.graphics();
      boxBg.fillGradientStyle(0x1e293b, 0x1e293b, 0x0f172a, 0x0f172a, 0.88);
      boxBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);
      boxBg.lineStyle(2, 0x38bdf8, 0.95);
      boxBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      const chestIcon = this.add.image(-cardW / 2 + 38, 0, 'toolbox_chest').setDisplaySize(50, 50);

      const title = this.add.text(-cardW / 2 + 74, -22, '🧰 ЛАРЬ МАСТЕРА (СКИНЫ ИНСТРУМЕНТОВ)', {
        fontSize: '12.5px',
        fontFamily: FONT_UI,
        color: '#38bdf8',
        fontStyle: 'bold',
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 74, 4, 'Шанс: Позолоченный, Нефритовый или\nДамасский набор инструментов + лак Кинцуги', {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#e2e8f0',
        resolution: dpr
      });

      const boxPrice = 1200;
      const openBtn = this.add.container(cardW / 2 - 48, 0);
      const openGfx = this.add.graphics();
      openGfx.fillGradientStyle(0x0284c7, 0x0284c7, 0x0369a1, 0x0369a1, 1);
      openGfx.fillRoundedRect(-40, -16, 80, 32, 8);
      openGfx.lineStyle(1, 0x7dd3fc, 0.95);
      openGfx.strokeRoundedRect(-40, -16, 80, 32, 8);

      const openZone = this.add.zone(0, 0, 80, 32).setInteractive({ useHandCursor: true });
      const openTxt = this.add.text(0, 0, `${boxPrice} 🪙`, {
        fontSize: '12.5px',
        fontFamily: FONT_UI,
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      openBtn.add([openGfx, openTxt, openZone]);

      openZone.on('pointerdown', () => {
        if (this.isDragging) return;
        const coins = Storage.getCoins();
        if (coins < boxPrice) {
          if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
          return;
        }
        Storage.addCoins(-boxPrice);
        const res = this.rollToolLootbox();
        if (AudioManager.playShine) AudioManager.playShine();
        this.showRewardPopup(width, res.title, res.subtitle, res.isRare);
      });

      boxCont.add([boxBg, chestIcon, title, desc, openBtn]);
      this.itemsContainer.add(boxCont);
      cardIdx++;
    }

    // 2. БЕСПЛАТНЫЙ СУНДУК ЗА РЕКЛАМУ (1 раз в 15 минут)
    {
      const cardY = cardIdx * (cardH + 8) + cardH / 2;
      const adCont = this.add.container(width / 2, cardY);

      const adBg = this.add.graphics();
      adBg.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.78);
      adBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);
      adBg.lineStyle(1.5, 0xfacc15, 0.85);
      adBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      const title = this.add.text(-cardW / 2 + 16, -18, '🎬 ДАРЫ ГИЛЬДИИ ЗА ПРОСМОТР', {
        fontSize: '13px',
        fontFamily: FONT_UI,
        color: '#facc15',
        fontStyle: 'bold',
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 16, 6, 'Бесплатно: 250–450 🪙 или 1 Золотой лак Кинцуги', {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#f5e6c8',
        resolution: dpr
      });

      const btnX = cardW / 2 - 48;
      const btnGfx = this.add.graphics();
      btnGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
      btnGfx.fillRoundedRect(btnX - 40, -16, 80, 32, 8);
      btnGfx.lineStyle(1, 0xfef08a, 0.95);
      btnGfx.strokeRoundedRect(btnX - 40, -16, 80, 32, 8);

      const btnZone = this.add.zone(btnX, 0, 80, 32).setInteractive({ useHandCursor: true });
      const btnTxt = this.add.text(btnX, 0, 'ЗАБРАТЬ', {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#1a1004',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      btnZone.on('pointerdown', () => {
        if (this.isDragging) return;
        YandexSDK.showRewarded(() => {
          if (Math.random() < 0.35) {
            Storage.addKintsugiLacquer(1);
            this.showRewardPopup(width, '✨ ЗОЛОТОЙ ЛАК КИНЦУГИ', 'Добавлен 1 флакон для золотых швов!', true);
          } else {
            const gold = Math.round((250 + Math.random() * 200) / 10) * 10;
            Storage.addCoins(gold);
            this.showRewardPopup(width, `🪙 +${gold} МОНЕТ`, 'Награда гильдии зачислена в казну!', false);
          }
          if (AudioManager.playCoin) AudioManager.playCoin();
        });
      });

      adCont.add([adBg, title, desc, btnGfx, btnZone, btnTxt]);
      this.itemsContainer.add(adCont);
      cardIdx++;
    }

    // 3. ВЫБОР КАСТОМНОГО СКИНА ИНСТРУМЕНТОВ
    const toolSkins = [
      { id: 'default', name: 'Классика (Орех и сталь)', desc: 'Стандартный набор реставратора' },
      { id: 'gold', name: '★ Императорское золото', desc: 'Позолоченные рукояти (из Ларя мастера)' },
      { id: 'jade', name: '★ Нефритовый мастер', desc: 'Изумрудный нефрит (из Ларя мастера)' },
      { id: 'damascus', name: '★ Дамасский сапфир', desc: 'Воронёная сталь и сапфир (из Ларя мастера)' }
    ];
    const ownedToolSkins = Storage.getOwnedToolSkins();
    const activeToolSkin = Storage.getActiveToolSkin();

    toolSkins.forEach((skin) => {
      const cardY = cardIdx * (cardH + 8) + cardH / 2;
      const isOwned = ownedToolSkins.includes(skin.id);
      const isActive = activeToolSkin === skin.id;

      const card = this.add.container(width / 2, cardY);
      const cardBg = this.add.graphics();
      cardBg.fillGradientStyle(isActive ? 0x3b2614 : 0x261a10, isActive ? 0x3b2614 : 0x261a10, 0x170f09, 0x170f09, 0.66);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);
      cardBg.lineStyle(1.4, isActive ? 0xfacc15 : (isOwned ? 0x4ade80 : 0x64748b), 0.85);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      const title = this.add.text(-cardW / 2 + 16, -18, skin.name, {
        fontSize: '13.5px',
        fontFamily: FONT_UI,
        color: isOwned ? '#fdf6e3' : '#94a3b8',
        fontStyle: 'bold',
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 16, 6, skin.desc, {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        resolution: dpr
      });

      const btnX = cardW / 2 - 48;
      const btnGfx = this.add.graphics();
      btnGfx.fillStyle(isActive ? 0x3b2614 : (isOwned ? 0x1e3322 : 0x1e293b), 0.95);
      btnGfx.fillRoundedRect(btnX - 40, -16, 80, 32, 8);
      btnGfx.lineStyle(1, isActive ? 0xfacc15 : (isOwned ? 0x4ade80 : 0x64748b), 0.95);
      btnGfx.strokeRoundedRect(btnX - 40, -16, 80, 32, 8);

      const btnZone = this.add.zone(btnX, 0, 80, 32);
      if (isOwned && !isActive) btnZone.setInteractive({ useHandCursor: true });

      const btnTxt = this.add.text(btnX, 0, isActive ? 'ВЫБРАНО' : (isOwned ? 'НАДЕТЬ' : 'В ЛАРЕ'), {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: isActive ? '#facc15' : (isOwned ? '#86efac' : '#94a3b8'),
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      btnZone.on('pointerdown', () => {
        if (this.isDragging || !isOwned || isActive) return;
        Storage.setActiveToolSkin(skin.id);
        if (AudioManager.playClick) AudioManager.playClick();
        this.renderContent();
      });

      card.add([cardBg, title, desc, btnGfx, btnZone, btnTxt]);
      this.itemsContainer.add(card);
      cardIdx++;
    });

    // 4. ПРОКАЧКА УРОВНЕЙ ИНСТРУМЕНТОВ (Tier II..IV)
    const tools = [
      { id: 'scraper_2', name: 'Латунный скребок II', desc: '+20% к радиусу очистки слоя грязи', price: 200, icon: 'hd_scraper_2' },
      { id: 'scraper_3', name: 'Хирургический скальпель III', desc: '+40% к радиусу очистки, быстрый срез корки', price: 650, icon: 'hd_scraper_3' },
      { id: 'scraper_4', name: 'Ударный микро-скальпель IV', desc: 'Прецизионное снятие породы в одно касание', price: 1400, icon: 'hd_scraper_4' },
      { id: 'brush_2', name: 'Колонковая кисть II', desc: 'Сметает пыль и сажу на великих реликвиях', price: 220, icon: 'hd_brush_2' },
      { id: 'brush_3', name: 'Соболиная веерная кисть III', desc: 'Широкий охват снятия вековых наслоений', price: 600, icon: 'hd_brush_3' },
      { id: 'brush_4', name: 'Ионизирующая кисть IV', desc: 'Сдувает частицы пыли за один лёгкий взмах', price: 1500, icon: 'hd_brush_4' },
      { id: 'solvent_2', name: 'Нейтрализующий состав II', desc: 'Быстро растворяет минеральный налёт и окислы', price: 260, icon: 'hd_solvent_2' },
      { id: 'solvent_3', name: 'Щадящая эмульсия III', desc: 'Глубокое расщепление въевшейся патины', price: 700, icon: 'hd_solvent_3' },
      { id: 'solvent_4', name: 'Ультразвуковой распылитель IV', desc: 'Мгновенное удаление налёта без вреда основе', price: 1800, icon: 'hd_solvent_4' },
      { id: 'polish_2', name: 'Пчелиный воск II', desc: 'Придаёт экспонатам благородный глянец', price: 300, icon: 'hd_polish_2' },
      { id: 'polish_3', name: 'Паста ГОИ и микрофибра III', desc: '+15% к ювелирному блеску экспоната', price: 850, icon: 'hd_polish_3' },
      { id: 'polish_4', name: 'Алмазная эмульсия IV', desc: 'Зеркальный блеск высшей музейной пробы', price: 2000, icon: 'hd_polish_4' }
    ];

    tools.forEach((tool) => {
      const cardY = cardIdx * (cardH + 8) + cardH / 2;
      const isBought = localStorage.getItem(`tool_upg_${tool.id}`) === 'true';

      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.graphics();
      cardBg.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.62);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);
      cardBg.lineStyle(1.3, isBought ? 0x4ade80 : 0xc89d54, 0.85);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      cardBg.fillStyle(0x0d0805, 0.45);
      cardBg.fillRoundedRect(-cardW / 2 + 10, -28, 56, 56, 9);

      const icon = this.add.image(-cardW / 2 + 38, 0, tool.icon).setDisplaySize(48, 48);

      const title = this.add.text(-cardW / 2 + 74, -20, tool.name, {
        fontSize: '13.5px',
        fontFamily: FONT_UI,
        color: '#fdf6e3',
        fontStyle: 'bold',
        resolution: dpr
      }).setShadow(0, 1, '#000000', 4, false, true);

      const desc = this.add.text(-cardW / 2 + 74, 4, tool.desc, {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        wordWrap: { width: cardW - 172 },
        resolution: dpr
      }).setShadow(0, 1, '#000000', 3, false, true);

      const actionBtn = this.add.container(cardW / 2 - 48, 0);
      const actionGfx = this.add.graphics();
      actionGfx.fillStyle(isBought ? 0x2b1d12 : 0xd99b26, isBought ? 0.88 : 0.98);
      actionGfx.fillRoundedRect(-40, -16, 80, 32, 8);
      actionGfx.lineStyle(1, isBought ? 0x8c6239 : 0xfef08a, 0.95);
      actionGfx.strokeRoundedRect(-40, -16, 80, 32, 8);

      const actionZone = this.add.zone(0, 0, 80, 32);
      if (!isBought) {
        actionZone.setInteractive({ useHandCursor: true });
      }

      const actionTxt = this.add.text(0, 0, isBought ? 'КУПЛЕНО' : `${tool.price} 🪙`, {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: isBought ? '#a89074' : '#1a1004',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      actionBtn.add([actionGfx, actionTxt, actionZone]);

      if (!isBought) {
        actionZone.on('pointerdown', () => {
          if (this.isDragging) return;
          const coins = Storage.getCoins();
          if (coins >= tool.price) {
            Storage.addCoins(-tool.price);
            localStorage.setItem(`tool_upg_${tool.id}`, 'true');
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
      cardIdx++;
    });

    const totalH = cardIdx * (cardH + 8) + 20;
    this.minScrollY = Math.min(this.listTopY, this.listBottomY - totalH);
  }

  rollToolLootbox() {
    const skins = [
      { id: 'gold', name: '★ Императорское золото' },
      { id: 'jade', name: '★ Нефритовый мастер' },
      { id: 'damascus', name: '★ Дамасский сапфир' }
    ];
    const owned = Storage.getOwnedToolSkins();
    const unowned = skins.filter((s) => !owned.includes(s.id));

    let pity = parseInt(localStorage.getItem(Storage.KEYS.TOOL_BOX_PITY) || '0', 10) + 1;
    if ((pity >= 5 || Math.random() < 0.25) && unowned.length > 0) {
      const win = unowned[Math.floor(Math.random() * unowned.length)];
      Storage.unlockToolSkin(win.id);
      Storage.setActiveToolSkin(win.id);
      localStorage.setItem(Storage.KEYS.TOOL_BOX_PITY, '0');
      return {
        isRare: true,
        title: `✨ ${win.name}`,
        subtitle: 'Новый стиль инструментов надет автоматически!'
      };
    }

    localStorage.setItem(Storage.KEYS.TOOL_BOX_PITY, String(pity));
    if (Math.random() < 0.45) {
      Storage.addKintsugiLacquer(1);
      return {
        isRare: true,
        title: '✨ ЗОЛОТОЙ ЛАК КИНЦУГИ (+1)',
        subtitle: 'Добавлен в вашу мастерскую!'
      };
    }

    const gold = Math.round((450 + Math.random() * 400) / 10) * 10;
    Storage.addCoins(gold);
    return {
      isRare: false,
      title: `🪙 +${gold} МОНЕТ`,
      subtitle: 'Утешительная награда зачислена в казну!'
    };
  }

  showRewardPopup(width, titleStr, subStr, isRare) {
    const dpr = this.dpr;
    const FONT_UI = this.FONT_UI;
    const winModal = this.add.container(0, 0).setDepth(200);
    const overlay = this.add.rectangle(width / 2, this.scale.height / 2, width, this.scale.height, 0x080503, 0.85)
      .setInteractive();

    const modalBg = this.add.graphics();
    modalBg.fillGradientStyle(isRare ? 0x3b1f0e : 0x2d180c, isRare ? 0x3b1f0e : 0x2d180c, 0x140a04, 0x140a04, 0.98);
    modalBg.fillRoundedRect(width / 2 - 140, this.scale.height / 2 - 84, 280, 168, 14);
    modalBg.lineStyle(2, isRare ? 0x38bdf8 : 0xeab308, 0.95);
    modalBg.strokeRoundedRect(width / 2 - 140, this.scale.height / 2 - 84, 280, 168, 14);

    const modalTitle = this.add.text(width / 2, this.scale.height / 2 - 52, isRare ? '✨ РЕДКАЯ НАХОДКА!' : '📦 НАГРАДА!', {
      fontSize: '14px',
      fontFamily: FONT_UI,
      color: isRare ? '#38bdf8' : '#fde047',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const rewardTxt = this.add.text(width / 2, this.scale.height / 2 - 12, titleStr, {
      fontSize: '15px',
      fontFamily: FONT_UI,
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 250 },
      resolution: dpr
    }).setOrigin(0.5);

    const tipTxt = this.add.text(width / 2, this.scale.height / 2 + 22, subStr, {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      align: 'center',
      wordWrap: { width: 250 },
      resolution: dpr
    }).setOrigin(0.5);

    const closeGfx = this.add.graphics();
    closeGfx.fillStyle(0x452a18, 1);
    closeGfx.fillRoundedRect(width / 2 - 54, this.scale.height / 2 + 44, 108, 30, 8);
    closeGfx.lineStyle(1, 0xc89d54, 0.9);
    closeGfx.strokeRoundedRect(width / 2 - 54, this.scale.height / 2 + 44, 108, 30, 8);

    const closeZone = this.add.zone(width / 2, this.scale.height / 2 + 59, 108, 30).setInteractive({ useHandCursor: true });
    const closeTxt = this.add.text(width / 2, this.scale.height / 2 + 59, 'ЗАБРАТЬ', {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#fef08a',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    closeZone.on('pointerdown', () => {
      winModal.destroy();
      this.updateCoinsDisplay();
      this.renderContent();
    });

    winModal.add([overlay, modalBg, modalTitle, rewardTxt, tipTxt, closeGfx, closeTxt, closeZone]);
  }

  renderWorkshopTiers(width) {
    const dpr = this.dpr;
    const FONT_UI = this.FONT_UI;
    const currentTier = Storage.getWorkshopTier();
    const activeSkin = Storage.getActiveWorkbenchSkin();
    const ownedSkins = Storage.getOwnedWorkbenchSkins();
    const pityCount = parseInt(localStorage.getItem('lootbox_pity_count') || '0', 10);

    const tiers = [
      { id: 'workbench_bg_1', type: 'base', tier: 1, name: 'Сырой подвал', desc: 'Рабочий стол с тусклой свечой и тисками', price: 0 },
      { id: 'workbench_bg_2', type: 'base', tier: 2, name: 'Чердак антиквара', desc: 'Уютный дубовый стол с керосиновой лампой', price: 600 },
      { id: 'workbench_bg_3', type: 'base', tier: 3, name: 'Кабинет реставратора', desc: 'Стол из красного дерева с латунными приборами', price: 1800 },
      { id: 'workbench_bg_4', type: 'base', tier: 4, name: 'Ювелирная мастерская', desc: 'Прецизионная мастерская с мрамором и золотом', price: 4500 },
      { id: 'workbench_bg_9', type: 'era', name: 'Эпоха: Древний Египет', desc: 'Верстак из песчаника с амулетами и папирусами', price: 7500 },
      { id: 'workbench_bg_10', type: 'era', name: 'Эпоха: Античность', desc: 'Мраморная плита с амфорами и оливковыми ветвями', price: 7500 },
      { id: 'workbench_bg_11', type: 'era', name: 'Эпоха: Средневековье', desc: 'Тяжёлый дубовый верстак с книгами и витражами', price: 7500 },
      { id: 'workbench_bg_12', type: 'era', name: 'Эпоха: Япония', desc: 'Лакированный стол с тушью и бамбуком', price: 7500 },
      { id: 'workbench_bg_13', type: 'era', name: 'Эпоха: Ацтеки', desc: 'Массивное тропическое дерево с обсидианом и масками', price: 7500 },
      { id: 'workbench_bg_14', type: 'era', name: 'Эпоха: Викинги', desc: 'Северный дуб с мехами, рунами и щитами', price: 7500 },
      { id: 'workbench_bg_15', type: 'era', name: 'Эпоха: Ренессанс', desc: 'Полированный орех с чертежами и масляными красками', price: 7500 },
      { id: 'workbench_bg_5', type: 'legendary', name: '★ Эксклюзив: Алхимия', desc: 'Тайная каменная плита со светящимися зельями', price: null },
      { id: 'workbench_bg_6', type: 'legendary', name: '★ Эксклюзив: Киберпанк', desc: 'Лаборатория будущего с неонами и платами', price: null },
      { id: 'workbench_bg_7', type: 'legendary', name: '★ Эксклюзив: Батискаф', desc: 'Подводная станция с иллюминаторами и трубами', price: null },
      { id: 'workbench_bg_8', type: 'legendary', name: '★ Эксклюзив: Космос', desc: 'Орбитальная станция с панорамным видом на звёзды', price: null }
    ];

    const cardH = 84;
    const cardW = width * 0.90;
    let cardIdx = 0;

    // Карточка Сундука-Лутбокса верстаков
    {
      const cardY = cardIdx * (cardH + 8) + cardH / 2;
      const boxCont = this.add.container(width / 2, cardY);

      const boxBg = this.add.graphics();
      boxBg.fillGradientStyle(0x3b1c0a, 0x3b1c0a, 0x1e0f06, 0x1e0f06, 0.85);
      boxBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);
      boxBg.lineStyle(2, 0xeab308, 0.95);
      boxBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      const chestIcon = this.add.image(-cardW / 2 + 38, 0, 'lootbox_chest').setDisplaySize(48, 48);

      const title = this.add.text(-cardW / 2 + 74, -24, '📦 СУНДУК ИСКАТЕЛЯ (ВЕРСТАКИ)', {
        fontSize: '12.5px',
        fontFamily: FONT_UI,
        color: '#fef08a',
        fontStyle: 'bold',
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 74, 4, `Шанс: 2.5% эксклюзив, 5% эпоха (гарант: ${pityCount}/15)\nУтешительно: лак Кинцуги или 450–1100 🪙`, {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        resolution: dpr
      });

      const lootboxPrice = 2200;
      const openBtn = this.add.container(cardW / 2 - 48, 0);
      const openGfx = this.add.graphics();
      openGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 0.98);
      openGfx.fillRoundedRect(-40, -16, 80, 32, 8);
      openGfx.lineStyle(1.2, 0xfef08a, 0.95);
      openGfx.strokeRoundedRect(-40, -16, 80, 32, 8);

      const openZone = this.add.zone(0, 0, 80, 32).setInteractive({ useHandCursor: true });
      const openTxt = this.add.text(0, 0, `${lootboxPrice} 🪙`, {
        fontSize: '12.5px',
        fontFamily: FONT_UI,
        color: '#1a1004',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      openBtn.add([openGfx, openTxt, openZone]);

      openZone.on('pointerdown', () => {
        if (this.isDragging) return;
        const res = this.rollLootboxRebalanced(lootboxPrice);
        if (res.success) {
          if (AudioManager.playCoin) AudioManager.playCoin();
          const isRare = res.type === 'skin' || res.type === 'lacquer';
          this.showRewardPopup(
            width,
            res.name,
            res.type === 'skin' ? 'Новый верстак добавлен в вашу коллекцию!' : 'Награда зачислена!',
            isRare
          );
        } else {
          if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
        }
      });

      boxCont.add([boxBg, chestIcon, title, desc, openBtn]);
      this.itemsContainer.add(boxCont);
      cardIdx++;
    }

    tiers.forEach((item) => {
      const cardY = cardIdx * (cardH + 8) + cardH / 2;

      const isBase = item.type === 'base';
      const isExclusive = item.type === 'legendary';
      const isBaseOwned = isBase && item.tier <= currentTier;
      const canUpgradeBase = isBase && item.tier === currentTier + 1;
      const isBaseLocked = isBase && item.tier > currentTier + 1;

      const isCustomOwned = !isBase && ownedSkins.includes(item.id);
      const isPurchased = isBaseOwned || isCustomOwned;
      const isCurrentActive = activeSkin === item.id;
      const isChestOnlyLocked = isExclusive && !isPurchased;

      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.graphics();
      cardBg.fillGradientStyle(
        isCurrentActive ? 0x3b2614 : (isExclusive ? 0x28182e : 0x261a10),
        isCurrentActive ? 0x3b2614 : (isExclusive ? 0x28182e : 0x261a10),
        0x170f09,
        0x170f09,
        isCurrentActive ? 0.78 : 0.62
      );
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      let borderClr = 0xc89d54;
      if (isCurrentActive) borderClr = 0xfacc15;
      else if (isPurchased) borderClr = 0x4ade80;
      else if (isExclusive) borderClr = 0xc084fc;
      else if (isBaseLocked) borderClr = 0x5c3d22;

      cardBg.lineStyle(isCurrentActive ? 1.8 : 1.2, borderClr, isBaseLocked ? 0.45 : 0.9);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      const title = this.add.text(-cardW / 2 + 16, -20, item.name, {
        fontSize: '13.5px',
        fontFamily: FONT_UI,
        color: isBaseLocked ? '#9c8265' : (isExclusive ? '#f3e8ff' : '#fdf6e3'),
        fontStyle: 'bold',
        resolution: dpr
      }).setShadow(0, 1, '#000000', 4, false, true);

      const desc = this.add.text(-cardW / 2 + 16, 4, item.desc, {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: isBaseLocked ? '#7a6552' : '#e6d5bc',
        wordWrap: { width: cardW - 140 },
        resolution: dpr
      }).setShadow(0, 1, '#000000', 3, false, true);

      const actionBtn = this.add.container(cardW / 2 - 48, 0);
      const canBuy = canUpgradeBase || (!isBase && !isExclusive && !isPurchased);

      const actionGfx = this.add.graphics();
      let btnColor = 0x1a120b;
      let strokeColor = 0x5c3d22;
      if (isCurrentActive) {
        btnColor = 0x3b2614;
        strokeColor = 0xfacc15;
      } else if (isPurchased) {
        btnColor = 0x1e3322;
        strokeColor = 0x4ade80;
      } else if (isChestOnlyLocked) {
        btnColor = 0x2e1738;
        strokeColor = 0xc084fc;
      } else if (canBuy) {
        btnColor = 0xd99b26;
        strokeColor = 0xfef08a;
      }

      actionGfx.fillStyle(btnColor, canBuy ? 0.98 : 0.88);
      actionGfx.fillRoundedRect(-40, -16, 80, 32, 8);
      actionGfx.lineStyle(1, strokeColor, 0.95);
      actionGfx.strokeRoundedRect(-40, -16, 80, 32, 8);

      const actionZone = this.add.zone(0, 0, 80, 32);
      if (!isBaseLocked && !isCurrentActive && !isChestOnlyLocked) {
        actionZone.setInteractive({ useHandCursor: true });
      }

      let btnLabel = `TIER ${item.tier - 1}`;
      if (isCurrentActive) btnLabel = 'АКТИВЕН';
      else if (isPurchased) btnLabel = 'ВЫБРАТЬ';
      else if (isChestOnlyLocked) btnLabel = 'В СУНДУКЕ';
      else if (canBuy) btnLabel = `${item.price} 🪙`;

      const actionTxt = this.add.text(0, 0, btnLabel, {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: isCurrentActive
          ? '#facc15'
          : (isPurchased ? '#86efac' : (isChestOnlyLocked ? '#e879f9' : (canBuy ? '#1a1004' : '#8c735b'))),
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      actionBtn.add([actionGfx, actionTxt, actionZone]);

      actionZone.on('pointerdown', () => {
        if (this.isDragging || isCurrentActive || isBaseLocked || isChestOnlyLocked) return;

        if (isPurchased) {
          if (AudioManager.playClick) AudioManager.playClick();
          Storage.setActiveWorkbenchSkin(item.id);
          this.renderContent();
        } else if (canBuy) {
          const coins = Storage.getCoins();
          if (coins >= item.price) {
            Storage.addCoins(-item.price);
            if (isBase && Storage.setWorkshopTier) {
              Storage.setWorkshopTier(item.tier);
            }
            Storage.unlockWorkbenchSkin(item.id);
            Storage.setActiveWorkbenchSkin(item.id);
            if (AudioManager.playCoin) AudioManager.playCoin();
            this.updateCoinsDisplay();
            this.renderContent();
          } else {
            if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
          }
        }
      });

      card.add([cardBg, title, desc, actionBtn]);
      this.itemsContainer.add(card);
      cardIdx++;
    });

    const totalH = cardIdx * (cardH + 8) + 20;
    this.minScrollY = Math.min(this.listTopY, this.listBottomY - totalH);
  }

  rollLootboxRebalanced(cost) {
    const coins = Storage.getCoins();
    if (coins < cost) return { success: false };

    Storage.addCoins(-cost);

    const exclusiveSkins = [
      { id: 'workbench_bg_5', name: '★ Эксклюзив: Алхимия' },
      { id: 'workbench_bg_6', name: '★ Эксклюзив: Киберпанк' },
      { id: 'workbench_bg_7', name: '★ Эксклюзив: Батискаф' },
      { id: 'workbench_bg_8', name: '★ Эксклюзив: Космос' }
    ];

    const eraSkins = [
      { id: 'workbench_bg_9', name: 'Эпоха: Древний Египет' },
      { id: 'workbench_bg_10', name: 'Эпоха: Античность' },
      { id: 'workbench_bg_11', name: 'Эпоха: Средневековье' },
      { id: 'workbench_bg_12', name: 'Эпоха: Япония' },
      { id: 'workbench_bg_13', name: 'Эпоха: Ацтеки' },
      { id: 'workbench_bg_14', name: 'Эпоха: Викинги' },
      { id: 'workbench_bg_15', name: 'Эпоха: Ренессанс' }
    ];

    const owned = Storage.getOwnedWorkbenchSkins();
    const unownedExclusive = exclusiveSkins.filter((s) => !owned.includes(s.id));
    const unownedEra = eraSkins.filter((s) => !owned.includes(s.id));
    const allUnowned = [...unownedExclusive, ...unownedEra];

    let pity = parseInt(localStorage.getItem('lootbox_pity_count') || '0', 10) + 1;
    const rand = Math.random() * 100;

    if (pity >= 15 && allUnowned.length > 0) {
      const pool = unownedExclusive.length > 0 && Math.random() < 0.45 ? unownedExclusive : allUnowned;
      const win = pool[Math.floor(Math.random() * pool.length)];
      Storage.unlockWorkbenchSkin(win.id);
      localStorage.setItem('lootbox_pity_count', '0');
      return { success: true, type: 'skin', id: win.id, name: win.name };
    }

    if (rand < 2.5 && unownedExclusive.length > 0) {
      const win = unownedExclusive[Math.floor(Math.random() * unownedExclusive.length)];
      Storage.unlockWorkbenchSkin(win.id);
      localStorage.setItem('lootbox_pity_count', '0');
      return { success: true, type: 'skin', id: win.id, name: win.name };
    }

    if (rand < 7.5 && unownedEra.length > 0) {
      const win = unownedEra[Math.floor(Math.random() * unownedEra.length)];
      Storage.unlockWorkbenchSkin(win.id);
      localStorage.setItem('lootbox_pity_count', '0');
      return { success: true, type: 'skin', id: win.id, name: win.name };
    }

    localStorage.setItem('lootbox_pity_count', String(pity));

    if (rand < 30) {
      const lac = Math.random() < 0.75 ? 1 : 2;
      Storage.addKintsugiLacquer(lac);
      return { success: true, type: 'lacquer', amount: lac, name: `Золотой лак (${lac} шт.) ✨` };
    }

    const reward = Math.round((450 + Math.random() * 650) / 10) * 10;
    Storage.addCoins(reward);
    return { success: true, type: 'coins', amount: reward, name: `${reward} 🪙` };
  }

  renderMuseumExpansions(width) {
    const dpr = this.dpr;
    const FONT_UI = this.FONT_UI;

    const expansions = [
      { id: 'pedestal_1', name: 'Бархатный постамент IV', desc: '+1 слот витрины и +15% к оффлайн-билетам', price: 1200 },
      { id: 'pedestal_2', name: 'Стеклянный купол с подсветкой V', desc: '+1 слот витрины и +25% к оффлайн-билетам', price: 2800 },
      { id: 'hall_antique', name: 'Зал Средиземноморья', desc: 'Удваивает пассивную выручку от античных реликвий', price: 5800 },
      { id: 'hall_royal', name: 'Королевская галерея славы', desc: 'Престиж музея максимального уровня: +50% ко всей казне', price: 14000 }
    ];

    const cardH = 82;
    const cardW = width * 0.90;

    expansions.forEach((exp, i) => {
      const cardY = i * (cardH + 8) + cardH / 2;
      const isBought = localStorage.getItem(`museum_upg_${exp.id}`) === 'true';

      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.graphics();
      cardBg.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.62);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);
      cardBg.lineStyle(1.3, isBought ? 0x4ade80 : 0xc89d54, 0.85);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      const name = this.add.text(-cardW / 2 + 18, -20, exp.name, {
        fontSize: '13.5px',
        fontFamily: FONT_UI,
        color: '#fdf6e3',
        fontStyle: 'bold',
        resolution: dpr
      }).setShadow(0, 1, '#000000', 4, false, true);

      const desc = this.add.text(-cardW / 2 + 18, 4, exp.desc, {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        wordWrap: { width: cardW - 140 },
        resolution: dpr
      }).setShadow(0, 1, '#000000', 3, false, true);

      const actionBtn = this.add.container(cardW / 2 - 48, 0);
      const actionGfx = this.add.graphics();
      actionGfx.fillStyle(isBought ? 0x2b1d12 : 0xd99b26, isBought ? 0.88 : 0.98);
      actionGfx.fillRoundedRect(-40, -16, 80, 32, 8);
      actionGfx.lineStyle(1, isBought ? 0x8c6239 : 0xfef08a, 0.95);
      actionGfx.strokeRoundedRect(-40, -16, 80, 32, 8);

      const actionZone = this.add.zone(0, 0, 80, 32);
      if (!isBought) {
        actionZone.setInteractive({ useHandCursor: true });
      }

      const actionTxt = this.add.text(0, 0, isBought ? 'КУПЛЕНО' : `${exp.price} 🪙`, {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: isBought ? '#a89074' : '#1a1004',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      actionBtn.add([actionGfx, actionTxt, actionZone]);

      if (!isBought) {
        actionZone.on('pointerdown', () => {
          if (this.isDragging) return;
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

      card.add([cardBg, name, desc, actionBtn]);
      this.itemsContainer.add(card);
    });

    const totalH = expansions.length * (cardH + 8) + 20;
    this.minScrollY = Math.min(this.listTopY, this.listBottomY - totalH);
  }
}
