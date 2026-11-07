import { TOOL_SHOP_ITEMS, WORKSHOP_UPGRADES } from '../data/tools.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create() {
    const { width, height } = this.scale;
    this.currentTab = 'tools'; // 'tools' или 'workshop'

    this.add.image(width / 2, height / 2, 'bg_workshop').setDepth(0);

    // Шапка
    this.add.text(width / 2, 38, 'МАСТЕРСКАЯ И ЛАВКА', {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#d4af37',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(2);

    // Баланс и уровень
    this.statusText = this.add.text(width / 2, 65, '', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    this.updateStatusHeader();

    // Табы выбора
    this.createTabs();

    // Контейнер списка
    this.itemsContainer = this.add.container(0, 0).setDepth(3);
    this.renderContent();

    // Назад
    const backBtn = this.add.rectangle(width / 2, height - 42, 220, 44, 0x34495e)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.add.text(width / 2, height - 42, 'В главное меню', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  updateStatusHeader() {
    const coins = Storage.getCoins();
    const lvl = Storage.getMasterLevel();
    const xpPct = Math.floor(Storage.getXPProgress() * 100);
    this.statusText.setText(`Уровень: ${lvl} (${xpPct}% XP)  |  Золото: ${coins}`);
  }

  createTabs() {
    const { width } = this.scale;
    const tabY = 95;

    this.toolsTabBtn = this.add.rectangle(width * 0.3, tabY, 130, 32, this.currentTab === 'tools' ? 0xd4af37 : 0x221d19)
      .setInteractive({ useHandCursor: true }).setDepth(4);
    this.toolsTabText = this.add.text(width * 0.3, tabY, 'ИНСТРУМЕНТЫ', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: this.currentTab === 'tools' ? '#141210' : '#bdc3c7',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);

    this.workshopTabBtn = this.add.rectangle(width * 0.7, tabY, 130, 32, this.currentTab === 'workshop' ? 0xd4af37 : 0x221d19)
      .setInteractive({ useHandCursor: true }).setDepth(4);
    this.workshopTabText = this.add.text(width * 0.7, tabY, 'ИНТЕРЬЕР', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: this.currentTab === 'workshop' ? '#141210' : '#bdc3c7',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);

    this.toolsTabBtn.on('pointerdown', () => {
      this.currentTab = 'tools';
      this.updateTabStyles();
      this.renderContent();
    });

    this.workshopTabBtn.on('pointerdown', () => {
      this.currentTab = 'workshop';
      this.updateTabStyles();
      this.renderContent();
    });
  }

  updateTabStyles() {
    this.toolsTabBtn.setFillStyle(this.currentTab === 'tools' ? 0xd4af37 : 0x221d19);
    this.toolsTabText.setColor(this.currentTab === 'tools' ? '#141210' : '#bdc3c7');
    this.workshopTabBtn.setFillStyle(this.currentTab === 'workshop' ? 0xd4af37 : 0x221d19);
    this.workshopTabText.setColor(this.currentTab === 'workshop' ? '#141210' : '#bdc3c7');
  }

  renderContent() {
    this.itemsContainer.removeAll(true);
    const { width } = this.scale;

    if (this.currentTab === 'tools') {
      const owned = Storage.getOwnedTools();
      const equipped = Storage.getEquippedTools();
      const masterLvl = Storage.getMasterLevel();

      TOOL_SHOP_ITEMS.forEach((tool, idx) => {
        const cardY = 145 + idx * 68;
        if (cardY > 680) return;

        const isOwned = owned.includes(tool.id);
        const isEquipped = (equipped[tool.category] === tool.id);
        const canUnlockByLevel = (masterLvl >= tool.requiredLevel);

        const cardBg = this.add.rectangle(width / 2, cardY, width * 0.9, 60, 0x1f1b18, 0.95)
          .setStrokeStyle(1.5, isEquipped ? 0x2ecc71 : 0x444444);

        const title = this.add.text(width * 0.1, cardY - 14, tool.name, {
          fontSize: '14px',
          fontFamily: 'sans-serif',
          color: isEquipped ? '#2ecc71' : '#ffffff',
          fontStyle: 'bold'
        });

        const desc = this.add.text(width * 0.1, cardY + 5, tool.desc, {
          fontSize: '11px',
          fontFamily: 'sans-serif',
          color: '#a4b0be',
          wordWrap: { width: width * 0.55 }
        });

        // Кнопка статуса
        let btnColor = 0x27ae60;
        let btnLabel = `КУПИТЬ ${tool.price}`;
        let isClickable = false;

        if (isEquipped) {
          btnColor = 0x2c3e50;
          btnLabel = 'АКТИВЕН';
        } else if (isOwned) {
          btnColor = 0x2980b9;
          btnLabel = 'ВЫБРАТЬ';
          isClickable = true;
        } else if (!canUnlockByLevel) {
          btnColor = 0x333333;
          btnLabel = `${tool.requiredLevel} УР.`;
        } else {
          isClickable = (Storage.getCoins() >= tool.price);
          btnColor = isClickable ? 0xe67e22 : 0x555555;
        }

        const actionBtn = this.add.rectangle(width * 0.82, cardY, 80, 36, btnColor);
        const actionText = this.add.text(width * 0.82, cardY, btnLabel, {
          fontSize: '11px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        if (isClickable) {
          actionBtn.setInteractive({ useHandCursor: true });
          actionBtn.on('pointerdown', () => {
            if (isOwned) {
              Storage.equipTool(tool.category, tool.id);
            } else {
              if (Storage.spendCoins(tool.price)) {
                Storage.unlockTool(tool.id);
                Storage.equipTool(tool.category, tool.id);
                AudioManager.playCoin();
              }
            }
            this.updateStatusHeader();
            this.renderContent();
          });
        }

        this.itemsContainer.add([cardBg, title, desc, actionBtn, actionText]);
      });
    } else {
      // ВКЛАДКА АПГРЕЙДОВ МАСТЕРСКОЙ
      const currentTier = Storage.getWorkshopTier();
      const masterLvl = Storage.getMasterLevel();

      WORKSHOP_UPGRADES.forEach((upg, idx) => {
        const cardY = 160 + idx * 120;
        const isBought = currentTier >= upg.tier;
        const canUnlock = masterLvl >= upg.requiredLevel;
        const canAfford = Storage.getCoins() >= upg.price;

        const cardBg = this.add.rectangle(width / 2, cardY, width * 0.9, 105, 0x1f1b18, 0.95)
          .setStrokeStyle(1.5, isBought ? 0x2ecc71 : 0xd4af37, 0.8);

        const title = this.add.text(width * 0.1, cardY - 32, `Этап ${upg.tier}: ${upg.name}`, {
          fontSize: '16px',
          fontFamily: 'sans-serif',
          color: isBought ? '#2ecc71' : '#f1c40f',
          fontStyle: 'bold'
        });

        const bonus = this.add.text(width * 0.1, cardY - 12, upg.incomeBonus, {
          fontSize: '12px',
          fontFamily: 'sans-serif',
          color: '#2ecc71',
          fontStyle: 'bold'
        });

        const desc = this.add.text(width * 0.1, cardY + 8, upg.desc, {
          fontSize: '11px',
          fontFamily: 'sans-serif',
          color: '#bdc3c7',
          wordWrap: { width: width * 0.54 }
        });

        let btnColor = 0xe67e22;
        let btnLabel = `${upg.price} ЗОЛОТА`;
        let clickable = false;

        if (isBought) {
          btnColor = 0x2c3e50;
          btnLabel = 'УЛУЧШЕНО';
        } else if (!canUnlock) {
          btnColor = 0x333333;
          btnLabel = `${upg.requiredLevel} УРОВЕНЬ`;
        } else if (canAfford) {
          clickable = true;
        } else {
          btnColor = 0x555555;
        }

        const btn = this.add.rectangle(width * 0.82, cardY, 84, 42, btnColor);
        const btnTxt = this.add.text(width * 0.82, cardY, btnLabel, {
          fontSize: '10px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        if (clickable) {
          btn.setInteractive({ useHandCursor: true });
          btn.on('pointerdown', () => {
            if (Storage.spendCoins(upg.price)) {
              Storage.upgradeWorkshopTier();
              AudioManager.playCoin();
              this.updateStatusHeader();
              this.renderContent();
            }
          });
        }

        this.itemsContainer.add([cardBg, title, bonus, desc, btn, btnTxt]);
      });
    }
  }
}
