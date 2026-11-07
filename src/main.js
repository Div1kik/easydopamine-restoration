import { BootScene } from './scenes/BootScene.js';
import { RestoreScene } from './scenes/RestoreScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#1a1614',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 800
  },
  scene: [BootScene, RestoreScene, VictoryScene]
};

window.addEventListener('load', () => {
  new Phaser.Game(config);
});
