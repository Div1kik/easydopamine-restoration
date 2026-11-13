import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { EraSelectScene } from './scenes/EraSelectScene.js';
import { RestoreScene } from './scenes/RestoreScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { MuseumScene } from './scenes/MuseumScene.js';
import { ArtifactDetailScene } from './scenes/ArtifactDetailScene.js';
import { YandexSDK } from './utils/YandexSDK.js';

const TEXT_RES = 3;

function mapFontFamily(raw = '') {
  const s = String(raw).toLowerCase();
  if ((s.includes('palatino') || s.includes('georgia') || s.includes('serif')) && !s.includes('sans-serif')) {
    return '"Cormorant Garamond", Georgia, serif';
  }
  return '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
}

function patchTextStyle(style = {}) {
  const patched = { ...style };
  patched.resolution = TEXT_RES;
  patched.fontFamily = mapFontFamily(patched.fontFamily);
  if (!patched.padding) {
    patched.padding = { top: 2, bottom: 2, left: 1, right: 1 };
  }
  return patched;
}

const origTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style = {}) {
  const obj = origTextFactory.call(this, x, y, text, patchTextStyle(style));
  obj.setResolution(TEXT_RES);
  return obj;
};

const origSetStyle = Phaser.GameObjects.Text.prototype.setStyle;
Phaser.GameObjects.Text.prototype.setStyle = function (style, updateText, setDefaults) {
  const res = origSetStyle.call(this, patchTextStyle(style), updateText, setDefaults);
  this.setResolution(TEXT_RES);
  return res;
};

// Адаптивная высота под соотношение сторон экрана без чёрных полос
const BASE_WIDTH = 480;
const aspect = (window.innerHeight && window.innerWidth)
  ? (window.innerHeight / window.innerWidth)
  : (800 / 480);
const ADAPTIVE_HEIGHT = Phaser.Math.Clamp(Math.round(BASE_WIDTH * aspect), 780, 960);

YandexSDK.init();

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: BASE_WIDTH,
  height: ADAPTIVE_HEIGHT,
  backgroundColor: '#0d0805',
  resolution: Math.min(Math.max(window.devicePixelRatio || 2, 2), 3),
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
