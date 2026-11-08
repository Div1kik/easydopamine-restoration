import { BootScene } from './scenes/BootScene.js?v=18.5';
import { MenuScene } from './scenes/MenuScene.js?v=18.5';
import { EraSelectScene } from './scenes/EraSelectScene.js?v=18.5';
import { RestoreScene } from './scenes/RestoreScene.js?v=18.5';
import { VictoryScene } from './scenes/VictoryScene.js?v=18.5';
import { ShopScene } from './scenes/ShopScene.js?v=18.5';
import { MuseumScene } from './scenes/MuseumScene.js?v=18.5';
import { AudioManager } from './utils/AudioManager.js?v=18.5';

const unlockAudio = () => {
  AudioManager.unlockAudio();
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('touchstart', unlockAudio);
};
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('touchstart', unlockAudio);

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#07090e',
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false,
    roundPixels: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 800
  },
  input: {
    activePointers: 2
  },
  scene: [
    BootScene,
    MenuScene,
    EraSelectScene,
    RestoreScene,
    VictoryScene,
    ShopScene,
    MuseumScene
  ]
};

new Phaser.Game(config);
