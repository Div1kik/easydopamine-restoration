import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create() {
    const { width, height } = this.scale;

    const tier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;
    this.add.image(width / 2, height / 2, `bg_workshop_tier_${tier}`).setDepth(0);

    // Шапка
    this.add.rectangle(width / 2, 45, width, 90, 0x0a0c10, 0.92).setDepth(20);
    this.add.text(width / 2, 28, 'УЛУЧШЕНИЕ МАСТЕРСКОЙ', {
      fontSize: '17px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#c5a059',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(21);

    this.balanceText = this.add.text(width / 2, 48, `Казна: ${Storage.getCoins()} золота`, {
      fontSize: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);

    this.renderTiers(width, height);

    // Подвал
    this.add.rectangle(width / 2, height - 32, width, 64, 0x0a0c10, 0.95).setDepth(20);
    const backBtn = this.add.rectangle(width / 2, height - 32, 220, 38, 0x161b24, 0.95)
      .setStrokeStyle(1.5, 0xffffff, 0.2)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    this.add.text(width / 2, height - 32, 'В главное меню', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(22);

    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  renderTiers(width, height) {
    const currentTier = Storage.getWorkshopTier ? Storage.getWorkshopTier() : 1;

    const tiers = [
      { id: 1, name: 'Сырой подвал', desc: 'Начальная мастерская со сколоченным столом.', cost: 0 },
      { id: 2, name: 'Лавка древностей', desc: 'Уютная комната с полками, книгами и часами.', cost: 450 },
      { id: 3, name: 'Гильдия мастеров', desc: 'Кабинет редкостей, синий бархат и латунь.', cost: 1200 },
      { id: 4, name: 'Императорская галерея', desc: 'Мраморные подиумы, споты и премиум-витрина.', cost: 3000 }
    ];

    const startY = 110;
    const cardH = 115;

    tiers.forEach((t, i) => {
      const cardY = startY + i * cardH;
      const isOwned = currentTier >= t.id;
      const isNext = currentTier === t.id - 1;

      const card = this.add.rectangle(width / 2, cardY + 45, width * 0.90, 98, 0x141822, 0.95)
        .setStrokeStyle(1.5, isOwned ? 0x10b981 : (isNext ? 0xc5a059 : 0x334155))
        .setDepth(5);

      const title = this.add.text(width * 0.10, cardY + 12, `${t.id}. ${t.name}`, {
        fontSize: '15px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: isOwned ? '#10b981' : '#ffffff',
        fontStyle: 'bold'
      }).setDepth(6);

      const desc = this.add.text(width * 0.10, cardY + 34, t.desc, {
        fontSize: '10px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: width * 0.50 }
      }).setDepth(6);

      const btnX = width * 0.74;
      const btnY = cardY + 45;

      if (isOwned) {
        this.add.text(btnX, btnY, 'КУПЛЕНО', {
          fontSize: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#10b981',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(6);
      } else if (isNext) {
        const canBuy = Storage.getCoins() >= t.cost;
        const buyBtn = this.add.rectangle(btnX, btnY, 100, 34, canBuy ? 0xc5a059 : 0x334155)
          .setInteractive({ useHandCursor: canBuy })
          .setDepth(6);

        const buyTxt = this.add.text(btnX, btnY, `${t.cost} 💰`, {
          fontSize: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(7);

        buyBtn.on('pointerdown', () => {
          if (Storage.getCoins() >= t.cost) {
            Storage.addCoins(-t.cost);
            Storage.setWorkshopTier(t.id);
            AudioManager.playCoin();
            this.scene.restart();
          }
        });
      } else {
        this.add.image(btnX, btnY, 'icon_lock').setScale(1.2).setDepth(6);
      }
    });
  }
}
