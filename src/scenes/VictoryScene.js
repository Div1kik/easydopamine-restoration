import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { YandexSDK } from '../utils/YandexSDK.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data) {
    const { width, height } = this.scale;
    this.artData = (data && data.artifact) ? data.artifact : {
      name: 'Золотой скарабей',
      textureKey: 'art_egypt_scarab',
      marketValue: 180
    };
    this.stars = (data && data.stars) ? data.stars : 3;

    const baseReward = this.artData.marketValue || 180;
    this.goldReward = Math.round(baseReward * 0.6);
    this.xpReward = 160 + (this.stars * 30);
    this.rewardClaimed = false;

    // Начисление валюты и опыта
    const oldLevel = Storage.getMasterLevel ? Storage.getMasterLevel() : 1;
    Storage.addCoins(this.goldReward);
    Storage.addXP(this.xpReward);
    const newLevel = Storage.getMasterLevel ? Storage.getMasterLevel() : 1;
    const leveledUp = newLevel > oldLevel;

    // Фанфары победы
    AudioManager.playVictory();

    // Полупрозрачный темный фон с золотым свечением
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0c10, 0.94);

    // Конфетти
    const emitter = this.add.particles(width / 2, height * 0.26, 'particle_dust', {
      speed: { min: 140, max: 280 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.8, end: 0.2 },
      lifespan: 1200,
      gravityY: 180,
      quantity: 35,
      tint: [0xfacc15, 0xef4444, 0x3b82f6, 0x22c55e]
    });
    this.time.delayedCall(700, () => emitter.stop());

    // Отреставрированный сияющий артефакт
    const art = this.add.image(width / 2, height * 0.27, this.artData.textureKey || 'art_egypt_scarab')
      .setScale(0);

    this.tweens.add({
      targets: art,
      scale: 0.72,
      duration: 550,
      ease: 'Back.easeOut'
    });

    // 3 Звезды
    const starStartX = width / 2 - (this.stars - 1) * 24;
    for (let i = 0; i < this.stars; i++) {
      const s = this.add.image(starStartX + i * 48, height * 0.44, 'icon_star').setScale(0);
      this.tweens.add({
        targets: s,
        scale: 1.25,
        delay: 350 + i * 140,
        duration: 350,
        ease: 'Back.easeOut',
        onStart: () => AudioManager.playCoin()
      });
    }

    // Заголовки
    this.add.text(width / 2, height * 0.51, leveledUp ? 'НОВЫЙ УРОВЕНЬ МАСТЕРА!' : 'АРТЕФАКТ ВОССТАНОВЛЕН!', {
      fontSize: '20px',
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      color: leveledUp ? '#f59e0b' : '#22c55e'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.56, this.artData.name, {
      fontSize: '17px',
      fontFamily: 'sans-serif',
      color: '#f8fafc'
    }).setOrigin(0.5);

    // Блок наград
    this.rewardText = this.add.text(width / 2, height * 0.62, `+${this.goldReward} золота   •   +${this.xpReward} XP`, {
      fontSize: '17px',
      fontFamily: 'sans-serif',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Удвоение награды за просмотр рекламы
    this.doubleBtn = this.add.rectangle(width / 2, height * 0.70, 260, 46, 0xd97706)
      .setStrokeStyle(1.5, 0xffffff, 0.4)
      .setInteractive({ useHandCursor: true });

    this.doubleText = this.add.text(width / 2, height * 0.70, 'УДВОИТЬ НАГРАДУ x2', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5);

    this.doubleBtn.on('pointerdown', () => {
      if (this.rewardClaimed) return;
      YandexSDK.showRewardedVideo({
        onRewarded: () => {
          this.rewardClaimed = true;
          Storage.addCoins(this.goldReward);
          Storage.addXP(this.xpReward);
          AudioManager.playCoin();
          this.rewardText.setText(`+${this.goldReward * 2} золота   •   +${this.xpReward * 2} XP`);
          this.doubleBtn.setAlpha(0.4);
          this.doubleText.setText('УДВОЕНО!');
        }
      });
    });

    // Кнопка 1: Отнести в антикварную лавку на продажу
    const shopBtn = this.add.rectangle(width / 2, height * 0.79, 260, 48, 0x16a34a)
      .setStrokeStyle(1.5, 0xffffff, 0.5)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.79, 'ВЫСТАВИТЬ НА ПОЛКУ В ЛАВКУ', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    shopBtn.on('pointerdown', () => {
      this.scene.start('MuseumScene');
    });

    // Кнопка 2: Взять следующий заказ на верстак
    const nextBtn = this.add.rectangle(width / 2, height * 0.87, 260, 44, 0x334155)
      .setStrokeStyle(1.5, 0xffffff, 0.3)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.87, 'СЛЕДУЮЩИЙ ЗАКАЗ', {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#f1f5f9',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    nextBtn.on('pointerdown', () => {
      this.scene.start('RestoreScene');
    });
  }
}
