import { TutorialManager } from '../utils/TutorialManager.js';
import { REGIONS, ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { YandexSDK } from '../utils/YandexSDK.js';

export class EraSelectScene extends Phaser.Scene {
  constructor() {
    super('EraSelectScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const textRes = 3;
    this.textRes = textRes;

    const FONT_TITLE = '"Cormorant Garamond", Georgia, serif';
    const FONT_UI = '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.FONT_UI = FONT_UI;

    if (this.textures.exists('expedition_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'expedition_bg').setDepth(0);
      bg.setScale(Math.max(width / bg.width, height / bg.height));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0906, 0.25).setDepth(0);
    } else {
      const bg = this.add.graphics().setDepth(0);
      bg.fillGradientStyle(0x21160d, 0x21160d, 0x0d0805, 0x0d0805, 1);
      bg.fillRect(0, 0, width, height);
    }

    const levelData = Storage.getLevelData();

    this.eras = REGIONS.map((region) => {
      const req = Storage.REGION_UNLOCK_REQS[region.id] || { minLevel: 1, cost: 0, expeditionCost: 100 };
      const isUnlocked = Storage.isRegionUnlocked(region.id);
      return {
        ...region,
        unlocked: isUnlocked,
        levelReached: levelData.level >= req.minLevel,
        requiredLevel: req.minLevel,
        unlockCost: req.cost,
        cost: req.expeditionCost || 100
      };
    });

    this.selectedEraIndex = 0;
    if (data && data.regionId) {
      const foundIdx = this.eras.findIndex((e) => e.id === data.regionId);
      if (foundIdx >= 0) this.selectedEraIndex = foundIdx;
    }

    if (this.eras[this.selectedEraIndex] && AudioManager.playEraMusic) {
      AudioManager.playEraMusic(this.eras[this.selectedEraIndex].id);
    }

    // Верхняя шапка (depth 18 перекрывает прокручиваемый список depth 5)
    const headerBg = this.add.graphics().setDepth(18);
    headerBg.fillGradientStyle(0x24180f, 0x24180f, 0x140d08, 0x140d08, 0.96);
    headerBg.fillRect(0, 0, width, 128);
    headerBg.lineStyle(1.5, 0xc89d54, 0.65);
    headerBg.lineBetween(0, 128, width, 128);

    this.add.text(width / 2, 20, '🧭 КАРТА ЭКСПЕДИЦИЙ', {
      fontSize: '19px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      resolution: textRes
    }).setOrigin(0.5).setDepth(20);

    this.subInfoText = this.add.text(width / 2, 44, '', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5).setDepth(20);

    // Полоска энергии + кнопка полевого пайка (+15 ⚡ за рекламу)
    this.energyText = this.add.text(16, 66, '', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#38bdf8',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0, 0.5).setDepth(20);

    const rationBtnW = 114;
    const rationBtnH = 22;
    const rationBtnX = width - 16 - rationBtnW / 2;
    const rationBtnY = 66;

    const rationGfx = this.add.graphics().setDepth(20);
    rationGfx.fillStyle(0x1e3a8a, 0.96);
    rationGfx.fillRoundedRect(rationBtnX - rationBtnW / 2, rationBtnY - rationBtnH / 2, rationBtnW, rationBtnH, 6);
    rationGfx.lineStyle(1, 0x38bdf8, 0.95);
    rationGfx.strokeRoundedRect(rationBtnX - rationBtnW / 2, rationBtnY - rationBtnH / 2, rationBtnW, rationBtnH, 6);

    this.add.text(rationBtnX, rationBtnY, '🎬 ПАЁК +15 ⚡', {
      fontSize: '10px',
      fontFamily: FONT_UI,
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5).setDepth(21);

    const rationZone = this.add.zone(rationBtnX, rationBtnY, rationBtnW, rationBtnH)
      .setInteractive({ useHandCursor: true })
      .setDepth(22);

    rationZone.on('pointerdown', () => {
      YandexSDK.showRewarded(() => {
        Storage.addEnergy(15);
        if (AudioManager.playCoin) AudioManager.playCoin();
        this.updateHeader();
      });
    });

    // Кнопка сброса в правом верхнем углу
    const resetGfx = this.add.graphics().setDepth(24);
    resetGfx.fillStyle(0x2b1512, 0.9);
    resetGfx.fillRoundedRect(width - 46, 12, 30, 30, 8);
    resetGfx.lineStyle(1.2, 0xf87171, 0.85);
    resetGfx.strokeRoundedRect(width - 46, 12, 30, 30, 8);

    const resetBtn = this.add.zone(width - 31, 27, 30, 30)
      .setInteractive({ useHandCursor: true })
      .setDepth(26);

    this.add.text(width - 31, 27, '🗑', {
      fontSize: '13px',
      resolution: textRes
    }).setOrigin(0.5).setDepth(25);

    resetBtn.on('pointerdown', () => this.showResetModal());

    this.createScrollableTabs(width, 102);

    this.listTopY = 134;
    this.listBottomY = height - 68;
    this.listHeight = this.listBottomY - this.listTopY;

    this.listContainer = this.add.container(0, this.listTopY).setDepth(5);

    this.setupScrollHandlers();
    this.renderArtifactsList();
    this.time.delayedCall(350, () => {
      if (!this.scene || !this.scene.isActive()) return;
      TutorialManager.startTour(this, 'expedition_map', [
        {
          badge: 'ЭНЕРГИЯ ЭКСПЕДИЦИЙ',
          rect: { x: 10, y: 52, w: width - 20, h: 28 },
          title: '⚡ Запас сил и Полевой паёк',
          body: 'Каждый выезд тратит 10 ⚡ энергии. Она восстанавливается сама по +1 ⚡ каждые 2 минуты (даже офлайн), а её лимит растёт при прокачке Полевого лагеря.'
        },
        {
          badge: 'РУЧНОЙ ПОИСК И АВТО-СБОР',
          rect: { x: width * 0.04, y: this.listTopY + 6, w: width * 0.92, h: 148 },
          title: '⛏ Раскопки vs ⚡ Авто-сбор',
          body: 'Авто-экспедиция возит ТОЛЬКО те артефакты эпохи, которые вы уже лично откопали руками! Прокачка полевого снаряжения увеличивает количество и редкость авто-добычи.'
        }
      ]);
    });

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.updateHeader()
    });

    // Нижняя панель с кнопкой возврата
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
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });
  }

  updateHeader() {
    if (!this.subInfoText || !this.subInfoText.active) return;
    const levelData = Storage.getLevelData();
    const coins = Storage.getCoins();
    const en = Storage.syncEnergy();

    this.subInfoText.setText(`Ур. ${levelData.level} (${levelData.title})  |  Казна: ${coins} 🪙`);

    if (en.current >= en.max) {
      this.energyText.setText(`⚡ Энергия: ${en.current}/${en.max} (МАКС.)`);
    } else {
      const secTotal = Math.ceil(en.nextInMs / 1000);
      const mm = Math.floor(secTotal / 60);
      const ss = String(secTotal % 60).padStart(2, '0');
      this.energyText.setText(`⚡ Энергия: ${en.current}/${en.max} (+1 через ${mm}:${ss})`);
    }
  }

  createScrollableTabs(width, y) {
    if (this.tabsScrollContainer) this.tabsScrollContainer.destroy();

    this.tabsScrollContainer = this.add.container(0, y).setDepth(20);

    const tabWidth = 104;
    const tabHeight = 30;
    const spacing = 8;
    const startX = 16;

    const shortNames = {
      egypt: 'Египет',
      antique: 'Античность',
      europe: 'Европа',
      japan: 'Япония',
      aztec: 'Ацтеки',
      vikings: 'Викинги',
      renaissance: 'Ренессанс'
    };

    this.tabButtons = [];
    const totalTabsWidth = startX + this.eras.length * (tabWidth + spacing);
    this.minTabsScrollX = Math.min(0, width - totalTabsWidth - 16);
    this.isDraggingTabs = false;

    this.eras.forEach((era, i) => {
      const tabX = startX + i * (tabWidth + spacing) + tabWidth / 2;
      const isSelected = (i === this.selectedEraIndex);

      const gfx = this.add.graphics();
      const drawTab = (selected) => {
        gfx.clear();
        gfx.fillStyle(selected ? 0xd99b26 : 0x24180f, selected ? 0.96 : 0.82);
        gfx.fillRoundedRect(tabX - tabWidth / 2, -tabHeight / 2, tabWidth, tabHeight, 8);
        gfx.lineStyle(selected ? 1.5 : 1, selected ? 0xfef08a : 0x8c6239, 0.9);
        gfx.strokeRoundedRect(tabX - tabWidth / 2, -tabHeight / 2, tabWidth, tabHeight, 8);
      };
      drawTab(isSelected);

      const zone = this.add.zone(tabX, 0, tabWidth, tabHeight)
        .setInteractive({ useHandCursor: true });

      const labelStr = era.unlocked
        ? (shortNames[era.id] || era.name)
        : (era.levelReached ? `🔑 ${shortNames[era.id]}` : `🔒 Ур.${era.requiredLevel}`);

      const txt = this.add.text(tabX, 0, labelStr, {
        fontSize: '11.5px',
        fontFamily: this.FONT_UI,
        color: isSelected ? '#1a1004' : (era.unlocked ? '#fdf6e3' : (era.levelReached ? '#facc15' : '#9c8265')),
        fontStyle: 'bold',
        resolution: this.textRes
      }).setOrigin(0.5);

      zone.on('pointerup', () => {
        if (!this.isDraggingTabs) {
          if (AudioManager.playClick) AudioManager.playClick();
          this.selectedEraIndex = i;
          this.updateTabsVisual();
          this.renderArtifactsList();

          if (era.unlocked && AudioManager.playEraMusic) {
            AudioManager.playEraMusic(era.id);
          }
        }
      });

      this.tabsScrollContainer.add([gfx, txt, zone]);
      this.tabButtons.push({ drawTab, txt, era, index: i, shortNames });
    });
  }

  updateTabsVisual() {
    this.tabButtons.forEach((item) => {
      const isSelected = (item.index === this.selectedEraIndex);
      item.drawTab(isSelected);
      item.txt.setColor(isSelected ? '#1a1004' : (item.era.unlocked ? '#fdf6e3' : (item.era.levelReached ? '#facc15' : '#9c8265')));
    });
  }

  setupScrollHandlers() {
    let startY = 0;
    let containerStartY = 0;
    let listPointerActive = false;

    let tabStartX = 0;
    let tabsContainerStartX = 0;
    let tabsPointerActive = false;

    this.isDraggingList = false;
    this.isDraggingTabs = false;

    this.input.on('pointerdown', (p) => {
      if (p.y >= 82 && p.y <= 126) {
        tabsPointerActive = true;
        tabStartX = p.x;
        tabsContainerStartX = this.tabsScrollContainer ? this.tabsScrollContainer.x : 0;
        this.isDraggingTabs = false;
      } else if (p.y >= this.listTopY && p.y <= this.listBottomY) {
        listPointerActive = true;
        startY = p.y;
        containerStartY = this.listContainer.y;
        this.isDraggingList = false;
      }
    });

    this.input.on('pointermove', (p) => {
      if (tabsPointerActive && this.tabsScrollContainer) {
        const dx = p.x - tabStartX;
        if (Math.abs(dx) > 6) {
          this.isDraggingTabs = true;
        }
        if (this.isDraggingTabs) {
          const minX = this.minTabsScrollX !== undefined ? this.minTabsScrollX : 0;
          this.tabsScrollContainer.x = Phaser.Math.Clamp(tabsContainerStartX + dx, minX, 0);
        }
      }

      if (listPointerActive) {
        const dy = p.y - startY;
        if (Math.abs(dy) > 6) {
          this.isDraggingList = true;
        }
        if (this.isDraggingList) {
          const minScroll = this.minListY !== undefined ? this.minListY : this.listTopY;
          this.listContainer.y = Phaser.Math.Clamp(containerStartY + dy, minScroll, this.listTopY);
        }
      }
    });

    this.input.on('pointerup', () => {
      listPointerActive = false;
      tabsPointerActive = false;
    });

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      if (pointer.y >= 82 && pointer.y <= 126 && this.tabsScrollContainer) {
        const minX = this.minTabsScrollX !== undefined ? this.minTabsScrollX : 0;
        const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
        this.tabsScrollContainer.x = Phaser.Math.Clamp(this.tabsScrollContainer.x - delta * 0.45, minX, 0);
      } else if (pointer.y >= this.listTopY && pointer.y <= this.listBottomY) {
        const minScroll = this.minListY !== undefined ? this.minListY : this.listTopY;
        this.listContainer.y = Phaser.Math.Clamp(this.listContainer.y - deltaY * 0.45, minScroll, this.listTopY);
      }
    });
  }

  renderArtifactsList() {
    this.listContainer.removeAll(true);
    this.listContainer.y = this.listTopY;

    const { width } = this.scale;
    const textRes = this.textRes;
    const FONT_UI = this.FONT_UI;
    const currentEra = this.eras[this.selectedEraIndex];
    this.updateHeader();

    if (!currentEra.unlocked) {
      this.minListY = this.listTopY;
      const boxW = width * 0.90;
      const boxH = 190;

      const lockGfx = this.add.graphics();
      lockGfx.fillGradientStyle(0x261a10, 0x261a10, 0x160f0a, 0x160f0a, 0.85);
      lockGfx.fillRoundedRect(width / 2 - boxW / 2, 125 - boxH / 2, boxW, boxH, 14);
      lockGfx.lineStyle(1.5, currentEra.levelReached ? 0xfacc15 : 0xf87171, 0.85);
      lockGfx.strokeRoundedRect(width / 2 - boxW / 2, 125 - boxH / 2, boxW, boxH, 14);

      const lockTxt = this.add.text(
        width / 2,
        66,
        currentEra.levelReached ? '🔑 ЭПОХА ГОТОВА К ОТКРЫТИЮ' : '🔒 ЭПОХА ЗАБЛОКИРОВАНА',
        {
          fontSize: '14.5px',
          fontFamily: FONT_UI,
          color: currentEra.levelReached ? '#facc15' : '#fda4af',
          fontStyle: 'bold',
          resolution: textRes
        }
      ).setOrigin(0.5);

      const reqStr = currentEra.levelReached
        ? `Требуется лицензия гильдии для региона «${currentEra.name}».\nСтоимость открытия: ${currentEra.unlockCost} 🪙`
        : `Требуется ${currentEra.requiredLevel}-й уровень мастера.\nПовышайте ранг, реставрируя доступные реликвии!`;

      const reqTxt = this.add.text(width / 2, 114, reqStr, {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: boxW - 28 },
        resolution: textRes
      }).setOrigin(0.5);

      this.listContainer.add([lockGfx, lockTxt, reqTxt]);

      if (currentEra.levelReached) {
        const unlockBtnW = 216;
        const unlockBtnH = 40;
        const unlockGfx = this.add.graphics();
        unlockGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
        unlockGfx.fillRoundedRect(width / 2 - unlockBtnW / 2, 174 - unlockBtnH / 2, unlockBtnW, unlockBtnH, 10);
        unlockGfx.lineStyle(1.2, 0xfef08a, 0.95);
        unlockGfx.strokeRoundedRect(width / 2 - unlockBtnW / 2, 174 - unlockBtnH / 2, unlockBtnW, unlockBtnH, 10);

        const unlockZone = this.add.zone(width / 2, 174, unlockBtnW, unlockBtnH).setInteractive({ useHandCursor: true });
        const unlockLabel = this.add.text(width / 2, 174, `ОТКРЫТЬ ЗА ${currentEra.unlockCost} 🪙`, {
          fontSize: '13px',
          fontFamily: FONT_UI,
          color: '#1a1004',
          fontStyle: 'bold',
          resolution: textRes
        }).setOrigin(0.5);

        unlockZone.on('pointerup', () => {
          if (this.isDraggingList) return;
          if (Storage.unlockRegion(currentEra.id)) {
            if (AudioManager.playShine) AudioManager.playShine();
            currentEra.unlocked = true;
            this.createScrollableTabs(width, 102);
            this.renderArtifactsList();
          } else if (AudioManager.playBreakSnap) {
            AudioManager.playBreakSnap();
          }
        });

        this.listContainer.add([unlockGfx, unlockZone, unlockLabel]);
      }
      return;
    }

    // 1. ПАНЕЛЬ ПОЛЕВЫХ РАБОТ: РУЧНЫЕ РАСКОПКИ vs АВТО-ЭКСПЕДИЦИЯ
    const expW = width * 0.92;
    const expH = 148;
    const expY = 80;
    const expeditionBox = this.add.container(width / 2, expY);

    const expGfx = this.add.graphics();
    expGfx.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.84);
    expGfx.fillRoundedRect(-expW / 2, -expH / 2, expW, expH, 12);
    expGfx.lineStyle(1.5, 0xc89d54, 0.88);
    expGfx.strokeRoundedRect(-expW / 2, -expH / 2, expW, expH, 12);

    const discoveredList = Storage.getDiscoveredInRegion(currentEra.id);
    const eraArtifacts = ARTIFACT_TEMPLATES.filter((a) => a.regionId === currentEra.id);
    const autoUnlocked = discoveredList.length > 0;
    const gear = Storage.getExpeditionGearBonuses();

    const expTitle = this.add.text(-expW / 2 + 14, -54, `🧭 РАЗВЕДКА ЭПОХИ (${discoveredList.length}/${eraArtifacts.length} ОТКРЫТО)`, {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0, 0.5);

    const expDesc = this.add.text(
      -expW / 2 + 14,
      -28,
      'Раскопайте находку вручную, чтобы разведгруппа могла привозить её автоматически.',
      {
        fontSize: '10.5px',
        fontFamily: FONT_UI,
        color: '#e6d5bc',
        wordWrap: { width: expW - 28 },
        resolution: textRes
      }
    ).setOrigin(0, 0.5);

    // Кнопка А: РУЧНЫЕ РАСКОПКИ (10 ⚡ + 50% стоимости)
    const manualCost = Storage.getManualDigCost(currentEra.id);
    const halfBtnW = (expW - 36) / 2;
    const digBtnX = -expW / 2 + 14 + halfBtnW / 2;
    const row1Y = 12;

    const digGfx = this.add.graphics();
    digGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
    digGfx.fillRoundedRect(digBtnX - halfBtnW / 2, row1Y - 19, halfBtnW, 38, 8);
    digGfx.lineStyle(1, 0xfef08a, 0.95);
    digGfx.strokeRoundedRect(digBtnX - halfBtnW / 2, row1Y - 19, halfBtnW, 38, 8);

    const digTxt = this.add.text(digBtnX, row1Y, `⛏ РАСКОПАТЬ\n${manualCost.energy}⚡ + ${manualCost.coins}🪙`, {
      fontSize: '10.5px',
      fontFamily: FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      align: 'center',
      resolution: textRes
    }).setOrigin(0.5);

    const digZone = this.add.zone(digBtnX, row1Y, halfBtnW, 38).setInteractive({ useHandCursor: true });
    digZone.on('pointerup', () => {
      if (this.isDraggingList) return;
      if (Storage.getEnergy() < manualCost.energy) {
        this.showToast('Недостаточно энергии ⚡! Возьмите полевой паёк сверху.');
        if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
        return;
      }
      if (Storage.getCoins() < manualCost.coins) {
        this.showToast(`Нужно ${manualCost.coins} 🪙 на снаряжение раскопа!`);
        if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
        return;
      }
      Storage.spendEnergy(manualCost.energy);
      Storage.addCoins(-manualCost.coins);
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('DigScene', { regionId: currentEra.id });
    });

    // Кнопка Б: АВТО-ЭКСПЕДИЦИЯ (возит только разведанные артефакты)
    const autoCost = Storage.getAutoExpeditionCost(currentEra.id);
    const autoBtnX = expW / 2 - 14 - halfBtnW / 2;

    const autoGfx = this.add.graphics();
    if (autoUnlocked) {
      autoGfx.fillGradientStyle(0x15803d, 0x15803d, 0x14532d, 0x14532d, 1);
      autoGfx.fillRoundedRect(autoBtnX - halfBtnW / 2, row1Y - 19, halfBtnW, 38, 8);
      autoGfx.lineStyle(1, 0x4ade80, 0.95);
      autoGfx.strokeRoundedRect(autoBtnX - halfBtnW / 2, row1Y - 19, halfBtnW, 38, 8);
    } else {
      autoGfx.fillStyle(0x1f1712, 0.95);
      autoGfx.fillRoundedRect(autoBtnX - halfBtnW / 2, row1Y - 19, halfBtnW, 38, 8);
      autoGfx.lineStyle(1, 0x5c4330, 0.85);
      autoGfx.strokeRoundedRect(autoBtnX - halfBtnW / 2, row1Y - 19, halfBtnW, 38, 8);
    }

    const autoLabel = autoUnlocked
      ? `⚡ АВТО-СБОР (~${gear.autoItemCount} шт)\n${autoCost.energy}⚡ + ${autoCost.coins}🪙`
      : '🔒 АВТО-СБОР\nСначала откопайте 1 шт.';

    const autoTxt = this.add.text(autoBtnX, row1Y, autoLabel, {
      fontSize: '10px',
      fontFamily: FONT_UI,
      color: autoUnlocked ? '#ffffff' : '#9c8265',
      fontStyle: 'bold',
      align: 'center',
      resolution: textRes
    }).setOrigin(0.5);

    const autoZone = this.add.zone(autoBtnX, row1Y, halfBtnW, 38).setInteractive({ useHandCursor: autoUnlocked });
    autoZone.on('pointerup', () => {
      if (this.isDraggingList) return;
      if (!autoUnlocked) {
        this.showToast('Сначала проведите ручные раскопки в этой эпохе!');
        if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
        return;
      }
      const res = Storage.runAutoExpedition(currentEra.id, ARTIFACT_TEMPLATES, false);
      if (!res.ok) {
        if (res.reason === 'no_energy') this.showToast('Недостаточно энергии ⚡!');
        else if (res.reason === 'no_coins') this.showToast(`Нужно ${autoCost.coins} 🪙 для авто-экспедиции!`);
        if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
        return;
      }
      if (AudioManager.playCoin) AudioManager.playCoin();
      let msg = `Разведгруппа доставила ${res.totalFinds} наход. на склад!`;
      if (res.bonusLacquer > 0) msg += ' +1 ✨ Лак Кинцуги!';
      this.showToast(msg);
      this.renderArtifactsList();
    });

    // Нижняя строка: Бесплатный выезд за рекламу (если есть разведанные — авто-сбор, иначе вход в раскопки)
    const adBarY = 51;
    const adBarW = expW - 28;
    const adGfx = this.add.graphics();
    adGfx.fillStyle(0x1e3a8a, 0.96);
    adGfx.fillRoundedRect(-adBarW / 2, adBarY - 13, adBarW, 26, 7);
    adGfx.lineStyle(1, 0x38bdf8, 0.9);
    adGfx.strokeRoundedRect(-adBarW / 2, adBarY - 13, adBarW, 26, 7);

    const adLabelStr = autoUnlocked
      ? '🎬 БЕСПЛАТНЫЙ АВТО-РЕЙС РАЗВЕДГРУППЫ (БЕЗ ЗАТРАТ ⚡ И 🪙)'
      : '🎬 БЕСПЛАТНЫЙ ВЫЕЗД НА РАСКОПКИ (БЕЗ ЗАТРАТ ⚡ И 🪙)';

    const adTxt = this.add.text(0, adBarY, adLabelStr, {
      fontSize: '9.5px',
      fontFamily: FONT_UI,
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    const adZone = this.add.zone(0, adBarY, adBarW, 26).setInteractive({ useHandCursor: true });
    adZone.on('pointerup', () => {
      if (this.isDraggingList) return;
      YandexSDK.showRewarded(() => {
        if (autoUnlocked) {
          const res = Storage.runAutoExpedition(currentEra.id, ARTIFACT_TEMPLATES, true);
          if (res.ok) {
            if (AudioManager.playCoin) AudioManager.playCoin();
            this.showToast(`Бесплатный рейс доставил ${res.totalFinds} наход.!`);
            this.renderArtifactsList();
          }
        } else {
          this.scene.start('DigScene', { regionId: currentEra.id });
        }
      });
    });

    expeditionBox.add([
      expGfx, expTitle, expDesc,
      digGfx, digTxt, digZone,
      autoGfx, autoTxt, autoZone,
      adGfx, adTxt, adZone
    ]);
    this.listContainer.add(expeditionBox);

    // 2. СПИСОК АРТЕФАКТОВ ЭПОХИ (СО СТАТУСОМ РАЗВЕДКИ И СКЛАДА)
    const stocks = Storage.getRegionStock(currentEra.id, ARTIFACT_TEMPLATES);

    const cardH = 98;
    const spacing = 10;
    const cardW = width * 0.92;
    const listOffsetY = 166;

    let touchDownTime = 0;

    eraArtifacts.forEach((art, index) => {
      const cardY = listOffsetY + index * (cardH + spacing) + cardH / 2;
      const countLeft = stocks[art.id] !== undefined ? stocks[art.id] : 0;
      const hasStock = countLeft > 0;
      const isDiscovered = discoveredList.includes(art.id);

      const cardCont = this.add.container(width / 2, cardY);

      const cardGfx = this.add.graphics();
      cardGfx.fillGradientStyle(
        hasStock ? 0x261a10 : 0x160f0a,
        hasStock ? 0x261a10 : 0x160f0a,
        hasStock ? 0x170f09 : 0x110b07,
        hasStock ? 0x170f09 : 0x110b07,
        hasStock ? 0.78 : 0.55
      );
      cardGfx.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
      cardGfx.lineStyle(1.3, hasStock ? 0xc89d54 : (isDiscovered ? 0x785532 : 0x45301f), hasStock ? 0.88 : 0.55);
      cardGfx.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);

      cardGfx.fillStyle(0x0d0805, 0.5);
      cardGfx.fillRoundedRect(-cardW / 2 + 10, -34, 68, 68, 10);

      const texKey = this.textures.exists(art.textureKey) ? art.textureKey : 'art_egypt_scarab';
      const icon = this.add.image(-cardW / 2 + 44, 0, texKey)
        .setDisplaySize(50, 62)
        .setAlpha(hasStock ? 1 : (isDiscovered ? 0.6 : 0.32));

      const title = this.add.text(-cardW / 2 + 88, -28, art.name, {
        fontSize: '13.5px',
        fontFamily: FONT_UI,
        color: hasStock ? '#fdf6e3' : (isDiscovered ? '#d6c3a5' : '#8c735b'),
        fontStyle: 'bold',
        wordWrap: { width: cardW - 155 },
        resolution: textRes
      });

      const discoveryTag = isDiscovered ? '🔍 Разведан (доступен авто-сбору)' : '❓ Не найден (нужны раскопки)';
      const discoveryTxt = this.add.text(-cardW / 2 + 88, -7, discoveryTag, {
        fontSize: '10px',
        fontFamily: FONT_UI,
        color: isDiscovered ? '#38bdf8' : '#e2b866',
        resolution: textRes
      });

      const stockBadgeColor = hasStock ? '#86efac' : '#9c8265';
      const stockBadgeText = hasStock
        ? `📦 На складе: ${countLeft} шт.  •  ⚒ Взять на верстак ›`
        : '📦 На складе: 0 шт.';

      const stockBadge = this.add.text(-cardW / 2 + 88, 17, stockBadgeText, {
        fontSize: '11px',
        fontFamily: FONT_UI,
        color: stockBadgeColor,
        fontStyle: 'bold',
        resolution: textRes
      });

      const valueBadge = this.add.text(cardW / 2 - 14, -24, `${art.marketValue || 100} 🪙`, {
        fontSize: '12.5px',
        fontFamily: FONT_UI,
        color: hasStock ? '#facc15' : '#7a6552',
        fontStyle: 'bold',
        resolution: textRes
      }).setOrigin(1, 0);

      const hitZone = this.add.zone(0, 0, cardW, cardH)
        .setInteractive({ useHandCursor: hasStock });

      hitZone.on('pointerdown', () => {
        touchDownTime = this.time.now;
      });

      hitZone.on('pointerup', () => {
        const elapsed = this.time.now - touchDownTime;
        if (!this.isDraggingList && elapsed < 500 && hasStock) {
          Storage.setActiveSession(currentEra.id, art.id);
          if (AudioManager.playClick) AudioManager.playClick();
          this.scene.start('RestoreScene', {
            regionId: currentEra.id,
            templateId: art.id
          });
        }
      });

      cardCont.add([cardGfx, icon, title, discoveryTxt, stockBadge, valueBadge, hitZone]);
      this.listContainer.add(cardCont);
    });

    const totalContentHeight = listOffsetY + eraArtifacts.length * (cardH + spacing) + 30;
    this.minListY = Math.min(this.listTopY, this.listBottomY - totalContentHeight);
  }

  showToast(message) {
    const { width, height } = this.scale;
    const toast = this.add.container(width / 2, height - 96).setDepth(90).setAlpha(0);

    const w = width * 0.88;
    const h = 38;
    const bg = this.add.graphics();
    bg.fillStyle(0x140d08, 0.96);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    bg.lineStyle(1.4, 0xfacc15, 0.95);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);

    const txt = this.add.text(0, 0, message, {
      fontSize: '11px',
      fontFamily: this.FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: w - 20 },
      resolution: this.textRes
    }).setOrigin(0.5);

    toast.add([bg, txt]);

    this.tweens.add({
      targets: toast,
      alpha: 1,
      y: height - 104,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.time.delayedCall(1900, () => {
          this.tweens.add({
            targets: toast,
            alpha: 0,
            duration: 250,
            onComplete: () => toast.destroy()
          });
        });
      }
    });
  }

  showResetModal() {
    const { width, height } = this.scale;
    const textRes = this.textRes;
    const FONT_UI = this.FONT_UI;

    const modalCont = this.add.container(0, 0).setDepth(100);

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x080503, 0.85)
      .setInteractive();

    const boxW = width * 0.84;
    const boxH = 210;

    const boxGfx = this.add.graphics();
    boxGfx.fillGradientStyle(0x24180f, 0x24180f, 0x160f0a, 0x160f0a, 0.98);
    boxGfx.fillRoundedRect(width / 2 - boxW / 2, height / 2 - boxH / 2, boxW, boxH, 14);
    boxGfx.lineStyle(1.5, 0xf87171, 0.9);
    boxGfx.strokeRoundedRect(width / 2 - boxW / 2, height / 2 - boxH / 2, boxW, boxH, 14);

    const title = this.add.text(width / 2, height / 2 - 68, '⚠️ СБРОС ПРОГРЕССА', {
      fontSize: '15px',
      fontFamily: FONT_UI,
      color: '#fda4af',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    const msg = this.add.text(
      width / 2,
      height / 2 - 14,
      'Все отреставрированные артефакты,\nмонеты, открытые эпохи и улучшения\nбудут удалены безвозвратно.',
      {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#f5e6c8',
        align: 'center',
        lineSpacing: 4,
        resolution: textRes
      }
    ).setOrigin(0.5);

    const confirmGfx = this.add.graphics();
    confirmGfx.fillStyle(0xb91c1c, 1);
    confirmGfx.fillRoundedRect(width / 2 - 64 - 55, height / 2 + 56 - 18, 110, 36, 9);
    confirmGfx.lineStyle(1, 0xfca5a5, 0.9);
    confirmGfx.strokeRoundedRect(width / 2 - 64 - 55, height / 2 + 56 - 18, 110, 36, 9);

    const confirmZone = this.add.zone(width / 2 - 64, height / 2 + 56, 110, 36)
      .setInteractive({ useHandCursor: true });

    const confirmTxt = this.add.text(width / 2 - 64, height / 2 + 56, 'СБРОСИТЬ', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    confirmZone.on('pointerdown', () => {
      localStorage.clear();
      window.location.reload();
    });

    const cancelGfx = this.add.graphics();
    cancelGfx.fillStyle(0x332215, 1);
    cancelGfx.fillRoundedRect(width / 2 + 64 - 55, height / 2 + 56 - 18, 110, 36, 9);
    cancelGfx.lineStyle(1, 0xc89d54, 0.9);
    cancelGfx.strokeRoundedRect(width / 2 + 64 - 55, height / 2 + 56 - 18, 110, 36, 9);

    const cancelZone = this.add.zone(width / 2 + 64, height / 2 + 56, 110, 36)
      .setInteractive({ useHandCursor: true });

    const cancelTxt = this.add.text(width / 2 + 64, height / 2 + 56, 'ОТМЕНА', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: textRes
    }).setOrigin(0.5);

    cancelZone.on('pointerdown', () => {
      modalCont.destroy();
    });

    modalCont.add([
      overlay,
      boxGfx,
      title,
      msg,
      confirmGfx,
      confirmTxt,
      confirmZone,
      cancelGfx,
      cancelTxt,
      cancelZone
    ]);
  }
}
