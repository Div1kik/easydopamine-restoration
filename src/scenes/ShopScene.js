import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { YandexSDK } from '../utils/YandexSDK.js';
import { drawDetailedToolCanvas } from '../utils/ToolArt.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create() {
    const { width, height } = this.scale;
    const textRes = 3;
    this.textRes = textRes;
    this.isModalOpen = false;

    const FONT_TITLE = '"Cormorant Garamond", Georgia, serif';
    const FONT_UI = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.FONT_UI = FONT_UI;

    if (this.textures.exists('shop_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'shop_bg').setDepth(0);
      bg.setScale(Math.max(width / bg.width, height / bg.height));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0805, 0.36).setDepth(0);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x120b07).setDepth(0);
    }

    const headerBg = this.add.graphics().setDepth(18);
    headerBg.fillGradientStyle(0x24180f, 0x24180f, 0x140d08, 0x140d08, 0.96);
    headerBg.fillRect(0, 0, width, 114);
    headerBg.lineStyle(1.5, 0xc89d54, 0.65);
    headerBg.lineBetween(0, 114, width, 114);

    this.add.text(width / 2, 22, '🕯 ЛАВКА МАСТЕРА', {
      fontSize: '20px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      resolution: textRes
    }).setOrigin(0.5).setDepth(20);

    const coins = Storage.getCoins();
    const lacquer = Storage.getKintsugiLacquer();
    this.coinsText = this.add.text(
      width / 2,
      48,
      `Казна: ${coins} 🪙   |   Лак Кинцуги: ${lacquer} ✨`,
      {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#facc15',
        fontStyle: 'bold',
        resolution: textRes
      }
    ).setOrigin(0.5).setDepth(20);

    this.activeTab = 'tools';
    this.createCategoryTabs(width, 86);

    this.listTopY = 120;
    this.listBottomY = height - 68;
    this.listContainer = this.add.container(0, this.listTopY).setDepth(5);

    this.setupScrollHandlers();
    this.renderShopItems();

    const footerBg = this.add.graphics().setDepth(30);
    footerBg.fillGradientStyle(0x1f140c, 0x1f140c, 0x120b07, 0x120b07, 0.96);
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

    this.add.text(width / 2, btnY, 'В главное меню', {
      fontSize: '14px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5).setDepth(32);

    backZone.on('pointerdown', () => {
      if (this.isModalOpen) return;
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });
  }

  preloadWorkbenchInBackground(skinId) {
    if (!skinId || this.textures.exists(skinId)) return;
    this.load.image(skinId, `assets/workbenches/${skinId}.webp`);
    if (!this.load.isLoading()) {
      this.load.start();
    }
  }

  updateHeaderBalance() {
    const coins = Storage.getCoins();
    const lacquer = Storage.getKintsugiLacquer();
    this.coinsText.setText(`Казна: ${coins} 🪙   |   Лак Кинцуги: ${lacquer} ✨`);
  }

  createCategoryTabs(width, y) {
    const tabs = [
      { id: 'tools', label: 'Инструменты' },
      { id: 'cosmetics', label: 'Стиль' },
      { id: 'museum', label: 'Музей' }
    ];

    const tabW = (width * 0.90) / tabs.length - 6;
    const tabH = 32;
    const spacing = 8;
    const startX = width / 2 - ((tabW + spacing) * tabs.length - spacing) / 2 + tabW / 2;

    this.tabItems = [];

    tabs.forEach((t, i) => {
      const tx = startX + i * (tabW + spacing);
      const isSelected = (t.id === this.activeTab);

      const gfx = this.add.graphics().setDepth(20);
      const drawTab = (selected) => {
        gfx.clear();
        gfx.fillStyle(selected ? 0xd99b26 : 0x24180f, selected ? 0.96 : 0.85);
        gfx.fillRoundedRect(tx - tabW / 2, y - tabH / 2, tabW, tabH, 8);
        gfx.lineStyle(selected ? 1.5 : 1, selected ? 0xfef08a : 0x8c6239, 0.9);
        gfx.strokeRoundedRect(tx - tabW / 2, y - tabH / 2, tabW, tabH, 8);
      };
      drawTab(isSelected);

      const txt = this.add.text(tx, y, t.label, {
        fontSize: '12px',
        fontFamily: this.FONT_UI,
        color: isSelected ? '#1a1004' : '#fdf6e3',
        fontStyle: 'bold',
        resolution: this.textRes
      }).setOrigin(0.5).setDepth(21);

      const zone = this.add.zone(tx, y, tabW, tabH)
        .setInteractive({ useHandCursor: true })
        .setDepth(22);

      zone.on('pointerdown', () => {
        if (this.isModalOpen) return;
        if (this.activeTab === t.id) return;
        if (AudioManager.playClick) AudioManager.playClick();
        this.activeTab = t.id;
        this.tabItems.forEach((item) => {
          const active = (item.id === this.activeTab);
          item.drawTab(active);
          item.txt.setColor(active ? '#1a1004' : '#fdf6e3');
        });
        this.renderShopItems();
      });

      this.tabItems.push({ id: t.id, drawTab, txt });
    });
  }

  setupScrollHandlers() {
    let startY = 0;
    let listStartY = 0;
    let pointerActive = false;
    this.isDraggingList = false;

    this.input.on('pointerdown', (p) => {
      if (this.isModalOpen) return;
      if (p.y >= this.listTopY && p.y <= this.listBottomY) {
        pointerActive = true;
        startY = p.y;
        listStartY = this.listContainer.y;
        this.isDraggingList = false;
      }
    });

    this.input.on('pointermove', (p) => {
      if (!pointerActive || this.isModalOpen) return;
      const dy = p.y - startY;
      if (Math.abs(dy) > 6) {
        this.isDraggingList = true;
      }
      if (this.isDraggingList) {
        const minScroll = this.minListY !== undefined ? this.minListY : this.listTopY;
        this.listContainer.y = Phaser.Math.Clamp(listStartY + dy, minScroll, this.listTopY);
      }
    });

    this.input.on('pointerup', () => {
      pointerActive = false;
    });

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      if (this.isModalOpen) return;
      if (pointer.y >= this.listTopY && pointer.y <= this.listBottomY) {
        const minScroll = this.minListY !== undefined ? this.minListY : this.listTopY;
        this.listContainer.y = Phaser.Math.Clamp(this.listContainer.y - deltaY * 0.45, minScroll, this.listTopY);
      }
    });
  }

  getToolPreviewTexture(toolType, tier, skin) {
    const key = `shop_preview_${toolType}_t${tier}_${skin}`;
    if (!this.textures.exists(key)) {
      const cvs = this.textures.createCanvas(key, 96, 96);
      const ctx = cvs.getContext();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      drawDetailedToolCanvas(ctx, toolType, tier, skin, 96);
      cvs.refresh();
    }
    return key;
  }

  checkUpgradePrerequisite(item) {
    if (!item.reqKey) return { allowed: true, reason: '' };
    const prevOwned = localStorage.getItem(item.reqKey) === 'true';
    if (prevOwned) return { allowed: true, reason: '' };
    return {
      allowed: false,
      reason: item.reqLabel || 'Нужен пред. уровень'
    };
  }

  renderShopItems() {
    this.listContainer.removeAll(true);
    this.listContainer.y = this.listTopY;

    const { width } = this.scale;
    const textRes = this.textRes;
    const FONT_UI = this.FONT_UI;
    const activeToolSkin = Storage.getActiveToolSkin();

    if (this.activeTab === 'tools') {
      const upgrades = [
        { key: 'tool_upg_scraper_2', toolType: 'scraper', tier: 2, title: 'Скребок II: Бронза', desc: 'Шире лезвие (+27% радиус)', price: 180 },
        { key: 'tool_upg_scraper_3', reqKey: 'tool_upg_scraper_2', reqLabel: 'НУЖЕН СКРЕБОК II', toolType: 'scraper', tier: 3, title: 'Скребок III: Дамаск', desc: 'Скол породы за 1 проход!', price: 620 },
        { key: 'tool_upg_scraper_4', reqKey: 'tool_upg_scraper_3', reqLabel: 'НУЖЕН СКРЕБОК III', toolType: 'scraper', tier: 4, title: 'Скребок IV: Алмазный', desc: 'Максимальный захват пласта', price: 2650 },

        { key: 'tool_upg_brush_2', toolType: 'brush', tier: 2, title: 'Кисть II: Соболиная', desc: 'Широкий веер (+22% радиус)', price: 160 },
        { key: 'tool_upg_brush_3', reqKey: 'tool_upg_brush_2', reqLabel: 'НУЖНА КИСТЬ II', toolType: 'brush', tier: 3, title: 'Кисть III: Антистатик', desc: 'Сметает пыль за 1 взмах!', price: 560 },
        { key: 'tool_upg_brush_4', reqKey: 'tool_upg_brush_3', reqLabel: 'НУЖНА КИСТЬ III', toolType: 'brush', tier: 4, title: 'Кисть IV: Императорская', desc: 'Мгновенная чистка рельефа', price: 2400 },

        { key: 'tool_upg_solvent_2', toolType: 'solvent', tier: 2, title: 'Реагент II: Эфир', desc: 'Увеличенная зона реакции', price: 250 },
        { key: 'tool_upg_solvent_3', reqKey: 'tool_upg_solvent_2', reqLabel: 'НУЖЕН РЕАГЕНТ II', toolType: 'solvent', tier: 3, title: 'Реагент III: Аква-Регия', desc: 'Снимает окислы за 1 касание!', price: 780 },
        { key: 'tool_upg_solvent_4', reqKey: 'tool_upg_solvent_3', reqLabel: 'НУЖЕН РЕАГЕНТ III', toolType: 'solvent', tier: 4, title: 'Реагент IV: Эликсир', desc: 'Глубокое очищение патины', price: 3200 },

        { key: 'tool_upg_polish_2', toolType: 'polish', tier: 2, title: 'Полироль II: Замша', desc: 'Широкий бархатный диск', price: 230 },
        { key: 'tool_upg_polish_3', reqKey: 'tool_upg_polish_2', reqLabel: 'НУЖНА ПОЛИРОЛЬ II', toolType: 'polish', tier: 3, title: 'Полироль III: Алмазная', desc: 'Зеркальный глянец за 1 проход!', price: 720 },
        { key: 'tool_upg_polish_4', reqKey: 'tool_upg_polish_3', reqLabel: 'НУЖНА ПОЛИРОЛЬ III', toolType: 'polish', tier: 4, title: 'Полироль IV: Солнечный воск', desc: 'Максимальный радиус полировки', price: 2950 },

        { key: 'kintsugi_pack_1', isConsumable: true, count: 1, toolType: 'glue', tier: 1, title: 'Золотой лак Кинцуги (1 шт.)', desc: '+60% к цене склеенного артефакта', price: 500 },
        { key: 'kintsugi_pack_3', isConsumable: true, count: 3, toolType: 'glue', tier: 1, title: 'Набор Кинцуги (3 шт.)', desc: 'Выгодный запас для редких сколов', price: 1300 }
      ];

      this.renderCardList(upgrades, width, textRes, FONT_UI, activeToolSkin);
    } else if (this.activeTab === 'cosmetics') {
      this.renderCosmeticsTab(width, textRes, FONT_UI);
    } else if (this.activeTab === 'museum') {
      const museumUpgrades = [
        { key: 'museum_upg_pedestal_1', icon: '🏛', title: 'Бархатные витрины', desc: '+15% к пассивному доходу музея', price: 340 },
        { key: 'museum_upg_pedestal_2', reqKey: 'museum_upg_pedestal_1', reqLabel: 'НУЖНЫ ВИТРИНЫ', icon: '💡', title: 'Музейная подсветка', desc: '+25% к доходу от посетителей', price: 1050 },
        { key: 'museum_upg_hall_antique', icon: '🏺', title: 'Крыло Древнего мира', desc: '+50% к доходу Египта и Античности', price: 2100 },
        { key: 'museum_upg_hall_royal', reqKey: 'museum_upg_hall_antique', reqLabel: 'НУЖНО КРЫЛО', icon: '👑', title: 'Королевский купол', desc: '+50% ко всему пассивному доходу', price: 4600 }
      ];

      this.renderCardList(museumUpgrades, width, textRes, FONT_UI, activeToolSkin);
    }
  }

  renderCardList(items, width, textRes, FONT_UI, activeToolSkin) {
    const cardW = width * 0.92;
    const cardH = 84;
    const spacing = 10;

    items.forEach((item, index) => {
      const cardY = index * (cardH + spacing) + cardH / 2 + 6;
      const isOwned = !item.isConsumable && (localStorage.getItem(item.key) === 'true');
      const prereq = (!isOwned && !item.isConsumable) ? this.checkUpgradePrerequisite(item) : { allowed: true, reason: '' };
      const isLocked = !isOwned && !prereq.allowed;

      const cardCont = this.add.container(width / 2, cardY);

      const gfx = this.add.graphics();
      gfx.fillGradientStyle(
        isOwned ? 0x162b1d : (isLocked ? 0x17110d : 0x261a10),
        isOwned ? 0x162b1d : (isLocked ? 0x17110d : 0x261a10),
        isOwned ? 0x0e1c13 : (isLocked ? 0x100b08 : 0x170f09),
        isOwned ? 0x0e1c13 : (isLocked ? 0x100b08 : 0x170f09),
        isLocked ? 0.65 : 0.85
      );
      gfx.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
      gfx.lineStyle(1.3, isOwned ? 0x4ade80 : (isLocked ? 0x4a3525 : 0xc89d54), isLocked ? 0.55 : 0.88);
      gfx.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);

      gfx.fillStyle(0x0d0805, 0.5);
      gfx.fillRoundedRect(-cardW / 2 + 10, -28, 56, 56, 10);

      let iconObj;
      if (item.toolType) {
        const texKey = this.getToolPreviewTexture(item.toolType, item.tier, activeToolSkin);
        iconObj = this.add.image(-cardW / 2 + 38, 0, texKey)
          .setDisplaySize(46, 46)
          .setAlpha(isLocked ? 0.45 : 1);
      } else {
        iconObj = this.add.text(-cardW / 2 + 38, 0, item.icon || '✨', {
          fontSize: '26px',
          resolution: textRes
        }).setOrigin(0.5).setAlpha(isLocked ? 0.45 : 1);
      }

      const textMaxW = cardW - 190;
      const titleTxt = this.add.text(-cardW / 2 + 76, -15, item.title, {
        fontSize: '13px',
        fontFamily: FONT_UI,
        color: isLocked ? '#8c735b' : '#fdf6e3',
        fontStyle: 'bold',
        wordWrap: { width: textMaxW },
        resolution: textRes
      }).setOrigin(0, 0.5);

      const descTxt = this.add.text(-cardW / 2 + 76, 14, item.desc, {
        fontSize: '11px',
        fontFamily: FONT_UI,
        color: isLocked ? '#6b5643' : '#d6c3a5',
        wordWrap: { width: textMaxW },
        resolution: textRes
      }).setOrigin(0, 0.5);

      const btnW = 98;
      const btnH = 34;
      const btnX = cardW / 2 - btnW / 2 - 12;

      const btnGfx = this.add.graphics();
      if (isOwned) {
        btnGfx.fillStyle(0x1e3322, 0.95);
        btnGfx.fillRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 8);
        btnGfx.lineStyle(1, 0x4ade80, 0.9);
        btnGfx.strokeRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 8);
      } else if (isLocked) {
        btnGfx.fillStyle(0x1f1712, 0.95);
        btnGfx.fillRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 8);
        btnGfx.lineStyle(1, 0x5c4330, 0.8);
        btnGfx.strokeRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 8);
      } else {
        btnGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
        btnGfx.fillRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 8);
        btnGfx.lineStyle(1, 0xfef08a, 0.95);
        btnGfx.strokeRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 8);
      }

      let btnStr = `${item.price} 🪙`;
      let btnColor = '#1a1004';
      let btnFontSize = '12.5px';

      if (isOwned) {
        btnStr = 'КУПЛЕНО';
        btnColor = '#86efac';
        btnFontSize = '11px';
      } else if (isLocked) {
        btnStr = `🔒 ${prereq.reason}`;
        btnColor = '#9c8265';
        btnFontSize = '9.5px';
      }

      const btnLabel = this.add.text(btnX, 0, btnStr, {
        fontSize: btnFontSize,
        fontFamily: FONT_UI,
        color: btnColor,
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: btnW - 8 },
        resolution: textRes
      }).setOrigin(0.5);

      const hitZone = this.add.zone(btnX, 0, btnW, btnH)
        .setInteractive({ useHandCursor: !isOwned && !isLocked });

      hitZone.on('pointerup', () => {
        if (this.isDraggingList || this.isModalOpen || isOwned) return;

        if (isLocked) {
          if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
          return;
        }

        if (Storage.getCoins() >= item.price) {
          Storage.addCoins(-item.price);
          if (item.isConsumable) {
            Storage.addKintsugiLacquer(item.count || 1);
          } else {
            localStorage.setItem(item.key, 'true');
          }
          if (AudioManager.playCoin) AudioManager.playCoin();
          this.updateHeaderBalance();
          this.renderShopItems();
        } else if (AudioManager.playBreakSnap) {
          AudioManager.playBreakSnap();
        }
      });

      cardCont.add([gfx, iconObj, titleTxt, descTxt, btnGfx, btnLabel, hitZone]);
      this.listContainer.add(cardCont);
    });

    const totalH = items.length * (cardH + spacing) + 24;
    this.minListY = Math.min(this.listTopY, this.listBottomY - totalH);
  }

  renderCosmeticsTab(width, textRes, FONT_UI) {
    const cardW = width * 0.92;
    let curY = 8;

    const chestH = 128;
    const chestCont = this.add.container(width / 2, curY + chestH / 2);

    const chestGfx = this.add.graphics();
    chestGfx.fillGradientStyle(0x332011, 0x332011, 0x1a1008, 0x1a1008, 0.92);
    chestGfx.fillRoundedRect(-cardW / 2, -chestH / 2, cardW, chestH, 14);
    chestGfx.lineStyle(1.8, 0xfacc15, 0.95);
    chestGfx.strokeRoundedRect(-cardW / 2, -chestH / 2, cardW, chestH, 14);

    const chestImg = this.add.image(-cardW / 2 + 52, -4, 'lootbox_chest').setDisplaySize(78, 78);

    const pityCount = parseInt(localStorage.getItem(Storage.KEYS.TOOL_BOX_PITY) || '0', 10);
    const chestTitle = this.add.text(-cardW / 2 + 102, -42, '🎁 СУНДУК ИСКАТЕЛЯ', {
      fontSize: '14px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0, 0.5);

    const chestDesc = this.add.text(
      -cardW / 2 + 102,
      -10,
      `4 уникальных верстака (шанс 12%), Лак Кинцуги или 750–1300 🪙\nГарант эксклюзива: ${pityCount}/10`,
      {
        fontSize: '10.5px',
        fontFamily: FONT_UI,
        color: '#f5e6c8',
        wordWrap: { width: cardW - 116 },
        lineSpacing: 3,
        resolution: textRes
      }
    ).setOrigin(0, 0.5);

    const openBtnW = 148;
    const openBtnH = 34;
    const openBtnX = -cardW / 2 + 102 + openBtnW / 2;
    const openBtnY = 34;

    const openGfx = this.add.graphics();
    openGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
    openGfx.fillRoundedRect(openBtnX - openBtnW / 2, openBtnY - openBtnH / 2, openBtnW, openBtnH, 8);
    openGfx.lineStyle(1, 0xfef08a, 0.95);
    openGfx.strokeRoundedRect(openBtnX - openBtnW / 2, openBtnY - openBtnH / 2, openBtnW, openBtnH, 8);

    const openZone = this.add.zone(openBtnX, openBtnY, openBtnW, openBtnH).setInteractive({ useHandCursor: true });
    const openTxt = this.add.text(openBtnX, openBtnY, 'ОТКРЫТЬ (1650 🪙)', {
      fontSize: '11px',
      fontFamily: FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    openZone.on('pointerup', () => {
      if (this.isDraggingList || this.isModalOpen) return;
      if (Storage.getCoins() >= 1650) {
        Storage.addCoins(-1650);
        this.updateHeaderBalance();
        this.openLootboxInteractive();
      } else if (AudioManager.playBreakSnap) {
        AudioManager.playBreakSnap();
      }
    });

    const adBtnW = 112;
    const adBtnX = openBtnX + openBtnW / 2 + 10 + adBtnW / 2;
    const adGfx = this.add.graphics();
    adGfx.fillStyle(0x1e3a8a, 1);
    adGfx.fillRoundedRect(adBtnX - adBtnW / 2, openBtnY - openBtnH / 2, adBtnW, openBtnH, 8);
    adGfx.lineStyle(1, 0x38bdf8, 0.95);
    adGfx.strokeRoundedRect(adBtnX - adBtnW / 2, openBtnY - openBtnH / 2, adBtnW, openBtnH, 8);

    const adZone = this.add.zone(adBtnX, openBtnY, adBtnW, openBtnH).setInteractive({ useHandCursor: true });
    const adTxt = this.add.text(adBtnX, openBtnY, '🎬 БЕСПЛАТНО', {
      fontSize: '10.5px',
      fontFamily: FONT_UI,
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    adZone.on('pointerup', () => {
      if (this.isDraggingList || this.isModalOpen) return;
      YandexSDK.showRewarded(() => {
        this.openLootboxInteractive();
      });
    });

    chestCont.add([chestGfx, chestImg, chestTitle, chestDesc, openGfx, openTxt, openZone, adGfx, adTxt, adZone]);
    this.listContainer.add(chestCont);
    curY += chestH + 16;

    const toolSkinsTitle = this.add.text(width * 0.04, curY, '✨ СТИЛЬ ИНСТРУМЕНТОВ', {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    });
    this.listContainer.add(toolSkinsTitle);
    curY += 26;

    const toolSkins = [
      { id: 'default', title: 'Классика гильдии', desc: 'Традиционная сталь и тёплый орех', price: 0 },
      { id: 'gold', title: 'Царское золото', desc: 'Чеканный золотой сплав и красный бархат', price: 1200 },
      { id: 'jade', title: 'Императорский нефрит', desc: 'Резной зелёный камень и золотая гравировка', price: 1850 },
      { id: 'obsidian', title: 'Обсидиан ацтеков', desc: 'Чёрное вулканическое стекло и бирюза', price: 2600 },
      { id: 'cyber', title: 'Хроно-неон', desc: 'Технологичный титан с лазурным свечением', price: 3500 }
    ];

    const ownedToolSkins = Storage.getOwnedToolSkins();
    const activeToolSkin = Storage.getActiveToolSkin();

    toolSkins.forEach((skin) => {
      const cardH = 74;
      const cy = curY + cardH / 2;
      const owned = ownedToolSkins.includes(skin.id);
      const isSelected = (activeToolSkin === skin.id);

      const cont = this.add.container(width / 2, cy);
      const gfx = this.add.graphics();
      gfx.fillGradientStyle(
        isSelected ? 0x3b2614 : 0x24180f,
        isSelected ? 0x3b2614 : 0x24180f,
        0x160f0a,
        0x160f0a,
        0.88
      );
      gfx.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);
      gfx.lineStyle(isSelected ? 1.8 : 1.2, isSelected ? 0xfacc15 : 0x8c6239, 0.9);
      gfx.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 11);

      const previewTex = this.getToolPreviewTexture('scraper', 3, skin.id);
      const icon = this.add.image(-cardW / 2 + 36, 0, previewTex).setDisplaySize(44, 44);

      const tTxt = this.add.text(-cardW / 2 + 70, -13, skin.title, {
        fontSize: '13px',
        fontFamily: FONT_UI,
        color: '#fdf6e3',
        fontStyle: 'bold',
        resolution: textRes
      }).setOrigin(0, 0.5);

      const dTxt = this.add.text(-cardW / 2 + 70, 12, skin.desc, {
        fontSize: '11px',
        fontFamily: FONT_UI,
        color: '#d6c3a5',
        wordWrap: { width: cardW - 180 },
        resolution: textRes
      }).setOrigin(0, 0.5);

      const btnW = 92;
      const btnH = 32;
      const btnX = cardW / 2 - btnW / 2 - 12;

      const btnGfx = this.add.graphics();
      if (isSelected) {
        btnGfx.fillStyle(0x16a34a, 1);
        btnGfx.fillRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 8);
      } else if (owned) {
        btnGfx.fillStyle(0x332215, 1);
        btnGfx.fillRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 8);
        btnGfx.lineStyle(1, 0xc89d54, 0.9);
        btnGfx.strokeRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 8);
      } else {
        btnGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
        btnGfx.fillRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 8);
      }

      const btnTxt = this.add.text(
        btnX,
        0,
        isSelected ? 'ВЫБРАНО' : (owned ? 'ВЫБРАТЬ' : `${skin.price} 🪙`),
        {
          fontSize: '11.5px',
          fontFamily: FONT_UI,
          color: isSelected ? '#ffffff' : (owned ? '#fdf6e3' : '#1a1004'),
          fontStyle: 'bold',
          resolution: textRes
        }
      ).setOrigin(0.5);

      const zone = this.add.zone(btnX, 0, btnW, btnH).setInteractive({ useHandCursor: true });
      zone.on('pointerup', () => {
        if (this.isDraggingList || this.isModalOpen) return;
        if (owned) {
          Storage.setActiveToolSkin(skin.id);
          if (AudioManager.playClick) AudioManager.playClick();
          this.renderShopItems();
        } else if (Storage.getCoins() >= skin.price) {
          Storage.addCoins(-skin.price);
          Storage.unlockToolSkin(skin.id);
          Storage.setActiveToolSkin(skin.id);
          if (AudioManager.playCoin) AudioManager.playCoin();
          this.updateHeaderBalance();
          this.renderShopItems();
        } else if (AudioManager.playBreakSnap) {
          AudioManager.playBreakSnap();
        }
      });

      cont.add([gfx, icon, tTxt, dTxt, btnGfx, btnTxt, zone]);
      this.listContainer.add(cont);
      curY += cardH + 8;
    });

    curY += 10;

    // 3. Интерьер мастерской (сбалансированные цены по эпохам + 4 эксклюзива в сундуке)
    const wbTitle = this.add.text(width * 0.04, curY, '🏛 ИНТЕРЬЕР МАСТЕРСКОЙ (15 СТОЛОВ)', {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    });
    this.listContainer.add(wbTitle);
    curY += 26;

    const workbenches = [
      { id: 'workbench_bg_1', title: 'Дубовый верстак ученика', price: 0 },
      { id: 'workbench_bg_3', title: 'Архив Древнего Египта', price: 320 },
      { id: 'workbench_bg_2', title: 'Мастерская Античности', price: 680 },
      { id: 'workbench_bg_4', title: 'Скрипторий Средневековья', price: 1350 },
      { id: 'workbench_bg_5', title: 'Келья алхимика', price: 1950 },
      { id: 'workbench_bg_12', title: 'Чайный домик Киото', price: 2800 },
      { id: 'workbench_bg_9', title: 'Сокровищница Ацтеков', price: 4600 },
      { id: 'workbench_bg_8', title: 'Лаборатория Викингов', price: 7500 },
      { id: 'workbench_bg_6', title: 'Кабинет Ренессанса', price: 11500 },
      { id: 'workbench_bg_7', title: 'Зал Императорского Лувра', price: 16000 },
      { id: 'workbench_bg_10', title: 'Обсерватория звездочёта', price: 22000 },
      { id: 'workbench_bg_11', title: 'Павильон Нефритового Дракона', price: 0, lootboxOnly: true },
      { id: 'workbench_bg_13', title: 'Храм Золотого Скарабея', price: 0, lootboxOnly: true },
      { id: 'workbench_bg_14', title: 'Королевская кузница', price: 0, lootboxOnly: true },
      { id: 'workbench_bg_15', title: 'Чертог Хранителя Вечности', price: 0, lootboxOnly: true }
    ];

    const ownedWorkbenches = Storage.getOwnedWorkbenchSkins();
    const activeWorkbench = Storage.getActiveWorkbenchSkin();

    this.preloadWorkbenchInBackground(activeWorkbench);
    ownedWorkbenches.forEach((wbId) => this.preloadWorkbenchInBackground(wbId));

    workbenches.forEach((wb) => {
      const cardH = 64;
      const cy = curY + cardH / 2;
      const owned = ownedWorkbenches.includes(wb.id);
      const isSelected = (activeWorkbench === wb.id);

      const cont = this.add.container(width / 2, cy);
      const gfx = this.add.graphics();
      gfx.fillGradientStyle(
        isSelected ? 0x3b2614 : 0x24180f,
        isSelected ? 0x3b2614 : 0x24180f,
        0x160f0a,
        0x160f0a,
        0.88
      );
      gfx.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);
      gfx.lineStyle(isSelected ? 1.8 : 1.1, isSelected ? 0xfacc15 : 0x8c6239, 0.9);
      gfx.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);

      const tTxt = this.add.text(-cardW / 2 + 14, 0, wb.title, {
        fontSize: '12.5px',
        fontFamily: FONT_UI,
        color: '#fdf6e3',
        fontStyle: 'bold',
        wordWrap: { width: cardW - 140 },
        resolution: textRes
      }).setOrigin(0, 0.5);

      const btnW = 104;
      const btnH = 30;
      const btnX = cardW / 2 - btnW / 2 - 12;

      const btnGfx = this.add.graphics();
      if (isSelected) {
        btnGfx.fillStyle(0x16a34a, 1);
        btnGfx.fillRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 7);
      } else if (owned) {
        btnGfx.fillStyle(0x332215, 1);
        btnGfx.fillRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 7);
        btnGfx.lineStyle(1, 0xc89d54, 0.9);
        btnGfx.strokeRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 7);
      } else if (wb.lootboxOnly) {
        btnGfx.fillStyle(0x3b1d54, 0.95);
        btnGfx.fillRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 7);
        btnGfx.lineStyle(1, 0xd8b4fe, 0.9);
        btnGfx.strokeRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 7);
      } else {
        btnGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
        btnGfx.fillRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 7);
      }

      const labelText = isSelected
        ? 'АКТИВЕН'
        : (owned ? 'ВЫБРАТЬ' : (wb.lootboxOnly ? 'В СУНДУКЕ' : `${wb.price} 🪙`));

      const btnTxt = this.add.text(btnX, 0, labelText, {
        fontSize: '11px',
        fontFamily: FONT_UI,
        color: isSelected ? '#ffffff' : (owned ? '#fdf6e3' : (wb.lootboxOnly ? '#e9d5ff' : '#1a1004')),
        fontStyle: 'bold',
        resolution: textRes
      }).setOrigin(0.5);

      const zone = this.add.zone(btnX, 0, btnW, btnH).setInteractive({ useHandCursor: !wb.lootboxOnly || owned });
      zone.on('pointerup', () => {
        if (this.isDraggingList || this.isModalOpen) return;
        if (owned) {
          Storage.setActiveWorkbenchSkin(wb.id);
          this.preloadWorkbenchInBackground(wb.id);
          if (AudioManager.playClick) AudioManager.playClick();
          this.renderShopItems();
        } else if (!wb.lootboxOnly && Storage.getCoins() >= wb.price) {
          Storage.addCoins(-wb.price);
          Storage.unlockWorkbenchSkin(wb.id);
          Storage.setActiveWorkbenchSkin(wb.id);
          this.preloadWorkbenchInBackground(wb.id);
          if (AudioManager.playCoin) AudioManager.playCoin();
          this.updateHeaderBalance();
          this.renderShopItems();
        } else if (AudioManager.playBreakSnap) {
          AudioManager.playBreakSnap();
        }
      });

      cont.add([gfx, tTxt, btnGfx, btnTxt, zone]);
      this.listContainer.add(cont);
      curY += cardH + 8;
    });

    this.minListY = Math.min(this.listTopY, this.listBottomY - (curY + 24));
  }

  openLootboxInteractive() {
    if (this.isModalOpen) return;
    this.isModalOpen = true;

    const { width, height } = this.scale;
    const textRes = this.textRes;
    const FONT_UI = this.FONT_UI;

    const rareWorkbenches = [
      { id: 'workbench_bg_11', name: 'Павильон Нефритового Дракона' },
      { id: 'workbench_bg_13', name: 'Храм Золотого Скарабея' },
      { id: 'workbench_bg_14', name: 'Королевская кузница' },
      { id: 'workbench_bg_15', name: 'Чертог Хранителя Вечности' }
    ];

    const owned = Storage.getOwnedWorkbenchSkins();
    const unownedRare = rareWorkbenches.filter((w) => !owned.includes(w.id));

    let pity = parseInt(localStorage.getItem(Storage.KEYS.TOOL_BOX_PITY) || '0', 10) + 1;
    let rewardType = 'coins';
    let rewardTitle = '';
    let rewardSubtitle = '';
    let rewardIcon = '🪙';
    let rewardColor = '#facc15';

    if (unownedRare.length > 0 && (pity >= 10 || Math.random() < 0.12)) {
      const won = unownedRare[Math.floor(Math.random() * unownedRare.length)];
      Storage.unlockWorkbenchSkin(won.id);
      Storage.setActiveWorkbenchSkin(won.id);
      this.preloadWorkbenchInBackground(won.id);
      pity = 0;
      rewardType = 'rare_workbench';
      rewardIcon = '🏛';
      rewardTitle = won.name;
      rewardSubtitle = 'ЭКСКЛЮЗИВНЫЙ ВЕРСТАК АКТИВИРОВАН!';
      rewardColor = '#e9d5ff';
    } else if (Math.random() < 0.42) {
      const lacquerGain = Math.random() < 0.35 ? 2 : 1;
      Storage.addKintsugiLacquer(lacquerGain);
      rewardType = 'lacquer';
      rewardIcon = '✨';
      rewardTitle = `Золотой лак Кинцуги ×${lacquerGain}`;
      rewardSubtitle = 'Используйте при склейке для +60% к цене!';
      rewardColor = '#fde047';
    } else {
      const coinGain = Phaser.Math.Between(15, 26) * 50;
      Storage.addCoins(coinGain);
      rewardType = 'coins';
      rewardIcon = '🪙';
      rewardTitle = `+${coinGain} монет в казну`;
      rewardSubtitle = 'Сокровища древней экспедиции';
      rewardColor = '#86efac';
    }

    localStorage.setItem(Storage.KEYS.TOOL_BOX_PITY, pity.toString());
    this.updateHeaderBalance();

    const modalItems = [];
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x060402, 0.92)
      .setDepth(120)
      .setInteractive();
    modalItems.push(overlay);

    const glowCircle = this.add.circle(width / 2, height * 0.43, 130, 0xfacc15, 0.14)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(121);
    modalItems.push(glowCircle);

    const topBanner = this.add.text(width / 2, height * 0.18, '🎁 СУНДУК ИСКАТЕЛЯ', {
      fontSize: '18px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      resolution: textRes
    }).setOrigin(0.5).setDepth(125);
    modalItems.push(topBanner);

    const chestSprite = this.add.image(width / 2, height * 0.43, 'lootbox_chest')
      .setScale(0.95)
      .setDepth(124);
    modalItems.push(chestSprite);

    const tapHint = this.add.text(width / 2, height * 0.62, '👆 НАЖМИТЕ НА СУНДУК, ЧТОБЫ СОРВАТЬ ПЕЧАТЬ', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      wordWrap: { width: width * 0.84 },
      align: 'center',
      resolution: textRes
    }).setOrigin(0.5).setDepth(125);
    modalItems.push(tapHint);

    this.tweens.add({
      targets: tapHint,
      alpha: 0.45,
      duration: 650,
      yoyo: true,
      repeat: -1
    });

    let tapStage = 0;

    const revealReward = () => {
      this.tweens.killTweensOf(tapHint);
      tapHint.setVisible(false);

      if (AudioManager.playShine) AudioManager.playShine();
      this.cameras.main.shake(160, 0.008);

      const burst = this.add.circle(width / 2, height * 0.43, 30, 0xfffbeb, 0.9)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(126);
      modalItems.push(burst);

      this.tweens.add({
        targets: burst,
        scale: 7,
        alpha: 0,
        duration: 450,
        ease: 'Quad.easeOut'
      });

      this.tweens.add({
        targets: chestSprite,
        y: height * 0.30,
        scale: 0.65,
        duration: 360,
        ease: 'Back.easeOut'
      });

      const cardCont = this.add.container(width / 2, height * 0.56).setDepth(128).setScale(0);
      modalItems.push(cardCont);

      const cardW = width * 0.84;
      const cardH = 190;
      const cardBg = this.add.graphics();
      cardBg.fillGradientStyle(0x2b1d12, 0x2b1d12, 0x160f0a, 0x160f0a, 0.98);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 14);
      cardBg.lineStyle(2, rewardType === 'rare_workbench' ? 0xd8b4fe : 0xfacc15, 0.95);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 14);

      const iconTxt = this.add.text(0, -52, rewardIcon, {
        fontSize: '36px',
        resolution: textRes
      }).setOrigin(0.5);

      const rTitle = this.add.text(0, -8, rewardTitle, {
        fontSize: '15.5px',
        fontFamily: FONT_UI,
        color: rewardColor,
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: cardW - 24 },
        resolution: textRes
      }).setOrigin(0.5);

      const rSub = this.add.text(0, 22, rewardSubtitle, {
        fontSize: '11.5px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        align: 'center',
        wordWrap: { width: cardW - 28 },
        resolution: textRes
      }).setOrigin(0.5);

      const okBtnW = cardW * 0.72;
      const okBtnH = 38;
      const okY = 62;
      const okGfx = this.add.graphics();
      okGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
      okGfx.fillRoundedRect(-okBtnW / 2, okY - okBtnH / 2, okBtnW, okBtnH, 10);
      okGfx.lineStyle(1, 0xfef08a, 0.95);
      okGfx.strokeRoundedRect(-okBtnW / 2, okY - okBtnH / 2, okBtnW, okBtnH, 10);

      const okTxt = this.add.text(0, okY, 'ЗАБРАТЬ НАГРАДУ', {
        fontSize: '12.5px',
        fontFamily: FONT_UI,
        color: '#1a1004',
        fontStyle: 'bold',
        resolution: textRes
      }).setOrigin(0.5);

      const okZone = this.add.zone(0, okY, okBtnW, okBtnH).setInteractive({ useHandCursor: true });

      cardCont.add([cardBg, iconTxt, rTitle, rSub, okGfx, okTxt, okZone]);

      this.tweens.add({
        targets: cardCont,
        scale: 1,
        duration: 360,
        delay: 140,
        ease: 'Back.easeOut'
      });

      okZone.on('pointerup', () => {
        if (AudioManager.playClick) AudioManager.playClick();
        modalItems.forEach((m) => {
          if (m && m.destroy) m.destroy();
        });
        this.time.delayedCall(120, () => {
          this.isModalOpen = false;
          this.renderShopItems();
        });
      });
    };

    overlay.on('pointerdown', () => {
      if (tapStage >= 2) return;
      tapStage++;

      if (tapStage === 1) {
        if (AudioManager.playClick) AudioManager.playClick();
        tapHint.setText('👆 ЕЩЁ ОДИН ТАП, ЧТОБЫ ОТКРЫТЬ!');
        this.tweens.add({
          targets: chestSprite,
          angle: { from: -7, to: 7 },
          scale: 1.08,
          duration: 75,
          yoyo: true,
          repeat: 2,
          onComplete: () => chestSprite.setAngle(0)
        });
      } else if (tapStage === 2) {
        revealReward();
      }
    });
  }
}
