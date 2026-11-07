import { ARTIFACTS } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const artData = data.artifact;
    const reward = artData.reward || 50;

    // Сохраняем награду и разблокируем экспонат
    Storage.addCoins(reward);
    Storage.unlockArtifact(artData.id);

    // Победный звук
    AudioManager.playVictory();

    // Парадный фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x111114, 0.95);

    // Ореол сияния
    const glow = this.add.circle(width / 2, height * 0.35, 160, 0xf39c12, 0.25);
    this.tweens.add({
      targets: glow,
      scale: 1.15,
      alpha: 0.4,
      yoyo: true,
      repeat: -1,
      duration: 1200,
      ease: 'Sine.easeInOut'
    });

    // Экспонат
    const art = this.add.image(width / 2, height * 0.35, artData.textureKey);
    art.setScale(0);
    this.tweens.add({
      targets: art,
      scale: 0.8,
      duration: 550,
      ease: 'Back.easeOut'
    });

    // Текстовый блок
    this.add.text(width / 2, height * 0.58, 'ШЕДЕВР ВОССТАНОВЛЕН!', {
      fontSize: '20px',
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      color: '#2ecc71'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.63, artData.name, {
      fontSize: '17px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.68, `+${reward} золота`, {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Кнопка 1: Следующий артефакт
    const nextBtn = this.add.rectangle(width / 2, height * 0.78, 240, 50, 0x27ae60)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.78, 'Дальше', {
      fontSize: '17px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    nextBtn.on('pointerdown', () => {
      Storage.setNextLevel(ARTIFACTS.length);
      this.scene.start('RestoreScene');
    });

    // Кнопка 2: В музей
    const museumBtn = this.add.rectangle(width / 2, height * 0.86, 240, 44, 0x2c3e50)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.86, 'В музейную витрину', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    museumBtn.on('pointerdown', () => {
      this.scene.start('MuseumScene');
    });
  }
}
