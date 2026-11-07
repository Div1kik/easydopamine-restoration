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
    this.reward = this.artData.reward || 60;
    this.rewardClaimed = false;

    // Базовое сохранение
    Storage.addCoins(this.reward);
    Storage.unlockArtifact(this.artData.id);

    AudioManager.playVictory();

    // Парадный фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x111114, 0.95);

    // Залп праздничных конфетти
    const emitter = this.add.particles(width / 2, height * 0.32, 'particle_confetti', {
      speed: { min: 140, max: 280 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0.3 },
      lifespan: 1200,
      gravityY: 200,
      quantity: 35,
      tint: [0xf1c40f, 0xe74c3c, 0x3498db, 0x2ecc71]
    });
    this.time.delayedCall(600, () => emitter.stop());

    // Сияние
    const glow = this.add.circle(width / 2, height * 0.34, 160, 0xf39c12, 0.25);
    this.tweens.add({
      targets: glow,
      scale: 1.15,
      alpha: 0.4,
      yoyo: true,
      repeat: -1,
      duration: 1200,
      ease: 'Sine.easeInOut'
    });

    // Артефакт
    const art = this.add.image(width / 2, height * 0.34, this.artData.textureKey);
    art.setScale(0);
    this.tweens.add({
      targets: art,
      scale: 0.8,
      duration: 550,
      ease: 'Back.easeOut'
    });

    // Тексты
    this.add.text(width / 2, height * 0.55, 'ИДЕАЛЬНАЯ РЕСТАВРАЦИЯ!', {
      fontSize: '20px',
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      color: '#2ecc71'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.60, this.artData.name, {
      fontSize: '17px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    this.rewardText = this.add.text(width / 2, height * 0.65, `+${this.reward} золота`, {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Кнопка удвоения за рекламу (Яндекс Rewarded Video)
    this.doubleBtn = this.add.rectangle(width / 2, height * 0.74, 250, 46, 0xe67e22)
      .setInteractive({ useHandCursor: true });
    this.doubleText = this.add.text(width / 2, height * 0.74, 'УДВОИТЬ ЗА РЕКЛАМУ x2', {
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
          AudioManager.playCoin();
          this.rewardText.setText(`+${this.reward * 2} золота!`);
          this.doubleBtn.setAlpha(0.4);
          this.doubleText.setText('УДВОЕНО!');
        }
      });
    });

    // Кнопка перехода к следующему артефакту
    const nextBtn = this.add.rectangle(width / 2, height * 0.83, 250, 50, 0x27ae60)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.83, 'Следующий артефакт', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    nextBtn.on('pointerdown', () => {
      // Показ межстраничной рекламы перед следующим уровнем
      YandexSDK.showFullscreenAdv({
        onClose: () => {
          Storage.setNextLevel(ARTIFACTS.length);
          this.scene.start('RestoreScene');
        }
      });
    });

    // Кнопка в Музей
    const museumBtn = this.add.rectangle(width / 2, height * 0.91, 250, 40, 0x2c3e50)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.91, 'В музейную витрину', {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    museumBtn.on('pointerdown', () => this.scene.start('MuseumScene'));
  }
}
