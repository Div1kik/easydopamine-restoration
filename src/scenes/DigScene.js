import { REGIONS, ARTIFACT_TEMPLATES } from '../data/artifacts.js';
import { Storage } from '../utils/Storage.js';
import { AudioManager } from '../utils/AudioManager.js';
import { YandexSDK } from '../utils/YandexSDK.js';
import { drawDetailedToolCanvas } from '../utils/ToolArt.js';

const ERA_DIG_THEMES = {
  egypt: {
    name: 'Пески Долины Царей',
    rockTop: 0xc29349,
    rockDark: 0x8c6229,
    sandBase: 0xe6be7a,
    sandGrain: 0x9c6e2e,
    hardness: 1
  },
  antique: {
    name: 'Терракотовый холм',
    rockTop: 0xa85538,
    rockDark: 0x733521,
    sandBase: 0xd69e7c,
    sandGrain: 0x7c432c,
    hardness: 1
  },
  europe: {
    name: 'Руины старой крепости',
    rockTop: 0x6b635b,
    rockDark: 0x453f39,
    sandBase: 0x9c8e7e,
    sandGrain: 0x54493e,
    hardness: 2
  },
  japan: {
    name: 'Бамбуковый склон Киото',
    rockTop: 0x5c5346,
    rockDark: 0x3b352c,
    sandBase: 0x8f826d,
    sandGrain: 0x473f33,
    hardness: 2
  },
  aztec: {
    name: 'Вулканический пепел',
    rockTop: 0x47434a,
    rockDark: 0x2b282e,
    sandBase: 0x736c78,
    sandGrain: 0x322e36,
    hardness: 3
  },
  vikings: {
    name: 'Мёрзлый фьорд',
    rockTop: 0x526575,
    rockDark: 0x313f4a,
    sandBase: 0x8799a8,
    sandGrain: 0x394854,
    hardness: 3
  },
  renaissance: {
    name: 'Мраморные каменоломни',
    rockTop: 0x7d746b,
    rockDark: 0x4d4640,
    sandBase: 0xb5aaa0,
    sandGrain: 0x595149,
    hardness: 3
  }
};

