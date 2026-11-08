import { BootScene } from './scenes/BootScene.js?v=8.0';
import { MenuScene } from './scenes/MenuScene.js?v=8.0';
import { EraSelectScene } from './scenes/EraSelectScene.js?v=8.0';
import { RestoreScene } from './scenes/RestoreScene.js?v=8.0';
import { VictoryScene } from './scenes/VictoryScene.js?v=8.0';
import { ShopScene } from './scenes/ShopScene.js?v=8.0';
import { MuseumScene } from './scenes/MuseumScene.js?v=8.0';
import { AudioManager } from './utils/AudioManager.js';

// Глобальная разблокировка звука при первом клике
const unlockAudioHandler = () => {
  AudioManager.unlockAudio();
  window.removeEventListener('pointerdown', unlockAudioHandler);
  window.removeEventListener('keydown', unlockAudioHandler);
};
window.addEventListener('pointerdown', unlockAudioHandler);
window.addEventListener('keydown', unlockAudioHandler);

// Виртуальные координаты 480x800 с честным суперсэмплингом экрана
const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#0d0f14',
  resolution: Math.min(window.devicePixelRatio || 2, 3),
  render: {
    antialias: true,
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
