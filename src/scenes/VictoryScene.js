import { Storage } from '../utils/Storage.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const reward = 50;
    Storage.addCoins(reward);

    // Затемненный парадный фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x111114, 0.95);

    // Ореол сияния позади экспоната
    const glow = this.add.circle(width / 2, height * 0.38, 160, 0xf39c12, 0.2);
    this.tweens.add({
      targets: glow,
      scale: 1.15,
      alpha: 0.35,
      yoyo: true,
      repeat: -1,
      duration: 1200,
      ease: 'Sine.easeInOut'
    });

    // Отреставрированный артефакт
    const art = this.add.image(width / 2, height * 0.38, 'artifact_clean');
    art.setScale(0.85);

    // Анимация победного появления
    art.setScale(0);
    this.tweens.add({
      targets: art,
      scale: 0.85,
      duration: 600,
      ease: 'Back.easeOut'
    });

    // Тексты победы
    this.add.text(width / 2, height * 0.62, 'ИДЕАЛЬНО ОТРЕСТАВРИРОВАНО!', {
      fontSize: '20px',
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      color: '#2ecc71'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.67, data.artifactName || 'Редкий артефакт', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.73, `Награда: +${reward} золота`, {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Кнопка продолжения
    const btn = this.add.rectangle(width / 2, height * 0.84, 220, 52, 0x27ae60)
      .setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height * 0.84, 'В коллекцию', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    btn.on('pointerdown', () => {
      this.scene.start('RestoreScene');
    });
  }
}
