export const ERAS = [
  { id: 'egypt', name: 'Древний Египет', order: 0, accentColor: '#d4af37', bgTheme: 0x241d15 },
  { id: 'greece', name: 'Античная Греция', order: 1, accentColor: '#e67e22', bgTheme: 0x1f1f1a },
  { id: 'europe', name: 'Средневековая Европа', order: 2, accentColor: '#3498db', bgTheme: 0x181a1f },
  { id: 'japan', name: 'Феодальная Япония', order: 3, accentColor: '#c0392b', bgTheme: 0x211616 }
];

export const ARTIFACTS = [
  // ===================== ЕГИПЕТ =====================
  {
    id: 'egypt_scarab',
    eraId: 'egypt',
    eraIndex: 0,
    name: 'Золотой скарабей',
    museumDesc: 'Священный символ возрождения из царской гробницы Фив.',
    textureKey: 'art_egypt_scarab',
    tasks: [
      { id: 'sand', name: 'Снять пласт песчаника', requiredTool: 'tool_scraper', color: 0xb59846, target: 280 },
      { id: 'salt', name: 'Промыть солевой налет растворителем', requiredTool: 'tool_solvent', color: 0x6e684d, target: 200 },
      { id: 'polish', name: 'Отполировать золото замшей', requiredTool: 'tool_polish', color: 0x4a432b, target: 160 }
    ],
    reward: 120
  },
  {
    id: 'egypt_mask',
    eraId: 'egypt',
    eraIndex: 1,
    name: 'Маска Тутанхамона',
    museumDesc: 'Чеканная золотая маска с инкрустацией лазуритом.',
    textureKey: 'art_egypt_mask',
    tasks: [
      { id: 'clay', name: 'Счистить вековую глину и битум', requiredTool: 'tool_scraper', color: 0x8a6a3b, target: 320 },
      { id: 'wash', name: 'Бережно смыть осадок с бирюзы', requiredTool: 'tool_solvent', color: 0x4d5b51, target: 220 },
      { id: 'polish', name: 'Зеркальная полировка венца', requiredTool: 'tool_polish', color: 0x3a3320, target: 180 }
    ],
    reward: 150
  },
  {
    id: 'egypt_ankh',
    eraId: 'egypt',
    eraIndex: 2,
    name: 'Обрядовый Анкх',
    museumDesc: 'Бронзовый кованый крест вечной жизни.',
    textureKey: 'art_egypt_ankh',
    tasks: [
      { id: 'sand', name: 'Удалить окаменевший песок', requiredTool: 'tool_scraper', color: 0xa88f4d, target: 260 },
      { id: 'chem', name: 'Химическая смывка карбонатов', requiredTool: 'tool_solvent', color: 0x545244, target: 190 },
      { id: 'polish', name: 'Полировка бронзового узора', requiredTool: 'tool_polish', color: 0x3b3323, target: 150 }
    ],
    reward: 130
  },

  // ===================== ГРЕЦИЯ =====================
  {
    id: 'greece_amphora',
    eraId: 'greece',
    eraIndex: 0,
    name: 'Аттическая амфора',
    museumDesc: 'Сосуд для оливкового масла с чернофигурной росписью V в. до н.э.',
    textureKey: 'art_greece_amphora',
    tasks: [
      { id: 'scale', name: 'Снять морской ракушечник скребком', requiredTool: 'tool_scraper', color: 0x4a5b50, target: 300 },
      { id: 'wash', name: 'Промыть терракоту мягкой губкой', requiredTool: 'tool_solvent', color: 0x344238, target: 210 },
      { id: 'glue', name: 'Заполнить трещину керамическим клеем', requiredTool: 'tool_glue', color: 0xd35400, target: 140 },
      { id: 'polish', name: 'Финишное вощение керамики', requiredTool: 'tool_polish', color: 0x2d3b36, target: 150 }
    ],
    reward: 180
  },
  {
    id: 'greece_helmet',
    eraId: 'greece',
    eraIndex: 1,
    name: 'Коринфский шлем',
    museumDesc: 'Бронзовый шлем спартанского воина.',
    textureKey: 'art_greece_helmet',
    tasks: [
      { id: 'earth', name: 'Снять окаменевший грунт', requiredTool: 'tool_scraper', color: 0x444b42, target: 310 },
      { id: 'chem', name: 'Смывка зеленой оксидной патины', requiredTool: 'tool_solvent', color: 0x2d3a33, target: 220 },
      { id: 'polish', name: 'Полировка античной бронзы', requiredTool: 'tool_polish', color: 0x202923, target: 160 }
    ],
    reward: 160
  },
  {
    id: 'greece_coin',
    eraId: 'greece',
    eraIndex: 2,
    name: 'Афинская тетрадрахма',
    museumDesc: 'Массивная серебряная монета со священной совой Афины.',
    textureKey: 'art_greece_coin',
    tasks: [
      { id: 'dirt', name: 'Очистить мелкий рельеф щеткой', requiredTool: 'tool_scraper', color: 0x555853, target: 250 },
      { id: 'chem', name: 'Нейтрализовать черный сульфид серебра', requiredTool: 'tool_solvent', color: 0x3b3d3a, target: 180 },
      { id: 'polish', name: 'Зеркальный серебряный блеск', requiredTool: 'tool_polish', color: 0x262725, target: 140 }
    ],
    reward: 140
  },

  // ===================== ЕВРОПА =====================
  {
    id: 'europe_shield',
    eraId: 'europe',
    eraIndex: 0,
    name: 'Рыцарский щит',
    museumDesc: 'Турнирный тарч из кричной стали с геральдическим крестом.',
    textureKey: 'art_europe_shield',
    tasks: [
      { id: 'rust', name: 'Счистить пластовую ржавчину скребком', requiredTool: 'tool_scraper', color: 0x5a3d2e, target: 320 },
      { id: 'wash', name: 'Смыть копоть и старый защитный лак', requiredTool: 'tool_solvent', color: 0x35312d, target: 210 },
      { id: 'paint', name: 'Подкрасить утраченный геральдический крест', requiredTool: 'tool_brush', color: 0xc0392b, target: 150 },
      { id: 'polish', name: 'Навести зеркальный стальной блеск', requiredTool: 'tool_polish', color: 0x2a2826, target: 160 }
    ],
    reward: 200
  },
  {
    id: 'europe_sword',
    eraId: 'europe',
    eraIndex: 1,
    name: 'Меч крестоносца',
    museumDesc: 'Полуторный меч с дисковидным навершием и гравировкой.',
    textureKey: 'art_europe_sword',
    tasks: [
      { id: 'scale', name: 'Удалить окалину и коррозию лезвия', requiredTool: 'tool_scraper', color: 0x483a30, target: 330 },
      { id: 'chem', name: 'Кислотная нейтрализация микротрещин', requiredTool: 'tool_solvent', color: 0x312923, target: 220 },
      { id: 'polish', name: 'Алмазная доводка клинка до блеска', requiredTool: 'tool_polish', color: 0x221c17, target: 170 }
    ],
    reward: 190
  },
  {
    id: 'europe_chalice',
    eraId: 'europe',
    eraIndex: 2,
    name: 'Готический потир',
    museumDesc: 'Золоченый кубок с гранатами и филигранью.',
    textureKey: 'art_europe_chalice',
    tasks: [
      { id: 'wax', name: 'Снять застывший свечной воск', requiredTool: 'tool_scraper', color: 0x524838, target: 270 },
      { id: 'wash', name: 'Бережная очистка самоцветов', requiredTool: 'tool_solvent', color: 0x3b3325, target: 190 },
      { id: 'polish', name: 'Филигранная полировка золочения', requiredTool: 'tool_polish', color: 0x292318, target: 150 }
    ],
    reward: 180
  },

  // ===================== ЯПОНИЯ =====================
  {
    id: 'japan_katana',
    eraId: 'japan',
    eraIndex: 0,
    name: 'Катана самурая',
    museumDesc: 'Боевой клинок школы Бидзэн с волнообразным хамоном.',
    textureKey: 'art_japan_katana',
    tasks: [
      { id: 'oil', name: 'Снять застывшее масло гвоздики', requiredTool: 'tool_scraper', color: 0x3d3935, target: 320 },
      { id: 'uchiko', name: 'Очистка рисовой пудрой утико', requiredTool: 'tool_solvent', color: 0x2b2b28, target: 220 },
      { id: 'polish', name: 'Проявление зеркального хамона камнем', requiredTool: 'tool_polish', color: 0x1f1e1c, target: 170 }
    ],
    reward: 220
  },
  {
    id: 'japan_mask',
    eraId: 'japan',
    eraIndex: 1,
    name: 'Маска Мэнгу',
    museumDesc: 'Боевая полумаска с алым лаком уруси и клыками демона.',
    textureKey: 'art_japan_mask',
    tasks: [
      { id: 'ash', name: 'Счистить боевой пепел и нагар', requiredTool: 'tool_scraper', color: 0x422a27, target: 330 },
      { id: 'wash', name: 'Очистка золотых клыков Они', requiredTool: 'tool_solvent', color: 0x2d1f1e, target: 220 },
      { id: 'polish', name: 'Глянцевое вощение драгоценного лака', requiredTool: 'tool_polish', color: 0x1f1514, target: 180 }
    ],
    reward: 240
  },
  {
    id: 'japan_netsuke',
    eraId: 'japan',
    eraIndex: 2,
    name: 'Нэцкэ «Дракон»',
    museumDesc: 'Резная миниатюра из кости с янтарными глазами.',
    textureKey: 'art_japan_netsuke',
    tasks: [
      { id: 'dust', name: 'Вычистить вековую пыль из резных пазов', requiredTool: 'tool_scraper', color: 0x5a5345, target: 280 },
      { id: 'soap', name: 'Промывка чешуи мыльным раствором', requiredTool: 'tool_solvent', color: 0x3d3930, target: 200 },
      { id: 'polish', name: 'Шелковая полировка кости до фарфора', requiredTool: 'tool_polish', color: 0x2b2822, target: 150 }
    ],
    reward: 210
  }
];
