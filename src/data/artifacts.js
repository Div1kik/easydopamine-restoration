export const REGIONS = [
  { id: 'egypt', name: 'Древний Египет' },
  { id: 'antique', name: 'Античность' },
  { id: 'europe', name: 'Европа' },
  { id: 'japan', name: 'Япония' },
  { id: 'aztec', name: 'Ацтеки' },
  { id: 'vikings', name: 'Викинги' },
  { id: 'renaissance', name: 'Ренессанс' }
];

export const ARTIFACT_TEMPLATES = [
  // --- 1. ДРЕВНИЙ ЕГИПЕТ (Старт: 40 - 110 монет)
  {
    id: 'egypt_scarab',
    regionId: 'egypt',
    name: 'Золотой скарабей',
    description: 'Священный амулет возрождения с лазуритом.',
    textureKey: 'art_egypt_scarab',
    marketValue: 45
  },
  {
    id: 'egypt_ankh',
    regionId: 'egypt',
    name: 'Обрядовый Анкх',
    description: 'Бронзовый ключ вечной жизни с рубином.',
    textureKey: 'art_egypt_ankh',
    marketValue: 65
  },
  {
    id: 'egypt_bastet',
    regionId: 'egypt',
    name: 'Статуэтка Бастет',
    description: 'Черная базальтовая кошка с золотым колье.',
    textureKey: 'art_egypt_bastet',
    marketValue: 80
  },
  {
    id: 'egypt_canopic',
    regionId: 'egypt',
    name: 'Алебастровая канопа',
    description: 'Сосуд с резным соколиным навершием.',
    textureKey: 'art_egypt_canopic',
    marketValue: 95
  },
  {
    id: 'egypt_mask',
    regionId: 'egypt',
    name: 'Маска Тутанхамона',
    description: 'Чеканный золотой венец правителя Нила.',
    textureKey: 'art_egypt_mask',
    marketValue: 110
  },

  // --- 2. АНТИЧНОСТЬ (90 - 220 монет)
  {
    id: 'antique_coin',
    regionId: 'antique',
    name: 'Золотой венок триумфатора',
    description: 'Античный золотой венец из чеканных лавровых листьев.',
    textureKey: 'art_antique_laurel',
    marketValue: 95
  },
  {
    id: 'antique_amphora',
    regionId: 'antique',
    name: 'Аттическая амфора',
    description: 'Двуручная керамика с чернофигурной росписью.',
    textureKey: 'art_antique_amphora',
    marketValue: 130
  },
  {
    id: 'antique_harp',
    regionId: 'antique',
    name: 'Помпейская мозаика',
    description: 'Фрагмент античного панно из цветной смальты.',
    textureKey: 'art_antique_mosaic',
    marketValue: 165
  },
  {
    id: 'antique_statue',
    regionId: 'antique',
    name: 'Мраморный бюст',
    description: 'Фрагмент античной статуи философа.',
    textureKey: 'art_antique_bust',
    marketValue: 190
  },
  {
    id: 'antique_helmet',
    regionId: 'antique',
    name: 'Шлем спартанца',
    description: 'Коринфская литая бронза с алым гребнем.',
    textureKey: 'art_antique_helmet',
    marketValue: 220
  },

  // --- 3. ЕВРОПА / СРЕДНЕВЕКОВЬЕ (180 - 380 монет)
  {
    id: 'europe_shield',
    regionId: 'europe',
    name: 'Геральдический щит',
    description: 'Кованый щит с гербом золотого льва.',
    textureKey: 'art_europe_shield',
    marketValue: 180
  },
  {
    id: 'europe_book',
    regionId: 'europe',
    name: 'Топфхельм крестоносца',
    description: 'Тяжёлый рыцарский шлем из кованой стали.',
    textureKey: 'art_europe_helm',
    marketValue: 220
  },
  {
    id: 'europe_sword',
    regionId: 'europe',
    name: 'Рыцарский бастард',
    description: 'Дамасский клинок с долом и витым эфесом.',
    textureKey: 'art_europe_sword',
    marketValue: 270
  },
  {
    id: 'europe_grail',
    regionId: 'europe',
    name: 'Кубок тамплиера',
    description: 'Позолоченный серебряный потир с эмалью.',
    textureKey: 'art_europe_chalice',
    marketValue: 310
  },
  {
    id: 'europe_crown',
    regionId: 'europe',
    name: 'Печать суверена',
    description: 'Золотая королевская матрица с гербовой гравировкой.',
    textureKey: 'art_europe_seal',
    marketValue: 380
  },

  // --- 4. ЯПОНИЯ (320 - 650 монет)
  {
    id: 'japan_fan',
    regionId: 'japan',
    name: 'Боевой веер гунпай',
    description: 'Лакированное дерево с золотым солнцем.',
    textureKey: 'art_japan_fan',
    marketValue: 320
  },
  {
    id: 'japan_netsuke',
    regionId: 'japan',
    name: 'Нэцкэ дракона',
    description: 'Миниатюрная резная фигурка из самшита.',
    textureKey: 'art_japan_netsuke',
    marketValue: 390
  },
  {
    id: 'japan_tea',
    regionId: 'japan',
    name: 'Чаша Тэммоку',
    description: 'Керамика с кристаллическим масляным блеском.',
    textureKey: 'art_japan_chawan',
    marketValue: 460
  },
  {
    id: 'japan_mask',
    regionId: 'japan',
    name: 'Маска Мэнгу',
    description: 'Грозная боевая личина самурая эпохи Эдо.',
    textureKey: 'art_japan_mask',
    marketValue: 540
  },
  {
    id: 'japan_katana',
    regionId: 'japan',
    name: 'Цуба сёгуна',
    description: 'Ажурная гарда катаны из вороненой стали с золотой всечкой.',
    textureKey: 'art_japan_tsuba',
    marketValue: 650
  },

  // --- 5. АЦТЕКИ (550 - 1100 монет)
  {
    id: 'aztec_vessel',
    regionId: 'aztec',
    name: 'Сосуд ягуара',
    description: 'Обрядовая чаша с полихромной росписью.',
    textureKey: 'art_aztec_vessel',
    marketValue: 550
  },
  {
    id: 'aztec_dagger',
    regionId: 'aztec',
    name: 'Обсидиановый кинжал',
    description: 'Острейшее вулканическое стекло в золоте.',
    textureKey: 'art_aztec_dagger',
    marketValue: 680
  },
  {
    id: 'aztec_idol',
    regionId: 'aztec',
    name: 'Нефритовый идол',
    description: 'Тотемический бог дождя Тлалок из цельного камня.',
    textureKey: 'art_aztec_idol',
    marketValue: 800
  },
  {
    id: 'aztec_mask',
    regionId: 'aztec',
    name: 'Бирюзовая личина',
    description: 'Ритуальная маска из пластин бирюзы и лавы.',
    textureKey: 'art_aztec_mask',
    marketValue: 940
  },
  {
    id: 'aztec_calendar',
    regionId: 'aztec',
    name: 'Камень Солнца',
    description: 'Базальтовый диск с высеченным календарем.',
    textureKey: 'art_aztec_calendar',
    marketValue: 1100
  },

  // --- 6. ВИКИНГИ (900 - 1800 монет)
  {
    id: 'viking_horn',
    regionId: 'vikings',
    name: 'Рог для эля',
    description: 'Бычий рог с чеканной серебряной оправой.',
    textureKey: 'art_viking_horn',
    marketValue: 900
  },
  {
    id: 'viking_brooch',
    regionId: 'vikings',
    name: 'Фибула ярла',
    description: 'Серебряная подковообразная застёжка с плетением.',
    textureKey: 'art_viking_brooch',
    marketValue: 1100
  },
  {
    id: 'viking_axe',
    regionId: 'vikings',
    name: 'Бородатый топор',
    description: 'Северная секира с травлеными рунами победы.',
    textureKey: 'art_viking_axe',
    marketValue: 1350
  },
  {
    id: 'viking_mjolnir',
    regionId: 'vikings',
    name: 'Молот Тора',
    description: 'Оберег защитника с руническим узором.',
    textureKey: 'art_viking_mjolnir',
    marketValue: 1550
  },
  {
    id: 'viking_ship',
    regionId: 'vikings',
    name: 'Штевень драккара',
    description: 'Резная дубовая голова дракона с корабля.',
    textureKey: 'art_viking_ship',
    marketValue: 1800
  },

  // --- 7. РЕНЕССАНС (1500 - 3200 монет)
  {
    id: 'renaissance_compass',
    regionId: 'renaissance',
    name: 'Морской компас',
    description: 'Карданный подвес в ореховом ларце.',
    textureKey: 'art_renaissance_compass',
    marketValue: 1500
  },
  {
    id: 'renaissance_goblet',
    regionId: 'renaissance',
    name: 'Венецианское стекло',
    description: 'Филигранный кубок с витыми стеклянными нитями.',
    textureKey: 'art_renaissance_goblet',
    marketValue: 1800
  },
  {
    id: 'renaissance_astrolabe',
    regionId: 'renaissance',
    name: 'Астролябия мастера',
    description: 'Навигационный диск из резной латуни.',
    textureKey: 'art_renaissance_astrolabe',
    marketValue: 2200
  },
  {
    id: 'renaissance_clock',
    regionId: 'renaissance',
    name: 'Нюрнбергское яйцо',
    description: 'Одни из первых карманных пружинных часов.',
    textureKey: 'art_renaissance_clock',
    marketValue: 2650
  },
  {
    id: 'renaissance_mona',
    regionId: 'renaissance',
    name: 'Портрет флорентийки',
    description: 'Масляная живопись на тополиной доске.',
    textureKey: 'art_renaissance_mona',
    marketValue: 3200
  }
];

