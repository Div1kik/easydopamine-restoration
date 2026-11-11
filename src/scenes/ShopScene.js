  // =========================================================================
  // ВКЛАДКА 1: ИНСТРУМЕНТЫ (ПОЛНАЯ ЭВОЛЮЦИЯ II, III, IV РАНГОВ)
  // =========================================================================
  renderToolsUpgrades(width) {
    const dpr = this.dpr;

    const tools = [
      // --- СКРЕБОК ---
      {
        id: 'scraper_2',
        name: 'Латунный скребок II',
        desc: '+20% к радиусу очистки слоя грязи',
        price: 180,
        icon: 'slot_scraper'
      },
      {
        id: 'scraper_3',
        name: 'Закалённый скальпель III',
        desc: '+40% к радиусу очистки, быстрый срез корки',
        price: 520,
        icon: this.textures.exists('slot_scalpel') ? 'slot_scalpel' : 'slot_scraper'
      },
      {
        id: 'scraper_4',
        name: 'Лазерный микро-скальпель IV',
        desc: 'Прецизионное снятие породы в одно касание',
        price: 1400,
        icon: this.textures.exists('slot_laser') ? 'slot_laser' : 'slot_scraper'
      },

      // --- КИСТЬ ---
      {
        id: 'brush_2',
        name: 'Беличья кисть II',
        desc: 'Сметает пыль и песок за меньшее число мазков',
        price: 220,
        icon: 'slot_brush'
      },
      {
        id: 'brush_3',
        name: 'Соболиная веерная кисть III',
        desc: 'Широкий фронт сметания мелких фракций',
        price: 600,
        icon: 'slot_brush'
      },
      {
        id: 'brush_4',
        name: 'Ионизирующая кисть IV',
        desc: 'Сдувает частицы пыли за один лёгкий взмах',
        price: 1650,
        icon: 'slot_brush'
      },

      // --- РЕАКТИВ / СПРЕЙ ---
      {
        id: 'solvent_2',
        name: 'Концентрированный состав II',
        desc: 'Быстро растворяет химический налёт и окислы',
        price: 260,
        icon: this.textures.exists('slot_solvent') ? 'slot_solvent' : 'slot_spray'
      },
      {
        id: 'solvent_3',
        name: 'Царская эссенция III',
        desc: 'Мгновенное растворение застарелой патины',
        price: 750,
        icon: this.textures.exists('slot_solvent') ? 'slot_solvent' : 'slot_spray'
      },
      {
        id: 'solvent_4',
        name: 'Ультразвуковой распылитель IV',
        desc: 'Безупречное удаление налёта без повреждения основы',
        price: 1900,
        icon: this.textures.exists('slot_solvent') ? 'slot_solvent' : 'slot_spray'
      },

      // --- ЗАМША / ПОЛИРОЛЬ ---
      {
        id: 'polish_2',
        name: 'Шёлковая замша II',
        desc: 'Финишный глянец и устранение потёртостей',
        price: 300,
        icon: this.textures.exists('slot_polish') ? 'slot_polish' : 'slot_cloth'
      },
      {
        id: 'polish_3',
        name: 'Паста ГОИ и микрофибра III',
        desc: '+15% к идеальному блеску экспоната',
        price: 850,
        icon: this.textures.exists('slot_polish') ? 'slot_polish' : 'slot_cloth'
      },
      {
        id: 'polish_4',
        name: 'Алмазная эмульсия IV',
        desc: 'Зеркальный блеск высшей музейной пробы',
        price: 2400,
        icon: this.textures.exists('slot_emulsion') ? 'slot_emulsion' : (this.textures.exists('slot_polish') ? 'slot_polish' : 'slot_cloth')
      }
    ];

    const cardH = 82;
    const cardW = width * 0.90;

    tools.forEach((t, i) => {
      const cardY = i * (cardH + 8);
      const isBought = localStorage.getItem(`tool_upg_${t.id}`) === 'true';

      const card = this.add.container(width / 2, cardY + cardH / 2);

      const cardBg = this.add.rectangle(0, 0, cardW, cardH, 0x111622, 0.96)
        .setStrokeStyle(1.5, isBought ? 0x10b981 : 0x273142, 0.85);

      const iconKey = this.textures.exists(t.icon) ? t.icon : 'slot_scraper';
      const icon = this.add.image(-cardW / 2 + 38, 0, iconKey).setScale(0.68);

      const title = this.add.text(-cardW / 2 + 76, -18, t.name, {
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: dpr
      });

      const desc = this.add.text(-cardW / 2 + 76, -2, t.desc, {
        fontSize: '10.5px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#94a3b8',
        wordWrap: { width: cardW - 165 },
        resolution: dpr
      });

      const actionBtn = this.add.container(cardW / 2 - 45, 0);
      const actionBg = this.add.rectangle(0, 0, 76, 32, isBought ? 0x1e293b : 0x10b981)
        .setStrokeStyle(1, isBought ? 0x334155 : 0x34d399)
        .setInteractive({ useHandCursor: !isBought });

      const actionTxt = this.add.text(0, 0, isBought ? 'КУПЛЕНО' : `${t.price} 🪙`, {
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      actionBtn.add([actionBg, actionTxt]);

      if (!isBought) {
        actionBg.on('pointerdown', () => {
          const coins = Storage.getCoins ? Storage.getCoins() : 0;
          if (coins >= t.price) {
            Storage.addCoins(-t.price);
            localStorage.setItem(`tool_upg_${t.id}`, 'true');

            if (AudioManager.playCoin) AudioManager.playCoin();
            this.updateCoinsDisplay();
            this.renderContent();
          } else {
            if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
          }
        });
      }

      card.add([cardBg, icon, title, desc, actionBtn]);
      this.itemsContainer.add(card);
    });
  }