export class DigScene extends Phaser.Scene {
  constructor() {
    super('DigScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const dpr = 3;
    this.dpr = dpr;

    const FONT_TITLE = '"Cormorant Garamond", Georgia, serif';
    const FONT_UI = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.FONT_UI = FONT_UI;
    this.FONT_TITLE = FONT_TITLE;

    this.regionId = (data && data.regionId) ? data.regionId : 'egypt';
    this.regionInfo = REGIONS.find((r) => r.id === this.regionId) || REGIONS[0];
    this.theme = ERA_DIG_THEMES[this.regionId] || ERA_DIG_THEMES.egypt;

    this.gear = Storage.getExpeditionGearBonuses();
    this.activeTool = 'radar'; // Начинаем с георадара, чтобы игрок мог сразу просканировать шурф
    this.isModalOpen = false;
    this.isFinished = false;
    this.adChargeUsed = false;

    // Раздельные ресурсы: импульсы Георадара и удары Кирки
    this.maxRadarPulses = 2 + this.gear.radarTier; // от 3 до 6 сканирований
    this.radarPulses = this.maxRadarPulses;

    this.maxStamina = 16 + (this.gear.pickaxeTier - 1) * 3;
    this.stamina = this.maxStamina;

    if (AudioManager.playEraMusic) {
      AudioManager.playEraMusic(this.regionId);
    }

    // 1. ФОН РАСКОПОК
    if (this.textures.exists('dig_bg') && this.textures.get('dig_bg').key !== '__MISSING') {
      const bg = this.add.image(width / 2, height / 2, 'dig_bg').setDepth(0);
      bg.setScale(Math.max(width / bg.width, height / bg.height));
    } else if (this.textures.exists('expedition_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'expedition_bg').setDepth(0);
      bg.setScale(Math.max(width / bg.width, height / bg.height));
      this.add.rectangle(width / 2, height / 2, width, height, 0x0d0805, 0.35).setDepth(0);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x120b07).setDepth(0);
    }

    // 2. ВЕРХНЯЯ ПАНЕЛЬ
    const headerH = 92;
    const headerBg = this.add.graphics().setDepth(40);
    headerBg.fillGradientStyle(0x24180f, 0x24180f, 0x140d08, 0x140d08, 0.95);
    headerBg.fillRect(0, 0, width, headerH);
    headerBg.lineStyle(1.5, 0xc89d54, 0.75);
    headerBg.lineBetween(0, headerH, width, headerH);

    this.add.text(width / 2, 20, `⛏ РАСКОПКИ: ${this.regionInfo.name.toUpperCase()}`, {
      fontSize: '16px',
      fontFamily: FONT_TITLE,
      color: '#fdf6e3',
      fontStyle: 'bold',
      letterSpacing: 1,
      resolution: dpr
    }).setOrigin(0.5).setDepth(42);

    this.subStatusTxt = this.add.text(width / 2, 42, this.theme.name, {
      fontSize: '11px',
      fontFamily: FONT_UI,
      color: '#e2b866',
      resolution: dpr
    }).setOrigin(0.5).setDepth(42);

    // Индикаторы: Удары кирки, Импульсы радара и Найденные артефакты
    this.staminaTxt = this.add.text(14, 68, '', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0, 0.5).setDepth(42);

    this.radarTxt = this.add.text(width / 2 + 8, 68, '', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#38bdf8',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(42);

    this.foundCounterTxt = this.add.text(width - 14, 68, '', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#86efac',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(1, 0.5).setDepth(42);

    // 3. ГЕОМЕТРИЯ ШУРФА (6x8 ПЛИТОК БЕЗ ЩЕЛЕЙ)
    const trayH = 104;
    const pitTop = headerH + 34;
    const pitBottom = height - trayH - 38;
    const pitAvailableH = pitBottom - pitTop;

    this.cols = 6;
    this.rows = 8;
    const maxPitW = width * 0.64;
    const cellSize = Math.floor(Math.min(maxPitW / this.cols, pitAvailableH / this.rows));
    this.cellSize = cellSize;

    this.pitW = cellSize * this.cols;
    this.pitH = cellSize * this.rows;
    this.pitLeft = Math.floor(width / 2 - this.pitW / 2);
    this.pitTop = Math.floor(pitTop + (pitAvailableH - this.pitH) / 2);

    const pitFrame = this.add.graphics().setDepth(4);
    pitFrame.fillStyle(0x140d08, 0.96);
    pitFrame.fillRoundedRect(this.pitLeft - 6, this.pitTop - 6, this.pitW + 12, this.pitH + 12, 10);
    pitFrame.lineStyle(2, 0xc89d54, 0.85);
    pitFrame.strokeRoundedRect(this.pitLeft - 6, this.pitTop - 6, this.pitW + 12, this.pitH + 12, 10);

    // 4. ГЕНЕРАЦИЯ НАХОДОК И ТАЙНИКОВ В ГРУНТЕ
    this.targets = [];
    this.collectedArtifacts = [];
    this.collectedCoins = 0;
    this.collectedLacquer = 0;

    this.generateBuriedTargets();
    this.buildExcavationGrid();
    this.updateTopCounters();

    this.hintBanner = this.add.text(width / 2, height - trayH - 18, '', {
      fontSize: '11.5px',
      fontFamily: FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(42);

    // 5. НИЖНИЙ ТРЕЙ ПОЛЕВЫХ ИНСТРУМЕНТОВ
    this.createFieldToolTray(width, height - trayH / 2 - 4, dpr);
    this.selectFieldTool('radar', false);

    this.particles = this.add.particles(0, 0, 'particle_dust', {
      lifespan: { min: 220, max: 380 },
      speed: { min: 45, max: 110 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.9, end: 0 },
      emitting: false
    }).setDepth(35);

    // 6. ВВОД
    this.isPointerDown = false;
    this.lastWorkedCellKey = null;

    this.input.on('pointerdown', (p) => {
      if (this.isModalOpen || this.isFinished) return;
      this.isPointerDown = true;
      this.lastWorkedCellKey = null;
      this.handlePitPointer(p, true);
    });

    this.input.on('pointermove', (p) => {
      if (this.isModalOpen || this.isFinished || !this.isPointerDown) return;
      if (this.activeTool !== 'radar') {
        this.handlePitPointer(p, false);
      }
    });

    this.input.on('pointerup', () => {
      this.isPointerDown = false;
      this.lastWorkedCellKey = null;
    });
  }

  generateBuriedTargets() {
    const eraTemplates = ARTIFACT_TEMPLATES.filter((t) => t.regionId === this.regionId);
    const discovered = Storage.getDiscoveredInRegion(this.regionId);

    const artifactCount = (this.gear.fieldBrushTier >= 3 && Math.random() < 0.45) ? 3 : 2;
    const chosenTemplates = [];
    const pool = [...eraTemplates];

    for (let i = 0; i < artifactCount && pool.length > 0; i++) {
      const weights = pool.map((t, idx) => {
        const isNew = !discovered.includes(t.id);
        const baseW = isNew ? 3.2 : 1.0;
        const radarBoost = 1 + idx * 0.18 * (this.gear.radarTier - 1);
        return baseW * radarBoost;
      });
      const sumW = weights.reduce((a, b) => a + b, 0);
      let roll = Math.random() * sumW;
      let pickedIdx = 0;
      for (let j = 0; j < pool.length; j++) {
        roll -= weights[j];
        if (roll <= 0) {
          pickedIdx = j;
          break;
        }
      }
      chosenTemplates.push(pool[pickedIdx]);
      pool.splice(pickedIdx, 1);
    }

    const occupied = new Set();
    const canPlace = (c, r, wCells, hCells) => {
      if (c < 0 || r < 0 || c + wCells > this.cols || r + hCells > this.rows) return false;
      for (let rr = r; rr < r + hCells; rr++) {
        for (let cc = c; cc < c + wCells; cc++) {
          if (occupied.has(`${cc}_${rr}`)) return false;
        }
      }
      return true;
    };

    const markOccupied = (c, r, wCells, hCells) => {
      const cells = [];
      for (let rr = r; rr < r + hCells; rr++) {
        for (let cc = c; cc < c + wCells; cc++) {
          const key = `${cc}_${rr}`;
          occupied.add(key);
          cells.push(key);
        }
      }
      return cells;
    };

    chosenTemplates.forEach((tmpl) => {
      const candidates = [];
      for (let r = 0; r <= this.rows - 2; r++) {
        for (let c = 0; c <= this.cols - 2; c++) {
          if (canPlace(c, r, 2, 2)) candidates.push({ c, r });
        }
      }
      if (candidates.length === 0) return;
      const pos = candidates[Math.floor(Math.random() * candidates.length)];
      const cells = markOccupied(pos.c, pos.r, 2, 2);

      const cx = this.pitLeft + (pos.c + 1) * this.cellSize;
      const cy = this.pitTop + (pos.r + 1) * this.cellSize;
      const texKey = this.textures.exists(tmpl.textureKey) ? tmpl.textureKey : 'art_egypt_scarab';

      // Скрываем спрайт до первого вскрытия породы над ним, чтобы ничего не просвечивало!
      const sprite = this.add.image(cx, cy, texKey)
        .setDisplaySize(this.cellSize * 1.62, this.cellSize * 1.62)
        .setVisible(false)
        .setDepth(8);

      const radarGlow = this.add.rectangle(cx, cy, this.cellSize * 1.92, this.cellSize * 1.92, 0xfacc15, 0)
        .setStrokeStyle(2, 0xfacc15, 0)
        .setDepth(26);

      this.targets.push({
        type: 'artifact',
        template: tmpl,
        cells,
        sprite,
        radarGlow,
        cx,
        cy,
        revealed: false,
        collected: false
      });
    });

    const cacheCount = this.gear.radarTier >= 2 ? 2 : 1;
    for (let k = 0; k < cacheCount; k++) {
      const candidates = [];
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (canPlace(c, r, 1, 1)) candidates.push({ c, r });
        }
      }
      if (candidates.length === 0) break;
      const pos = candidates[Math.floor(Math.random() * candidates.length)];
      const cells = markOccupied(pos.c, pos.r, 1, 1);

      const cx = this.pitLeft + (pos.c + 0.5) * this.cellSize;
      const cy = this.pitTop + (pos.r + 0.5) * this.cellSize;
      const isLacquer = (k === 0 && Math.random() < 0.22);

      const badge = this.add.text(cx, cy, isLacquer ? '✨' : '🪙', {
        fontSize: `${Math.round(this.cellSize * 0.56)}px`,
        resolution: this.dpr
      }).setOrigin(0.5).setVisible(false).setDepth(8);

      const radarGlow = this.add.rectangle(cx, cy, this.cellSize * 0.92, this.cellSize * 0.92, 0x38bdf8, 0)
        .setStrokeStyle(1.8, 0x38bdf8, 0)
        .setDepth(26);

      const coinAmount = Math.round((45 + (this.regionInfo.id === 'egypt' ? 25 : 85)) * (0.85 + Math.random() * 0.4));

      this.targets.push({
        type: isLacquer ? 'lacquer' : 'coins',
        coinAmount,
        cells,
        sprite: badge,
        radarGlow,
        cx,
        cy,
        revealed: false,
        collected: false
      });
    }
  }

  buildExcavationGrid() {
    this.cells = {};
    const cs = this.cellSize;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const key = `${c}_${r}`;
        const x = this.pitLeft + c * cs;
        const y = this.pitTop + r * cs;

        // Сплошной нижний слой песка без щелей
        const sandGfx = this.add.graphics().setDepth(12);
        sandGfx.fillStyle(this.theme.sandBase, 1);
        sandGfx.fillRect(x, y, cs + 0.5, cs + 0.5);
        sandGfx.fillStyle(this.theme.sandGrain, 0.45);
        sandGfx.fillCircle(x + cs * 0.3, y + cs * 0.35, 2.2);
        sandGfx.fillCircle(x + cs * 0.72, y + cs * 0.68, 2.6);
        sandGfx.lineStyle(1, this.theme.sandGrain, 0.35);
        sandGfx.strokeRect(x, y, cs, cs);

        // Сплошной верхний слой твёрдой породы (без дырок по углам!)
        const rockGfx = this.add.graphics().setDepth(16);
        const shade = ((r + c) % 2 === 0) ? this.theme.rockTop : this.theme.rockDark;
        rockGfx.fillStyle(shade, 1);
        rockGfx.fillRect(x, y, cs + 0.5, cs + 0.5);
        rockGfx.lineStyle(1.2, 0x0d0805, 0.65);
        rockGfx.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);

        // Декоративный блик на камне
        rockGfx.fillStyle(0xffffff, 0.08);
        rockGfx.fillRoundedRect(x + 4, y + 4, cs * 0.45, 4, 2);

        this.cells[key] = {
          c,
          r,
          key,
          cx: x + cs / 2,
          cy: y + cs / 2,
          rockHp: this.theme.hardness,
          dustHp: 1,
          sandGfx,
          rockGfx
        };
      }
    }
  }