export function generateArtifactOrder(preferredRegion = 'egypt', recentHistory = [], requestedTemplateId = null) {
  let baseTemplate = null;

  if (requestedTemplateId) {
    baseTemplate = ARTIFACT_TEMPLATES.find(t => t.id === requestedTemplateId);
  }

  if (!baseTemplate) {
    const regionPool = ARTIFACT_TEMPLATES.filter(t => t.regionId === preferredRegion);
    const pool = regionPool.length > 0 ? regionPool : ARTIFACT_TEMPLATES;
    baseTemplate = pool[Math.floor(Math.random() * pool.length)];
  }

  const taskScraper = {
    name: 'Сколоть окаменевший пласт породы',
    hint: 'Сколоть окаменевший пласт породы',
    requiredTool: 'tool_scraper',
    color: 0x78562d
  };

  const taskBrush = {
    name: 'Смести минеральную пыль и песок',
    hint: 'Смести минеральную пыль и песок',
    requiredTool: 'tool_brush',
    color: 0xa89f81
  };

  const taskSolvent = {
    name: 'Смыть химические окислы растворителем',
    hint: 'Смыть химические окислы растворителем',
    requiredTool: 'tool_solvent',
    color: 0x2a593f
  };

  const taskPolish = {
    name: 'Натереть воском и навести глянец',
    hint: 'Натереть воском и навести глянец',
    requiredTool: 'tool_polish',
    color: 0x181818
  };

  const taskBreak = {
    name: 'Закрепить отколовшийся фрагмент',
    hint: 'Закрепить отколовшийся фрагмент',
    type: 'break_and_assemble',
    requiredTool: 'tool_glue',
    shardTexture: baseTemplate.textureKey
  };

  const roll = Math.random();
  let chosenTasks = [];

  if (roll < 0.30) {
    chosenTasks = [taskBrush, taskBreak, taskPolish];
  } else if (roll < 0.60) {
    chosenTasks = [taskScraper, taskSolvent, taskPolish];
  } else if (roll < 0.85) {
    chosenTasks = [taskScraper, taskBrush, taskPolish];
  } else {
    chosenTasks = [taskScraper, taskSolvent, taskBreak, taskPolish];
  }

  return {
    ...baseTemplate,
    instanceId: `art_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    tasks: chosenTasks
  };
}
