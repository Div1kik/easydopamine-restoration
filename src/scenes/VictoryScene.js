import { ARTIFACTS } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { YandexSDK } from '../utils/YandexSDK.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data) {
    const { width, height } = this.scale;
    this.artData = data.artifact;
    this.stars = data.stars || 3;
    this.reward = (this.artData.reward || 120) + (this.stars * 20);
    this.xpReward = 150 + (this.stars * 30);
    this.rewardClaimed = false;

    // Начисляем опыт и золото
    const oldLevel = Storage.getMasterLevel();
    Storage.addCoins(this.reward);
    Storage.addXP(this.xpReward);
    Storage.unlockArtifact(this.artData.id);
    Storage.setStars(this.artData.id, this.stars);

    const newLevel = Storage.getMasterLevel();
    const leveledUp = newLevel > oldLevel;

    AudioManager.playVictory();

    this.add.rectangle(width / 2, height / 2, width, height, 0x111114, 0.95);

    // Конфетти
    const emitter = this.add.particles(width / 2, height * 0.28, 'particle_confetti', {
      speed: { min: 140, max: 280 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0.3 },
      lifespan: 1200,
      gravityY: 200,
      quantity: 35,
      tint: [0xf1c40f, 0xe74c3c, 0x3498db, 0x2ecc71]
    });
    this.time.delayedCall(600, () => emitter.stop());

    // Экспонат
    const art = this.add.image(width / 2, height * 0.28, this.artData.textureKey).setScale(0);
    this.tweens.add({
      targets: art,
      scale: 0.75,
      duration: 550,
      ease: 'Back.easeOut'
    });

    // Звезды
    const starStartX = width / 2 - (this.stars - 1) * 24;
    for (let i = 0; i < this.stars; i++) {
      const s = this.add.image(starStartX + i * 48, height * 0.45, 'icon_star').setScale(0);
      this.tweens.add({
        targets: s,
        scale: 1.2,
        delay: 300 + i * 150,
        duration: 350,
        ease: 'Back.easeOut',
        onStart: () => AudioManager.playCoin()
      });
    }

    // Заголовки
    this.add.text(width / 2, height * 0.52, leveledUp ? 'НОВЫЙ УРОВЕНЬ МАСТЕРА!' : 'ИДЕАЛЬНАЯ РЕСТАВРАЦИЯ!', {
      fontSize: '20px',
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      color: leveledUp ? '#f39c12' : '#2ecc71'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.57, this.artData.name, {
      fontSize: '17px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Награды (Золото + XP)
    this.rewardText = this.add.text(width / 2, height * 0.63, `+${this.reward} золота   |   +${this.xpReward} XP`, {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Удвоение за просмотр рекламы
    this.doubleBtn = this.add.rectangle(width / 2, height * 0.72, 250, 46, 0xe67e22)
      .setInteractive({ useHandCursor: true });
    this.doubleText = this.add.text(width / 2, height * 0.72, 'УДВОИТЬ НАГРАДУ x2', {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.doubleBtn.on('pointerdown', () => {
      if (this.rewardClaimed) return;

      YandexSDK.showRewardedVideo({
        onRewarded: () => {
          this.rewardClaimed = true;
          Storage.addCoins(this.reward);
          Storage.addXP(this.xpReward);
          AudioManager.playCoin();
          this.rewardText.setText(`+${this.reward * 2} золота | +${this.xpReward * 2} XP`);
          this.doubleBtn.setAlpha(0.4);
          this.doubleText.setText('УДВОЕНО!');
        }
      });
    });

    // Кнопка в Музей выставить на витрину
    const museumBtn = this.add.rectangle(width / 2, height * 0.81, 250, 48, 0x27ae60)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.81, 'Выставить на витрину', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    museumBtn.on('pointerdown', () => this.scene.start('MuseumScene'));

    // Вернуться к верстаку
    const nextBtn = this.add.rectangle(width / 2, height * 0.89, 250, 42, 0x34495e)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.89, 'К выбору эпохи', {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    nextBtn.on('pointerdown', () => this.scene.start('EraSelectScene'));
  }
}