  handlePitPointer(pointer, isClick) {
    const col = Math.floor((pointer.x - this.pitLeft) / this.cellSize);
    const row = Math.floor((pointer.y - this.pitTop) / this.cellSize);
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;

    const cellKey = `${col}_${row}`;
    if (!isClick && this.lastWorkedCellKey === cellKey) return;
    this.lastWorkedCellKey = cellKey;

    if (this.activeTool === 'radar') {
      this.useRadarAt(col, row);
    } else if (this.activeTool === 'pickaxe') {
      this.usePickaxeAt(col, row);
    } else if (this.activeTool === 'fieldbrush') {
      this.useFieldBrushAt(col, row);
    }
  }

  useRadarAt(col, row) {
    if (this.radarPulses <= 0) {
      this.hintBanner.setText('📡 Импульсы георадара закончились! Копайте Киркой.');
      if (AudioManager.playBreakSnap) AudioManager.playBreakSnap();
      return;
    }

    this.radarPulses = Math.max(0, this.radarPulses - 1);
    this.updateTopCounters();
    if (AudioManager.playShine) AudioManager.playShine();

    const cx = this.pitLeft + (col + 0.5) * this.cellSize;
    const cy = this.pitTop + (row + 0.5) * this.cellSize;
    const scanRadius = this.cellSize * (1.55 + (this.gear.radarTier - 1) * 0.45);

    const pulse = this.add.circle(cx, cy, 12, 0x38bdf8, 0.25)
      .setStrokeStyle(2.5, 0x38bdf8, 0.95)
      .setDepth(30);

    this.tweens.add({
      targets: pulse,
      radius: scanRadius,
      alpha: 0,
      duration: 550,
      ease: 'Quad.easeOut',
      onComplete: () => pulse.destroy()
    });

    let detectedAny = false;
    this.targets.forEach((t) => {
      if (t.collected) return;
      const dist = Phaser.Math.Distance.Between(cx, cy, t.cx, t.cy);
      if (dist <= scanRadius + this.cellSize * 0.65) {
        detectedAny = true;
        t.radarGlow.setFillStyle(t.type === 'artifact' ? 0xfacc15 : 0x38bdf8, 0.26);
        t.radarGlow.setStrokeStyle(2.2, t.type === 'artifact' ? 0xfacc15 : 0x38bdf8, 0.95);
        this.tweens.add({
          targets: t.radarGlow,
          alpha: { from: 1, to: 0.28 },
          duration: 1600,
          ease: 'Sine.easeOut'
        });
      }
    });

    if (detectedAny) {
      this.hintBanner.setText('📡 Сигнал пойман! Переключитесь на Кирку и вскройте зону!');
    } else {
      this.hintBanner.setText('📡 Здесь пусто. Просканируйте другой участок шурфа!');
    }
  }

