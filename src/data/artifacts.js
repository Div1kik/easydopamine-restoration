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
  // --- ДРЕВНИЙ ЕГИПЕТ (5 шт.) ---
  { id: 'egypt_scarab', regionId: 'egypt', name: 'Золотой скарабей', description: 'Священный амулет возрождения с лазуритом.', textureKey: 'art_egypt_scarab', marketValue: 180 },
  { id: 'egypt_mask', regionId: 'egypt', name: 'Маска Тутанхамона', description: 'Чеканный золотой венец правителя Нила.', textureKey: 'art_egypt_mask', marketValue: 500 },
  { id: 'egypt_ankh', regionId: 'egypt', name: 'Обрядовый Анкх', description: 'Бронзовый ключ вечной жизни с рубином.', textureKey: 'art_egypt_ankh', marketValue: 240 },
  { id: 'egypt_bastet', regionId: 'egypt', name: 'Статуэтка Бастет', description: 'Черная базальтовая кошка с золотым колье.', textureKey: 'art_egypt_bastet', marketValue: 320 },
  { id: 'egypt_canopic', regionId: 'egypt', name: 'Алебастровая канопа', description: 'Сосуд с резным соколиным навершием.', textureKey: 'art_egypt_canopic', marketValue: 280 },

  // --- АНТИЧНОСТЬ (5 шт.) ---
  { id: 'antique_amphora', regionId: 'antique', name: 'Аттическая амфора', description: 'Двуручная керамика с чёрнофигурной росписью.', textureKey: 'art_antique_amphora', marketValue: 220 },
  { id: 'antique_helmet', regionId: 'antique', name: 'Шлем спартанца', description: 'Коринфская литая бронза с алым гребнем.', textureKey: 'art_antique_helmet', marketValue: 450 },
  { id: 'antique_coin', regionId: 'antique', name: 'Афинская тетрадрахма', description: 'Серебряная монета с чеканным профилем совы.', textureKey: 'art_antique_coin', marketValue: 160 },
  { id: 'antique_harp', regionId: 'antique', name: 'Кифара Аполлона', description: 'Инкрустированная перламутром кипарисовая лира.', textureKey: 'art_antique_harp', marketValue: 360 },
  { id: 'antique_statue', regionId: 'antique', name: 'Мраморный бюст', description: 'Фрагмент античной статуи философа.', textureKey: 'art_antique_statue', marketValue: 400 },

  // --- ЕВРОПА / СРЕДНЕВЕКОВЬЕ (5 шт.) ---
  { id: 'europe_grail', regionId: 'europe', name: 'Кубок тамплиера', description: 'Позолоченный серебряный потир с эмалью.', textureKey: 'art_europe_grail', marketValue: 480 },
  { id: 'europe_sword', regionId: 'europe', name: 'Рыцарский бастард', description: 'Дамасский клинок с долом и витым эфесом.', textureKey: 'art_europe_sword', marketValue: 420 },
  { id: 'europe_crown', regionId: 'europe', name: 'Корона монарха', description: 'Золотой венец с изумрудами и геральдикой.', textureKey: 'art_europe_crown', marketValue: 550 },
  { id: 'europe_shield', regionId: 'europe', name: 'Геральдический щит', description: 'Кованый щит с гербом золотого льва.', textureKey: 'art_europe_shield', marketValue: 280 },
  { id: 'europe_book', regionId: 'europe', name: 'Фолиант алхимика', description: 'Кожаный переплёт с латунными коваными замками.', textureKey: 'art_europe_book', marketValue: 320 },

  // --- ЯПОНИЯ (5 шт.) ---
  { id: 'japan_mask', regionId: 'japan', name: 'Маска Мэнгу', description: 'Грозная боевая личина самурая эпохи Эдо.', textureKey: 'art_japan_mask', marketValue: 410 },
  { id: 'japan_katana', regionId: 'japan', name: 'Катана мастера', description: 'Клинок с линией закалки хамон и цубой.', textureKey: 'art_japan_katana', marketValue: 490 },
  { id: 'japan_fan', regionId: 'japan', name: 'Боевой веер гунпай', description: 'Лакированное дерево с золотым солнцем.', textureKey: 'art_japan_fan', marketValue: 270 },
  { id: 'japan_netsuke', regionId: 'japan', name: 'Нэцкэ дракона', description: 'Миниатюрная резная фигурка из самшита.', textureKey: 'art_japan_netsuke', marketValue: 290 },
  { id: 'japan_tea', regionId: 'japan', name: 'Чаша Тэммоку', description: 'Керамика с кристаллическим масляным блеском.', textureKey: 'art_japan_tea', marketValue: 340 },

  // --- АЦТЕКИ (5 шт.) ---
  { id: 'aztec_idol', regionId: 'aztec', name: 'Нефритовый идол', description: 'Тотем бога дождя Тлалока из цельного камня.', textureKey: 'art_aztec_idol', marketValue: 450 },
  { id: 'aztec_mask', regionId: 'aztec', name: 'Бирюзовая личина', description: 'Ритуальная маска из пластин бирюзы и лавы.', textureKey: 'art_aztec_mask', marketValue: 480 },
  { id: 'aztec_calendar', regionId: 'aztec', name: 'Камень Солнца', description: 'Базальтовый диск с высеченным календарем.', textureKey: 'art_aztec_calendar', marketValue: 530 },
  { id: 'aztec_dagger', regionId: 'aztec', name: 'Обсидиановый кинжал', description: 'Острейшее вулканическое стекло в золоте.', textureKey: 'art_aztec_dagger', marketValue: 370 },
  { id: 'aztec_vessel', regionId: 'aztec', name: 'Сосуд ягуара', description: 'Обрядовая чаша с полихромной росписью.', textureKey: 'art_aztec_vessel', marketValue: 330 },

  // --- ВИКИНГИ (5 шт.) ---
  { id: 'viking_axe', regionId: 'vikings', name: 'Бородатый топор', description: 'Северная секира с травлеными рунами победы.', textureKey: 'art_viking_axe', marketValue: 430 },
  { id: 'viking_brooch', regionId: 'vikings', name: 'Фибула ярла', description: 'Серебряная подковообразная застёжка с плетением.', textureKey: 'art_viking_brooch', marketValue: 280 },
  { id: 'viking_horn', regionId: 'vikings', name: 'Рог для эля', description: 'Бычий рог с чеканной серебряной оправой.', textureKey: 'art_viking_horn', marketValue: 210 },
  { id: 'viking_mjolnir', regionId: 'vikings', name: 'Молот Тора', description: 'Оберег защитника с руническим узором.', textureKey: 'art_viking_mjolnir', marketValue: 360 },
  { id: 'viking_ship', regionId: 'vikings', name: 'Штевень драккара', description: 'Резная дубовая голова дракона с корабля.', textureKey: 'art_viking_ship', marketValue: 500 },

  // --- РЕНЕССАНС (5 шт.) ---
  { id: 'renaissance_astrolabe', regionId: 'renaissance', name: 'Астролябия мастера', description: 'Навигационный диск из резной латуни.', textureKey: 'art_renaissance_astrolabe', marketValue: 510 },
  { id: 'renaissance_mona', regionId: 'renaissance', name: 'Портрет флорентийки', description: 'Масляная живопись на тополиной доске.', textureKey: 'art_renaissance_mona', marketValue: 580 },
  { id: 'renaissance_clock', regionId: 'renaissance', name: 'Нюрнбергское яйцо', description: 'Одни из первых карманных пружинных часов.', textureKey: 'art_renaissance_clock', marketValue: 560 },
  { id: 'renaissance_compass', regionId: 'renaissance', name: 'Морской компас', description: 'Карданный подвес в ореховом ларце.', textureKey: 'art_renaissance_compass', marketValue: 390 },
  { id: 'renaissance_goblet', regionId: 'renaissance', name: 'Венецианское стекло', description: 'Филигранный кубок с витыми стеклянными нитями.', textureKey: 'art_renaissance_goblet', marketValue: 440 }
];

