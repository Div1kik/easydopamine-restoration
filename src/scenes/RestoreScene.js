        if (this.activeTool === 'tool_scraper') {
          AudioManager.playScrub();
        } else if (this.activeTool === 'tool_brush') {
          AudioManager.playBrush();
        } else if (this.activeTool === 'tool_solvent') {
          // Если куплен продвинутый растворитель — звучит распылитель
          const equipped = Storage.getEquippedTools ? Storage.getEquippedTools() : {};
          if (equipped.tool_solvent === 'solvent_2' || equipped.tool_solvent === 'solvent_3') {
            AudioManager.playSpray();
          } else {
            AudioManager.playWash();
          }
        } else if (this.activeTool === 'tool_polish') {
          AudioManager.playCloth();
        }