  usePickaxeAt(col, row) {
    const centerCell = this.cells[`${col}_${row}`];
    if (!centerCell) return;

    if (centerCell.rockHp <= 0 && centerCell.dustHp > 0) {
      this.hintBanner.setText('🖌 Порода снята! Возьмите Кисть и сметите песок!');
      return;
    }

    if (centerCell.rockHp <= 0 && centerCell.dustHp <= 0) return;

    if (this.stamina <= 0) {
      this.promptOutOfStamina();
      return;
    }

    this.stamina = Math.max(0, this.stamina - 1);
    this.updateTopCounters();

    if (AudioManager.playScrape) AudioManager.playScrape(this.gear.pickaxeTier);

    const power = this.gear.pickaxeTier >= 3 ? 2 : 1;
    const splashCells = [centerCell];

    if (this.gear.pickaxeTier >= 2) {
      const neighbors = [
        this.cells[`${col + 1}_${row}`],
        this.cells[`${col - 1}_${row}`],
        this.cells[`${col}_${row + 1}`],
        this.cells[`${col}_${row - 1}`]
      ].filter((c) => c && c.rockHp > 0);

      if (neighbors.length > 0) {
        splashCells.push(neighbors[0]);
        if (this.gear.pickaxeTier >= 4 && neighbors.length > 1) {
          splashCells.push(neighbors[1]);
        }
      }
    }

    let brokeAnyRock = false;

    splashCells.forEach((cell, idx) => {
      if (cell.rockHp <= 0) return;
      const dmg = idx === 0 ? power : 1;
      cell.rockHp = Math.max(0, cell.rockHp - dmg);

      this.particles.setParticleTint(this.theme.rockTop);
      this.particles.emitParticleAt(cell.cx, cell.cy, 5);

      if (cell.rockHp <= 0) {
        brokeAnyRock = true;
        cell.rockGfx.destroy();
      } else {
        // Локальное подёргивание только самой плитки без тряски всего экрана
        this.tweens.add({
          targets: cell.rockGfx,
          x: { from: -2, to: 2 },
          duration: 35,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            if (cell.rockGfx && cell.rockGfx.active) cell.rockGfx.x = 0;
          }
        });
        cell.rockGfx.lineStyle(1.5, 0x0d0805, 0.85);
        cell.rockGfx.lineBetween(cell.cx - 10, cell.cy - 8, cell.cx + 8, cell.cy + 10);
        cell.rockGfx.lineBetween(cell.cx + 6, cell.cy - 9, cell.cx - 7, cell.cy + 6);
      }
    });

