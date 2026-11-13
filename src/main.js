import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { EraSelectScene } from './scenes/EraSelectScene.js';
import { RestoreScene } from './scenes/RestoreScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { MuseumScene } from './scenes/MuseumScene.js';
import { ArtifactDetailScene } from './scenes/ArtifactDetailScene.js';
import { YandexSDK } from './utils/YandexSDK.js';

const RETINA_MULT = 3;
const TEXT_RES = 3;

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
  if (patched.fontSize) {
    const num = parseFloat(patched.fontSize);
    if (!Number.isNaN(num) && num < 11.5) {
      patched.fontSize = '11.5px';
    }
  }
  if (!patched.padding) {
    patched.padding = { top: 2, bottom: 2, left: 2, right: 2 };
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
        this.cameras.main.setRoundPixels(false);
      }
      this.scale = new Proxy(this.sys.scale, {
        get(target, prop) {
          if (prop === 'width') return BASE_WIDTH;
          if (prop === 'height') return LOGICAL_HEIGHT;
          const val = target[prop];
          return typeof val === 'function' ? val.bind(target) : val;
        }
      });

      // Нормализуем pointer.x и pointer.y под 3x Retina-буфер для скролла и перетаскивания во всех сценах
      const origInputOn = this.input.on.bind(this.input);
      this.input.on = (event, fn, context) => {
        if (event === 'pointerdown' || event === 'pointermove' || event === 'pointerup') {
          const wrapped = function (pointer, ...args) {
            const logicalPointer = new Proxy(pointer, {
              get(t, prop) {
                if (prop === 'x') return t.x / RETINA_MULT;
                if (prop === 'y') return t.y / RETINA_MULT;
                if (prop === 'prevPosition' && t.prevPosition) {
                  return {
                    x: t.prevPosition.x / RETINA_MULT,
                    y: t.prevPosition.y / RETINA_MULT
                  };
                }
                const v = t[prop];
                return typeof v === 'function' ? v.bind(t) : v;
              }
            });
            return fn.call(context || this, logicalPointer, ...args);
          };
          return origInputOn(event, wrapped, context);
        }
        return origInputOn(event, fn, context);
      };

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
    roundPixels: false,
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
