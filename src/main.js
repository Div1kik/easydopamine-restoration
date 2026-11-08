import { BootScene } from './scenes/BootScene.js?v=12.0';
import { MenuScene } from './scenes/MenuScene.js?v=12.0';
import { EraSelectScene } from './scenes/EraSelectScene.js?v=12.0';
import { RestoreScene } from './scenes/RestoreScene.js?v=12.0';
import { VictoryScene } from './scenes/VictoryScene.js?v=12.0';
import { ShopScene } from './scenes/ShopScene.js?v=12.0';
import { MuseumScene } from './scenes/MuseumScene.js?v=12.0';
import { AudioManager } from './utils/AudioManager.js';

// Глобальная разблокировка звука
const unlockAudioHandler = () => {
  AudioManager.unlockAudio();
  window.removeEventListener('pointerdown', unlockAudioHandler);
  window.removeEventListener('touchstart', unlockAudioHandler);
};
window.addEventListener('pointerdown', unlockAudioHandler);
window.addEventListener('touchstart', unlockAudioHandler);

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#0a0d14',
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
    activePointers: 2,
    touch: {
      capture: false
    }
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
