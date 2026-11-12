import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create(data) {
    const { width, height } = this.scale;
    this.dpr = 2;

    const FONT_TITLE = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';
    const FONT_UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    this.FONT_UI = FONT_UI;

    // 1. Фон Лавки мастера (лёгкая вуаль, чтобы интерьер хорошо просвечивал сквозь карточки)
    if (this.textures.exists('shop_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'shop_bg').setDepth(0);
      bg.setScale(Math.max(width / bg.width, height / bg.height));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0906, 0.24).setDepth(0);
    } else {
      const bg = this.add.graphics().setDepth(0);
      bg.fillGradientStyle(0x21160d, 0x21160d, 0x0d0805, 0x0d0805, 1);
      bg.fillRect(0, 0, width, height);
    }

    this.returnToRestore = data && data.returnToRestore;
    this.activeTab = 'tools';

    this.generateHDToolVariants();

    // Полупрозрачная верхняя шапка лавки
    const headerBg = this.add.graphics().setDepth(18);
    headerBg.fillGradientStyle(0x24180f, 0x24180f, 0x140d08, 0x140d08, 0.84);
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
      fontSize: '13px',
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
      fontSize: '11px',
      fontFamily: FONT_UI,
      fontStyle: 'bold',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(21);

    this.tabWorkshopBg = this.add.rectangle(startX + tabW, tabY, tabW - 4, tabH, 0x1e130b, 0.85)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabWorkshopTxt = this.add.text(startX + tabW, tabY, 'Верстак', {
      fontSize: '11px',
      fontFamily: FONT_UI,
      fontStyle: 'bold',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(21);

    this.tabMuseumBg = this.add.rectangle(startX + tabW * 2, tabY, tabW - 4, tabH, 0x1e130b, 0.85)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabMuseumTxt = this.add.text(startX + tabW * 2, tabY, 'Музей', {
      fontSize: '11px',
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

    // Полупрозрачная нижняя панель с кнопкой возврата
    const footerBg = this.add.graphics().setDepth(30);
    footerBg.fillGradientStyle(0x1f140c, 0x1f140c, 0x120b07, 0x120b07, 0.88);
    footerBg.fillRect(0, height - 66, width, 66);
    footerBg.lineStyle(1.5, 0xc89d54, 0.65);
    footerBg.lineBetween(0, height - 66, width, height - 66);

    const btnW = width * 0.88;
    const btnH = 44;
    const btnY = height - 33;

    const backGfx = this.add.graphics().setDepth(31);
    backGfx.fillGradientStyle(0x332215, 0x332215, 0x1e130b, 0x1e130b, 0.94);
    backGfx.fillRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 11);
    backGfx.lineStyle(1.5, 0xc89d54, 0.9);
    backGfx.strokeRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 11);

    const backZone = this.add.zone(width / 2, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .setDepth(33);

    const backLabel = this.returnToRestore ? 'Вернуться к артефакту' : 'В главное меню';
    this.add.text(width / 2, btnY, backLabel, {
      fontSize: '14px',
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
      g.fillStyle(0xfef08a, 1);
      g.fillTriangle(s * 0.5, s * 0.12, s * 0.46, s * 0.48, s * 0.52, s * 0.48);
    });

    drawIcon('hd_scraper_3', (g, s) => {
      g.fillStyle(0x94a3b8, 1);
      g.fillRoundedRect(s * 0.45, s * 0.46, s * 0.10, s * 0.44, 3);
      g.fillStyle(0x475569, 1);
      g.beginPath();
      g.moveTo(s * 0.45, s * 0.58);
      g.lineTo(s * 0.55, s * 0.58);
      g.lineTo(s * 0.5, s * 0.86);
      g.closePath();
      g.fillPath();
      g.lineStyle(3.5, 0x38bdf8, 0.9);
      g.strokeLineShape(new Phaser.Geom.Line(s * 0.5, s * 0.08, s * 0.72, s * 0.38));
    });

    drawIcon('hd_scraper_4', (g, s) => {
      g.fillStyle(0x0f172a, 1);
      g.fillRoundedRect(s * 0.38, s * 0.36, s * 0.24, s * 0.48, 5);
      g.fillStyle(0x38bdf8, 1);
      g.fillRoundedRect(s * 0.42, s * 0.28, s * 0.16, s * 0.12, 3);
      g.fillStyle(0xfacc15, 1);
      g.fillCircle(s * 0.5, s * 0.06, s * 0.05);
      g.lineStyle(2, 0xfacc15, 0.8);
      g.strokeLineShape(new Phaser.Geom.Line(s * 0.5, s * 0.06, s * 0.5, s * 0.28));
    });

    drawIcon('hd_brush_2', (g, s) => {
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(s * 0.45, s * 0.52, s * 0.10, s * 0.38, 4);
      g.fillStyle(0xd97706, 1);
      g.fillRect(s * 0.41, s * 0.38, s * 0.18, s * 0.14);
      g.fillStyle(0xfef3c7, 1);
      g.fillRoundedRect(s * 0.28, s * 0.10, s * 0.44, s * 0.28, 6);
    });

    drawIcon('hd_brush_3', (g, s) => {
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(s * 0.46, s * 0.54, s * 0.08, s * 0.36, 4);
      g.fillStyle(0xeab308, 1);
      g.fillRect(s * 0.42, s * 0.38, s * 0.16, s * 0.16);
      g.fillStyle(0xfdf8f6, 0.96);
      g.beginPath();
      g.moveTo(s * 0.42, s * 0.38);
      g.lineTo(s * 0.58, s * 0.38);
      g.lineTo(s * 0.86, s * 0.14);
      g.lineTo(s * 0.50, s * 0.08);
      g.lineTo(s * 0.14, s * 0.14);
      g.closePath();
      g.fillPath();
    });

    drawIcon('hd_brush_4', (g, s) => {
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(s * 0.44, s * 0.42, s * 0.12, s * 0.48, 5);
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(s * 0.5, s * 0.26, s * 0.14);
      g.lineStyle(2, 0x38bdf8, 0.7);
      g.strokeCircle(s * 0.5, s * 0.26, s * 0.22);
    });

    drawIcon('hd_solvent_2', (g, s) => {
      g.fillStyle(0x0284c7, 0.88);
      g.fillRoundedRect(s * 0.32, s * 0.34, s * 0.36, s * 0.52, 8);
      g.fillStyle(0x38bdf8, 1);
      g.fillRect(s * 0.44, s * 0.18, s * 0.12, s * 0.16);
      g.fillStyle(0xd97706, 1);
      g.fillRoundedRect(s * 0.42, s * 0.12, s * 0.16, s * 0.06, 2);
    });

    drawIcon('hd_solvent_3', (g, s) => {
      g.fillStyle(0x0d9488, 0.9);
      g.beginPath();
      g.moveTo(s * 0.44, s * 0.32);
      g.lineTo(s * 0.56, s * 0.32);
      g.lineTo(s * 0.76, s * 0.84);
      g.lineTo(s * 0.24, s * 0.84);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xfacc15, 1);
      g.fillCircle(s * 0.5, s * 0.18, s * 0.06);
    });

    drawIcon('hd_solvent_4', (g, s) => {
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(s * 0.28, s * 0.48, s * 0.44, s * 0.38, 6);
      g.fillStyle(0x6366f1, 1);
      g.fillCircle(s * 0.5, s * 0.34, s * 0.12);
      g.lineStyle(2, 0x818cf8, 0.8);
      g.strokeCircle(s * 0.5, s * 0.34, s * 0.22);
    });

    drawIcon('hd_polish_2', (g, s) => {
      g.fillStyle(0xd97706, 1);
      g.fillRoundedRect(s * 0.26, s * 0.46, s * 0.48, s * 0.36, 10);
      g.fillStyle(0xfef08a, 1);
      g.fillRoundedRect(s * 0.36, s * 0.32, s * 0.28, s * 0.14, 4);
    });

    drawIcon('hd_polish_3', (g, s) => {
      g.fillStyle(0xf59e0b, 1);
      g.fillCircle(s * 0.5, s * 0.58, s * 0.26);
      g.fillStyle(0xfde047, 1);
      g.fillTriangle(s * 0.5, s * 0.12, s * 0.44, s * 0.28, s * 0.56, s * 0.28);
    });

    drawIcon('hd_polish_4', (g, s) => {
      g.fillStyle(0xeab308, 1);
      g.fillRoundedRect(s * 0.26, s * 0.48, s * 0.48, s * 0.34, 8);
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(s * 0.5, s * 0.36, s * 0.12);
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

    const cardH = 76;
    const cardW = width * 0.90;

    tools.forEach((tool, i) => {
      const cardY = i * (cardH + 8) + cardH / 2;
      const isBought = localStorage.getItem(`tool_upg_${tool.id}`) === 'true';

      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.graphics();
      cardBg.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.56);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);
      cardBg.lineStyle(1.3, isBought ? 0x4ade80 : 0xc89d54, 0.85);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      cardBg.fillStyle(0x0d0805, 0.45);
      cardBg.fillRoundedRect(-cardW / 2 + 10, -28, 56, 56, 9);

      const icon = this.add.image(-cardW / 2 + 38, 0, tool.icon).setDisplaySize(48, 48);

      const title = this.add.text(-cardW / 2 + 74, -18, tool.name, {
        fontSize: '12.5px',
        fontFamily: FONT_UI,
        color: '#fdf6e3',
        fontStyle: 'bold',
        resolution: dpr
      }).setShadow(0, 1, '#000000', 4, false, true);

      const desc = this.add.text(-cardW / 2 + 74, 2, tool.desc, {
        fontSize: '10px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        wordWrap: { width: cardW - 165 },
        resolution: dpr
      }).setShadow(0, 1, '#000000', 3, false, true);

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const actionGfx = this.add.graphics();
      actionGfx.fillStyle(isBought ? 0x2b1d12 : 0xd99b26, isBought ? 0.88 : 0.98);
      actionGfx.fillRoundedRect(-37, -15, 74, 30, 8);
      actionGfx.lineStyle(1, isBought ? 0x8c6239 : 0xfef08a, 0.95);
      actionGfx.strokeRoundedRect(-37, -15, 74, 30, 8);

      const actionZone = this.add.zone(0, 0, 74, 30);
      if (!isBought) {
        actionZone.setInteractive({ useHandCursor: true });
      }

      const actionTxt = this.add.text(0, 0, isBought ? 'КУПЛЕНО' : `${tool.price} 🪙`, {
        fontSize: '10.5px',
        fontFamily: FONT_UI,
        color: isBought ? '#a89074' : '#1a1004',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      actionBtn.add([actionGfx, actionTxt, actionZone]);

      if (!isBought) {
        actionZone.on('pointerdown', () => {
          if (this.isDragging) return;
          const coins = Storage.getCoins ? Storage.getCoins() : 0;
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
    });

    const totalH = tools.length * (cardH + 8) + 20;
    this.minScrollY = Math.min(this.listTopY, this.listBottomY - totalH);
  }

  renderWorkshopTiers(width) {
    const dpr = this.dpr;
    const FONT_UI = this.FONT_UI;
    const currentTier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;
    const activeSkin = Storage.getActiveWorkbenchSkin
      ? Storage.getActiveWorkbenchSkin()
      : (localStorage.getItem('active_workbench_skin') || `workbench_bg_${currentTier}`);

    const ownedSkins = Storage.getOwnedWorkbenchSkins
      ? Storage.getOwnedWorkbenchSkins()
      : JSON.parse(localStorage.getItem('owned_workbench_skins') || '["workbench_bg_1","workbench_bg_2","workbench_bg_3","workbench_bg_4"]');

    const tiers = [
      // Базовые улучшения мастерской (Tier 1..4)
      { id: 'workbench_bg_1', type: 'base', tier: 1, name: 'Сырой подвал', desc: 'Рабочий стол с тусклой свечой и тисками', price: 0 },
      { id: 'workbench_bg_2', type: 'base', tier: 2, name: 'Чердак антиквара', desc: 'Уютный дубовый стол с керосиновой лампой', price: 350 },
      { id: 'workbench_bg_3', type: 'base', tier: 3, name: 'Кабинет реставратора', desc: 'Стол из красного дерева с латунными приборами', price: 750 },
      { id: 'workbench_bg_4', type: 'base', tier: 4, name: 'Ювелирная мастерская', desc: 'Прецизионная мастерская с мрамором и золотом', price: 1800 },

      // Эпохальные верстаки (в 2 раза дешевле легендарных)
      { id: 'workbench_bg_9', type: 'era', name: 'Эпоха: Древний Египет', desc: 'Верстак из песчаника с амулетами и папирусами', price: 1000 },
      { id: 'workbench_bg_10', type: 'era', name: 'Эпоха: Античность', desc: 'Мраморная плита с амфорами и оливковыми ветвями', price: 1000 },
      { id: 'workbench_bg_11', type: 'era', name: 'Эпоха: Средневековая Европа', desc: 'Тяжёлый дубовый верстак с книгами и витражами', price: 1000 },
      { id: 'workbench_bg_12', type: 'era', name: 'Эпоха: Япония', desc: 'Лакированный стол с тушью и бамбуком', price: 1000 },
      { id: 'workbench_bg_13', type: 'era', name: 'Эпоха: Ацтеки', desc: 'Массивное тропическое дерево с обсидианом и масками', price: 1000 },
      { id: 'workbench_bg_14', type: 'era', name: 'Эпоха: Викинги', desc: 'Северный дуб с мехами, рунами и щитами', price: 1000 },
      { id: 'workbench_bg_15', type: 'era', name: 'Эпоха: Ренессанс', desc: 'Полированный орех с чертежами и масляными красками', price: 1000 },

      // Легендарные кастомные верстаки
      { id: 'workbench_bg_5', type: 'legendary', name: 'Эксклюзив: Алхимия', desc: 'Тайная каменная плита со светящимися зельями', price: 2000 },
      { id: 'workbench_bg_6', type: 'legendary', name: 'Эксклюзив: Киберпанк', desc: 'Лаборатория будущего с неонами и платами', price: 2000 },
      { id: 'workbench_bg_7', type: 'legendary', name: 'Эксклюзив: Батискаф', desc: 'Подводная станция с иллюминаторами и трубами', price: 2000 },
      { id: 'workbench_bg_8', type: 'legendary', name: 'Эксклюзив: Космос', desc: 'Орбитальная станция с панорамным видом на звёзды', price: 2000 }
    ];

    const cardH = 76;
    const cardW = width * 0.90;
    let cardIdx = 0;

    // 1. Карточка Сундука-Лутбокса сверху вкладки «Верстак»
    {
      const cardY = cardIdx * (cardH + 8) + cardH / 2;
      const boxCont = this.add.container(width / 2, cardY);

      const boxBg = this.add.graphics();
      boxBg.fillGradientStyle(0x3b1c0a, 0x3b1c0a, 0x1e0f06, 0x1e0f06, 0.78);
      boxBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);
      boxBg.lineStyle(2, 0xeab308, 0.95);
      boxBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      boxBg.fillStyle(0x0d0805, 0.45);
      boxBg.fillRoundedRect(-cardW / 2 + 10, -28, 56, 56, 9);

      const chestIcon = this.add.image(-cardW / 2 + 38, 0, 'lootbox_chest').setDisplaySize(48, 48);

      this.tweens.add({
        targets: chestIcon,
        angle: { from: -3, to: 3 },
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      const title = this.add.text(-cardW / 2 + 74, -20, '📦 СУНДУК ИСКАТЕЛЯ', {
        fontSize: '12.5px',
        fontFamily: FONT_UI,
        color: '#fef08a',
        fontStyle: 'bold',
        resolution: dpr
      }).setShadow(0, 1, '#000000', 4, false, true);

      const desc = this.add.text(-cardW / 2 + 74, -1, 'Шанс 10% выбить редкий верстак!\nИли: Золотой лак / 100–600 монет.', {
        fontSize: '9.5px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        wordWrap: { width: cardW - 165 },
        resolution: dpr
      }).setShadow(0, 1, '#000000', 3, false, true);

      const lootboxPrice = Storage.getLootboxCost ? Storage.getLootboxCost() : 750;
      const openBtn = this.add.container(cardW / 2 - 45, 0);
      const openGfx = this.add.graphics();
      openGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 0.98);
      openGfx.fillRoundedRect(-37, -15, 74, 30, 8);
      openGfx.lineStyle(1.2, 0xfef08a, 0.95);
      openGfx.strokeRoundedRect(-37, -15, 74, 30, 8);

      const openZone = this.add.zone(0, 0, 74, 30).setInteractive({ useHandCursor: true });
      const openTxt = this.add.text(0, 0, `${lootboxPrice} 🪙`, {
        fontSize: '11px',
        fontFamily: FONT_UI,
        color: '#1a1004',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      openBtn.add([openGfx, openTxt, openZone]);

      let isOpening = false;
      openZone.on('pointerdown', () => {
        if (this.isDragging || isOpening) return;
        isOpening = true;

        const res = this.rollLootboxSafe(lootboxPrice);
        if (res.success) {
          if (AudioManager.playCoin) AudioManager.playCoin();

          chestIcon.setScale(1.2);
          this.time.delayedCall(120, () => chestIcon.setScale(1));

          const winModal = this.add.container(0, 0).setDepth(200);
          const overlay = this.add.rectangle(width / 2, this.scale.height / 2, width, this.scale.height, 0x080503, 0.85)
            .setInteractive();

          const modalBg = this.add.graphics();
          modalBg.fillGradientStyle(0x2d180c, 0x2d180c, 0x140a04, 0x140a04, 0.96);
          modalBg.fillRoundedRect(width / 2 - 125, this.scale.height / 2 - 76, 250, 152, 14);
          modalBg.lineStyle(1.5, 0xeab308, 0.95);
          modalBg.strokeRoundedRect(width / 2 - 125, this.scale.height / 2 - 76, 250, 152, 14);

          const modalTitle = this.add.text(width / 2, this.scale.height / 2 - 48, '🎉 НАГРАДА ИЗ СУНДУКА!', {
            fontSize: '12.5px',
            fontFamily: FONT_UI,
            color: '#fde047',
            fontStyle: 'bold',
            resolution: dpr
          }).setOrigin(0.5);

          const rewardTxt = this.add.text(width / 2, this.scale.height / 2 - 8, res.name, {
            fontSize: '13.5px',
            fontFamily: FONT_UI,
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 220 },
            resolution: dpr
          }).setOrigin(0.5);

          const tipTxtStr = res.type === 'skin' ? 'Верстак добавлен в коллекцию!' : 'Награда зачислена';
          const tipTxt = this.add.text(width / 2, this.scale.height / 2 + 22, tipTxtStr, {
            fontSize: '10px',
            fontFamily: FONT_UI,
            color: '#d6c3a5',
            resolution: dpr
          }).setOrigin(0.5);

          const closeGfx = this.add.graphics();
          closeGfx.fillStyle(0x452a18, 1);
          closeGfx.fillRoundedRect(width / 2 - 48, this.scale.height / 2 + 40, 96, 26, 7);
          closeGfx.lineStyle(1, 0xc89d54, 0.9);
          closeGfx.strokeRoundedRect(width / 2 - 48, this.scale.height / 2 + 40, 96, 26, 7);

          const closeZone = this.add.zone(width / 2, this.scale.height / 2 + 53, 96, 26).setInteractive({ useHandCursor: true });
          const closeTxt = this.add.text(width / 2, this.scale.height / 2 + 53, 'ЗАБРАТЬ', {
            fontSize: '10.5px',
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
        } else {
          if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
        }
        isOpening = false;
      });

      boxCont.add([boxBg, chestIcon, title, desc, openBtn]);
      this.itemsContainer.add(boxCont);
      cardIdx++;
    }

    // 2. Карточки всех 15 верстаков
    tiers.forEach((item) => {
      const cardY = cardIdx * (cardH + 8) + cardH / 2;

      const isBase = item.type === 'base';
      const isBaseOwned = isBase && item.tier <= currentTier;
      const canUpgradeBase = isBase && item.tier === currentTier + 1;
      const isBaseLocked = isBase && item.tier > currentTier + 1;

      const isCustomOwned = !isBase && ownedSkins.includes(item.id);
      const isPurchased = isBaseOwned || isCustomOwned;
      const isCurrentActive = activeSkin === item.id;

      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.graphics();
      cardBg.fillGradientStyle(
        isCurrentActive ? 0x3b2614 : 0x261a10,
        isCurrentActive ? 0x3b2614 : 0x261a10,
        0x170f09,
        0x170f09,
        isCurrentActive ? 0.74 : 0.56
      );
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      let borderClr = 0xc89d54;
      if (isCurrentActive) borderClr = 0xfacc15;
      else if (isPurchased) borderClr = 0x4ade80;
      else if (isBaseLocked) borderClr = 0x5c3d22;

      cardBg.lineStyle(isCurrentActive ? 1.8 : 1.2, borderClr, isBaseLocked ? 0.45 : 0.9);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      const title = this.add.text(-cardW / 2 + 16, -18, item.name, {
        fontSize: '12.5px',
        fontFamily: FONT_UI,
        color: isBaseLocked ? '#9c8265' : '#fdf6e3',
        fontStyle: 'bold',
        resolution: dpr
      }).setShadow(0, 1, '#000000', 4, false, true);

      const desc = this.add.text(-cardW / 2 + 16, 2, item.desc, {
        fontSize: '10px',
        fontFamily: FONT_UI,
        color: isBaseLocked ? '#7a6552' : '#e6d5bc',
        wordWrap: { width: cardW - 135 },
        resolution: dpr
      }).setShadow(0, 1, '#000000', 3, false, true);

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const canBuy = canUpgradeBase || (!isBase && !isPurchased);

      const actionGfx = this.add.graphics();
      let btnColor = 0x1a120b;
      let strokeColor = 0x5c3d22;
      if (isCurrentActive) {
        btnColor = 0x3b2614;
        strokeColor = 0xfacc15;
      } else if (isPurchased) {
        btnColor = 0x1e3322;
        strokeColor = 0x4ade80;
      } else if (canBuy) {
        btnColor = 0xd99b26;
        strokeColor = 0xfef08a;
      }

      actionGfx.fillStyle(btnColor, canBuy ? 0.98 : 0.88);
      actionGfx.fillRoundedRect(-37, -15, 74, 30, 8);
      actionGfx.lineStyle(1, strokeColor, 0.95);
      actionGfx.strokeRoundedRect(-37, -15, 74, 30, 8);

      const actionZone = this.add.zone(0, 0, 74, 30);
      if (!isBaseLocked && !isCurrentActive) {
        actionZone.setInteractive({ useHandCursor: true });
      }

      let btnLabel = `TIER ${item.tier - 1}`;
      if (isCurrentActive) btnLabel = 'АКТИВЕН';
      else if (isPurchased) btnLabel = 'ВЫБРАТЬ';
      else if (canBuy) btnLabel = `${item.price} 🪙`;

      const actionTxt = this.add.text(0, 0, btnLabel, {
        fontSize: '10.5px',
        fontFamily: FONT_UI,
        color: isCurrentActive ? '#facc15' : (isPurchased ? '#86efac' : (canBuy ? '#1a1004' : '#8c735b')),
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      actionBtn.add([actionGfx, actionTxt, actionZone]);

      actionZone.on('pointerdown', () => {
        if (this.isDragging || isCurrentActive || isBaseLocked) return;

        if (isPurchased) {
          if (AudioManager.playClick) AudioManager.playClick();
          this.setActiveSkinSafe(item.id);
          this.renderContent();
        } else if (canBuy) {
          const coins = Storage.getCoins ? Storage.getCoins() : 0;
          if (coins >= item.price) {
            Storage.addCoins(-item.price);
            if (isBase && Storage.setWorkshopTier) {
              Storage.setWorkshopTier(item.tier);
            }
            this.unlockSkinSafe(item.id);
            this.setActiveSkinSafe(item.id);
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

  setActiveSkinSafe(skinId) {
    if (Storage.setActiveWorkbenchSkin) {
      Storage.setActiveWorkbenchSkin(skinId);
    } else {
      localStorage.setItem('active_workbench_skin', skinId);
    }
  }

  unlockSkinSafe(skinId) {
    if (Storage.unlockWorkbenchSkin) {
      Storage.unlockWorkbenchSkin(skinId);
    } else {
      const list = JSON.parse(localStorage.getItem('owned_workbench_skins') || '["workbench_bg_1","workbench_bg_2","workbench_bg_3","workbench_bg_4"]');
      if (!list.includes(skinId)) {
        list.push(skinId);
        localStorage.setItem('owned_workbench_skins', JSON.stringify(list));
      }
    }
  }

  rollLootboxSafe(cost) {
    if (Storage.openLootbox) {
      return Storage.openLootbox();
    }
    const coins = Storage.getCoins ? Storage.getCoins() : 0;
    if (coins < cost) return { success: false };

    Storage.addCoins(-cost);
    const rand = Math.random() * 100;

    if (rand < 10) {
      const potentialSkins = [
        { id: 'workbench_bg_5', name: 'Верстак «Алхимия»' },
        { id: 'workbench_bg_6', name: 'Верстак «Киберпанк»' },
        { id: 'workbench_bg_7', name: 'Верстак «Батискаф»' },
        { id: 'workbench_bg_8', name: 'Верстак «Космос»' },
        { id: 'workbench_bg_9', name: 'Верстак «Египет»' },
        { id: 'workbench_bg_10', name: 'Верстак «Античность»' },
        { id: 'workbench_bg_11', name: 'Верстак «Европа»' },
        { id: 'workbench_bg_12', name: 'Верстак «Япония»' },
        { id: 'workbench_bg_13', name: 'Верстак «Ацтеки»' },
        { id: 'workbench_bg_14', name: 'Верстак «Викинги»' },
        { id: 'workbench_bg_15', name: 'Верстак «Ренессанс»' }
      ];
      const owned = JSON.parse(localStorage.getItem('owned_workbench_skins') || '[]');
      const notOwned = potentialSkins.filter((s) => !owned.includes(s.id));
      if (notOwned.length > 0) {
        const win = notOwned[Math.floor(Math.random() * notOwned.length)];
        this.unlockSkinSafe(win.id);
        return { success: true, type: 'skin', id: win.id, name: win.name };
      }
    }

    if (rand < 35) {
      const reward = Math.round(100 + Math.random() * 500);
      Storage.addCoins(reward);
      return { success: true, type: 'coins', amount: reward, name: `${reward} 🪙` };
    }

    if (rand < 60) {
      const lac = Math.random() < 0.8 ? 1 : 2;
      if (Storage.addKintsugiLacquer) {
        Storage.addKintsugiLacquer(lac);
      } else {
        const cur = parseInt(localStorage.getItem('kintsugi_lacquer') || '0', 10);
        localStorage.setItem('kintsugi_lacquer', cur + lac);
      }
      return { success: true, type: 'lacquer', amount: lac, name: `Золотой лак (${lac} шт.) ✨` };
    }

    Storage.addCoins(300);
    return { success: true, type: 'coins', amount: 300, name: '300 🪙' };
  }

  renderMuseumExpansions(width) {
    const dpr = this.dpr;
    const FONT_UI = this.FONT_UI;

    const expansions = [
      { id: 'pedestal_1', name: 'Бархатный постамент IV', desc: '+1 слот витрины и +10% к оффлайн-билетам', price: 1200 },
      { id: 'pedestal_2', name: 'Стеклянный купол с подсветкой V', desc: '+1 слот витрины и +25% к оффлайн-билетам', price: 2800 },
      { id: 'hall_antique', name: 'Зал Средиземноморья', desc: 'Удваивает пассивную выручку от античных реликвий', price: 5800 },
      { id: 'hall_royal', name: 'Королевская галерея славы', desc: 'Престиж музея максимального уровня: +50% ко всей казне', price: 14000 }
    ];

    const cardH = 76;
    const cardW = width * 0.90;

    expansions.forEach((exp, i) => {
      const cardY = i * (cardH + 8) + cardH / 2;
      const isBought = localStorage.getItem(`museum_upg_${exp.id}`) === 'true';

      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.graphics();
      cardBg.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.56);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);
      cardBg.lineStyle(1.3, isBought ? 0x4ade80 : 0xc89d54, 0.85);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      const name = this.add.text(-cardW / 2 + 18, -18, exp.name, {
        fontSize: '12.5px',
        fontFamily: FONT_UI,
        color: '#fdf6e3',
        fontStyle: 'bold',
        resolution: dpr
      }).setShadow(0, 1, '#000000', 4, false, true);

      const desc = this.add.text(-cardW / 2 + 18, 2, exp.desc, {
        fontSize: '10px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        wordWrap: { width: cardW - 135 },
        resolution: dpr
      }).setShadow(0, 1, '#000000', 3, false, true);

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const actionGfx = this.add.graphics();
      actionGfx.fillStyle(isBought ? 0x2b1d12 : 0xd99b26, isBought ? 0.88 : 0.98);
      actionGfx.fillRoundedRect(-37, -15, 74, 30, 8);
      actionGfx.lineStyle(1, isBought ? 0x8c6239 : 0xfef08a, 0.95);
      actionGfx.strokeRoundedRect(-37, -15, 74, 30, 8);

      const actionZone = this.add.zone(0, 0, 74, 30);
      if (!isBought) {
        actionZone.setInteractive({ useHandCursor: true });
      }

      const actionTxt = this.add.text(0, 0, isBought ? 'КУПЛЕНО' : `${exp.price} 🪙`, {
        fontSize: '10.5px',
        fontFamily: FONT_UI,
        color: isBought ? '#a89074' : '#1a1004',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      actionBtn.add([actionGfx, actionTxt, actionZone]);

      if (!isBought) {
        actionZone.on('pointerdown', () => {
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
