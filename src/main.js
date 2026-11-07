import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { RestoreScene } from './scenes/RestoreScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { MuseumScene } from './scenes/MuseumScene.js';
import { ShopScene } from './scenes/ShopScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#161311',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 800
  },
  scene: [BootScene, MenuScene, ShopScene, RestoreScene, VictoryScene, MuseumScene]
};

window.addEventListener('load', () => {
  new Phaser.Game(config);
});