    // Едва заметный тактильный отклик только при расколе камня
    if (brokeAnyRock) {
      this.cameras.main.shake(45, 0.0007);
    }

    this.checkTargetsRevealed();

    if (this.stamina <= 0 && !this.isFinished) {
      this.time.delayedCall(350, () => this.checkCompletionOrStamina());
    }
  }

  useFieldBrushAt(col, row) {
    const radius = this.gear.fieldBrushTier >= 3 ? 1 : 0;
    let sweptAny = false;

    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const cell = this.cells[`${col + dc}_${row + dr}`];
        if (!cell || cell.rockHp > 0 || cell.dustHp <= 0) continue;

        cell.dustHp = 0;
        cell.sandGfx.destroy();
        sweptAny = true;

        this.particles.setParticleTint(this.theme.sandBase);
        this.particles.emitParticleAt(cell.cx, cell.cy, 4);
      }
    }

    if (sweptAny) {
      if (AudioManager.playBrush) AudioManager.playBrush(this.gear.fieldBrushTier);
      this.checkTargetsRevealed();
    } else {
      const centerCell = this.cells[`${col}_${row}`];
      if (centerCell && centerCell.rockHp > 0) {
        this.hintBanner.setText('⛏ Сначала расколите верхнюю породу Киркой!');
      }
    }
  }

  checkTargetsRevealed() {
    let newlyCollected = false;

    this.targets.forEach((t) => {
      if (t.collected) return;

      // Показываем спрайт находки только когда хотя бы 1 клетка над ним расчищена от породы
      if (!t.revealed) {
        const anyRockCleared = t.cells.some((key) => {
          const cell = this.cells[key];
          return cell && cell.rockHp <= 0;
        });
        if (anyRockCleared) {
          t.revealed = true;
          t.sprite.setVisible(true);
        }
      }

      const allClear = t.cells.every((key) => {
        const cell = this.cells[key];
        return cell && cell.rockHp <= 0 && cell.dustHp <= 0;
      });

      if (allClear) {
        t.collected = true;
        newlyCollected = true;
        t.radarGlow.destroy();

        if (AudioManager.playShine) AudioManager.playShine();

        if (t.type === 'artifact') {
          const isNewDiscovery = Storage.markArtifactDiscovered(this.regionId, t.template.id);
          Storage.addArtifactStock(this.regionId, t.template.id, 1);
          this.collectedArtifacts.push({
            template: t.template,
            isNewDiscovery
          });

          this.showFloatingLoot(
            t.cx,
            t.cy,
            isNewDiscovery ? `✨ НОВЫЙ: ${t.template.name}!` : `+1 ${t.template.name}`,
            isNewDiscovery ? '#facc15' : '#86efac'
          );
        } else if (t.type === 'lacquer') {
          this.collectedLacquer += 1;
          Storage.addKintsugiLacquer(1);
          this.showFloatingLoot(t.cx, t.cy, '+1 ✨ Лак Кинцуги!', '#fde047');
        } else {
          this.collectedCoins += t.coinAmount;
          Storage.addCoins(t.coinAmount);
          this.showFloatingLoot(t.cx, t.cy, `+${t.coinAmount} 🪙`, '#facc15');
        }

        this.tweens.add({
          targets: t.sprite,
          y: t.cy - 28,
          scale: t.sprite.scale * 1.22,
          alpha: 0,
          duration: 550,
          ease: 'Back.easeIn',
          onComplete: () => t.sprite.destroy()
        });
      }
    });

    if (newlyCollected) {
      this.updateTopCounters();
      const artifactsLeft = this.targets.filter((t) => t.type === 'artifact' && !t.collected).length;
      if (artifactsLeft === 0) {
        this.isFinished = true;
        this.time.delayedCall(650, () => this.showDigSummaryModal());
      }
    }
  }

  showFloatingLoot(x, y, text, color) {
    const lbl = this.add.text(x, y, text, {
      fontSize: '12.5px',
      fontFamily: this.FONT_UI,
      color,
      fontStyle: 'bold',
      stroke: '#0d0805',
      strokeThickness: 3,
      resolution: this.dpr
    }).setOrigin(0.5).setDepth(55);

    this.tweens.add({
      targets: lbl,
      y: y - 42,
      alpha: 0,
      duration: 1200,
      ease: 'Quad.easeOut',
      onComplete: () => lbl.destroy()
    });
  }

  updateTopCounters() {
    const totalArtifacts = this.targets.filter((t) => t.type === 'artifact').length;
    const foundArtifacts = this.collectedArtifacts.length;
    this.staminaTxt.setText(`⛏ Удары: ${this.stamina}/${this.maxStamina}`);
    this.radarTxt.setText(`📡 Радар: ${this.radarPulses}/${this.maxRadarPulses}`);
    this.foundCounterTxt.setText(`🏺 ${foundArtifacts}/${totalArtifacts}`);
  }

  checkCompletionOrStamina() {
    if (this.isFinished || this.isModalOpen) return;
    const artifactsLeft = this.targets.filter((t) => t.type === 'artifact' && !t.collected).length;
    if (artifactsLeft === 0) {
      this.isFinished = true;
      this.showDigSummaryModal();
      return;
    }

    const hasDustToSweep = Object.values(this.cells).some((c) => c.rockHp <= 0 && c.dustHp > 0);
    if (hasDustToSweep) {
      this.hintBanner.setText('🖌 Удары кирки на нуле, но можно смести пыль Кистью!');
      return;
    }

    this.promptOutOfStamina();
  }

  promptOutOfStamina() {
    if (this.isModalOpen || this.isFinished) return;
    this.isModalOpen = true;

    const { width, height } = this.scale;
    const dpr = this.dpr;
    const items = [];

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x080503, 0.88)
      .setDepth(100)
      .setInteractive();
    items.push(overlay);

    const boxW = width * 0.86;
    const boxH = this.adChargeUsed ? 196 : 246;
    const boxTop = height / 2 - boxH / 2;

    const bg = this.add.graphics().setDepth(101);
    bg.fillGradientStyle(0x24180f, 0x24180f, 0x160f0a, 0x160f0a, 0.99);
    bg.fillRoundedRect(width / 2 - boxW / 2, boxTop, boxW, boxH, 14);
    bg.lineStyle(1.5, 0xc89d54, 0.92);
    bg.strokeRoundedRect(width / 2 - boxW / 2, boxTop, boxW, boxH, 14);
    items.push(bg);

    const title = this.add.text(width / 2, boxTop + 28, '⛏ УДАРЫ КИРКИ ЗАКОНЧИЛИСЬ', {
      fontSize: '14.5px',
      fontFamily: this.FONT_UI,
      color: '#facc15',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(102);
    items.push(title);

    const desc = this.add.text(
      width / 2,
      boxTop + 76,
      'В шурфе ещё остались нераскрытые пласты.\nВозьмите +6 ударов кирки или завершите выезд.',
      {
        fontSize: '12px',
        fontFamily: this.FONT_UI,
        color: '#f5e6c8',
        align: 'center',
        wordWrap: { width: boxW - 28 },
        lineSpacing: 4,
        resolution: dpr
      }
    ).setOrigin(0.5).setDepth(102);
    items.push(desc);

    const btnW = boxW * 0.84;
    let curBtnY = boxTop + 134;

    if (!this.adChargeUsed) {
      const adGfx = this.add.graphics().setDepth(102);
      adGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
      adGfx.fillRoundedRect(width / 2 - btnW / 2, curBtnY - 19, btnW, 38, 9);
      adGfx.lineStyle(1, 0xfef08a, 0.95);
      adGfx.strokeRoundedRect(width / 2 - btnW / 2, curBtnY - 19, btnW, 38, 9);
      items.push(adGfx);

      const adTxt = this.add.text(width / 2, curBtnY, '🎬 +6 УДАРОВ КИРКИ (ДОП. ЗАРЯД)', {
        fontSize: '12px',
        fontFamily: this.FONT_UI,
        color: '#1a1004',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5).setDepth(103);
      items.push(adTxt);

      const adZone = this.add.zone(width / 2, curBtnY, btnW, 38)
        .setInteractive({ useHandCursor: true })
        .setDepth(105);
      items.push(adZone);

      adZone.on('pointerdown', () => {
        YandexSDK.showRewarded(() => {
          this.adChargeUsed = true;
          this.stamina = 6;
          this.updateTopCounters();
          items.forEach((o) => o && o.destroy && o.destroy());
          this.isModalOpen = false;
        });
      });

      curBtnY += 50;
    }

    const endGfx = this.add.graphics().setDepth(102);
    endGfx.fillStyle(0x332215, 1);
    endGfx.fillRoundedRect(width / 2 - btnW / 2, curBtnY - 18, btnW, 36, 9);
    endGfx.lineStyle(1, 0xc89d54, 0.9);
    endGfx.strokeRoundedRect(width / 2 - btnW / 2, curBtnY - 18, btnW, 36, 9);
    items.push(endGfx);

    const endTxt = this.add.text(width / 2, curBtnY, 'ЗАВЕРШИТЬ РАСКОПКИ', {
      fontSize: '12px',
      fontFamily: this.FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5).setDepth(103);
    items.push(endTxt);

    const endZone = this.add.zone(width / 2, curBtnY, btnW, 36)
      .setInteractive({ useHandCursor: true })
      .setDepth(105);
    items.push(endZone);

    endZone.on('pointerdown', () => {
      items.forEach((o) => o && o.destroy && o.destroy());
      this.isModalOpen = false;
      this.isFinished = true;
      this.showDigSummaryModal();
    });
  }

  showDigSummaryModal() {
    this.isModalOpen = true;
    const { width, height } = this.scale;
    const dpr = this.dpr;

    if (AudioManager.playShine) AudioManager.playShine();

    const digXp = 25 + this.collectedArtifacts.length * 15;
    Storage.addXP(digXp);

    this.add.rectangle(width / 2, height / 2, width, height, 0x080503, 0.90)
      .setDepth(120)
      .setInteractive();

    const boxW = width * 0.88;
    const boxH = 340;
    const card = this.add.container(width / 2, height / 2).setDepth(121);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x24180f, 0x24180f, 0x160f0a, 0x160f0a, 0.99);
    bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 14);
    bg.lineStyle(1.8, 0xfacc15, 0.95);
    bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 14);

    const title = this.add.text(0, -boxH / 2 + 28, '🧭 ИТОГИ ЭКСПЕДИЦИИ', {
      fontSize: '17px',
      fontFamily: this.FONT_TITLE,
      color: '#facc15',
      fontStyle: 'bold',
      letterSpacing: 1,
      resolution: dpr
    }).setOrigin(0.5);

    const lines = [];
    if (this.collectedArtifacts.length > 0) {
      this.collectedArtifacts.forEach((item) => {
        const tag = item.isNewDiscovery ? ' [НОВЫЙ В КАТАЛОГЕ!]' : '';
        lines.push(`🏺 ${item.template.name}${tag}`);
      });
    } else {
      lines.push('Артефакты остались глубже в породе.');
    }

    if (this.collectedCoins > 0) lines.push(`🪙 Найдено в тайнике: +${this.collectedCoins} монет`);
    if (this.collectedLacquer > 0) lines.push(`✨ Найден Лак Кинцуги: +${this.collectedLacquer} шт.`);
    lines.push(`📘 Полевой опыт: +${digXp} XP`);

    const summaryTxt = this.add.text(0, -28, lines.join('\n'), {
      fontSize: '12.5px',
      fontFamily: this.FONT_UI,
      color: '#fdf6e3',
      align: 'center',
      wordWrap: { width: boxW - 28 },
      lineSpacing: 6,
      resolution: dpr
    }).setOrigin(0.5);

    const btnW = boxW * 0.84;
    let doubled = false;

    const adY = boxH / 2 - 84;
    const adGfx = this.add.graphics();
    adGfx.fillGradientStyle(0xeab308, 0xeab308, 0xb47814, 0xb47814, 1);
    adGfx.fillRoundedRect(-btnW / 2, adY - 19, btnW, 38, 9);
    adGfx.lineStyle(1, 0xfef08a, 0.95);
    adGfx.strokeRoundedRect(-btnW / 2, adY - 19, btnW, 38, 9);

    const adTxt = this.add.text(0, adY, '🎬 УДВОИТЬ ДОБЫЧУ ЭКСПЕДИЦИИ', {
      fontSize: '12px',
      fontFamily: this.FONT_UI,
      color: '#1a1004',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const adZone = this.add.zone(0, adY, btnW, 38).setInteractive({ useHandCursor: true }).setDepth(125);
    adZone.on('pointerdown', () => {
      if (doubled) return;
      YandexSDK.showRewarded(() => {
        doubled = true;
        if (this.collectedCoins > 0) Storage.addCoins(this.collectedCoins);
        if (this.collectedLacquer > 0) Storage.addKintsugiLacquer(this.collectedLacquer);
        this.collectedArtifacts.forEach((item) => {
          Storage.addArtifactStock(this.regionId, item.template.id, 1);
        });
        if (AudioManager.playCoin) AudioManager.playCoin();
        adGfx.clear();
        adGfx.fillStyle(0x1e3322, 0.95);
        adGfx.fillRoundedRect(-btnW / 2, adY - 19, btnW, 38, 9);
        adTxt.setColor('#86efac');
        adTxt.setText('✓ ВСЯ ДОБЫЧА УДВОЕНА!');
      });
    });

    const backY = boxH / 2 - 34;
    const backGfx = this.add.graphics();
    backGfx.fillStyle(0x332215, 1);
    backGfx.fillRoundedRect(-btnW / 2, backY - 19, btnW, 38, 9);
    backGfx.lineStyle(1.2, 0xc89d54, 0.9);
    backGfx.strokeRoundedRect(-btnW / 2, backY - 19, btnW, 38, 9);

    const backTxt = this.add.text(0, backY, 'НА СКЛАД ЭПОХИ ›', {
      fontSize: '12.5px',
      fontFamily: this.FONT_UI,
      color: '#fdf6e3',
      fontStyle: 'bold',
      resolution: dpr
    }).setOrigin(0.5);

    const backZone = this.add.zone(0, backY, btnW, 38).setInteractive({ useHandCursor: true }).setDepth(125);
    backZone.on('pointerdown', () => {
      if (AudioManager.playClick) AudioManager.playClick();
      this.scene.start('EraSelectScene', { regionId: this.regionId });
    });

    card.add([bg, title, summaryTxt, adGfx, adTxt, adZone, backGfx, backTxt, backZone]);
  }

  createFieldToolTray(width, trayY, dpr) {
    const activeSkin = Storage.getActiveToolSkin();
    const tools = [
      { id: 'radar', type: 'radar', tier: this.gear.radarTier, label: 'Георадар' },
      { id: 'pickaxe', type: 'pickaxe', tier: this.gear.pickaxeTier, label: 'Кирка' },
      { id: 'fieldbrush', type: 'fieldbrush', tier: this.gear.fieldBrushTier, label: 'Кисть' }
    ];

    const trayBg = this.add.graphics().setDepth(40);
    trayBg.fillGradientStyle(0x24180f, 0x24180f, 0x120b07, 0x120b07, 0.96);
    trayBg.fillRect(0, trayY - 46, width, 100);
    trayBg.lineStyle(1.5, 0xc89d54, 0.7);
    trayBg.lineBetween(0, trayY - 46, width, trayY - 46);

    const slotW = 86;
    const spacing = 18;
    const totalW = tools.length * slotW + (tools.length - 1) * spacing;
    const startX = width / 2 - totalW / 2 + slotW / 2;

    this.fieldSlots = [];

    tools.forEach((t, idx) => {
      const sx = startX + idx * (slotW + spacing);
      const texKey = `dig_tool_${t.type}_t${t.tier}_${activeSkin}`;
      if (!this.textures.exists(texKey)) {
        const cvs = this.textures.createCanvas(texKey, 128, 128);
        const ctx = cvs.getContext();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        drawDetailedToolCanvas(ctx, t.type, t.tier, activeSkin, 128);
        cvs.refresh();
      }

      const cont = this.add.container(sx, trayY).setDepth(45);
      const gfx = this.add.graphics();
      const drawSlot = (selected) => {
        gfx.clear();
        gfx.fillGradientStyle(
          selected ? 0x452d18 : 0x261a10,
          selected ? 0x452d18 : 0x261a10,
          selected ? 0x2b1b0e : 0x170f09,
          selected ? 0x2b1b0e : 0x170f09,
          1
        );
        gfx.fillRoundedRect(-slotW / 2, -36, slotW, 72, 10);
        gfx.lineStyle(selected ? 2 : 1.2, selected ? 0xfacc15 : 0x8c6239, 0.95);
        gfx.strokeRoundedRect(-slotW / 2, -36, slotW, 72, 10);
      };
      drawSlot(false);

      const icon = this.add.image(0, -8, texKey).setDisplaySize(44, 44);
      const lbl = this.add.text(0, 23, t.label, {
        fontSize: '10.5px',
        fontFamily: this.FONT_UI,
        color: '#e6d5bc',
        fontStyle: 'bold',
        resolution: dpr
      }).setOrigin(0.5);

      const zone = this.add.zone(0, 0, slotW, 72).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        if (this.isModalOpen || this.isFinished) return;
        this.selectFieldTool(t.id, true);
      });

      cont.add([gfx, icon, lbl, zone]);
      this.fieldSlots.push({ id: t.id, cont, drawSlot, lbl, baseY: trayY });
    });
  }

  selectFieldTool(id, playSound = false) {
    this.activeTool = id;
    if (playSound && AudioManager.playClick) AudioManager.playClick();

    this.fieldSlots.forEach((s) => {
      const active = s.id === id;
      s.drawSlot(active);
      s.lbl.setColor(active ? '#facc15' : '#e6d5bc');
      this.tweens.add({
        targets: s.cont,
        y: active ? s.baseY - 5 : s.baseY,
        duration: 110,
        ease: 'Back.easeOut'
      });
    });

    if (id === 'radar') {
      this.hintBanner.setText('📡 Нажмите на участок шурфа, чтобы просканировать грунт');
    } else if (id === 'pickaxe') {
      this.hintBanner.setText('⛏ Бейте или ведите по твёрдой породе, чтобы вскрыть пласт');
    } else {
      this.hintBanner.setText('🖌 Сметайте песок и пыль с обнажённых находок (без траты ударов)');
    }
  }
}
