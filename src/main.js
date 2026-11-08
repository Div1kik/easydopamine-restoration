import { BootScene } from './scenes/BootScene.js?v=7.0';
import { MenuScene } from './scenes/MenuScene.js?v=7.0';
import { EraSelectScene } from './scenes/EraSelectScene.js?v=7.0';
import { RestoreScene } from './scenes/RestoreScene.js?v=7.0';
import { VictoryScene } from './scenes/VictoryScene.js?v=7.0';
import { ShopScene } from './scenes/ShopScene.js?v=7.0';
import { MuseumScene } from './scenes/MuseumScene.js?v=7.0';
import { AudioManager } from './utils/AudioManager.js';

// Глобальная разблокировка звука при первом касании
const unlockAudioHandler = () => {
  AudioManager.unlockAudio();
  window.removeEventListener('pointerdown', unlockAudioHandler);
  window.removeEventListener('keydown', unlockAudioHandler);
};
window.addEventListener('pointerdown', unlockAudioHandler);
window.addEventListener('keydown', unlockAudioHandler);

// Базовый рендер в Crisp Full HD для кристальной четкости шрифтов и графики
const config = {
  type: Phaser.AUTO,
  width: 1080,
  height: 1920,
  parent: 'game-container',
  backgroundColor: '#0a0c10',
  resolution: Math.min(window.devicePixelRatio || 1, 2),
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
