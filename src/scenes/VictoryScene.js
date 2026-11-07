import { ARTIFACTS } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const artData = data.artifact;
    const reward = artData.reward || 50;

    Storage.addCoins(reward);

    // Парадный фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x111114, 0.95);

    // Ореол сияния
    const glow = this.add.circle(width / 2, height * 0.38, 160, 0xf39c12, 0.25);
    this.tweens.add({
      targets: glow,
      scale: 1.15,
      alpha: 0.4,
      yoyo: true,
      repeat: -1,
      duration: 1200,
      ease: 'Sine.easeInOut'
    });

    // Экспонат с анимацией взлета
    const art = this.add.image(width / 2, height * 0.38, artData.textureKey);
    art.setScale(0);
    this.tweens.add({
      targets: art,
      scale: 0.85,
      duration: 550,
      ease: 'Back.easeOut'
    });

    // Текстовый блок
    this.add.text(width / 2, height * 0.61, 'ШЕДЕВР ВОССТАНОВЛЕН!', {
      fontSize: '20px',
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      color: '#2ecc71'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.66, artData.name, {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.72, `+${reward} золота`, {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Кнопка перехода к следующему артефакту
    const btn = this.add.rectangle(width / 2, height * 0.83, 240, 52, 0x27ae60)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.83, 'Следующий артефакт', {
      fontSize: '17px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    btn.on('pointerdown', () => {
      Storage.setNextLevel(ARTIFACTS.length);
      this.scene.start('RestoreScene');
    });
  }
}
