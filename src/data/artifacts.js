export const REGIONS = [
  { id: 'egypt', name: 'Древний Египет', accentColor: '#d4af37', location: 'Долина Царей' },
  { id: 'greece', name: 'Античное Средиземноморье', accentColor: '#38bdf8', location: 'Акрополь' },
  { id: 'europe', name: 'Средневековая Европа', accentColor: '#a855f7', location: 'Рейнские графства' },
  { id: 'japan', name: 'Феодальная Япония', accentColor: '#ef4444', location: 'Храмы Киото' },
  { id: 'mesoamerica', name: 'Мезоамерика (Майя)', accentColor: '#10b981', location: 'Сельва Юкатана' },
  { id: 'viking', name: 'Эпоха Викингов', accentColor: '#64748b', location: 'Фьорды Скандинавии' },
  { id: 'china', name: 'Императорский Китай', accentColor: '#f59e0b', location: 'Династия Тан' }
];

export const ERAS = REGIONS;

export const ARTIFACT_TEMPLATES = [
  // --- 1. ЕГИПЕТ (5 шт) ---
  {
    templateId: 'egypt_scarab',
    regionId: 'egypt',
    name: 'Золотой скарабей',
    museumDesc: 'Священный символ возрождения с лазуритом.',
    textureKey: 'art_egypt_scarab',
    baseValue: 180,
    canBreak: true,
    breakType: 'shard_scarab_wing',
    breakTitle: 'Припаять отломанное крыло'
  },
  {
    templateId: 'egypt_mask',
    regionId: 'egypt',
    name: 'Маска Тутанхамона',
    museumDesc: 'Чеканный венец из золота и бирюзы.',
    textureKey: 'art_egypt_mask',
    baseValue: 250,
    canBreak: true,
    breakType: 'shard_mask_beard',
    breakTitle: 'Склеить отколотую бородку'
  },
  {
    templateId: 'egypt_ankh',
    regionId: 'egypt',
    name: 'Обрядовый Анкх',
    museumDesc: 'Бронзовый крест вечной жизни фараонов.',
    textureKey: 'art_egypt_ankh',
    baseValue: 200,
    canBreak: false
  },
  {
    templateId: 'egypt_cat',
    regionId: 'egypt',
    name: 'Статуэтка Бастет',
    museumDesc: 'Бронзовая священная кошка с золотыми серьгами.',
    textureKey: 'art_egypt_cat',
    baseValue: 220,
    canBreak: true,
    breakType: 'shard_cat_ear',
    breakTitle: 'Прикрепить отломанное ухо'
  },
  {
    templateId: 'egypt_canopic',
    regionId: 'egypt',
    name: 'Алебастровая канопа',
    museumDesc: 'Погребальный сосуд с головой сокола Гора.',
    textureKey: 'art_egypt_canopic',
    baseValue: 210,
    canBreak: false
  },

  // --- 2. ГРЕЦИЯ (5 шт) ---
  {
    templateId: 'greece_amphora',
    regionId: 'greece',
    name: 'Аттическая амфора',
    museumDesc: 'Терракотовый сосуд с чернофигурной росписью.',
    textureKey: 'art_greece_amphora',
    baseValue: 210,
    canBreak: true,
    breakType: 'shard_amphora',
    breakTitle: 'Склеить ручку горлышка'
  },
  {
    templateId: 'greece_helmet',
    regionId: 'greece',
    name: 'Коринфский шлем',
    museumDesc: 'Боевой бронзовый шлем спартанца.',
    textureKey: 'art_greece_helmet',
    baseValue: 260,
    canBreak: true,
    breakType: 'shard_helmet_cheek',
    breakTitle: 'Установить нащечник'
  },
  {
    templateId: 'greece_coin',
    regionId: 'greece',
    name: 'Тетрадрахма Афин',
    museumDesc: 'Серебряная монета со священной совой.',
    textureKey: 'art_greece_coin',
    baseValue: 170,
    canBreak: false
  },
  {
    templateId: 'greece_kylix',
    regionId: 'greece',
    name: 'Краснофигурный килик',
    museumDesc: 'Чаша для симпосиев с изображением Диониса.',
    textureKey: 'art_greece_kylix',
    baseValue: 195,
    canBreak: true,
    breakType: 'shard_kylix_handle',
    breakTitle: 'Приклеить ручку чаши'
  },
  {
    templateId: 'greece_shield',
    regionId: 'greece',
    name: 'Щит Гоплита (Гоплон)',
    museumDesc: 'Круглый деревянный щит, обитый бронзой.',
    textureKey: 'art_greece_shield',
    baseValue: 240,
    canBreak: false
  },

  // --- 3. ЕВРОПА (5 шт) ---
  {
    templateId: 'europe_sword',
    regionId: 'europe',
    name: 'Меч крестоносца',
    museumDesc: 'Полуторный боевой клинок с позолоченным яблоком.',
    textureKey: 'art_europe_sword',
    baseValue: 260,
    canBreak: true,
    breakType: 'shard_sword_tip',
    breakTitle: 'Припаять острие клинка'
  },
  {
    templateId: 'europe_chalice',
    regionId: 'europe',
    name: 'Готический потир',
    museumDesc: 'Церемониальный кубок с рубином.',
    textureKey: 'art_europe_chalice',
    baseValue: 230,
    canBreak: true,
    breakType: 'shard_chalice_gem',
    breakTitle: 'Вклеить выпавший самоцвет'
  },
  {
    templateId: 'europe_shield',
    regionId: 'europe',
    name: 'Рыцарский тарч',
    museumDesc: 'Турнирный щит с алым крестом.',
    textureKey: 'art_europe_shield',
    baseValue: 220,
    canBreak: false
  },
  {
    templateId: 'europe_crown',
    regionId: 'europe',
    name: 'Корона Карла Великого',
    museumDesc: 'Золотой венец с жемчугом и эмалями.',
    textureKey: 'art_europe_crown',
    baseValue: 290,
    canBreak: true,
    breakType: 'shard_crown_cross',
    breakTitle: 'Закрепить верхний крест'
  },
  {
    templateId: 'europe_book',
    regionId: 'europe',
    name: 'Манускрипт в окладе',
    museumDesc: 'Старинный фолиант в кожаном переплете с тиснением.',
    textureKey: 'art_europe_book',
    baseValue: 200,
    canBreak: false
  },

  // --- 4. ЯПОНИЯ (5 шт) ---
  {
    templateId: 'japan_katana',
    regionId: 'japan',
    name: 'Катана самурая',
    museumDesc: 'Клинок Бидзэн с волнообразным хамоном.',
    textureKey: 'art_japan_katana',
    baseValue: 280,
    canBreak: true,
    breakType: 'shard_katana_tsuba',
    breakTitle: 'Закрепить сегмент цубы'
  },
  {
    templateId: 'japan_mask',
    regionId: 'japan',
    name: 'Маска Мэнгу',
    museumDesc: 'Алый лак уруси и клыки демона Они.',
    textureKey: 'art_japan_mask',
    baseValue: 270,
    canBreak: true,
    breakType: 'shard_mask_fang',
    breakTitle: 'Вклеить выбитый клык'
  },
  {
    templateId: 'japan_netsuke',
    regionId: 'japan',
    name: 'Нэцкэ «Дракон»',
    museumDesc: 'Резная миниатюра из моржовой кости.',
    textureKey: 'art_japan_netsuke',
    baseValue: 200,
    canBreak: false
  },
  {
    templateId: 'japan_kabuto',
    regionId: 'japan',
    name: 'Шлем Кабуто',
    museumDesc: 'Самурайский шлем с золотым полумесяцем.',
    textureKey: 'art_japan_kabuto',
    baseValue: 260,
    canBreak: true,
    breakType: 'shard_kabuto_crest',
    breakTitle: 'Установить гребень полумесяца'
  },
  {
    templateId: 'japan_tea',
    regionId: 'japan',
    name: 'Чаша Тэммоку',
    museumDesc: 'Керамика чайной церемонии с масляными каплями.',
    textureKey: 'art_japan_tea',
    baseValue: 210,
    canBreak: false
  },

  // --- 5. МЕЗОАМЕРИКА (5 шт) ---
  {
    templateId: 'meso_mask',
    regionId: 'mesoamerica',
    name: 'Нефритовая маска Пакаля',
    museumDesc: 'Мозаика из пластин императорского нефрита.',
    textureKey: 'art_meso_mask',
    baseValue: 310,
    canBreak: true,
    breakType: 'shard_jade_piece',
    breakTitle: 'Вставить нефритовую мозаику'
  },
  {
    templateId: 'meso_disk',
    regionId: 'mesoamerica',
    name: 'Солярный диск Тонатиу',
    museumDesc: 'Базальтовый календарный диск бога солнца.',
    textureKey: 'art_meso_disk',
    baseValue: 290,
    canBreak: false
  },
  {
    templateId: 'meso_dagger',
    regionId: 'mesoamerica',
    name: 'Кинжал из обсидиана',
    museumDesc: 'Жертвенный нож с рукоятью ягуара.',
    textureKey: 'art_meso_dagger',
    baseValue: 260,
    canBreak: true,
    breakType: 'shard_dagger_blade',
    breakTitle: 'Склеить вулканический скол'
  },
  {
    templateId: 'meso_pipe',
    regionId: 'mesoamerica',
    name: 'Курильница Кетцалькоатля',
    museumDesc: 'Глиняный сосуд с изображением пернатого змея.',
    textureKey: 'art_meso_pipe',
    baseValue: 220,
    canBreak: false
  },
  {
    templateId: 'meso_gold',
    regionId: 'mesoamerica',
    name: 'Пектораль вождя',
    museumDesc: 'Массивное нагрудное золотое украшение.',
    textureKey: 'art_meso_gold',
    baseValue: 275,
    canBreak: false
  },

  // --- 6. ВИКИНГИ (5 шт) ---
  {
    templateId: 'viking_axe',
    regionId: 'viking',
    name: 'Бородатый топор ярла',
    museumDesc: 'Боевой топор с серебряной инкрустацией узлов.',
    textureKey: 'art_viking_axe',
    baseValue: 270,
    canBreak: true,
    breakType: 'shard_axe_notch',
    breakTitle: 'Припаять скол лезвия'
  },
  {
    templateId: 'viking_horn',
    regionId: 'viking',
    name: 'Ритуальный рог',
    museumDesc: 'Рог тура с оковкой из чеканного серебра.',
    textureKey: 'art_viking_horn',
    baseValue: 230,
    canBreak: false
  },
  {
    templateId: 'viking_brooch',
    regionId: 'viking',
    name: 'Фибула-застежка',
    museumDesc: 'Кольцевидная бронзовая фибула с рунами.',
    textureKey: 'art_viking_brooch',
    baseValue: 190,
    canBreak: true,
    breakType: 'shard_brooch_needle',
    breakTitle: 'Вставить кованую иглу'
  },
  {
    templateId: 'viking_helmet',
    regionId: 'viking',
    name: 'Шлем из Гьёрмундбю',
    museumDesc: 'Единственный подлинный шлем с полумаской-очками.',
    textureKey: 'art_viking_helmet',
    baseValue: 285,
    canBreak: false
  },
  {
    templateId: 'viking_raven',
    regionId: 'viking',
    name: 'Амулет ворона Одина',
    museumDesc: 'Серебряная подвеска в стиле Еллинг.',
    textureKey: 'art_viking_raven',
    baseValue: 205,
    canBreak: false
  },

  // --- 7. КИТАЙ (5 шт) ---
  {
    templateId: 'china_vase',
    regionId: 'china',
    name: 'Фарфоровая ваза Тан',
    museumDesc: 'Белый полупрозрачный селадон с кобальтовой росписью.',
    textureKey: 'art_china_vase',
    baseValue: 290,
    canBreak: true,
    breakType: 'shard_china_neck',
    breakTitle: 'Восстановить горлышко вазы'
  },
  {
    templateId: 'china_dragon',
    regionId: 'china',
    name: 'Нефритовый дракон',
    museumDesc: 'Резная пластина из белого хотанского нефрита.',
    textureKey: 'art_china_dragon',
    baseValue: 280,
    canBreak: false
  },
  {
    templateId: 'china_mirror',
    regionId: 'china',
    name: 'Бронзовое зеркало',
    museumDesc: 'Круглое зеркало со знаками зодиака и драконами.',
    textureKey: 'art_china_mirror',
    baseValue: 215,
    canBreak: false
  },
  {
    templateId: 'china_teapot',
    regionId: 'china',
    name: 'Исинский чайник',
    museumDesc: 'Чайник из пурпурной глины цзыша с печатью мастера.',
    textureKey: 'art_china_teapot',
    baseValue: 240,
    canBreak: true,
    breakType: 'shard_china_lid',
    breakTitle: 'Склеить крышечку чайника'
  },
  {
    templateId: 'china_coin',
    regionId: 'china',
    name: 'Монета Кайюань Тунбао',
    museumDesc: 'Квадратная монета императора Сюань-цзуна.',
    textureKey: 'art_china_coin',
    baseValue: 175,
    canBreak: false
  }
];

