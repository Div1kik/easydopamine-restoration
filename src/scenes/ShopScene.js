import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { YandexSDK } from '../utils/YandexSDK.js';
import { TOOL_SKINS, drawDetailedToolCanvas, drawFullToolSetPreview } from '../utils/ToolArt.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create(data) {
    const { width, height } = this.scale;
    this.dpr = 3;

    const FONT_TITLE = '"Cormorant Garamond", Georgia, serif';
    const FONT_UI = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.FONT_UI = FONT_UI;

    if (this.textures.exists('shop_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'shop_bg').setDepth(0);
      bg.setScale(Math.max(width / bg.width, height / bg.height));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0906, 0.34).setDepth(0);
    } else {
      const bg = this.add.graphics().setDepth(0);
      bg.fillGradientStyle(0x21160d, 0x21160d, 0x0d0805, 0x0d0805, 1);
      bg.fillRect(0, 0, width, height);
    }

    this.returnToRestore = data && data.returnToRestore;
    this.activeTab = 'tools';

    this.generateDetailedShopIcons();

    // Верхняя шапка лавки
    const headerBg = this.add.graphics().setDepth(18);
    headerBg.fillGradientStyle(0x24180f, 0x24180f, 0x140d08, 0x140d08, 0.92);
    headerBg.fillRect(0, 0, width, 110);
    headerBg.lineStyle(1.5, 0xc89d54, 0.65);
    headerBg.lineBetween(0, 110, width, 110);

    this.add.text(width / 2, 22, 'ЛАВКА МАСТЕРА', {
      fontSize: '21px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(20);

    this.coinsText = this.add.text(width / 2, 48, '', {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(20);
    this.updateCoinsDisplay();

    // 3 чётко разделённые вкладки: Инструменты (прокачка) | Стиль (визуал инструментов и верстаков) | Музей
    const tabW = (width * 0.90) / 3;
    const tabH = 34;
    const startX = width * 0.05 + tabW / 2;
    const tabY = 82;

    this.tabToolsBg = this.add.rectangle(startX, tabY, tabW - 4, tabH, 0x1e130b, 0.85)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabToolsTxt = this.add.text(startX, tabY, 'Инструменты', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      fontStyle: 'bold',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(21);

    this.tabStyleBg = this.add.rectangle(startX + tabW, tabY, tabW - 4, tabH, 0x1e130b, 0.85)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabStyleTxt = this.add.text(startX + tabW, tabY, 'Стиль', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      fontStyle: 'bold',
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(21);

    this.tabMuseumBg = this.add.rectangle(startX + tabW * 2, tabY, tabW - 4, tabH, 0x1e130b, 0.85)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    this.tabMuseumTxt = this.add.text(startX + tabW * 2, tabY, 'Музей', {
      fontSize: '12px',
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

    this.tabStyleBg.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.activeTab = 'style';
      this.refreshTabs();
      this.renderContent();
    });

    this.tabMuseumBg.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.activeTab = 'museum';
      this.refreshTabs();
      this.renderContent();
    });

    this.listTopY = 118;
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

    // Нижняя панель
    const footerBg = this.add.graphics().setDepth(30);
    footerBg.fillGradientStyle(0x1f140c, 0x1f140c, 0x120b07, 0x120b07, 0.92);
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
      fontSize: '14.5px',
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

  generateDetailedShopIcons() {
    const activeSkin = Storage.getActiveToolSkin();
    const types = ['scraper', 'brush', 'solvent', 'polish'];
    types.forEach((type) => {
      [2, 3, 4].forEach((tier) => {
        const key = `shop_tool_${type}_${tier}_${activeSkin}`;
        if (this.textures.exists(key)) return;
        const cvs = this.textures.createCanvas(key, 192, 192);
        const ctx = cvs.getContext();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        drawDetailedToolCanvas(ctx, type, tier, activeSkin, 192);
        cvs.refresh();
      });
    });

    // Превью ПОЛНЫХ комплектов из 5 инструментов для вкладки «Стиль»
    TOOL_SKINS.forEach((skin) => {
      const key = `skin_fullset_${skin.id}`;
      if (this.textures.exists(key)) return;
      const cvs = this.textures.createCanvas(key, 480, 108);
      const ctx = cvs.getContext();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      drawFullToolSetPreview(ctx, skin.id, 480, 108);
      cvs.refresh();
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
    this.coinsText.setText(`Казна: ${coins} монет   |   Лак Кинцуги: ${lacquer} шт.`);
  }

  refreshTabs() {
    const setTab = (bg, txt, active) => {
      bg.setFillStyle(active ? 0xd99b26 : 0x24180f, active ? 0.96 : 0.82);
      bg.setStrokeStyle(1.5, active ? 0xfef08a : 0x8c6239);
      txt.setColor(active ? '#1a1004' : '#d6c3a5');
    };

    setTab(this.tabToolsBg, this.tabToolsTxt, this.activeTab === 'tools');
    setTab(this.tabStyleBg, this.tabStyleTxt, this.activeTab === 'style');
    setTab(this.tabMuseumBg, this.tabMuseumTxt, this.activeTab === 'museum');
  }

  renderContent() {
    this.itemsContainer.removeAll(true);
    this.itemsContainer.y = this.listTopY;
    const { width } = this.scale;

    if (this.activeTab === 'tools') {
      this.generateDetailedShopIcons();
      this.renderToolsUpgrades(width);
    } else if (this.activeTab === 'style') {
      this.generateDetailedShopIcons();
      this.renderVisualStylesTab(width);
    } else if (this.activeTab === 'museum') {
      this.renderMuseumExpansions(width);
    }
  }

  // =========================================================================
  // ВКЛАДКА 1: ИНСТРУМЕНТЫ (ТОЛЬКО ПРОКАЧКА МОЩНОСТИ БЕЗ СКИНОВ)
  // =========================================================================
  renderToolsUpgrades(width) {
    const dpr = this.dpr;
    const FONT_UI = this.FONT_UI;
    const cardH = 92;
    const cardW = width * 0.92;
    const activeSkin = Storage.getActiveToolSkin();
    let cardIdx = 0;

    const tools = [
      { id: 'scraper_2', name: 'Латунный скребок II', desc: '+20% к радиусу очистки слоя грязи', price: 200, icon: `shop_tool_scraper_2_${activeSkin}` },
      { id: 'scraper_3', name: 'Хирургический скальпель III', desc: '+40% к радиусу очистки, быстрый срез', price: 650, icon: `shop_tool_scraper_3_${activeSkin}` },
      { id: 'scraper_4', name: 'Ударный микро-скальпель IV', desc: 'Прецизионное снятие в одно касание', price: 1400, icon: `shop_tool_scraper_4_${activeSkin}` },
      { id: 'brush_2', name: 'Колонковая кисть II', desc: 'Сметает пыль и сажу на реликвиях', price: 220, icon: `shop_tool_brush_2_${activeSkin}` },
      { id: 'brush_3', name: 'Соболиная веерная кисть III', desc: 'Широкий охват снятия наслоений', price: 600, icon: `shop_tool_brush_3_${activeSkin}` },
      { id: 'brush_4', name: 'Ионизирующая кисть IV', desc: 'Сдувает пыль за один лёгкий взмах', price: 1500, icon: `shop_tool_brush_4_${activeSkin}` },
      { id: 'solvent_2', name: 'Нейтрализующий состав II', desc: 'Быстро растворяет минеральный налёт', price: 260, icon: `shop_tool_solvent_2_${activeSkin}` },
      { id: 'solvent_3', name: 'Щадящая эмульсия III', desc: 'Глубокое расщепление въевшейся патины', price: 700, icon: `shop_tool_solvent_3_${activeSkin}` },
      { id: 'solvent_4', name: 'Ультразвуковой спрей IV', desc: 'Мгновенное удаление налёта без следа', price: 1800, icon: `shop_tool_solvent_4_${activeSkin}` },
      { id: 'polish_2', name: 'Пчелиный воск II', desc: 'Придаёт экспонатам благородный глянец', price: 300, icon: `shop_tool_polish_2_${activeSkin}` },
      { id: 'polish_3', name: 'Паста ГОИ и микрофибра III', desc: '+15% к ювелирному блеску экспоната', price: 850, icon: `shop_tool_polish_3_${activeSkin}` },
      { id: 'polish_4', name: 'Алмазная эмульсия IV', desc: 'Зеркальный блеск высшей музейной пробы', price: 2000, icon: `shop_tool_polish_4_${activeSkin}` }
    ];

    tools.forEach((tool) => {
      const cardY = cardIdx * (cardH + 8) + cardH / 2;
      const isBought = localStorage.getItem(`tool_upg_${tool.id}`) === 'true';

      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.graphics();
      cardBg.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.78);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);
      cardBg.lineStyle(1.3, isBought ? 0x4ade80 : 0xc89d54, 0.85);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      cardBg.fillStyle(0x0d0805, 0.55);
      cardBg.fillRoundedRect(-cardW / 2 + 10, -30, 60, 60, 9);

      const icon = this.add.image(-cardW / 2 + 40, 0, tool.icon).setDisplaySize(54, 54);

      const textMaxW = cardW - 184;
      const title = this.add.text(-cardW / 2 + 80, -24, tool.name, {
        fontSize: '13px',
        fontFamily: FONT_UI,
        color: '#fdf6e3',
        fontStyle: 'bold',
        wordWrap: { width: textMaxW },
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 80, 2, tool.desc, {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        wordWrap: { width: textMaxW },
        resolution: dpr
      });

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

      const actionTxt = this.add.text(0, 0, isBought ? 'КУПЛЕНО' : `${tool.price}`, {
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
          } else if (AudioManager.playBreakSnap) {
            AudioManager.playBreakSnap();
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

  // =========================================================================
  // ВКЛАДКА 2: СТИЛЬ (ВНЕШНИЙ ВИД ВСЕХ 5 ИНСТРУМЕНТОВ + 15 ВЕРСТАКОВ)
  // =========================================================================
  renderVisualStylesTab(width) {
    const dpr = this.dpr;
    const FONT_UI = this.FONT_UI;
    const cardW = width * 0.92;
    let curY = 8;

    // --- СЕКЦИЯ А: ВНЕШНИЙ ВИД ИНСТРУМЕНТОВ (ПОЛНЫЕ НАБОРЫ ИЗ 5 ПРИБОРОВ) ---
    const secHeader1 = this.add.text(width / 2, curY + 12, 'СТИЛЬ ИНСТРУМЕНТОВ (ВСЕ 5 ПРИБОРОВ)', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      letterSpacing: 1,
      resolution: dpr
    }).setOrigin(0.5);
    this.itemsContainer.add(secHeader1);
    curY += 30;

    const activeToolSkin = Storage.getActiveToolSkin();
    const ownedToolSkins = Storage.getOwnedToolSkins();
    const skinCardH = 122;

    TOOL_SKINS.forEach((skin) => {
      const cardY = curY + skinCardH / 2;
      const isOwned = ownedToolSkins.includes(skin.id);
      const isActive = activeToolSkin === skin.id;
      const adProgress = parseInt(localStorage.getItem(`tool_skin_ads_${skin.id}`) || '0', 10);

      const card = this.add.container(width / 2, cardY);
      const cardBg = this.add.graphics();
      cardBg.fillGradientStyle(isActive ? 0x3b2614 : 0x261a10, isActive ? 0x3b2614 : 0x261a10, 0x170f09, 0x170f09, 0.82);
      cardBg.fillRoundedRect(-cardW / 2, -skinCardH / 2, cardW, skinCardH, 12);
      cardBg.lineStyle(1.5, isActive ? 0xfacc15 : (isOwned ? 0x4ade80 : 0xc89d54), 0.9);
      cardBg.strokeRoundedRect(-cardW / 2, -skinCardH / 2, cardW, skinCardH, 12);

      // Витрина полного набора из 5 инструментов сверху карточки
      cardBg.fillStyle(0x0d0805, 0.65);
      cardBg.fillRoundedRect(-cardW / 2 + 10, -skinCardH / 2 + 8, cardW - 20, 48, 8);

      const setPreview = this.add.image(0, -skinCardH / 2 + 32, `skin_fullset_${skin.id}`)
        .setDisplaySize(cardW - 32, 44);

      const textMaxW = cardW - 125;
      const title = this.add.text(-cardW / 2 + 14, 4, skin.name, {
        fontSize: '13px',
        fontFamily: FONT_UI,
        color: isActive ? '#facc15' : '#fdf6e3',
        fontStyle: 'bold',
        wordWrap: { width: textMaxW },
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 14, 24, skin.desc, {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        wordWrap: { width: textMaxW },
        resolution: dpr
      });

      const btnX = cardW / 2 - 50;
      const btnW = 86;
      const btnCenterY = 26;

      if (isOwned) {
        const btnGfx = this.add.graphics();
        btnGfx.fillStyle(isActive ? 0x3b2614 : 0x1e3322, 0.96);
        btnGfx.fillRoundedRect(btnX - btnW / 2, btnCenterY - 16, btnW, 32, 8);
        btnGfx.lineStyle(1.2, isActive ? 0xfacc15 : 0x4ade80, 0.95);
        btnGfx.strokeRoundedRect(btnX - btnW / 2, btnCenterY - 16, btnW, 32, 8);

        const btnZone = this.add.zone(btnX, btnCenterY, btnW, 32);
        if (!isActive) btnZone.setInteractive({ useHandCursor: true });

        const btnTxt = this.add.text(btnX, btnCenterY, isActive ? 'НАДЕТО' : 'ВЫБРАТЬ', {
          fontSize: '11.5px',
          fontFamily: FONT_UI,
          color: isActive ? '#facc15' : '#86efac',
          fontStyle: 'bold',
          resolution: dpr
        }).setOrigin(0.5);

        btnZone.on('pointerdown', () => {
          if (this.isDragging || isActive) return;
          Storage.setActiveToolSkin(skin.id);
          if (AudioManager.playClick) AudioManager.playClick();
          this.renderContent();
        });

        card.add([cardBg, setPreview, title, desc, btnGfx, btnZone, btnTxt]);
      } else {
        const hasCoins = skin.priceCoins !== null && skin.priceCoins > 0;
        const hasAds = skin.adsRequired > 0;

        if (hasCoins && hasAds) {
          const cGfx = this.add.graphics();
          cGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
          cGfx.fillRoundedRect(btnX - btnW / 2, btnCenterY - 26, btnW, 24, 6);
          const cZone = this.add.zone(btnX, btnCenterY - 14, btnW, 24).setInteractive({ useHandCursor: true });
          const cTxt = this.add.text(btnX, btnCenterY - 14, `${skin.priceCoins} мон.`, {
            fontSize: '11px',
            fontFamily: FONT_UI,
            color: '#1a1004',
            fontStyle: 'bold',
            resolution: dpr
          }).setOrigin(0.5);

          cZone.on('pointerdown', () => {
            if (this.isDragging) return;
            if (Storage.getCoins() >= skin.priceCoins) {
              Storage.addCoins(-skin.priceCoins);
              Storage.unlockToolSkin(skin.id);
              Storage.setActiveToolSkin(skin.id);
              if (AudioManager.playShine) AudioManager.playShine();
              this.updateCoinsDisplay();
              this.renderContent();
            } else if (AudioManager.playBreakSnap) {
              AudioManager.playBreakSnap();
            }
          });

          const aGfx = this.add.graphics();
          aGfx.fillStyle(0x1e3a8a, 1);
          aGfx.fillRoundedRect(btnX - btnW / 2, btnCenterY + 2, btnW, 24, 6);
          const aZone = this.add.zone(btnX, btnCenterY + 14, btnW, 24).setInteractive({ useHandCursor: true });
          const aTxt = this.add.text(btnX, btnCenterY + 14, `Реклама ${adProgress}/${skin.adsRequired}`, {
            fontSize: '10.5px',
            fontFamily: FONT_UI,
            color: '#ffffff',
            fontStyle: 'bold',
            resolution: dpr
          }).setOrigin(0.5);

          aZone.on('pointerdown', () => {
            if (this.isDragging) return;
            YandexSDK.showRewarded(() => {
              const nextAds = adProgress + 1;
              localStorage.setItem(`tool_skin_ads_${skin.id}`, String(nextAds));
              if (nextAds >= skin.adsRequired) {
                Storage.unlockToolSkin(skin.id);
                Storage.setActiveToolSkin(skin.id);
                if (AudioManager.playShine) AudioManager.playShine();
              } else if (AudioManager.playCoin) {
                AudioManager.playCoin();
              }
              this.renderContent();
            });
          });

          card.add([cardBg, setPreview, title, desc, cGfx, cZone, cTxt, aGfx, aZone, aTxt]);
        } else if (hasCoins) {
          const cGfx = this.add.graphics();
          cGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
          cGfx.fillRoundedRect(btnX - btnW / 2, btnCenterY - 16, btnW, 32, 8);
          const cZone = this.add.zone(btnX, btnCenterY, btnW, 32).setInteractive({ useHandCursor: true });
          const cTxt = this.add.text(btnX, btnCenterY, `${skin.priceCoins} мон.`, {
            fontSize: '11.5px',
            fontFamily: FONT_UI,
            color: '#1a1004',
            fontStyle: 'bold',
            resolution: dpr
          }).setOrigin(0.5);

          cZone.on('pointerdown', () => {
            if (this.isDragging) return;
            if (Storage.getCoins() >= skin.priceCoins) {
              Storage.addCoins(-skin.priceCoins);
              Storage.unlockToolSkin(skin.id);
              Storage.setActiveToolSkin(skin.id);
              if (AudioManager.playShine) AudioManager.playShine();
              this.updateCoinsDisplay();
              this.renderContent();
            } else if (AudioManager.playBreakSnap) {
              AudioManager.playBreakSnap();
            }
          });

          card.add([cardBg, setPreview, title, desc, cGfx, cZone, cTxt]);
        } else if (hasAds) {
          const aGfx = this.add.graphics();
          aGfx.fillStyle(0x1e3a8a, 1);
          aGfx.fillRoundedRect(btnX - btnW / 2, btnCenterY - 16, btnW, 32, 8);
          aGfx.lineStyle(1, 0x38bdf8, 0.95);
          aGfx.strokeRoundedRect(btnX - btnW / 2, btnCenterY - 16, btnW, 32, 8);

          const aZone = this.add.zone(btnX, btnCenterY, btnW, 32).setInteractive({ useHandCursor: true });
          const aTxt = this.add.text(btnX, btnCenterY, `Реклама ${adProgress}/${skin.adsRequired}`, {
            fontSize: '11px',
            fontFamily: FONT_UI,
            color: '#ffffff',
            fontStyle: 'bold',
            resolution: dpr
          }).setOrigin(0.5);

          aZone.on('pointerdown', () => {
            if (this.isDragging) return;
            YandexSDK.showRewarded(() => {
              const nextAds = adProgress + 1;
              localStorage.setItem(`tool_skin_ads_${skin.id}`, String(nextAds));
              if (nextAds >= skin.adsRequired) {
                Storage.unlockToolSkin(skin.id);
                Storage.setActiveToolSkin(skin.id);
                if (AudioManager.playShine) AudioManager.playShine();
              } else if (AudioManager.playCoin) {
                AudioManager.playCoin();
              }
              this.renderContent();
            });
          });

          card.add([cardBg, setPreview, title, desc, aGfx, aZone, aTxt]);
        }
      }

      this.itemsContainer.add(card);
      curY += skinCardH + 10;
    });

    // --- СЕКЦИЯ Б: ВНЕШНИЙ ВИД ВЕРСТАКА (15 СТОЛОВ + СУНДУК ИСКАТЕЛЯ) ---
    curY += 8;
    const secHeader2 = this.add.text(width / 2, curY + 12, 'СТИЛЬ ВЕРСТАКА (СТОЛЫ МАСТЕРСКОЙ)', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      letterSpacing: 1,
      resolution: dpr
    }).setOrigin(0.5);
    this.itemsContainer.add(secHeader2);
    curY += 30;

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
      { id: 'workbench_bg_13', type: 'era', name: 'Эпоха: Ацтеки', desc: 'Массивное тропическое дерево с обсидианом', price: 7500 },
      { id: 'workbench_bg_14', type: 'era', name: 'Эпоха: Викинги', desc: 'Северный дуб с мехами, рунами и щитами', price: 7500 },
      { id: 'workbench_bg_15', type: 'era', name: 'Эпоха: Ренессанс', desc: 'Полированный орех с чертежами и красками', price: 7500 },
      { id: 'workbench_bg_5', type: 'legendary', name: 'Эксклюзив: Алхимия', desc: 'Тайная каменная плита со светящимися зельями', price: null },
      { id: 'workbench_bg_6', type: 'legendary', name: 'Эксклюзив: Киберпанк', desc: 'Лаборатория будущего с неонами и платами', price: null },
      { id: 'workbench_bg_7', type: 'legendary', name: 'Эксклюзив: Батискаф', desc: 'Подводная станция с иллюминаторами и трубами', price: null },
      { id: 'workbench_bg_8', type: 'legendary', name: 'Эксклюзив: Космос', desc: 'Орбитальная станция с видом на звёзды', price: null }
    ];

    const wbCardH = 88;

    // Сундук Искателя
    {
      const cardY = curY + wbCardH / 2;
      const boxCont = this.add.container(width / 2, cardY);

      const boxBg = this.add.graphics();
      boxBg.fillGradientStyle(0x3b1c0a, 0x3b1c0a, 0x1e0f06, 0x1e0f06, 0.85);
      boxBg.fillRoundedRect(-cardW / 2, -wbCardH / 2, cardW, wbCardH, 11);
      boxBg.lineStyle(2, 0xeab308, 0.95);
      boxBg.strokeRoundedRect(-cardW / 2, -wbCardH / 2, cardW, wbCardH, 11);

      const chestIcon = this.add.image(-cardW / 2 + 38, 0, 'lootbox_chest').setDisplaySize(48, 48);
      const textMaxW = cardW - 180;

      const title = this.add.text(-cardW / 2 + 74, -26, 'СУНДУК ИСКАТЕЛЯ', {
        fontSize: '13px',
        fontFamily: FONT_UI,
        color: '#fef08a',
        fontStyle: 'bold',
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 74, -2, `Шанс редкого стола (гарант ${pityCount}/15), лак Кинцуги или монеты`, {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        wordWrap: { width: textMaxW },
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
      const openTxt = this.add.text(0, 0, `${lootboxPrice}`, {
        fontSize: '12px',
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
          this.updateCoinsDisplay();
          this.renderContent();
        } else if (AudioManager.playBreakSnap) {
          AudioManager.playBreakSnap();
        }
      });

      boxCont.add([boxBg, chestIcon, title, desc, openBtn]);
      this.itemsContainer.add(boxCont);
      curY += wbCardH + 8;
    }

    tiers.forEach((item) => {
      const cardY = curY + wbCardH / 2;

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
        isCurrentActive ? 0.82 : 0.72
      );
      cardBg.fillRoundedRect(-cardW / 2, -wbCardH / 2, cardW, wbCardH, 11);

      let borderClr = 0xc89d54;
      if (isCurrentActive) borderClr = 0xfacc15;
      else if (isPurchased) borderClr = 0x4ade80;
      else if (isExclusive) borderClr = 0xc084fc;
      else if (isBaseLocked) borderClr = 0x5c3d22;

      cardBg.lineStyle(isCurrentActive ? 1.8 : 1.2, borderClr, isBaseLocked ? 0.45 : 0.9);
      cardBg.strokeRoundedRect(-cardW / 2, -wbCardH / 2, cardW, wbCardH, 11);

      const textMaxW = cardW - 125;
      const title = this.add.text(-cardW / 2 + 16, -24, item.name, {
        fontSize: '13px',
        fontFamily: FONT_UI,
        color: isBaseLocked ? '#9c8265' : (isExclusive ? '#f3e8ff' : '#fdf6e3'),
        fontStyle: 'bold',
        wordWrap: { width: textMaxW },
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 16, 2, item.desc, {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: isBaseLocked ? '#7a6552' : '#e6d5bc',
        wordWrap: { width: textMaxW },
        resolution: dpr
      });

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
      else if (canBuy) btnLabel = `${item.price}`;

      const actionTxt = this.add.text(0, 0, btnLabel, {
        fontSize: '11.5px',
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
          } else if (AudioManager.playBreakSnap) {
            AudioManager.playBreakSnap();
          }
        }
      });

      card.add([cardBg, title, desc, actionBtn]);
      this.itemsContainer.add(card);
      curY += wbCardH + 8;
    });

    const totalH = curY + 20;
    this.minScrollY = Math.min(this.listTopY, this.listBottomY - totalH);
  }

  rollLootboxRebalanced(cost) {
    const coins = Storage.getCoins();
    if (coins < cost) return { success: false };
    Storage.addCoins(-cost);

    const exclusiveSkins = [
      { id: 'workbench_bg_5', name: 'Эксклюзив: Алхимия' },
      { id: 'workbench_bg_6', name: 'Эксклюзив: Киберпанк' },
      { id: 'workbench_bg_7', name: 'Эксклюзив: Батискаф' },
      { id: 'workbench_bg_8', name: 'Эксклюзив: Космос' }
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
      const win = allUnowned[Math.floor(Math.random() * allUnowned.length)];
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
      return { success: true, type: 'lacquer', amount: lac, name: `Золотой лак (${lac} шт.)` };
    }

    const reward = Math.round((450 + Math.random() * 650) / 10) * 10;
    Storage.addCoins(reward);
    return { success: true, type: 'coins', amount: reward, name: `${reward} монет` };
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

    const cardH = 88;
    const cardW = width * 0.92;

    expansions.forEach((exp, i) => {
      const cardY = i * (cardH + 8) + cardH / 2;
      const isBought = localStorage.getItem(`museum_upg_${exp.id}`) === 'true';

      const card = this.add.container(width / 2, cardY);

      const cardBg = this.add.graphics();
      cardBg.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.78);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);
      cardBg.lineStyle(1.3, isBought ? 0x4ade80 : 0xc89d54, 0.85);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      const textMaxW = cardW - 125;
      const name = this.add.text(-cardW / 2 + 16, -24, exp.name, {
        fontSize: '13px',
        fontFamily: FONT_UI,
        color: '#fdf6e3',
        fontStyle: 'bold',
        wordWrap: { width: textMaxW },
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 16, 2, exp.desc, {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        wordWrap: { width: textMaxW },
        resolution: dpr
      });

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

      const actionTxt = this.add.text(0, 0, isBought ? 'КУПЛЕНО' : `${exp.price}`, {
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
          } else if (AudioManager.playBreakSnap) {
            AudioManager.playBreakSnap();
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
