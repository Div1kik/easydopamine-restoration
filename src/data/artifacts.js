export const REGIONS = [
  { id: 'egypt', name: 'Древний Египет', accentColor: '#d4af37', location: 'Нил и Долина Царей' },
  { id: 'greece', name: 'Античное Средиземноморье', accentColor: '#e67e22', location: 'Эгейский бассейн' },
  { id: 'europe', name: 'Средневековая Европа', accentColor: '#3498db', location: 'Рейнские графства' },
  { id: 'japan', name: 'Феодальная Япония', accentColor: '#c0392b', location: 'Храмы Киото' },
  { id: 'mesoamerica', name: 'Мезоамерика (Майя)', accentColor: '#1abc9c', location: 'Сельва Юкатана' }
];

export const ERAS = REGIONS;

export const ARTIFACT_TEMPLATES = [
  // --- ЕГИПЕТ ---
  {
    id: 'egypt_scarab',
    templateId: 'egypt_scarab',
    eraId: 'egypt',
    regionId: 'egypt',
    name: 'Золотой скарабей',
    museumDesc: 'Священный символ возрождения с натуральным лазуритом.',
    textureKey: 'art_egypt_scarab',
    baseValue: 180,
    canBreak: true,
    breakType: 'shard_scarab_wing',
    breakTitle: 'Припаять отломанное золотое крыло'
  },
  {
    id: 'egypt_mask',
    templateId: 'egypt_mask',
    eraId: 'egypt',
    regionId: 'egypt',
    name: 'Маска Тутанхамона',
    museumDesc: 'Чеканный царский венец из золота и синей эмали.',
    textureKey: 'art_egypt_mask',
    baseValue: 240,
    canBreak: true,
    breakType: 'shard_mask_beard',
    breakTitle: 'Склеить отколотую ритуальную бородку'
  },
  {
    id: 'egypt_ankh',
    templateId: 'egypt_ankh',
    eraId: 'egypt',
    regionId: 'egypt',
    name: 'Обрядовый Анкх',
    museumDesc: 'Бронзовый кованый крест вечной жизни фараонов.',
    textureKey: 'art_egypt_ankh',
    baseValue: 190,
    canBreak: true,
    breakType: 'shard_ankh_loop',
    breakTitle: 'Соединить расколотую петлю жизни'
  },

  // --- ГРЕЦИЯ ---
  {
    id: 'greece_amphora',
    templateId: 'greece_amphora',
    eraId: 'greece',
    regionId: 'greece',
    name: 'Аттическая амфора',
    museumDesc: 'Терракотовый сосуд V в. до н.э. с чернофигурной росписью.',
    textureKey: 'art_greece_amphora',
    baseValue: 210,
    canBreak: true,
    breakType: 'shard_amphora',
    breakTitle: 'Склеить отколотую ручку горлышка'
  },
  {
    id: 'greece_helmet',
    templateId: 'greece_helmet',
    eraId: 'greece',
    regionId: 'greece',
    name: 'Коринфский шлем',
    museumDesc: 'Боевой бронзовый шлем с алым гребнем спартанца.',
    textureKey: 'art_greece_helmet',
    baseValue: 250,
    canBreak: true,
    breakType: 'shard_helmet_cheek',
    breakTitle: 'Установить нащечную пластину'
  },
  {
    id: 'greece_coin',
    templateId: 'greece_coin',
    eraId: 'greece',
    regionId: 'greece',
    name: 'Афинская тетрадрахма',
    museumDesc: 'Серебряная античная монета со священной совой Афины.',
    textureKey: 'art_greece_coin',
    baseValue: 170,
    canBreak: false
  },

  // --- ЕВРОПА ---
  {
    id: 'europe_shield',
    templateId: 'europe_shield',
    eraId: 'europe',
    regionId: 'europe',
    name: 'Рыцарский тарч',
    museumDesc: 'Турнирный стальной щит с алым геральдическим крестом.',
    textureKey: 'art_europe_shield',
    baseValue: 220,
    canBreak: false
  },
  {
    id: 'europe_sword',
    templateId: 'europe_sword',
    eraId: 'europe',
    regionId: 'europe',
    name: 'Меч крестоносца',
    museumDesc: 'Полуторный боевой клинок с позолоченным дисковидным навершием.',
    textureKey: 'art_europe_sword',
    baseValue: 260,
    canBreak: true,
    breakType: 'shard_sword_tip',
    breakTitle: 'Припаять отломанное острие клинка'
  },
  {
    id: 'europe_chalice',
    templateId: 'europe_chalice',
    eraId: 'europe',
    regionId: 'europe',
    name: 'Готический потир',
    museumDesc: 'Золоченый церемониальный кубок с филигранью и рубином.',
    textureKey: 'art_europe_chalice',
    baseValue: 230,
    canBreak: true,
    breakType: 'shard_chalice_gem',
    breakTitle: 'Вклеить выпавший в бою самоцвет'
  },

  // --- ЯПОНИЯ ---
  {
    id: 'japan_katana',
    templateId: 'japan_katana',
    eraId: 'japan',
    regionId: 'japan',
    name: 'Катана самурая',
    museumDesc: 'Клинок Бидзэн с волнистой линией зонной закалки хамон.',
    textureKey: 'art_japan_katana',
    baseValue: 280,
    canBreak: true,
    breakType: 'shard_katana_tsuba',
    breakTitle: 'Закрепить отколотый сегмент цубы'
  },
  {
    id: 'japan_mask',
    templateId: 'japan_mask',
    eraId: 'japan',
    regionId: 'japan',
    name: 'Маска Мэнгу',
    museumDesc: 'Боевая полумаска с алым лаком уруси и клыками демона Они.',
    textureKey: 'art_japan_mask',
    baseValue: 270,
    canBreak: true,
    breakType: 'shard_mask_fang',
    breakTitle: 'Вклеить выбитый клык Они'
  },
  {
    id: 'japan_netsuke',
    templateId: 'japan_netsuke',
    eraId: 'japan',
    regionId: 'japan',
    name: 'Нэцкэ «Дракон»',
    museumDesc: 'Резная миниатюра из моржовой кости с янтарными глазами.',
    textureKey: 'art_japan_netsuke',
    baseValue: 200,
    canBreak: false
  },

  // --- МЕЗОАМЕРИКА ---
  {
    id: 'meso_mask',
    templateId: 'meso_mask',
    eraId: 'mesoamerica',
    regionId: 'mesoamerica',
    name: 'Нефритовая маска Пакаля',
    museumDesc: 'Погребальная мозаика из пластин императорского нефрита.',
    textureKey: 'art_meso_mask',
    baseValue: 310,
    canBreak: true,
    breakType: 'shard_jade_piece',
    breakTitle: 'Вставить расколотую нефритовую мозаику'
  },
  {
    id: 'meso_disk',
    templateId: 'meso_disk',
    eraId: 'mesoamerica',
    regionId: 'mesoamerica',
    name: 'Солярный диск Тонатиу',
    museumDesc: 'Базальтовый календарный диск с ликом бога солнца.',
    textureKey: 'art_meso_disk',
    baseValue: 290,
    canBreak: false
  },
  {
    id: 'meso_dagger',
    templateId: 'meso_dagger',
    eraId: 'mesoamerica',
    regionId: 'mesoamerica',
    name: 'Кинжал из обсидиана',
    museumDesc: 'Жертвенный нож из вулканического стекла с рукоятью ягуара.',
    textureKey: 'art_meso_dagger',
    baseValue: 260,
    canBreak: true,
    breakType: 'shard_dagger_blade',
    breakTitle: 'Склеить вулканический скол'
  }
];

