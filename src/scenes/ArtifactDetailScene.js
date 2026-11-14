import { AudioManager } from '../utils/AudioManager.js';
import { Storage } from '../utils/Storage.js';
import { YandexSDK } from '../utils/YandexSDK.js';

export class ArtifactDetailScene extends Phaser.Scene {
  constructor() {
    super('ArtifactDetailScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const dpr = 3;
    const FONT_TITLE = '"Cormorant Garamond", Georgia, serif';
    const FONT_UI = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const art = (data && data.artifact)
      ? data.artifact
      : { name: 'Реликвия', regionName: 'Музей', textureKey: 'art_egypt_scarab' };

    if (this.textures.exists('museum_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'museum_bg').setDepth(0);
      bg.setScale(Math.max(width / bg.width, height / bg.height));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0805, 0.52).setDepth(0);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x120b07).setDepth(0);
    }

    const headerBg = this.add.graphics().setDepth(10);
    headerBg.fillGradientStyle(0x24180f, 0x24180f, 0x140d08, 0x140d08, 0.94);
    headerBg.fillRect(0, 0, width, 86);
    headerBg.lineStyle(1.5, 0xc89d54, 0.65);
    headerBg.lineBetween(0, 86, width, 86);

    this.add.text(width / 2, 24, (art.regionName || art.eraName || 'ЭКСПОНАТ МУЗЕЯ').toUpperCase(), {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      fontStyle: 'bold',
      letterSpacing: 2,
      resolution: dpr
    }).setOrigin(0.5).setDepth(12);

    this.add.text(width / 2, 54, art.name || 'Реликвия', {
      fontSize: '20px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(12);

    const stageCenterY = height * 0.31;
    const pedestalY = height * 0.465;

    const aura = this.add.circle(width / 2, stageCenterY, 125, 0xfacc15, 0.08).setDepth(2);
    this.tweens.add({
      targets: aura,
      alpha: 0.15,
      scale: 1.06,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.shadowEllipse = this.add.ellipse(width / 2, pedestalY - 2, 165, 22, 0x000000, 0.55).setDepth(3);

    const pedestalGfx = this.add.graphics().setDepth(3);
    pedestalGfx.fillStyle(0x261a10, 0.96);
    pedestalGfx.fillEllipse(width / 2, pedestalY + 6, 236, 36);
    pedestalGfx.lineStyle(1.5, 0x8c6239, 0.8);
    pedestalGfx.strokeEllipse(width / 2, pedestalY + 6, 236, 36);

    pedestalGfx.fillStyle(0x3b2615, 0.98);
    pedestalGfx.fillEllipse(width / 2, pedestalY, 214, 30);
    pedestalGfx.lineStyle(1.8, 0xc89d54, 0.9);
    pedestalGfx.strokeEllipse(width / 2, pedestalY, 214, 30);

    const tex = this.textures.exists(art.textureKey) ? art.textureKey : 'art_egypt_scarab';
    this.baseW = 208;
    this.baseH = 260;

    this.artifactContainer = this.add.container(width / 2, stageCenterY).setDepth(5);

    this.artifactSprite = this.add.image(0, 0, tex)
      .setDisplaySize(this.baseW, this.baseH);

    this.glintSprite = this.add.image(0, 0, tex)
      .setDisplaySize(this.baseW, this.baseH)
      .setTint(0xfffbeb)
      .setAlpha(0)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.artifactContainer.add([this.artifactSprite, this.glintSprite]);

    this.hintText = this.add.text(width / 2, height * 0.515, '↔ Осмотр ракурса   •   ↕ Масштаб', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: dpr
    }).setOrigin(0.5).setDepth(10);

    this.yaw = 0;
    this.pitch = 0;
    this.zoomFactor = 1;
    this.autoSpin = true;
    this.isInspecting = false;
    this.lastInspectPos = { x: 0, y: 0 };

    const inspectTop = 88;
    const inspectBottom = height * 0.54;

    this.input.on('pointerdown', (pointer) => {
      if (pointer.y >= inspectTop && pointer.y <= inspectBottom) {
        this.isInspecting = true;
        this.autoSpin = false;
        this.lastInspectPos = { x: pointer.x, y: pointer.y };
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (!this.isInspecting || !pointer.isDown) return;

      const dx = pointer.x - this.lastInspectPos.x;
      const dy = pointer.y - this.lastInspectPos.y;
      this.lastInspectPos = { x: pointer.x, y: pointer.y };

      // Ограниченный угол (±0.38 рад), чтобы не было видно плоского края
      this.yaw = Phaser.Math.Clamp(this.yaw + dx * 0.005, -0.38, 0.38);
      this.pitch = Phaser.Math.Clamp(this.pitch + dy * 0.0025, -0.14, 0.14);
      this.apply3DTransform();
    });

    this.input.on('pointerup', () => {
      if (this.isInspecting) {
        this.isInspecting = false;
        this.tweens.add({
          targets: this,
          yaw: 0,
          pitch: 0,
          duration: 480,
          ease: 'Back.easeOut',
          onUpdate: () => this.apply3DTransform()
        });
      }
    });

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      if (pointer.y >= inspectTop && pointer.y <= inspectBottom) {
        this.autoSpin = false;
        this.zoomFactor = Phaser.Math.Clamp(this.zoomFactor - deltaY * 0.0008, 0.88, 1.28);
        this.apply3DTransform();
      }
    });

    const cardTopY = height * 0.55;
    const cardH = 132;
    const cardGfx = this.add.graphics().setDepth(10);
    cardGfx.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.94);
    cardGfx.fillRoundedRect(width * 0.06, cardTopY, width * 0.88, cardH, 12);
    cardGfx.lineStyle(1.5, 0xc89d54, 0.65);
    cardGfx.strokeRoundedRect(width * 0.06, cardTopY, width * 0.88, cardH, 12);

    const starsStr = art.stars ? '★'.repeat(art.stars) : '★★★';
    const statusBadge = art.isKintsugi ? `✨ КИНЦУГИ (${starsStr})` : `КАЧЕСТВО: ${starsStr}`;

    this.add.text(width * 0.10, cardTopY + 14, 'АРХИВНАЯ СПРАВКА', {
      fontSize: '12px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setDepth(12);

    this.add.text(width * 0.90, cardTopY + 14, statusBadge, {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: art.isKintsugi ? '#fef08a' : '#86efac',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(1, 0).setDepth(12);

    const descBody = art.museumDesc || art.description || 'Редкий артефакт, бережно восстановленный в мастерской.';
    const descText = `${descBody}\nМузейная оценка: ${art.marketValue || 100} 🪙`;

    this.add.text(width * 0.10, cardTopY + 38, descText, {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#f5e6c8',
      wordWrap: { width: width * 0.80 },
      lineSpacing: 5,
      resolution: dpr
    }).setDepth(12);

    if (art.instanceId) {
      const bonusPrice = Math.round((art.marketValue || 100) * 1.5);
      const sellAdY = height * 0.785;
      const sellGfx = this.add.graphics().setDepth(10);
      sellGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
      sellGfx.fillRoundedRect(width * 0.08, sellAdY - 22, width * 0.84, 44, 11);
      sellGfx.lineStyle(1.2, 0xfef08a, 0.95);
      sellGfx.strokeRoundedRect(width * 0.08, sellAdY - 22, width * 0.84, 44, 11);

      const sellZone = this.add.zone(width / 2, sellAdY, width * 0.84, 44)
        .setInteractive({ useHandCursor: true })
        .setDepth(12);

      this.add.text(width / 2, sellAdY, `🎬 ПРОДАТЬ АУКЦИОНУ +50% (${bonusPrice} 🪙)`, {
        fontSize: '13px',
        fontFamily: FONT_UI,
        color: '#1a1004',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5).setDepth(11);

      sellZone.on('pointerdown', () => {
        YandexSDK.showRewarded(() => {
          Storage.addCoins(bonusPrice);
          Storage.removeArtifactFromInventory(art.instanceId);
          if (AudioManager.playCoin) AudioManager.playCoin();
          this.scene.start('MuseumScene');
        });
      });
    }

    const backY = height * 0.885;
    const backGfx = this.add.graphics().setDepth(10);
    backGfx.fillGradientStyle(0x332215, 0x332215, 0x1e130b, 0x1e130b, 1);
    backGfx.fillRoundedRect(width * 0.08, backY - 22, width * 0.84, 44, 11);
    backGfx.lineStyle(1.5, 0xc89d54, 0.9);
    backGfx.strokeRoundedRect(width * 0.08, backY - 22, width * 0.84, 44, 11);

    const backBtn = this.add.zone(width / 2, backY, width * 0.84, 44)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);

    this.add.text(width / 2, backY, 'Назад в музей', {
      fontSize: '15px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(11);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MuseumScene');
    });
  }

  apply3DTransform() {
    if (!this.artifactContainer) return;

    const cosYaw = Math.max(0.91, Math.cos(this.yaw));
    const cosPitch = Math.max(0.94, Math.cos(this.pitch));

    this.artifactContainer.scaleX = cosYaw * this.zoomFactor;
    this.artifactContainer.scaleY = cosPitch * this.zoomFactor;
    this.artifactContainer.rotation = Math.sin(this.yaw) * 0.06;

    const glintStrength = Math.min(0.30, Math.abs(Math.sin(this.yaw)) * 0.72);
    this.glintSprite.setAlpha(glintStrength);
    this.glintSprite.x = Math.sin(this.yaw) * 5;

    if (this.shadowEllipse) {
      this.shadowEllipse.scaleX = cosYaw * this.zoomFactor;
      this.shadowEllipse.scaleY = this.zoomFactor;
    }
  }

  update(time) {
    if (this.autoSpin && !this.isInspecting) {
      this.yaw = Math.sin(time * 0.0014) * 0.14;
      this.apply3DTransform();
    }
  }
}
