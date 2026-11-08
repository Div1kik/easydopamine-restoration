  createScrollableTabs(width, y) {
    if (this.tabsScrollContainer) this.tabsScrollContainer.destroy();

    this.tabsScrollContainer = this.add.container(0, y).setDepth(20);
    const tabWidth = 96;
    const spacing = 8;
    const startX = 14;
    const shortNames = ['Египет', 'Античность', 'Европа', 'Япония', 'Ацтеки', 'Викинги', 'Ренессанс'];

    this.tabButtons = [];
    const totalTabsWidth = startX + this.eras.length * (tabWidth + spacing);
    const minScrollX = Math.min(0, width - totalTabsWidth);

    let tabDragStartX = 0;
    let tabInitialX = 0;
    let isDraggingTabs = false;

    this.eras.forEach((era, i) => {
      const tabX = startX + i * (tabWidth + spacing) + tabWidth / 2;
      const isSelected = (i === this.selectedEraIndex);

      const bg = this.add.rectangle(tabX, 16, tabWidth, 34, isSelected ? 0xd4af37 : 0x111622)
        .setStrokeStyle(1.5, isSelected ? 0xfef08a : 0x222c3d, 0.9)
        .setInteractive({ useHandCursor: true });

      const lockPrefix = era.unlocked ? '' : '🔒 ';
      const title = `${lockPrefix}${shortNames[i] || era.name}`;

      const text = this.add.text(tabX, 16, title, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: isSelected ? '#000000' : (era.unlocked ? '#94a3b8' : '#475569'),
        fontStyle: 'bold'
      }).setOrigin(0.5);

      bg.on('pointerdown', (pointer) => {
        tabDragStartX = pointer.x;
        tabInitialX = this.tabsScrollContainer.x;
        isDraggingTabs = false;
      });

      bg.on('pointermove', (pointer) => {
        if (!pointer.isDown) return;
        const dx = pointer.x - tabDragStartX;
        if (Math.abs(dx) > 4) {
          isDraggingTabs = true;
          // Плавный отзывчивый сдвиг без ступеней
          this.tabsScrollContainer.x = Phaser.Math.Clamp(tabInitialX + dx, minScrollX, 0);
        }
      });

      bg.on('pointerup', () => {
        if (!isDraggingTabs) {
          if (AudioManager.playClick) AudioManager.playClick();
          this.selectedEraIndex = i;
          this.updateTabsVisual();
          this.renderArtifactsList();
        }
      });

      this.tabsScrollContainer.add([bg, text]);
      this.tabButtons.push({ bg, text, era, index: i });
    });
  }
