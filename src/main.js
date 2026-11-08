import { BootScene } from './scenes/BootScene.js?v=4.0';
import { MenuScene } from './scenes/MenuScene.js';
import { EraSelectScene } from './scenes/EraSelectScene.js';
import { RestoreScene } from './scenes/RestoreScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { MuseumScene } from './scenes/MuseumScene.js';
import { AudioManager } from './utils/AudioManager.js';

// 1. Разблокировка звука при первом касании/клике
const unlockAudioHandler = () => {
  AudioManager.unlockAudio();
  window.removeEventListener('pointerdown', unlockAudioHandler);
  window.removeEventListener('keydown', unlockAudioHandler);
};
window.addEventListener('pointerdown', unlockAudioHandler);
window.addEventListener('keydown', unlockAudioHandler);

// 2. Конфигурация игры с повышенной четкостью (HiDPI / Retina)
const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#0a0c10',
  
  // ВОТ ЭТИ СТРОКИ ОБЕСПЕЧИВАЮТ ЧЕТКОСТЬ:
  resolution: Math.min(window.devicePixelRatio || 2, 2.5),
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