// ПРОЦЕДУРНЫЙ ГЕНЕРАТОР ЗАДАЧ (создает уникальный сценарий очистки каждый раз)
export function generateArtifactOrder(preferredRegion, recentHistory = [], requestedTemplateId = null) {
  let baseTemplate = null;
  if (requestedTemplateId) {
    baseTemplate = ARTIFACT_TEMPLATES.find(t => t.id === requestedTemplateId);
  }
  if (!baseTemplate) {
    const regionPool = ARTIFACT_TEMPLATES.filter(t => t.regionId === preferredRegion);
    const pool = regionPool.length > 0 ? regionPool : ARTIFACT_TEMPLATES;
    baseTemplate = pool[Math.floor(Math.random() * pool.length)];
  }

  // Базовые пресеты инструментов для очистки
  const taskScraper = { name: 'Сколоть окаменевший пласт породы', requiredTool: 'tool_scraper', color: 0x78562d };
  const taskBrush   = { name: 'Смести минеральную пыль и песок', requiredTool: 'tool_brush', color: 0xa89f81 };
  const taskSolvent = { name: 'Смыть химические окислы растворителем', requiredTool: 'tool_solvent', color: 0x2a593f };
  const taskPolish  = { name: 'Натереть воском и навести глянец', requiredTool: 'tool_polish', color: 0x181818 };

  const taskBreak = {
    name: 'Закрепить отколовшийся фрагмент',
    type: 'break_and_assemble',
    requiredTool: 'tool_glue',
    shardTexture: baseTemplate.textureKey
  };

  // Процедурные архетипы реставрации: замша ВСЕГДА идёт только на финише
  const roll = Math.random();
  let chosenTasks = [];

  if (roll < 0.30) {
    // 1. Драматический скол: смели пыль кистью -> откололась деталь -> приклеили -> отполировали замшей
    chosenTasks = [taskBrush, taskBreak, taskPolish];
  } else if (roll < 0.60) {
    // 2. Древняя окаменелость: сняли пласт скребком -> растворили въевшуюся грязь спреем -> финишная замша
    chosenTasks = [taskScraper, taskSolvent, taskPolish];
  } else if (roll < 0.85) {
    // 3. Полная музейная чистка: скребок -> мягкая кисть -> финишная замша
    chosenTasks = [taskScraper, taskBrush, taskPolish];
  } else {
    // 4. Глубокая реставрация: скребок -> растворитель -> клей отколовшегося фрагмента -> финишная замша
    chosenTasks = [taskScraper, taskSolvent, taskBreak, taskPolish];
  }

  return {
    ...baseTemplate,
    instanceId: `art_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    tasks: chosenTasks
  };
}
