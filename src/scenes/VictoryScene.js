import { AudioManager } from '../utils/AudioManager.js';
import { Storage } from '../utils/Storage.js';
import { YandexSDK } from '../utils/YandexSDK.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const dpr = 2.5;
    const FONT_TITLE = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';
    const FONT_UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

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
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0805, 0.52).setDepth(0);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x120b07).setDepth(0);
    }

    // Заголовок победы
    const title = this.add.text(width / 2, height * 0.09, 'РЕСТАВРАЦИЯ ЗАВЕРШЕНА!', {
      fontSize: '20px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      resolution: dpr
    }).setOrigin(0.5).setAlpha(0).setDepth(10).setShadow(0, 2, '#000000', 6, false, true);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: height * 0.09 - 4,
      duration: 550,
      ease: 'Quad.easeOut'
    });

    // Каскадная анимация звезд
    const starSpacing = 64;
    const starStartX = width / 2 - starSpacing;

    for (let i = 0; i < 3; i++) {
      const isFilled = (i < starsCount);
      const starKey = isFilled ? 'icon_star' : 'icon_star_empty';
      const posX = starStartX + i * starSpacing;
      const posY = height * 0.16;

      const star = this.add.image(posX, posY, starKey)
        .setScale(0)
        .setAlpha(0)
        .setDepth(10);

      const flash = this.add.circle(posX, posY, 32, 0xfde047, 0)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(9);

      this.time.delayedCall(220 + i * 180, () => {
        if (isFilled && AudioManager.playStarChime) {
          AudioManager.playStarChime(i);
        }

        this.tweens.add({
          targets: star,
          scale: 0.95,
          alpha: 1,
          duration: 380,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: star,
              y: posY - 4,
              duration: 1200 + i * 150,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        });

        if (isFilled) {
          this.tweens.add({
            targets: flash,
            alpha: { from: 0.8, to: 0 },
            scale: { from: 0.4, to: 1.5 },
            duration: 380,
            ease: 'Quad.easeOut'
          });
        }
      });
    }

    // Артефакт
    const tex = this.textures.exists(artifact.textureKey)
      ? artifact.textureKey
      : 'art_egypt_scarab';

    const artImg = this.add.image(width / 2, height * 0.35, tex)
      .setScale(0)
      .setDepth(10);

    if (isKintsugi) {
      const glow = this.add.ellipse(width / 2, height * 0.35, 220, 260, 0xfacc15, 0.25)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(9);

      this.tweens.add({
        targets: glow,
        scaleX: 1.08,
        scaleY: 1.08,
        alpha: 0.38,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    this.tweens.add({
      targets: artImg,
      scale: 0.72,
      duration: 550,
      delay: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: artImg,
          scaleX: 0.75,
          scaleY: 0.75,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // Название
    this.add.text(width / 2, height * 0.505, artifact.name, {
      fontSize: '20px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(10);

    // Оценка и бейдж
    const baseVal = artifact.marketValue || 100;
    let valueDesc = `Музейная оценка: +${baseVal} 🪙`;
    if (isKintsugi) valueDesc += ' (✨ Кинцуги +60%)';
    else if (isContract) valueDesc += ' (Премия гильдии)';
    else if (isDuplicate) valueDesc += ' (Повтор -35%)';

    const valTxt = this.add.text(width / 2, height * 0.545, valueDesc, {
      fontSize: '13.5px',
      fontFamily: FONT_UI,
      color: isKintsugi ? '#facc15' : '#86efac',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(10);

    // Кнопка Удвоить оценку экспоната за рекламу
    let doubled = false;
    const adBtnY = height * 0.605;
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

    const adTxt = this.add.text(width / 2, adBtnY, `🎬 УДВОИТЬ ОЦЕНКУ (+${baseVal} 🪙 В КАЗНУ)`, {
      fontSize: '13.5px',
      fontFamily: FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(21);

    adZone.on('pointerdown', () => {
      if (doubled) return;
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
        adTxt.setText(`✓ ПОЛУЧЕНО +${baseVal} 🪙 В КАЗНУ!`);
        valTxt.setText(`Итоговая ценность: ${baseVal * 2} 🪙`);
      });
    });

    // Прогресс Опыта
    this.createExperienceBar(width, height, isContract, starsCount, isKintsugi, dpr, FONT_UI);

    // Кнопка: В главное меню
    const menuBtnY = height * 0.805;
    const menuGfx = this.add.graphics().setDepth(20);
    menuGfx.fillGradientStyle(0x332215, 0x332215, 0x1e130b, 0x1e130b, 1);
    menuGfx.fillRoundedRect(width / 2 - adBtnW / 2, menuBtnY - 22, adBtnW, 44, 11);
    menuGfx.lineStyle(1.5, 0xc89d54, 0.9);
    menuGfx.strokeRoundedRect(width / 2 - adBtnW / 2, menuBtnY - 22, adBtnW, 44, 11);

    const menuZone = this.add.zone(width / 2, menuBtnY, adBtnW, 44)
      .setInteractive({ useHandCursor: true })
      .setDepth(22);

    this.add.text(width / 2, menuBtnY, '🗂️ В главное меню', {
      fontSize: '15px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(21);

    menuZone.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('MenuScene');
    });

    // Кнопка: Следующий артефакт
    const nextBtnY = height * 0.885;
    const nextGfx = this.add.graphics().setDepth(20);
    nextGfx.fillGradientStyle(0x15803d, 0x15803d, 0x14532d, 0x14532d, 1);
    nextGfx.fillRoundedRect(width / 2 - adBtnW / 2, nextBtnY - 23, adBtnW, 46, 11);
    nextGfx.lineStyle(1.5, 0x4ade80, 0.95);
    nextGfx.strokeRoundedRect(width / 2 - adBtnW / 2, nextBtnY - 23, adBtnW, 46, 11);

    const nextZone = this.add.zone(width / 2, nextBtnY, adBtnW, 46)
      .setInteractive({ useHandCursor: true })
      .setDepth(22);

    this.add.text(width / 2, nextBtnY, '▶ К следующему артефакту', {
      fontSize: '15px',
      fontFamily: FONT_UI,
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(21);

    nextZone.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('EraSelectScene');
    });
  }

  createExperienceBar(width, height, isContract, starsCount, isKintsugi, dpr, FONT_UI) {
    const xpBoxY = height * 0.695;
    const barW = width * 0.82;

    let baseXp = 100;
    if (starsCount === 2) baseXp = 70;
    else if (starsCount === 1) baseXp = 45;

    let xpAward = isContract ? (baseXp + 85) : baseXp;
    if (isKintsugi) xpAward += 50;

    const initialLvl = Storage.getLevelData();

    this.add.text(width / 2 - barW / 2, xpBoxY - 16, `УР. ${initialLvl.level} • ${initialLvl.title}`, {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#f5e6c8',
      fontStyle: 'bold',
      resolution: dpr
    }).setDepth(15);

    this.add.text(width / 2 + barW / 2, xpBoxY - 16, `+${xpAward} XP`, {
      fontSize: '13px',
      fontFamily: FONT_UI,
      color: '#38bdf8',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(1, 0).setDepth(15);

    this.add.rectangle(width / 2, xpBoxY + 5, barW, 8, 0x0d0805).setDepth(14);
    const xpFill = this.add.rectangle(width / 2 - barW / 2, xpBoxY + 5, barW * initialLvl.progressRatio, 8, 0x38bdf8)
      .setOrigin(0, 0.5).setDepth(15);

    this.time.delayedCall(650, () => {
      const result = Storage.addXP(xpAward);
      const updatedLvl = Storage.getLevelData();

      this.tweens.add({
        targets: xpFill,
        width: barW * (result.leveledUp ? 1 : updatedLvl.progressRatio),
        duration: 700,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          if (result.leveledUp) {
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

    const badge = this.add.text(0, -78, '⭐ НОВЫЙ РАНГ МАСТЕРА! ⭐', {
      fontSize: '15px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      resolution: dpr
    }).setOrigin(0.5);

    const rankText = this.add.text(0, -44, `УРОВЕНЬ ${level}`, {
      fontSize: '23px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const titleText = this.add.text(0, -14, `«${title}»`, {
      fontSize: '14.5px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      resolution: dpr
    }).setOrigin(0.5);

    let rewLine = `Награда: +${bonusCoins} 🪙 в казну`;
    if (lacquerBonus > 0) rewLine += `\n+ ${lacquerBonus} ✨ Золотой лак Кинцуги`;

    const rewardText = this.add.text(0, 26, rewLine, {
      fontSize: '13.5px',
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
      fontSize: '13.5px',
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
