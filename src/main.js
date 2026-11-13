import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { EraSelectScene } from './scenes/EraSelectScene.js';
import { RestoreScene } from './scenes/RestoreScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { MuseumScene } from './scenes/MuseumScene.js';
import { ArtifactDetailScene } from './scenes/ArtifactDetailScene.js';
import { YandexSDK } from './utils/YandexSDK.js';

// Глобальный HiDPI-патч шрифтов: убирает размытие и поднимает мелкие кегли на мобильных экранах
const origTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style = {}) {
  const patchedStyle = { ...style };
  const targetRes = Math.min(Math.max(window.devicePixelRatio || 2, 2.5), 3);
  if (!patchedStyle.resolution || patchedStyle.resolution < targetRes) {
    patchedStyle.resolution = targetRes;
  }
  if (patchedStyle.fontSize) {
    const num = parseFloat(patchedStyle.fontSize);
    if (!Number.isNaN(num) && num < 12) {
      patchedStyle.fontSize = `${Math.ceil(num + 2)}px`;
    }
  }
  return origTextFactory.call(this, x, y, text, patchedStyle);
};

YandexSDK.init();

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 480,
  height: 800,
  backgroundColor: '#0d0805',
  resolution: Math.min(window.devicePixelRatio || 2, 2.5),
  render: {
    antialias: true,
    antialiasGL: true,
    roundPixels: false,
    powerPreference: 'high-performance'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
  },
  scene: [
    BootScene,
    MenuScene,
    EraSelectScene,
    RestoreScene,
    VictoryScene,
    ShopScene,
    MuseumScene,
    ArtifactDetailScene
  ]
};

new Phaser.Game(config);
