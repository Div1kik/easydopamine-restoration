export const TOOL_SKINS = [
  {
    id: 'default',
    name: 'Классика (Орех и сталь)',
    desc: 'Традиционный набор реставратора из тёмного ореха',
    priceCoins: 0,
    adsRequired: 0,
    palette: {
      woodDark: '#3e200d',
      woodLight: '#7c431e',
      metalDark: '#475569',
      metalLight: '#e2e8f0',
      accent: '#d97706',
      liquid: '#38bdf8',
      glow: 'rgba(255,255,255,0.35)'
    }
  },
  {
    id: 'gold',
    name: 'Императорское золото',
    desc: 'Литые позолоченные рукояти с хрустальным звоном',
    priceCoins: 1500,
    adsRequired: 0,
    palette: {
      woodDark: '#854d0e',
      woodLight: '#facc15',
      metalDark: '#b45309',
      metalLight: '#fef9c3',
      accent: '#ffffff',
      liquid: '#fbbf24',
      glow: 'rgba(250,204,21,0.5)'
    }
  },
  {
    id: 'jade',
    name: 'Нефритовый мастер',
    desc: 'Резной императорский нефрит с мягким шелестом',
    priceCoins: 2200,
    adsRequired: 2,
    palette: {
      woodDark: '#064e3b',
      woodLight: '#10b981',
      metalDark: '#047857',
      metalLight: '#a7f3d0',
      accent: '#facc15',
      liquid: '#34d399',
      glow: 'rgba(16,185,129,0.45)'
    }
  },
  {
    id: 'damascus',
    name: 'Дамасский сапфир',
    desc: 'Воронёная узорчатая сталь с сапфировой инкрустацией',
    priceCoins: 3000,
    adsRequired: 0,
    palette: {
      woodDark: '#1e1b4b',
      woodLight: '#4f46e5',
      metalDark: '#312e81',
      metalLight: '#c7d2fe',
      accent: '#38bdf8',
      liquid: '#818cf8',
      glow: 'rgba(99,102,241,0.45)'
    }
  },
  {
    id: 'ruby',
    name: 'Рубиновый алхимик',
    desc: 'Багровый обсидиан и рубины (доступно за рекламу)',
    priceCoins: null,
    adsRequired: 3,
    palette: {
      woodDark: '#4c0519',
      woodLight: '#e11d48',
      metalDark: '#881337',
      metalLight: '#fecdd3',
      accent: '#fde047',
      liquid: '#fb7185',
      glow: 'rgba(244,63,94,0.45)'
    }
  }
];

export function getSkinPalette(skinId) {
  const found = TOOL_SKINS.find((s) => s.id === skinId) || TOOL_SKINS[0];
  return found.palette;
}

