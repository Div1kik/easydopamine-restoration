import { AudioManager } from '../utils/AudioManager.js';
import { Storage } from '../utils/Storage.js';
import { YandexSDK } from '../utils/YandexSDK.js';

export class ArtifactDetailScene extends Phaser.Scene {
  constructor() {
    super('ArtifactDetailScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const dpr = 2.5;
    const FONT_UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    const art = (data && data.artifact) ? data.artifact : { name: 'Реликвия', regionName: 'Музей', textureKey: 'art_egypt_scarab' };

    this.add.rectangle(width / 2, height / 2, width, height, 0x120b07);

    // Верхняя панель
    this.add.text(width / 2, 34, (art.regionName || art.eraName || 'ЭКСПОНАТ').toUpperCase(), {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      fontStyle: 'bold',
      letterSpacing: 2,
      resolution: dpr
    }).setOrigin(0.5);

    this.add.text(width / 2, 62, art.name, {
      fontSize: '21px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    // Пьедестал витрины
    const pedestal = this.add.ellipse(width / 2, height * 0.47, 250, 38, 0x261a10);
    pedestal.setStrokeStyle(2, 0xc89d54, 0.65);

    // Центральный интерактивный артефакт
    const tex = this.textures.exists(art.textureKey) ? art.textureKey : 'art_egypt_scarab';
    this.artifactSprite = this.add.image(width / 2, height * 0.35, tex);
    this.artifactSprite.setScale(0.75);

    this.add.text(width / 2, height * 0.52, 'Проведите пальцем для осмотра экспоната', {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#d6c3a5',
      resolution: dpr
    }).setOrigin(0.5);

    // Интерактивное вращение свайпом
    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown && pointer.y < height * 0.56) {
        const dx = pointer.x - pointer.prevPosition.x;
        const dy = pointer.y - pointer.prevPosition.y;

        this.artifactSprite.rotation += dx * 0.015;
        this.artifactSprite.scaleX = Phaser.Math.Clamp(this.artifactSprite.scaleX - dy * 0.003, 0.60, 0.95);
        this.artifactSprite.scaleY = this.artifactSprite.scaleX;
      }
    });

    // Историческая карточка внизу
    const cardGfx = this.add.graphics();
    cardGfx.fillGradientStyle(0x261a10, 0x261a10, 0x170f09, 0x170f09, 0.94);
    cardGfx.fillRoundedRect(width * 0.06, height * 0.56, width * 0.88, 128, 12);
    cardGfx.lineStyle(1.5, 0xc89d54, 0.65);
    cardGfx.strokeRoundedRect(width * 0.06, height * 0.56, width * 0.88, 128, 12);

    this.add.text(width * 0.10, height * 0.58, 'АРХИВНАЯ СПРАВКА', {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    });

    const descText = `${art.museumDesc || art.description || 'Редкий артефакт, бережно восстановленный в мастерской.'}\nОценка: ${art.marketValue || 100} 🪙`;
    this.add.text(width * 0.10, height * 0.615, descText, {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#f5e6c8',
      wordWrap: { width: width * 0.80 },
      lineSpacing: 4,
      resolution: dpr
    });

    // Кнопка продажи с бонусом +50% за рекламу
    if (art.instanceId) {
      const bonusPrice = Math.round((art.marketValue || 100) * 1.5);
      const sellAdY = height * 0.79;
      const sellGfx = this.add.graphics();
      sellGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
      sellGfx.fillRoundedRect(width * 0.08, sellAdY - 22, width * 0.84, 44, 11);
      sellGfx.lineStyle(1.2, 0xfef08a, 0.95);
      sellGfx.strokeRoundedRect(width * 0.08, sellAdY - 22, width * 0.84, 44, 11);

      const sellZone = this.add.zone(width / 2, sellAdY, width * 0.84, 44).setInteractive({ useHandCursor: true });
      this.add.text(width / 2, sellAdY, `🎬 ПРОДАТЬ АУКЦИОНУ +50% (${bonusPrice} 🪙)`, {
        fontSize: '13.5px',
        fontFamily: FONT_UI,
        color: '#1a1004',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      sellZone.on('pointerdown', () => {
        YandexSDK.showRewarded(() => {
          Storage.addCoins(bonusPrice);
          Storage.removeArtifactFromInventory(art.instanceId);
          if (AudioManager.playCoin) AudioManager.playCoin();
          this.scene.start('MuseumScene');
        });
      });
    }

    // Кнопка возврата в витрину
    const backY = height * 0.885;
    const backGfx = this.add.graphics();
    backGfx.fillGradientStyle(0x332215, 0x332215, 0x1e130b, 0x1e130b, 1);
    backGfx.fillRoundedRect(width * 0.08, backY - 22, width * 0.84, 44, 11);
    backGfx.lineStyle(1.5, 0xc89d54, 0.9);
    backGfx.strokeRoundedRect(width * 0.08, backY - 22, width * 0.84, 44, 11);

    const backBtn = this.add.zone(width / 2, backY, width * 0.84, 44)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, backY, 'Назад в музей', {
      fontSize: '15px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    backBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MuseumScene');
    });
  }
}
