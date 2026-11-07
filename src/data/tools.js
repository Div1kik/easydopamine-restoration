export const TOOL_SHOP_ITEMS = [
  // СКРЕБКИ
  {
    id: 'scraper_1',
    category: 'tool_scraper',
    name: 'Костяной скребок',
    tier: 1,
    requiredLevel: 1,
    price: 0,
    powerMultiplier: 1.0,
    desc: 'Базовый инструмент из кости. Медленно снимает окалину.'
  },
  {
    id: 'scraper_2',
    category: 'tool_scraper',
    name: 'Стальной архео-резак',
    tier: 2,
    requiredLevel: 2,
    price: 250,
    powerMultiplier: 1.6,
    desc: 'Закаленная углеродистая сталь. Снимает ржавчину и породу на 60% быстрее.'
  },
  {
    id: 'scraper_3',
    category: 'tool_scraper',
    name: 'Алмазный микро-скальпель',
    tier: 3,
    requiredLevel: 4,
    price: 600,
    powerMultiplier: 2.5,
    desc: 'Ювелирный инструмент. Молниеносно скалывает любые наросты.'
  },

  // РАСТВОРИТЕЛИ
  {
    id: 'solvent_1',
    category: 'tool_solvent',
    name: 'Мыльный дистиллят',
    tier: 1,
    requiredLevel: 1,
    price: 0,
    powerMultiplier: 1.0,
    desc: 'Бережная вода для слабой пыли.'
  },
  {
    id: 'solvent_2',
    category: 'tool_solvent',
    name: 'Кислотный нейтрализатор',
    tier: 2,
    requiredLevel: 2,
    price: 220,
    powerMultiplier: 1.6,
    desc: 'Эффективно растворяет соли и оксидные пленки.'
  },
  {
    id: 'solvent_3',
    category: 'tool_solvent',
    name: 'Энзимная паста',
    tier: 3,
    requiredLevel: 3,
    price: 550,
    powerMultiplier: 2.4,
    desc: 'Мгновенно расщепляет вековой нагар и смолу.'
  },

  // ЗАМША / ПОЛИРОЛЬ
  {
    id: 'polish_1',
    category: 'tool_polish',
    name: 'Льняная ветошь',
    tier: 1,
    requiredLevel: 1,
    price: 0,
    powerMultiplier: 1.0,
    desc: 'Простая ткань для устранения следов чистки.'
  },
  {
    id: 'polish_2',
    category: 'tool_polish',
    name: 'Натуральная замша',
    tier: 2,
    requiredLevel: 2,
    price: 200,
    powerMultiplier: 1.5,
    desc: 'Мягкая кожа оленя. Дает глубокий зеркальный блеск.'
  },
  {
    id: 'polish_3',
    category: 'tool_polish',
    name: 'Шелк с алмазной пастой',
    tier: 3,
    requiredLevel: 4,
    price: 500,
    powerMultiplier: 2.3,
    desc: 'Профессиональная ювелирная полировка до сияния.'
  }
];

export const WORKSHOP_UPGRADES = [
  {
    tier: 2,
    name: 'Лавка антиквара',
    requiredLevel: 2,
    price: 400,
    incomeBonus: '+25% дохода с витрины',
    desc: 'Покрытые лаком столы, бронзовая лампа и бархатные лотки для экспонатов.'
  },
  {
    tier: 3,
    name: 'Гильдия реставраторов',
    requiredLevel: 3,
    price: 900,
    incomeBonus: '+60% дохода с витрины',
    desc: 'Мраморные верстаки, стеклянные шкафы и инструменты королевского качества.'
  },
  {
    tier: 4,
    name: 'Императорский музей',
    requiredLevel: 5,
    price: 2000,
    incomeBonus: '+120% дохода с витрины',
    desc: 'Зал с позолоченной лепниной, спотовой подсветкой и охраной сокровищ.'
  }
];
