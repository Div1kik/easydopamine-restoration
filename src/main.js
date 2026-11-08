import { BootScene } from './scenes/BootScene.js?v=11.0';
import { MenuScene } from './scenes/MenuScene.js?v=11.0';
import { EraSelectScene } from './scenes/EraSelectScene.js?v=11.0';
import { RestoreScene } from './scenes/RestoreScene.js?v=11.0';
import { VictoryScene } from './scenes/VictoryScene.js?v=11.0';
import { ShopScene } from './scenes/ShopScene.js?v=11.0';
import { MuseumScene } from './scenes/MuseumScene.js?v=11.0';
import { AudioManager } from './utils/AudioManager.js';

// Глобальная разблокировка звука
const unlockAudioHandler = () => {
  AudioManager.unlockAudio();
  window.removeEventListener('pointerdown', unlockAudioHandler);
  window.removeEventListener('keydown', unlockAudioHandler);
};
window.addEventListener('pointerdown', unlockAudioHandler);
window.addEventListener('keydown', unlockAudioHandler);

// Честный физический DPR экрана устройства (до 3x на современных флагманах)
const deviceDpr = Math.min(window.devicePixelRatio || 2, 3);

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 840,
  parent: 'game-container',
  backgroundColor: '#0a0d14',
  resolution: deviceDpr,
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false,
    roundPixels: true,
    powerPreference: 'high-performance'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
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
