import { ARTIFACT_TEMPLATES } from '../data/artifacts.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('menu_bg', 'assets/backgrounds/menu_bg.png');
    this.load.image('museum_bg', 'assets/backgrounds/museum_bg.png');
    this.load.image('shop_bg', 'assets/backgrounds/shop_bg.png');
    this.load.image('expedition_bg', 'assets/backgrounds/expedition_bg.png');
    this.load.image('victory_bg', 'assets/backgrounds/victory_bg.png');

    // Загружаем все 15 верстаков один раз на старте игры
    for (let i = 1; i <= 15; i++) {
      this.load.image(`workbench_bg_${i}`, `assets/workbenches/workbench_bg_${i}.webp`);
    }

    ARTIFACT_TEMPLATES.forEach((art) => {
      if (art.textureKey) {
        this.load.image(art.textureKey, `assets/artifacts/${art.textureKey}.webp`);
      }
    });
  }

  create() {
    this.scene.start('MenuScene');
  }
}
