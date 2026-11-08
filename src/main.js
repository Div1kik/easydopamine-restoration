import { BootScene } from './scenes/BootScene.js?v=10.0';
import { MenuScene } from './scenes/MenuScene.js?v=10.0';
import { EraSelectScene } from './scenes/EraSelectScene.js?v=10.0';
import { RestoreScene } from './scenes/RestoreScene.js?v=10.0';
import { VictoryScene } from './scenes/VictoryScene.js?v=10.0';
import { ShopScene } from './scenes/ShopScene.js?v=10.0';
import { MuseumScene } from './scenes/MuseumScene.js?v=10.0';
import { AudioManager } from './utils/AudioManager.js';

// Глобальная разблокировка Web Audio
const unlockAudioHandler = () => {
  AudioManager.unlockAudio();
  window.removeEventListener('pointerdown', unlockAudioHandler);
  window.removeEventListener('keydown', unlockAudioHandler);
};
window.addEventListener('pointerdown', unlockAudioHandler);
window.addEventListener('keydown', unlockAudioHandler);

// Честный расчет физического разрешения экрана для устранения пикселей
const dpr = Math.min(window.devicePixelRatio || 2, 3);

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#0a0c10',
  resolution: dpr,
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false,
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
