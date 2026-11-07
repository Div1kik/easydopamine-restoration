export class ArtifactDetailScene extends Phaser.Scene {
  constructor() {
    super('ArtifactDetailScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const art = data.artifact;

    this.add.rectangle(width / 2, height / 2, width, height, 0x11100e);

    // Верхняя панель
    this.add.text(width / 2, 45, art.eraName.toUpperCase(), {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#e67e22',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.add.text(width / 2, 72, art.name, {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Пьедестал витрины
    const pedestal = this.add.ellipse(width / 2, height * 0.50, 260, 40, 0x221d19);
    pedestal.setStrokeStyle(2, 0xd4af37, 0.4);

    // Центральный интерактивный артефакт
    this.artifactSprite = this.add.image(width / 2, height * 0.38, art.textureKey);
    this.artifactSprite.setScale(0.9);

    // Подсказка вращения
    this.add.text(width / 2, height * 0.55, 'Проведите пальцем для осмотра', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#7f8c8d'
    }).setOrigin(0.5);

    // Интерактивное вращение свайпом
    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown) {
        const dx = pointer.x - pointer.prevPosition.x;
        const dy = pointer.y - pointer.prevPosition.y;

        this.artifactSprite.rotation += dx * 0.015;
        this.artifactSprite.scaleX = Phaser.Math.Clamp(this.artifactSprite.scaleX - dy * 0.003, 0.75, 1.1);
        this.artifactSprite.scaleY = this.artifactSprite.scaleX;
      }
    });

    // Историческая карточка внизу
    const cardBg = this.add.rectangle(width / 2, height * 0.72, width * 0.88, 140, 0x1f1b18)
      .setStrokeStyle(1.5, 0xd4af37, 0.5);

    this.add.text(width * 0.1, height * 0.65, 'АРХИВНАЯ СПРАВКА', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#d4af37',
      fontStyle: 'bold'
    });

    this.add.text(width / 2, height * 0.73, `${art.museumDesc}\n\n${art.historyNote || ''}`, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#dcdde1',
      wordWrap: { width: width * 0.8 },
      align: 'left'
    }).setOrigin(0.5);

    // Кнопка возврата в витрину
    const backBtn = this.add.rectangle(width / 2, height * 0.90, 220, 48, 0x34495e)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.90, 'Назад в музей', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    backBtn.on('pointerdown', () => this.scene.start('MuseumScene'));
  }
}
