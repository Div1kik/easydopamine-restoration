  createToolsTray(trayY) {
    const { width } = this.scale;
    const tools = [
      { id: 'tool_scraper', icon: 'slot_scraper', mask: 'mask_scraper', label: 'Скребок' },
      { id: 'tool_brush', icon: 'slot_brush_soft', mask: 'mask_brush', label: 'Кисть' },
      { id: 'tool_solvent', icon: 'slot_solvent', mask: 'mask_solvent', label: 'Растворитель' },
      { id: 'tool_glue', icon: 'slot_glue', mask: 'mask_glue', label: 'Клей' },
      { id: 'tool_polish', icon: 'slot_polish', mask: 'mask_polish', label: 'Замша' }
    ];

    // Матовая парящая подложка лотка
    this.add.rectangle(width / 2, trayY + 12, width * 0.92, 88, 0x12161f, 0.92)
      .setStrokeStyle(1, 0xffffff, 0.1)
      .setDepth(15);

    const stepX = (width * 0.88) / tools.length;
    const startX = width * 0.06 + stepX / 2;

    this.traySlots = [];

    tools.forEach((t, i) => {
      const slotX = startX + i * stepX;
      const isSelected = (t.id === this.activeTool);

      const slotBg = this.add.rectangle(slotX, trayY + 8, 48, 56, 0x1a212b, 0.95)
        .setStrokeStyle(1.5, isSelected ? 0x10b981 : 0x334155, isSelected ? 1 : 0.4)
        .setInteractive({ useHandCursor: true })
        .setDepth(16);

      const icon = this.add.image(slotX, trayY + 4, t.icon).setScale(0.52).setDepth(17);

      const lbl = this.add.text(slotX, trayY + 42, t.label, {
        fontSize: '9px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: isSelected ? '#10b981' : '#64748b',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(17);

      slotBg.on('pointerdown', () => {
        // Микро-отскок при переключении инструмента
        this.tweens.add({
          targets: slotBg,
          scale: 0.92,
          duration: 60,
          yoyo: true,
          ease: 'Quad.easeInOut'
        });
        this.selectTool(t.id, t.icon, t.mask);
      });

      this.traySlots.push({ id: t.id, bg: slotBg, label: lbl });
    });
  }

  selectTool(toolId, iconKey, maskKey) {
    this.activeTool = toolId;
    this.activeMaskKey = maskKey;
    this.toolSprite.setTexture(iconKey);
    this.toolWarning.setText('');

    this.traySlots.forEach(slot => {
      const active = (slot.id === toolId);
      slot.bg.setStrokeStyle(1.5, active ? 0x10b981 : 0x334155, active ? 1 : 0.4);
      slot.label.setColor(active ? '#10b981' : '#64748b');
    });
  }
