export const REGIONS = [
  { id: 'egypt', name: 'Древний Египет', accentColor: '#d4af37', location: 'Нил и Долина Царей' },
  { id: 'greece', name: 'Античное Средиземноморье', accentColor: '#e67e22', location: 'Эгейский бассейн' },
  { id: 'europe', name: 'Средневековая Европа', accentColor: '#3498db', location: 'Рейнские графства' },
  { id: 'japan', name: 'Феодальная Япония', accentColor: '#c0392b', location: 'Храмы Киото' },
  { id: 'mesoamerica', name: 'Мезоамерика (Майя)', accentColor: '#1abc9c', location: 'Сельва Юкатана' }
];

export const ARTIFACT_TEMPLATES = [
  // --- ЕГИПЕТ ---
  {
    templateId: 'egypt_scarab',
    regionId: 'egypt',
    name: 'Золотой скарабей',
    museumDesc: 'Священный амулет возрождения с лазуритом.',
    textureKey: 'art_egypt_scarab',
    baseValue: 180,
    canBreak: true,
    breakType: 'shard_scarab_wing',
    breakTitle: 'Припаять отломанное золотое крыло'
  },
  {
    templateId: 'egypt_mask',
    regionId: 'egypt',
    name: 'Маска Тутанхамона',
    museumDesc: 'Чеканный царский венец из золота и бирюзы.',
    textureKey: 'art_egypt_mask',
    baseValue: 240,
    canBreak: true,
    breakType: 'shard_mask_beard',
    breakTitle: 'Склеить отколотую ритуальную бородку'
  },
  {
    templateId: 'egypt_ankh',
    regionId: 'egypt',
    name: 'Обрядовый Анкх',
    museumDesc: 'Бронзовый крест вечной жизни жрецов Амона.',
    textureKey: 'art_egypt_ankh',
    baseValue: 190,
    canBreak: true,
    breakType: 'shard_ankh_loop',
    breakTitle: 'Соединить расколотую петлю жизни'
  },

  // --- ГРЕЦИЯ ---
  {
    templateId: 'greece_amphora',
    regionId: 'greece',
    name: 'Аттическая амфора',
    museumDesc: 'Чернофигурный сосуд для оливкового масла.',
    textureKey: 'art_greece_amphora',
    baseValue: 210,
    canBreak: true,
    breakType: 'shard_amphora',
    breakTitle: 'Склеить отколотую ручку горлышка'
  },
  {
    templateId: 'greece_helmet',
    regionId: 'greece',
    name: 'Коринфский шлем',
    museumDesc: 'Боевое бронзовое наголовье спартанца.',
    textureKey: 'art_greece_helmet',
    baseValue: 250,
    canBreak: true,
    breakType: 'shard_helmet_cheek',
    breakTitle: 'Установить выбитую нащечную пластину'
  },
  {
    templateId: 'greece_coin',
    regionId: 'greece',
    name: 'Афинская тетрадрахма',
    museumDesc: 'Массивная серебряная монета с совой.',
    textureKey: 'art_greece_coin',
    baseValue: 170,
    canBreak: false
  },

  // --- ЕВРОПА ---
  {
    templateId: 'europe_shield',
    regionId: 'europe',
    name: 'Рыцарский тарч',
    museumDesc: 'Турнирный щит с геральдическим крестом.',
    textureKey: 'art_europe_shield',
    baseValue: 220,
    canBreak: false
  },
  {
    templateId: 'europe_sword',
    regionId: 'europe',
    name: 'Меч крестоносца',
    museumDesc: 'Полуторный меч с дисковидным навершием.',
    textureKey: 'art_europe_sword',
    baseValue: 260,
    canBreak: true,
    breakType: 'shard_sword_tip',
    breakTitle: 'Припаять отломанное острие клинка'
  },
  {
    templateId: 'europe_chalice',
    regionId: 'europe',
    name: 'Готический потир',
    museumDesc: 'Золоченый кубок с рубинами и филигранью.',
    textureKey: 'art_europe_chalice',
    baseValue: 230,
    canBreak: true,
    breakType: 'shard_chalice_gem',
    breakTitle: 'Вклеить выпавший в бою гранат'
  },

  // --- ЯПОНИЯ ---
  {
    templateId: 'japan_katana',
    regionId: 'japan',
    name: 'Катана самурая',
    museumDesc: 'Боевой клинок Бидзэн с волнообразным хамоном.',
    textureKey: 'art_japan_katana',
    baseValue: 280,
    canBreak: true,
    breakType: 'shard_katana_tsuba',
    breakTitle: 'Закрепить отколотый сегмент цубы'
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
    breakTitle: 'Вклеить выбитый клык Они'
  },
  {
    templateId: 'japan_netsuke',
    regionId: 'japan',
    name: 'Нэцкэ «Дракон»',
    museumDesc: 'Миниатюра из моржовой кости с янтарем.',
    textureKey: 'art_japan_netsuke',
    baseValue: 200,
    canBreak: false
  },

  // --- МЕЗОАМЕРИКА (НОВАЯ ЗОНА) ---
  {
    templateId: 'meso_mask',
    regionId: 'mesoamerica',
    name: 'Нефритовая маска Пакаля',
    museumDesc: 'Мозаика из пластин императорского нефрита и раковин.',
    textureKey: 'art_meso_mask',
    baseValue: 310,
    canBreak: true,
    breakType: 'shard_jade_piece',
    breakTitle: 'Вставить расколотую нефритовую мозаику'
  },
  {
    templateId: 'meso_disk',
    regionId: 'mesoamerica',
    name: 'Солярный диск Тонатиу',
    museumDesc: 'Базальтовый календарный диск с ликом бога солнца.',
    textureKey: 'art_meso_disk',
    baseValue: 290,
    canBreak: false
  },
  {
    templateId: 'meso:dagger',
    regionId: 'mesoamerica',
    name: 'Кинжал из обсидиана',
    museumDesc: 'Жертвенный нож с рукоятью в виде крадущегося ягуара.',
    textureKey: 'art_meso_dagger',
    baseValue: 260,
    canBreak: true,
    breakType: 'shard_dagger_blade',
    breakTitle: 'Склеить расколотый вулканический скол'
  }
];