export const ARTIFACTS = ARTIFACT_TEMPLATES;

// Честный генератор заказов с жестким разделением по регионам
export function generateArtifactOrder(preferredRegionId = null, excludeTemplateIds = []) {
  let candidates = ARTIFACT_TEMPLATES;

  // Если выбран конкретный регион (Египет, Греция, Европа, Япония, Мезоамерика)
  if (preferredRegionId) {
    const regionMatches = ARTIFACT_TEMPLATES.filter(t => t.regionId === preferredRegionId || t.eraId === preferredRegionId);
    if (regionMatches.length > 0) {
      candidates = regionMatches;
    }
  }

  // Фильтр от недавних повторов (не чаще, чем через 3)
  const filtered = candidates.filter(t => !excludeTemplateIds.includes(t.templateId));
  const pool = (filtered.length > 0) ? filtered : candidates;

  const t = pool[Math.floor(Math.random() * pool.length)];
  const region = REGIONS.find(r => r.id === t.regionId) || REGIONS[0];

  const dirtSeverity = 0.8 + Math.random() * 0.6;
  const hasBreakage = Boolean(t.canBreak && (Math.random() < 0.60));

  const tasks = [];

  // Задача 1: Зачистка скребком
  tasks.push({
    type: 'clean',
    name: 'Снять пласт окаменевшей породы',
    requiredTool: 'tool_scraper',
    hint: 'Используйте СКРЕБОК против грубого панциря',
    color: 0x78562d,
    target: Math.round(180 * dirtSeverity)
  });

  // Задача 2: Сметание пыли кистью
  tasks.push({
    type: 'clean',
    name: 'Смести вековую пыль и нагар кистью',
    requiredTool: 'tool_brush',
    hint: 'Используйте МЯГКУЮ КИСТЬ для смахивания пыли',
    color: 0xa89f81,
    target: Math.round(150 * dirtSeverity)
  });

  // Задача 3: Химическая промывка растворителем
  tasks.push({
    type: 'clean',
    name: 'Нейтрализовать окислы и солевой налет',
    requiredTool: 'tool_solvent',
    hint: 'Используйте РАСТВОРИТЕЛЬ для микропор',
    color: 0x2a593f,
    target: Math.round(160 * dirtSeverity)
  });

  // Задача 4 (если есть поломка): Склейка
  if (hasBreakage && t.breakType) {
    tasks.push({
      type: 'assemble',
      name: t.breakTitle,
      requiredTool: 'tool_glue',
      hint: 'Нанесите КЛЕЙ на трещину, затем приложите осколок',
      shardTexture: t.breakType
    });
  }

  // Задача 5: Финишная замша
  tasks.push({
    type: 'clean',
    name: 'Финишная зеркальная полировка',
    requiredTool: 'tool_polish',
    hint: 'Используйте ЗАМШУ для глубокого блеска',
    color: 0x181818,
    target: Math.round(130 * dirtSeverity)
  });

  return {
    instanceId: `art_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    templateId: t.templateId,
    id: t.id,
    regionId: t.regionId,
    regionName: region.name,
    name: t.name,
    museumDesc: t.museumDesc,
    textureKey: t.textureKey,
    hasBreakage,
    marketValue: Math.round(t.baseValue * dirtSeverity * (hasBreakage ? 1.3 : 1.0)),
    tasks
  };
}
