export const ERAS = [
  { id: 'egypt', name: 'Древний Египет', order: 0, accentColor: '#d4af37' },
  { id: 'greece', name: 'Античная Греция', order: 1, accentColor: '#e67e22' },
  { id: 'europe', name: 'Средневековая Европа', order: 2, accentColor: '#3498db' },
  { id: 'japan', name: 'Феодальная Япония', order: 3, accentColor: '#c0392b' }
];

export const ARTIFACTS = [
  // ===================== ДРЕВНИЙ ЕГИПЕТ (9) =====================
  {
    id: 'egypt_scarab',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Золотой скарабей',
    museumDesc: 'Священный символ возрождения из царской гробницы Фив.',
    historyNote: 'Датировка: около 1330 г. до н.э. Амулет из нубийского золота с афганским лазуритом.',
    textureKey: 'art_egypt_scarab',
    phases: [
      { name: 'Снятие песчаника', color: 0xb59846, spots: 0x8a722e, targetSteps: 260 },
      { name: 'Смывка солей', color: 0x6e684d, spots: 0x3d3929, targetSteps: 180 },
      { name: 'Золотая полировка', color: 0x4a432b, spots: 0x2b2718, targetSteps: 120 }
    ],
    reward: 60
  },
  {
    id: 'egypt_mask',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Маска Тутанхамона',
    museumDesc: 'Чеканная золотая маска с полосами из лазурита и бирюзы.',
    historyNote: 'Датировка: 1323 г. до н.э. Шедевр ювелирного искусства эпохи Нового царства.',
    textureKey: 'art_egypt_mask',
    phases: [
      { name: 'Снятие глины и битума', color: 0x8a6a3b, spots: 0x4d371a, targetSteps: 300 },
      { name: 'Очистка бирюзы', color: 0x4d5b51, spots: 0x26332a, targetSteps: 190 },
      { name: 'Глянец золота', color: 0x3a3320, spots: 0x1f1b11, targetSteps: 130 }
    ],
    reward: 90
  },
  {
    id: 'egypt_ankh',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Обрядовый Анкх',
    museumDesc: 'Бронзовый кованый крест вечной жизни с барельефом Исиды.',
    historyNote: 'Датировка: XII в. до н.э. Использовался верховными жрецами храма Амона.',
    textureKey: 'art_egypt_ankh',
    phases: [
      { name: 'Снятие корки песка', color: 0xa88f4d, spots: 0x6e5b2c, targetSteps: 250 },
      { name: 'Смывка карбонатов', color: 0x545244, spots: 0x2e2c24, targetSteps: 170 },
      { name: 'Патинирование бронзы', color: 0x3b3323, spots: 0x1f1b12, targetSteps: 110 }
    ],
    reward: 70
  },
  {
    id: 'egypt_nefertiti',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Бюст царицы Нефертити',
    museumDesc: 'Расписной известняковый портрет великой супруги фараона Эхнатона.',
    historyNote: 'Датировка: 1345 г. до н.э. Скульптурная мастерская Тутмоса в Ахетатоне.',
    textureKey: 'art_egypt_nefertiti',
    phases: [
      { name: 'Удаление вековой пыли', color: 0x9c825a, spots: 0x5c4a30, targetSteps: 280 },
      { name: 'Смывка налета с пигмента', color: 0x5c5040, spots: 0x302a20, targetSteps: 180 },
      { name: 'Фиксация красок', color: 0x3b3328, spots: 0x1d1913, targetSteps: 120 }
    ],
    reward: 100
  },
  {
    id: 'egypt_eye',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Око Гора (Уаджет)',
    museumDesc: 'Защитный амулет из золота с инкрустацией цветным стеклом.',
    historyNote: 'Символ исцеления и царской власти, защищающий владельца от любого зла.',
    textureKey: 'art_egypt_eye',
    phases: [
      { name: 'Снятие окалины', color: 0x8a7442, spots: 0x4f401f, targetSteps: 240 },
      { name: 'Смывка солей', color: 0x4f4738, spots: 0x2e271d, targetSteps: 160 },
      { name: 'Полировка эмали', color: 0x383022, spots: 0x1c170f, targetSteps: 110 }
    ],
    reward: 75
  },
  {
    id: 'egypt_canopic',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Канопа Анубиса',
    museumDesc: 'Алебастровый сосуд с головой шакала для заупокойных ритуалов.',
    historyNote: 'Датировка: около 1250 г. до н.э. Охранял подношения бога бальзамирования.',
    textureKey: 'art_egypt_canopic',
    phases: [
      { name: 'Снятие спекшейся смолы', color: 0x735e39, spots: 0x3d2f17, targetSteps: 290 },
      { name: 'Очистка алебастра', color: 0x4f483c, spots: 0x2b271f, targetSteps: 190 },
      { name: 'Вощение камня', color: 0x332e25, spots: 0x1a1712, targetSteps: 125 }
    ],
    reward: 85
  },
  {
    id: 'egypt_khopesh',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Серповидный меч Хопеш',
    museumDesc: 'Бронзовый серповидный клинок элитной гвардии фараона Рамсеса II.',
    historyNote: 'Сочетал рубящую мощь боевого топора и дистанцию длинного клинка.',
    textureKey: 'art_egypt_khopesh',
    phases: [
      { name: 'Снятие коррозии', color: 0x6e633d, spots: 0x40371a, targetSteps: 270 },
      { name: 'Химическая ванна', color: 0x47422f, spots: 0x262316, targetSteps: 175 },
      { name: 'Доводка бронзового лезвия', color: 0x302b1c, spots: 0x17140b, targetSteps: 115 }
    ],
    reward: 95
  },
  {
    id: 'egypt_sistrum',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Храмовый Систр Бастет',
    museumDesc: 'Музыкальная трещотка жриц богини радости с кошачьими барельефами.',
    historyNote: 'Звук металлических пластин изгонял злых духов Сета во время праздников.',
    textureKey: 'art_egypt_sistrum',
    phases: [
      { name: 'Удаление речной ила', color: 0x756847, spots: 0x42381f, targetSteps: 250 },
      { name: 'Смывка окислов', color: 0x4f4735, spots: 0x2b2519, targetSteps: 165 },
      { name: 'Полировка дисков', color: 0x332d1e, spots: 0x17140b, targetSteps: 110 }
    ],
    reward: 80
  },
  {
    id: 'egypt_sphinx',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Золотой мини-Сфинкс',
    museumDesc: 'Ювелирная статуэтка стража пирамид с телом льва и ликом фараона.',
    historyNote: 'Погребальный дар из тайной сокровищницы в Долине Царей.',
    textureKey: 'art_egypt_sphinx',
    phases: [
      { name: 'Снятие корки песка', color: 0x8a723b, spots: 0x4f3d17, targetSteps: 310 },
      { name: 'Ультразвуковая промывка', color: 0x544a33, spots: 0x2e2716, targetSteps: 195 },
      { name: 'Сияние чистого золота', color: 0x3b321e, spots: 0x1a150a, targetSteps: 130 }
    ],
    reward: 120
  },

  // ===================== АНТИЧНАЯ ГРЕЦИЯ (9) =====================
  {
    id: 'greece_amphora',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Аттическая амфора',
    museumDesc: 'Сосуд для оливкового масла с чернофигурной росписью V в. до н.э.',
    historyNote: 'Датировка: 470 г. до н.э. Поднята со дна затонувшей триремы.',
    textureKey: 'art_greece_amphora',
    phases: [
      { name: 'Снятие известкового налета', color: 0x4a5b50, spots: 0x26382c, targetSteps: 270 },
      { name: 'Смывка солей', color: 0x344238, spots: 0x1d2921, targetSteps: 180 },
      { name: 'Вощение терракоты', color: 0x2d3b36, spots: 0x141a15, targetSteps: 120 }
    ],
    reward: 85
  },
  {
    id: 'greece_helmet',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Коринфский шлем',
    museumDesc: 'Бронзовый шлем спартанского гоплита с алым гребнем.',
    historyNote: 'Датировка: 480 г. до н.э. Памятник доблести времен Фермопильского сражения.',
    textureKey: 'art_greece_helmet',
    phases: [
      { name: 'Снятие слоя земли', color: 0x444b42, spots: 0x252c23, targetSteps: 290 },
      { name: 'Удаление оксидов', color: 0x2d3a33, spots: 0x17211b, targetSteps: 185 },
      { name: 'Полировка античной бронзы', color: 0x202923, spots: 0x101512, targetSteps: 125 }
    ],
    reward: 105
  },
  {
    id: 'greece_coin',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Афинская тетрадрахма',
    museumDesc: 'Серебряная монета высокой пробы со священной совой Афины.',
    historyNote: 'Датировка: 450 г. до н.э. Международная валюта античного Средиземноморья.',
    textureKey: 'art_greece_coin',
    phases: [
      { name: 'Снятие патины', color: 0x555853, spots: 0x333632, targetSteps: 240 },
      { name: 'Нейтрализация сульфидов', color: 0x3b3d3a, spots: 0x212320, targetSteps: 160 },
      { name: 'Серебряный глянец', color: 0x262725, spots: 0x151614, targetSteps: 110 }
    ],
    reward: 90
  },
  {
    id: 'greece_shield',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Щит Спартанца (Аспис)',
    museumDesc: 'Круглый тяжелый щит из дуба, окованный медью, с буквой «Лямбда».',
    historyNote: '«Со щитом или на щите» — основа несокрушимой спартанской фаланги.',
    textureKey: 'art_greece_shield',
    phases: [
      { name: 'Удаление нагара', color: 0x4a433a, spots: 0x29231c, targetSteps: 300 },
      { name: 'Смывка следов крови и смолы', color: 0x332c25, spots: 0x1a1511, targetSteps: 190 },
      { name: 'Полировка медной пластины', color: 0x241d18, spots: 0x120d09, targetSteps: 130 }
    ],
    reward: 110
  },
  {
    id: 'greece_nike',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Крылатая Ника',
    museumDesc: 'Паросская мраморная статуэтка богини победы в летящих одеждах.',
    historyNote: 'Эллинистический триумфальный монумент морских побед у острова Самотраки.',
    textureKey: 'art_greece_nike',
    phases: [
      { name: 'Снятие морских отложений', color: 0x545752, spots: 0x313630, targetSteps: 280 },
      { name: 'Бережная очистка пор мрамора', color: 0x3b3e39, spots: 0x20241f, targetSteps: 180 },
      { name: 'Матовая полировка камня', color: 0x252824, spots: 0x131612, targetSteps: 120 }
    ],
    reward: 115
  },
  {
    id: 'greece_lamp',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Светильник Олимпии',
    museumDesc: 'Глиняный масляный светильник с рельефным орнаментом оливковых ветвей.',
    historyNote: 'Освещал ночные бдения атлетов в храме Зевса Олимпийского.',
    textureKey: 'art_greece_lamp',
    phases: [
      { name: 'Снятие спекшейся копоти', color: 0x383028, spots: 0x1f1a14, targetSteps: 250 },
      { name: 'Смывка застывшего масла', color: 0x29221a, spots: 0x14100b, targetSteps: 165 },
      { name: 'Восстановление керамики', color: 0x1a140d, spots: 0x0a0703, targetSteps: 110 }
    ],
    reward: 80
  },
  {
    id: 'greece_discus',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Бронзовый диск метателя',
    museumDesc: 'Тяжелый снаряд олимпийских игр с гравировкой дельфина.',
    historyNote: 'Датировка: VI в. до н.э. Символ гармонии силы и грации в гимнасиях.',
    textureKey: 'art_greece_discus',
    phases: [
      { name: 'Снятие корки окислов', color: 0x485246, spots: 0x283026, targetSteps: 260 },
      { name: 'Очистка гравировки', color: 0x323a30, spots: 0x1a2119, targetSteps: 170 },
      { name: 'Полировка металла', color: 0x20261f, spots: 0x0f140e, targetSteps: 115 }
    ],
    reward: 90
  },
  {
    id: 'greece_kylix',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Килик Диониса',
    museumDesc: 'Широкая плоская чаша для вина с изображением виноградных лоз.',
    historyNote: 'Использовалась на афинских симпосиях для философских бесед.',
    textureKey: 'art_greece_kylix',
    phases: [
      { name: 'Снятие солевого осадка', color: 0x4d4239, spots: 0x2e251e, targetSteps: 250 },
      { name: 'Промывка глазури', color: 0x332a22, spots: 0x1c150f, targetSteps: 160 },
      { name: 'Блеск терракоты', color: 0x211a13, spots: 0x100b06, targetSteps: 110 }
    ],
    reward: 85
  },
  {
    id: 'greece_lyre',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Лира Аполлона',
    museumDesc: 'Корпус струнного инструмента из панциря черепахи с золотыми накладками.',
    historyNote: 'По преданию, создана богом Гермесом и подарена покровителю муз.',
    textureKey: 'art_greece_lyre',
    phases: [
      { name: 'Удаление пыли веков', color: 0x544738, spots: 0x33291d, targetSteps: 290 },
      { name: 'Очистка панциря', color: 0x382d20, spots: 0x1f170e, targetSteps: 185 },
      { name: 'Полировка золотых рожков', color: 0x241a0f, spots: 0x120c06, targetSteps: 125 }
    ],
    reward: 120
  },

  // ===================== СРЕДНЕВЕКОВАЯ ЕВРОПА (9) =====================
  {
    id: 'europe_shield',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Рыцарский щит',
    museumDesc: 'Турнирный тарч из слоеной кричной стали с геральдическим крестом.',
    historyNote: 'Датировка: 1242 г. Использовался рыцарем в пеших поединках.',
    textureKey: 'art_europe_shield',
    phases: [
      { name: 'Снятие пластовой ржавчины', color: 0x5a3d2e, spots: 0x7c2b18, targetSteps: 280 },
      { name: 'Очистка от копоти', color: 0x35312d, spots: 0x1c1917, targetSteps: 180 },
      { name: 'Зеркальная наводка стали', color: 0x2a2826, spots: 0x121110, targetSteps: 120 }
    ],
    reward: 110
  },
  {
    id: 'europe_sword',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Меч крестоносца',
    museumDesc: 'Полуторный меч с дисковидным навершием и гравировкой на доле.',
    historyNote: 'Датировка: конец XIII в. Слоеная дамасская ковка рыцарей ордена.',
    textureKey: 'art_europe_sword',
    phases: [
      { name: 'Снятие окалины и глины', color: 0x483a30, spots: 0x2b2018, targetSteps: 300 },
      { name: 'Кислотная нейтрализация', color: 0x312923, spots: 0x1b1612, targetSteps: 190 },
      { name: 'Алмазная доводка клинка', color: 0x221c17, spots: 0x100d0a, targetSteps: 125 }
    ],
    reward: 130
  },
  {
    id: 'europe_chalice',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Готический потир',
    museumDesc: 'Золоченый церковный кубок, украшенный гранатами и эмалью.',
    historyNote: 'Шедевр пражских мастеров времен правления императора Карла IV.',
    textureKey: 'art_europe_chalice',
    phases: [
      { name: 'Снятие застывшего воска', color: 0x524838, spots: 0x362e21, targetSteps: 260 },
      { name: 'Очистка самоцветов', color: 0x3b3325, spots: 0x221c13, targetSteps: 170 },
      { name: 'Филигранный блеск золота', color: 0x292318, spots: 0x15110a, targetSteps: 115 }
    ],
    reward: 120
  },
  {
    id: 'europe_crown',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Императорская корона',
    museumDesc: 'Золотая корона с восьмью пластинами, сапфирами и жемчугом.',
    historyNote: 'Регалия коронации монархов Священной Римской империи в Ахене.',
    textureKey: 'art_europe_crown',
    phases: [
      { name: 'Снятие старого лака', color: 0x594e36, spots: 0x38301e, targetSteps: 310 },
      { name: 'Промывка жемчуга', color: 0x3d3522, spots: 0x241d10, targetSteps: 195 },
      { name: 'Царское сияние самоцветов', color: 0x292212, spots: 0x140f06, targetSteps: 130 }
    ],
    reward: 150
  },
  {
    id: 'europe_axe',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Боевая секира',
    museumDesc: 'Тяжелый топор с широким полулунным лезвием на ясеневом топорище.',
    historyNote: 'Грозное оружие швейцарской пехоты для пробивания латных доспехов.',
    textureKey: 'art_europe_axe',
    phases: [
      { name: 'Снятие глубокой коррозии', color: 0x523d32, spots: 0x2e1f17, targetSteps: 280 },
      { name: 'Восстановление дерева', color: 0x382820, spots: 0x1f130d, targetSteps: 180 },
      { name: 'Воронение стали', color: 0x241812, spots: 0x100905, targetSteps: 120 }
    ],
    reward: 100
  },
  {
    id: 'europe_bascinet',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Шлем Бацинет «Хундсгугель»',
    museumDesc: 'Рыцарский шлем XIV века с вытянутым забралом в виде собачьей морды.',
    historyNote: 'Форма забрала эффективно отводила стрелы лучников в Столетней войне.',
    textureKey: 'art_europe_bascinet',
    phases: [
      { name: 'Снятие спекшейся грязи', color: 0x484643, spots: 0x282725, targetSteps: 290 },
      { name: 'Очистка шарниров забрала', color: 0x302f2d, spots: 0x191817, targetSteps: 185 },
      { name: 'Полировка забрала', color: 0x1f1e1d, spots: 0x0d0d0c, targetSteps: 125 }
    ],
    reward: 125
  },
  {
    id: 'europe_book',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Манускрипт в серебряном окладе',
    museumDesc: 'Рукописное Евангелие на пергаменте с коваными застежками.',
    historyNote: 'Создано монахами-скрипторами в бенедиктинском монастыре.',
    textureKey: 'art_europe_book',
    phases: [
      { name: 'Снятие плесени и пыли', color: 0x4d473d, spots: 0x2d2922, targetSteps: 270 },
      { name: 'Очистка серебряных застежек', color: 0x332f28, spots: 0x1b1814, targetSteps: 175 },
      { name: 'Консервация кожи и серебра', color: 0x211e19, spots: 0x0f0e0b, targetSteps: 115 }
    ],
    reward: 110
  },
  {
    id: 'europe_gauntlet',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Латная рыцарская перчатка',
    museumDesc: 'Шарнирная рукавица из наборных стальных пластин миланской работы.',
    historyNote: 'Обеспечивала подвижность каждого пальца при несокрушимой защите кисти.',
    textureKey: 'art_europe_gauntlet',
    phases: [
      { name: 'Удаление застывшей смазки', color: 0x4a4742, spots: 0x2b2926, targetSteps: 280 },
      { name: 'Размягчение внутренних заклепок', color: 0x302f2b, spots: 0x191816, targetSteps: 180 },
      { name: 'Зеркальный блеск сегментов', color: 0x1e1d1b, spots: 0x0d0c0b, targetSteps: 120 }
    ],
    reward: 115
  },
  {
    id: 'europe_horn',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Ритуальный рог викинга',
    museumDesc: 'Рог тура в серебряной чеканной оправе с узловым нордическим узором.',
    historyNote: 'Использовался конунгами на пирах в Вальхалле и боевых сходах тинга.',
    textureKey: 'art_europe_horn',
    phases: [
      { name: 'Снятие земляной корки', color: 0x54493b, spots: 0x332b21, targetSteps: 290 },
      { name: 'Промывка рунической чеканки', color: 0x382f24, spots: 0x1e1811, targetSteps: 185 },
      { name: 'Полировка серебряного раструба', color: 0x241d14, spots: 0x100b06, targetSteps: 125 }
    ],
    reward: 135
  },

  // ===================== ФЕОДАЛЬНАЯ ЯПОНИЯ (9) =====================
  {
    id: 'japan_katana',
    eraId: 'japan',
    eraName: 'Феодальная Япония',
    name: 'Катана самурая',
    museumDesc: 'Клинок школы Бидзэн с волнообразной линией закалки (хамон).',
    historyNote: 'Датировка: рубеж XVI–XVII вв. Семейная реликвия дома воинов.',
    textureKey: 'art_japan_katana',
    phases: [
      { name: 'Снятие застывшего масла гвоздики', color: 0x3d3935, spots: 0x1f1d1b, targetSteps: 290 },
      { name: 'Обработка пудрой утико', color: 0x2b2b28, spots: 0x141413, targetSteps: 185 },
      { name: 'Проявление линии хамона', color: 0x1f1e1c, spots: 0x0f0f0e, targetSteps: 125 }
    ],
    reward: 140
  },
  {
    id: 'japan_mask',
    eraId: 'japan',
    eraName: 'Феодальная Япония',
    name: 'Маска Мэнгу',
    museumDesc: 'Боевая полумаска воина с алым лаком уруси и клыками Они.',
    historyNote: 'Датировка: 1590 г. Создана для устрашения врага в битве при Сэкигахара.',
    textureKey: 'art_japan_mask',
    phases: [
      { name: 'Снятие полевого пепла', color: 0x422a27, spots: 0x241615, targetSteps: 300 },
      { name: 'Очистка клыков демона', color: 0x2d1f1e, spots: 0x170f0e, targetSteps: 190 },
      { name: 'Глянцевое вощение лака', color: 0x1f1514, spots: 0x0d0908, targetSteps: 130 }
    ],
    reward: 160
  },
  {
    id: 'japan_netsuke',
    eraId: 'japan',
    eraName: 'Феодальная Япония',
    name: 'Нэцкэ «Дракон»',
    museumDesc: 'Резная миниатюра из слоновой кости со свернувшимся драконом.',
    historyNote: 'XVII в., ранняя эпоха Эдо. Брелок-противовес для крепления кисета на поясе.',
    textureKey: 'art_japan_netsuke',
    phases: [
      { name: 'Удаление пыли из микротрещин', color: 0x5a5345, spots: 0x38332b, targetSteps: 260 },
      { name: 'Мыльная чистка чешуи', color: 0x3d3930, spots: 0x24211b, targetSteps: 170 },
      { name: 'Шелковая полировка кости', color: 0x2b2822, spots: 0x141310, targetSteps: 115 }
    ],
    reward: 130
  },
  {
    id: 'japan_kabuto',
    eraId: 'japan',
    eraName: 'Феодальная Япония',
    name: 'Шлем Кабуто с золотым полумесяцем',
    museumDesc: 'Многопластинчатый шлем даймё с массивным навершием маэдатэ.',
    historyNote: 'Принадлежал полководцу клана Датэ. Символ несгибаемой воли.',
    textureKey: 'art_japan_kabuto',
    phases: [
      { name: 'Снятие нагара', color: 0x3e3733, spots: 0x201c1a, targetSteps: 310 },
      { name: 'Очистка шелковых шнуров одоси', color: 0x292421, spots: 0x141110, targetSteps: 195 },
      { name: 'Блеск золотого полумесяца', color: 0x1a1715, spots: 0x0a0807, targetSteps: 130 }
    ],
    reward: 170
  },
  {
    id: 'japan_tessen',
    eraId: 'japan',
    eraName: 'Феодальная Япония',
    name: 'Боевой стальной веер Тэссэн',
    museumDesc: 'Складной веер с массивными коваными стальными спицами самурая.',
    historyNote: 'Оружие скрытого ношения во дворцах, где запрещались мечи.',
    textureKey: 'art_japan_tessen',
    phases: [
      { name: 'Снятие ржавчины со спиц', color: 0x473934, spots: 0x271e1b, targetSteps: 270 },
      { name: 'Бережная очистка бумаги васи', color: 0x302622, spots: 0x191311, targetSteps: 175 },
      { name: 'Полировка золотого солнца', color: 0x1f1714, spots: 0x0d0907, targetSteps: 115 }
    ],
    reward: 135
  },
  {
    id: 'japan_satsuma',
    eraId: 'japan',
    eraName: 'Феодальная Япония',
    name: 'Ваза Сацума',
    museumDesc: 'Фарфоровая ваза цвета слоновой кости с сеткой кракелюра и золотой росписью.',
    historyNote: 'Изготовлена мастерами провинции Сацума для чайных церемоний.',
    textureKey: 'art_japan_satsuma',
    phases: [
      { name: 'Смывка копоти', color: 0x4f473c, spots: 0x2d2821, targetSteps: 280 },
      { name: 'Очистка тончайшего кракелюра', color: 0x363027, spots: 0x1d1914, targetSteps: 180 },
      { name: 'Восстановление золочения', color: 0x221d17, spots: 0x100d09, targetSteps: 120 }
    ],
    reward: 145
  },
  {
    id: 'japan_tanto',
    eraId: 'japan',
    eraName: 'Феодальная Япония',
    name: 'Кинжал Танто в ножнах Айкути',
    museumDesc: 'Короткий нож с гравировкой дракона на клинке и полированными ножнами.',
    historyNote: 'Личное статусное оружие высшей самурайской знати.',
    textureKey: 'art_japan_tanto',
    phases: [
      { name: 'Снятие застывшего лака', color: 0x403632, spots: 0x231d1a, targetSteps: 280 },
      { name: 'Полировка ската на рукояти', color: 0x2c2421, spots: 0x161210, targetSteps: 180 },
      { name: 'Заточка клинка до зеркала', color: 0x1a1412, spots: 0x0c0908, targetSteps: 120 }
    ],
    reward: 140
  },
  {
    id: 'japan_box',
    eraId: 'japan',
    eraName: 'Феодальная Япония',
    name: 'Шкатулка Уруси с золотой пылью',
    museumDesc: 'Ларец в технике маки-э с изображением цветущей сакуры.',
    historyNote: 'Каждый слой натурального лака сох неделями в сырой темной комнате.',
    textureKey: 'art_japan_box',
    phases: [
      { name: 'Удаление векового налета', color: 0x473432, spots: 0x281c1a, targetSteps: 290 },
      { name: 'Смывка микрооксидов с золота', color: 0x302220, spots: 0x1a1211, targetSteps: 185 },
      { name: 'Масляная наводка черного лака', color: 0x1c1211, spots: 0x0d0706, targetSteps: 125 }
    ],
    reward: 155
  },
  {
    id: 'japan_bell',
    eraId: 'japan',
    eraName: 'Феодальная Япония',
    name: 'Храмовый колокол Бонсё',
    museumDesc: 'Бронзовый колокол с рельефными шипами-сосками и благопожелательными кандзи.',
    historyNote: 'Его глубокий звук в буддийских храмах Киото отсчитывал 108 земных страстей.',
    textureKey: 'art_japan_bell',
    phases: [
      { name: 'Снятие плотной патины', color: 0x3d473d, spots: 0x212921, targetSteps: 320 },
      { name: 'Промывка иероглифов', color: 0x293329, spots: 0x141c14, targetSteps: 200 },
      { name: 'Бронзовое сияние', color: 0x182118, spots: 0x0b120b, targetSteps: 135 }
    ],
    reward: 180
  }
];