// Генератор уникального процедурного заказа с рандомизацией дефектов
export function generateArtifactOrder(preferredRegionId = null, excludeTemplateIds = []) {
  let pool = ARTIFACT_TEMPLATES.filter(t => !excludeTemplateIds.includes(t.templateId));
  if (preferredRegionId) {
    const regionPool = pool.filter(t => t.regionId === preferredRegionId);
    if (regionPool.length > 0) pool = regionPool;
  }
  if (pool.length === 0) pool = ARTIFACT_TEMPLATES;

  const t = pool[Math.floor(Math.random() * pool.length)];
  const region = REGIONS.find(r => r.id === t.regionId);

  // Рандомизация степени загрязнения
  const dirtSeverity = 0.8 + Math.random() * 0.7; // 80% .. 150%
  const hasBreakage = t.canBreak && (Math.random() < 0.65); // 65% шанс поломки

  // Процедурные задачи под конкретное состояние
  const tasks = [];

  // Задача 1: Грубая зачистка
  tasks.push({
    type: 'clean',
    name: 'Снять пласт окаменевшей породы',
    requiredTool: 'tool_scraper',
    hint: 'Используйте СКРЕБОК против грубого панциря',
    color: 0x826d4b,
    target: Math.round(200 * dirtSeverity)
  });

  // Задача 2: Химическая ванна / растворение
  tasks.push({
    type: 'clean',
    name: 'Нейтрализовать окислы и нагар',
    requiredTool: 'tool_solvent',
    hint: 'Используйте РАСТВОРИТЕЛЬ для микропор',
    color: 0x3d473d,
    target: Math.round(170 * dirtSeverity)
  });

  // Задача 3 (Опционально): Склейка реального отломанного фрагмента
  if (hasBreakage) {
    tasks.push({
      type: 'assemble',
      name: t.breakTitle,
      requiredTool: 'tool_glue',
      hint: 'Нанесите КЛЕЙ по контуру, затем совместите осколок в паз',
      shardTexture: t.breakType
    });
  }

  // Задача 4: Финишная полировка
  tasks.push({
    type: 'clean',
    name: 'Зеркальная полировка поверхности',
    requiredTool: 'tool_polish',
    hint: 'Используйте ЗАМШУ для глубокого блеска',
    color: 0x221f1d,
    target: Math.round(140 * dirtSeverity)
  });

  return {
    instanceId: `art_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    templateId: t.templateId,
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
