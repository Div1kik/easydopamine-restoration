import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { EraSelectScene } from './scenes/EraSelectScene.js';
import { RestoreScene } from './scenes/RestoreScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { MuseumScene } from './scenes/MuseumScene.js';
import { ArtifactDetailScene } from './scenes/ArtifactDetailScene.js';
import { YandexSDK } from './utils/YandexSDK.js';

// ============================================================================
// ГЛОБАЛЬНЫЙ SUPER-HD ПАТЧ ШРИФТОВ ДЛЯ PHASER 3
// ============================================================================
const TEXT_SUPERSAMPLE = Math.min(Math.max((window.devicePixelRatio || 2) * 1.5, 3), 4);

function normalizeFontFamily(rawFamily = '') {
  const lower = String(rawFamily).toLowerCase();
  if (lower.includes('palatino') || lower.includes('georgia') || lower.includes('serif') && !lower.includes('sans-serif')) {
    return '"Cormorant Garamond", Georgia, serif';
  }
  return '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
}

function normalizeFontSize(rawSize) {
  if (!rawSize) return '14px';
  const num = parseFloat(rawSize);
  if (Number.isNaN(num)) return rawSize;
  // Поднимаем мелкий текст для комфортного чтения на смартфонах
  if (num < 11) return '13px';
  if (num < 13) return `${Math.ceil(num + 1.5)}px`;
  return `${num}px`;
}

function isDarkTextColor(color) {
  if (!color || typeof color !== 'string') return false;
  const c = color.trim().toLowerCase();
  // Тёмный текст на золотых кнопках не нуждается в тёмной обводке
  return c === '#1a1004' || c === '#0f172a' || c === '#09090b' || c === '#000000' || c === '#111827';
}

function enhanceTextStyle(style = {}) {
  const s = { ...style };
  s.resolution = TEXT_SUPERSAMPLE;
  s.fontFamily = normalizeFontFamily(s.fontFamily);
  s.fontSize = normalizeFontSize(s.fontSize);

  // Добавляем микроконтраст для светлого текста на сложных фонах, если обводка ещё не задана
  if (!s.stroke && !isDarkTextColor(s.color)) {
    const sizeNum = parseFloat(s.fontSize) || 14;
    s.stroke = '#0d0805';
    s.strokeThickness = sizeNum >= 18 ? 3 : 2;
  }

  // Защита от обрезания выносных элементов кириллицы (Й, Ё, Д, Р)
  if (!s.padding) {
    s.padding = { top: 2, bottom: 3, left: 2, right: 2 };
  }

  return s;
}

// 1. Перехват фабрики this.add.text(...)
const origTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style = {}) {
  const enhanced = enhanceTextStyle(style);
  const textObj = origTextFactory.call(this, x, y, text, enhanced);
  textObj.setResolution(TEXT_SUPERSAMPLE);
  return textObj;
};

// 2. Перехват this.make.text(...)
const origTextCreator = Phaser.GameObjects.GameObjectCreator.prototype.text;
Phaser.GameObjects.GameObjectCreator.prototype.text = function (config, addToScene) {
  const cfg = { ...config };
  cfg.style = enhanceTextStyle(cfg.style || {});
  const textObj = origTextCreator.call(this, cfg, addToScene);
  textObj.setResolution(TEXT_SUPERSAMPLE);
  return textObj;
};

// 3. Защита при динамическом изменении стиля или размера шрифта в сценах
const origSetFontSize = Phaser.GameObjects.Text.prototype.setFontSize;
Phaser.GameObjects.Text.prototype.setFontSize = function (size) {
  const result = origSetFontSize.call(this, normalizeFontSize(size));
  this.setResolution(TEXT_SUPERSAMPLE);
  return result;
};

const origSetStyle = Phaser.GameObjects.Text.prototype.setStyle;
Phaser.GameObjects.Text.prototype.setStyle = function (style, updateText, setDefaults) {
  const result = origSetStyle.call(this, enhanceTextStyle(style), updateText, setDefaults);
  this.setResolution(TEXT_SUPERSAMPLE);
  return result;
};

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ SDK И КОНФИГ PHASER
// ============================================================================
YandexSDK.init();

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 480,
  height: 800,
  backgroundColor: '#0d0805',
  resolution: Math.min(Math.max(window.devicePixelRatio || 2, 2), 3),
  render: {
    antialias: true,
    antialiasGL: true,
    roundPixels: false,
    pixelArt: false,
    powerPreference: 'high-performance'
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
    MuseumScene,
    ArtifactDetailScene
  ]
};

new Phaser.Game(config);
