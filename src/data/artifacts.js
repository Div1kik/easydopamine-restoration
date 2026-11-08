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
  {
    id: 'egypt_scarab',
    regionId: 'egypt',
    name: 'Золотой скарабей',
    description: 'Священный амулет возрождения с лазуритовой инкрустацией.',
    textureKey: 'art_egypt_scarab',
    marketValue: 200,
    tasks: [
      { name: 'Сколоть пласт окаменевшей породы', requiredTool: 'tool_scraper', color: 0x78562d },
      { name: 'Смести вековую пыль мягкой кистью', requiredTool: 'tool_brush', color: 0xa89f81 },
      { name: 'Полировать панцирь замшей', requiredTool: 'tool_polish', color: 0xfde047 }
    ]
  },
  {
    id: 'egypt_mask',
    regionId: 'egypt',
    name: 'Маска Тутанхамона',
    description: 'Чеканный золотой венец юного правителя.',
    textureKey: 'art_egypt_mask',
    marketValue: 350,
    tasks: [
      { name: 'Сколоть наслоения грунта скребком', requiredTool: 'tool_scraper', color: 0x78562d },
      { name: 'Смести остатки породы кистью', requiredTool: 'tool_brush', color: 0xa89f81 },
      { name: 'Закрепить отломившийся скол', type: 'break_and_assemble', requiredTool: 'tool_glue', shardTexture: 'shard_amphora' },
      { name: 'Навести музейный глянец замшей', requiredTool: 'tool_polish', color: 0xfacc15 }
    ]
  },
  {
    id: 'egypt_ankh',
    regionId: 'egypt',
    name: 'Обрядовый Анкх',
    description: 'Бронзовый ключ вечной жизни с рубином.',
    textureKey: 'art_egypt_ankh',
    marketValue: 240,
    tasks: [
      { name: 'Сколоть плотную корку породы', requiredTool: 'tool_scraper', color: 0x78562d },
      { name: 'Смыть окислы химическим спреем', requiredTool: 'tool_solvent', color: 0x059669 },
      { name: 'Полировать бронзу до блеска', requiredTool: 'tool_polish', color: 0xf59e0b }
    ]
  },
  {
    id: 'egypt_bastet',
    regionId: 'egypt',
    name: 'Статуэтка Бастет',
    description: 'Темная бронзовая кошка с золотым ошейником.',
    textureKey: 'art_egypt_bastet',
    marketValue: 280,
    tasks: [
      { name: 'Смести вековую пыль мягкой кистью', requiredTool: 'tool_brush', color: 0xa89f81 },
      { name: 'Удалить налет химраствором', requiredTool: 'tool_solvent', color: 0x059669 },
      { name: 'Финишная протирка замшей', requiredTool: 'tool_polish', color: 0xd946ef }
    ]
  },
  {
    id: 'egypt_canopic',
    regionId: 'egypt',
    name: 'Алебастровая канопа',
    description: 'Ритуальный сосуд с резной крышкой.',
    textureKey: 'art_egypt_canopic',
    marketValue: 220,
    tasks: [
      { name: 'Очистить поверхность скребком', requiredTool: 'tool_scraper', color: 0x78562d },
      { name: 'Смести остатки кистью', requiredTool: 'tool_brush', color: 0xa89f81 },
      { name: 'Обработать защитным воском', requiredTool: 'tool_polish', color: 0xfde047 }
    ]
  }
];

export function generateArtifactOrder(preferredRegion, recentHistory = [], requestedTemplateId = null) {
  if (requestedTemplateId) {
    const found = ARTIFACT_TEMPLATES.find(t => t.id === requestedTemplateId);
    if (found) return { ...found, instanceId: `art_${Date.now()}` };
  }

  const regionItems = ARTIFACT_TEMPLATES.filter(t => t.regionId === preferredRegion);
  const pool = regionItems.length > 0 ? regionItems : ARTIFACT_TEMPLATES;
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { ...item, instanceId: `art_${Date.now()}` };
}
