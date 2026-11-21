import { AudioManager } from './AudioManager.js';
import { TutorialManager } from './TutorialManager.js';

class BackButtonController {
  constructor() {
    this.initialized = false;
    this.exitModalOpen = false;
    this.lastBackTs = 0;
  }

  init(game) {
    if (this.initialized) return;
    this.initialized = true;
    this.game = game;

    // 1. Слушаем аппаратную/жестовую кнопку «Назад» Android (Capacitor App Plugin)
    const appPlugin = window.Capacitor?.Plugins?.App;
    if (appPlugin && typeof appPlugin.addListener === 'function') {
      appPlugin.addListener('backButton', () => {
        this.handleBackPress();
      });
    }

    // 2. Слушаем системный popstate для PWA / WebView / мобильного браузера
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      window.history.pushState({ artBackGuard: 1 }, '');
      window.addEventListener('popstate', () => {
        window.history.pushState({ artBackGuard: 1 }, '');
        this.handleBackPress();
      });
    }
  }

  getActiveScene() {
    if (!this.game || !this.game.scene) return null;
    const active = this.game.scene.getScenes(true);
    return active && active.length > 0 ? active[active.length - 1] : null;
  }

  handleBackPress() {
    const now = Date.now();
    if (now - this.lastBackTs < 260) return;
    this.lastBackTs = now;

    const scene = this.getActiveScene();
    if (!scene) return;

    const sceneKey = scene.scene?.key;

    // 1. Если открыто окно Spotlight-обучения — закрываем его
    if (TutorialManager.activeOverlay) {
      if (AudioManager.playClick) AudioManager.playClick();
      TutorialManager.destroyCurrent();
      return;
    }

    // 2. Если открыта модалка подтверждения выхода из игры — закрываем её
    if (this.exitModalOpen) {
      this.closeExitModal();
      return;
    }

    // 3. Если открыта внутренняя модалка в текущей сцене — перезапускаем или закрываем модалку
    if (scene.isModalOpen || scene.isGuideOpen) {
      if (AudioManager.playClick) AudioManager.playClick();
      if (sceneKey === 'DigScene') {
        scene.scene.start('EraSelectScene', { regionId: scene.regionId });
      } else {
        scene.scene.restart();
      }
      return;
    }

    // 4. Умная навигация назад по стеку сцен
    if (AudioManager.playClick) AudioManager.playClick();

    if (sceneKey === 'ArtifactDetailScene') {
      scene.scene.start('MuseumScene');
    } else if (sceneKey === 'DigScene') {
      scene.scene.start('EraSelectScene', { regionId: scene.regionId });
    } else if (
      sceneKey === 'EraSelectScene' ||
      sceneKey === 'ShopScene' ||
      sceneKey === 'MuseumScene' ||
      sceneKey === 'RestoreScene' ||
      sceneKey === 'VictoryScene'
    ) {
      scene.scene.start('MenuScene');
    } else if (sceneKey === 'MenuScene') {
      this.showExitConfirmModal(scene);
    }
  }

  showExitConfirmModal(scene) {
    if (this.exitModalOpen) return;
    this.exitModalOpen = true;
    scene.isModalOpen = true;

    const { width, height } = scene.scale;
    const dpr = 3;
    const FONT_UI = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const items = [];
    const overlay = scene.add
      .rectangle(width / 2, height / 2, width, height, 0x060402, 0.86)
      .setDepth(980)
      .setInteractive();
    items.push(overlay);

    const boxW = Math.min(width * 0.84, 340);
    const boxH = 190;
    const card = scene.add.container(width / 2, height / 2).setDepth(981);
    items.push(card);

    const bg = scene.add.graphics();
    bg.fillGradientStyle(0x24180f, 0x24180f, 0x160f0a, 0x160f0a, 0.99);
    bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 14);
    bg.lineStyle(1.5, 0xc89d54, 0.92);
    bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 14);

    const title = scene.add
      .text(0, -boxH / 2 + 30, '🚪 ВЫЙТИ ИЗ МАСТЕРСКОЙ?', {
        fontSize: '15px',
        fontFamily: FONT_UI,
        color: '#facc15',
        fontStyle: 'bold',
        resolution: dpr
      })
      .setOrigin(0.5);

    const desc = scene.add
      .text(0, -10, 'Весь ваш прогресс и сокровища\nнадёжно сохранены.', {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#f5e6c8',
        align: 'center',
        lineSpacing: 4,
        resolution: dpr
      })
      .setOrigin(0.5);

    const halfW = (boxW - 36) / 2;
    const btnY = boxH / 2 - 34;

    // Кнопка "ВЫЙТИ"
    const exitGfx = scene.add.graphics();
    exitGfx.fillStyle(0x991b1b, 1);
    exitGfx.fillRoundedRect(-boxW / 2 + 14, btnY - 18, halfW, 36, 9);
    exitGfx.lineStyle(1, 0xfca5a5, 0.9);
    exitGfx.strokeRoundedRect(-boxW / 2 + 14, btnY - 18, halfW, 36, 9);

    const exitTxt = scene.add
      .text(-boxW / 2 + 14 + halfW / 2, btnY, 'ВЫЙТИ', {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: dpr
      })
      .setOrigin(0.5);

    const exitZone = scene.add
      .zone(-boxW / 2 + 14 + halfW / 2, btnY, halfW, 36)
      .setInteractive({ useHandCursor: true });

    // Кнопка "ОСТАТЬСЯ"
    const stayGfx = scene.add.graphics();
    stayGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
    stayGfx.fillRoundedRect(4, btnY - 18, halfW, 36, 9);

    const stayTxt = scene.add
      .text(4 + halfW / 2, btnY, 'ОСТАТЬСЯ', {
        fontSize: '12px',
        fontFamily: FONT_UI,
        color: '#1a1004',
        fontStyle: 'bold',
        resolution: dpr
      })
      .setOrigin(0.5);

    const stayZone = scene.add
      .zone(4 + halfW / 2, btnY, halfW, 36)
      .setInteractive({ useHandCursor: true });

    card.add([bg, title, desc, exitGfx, exitTxt, exitZone, stayGfx, stayTxt, stayZone]);

    this._closeExitFn = () => {
      items.forEach((o) => o && o.destroy && o.destroy());
      this.exitModalOpen = false;
      scene.isModalOpen = false;
    };

    stayZone.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this._closeExitFn();
    });

    exitZone.on('pointerdown', () => {
      const appPlugin = window.Capacitor?.Plugins?.App;
      if (appPlugin && typeof appPlugin.exitApp === 'function') {
        appPlugin.exitApp();
      } else {
        this._closeExitFn();
      }
    });
  }

  closeExitModal() {
    if (typeof this._closeExitFn === 'function') {
      this._closeExitFn();
    } else {
      this.exitModalOpen = false;
    }
  }
}

export const BackButtonHandler = new BackButtonController();
