import { BootScene } from './scenes/BootScene.js?v=9.0';
import { MenuScene } from './scenes/MenuScene.js?v=9.0';
import { EraSelectScene } from './scenes/EraSelectScene.js?v=9.0';
import { RestoreScene } from './scenes/RestoreScene.js?v=9.0';
import { VictoryScene } from './scenes/VictoryScene.js?v=9.0';
import { ShopScene } from './scenes/ShopScene.js?v=9.0';
import { MuseumScene } from './scenes/MuseumScene.js?v=9.0';
import { AudioManager } from './utils/AudioManager.js';

const unlockAudioHandler = () => {
  AudioManager.unlockAudio();
  window.removeEventListener('pointerdown', unlockAudioHandler);
  window.removeEventListener('keydown', unlockAudioHandler);
};
window.addEventListener('pointerdown', unlockAudioHandler);
window.addEventListener('keydown', unlockAudioHandler);

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#0a0c10',
  resolution: Math.max(window.devicePixelRatio || 1, 2),
  render: {
    antialias: true,
    antialiasGL: true,
    roundPixels: false
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
