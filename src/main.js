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

      if (this.input) {
        // Не блокируем скролл сцены, если палец коснулся интерактивной карточки или кнопки
        this.input.setTopOnly(false);

        const patchPointer = (p) => {
          if (!p || p.__retinaPatched) return p;
          p.__retinaPatched = true;

          const rawDescX = Object.getOwnPropertyDescriptor(Phaser.Input.Pointer.prototype, 'x') ||
            Object.getOwnPropertyDescriptor(p, 'x');
          const rawDescY = Object.getOwnPropertyDescriptor(Phaser.Input.Pointer.prototype, 'y') ||
            Object.getOwnPropertyDescriptor(p, 'y');

          Object.defineProperties(p, {
            x: {
              get() {
                const raw = rawDescX && rawDescX.get ? rawDescX.get.call(this) : this.position.x;
                return raw / RETINA_MULT;
              },
              set(v) {
                if (rawDescX && rawDescX.set) rawDescX.set.call(this, v * RETINA_MULT);
                else this.position.x = v * RETINA_MULT;
              }
            },
            y: {
              get() {
                const raw = rawDescY && rawDescY.get ? rawDescY.get.call(this) : this.position.y;
                return raw / RETINA_MULT;
              },
              set(v) {
                if (rawDescY && rawDescY.set) rawDescY.set.call(this, v * RETINA_MULT);
                else this.position.y = v * RETINA_MULT;
              }
            },
            worldX: {
              get() {
                return this.position.x / RETINA_MULT;
              }
            },
            worldY: {
              get() {
                return this.position.y / RETINA_MULT;
              }
            }
          });
          return p;
        };

        const origEmit = this.input.emit.bind(this.input);
        this.input.emit = (event, a1, a2, a3, a4) => {
          if (a1 && typeof a1 === 'object' && 'position' in a1) patchPointer(a1);
          if (a2 && typeof a2 === 'object' && 'position' in a2) patchPointer(a2);
          return origEmit(event, a1, a2, a3, a4);
        };
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