export const ARTIFACTS = ARTIFACT_TEMPLATES;

export function generateArtifactOrder(preferredRegionId = null, excludeTemplateIds = []) {
  let candidates = ARTIFACT_TEMPLATES;

  if (preferredRegionId) {
    const regionMatches = ARTIFACT_TEMPLATES.filter(t => t.regionId === preferredRegionId);
    if (regionMatches.length > 0) {
      candidates = regionMatches;
    }
  }

  const filtered = candidates.filter(t => !excludeTemplateIds.includes(t.templateId));
  const pool = (filtered.length > 0) ? filtered : candidates;

  const t = pool[Math.floor(Math.random() * pool.length)];
  const region = REGIONS.find(r => r.id === t.regionId) || REGIONS[0];

  const dirtSeverity = 0.8 + Math.random() * 0.5;
  const hasBreakage = Boolean(t.canBreak);

  const tasks = [];

  // Задача 1: Бережное сметание вековой пыли кистью
  tasks.push({
    type: 'clean',
    name: 'Смести вековую пыль и нагар мягкой кистью',
    requiredTool: 'tool_brush',
    hint: 'Используйте МЯГКУЮ КИСТЬ для бережного обеспыливания',
    color: 0xa89f81,
    target: Math.round(160 * dirtSeverity)
  });

  // Если предмет с поломкой — деталь отваливается сразу после первой чистки!
  if (hasBreakage && t.breakType) {
    tasks.push({
      type: 'break_and_assemble',
      name: t.breakTitle,
      requiredTool: 'tool_glue',
      hint: 'Нанесите КЛЕЙ на обнажившийся скол, затем верните деталь в паз',
      shardTexture: t.breakType
    });
  }

  // Задача 3: Химическая промывка растворителем/спреем
  tasks.push({
    type: 'clean',
    name: 'Нейтрализовать окислы и солевую корку',
    requiredTool: 'tool_solvent',
    hint: 'Используйте РАСТВОРИТЕЛЬ / СПРЕЙ',
    color: 0x2a593f,
    target: Math.round(170 * dirtSeverity)
  });

  // Задача 4: Финишная полировка замшей до блеска
  tasks.push({
    type: 'clean',
    name: 'Финишная полировка замшей до блеска',
    requiredTool: 'tool_polish',
    hint: 'Используйте ЗАМШУ для глубокого сияния поверхности',
    color: 0x181818,
    target: Math.round(140 * dirtSeverity)
  });

  return {
    instanceId: `art_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    templateId: t.templateId,
    id: t.templateId,
    regionId: t.regionId,
    regionName: region.name,
    name: t.name,
    museumDesc: t.museumDesc,
    textureKey: t.textureKey,
    hasBreakage,
    marketValue: Math.round(t.baseValue * dirtSeverity * (hasBreakage ? 1.35 : 1.0)),
    tasks
  };
}
