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

function wrapLogicalPointer(pointer, forceDown = null) {
  if (!pointer || typeof pointer !== 'object') return pointer;
  return new Proxy(pointer, {
    get(target, prop) {
      if (prop === 'x') return target.x / RETINA_MULT;
      if (prop === 'y') return target.y / RETINA_MULT;
      if (prop === 'downX') return target.downX / RETINA_MULT;
      if (prop === 'downY') return target.downY / RETINA_MULT;
      if (prop === 'worldX') return target.x / RETINA_MULT;
      if (prop === 'worldY') return target.y / RETINA_MULT;
      if (prop === 'isDown' && forceDown !== null) return forceDown;
      if (prop === 'prevPosition' && target.prevPosition) {
        return {
          x: target.prevPosition.x / RETINA_MULT,
          y: target.prevPosition.y / RETINA_MULT
        };
      }
      const val = target[prop];
      return typeof val === 'function' ? val.bind(target) : val;
    }
  });
}

function makeRetinaScene(SceneClass) {
  return class extends SceneClass {
    init(data) {
      if (this.cameras && this.cameras.main) {
        this.cameras.main.setZoom(RETINA_MULT);
        this.cameras.main.setOrigin(0, 0);
        this.cameras.main.setRoundPixels(false);
      }

      if (this.input) {
        this.input.setTopOnly(false);
        this.input._touchActive = false;
        this.isDragging = false;
        this.isDraggingList = false;

        // Оборачиваем this.input.on СТРОГО ОДИН РАЗ, чтобы при перезапуске сцены координаты не делились на 3 повторно
        if (!this.input._retinaWrapped) {
          this.input._retinaWrapped = true;
          const origOn = this.input.on.bind(this.input);

          origOn('pointerdown', () => {
            this.input._touchActive = true;
            this.isDragging = false;
            this.isDraggingList = false;
          });

          origOn('pointerup', () => {
            this.input._touchActive = false;
            setTimeout(() => {
              this.isDragging = false;
              this.isDraggingList = false;
            }, 50);
          });

          this.input.on = (event, fn, context) => {
            if (typeof event === 'string' && event.startsWith('pointer')) {
              const safeFn = function (p, ...rest) {
                const downState = (event === 'pointermove') ? (this.input._touchActive || p.isDown) : null;
                return fn.call(context || this, wrapLogicalPointer(p, downState), ...rest);
              };
              return origOn(event, safeFn, context || this);
            }
            return origOn(event, fn, context);
          };
        }
      }

      if (!this._scaleRetinaWrapped && this.sys && this.sys.scale) {
        this._scaleRetinaWrapped = true;
        this.scale = new Proxy(this.sys.scale, {
          get(target, prop) {
            if (prop === 'width') return BASE_WIDTH;
            if (prop === 'height') return LOGICAL_HEIGHT;
            const val = target[prop];
            return typeof val === 'function' ? val.bind(target) : val;
          }
        });
      }

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
