import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { EraSelectScene } from './scenes/EraSelectScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { RestoreScene } from './scenes/RestoreScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { MuseumScene } from './scenes/MuseumScene.js';
import { ArtifactDetailScene } from './scenes/ArtifactDetailScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#141210',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 800
  },
  input: {
    activePointers: 3,
    touch: {
      capture: true
    }
  },
  scene: [
    BootScene,
    MenuScene,
    EraSelectScene,
    ShopScene,
    RestoreScene,
    VictoryScene,
    MuseumScene,
    ArtifactDetailScene
  ]
};

window.addEventListener('load', () => {
  new Phaser.Game(config);
});