export function drawDetailedToolCanvas(ctx, toolType, tier = 1, skinId = 'default', size = 128) {
  const p = getSkinPalette(skinId);
  const s = size / 128;
  ctx.save();
  ctx.clearRect(0, 0, size, size);
  ctx.scale(s, s);

  const roundRect = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  };

  if (toolType === 'scraper') {
    // Рукоять с объёмным градиентом и заклёпками
    const hGrad = ctx.createLinearGradient(54, 0, 74, 0);
    hGrad.addColorStop(0, p.woodDark);
    hGrad.addColorStop(0.45, p.woodLight);
    hGrad.addColorStop(1, p.woodDark);
    ctx.fillStyle = hGrad;
    roundRect(55, 52, 18, 66, 7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Заклёпки на рукояти
    ctx.fillStyle = p.accent;
    [68, 86, 104].forEach((ry) => {
      ctx.beginPath();
      ctx.arc(64, ry, 2.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Металлическая муфта (больстер)
    const mGrad = ctx.createLinearGradient(51, 0, 77, 0);
    mGrad.addColorStop(0, p.metalDark);
    mGrad.addColorStop(0.5, p.metalLight);
    mGrad.addColorStop(1, p.metalDark);
    ctx.fillStyle = mGrad;
    roundRect(52, 44, 24, 10, 3);
    ctx.fill();

    // Лезвие в зависимости от уровня (Tier 1..4)
    const bladeGrad = ctx.createLinearGradient(42, 10, 86, 44);
    bladeGrad.addColorStop(0, p.metalLight);
    bladeGrad.addColorStop(0.5, tier >= 3 ? '#f8fafc' : p.metalDark);
    bladeGrad.addColorStop(1, p.metalDark);
    ctx.fillStyle = bladeGrad;

    ctx.beginPath();
    if (tier === 1) {
      // Прямой шпатель-скребок
      ctx.moveTo(46, 14);
      ctx.lineTo(82, 14);
      ctx.lineTo(74, 44);
      ctx.lineTo(54, 44);
    } else if (tier === 2) {
      // Широкий трапециевидный латунный скребок
      ctx.moveTo(40, 12);
      ctx.lineTo(88, 12);
      ctx.lineTo(76, 44);
      ctx.lineTo(52, 44);
    } else if (tier === 3) {
      // Острый хирургический скальпель
      ctx.moveTo(64, 6);
      ctx.lineTo(82, 34);
      ctx.lineTo(74, 44);
      ctx.lineTo(54, 44);
      ctx.lineTo(46, 34);
    } else {
      // Прецизионный микро-резец с энергетической кромкой
      ctx.moveTo(64, 4);
      ctx.lineTo(86, 38);
      ctx.lineTo(74, 44);
      ctx.lineTo(54, 44);
      ctx.lineTo(42, 38);
    }
    ctx.closePath();
    ctx.fill();

    // Световой блик по режущей кромке
    ctx.strokeStyle = tier === 4 ? '#38bdf8' : '#ffffff';
    ctx.lineWidth = tier === 4 ? 3 : 2;
    ctx.beginPath();
    if (tier <= 2) {
      ctx.moveTo(43, 14);
      ctx.lineTo(85, 14);
    } else {
      ctx.moveTo(64, 6);
      ctx.lineTo(82, 35);
    }
    ctx.stroke();
  } else if (toolType === 'brush') {
    // Ручка кисти
    const hGrad = ctx.createLinearGradient(56, 0, 72, 0);
    hGrad.addColorStop(0, p.woodDark);
    hGrad.addColorStop(0.5, p.woodLight);
    hGrad.addColorStop(1, p.woodDark);
    ctx.fillStyle = hGrad;
    roundRect(57, 56, 14, 62, 6);
    ctx.fill();

    // Ободок с рёбрами жёсткости
    const mGrad = ctx.createLinearGradient(52, 0, 76, 0);
    mGrad.addColorStop(0, p.metalDark);
    mGrad.addColorStop(0.5, p.metalLight);
    mGrad.addColorStop(1, p.metalDark);
    ctx.fillStyle = mGrad;
    roundRect(52, 42, 24, 15, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(53, 47);
    ctx.lineTo(75, 47);
    ctx.moveTo(53, 52);
    ctx.lineTo(75, 52);
    ctx.stroke();

    // Пучок ворса
    const hairGrad = ctx.createLinearGradient(64, 8, 64, 42);
    if (tier === 4) {
      hairGrad.addColorStop(0, '#e0f2fe');
      hairGrad.addColorStop(0.6, '#38bdf8');
      hairGrad.addColorStop(1, '#0284c7');
    } else if (tier === 3) {
      hairGrad.addColorStop(0, '#fef9c3');
      hairGrad.addColorStop(0.5, '#f59e0b');
      hairGrad.addColorStop(1, '#78350f');
    } else {
      hairGrad.addColorStop(0, '#fde68a');
      hairGrad.addColorStop(0.6, '#b45309');
      hairGrad.addColorStop(1, '#451a03');
    }
    ctx.fillStyle = hairGrad;

    ctx.beginPath();
    if (tier >= 3) {
      // Веерная широкая кисть
      ctx.moveTo(52, 42);
      ctx.lineTo(76, 42);
      ctx.lineTo(96, 16);
      ctx.quadraticCurveTo(64, 6, 32, 16);
    } else {
      // Пышная круглая кисть
      ctx.moveTo(52, 42);
      ctx.lineTo(76, 42);
      ctx.bezierCurveTo(84, 24, 78, 10, 64, 8);
      ctx.bezierCurveTo(50, 10, 44, 24, 52, 42);
    }
    ctx.closePath();
    ctx.fill();

    // Прорисовка отдельных ворсинок
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.2;
    [-10, -4, 4, 10].forEach((dx) => {
      ctx.beginPath();
      ctx.moveTo(64 + dx * 0.6, 40);
      ctx.lineTo(64 + dx * 1.4, 14);
      ctx.stroke();
    });
  } else if (toolType === 'solvent') {
    // Стеклянный корпус флакона
    const glassGrad = ctx.createLinearGradient(38, 0, 90, 0);
    glassGrad.addColorStop(0, 'rgba(148,163,184,0.45)');
    glassGrad.addColorStop(0.35, 'rgba(255,255,255,0.75)');
    glassGrad.addColorStop(0.7, 'rgba(148,163,184,0.4)');
    glassGrad.addColorStop(1, 'rgba(71,85,105,0.6)');
    ctx.fillStyle = glassGrad;
    roundRect(40, 38, 48, 76, 12);
    ctx.fill();
    ctx.strokeStyle = p.metalLight;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Светящийся реагент внутри колбы
    ctx.fillStyle = tier === 4 ? '#818cf8' : p.liquid;
    roundRect(44, 58, 40, 52, 9);
    ctx.fill();

    // Мениск жидкости и пузырьки
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(64, 58, 19, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(54, 82, 2.5, 0, Math.PI * 2);
    ctx.arc(70, 94, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Стеклянный вертикальный блик
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    roundRect(46, 44, 5, 62, 2.5);
    ctx.fill();

    // Горлышко и распылитель
    ctx.fillStyle = p.metalDark;
    roundRect(54, 24, 20, 14, 3);
    ctx.fill();
    ctx.fillStyle = p.accent;
    roundRect(48, 14, 32, 10, 4);
    ctx.fill();
    // Носик спрея
    ctx.fillRect(76, 16, 10, 6);
  } else if (toolType === 'glue') {
    // Тюбик реставрационного клея
    const tubeGrad = ctx.createLinearGradient(42, 0, 86, 0);
    tubeGrad.addColorStop(0, p.woodDark);
    tubeGrad.addColorStop(0.5, p.woodLight);
    tubeGrad.addColorStop(1, p.woodDark);
    ctx.fillStyle = tubeGrad;
    roundRect(44, 42, 40, 72, 10);
    ctx.fill();
    ctx.strokeStyle = p.metalLight;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Этикетка на тюбике
    ctx.fillStyle = p.accent;
    roundRect(50, 58, 28, 36, 5);
    ctx.fill();

    // Колпачок и тонкий носик-дозатор
    ctx.fillStyle = p.metalLight;
    roundRect(54, 28, 20, 14, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(58, 28);
    ctx.lineTo(70, 28);
    ctx.lineTo(65, 8);
    ctx.lineTo(63, 8);
    ctx.closePath();
    ctx.fill();

    // Капля клея на кончике
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(64, 7, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (toolType === 'polish') {
    // Объёмная полировочная подушечка / футляр с воском
    const padGrad = ctx.createRadialGradient(54, 52, 8, 64, 66, 44);
    padGrad.addColorStop(0, p.metalLight);
    padGrad.addColorStop(0.55, p.woodLight);
    padGrad.addColorStop(1, p.woodDark);
    ctx.fillStyle = padGrad;
    roundRect(32, 42, 64, 64, 18);
    ctx.fill();
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Декоративная прострочка по периметру бархотки
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    roundRect(38, 48, 52, 52, 14);
    ctx.stroke();
    ctx.setLineDash([]);

    // Блик / кристалл полировки сверху
    if (tier >= 3) {
      ctx.fillStyle = tier === 4 ? '#38bdf8' : '#fef08a';
      ctx.beginPath();
      ctx.moveTo(64, 14);
      ctx.lineTo(78, 30);
      ctx.lineTo(64, 44);
      ctx.lineTo(50, 30);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(58, 64, 16, Math.PI * 1.1, Math.PI * 1.65);
      ctx.stroke();
    }
  }

  ctx.restore();
}
