import { AudioManager } from '../utils/AudioManager.js';
import { Storage } from '../utils/Storage.js';
import { YandexSDK } from '../utils/YandexSDK.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const dpr = 3;
    const FONT_TITLE = '"Cormorant Garamond", Georgia, serif';
    const FONT_UI = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    this.isNavigating = false;

    const artifact = (data && data.artifact)
      ? data.artifact
      : { name: 'Артефакт', marketValue: 100 };
    const starsCount = (data && data.stars !== undefined) ? data.stars : 3;
    const isDuplicate = !!(data && data.isDuplicate);
    const isContract = !!(data && data.isContract);
    const isKintsugi = !!(data && data.isKintsugi);

    YandexSDK.onRestorationCompleted();

    if (this.textures.exists('victory_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'victory_bg').setDepth(0);
      bg.setScale(Math.max(width / bg.width, height / bg.height));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0805, 0.54).setDepth(0);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x120b07).setDepth(0);
    }

    // Заголовок победы
    const title = this.add.text(width / 2, height * 0.085, 'РЕСТАВРАЦИЯ ЗАВЕРШЕНА!', {
      fontSize: '21px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      resolution: dpr
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: height * 0.085 - 3,
      duration: 500,
      ease: 'Quad.easeOut'
    });

    // Аккуратная корона из 3 ювелирных звёзд (без гигантского размера и наползания на артефакт)
    const starSpacing = 54;
    const starStartX = width / 2 - starSpacing;
    const baseStarY = height * 0.165;
    const targetStarScale = 0.36; // 128 * 0.36 = 46px

    for (let i = 0; i < 3; i++) {
      const isFilled = (i < starsCount);
      const starKey = isFilled ? 'icon_star' : 'icon_star_empty';
      const posX = starStartX + i * starSpacing;
      // Центральная звезда чуть выше боковых (дуга)
      const posY = baseStarY - (i === 1 ? 8 : 0);

      const star = this.add.image(posX, posY, starKey)
        .setScale(0)
        .setAlpha(0)
        .setDepth(12);

      const flash = this.add.circle(posX, posY, 24, 0xfde047, 0)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(11);

      this.time.delayedCall(200 + i * 170, () => {
        if (!this.scene || !this.scene.isActive() || this.isNavigating) return;

        if (isFilled && AudioManager.playStarChime) {
          AudioManager.playStarChime(i);
        }

        this.tweens.add({
          targets: star,
          scale: targetStarScale,
          alpha: 1,
          duration: 360,
          ease: 'Back.easeOut',
          onComplete: () => {
            if (!this.scene || !this.scene.isActive() || this.isNavigating) return;
            this.tweens.add({
              targets: star,
              y: posY - 3,
              duration: 1300 + i * 150,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        });

        if (isFilled) {
          this.tweens.add({
            targets: flash,
            alpha: { from: 0.75, to: 0 },
            scale: { from: 0.4, to: 1.4 },
            duration: 360,
            ease: 'Quad.easeOut'
          });
        }
      });
    }

    // Артефакт (с безопасным отступом от звёзд сверху и названия снизу)
    const tex = this.textures.exists(artifact.textureKey)
      ? artifact.textureKey
      : 'art_egypt_scarab';

    const artCenterY = height * 0.37;
    const artImg = this.add.image(width / 2, artCenterY, tex)
      .setScale(0)
      .setDepth(10);

    if (isKintsugi) {
      const glow = this.add.ellipse(width / 2, artCenterY, 190, 220, 0xfacc15, 0.25)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(9);

      this.tweens.add({
        targets: glow,
        scaleX: 1.07,
        scaleY: 1.07,
        alpha: 0.36,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    const baseArtScale = 0.56;
    this.tweens.add({
      targets: artImg,
      scale: baseArtScale,
      duration: 500,
      delay: 350,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (!this.scene || !this.scene.isActive() || this.isNavigating) return;
        this.tweens.add({
          targets: artImg,
          scaleX: baseArtScale + 0.025,
          scaleY: baseArtScale + 0.025,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // Название
    this.add.text(width / 2, height * 0.535, artifact.name, {
      fontSize: '19px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(10);

    // Оценка и бейдж
    const baseVal = artifact.marketValue || 100;
    let valueDesc = `Музейная оценка: +${baseVal} монет`;
    if (isKintsugi) valueDesc += ' (Кинцуги +60%)';
    else if (isContract) valueDesc += ' (Премия гильдии)';
    else if (isDuplicate) valueDesc += ' (Повтор -35%)';

    const valTxt = this.add.text(width / 2, height * 0.573, valueDesc, {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: isKintsugi ? '#facc15' : '#86efac',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(10);

    // Кнопка Удвоить оценку экспоната за рекламу
    let doubled = false;
    const adBtnY = height * 0.63;
    const adBtnW = width * 0.84;
    const adBtnH = 42;

    const adGfx = this.add.graphics().setDepth(20);
    adGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
    adGfx.fillRoundedRect(width / 2 - adBtnW / 2, adBtnY - adBtnH / 2, adBtnW, adBtnH, 10);
    adGfx.lineStyle(1.5, 0xfef08a, 0.95);
    adGfx.strokeRoundedRect(width / 2 - adBtnW / 2, adBtnY - adBtnH / 2, adBtnW, adBtnH, 10);

    const adZone = this.add.zone(width / 2, adBtnY, adBtnW, adBtnH)
      .setInteractive({ useHandCursor: true })
      .setDepth(22);

    const adTxt = this.add.text(width / 2, adBtnY, `УДВОИТЬ ОЦЕНКУ (+${baseVal} В КАЗНУ)`, {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(21);

    adZone.on('pointerdown', () => {
      if (doubled || this.isNavigating) return;
      YandexSDK.showRewarded(() => {
        doubled = true;
        Storage.addCoins(baseVal);
        if (AudioManager.playCoin) AudioManager.playCoin();
        adGfx.clear();
        adGfx.fillStyle(0x1e3322, 0.95);
        adGfx.fillRoundedRect(width / 2 - adBtnW / 2, adBtnY - adBtnH / 2, adBtnW, adBtnH, 10);
        adGfx.lineStyle(1.2, 0x4ade80, 0.9);
        adGfx.strokeRoundedRect(width / 2 - adBtnW / 2, adBtnY - adBtnH / 2, adBtnW, adBtnH, 10);
        adTxt.setColor('#86efac');
        adTxt.setText(`ПОЛУЧЕНО +${baseVal} МОНЕТ В КАЗНУ!`);
        valTxt.setText(`Итоговая ценность: ${baseVal * 2} монет`);
      });
    });

    // Прогресс Опыта
    this.createExperienceBar(width, height, isContract, starsCount, isKintsugi, dpr, FONT_UI);

    const goToScene = (targetScene) => {
      if (this.isNavigating) return;
      this.isNavigating = true;
      if (AudioManager.playClick) AudioManager.playClick();
      this.tweens.killAll();
      this.time.removeAllEvents();
      this.scene.start(targetScene);
    };

    // Кнопка: В главное меню
    const menuBtnY = height * 0.815;
    const menuGfx = this.add.graphics().setDepth(20);
    menuGfx.fillGradientStyle(0x332215, 0x332215, 0x1e130b, 0x1e130b, 1);
    menuGfx.fillRoundedRect(width / 2 - adBtnW / 2, menuBtnY - 22, adBtnW, 44, 11);
    menuGfx.lineStyle(1.5, 0xc89d54, 0.9);
    menuGfx.strokeRoundedRect(width / 2 - adBtnW / 2, menuBtnY - 22, adBtnW, 44, 11);

    const menuZone = this.add.zone(width / 2, menuBtnY, adBtnW, 44)
      .setInteractive({ useHandCursor: true })
      .setDepth(22);

    this.add.text(width / 2, menuBtnY, 'В главное меню', {
      fontSize: '14.5px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(21);

    menuZone.on('pointerdown', () => goToScene('MenuScene'));

    // Кнопка: Следующий артефакт
    const nextBtnY = height * 0.892;
    const nextGfx = this.add.graphics().setDepth(20);
    nextGfx.fillGradientStyle(0x15803d, 0x15803d, 0x14532d, 0x14532d, 1);
    nextGfx.fillRoundedRect(width / 2 - adBtnW / 2, nextBtnY - 23, adBtnW, 46, 11);
    nextGfx.lineStyle(1.5, 0x4ade80, 0.95);
    nextGfx.strokeRoundedRect(width / 2 - adBtnW / 2, nextBtnY - 23, adBtnW, 46, 11);

    const nextZone = this.add.zone(width / 2, nextBtnY, adBtnW, 46)
      .setInteractive({ useHandCursor: true })
      .setDepth(22);

    this.add.text(width / 2, nextBtnY, 'К следующему артефакту ›', {
      fontSize: '14.5px',
      fontFamily: FONT_UI,
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(21);

    nextZone.on('pointerdown', () => goToScene('EraSelectScene'));
  }

  createExperienceBar(width, height, isContract, starsCount, isKintsugi, dpr, FONT_UI) {
    const xpBoxY = height * 0.715;
    const barW = width * 0.82;

    let baseXp = 100;
    if (starsCount === 2) baseXp = 70;
    else if (starsCount === 1) baseXp = 45;

    let xpAward = isContract ? (baseXp + 85) : baseXp;
    if (isKintsugi) xpAward += 50;

    const initialLvl = Storage.getLevelData();

    this.add.text(width / 2 - barW / 2, xpBoxY - 16, `УР. ${initialLvl.level} • ${initialLvl.title}`, {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#f5e6c8',
      fontStyle: 'bold',
      resolution: dpr
    }).setDepth(15);

    this.add.text(width / 2 + barW / 2, xpBoxY - 16, `+${xpAward} XP`, {
      fontSize: '12.5px',
      fontFamily: FONT_UI,
      color: '#38bdf8',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(1, 0).setDepth(15);

    this.add.rectangle(width / 2, xpBoxY + 5, barW, 8, 0x0d0805).setDepth(14);
    const xpFill = this.add.rectangle(width / 2 - barW / 2, xpBoxY + 5, barW * initialLvl.progressRatio, 8, 0x38bdf8)
      .setOrigin(0, 0.5).setDepth(15);

    this.time.delayedCall(600, () => {
      if (!this.scene || !this.scene.isActive() || this.isNavigating) return;
      const result = Storage.addXP(xpAward);
      const updatedLvl = Storage.getLevelData();

      this.tweens.add({
        targets: xpFill,
        width: barW * (result.leveledUp ? 1 : updatedLvl.progressRatio),
        duration: 650,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          if (result.leveledUp && !this.isNavigating) {
            this.showLevelUpModal(width, height, result.newLevel, result.newTitle, result.bonusCoins, result.lacquerBonus, dpr, FONT_UI);
          }
        }
      });
    });
  }

  showLevelUpModal(width, height, level, title, bonusCoins, lacquerBonus, dpr, FONT_UI) {
    if (AudioManager.playShine) AudioManager.playShine();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x080503, 0.85)
      .setInteractive().setDepth(50);

    const card = this.add.container(width / 2, height / 2).setDepth(51).setScale(0);

    const cardBg = this.add.graphics();
    cardBg.fillGradientStyle(0x24180f, 0x24180f, 0x160f0a, 0x160f0a, 0.98);
    cardBg.fillRoundedRect(-(width * 0.84) / 2, -115, width * 0.84, 230, 14);
    cardBg.lineStyle(2, 0xfacc15, 0.95);
    cardBg.strokeRoundedRect(-(width * 0.84) / 2, -115, width * 0.84, 230, 14);

    const badge = this.add.text(0, -78, 'НОВЫЙ РАНГ МАСТЕРА!', {
      fontSize: '14.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      resolution: dpr
    }).setOrigin(0.5);

    const rankText = this.add.text(0, -44, `УРОВЕНЬ ${level}`, {
      fontSize: '22px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const titleText = this.add.text(0, -14, `«${title}»`, {
      fontSize: '14px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      resolution: dpr
    }).setOrigin(0.5);

    let rewLine = `Награда: +${bonusCoins} монет в казну`;
    if (lacquerBonus > 0) rewLine += `\n+ ${lacquerBonus} Золотой лак Кинцуги`;

    const rewardText = this.add.text(0, 26, rewLine, {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#86efac',
      align: 'center',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const okGfx = this.add.graphics();
    okGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
    okGfx.fillRoundedRect(-(width * 0.62) / 2, 62, width * 0.62, 38, 10);
    okGfx.lineStyle(1, 0xfef08a, 0.95);
    okGfx.strokeRoundedRect(-(width * 0.62) / 2, 62, width * 0.62, 38, 10);

    const okBtn = this.add.zone(0, 81, width * 0.62, 38)
      .setInteractive({ useHandCursor: true });

    const okTxt = this.add.text(0, 81, 'ЗАБРАТЬ НАГРАДУ', {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    card.add([cardBg, badge, rankText, titleText, rewardText, okGfx, okBtn, okTxt]);

    this.tweens.add({
      targets: card,
      scale: 1,
      duration: 350,
      ease: 'Back.easeOut'
    });

    okBtn.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      overlay.destroy();
      card.destroy();
    });
  }
}
