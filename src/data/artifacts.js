export const ERAS = [
  {
    id: 'egypt',
    name: 'Древний Египет',
    order: 0,
    accentColor: '#d4af37'
  },
  {
    id: 'greece',
    name: 'Античная Греция',
    order: 1,
    accentColor: '#e67e22'
  },
  {
    id: 'europe',
    name: 'Средневековая Европа',
    order: 2,
    accentColor: '#3498db'
  }
];

export const ARTIFACTS = [
  // --- ЕГИПЕТ ---
  {
    id: 'egypt_scarab',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Золотой скарабей',
    museumDesc: 'Священный символ возрождения из гробницы Нового царства с лазуритовым центром.',
    historyNote: 'Датировка: около 1330 г. до н.э. Использовался жрецами солнца как защитный амулет.',
    textureKey: 'art_egypt_scarab',
    phases: [
      { name: 'Снятие песчаника', color: 0xb59846, spots: 0x8a722e, targetSteps: 170 },
      { name: 'Смывка солей', color: 0x6e684d, spots: 0x3d3929, targetSteps: 140 },
      { name: 'Золотая полировка', color: 0x4a432b, spots: 0x2b2718, targetSteps: 120 }
    ],
    reward: 60
  },
  {
    id: 'egypt_mask',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Погребальная маска фараона',
    museumDesc: 'Чеканная золотая маска с инкрустацией обсидианом и полосами из бирюзы.',
    historyNote: 'Датировка: XIV в. до н.э. Создана царскими ювелирами для загробного перехода владыки.',
    textureKey: 'art_egypt_mask',
    phases: [
      { name: 'Удаление вековой глины', color: 0x937038, spots: 0x5a431d, targetSteps: 190 },
      { name: 'Очистка бирюзы', color: 0x4d5b51, spots: 0x26332a, targetSteps: 150 },
      { name: 'Зеркальный блеск золота', color: 0x3a3320, spots: 0x1f1b11, targetSteps: 130 }
    ],
    reward: 80
  },
  {
    id: 'egypt_ankh',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Ритуальный ключ Анкх',
    museumDesc: 'Бронзовый кованый крест вечной жизни, украшенный барельефами богини Исиды.',
    historyNote: 'Датировка: XII в. до н.э. Обрядовый артефакт храмовых служений в Луксоре.',
    textureKey: 'art_egypt_ankh',
    phases: [
      { name: 'Снятие корки песка', color: 0xa88f4d, spots: 0x6e5b2c, targetSteps: 160 },
      { name: 'Смывка карбонатов', color: 0x545244, spots: 0x2e2c24, targetSteps: 130 },
      { name: 'Патинирование бронзы', color: 0x3b3323, spots: 0x1f1b12, targetSteps: 110 }
    ],
    reward: 70
  },

  // --- ГРЕЦИЯ ---
  {
    id: 'greece_amphora',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Аттическая амфора',
    museumDesc: 'Сосуд для оливкового масла с чернофигурной росписью V в. до н.э.',
    historyNote: 'Датировка: 470 г. до н.э. Найдена на затонувшей торговой триреме в Эгейском море.',
    textureKey: 'art_greece_amphora',
    phases: [
      { name: 'Удаление ракушечника', color: 0x4a5b50, spots: 0x26382c, targetSteps: 180 },
      { name: 'Растворение солей', color: 0x344238, spots: 0x1d2921, targetSteps: 150 },
      { name: 'Вощение керамики', color: 0x2d3b36, spots: 0x141a15, targetSteps: 120 }
    ],
    reward: 85
  },
  {
    id: 'greece_helmet',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Коринфский шлем',
    museumDesc: 'Бронзовый боевой шлем с высоким гребнем и Т-образным вырезом для глаз.',
    historyNote: 'Датировка: около 490 г. до н.э. Следы ударов свидетельствуют об участии в Марафонской битве.',
    textureKey: 'art_greece_helmet',
    phases: [
      { name: 'Снятие плотной земли', color: 0x444b42, spots: 0x252c23, targetSteps: 190 },
      { name: 'Удаление оксидной корки', color: 0x2d3a33, spots: 0x17211b, targetSteps: 150 },
      { name: 'Полировка античной бронзы', color: 0x202923, spots: 0x101512, targetSteps: 130 }
    ],
    reward: 95
  },
  {
    id: 'greece_coin',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Афинская тетрадрахма',
    museumDesc: 'Массивная серебряная монета высокой пробы с рельефным изображением совы Афины.',
    historyNote: 'Датировка: 450 г. до н.э. Главная международная валюта Средиземноморья классической эпохи.',
    textureKey: 'art_greece_coin',
    phases: [
      { name: 'Снятие минерального налета', color: 0x555853, spots: 0x333632, targetSteps: 150 },
      { name: 'Смывка темного сульфида', color: 0x3b3d3a, spots: 0x212320, targetSteps: 130 },
      { name: 'Серебряный глянец', color: 0x262725, spots: 0x151614, targetSteps: 110 }
    ],
    reward: 90
  },

  // --- ЕВРОПА ---
  {
    id: 'europe_shield',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Рыцарский щит',
    museumDesc: 'Турнирный тарч из слоеной кричной стали с геральдическим крестом.',
    historyNote: 'Датировка: 1242 г. Использовался рыцарем ордена в пеших турнирных поединках.',
    textureKey: 'art_europe_shield',
    phases: [
      { name: 'Снятие пластовой ржавчины', color: 0x5a3d2e, spots: 0x7c2b18, targetSteps: 190 },
      { name: 'Очистка от копоти', color: 0x35312d, spots: 0x1c1917, targetSteps: 150 },
      { name: 'Зеркальная наводка стали', color: 0x2a2826, spots: 0x121110, targetSteps: 130 }
    ],
    reward: 110
  },
  {
    id: 'europe_sword',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Меч крестоносца',
    museumDesc: 'Полуторный меч с дисковидным навершием и гравировкой девиза на доле клинка.',
    historyNote: 'Датировка: конец XIII в. Превосходная узорчатая закалка с защитой от коррозии.',
    textureKey: 'art_europe_sword',
    phases: [
      { name: 'Удаление окалины и глины', color: 0x483a30, spots: 0x2b2018, targetSteps: 200 },
      { name: 'Кислотная нейтрализация', color: 0x312923, spots: 0x1b1612, targetSteps: 160 },
      { name: 'Алмазная доводка лезвия', color: 0x221c17, spots: 0x100d0a, targetSteps: 130 }
    ],
    reward: 130
  },
  {
    id: 'europe_chalice',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Готический потир',
    museumDesc: 'Церковный кубок из золоченого серебра, инкрустированный гранатами и эмалью.',
    historyNote: 'Датировка: XIV в. Шедевр пражских мастеров времен правления Карла IV.',
    textureKey: 'art_europe_chalice',
    phases: [
      { name: 'Снятие застывшего воска', color: 0x524838, spots: 0x362e21, targetSteps: 170 },
      { name: 'Очистка самоцветов', color: 0x3b3325, spots: 0x221c13, targetSteps: 140 },
      { name: 'Филигранный блеск золота', color: 0x292318, spots: 0x15110a, targetSteps: 120 }
    ],
    reward: 120
  }
];
