import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { EraSelectScene } from './scenes/EraSelectScene.js';
import { RestoreScene } from './scenes/RestoreScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { MuseumScene } from './scenes/MuseumScene.js';
import { ArtifactDetailScene } from './scenes/ArtifactDetailScene.js';
import { YandexSDK } from './utils/YandexSDK.js';

const RETINA_MULT = 2;
// Строго равно RETINA_MULT, чтобы текстура текста ложилась 1:1 в буфер камеры без дробного сжатия 1.5x
const TEXT_RES = RETINA_MULT;

function mapFontFamily(raw = '') {
  const s = String(raw).toLowerCase();
  if ((s.includes('palatino') || s.includes('georgia') || s.includes('serif')) && !s.includes('sans-serif')) {
    return '"Cormorant Garamond", Georgia, serif';
  }
  return '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
}

function patchTextStyle(style = {}) {
  const patched = { ...style };
  patched.resolution = TEXT_RES;
  patched.fontFamily = mapFontFamily(patched.fontFamily);
  // Минимальный читаемый кегль 11.5px для описаний (без раздувания вёрстки)
  if (patched.fontSize) {
    const num = parseFloat(patched.fontSize);
    if (!Number.isNaN(num) && num < 11.5) {
      patched.fontSize = '11.5px';
    }
  }
  if (!patched.padding) {
    patched.padding = { top: 2, bottom: 2, left: 1, right: 1 };
  }
  return patched;
}

const origTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style = {}) {
  // Округляем координаты до целых пикселей, чтобы глифы не попадали на субпиксельную границу
  const rx = typeof x === 'number' ? Math.round(x) : x;
  const ry = typeof y === 'number' ? Math.round(y) : y;
  const obj = origTextFactory.call(this, rx, ry, text, patchTextStyle(style));
  obj.setResolution(TEXT_RES);
  return obj;
};

const origSetStyle = Phaser.GameObjects.Text.prototype.setStyle;
Phaser.GameObjects.Text.prototype.setStyle = function (style, updateText, setDefaults) {
  const res = origSetStyle.call(this, patchTextStyle(style), updateText, setDefaults);
  this.setResolution(TEXT_RES);
  return res;
};

const BASE_WIDTH = 480;
const aspect = (window.innerHeight && window.innerWidth)
  ? (window.innerHeight / window.innerWidth)
  : (800 / 480);
const LOGICAL_HEIGHT = Phaser.Math.Clamp(Math.round(BASE_WIDTH * aspect), 780, 960);

function makeRetinaScene(SceneClass) {
  return class extends SceneClass {
    init(data) {
      if (this.cameras && this.cameras.main) {
        this.cameras.main.setZoom(RETINA_MULT);
        this.cameras.main.setOrigin(0, 0);
        this.cameras.main.setRoundPixels(true);
      }
      this.scale = new Proxy(this.sys.scale, {
        get(target, prop) {
          if (prop === 'width') return BASE_WIDTH;
          if (prop === 'height') return LOGICAL_HEIGHT;
          const val = target[prop];
          return typeof val === 'function' ? val.bind(target) : val;
        }
      });
      if (super.init) super.init(data);
    }
  };
}

YandexSDK.init();

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: BASE_WIDTH * RETINA_MULT,
  height: LOGICAL_HEIGHT * RETINA_MULT,
  backgroundColor: '#0d0805',
  render: {
    antialias: true,
    antialiasGL: true,
    roundPixels: true,
    powerPreference: 'high-performance'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    makeRetinaScene(BootScene),
    makeRetinaScene(MenuScene),
    makeRetinaScene(EraSelectScene),
    makeRetinaScene(RestoreScene),
    makeRetinaScene(VictoryScene),
    makeRetinaScene(ShopScene),
    makeRetinaScene(MuseumScene),
    makeRetinaScene(ArtifactDetailScene)
  ]
};

new Phaser.Game(config);
