export const ERAS = [
  { id: 'egypt', name: 'Древний Египет', order: 0, accentColor: '#d4af37' },
  { id: 'greece', name: 'Античная Греция', order: 1, accentColor: '#e67e22' },
  { id: 'europe', name: 'Средневековая Европа', order: 2, accentColor: '#3498db' },
  { id: 'japan', name: 'Феодальная Япония', order: 3, accentColor: '#c0392b' }
];

export const ARTIFACTS = [
  // ===================== ЕГИПЕТ =====================
  {
    id: 'egypt_scarab',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Золотой скарабей',
    museumDesc: 'Священный символ возрождения из царской гробницы Фив.',
    textureKey: 'art_egypt_scarab',
    tasks: [
      {
        type: 'clean',
        id: 'sand',
        name: 'Срезать пласт песчаника',
        requiredTool: 'tool_scraper',
        hint: 'Используйте СКРЕБОК для окаменелого песка',
        color: 0xb59846,
        target: 200
      },
      {
        type: 'clean',
        id: 'salt',
        name: 'Растворить вековой солевой налет',
        requiredTool: 'tool_solvent',
        hint: 'Используйте РАСТВОРИТЕЛЬ для смывки солей',
        color: 0x6e684d,
        target: 170
      },
      {
        type: 'clean',
        id: 'polish',
        name: 'Отполировать золото и лазурит',
        requiredTool: 'tool_polish',
        hint: 'Используйте ЗАМШУ для финишного блеска',
        color: 0x4a432b,
        target: 140
      }
    ],
    reward: 120
  },
  {
    id: 'egypt_mask',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Маска Тутанхамона',
    museumDesc: 'Чеканная золотая маска с инкрустацией лазуритом.',
    textureKey: 'art_egypt_mask',
    tasks: [
      {
        type: 'clean',
        id: 'clay',
        name: 'Счистить окаменевший битум',
        requiredTool: 'tool_scraper',
        hint: 'Используйте СКРЕБОК для грубых смоляных корок',
        color: 0x78562d,
        target: 230
      },
      {
        type: 'clean',
        id: 'wash',
        name: 'Смыть налет с бирюзы и эмали',
        requiredTool: 'tool_solvent',
        hint: 'Используйте РАСТВОРИТЕЛЬ для бережной промывки',
        color: 0x42524a,
        target: 180
      },
      {
        type: 'clean',
        id: 'polish',
        name: 'Навести зеркальный блеск на венец',
        requiredTool: 'tool_polish',
        hint: 'Используйте ЗАМШУ для золотого венца',
        color: 0x332d1c,
        target: 150
      }
    ],
    reward: 150
  },
  {
    id: 'egypt_ankh',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Обрядовый Анкх',
    museumDesc: 'Бронзовый кованый крест вечной жизни.',
    textureKey: 'art_egypt_ankh',
    tasks: [
      {
        type: 'clean',
        id: 'crust',
        name: 'Снять известковую корку',
        requiredTool: 'tool_scraper',
        hint: 'Используйте СКРЕБОК против плотных отложений',
        color: 0x9c8344,
        target: 200
      },
      {
        type: 'clean',
        id: 'wash',
        name: 'Нейтрализовать окислы бронзы',
        requiredTool: 'tool_solvent',
        hint: 'Используйте РАСТВОРИТЕЛЬ для химической ванны',
        color: 0x47493a,
        target: 160
      },
      {
        type: 'clean',
        id: 'polish',
        name: 'Полировка священных символов',
        requiredTool: 'tool_polish',
        hint: 'Используйте ЗАМШУ для наводки глянца',
        color: 0x2b2518,
        target: 130
      }
    ],
    reward: 130
  },

  // ===================== ГРЕЦИЯ =====================
  {
    id: 'greece_amphora',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Аттическая амфора',
    museumDesc: 'Сосуд для оливкового масла с чернофигурной росписью V в. до н.э.',
    textureKey: 'art_greece_amphora',
    tasks: [
      {
        type: 'clean',
        id: 'scale',
        name: 'Сколоть морской ракушечник',
        requiredTool: 'tool_scraper',
        hint: 'Используйте СКРЕБОК против ракушечника',
        color: 0x48574c,
        target: 220
      },
      {
        type: 'clean',
        id: 'wash',
        name: 'Промыть терракоту от солей',
        requiredTool: 'tool_solvent',
        hint: 'Используйте РАСТВОРИТЕЛЬ для очистки глины',
        color: 0x2f3d33,
        target: 170
      },
      {
        type: 'assemble',
        id: 'glue_piece',
        name: 'Склеить отколотый черепок горлышка',
        requiredTool: 'tool_glue',
        hint: 'Нанесите КЛЕЙ на трещину, затем приложите осколок',
        shardTexture: 'shard_amphora',
        targetX: 195,
        targetY: 175
      },
      {
        type: 'clean',
        id: 'polish',
        name: 'Заполировать шов и вощить керамику',
        requiredTool: 'tool_polish',
        hint: 'Используйте ЗАМШУ для финишной полировки',
        color: 0x242e2b,
        target: 140
      }
    ],
    reward: 180
  },
  {
    id: 'greece_helmet',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Коринфский шлем',
    museumDesc: 'Бронзовый шлем спартанского воина.',
    textureKey: 'art_greece_helmet',
    tasks: [
      {
        type: 'clean',
        id: 'dirt',
        name: 'Счистить спекшийся полевой грунт',
        requiredTool: 'tool_scraper',
        hint: 'Используйте СКРЕБОК против твердого грунта',
        color: 0x3d4239,
        target: 230
      },
      {
        type: 'clean',
        id: 'chem',
        name: 'Смыть зеленую оксидную патину',
        requiredTool: 'tool_solvent',
        hint: 'Используйте РАСТВОРИТЕЛЬ для смывки патины',
        color: 0x25302a,
        target: 170
      },
      {
        type: 'clean',
        id: 'polish',
        name: 'Полировка до боевого бронзового сияния',
        requiredTool: 'tool_polish',
        hint: 'Используйте ЗАМШУ для полировки купола',
        color: 0x1a211c,
        target: 140
      }
    ],
    reward: 160
  },
  {
    id: 'greece_coin',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Афинская тетрадрахма',
    museumDesc: 'Массивная серебряная монета со священной совой Афины.',
    textureKey: 'art_greece_coin',
    tasks: [
      {
        type: 'clean',
        id: 'crust',
        name: 'Снять твердые минеральные наросты',
        requiredTool: 'tool_scraper',
        hint: 'Используйте СКРЕБОК для минеральной корки',
        color: 0x4d504b,
        target: 190
      },
      {
        type: 'clean',
        id: 'wash',
        name: 'Нейтрализовать черный сульфид серебра',
        requiredTool: 'tool_solvent',
        hint: 'Используйте РАСТВОРИТЕЛЬ для сульфидов',
        color: 0x313330,
        target: 150
      },
      {
        type: 'clean',
        id: 'polish',
        name: 'Серебряный глянец барельефа совы',
        requiredTool: 'tool_polish',
        hint: 'Используйте ЗАМШУ для чеканного рельефа',
        color: 0x1d1e1c,
        target: 120
      }
    ],
    reward: 140
  },

  // ===================== ЕВРОПА =====================
  {
    id: 'europe_shield',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Рыцарский щит',
    museumDesc: 'Турнирный тарч из кричной стали с геральдическим крестом.',
    textureKey: 'art_europe_shield',
    tasks: [
      {
        type: 'clean',
        id: 'rust',
        name: 'Счистить пластовую рыхлую ржавчину',
        requiredTool: 'tool_scraper',
        hint: 'Используйте СКРЕБОК для чешуйчатой ржавчины',
        color: 0x543627,
        target: 240
      },
      {
        type: 'clean',
        id: 'wash',
        name: 'Смыть копоть пожарищ и старый лак',
        requiredTool: 'tool_solvent',
        hint: 'Используйте РАСТВОРИТЕЛЬ для копоти',
        color: 0x2b2723,
        target: 180
      },
      {
        type: 'clean',
        id: 'paint',
        name: 'Восстановить стертый красный крест',
        requiredTool: 'tool_brush',
        hint: 'Используйте КРАСКУ для гербового узора',
        color: 0xa83224,
        target: 130
      },
      {
        type: 'clean',
        id: 'polish',
        name: 'Навести зеркальный блеск на оковку',
        requiredTool: 'tool_polish',
        hint: 'Используйте ЗАМШУ для стальных граней',
        color: 0x211f1e,
        target: 140
      }
    ],
    reward: 200
  },
  {
    id: 'europe_sword',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Меч крестоносца',
    museumDesc: 'Полуторный меч с дисковидным навершием и гравировкой.',
    textureKey: 'art_europe_sword',
    tasks: [
      {
        type: 'clean',
        id: 'scale',
        name: 'Снять глубокую окалину и коррозию лезвия',
        requiredTool: 'tool_scraper',
        hint: 'Используйте СКРЕБОК по металлу',
        color: 0x403228,
        target: 250
      },
      {
        type: 'clean',
        id: 'wash',
        name: 'Кислотная нейтрализация дола клинка',
        requiredTool: 'tool_solvent',
        hint: 'Используйте РАСТВОРИТЕЛЬ для микропор стали',
        color: 0x261f1a,
        target: 170
      },
      {
        type: 'clean',
        id: 'polish',
        name: 'Алмазная полировка лезвия до блеска',
        requiredTool: 'tool_polish',
        hint: 'Используйте ЗАМШУ для зеркальной кромки',
        color: 0x17120e,
        target: 140
      }
    ],
    reward: 190
  },
  {
    id: 'europe_chalice',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Готический потир',
    museumDesc: 'Золоченый кубок с гранатами и филигранью.',
    textureKey: 'art_europe_chalice',
    tasks: [
      {
        type: 'clean',
        id: 'wax',
        name: 'Снять застывший свечной нагар и воск',
        requiredTool: 'tool_scraper',
        hint: 'Используйте СКРЕБОК против застывшего воска',
        color: 0x473d2d,
        target: 200
      },
      {
        type: 'clean',
        id: 'wash',
        name: 'Бережная очистка гнезд драгоценных камней',
        requiredTool: 'tool_solvent',
        hint: 'Используйте РАСТВОРИТЕЛЬ для промывки камней',
        color: 0x2e271b,
        target: 150
      },
      {
        type: 'clean',
        id: 'polish',
        name: 'Полировка филигранного золочения',
        requiredTool: 'tool_polish',
        hint: 'Используйте ЗАМШУ для драгоценного блеска',
        color: 0x1f190f,
        target: 120
      }
    ],
    reward: 180
  },

  // ===================== ЯПОНИЯ =====================
  {
    id: 'japan_katana',
    eraId: 'japan',
    eraName: 'Феодальная Япония',
    name: 'Катана самурая',
    museumDesc: 'Боевой клинок школы Бидзэн с волнообразным хамоном.',
    textureKey: 'art_japan_katana',
    tasks: [
      {
        type: 'clean',
        id: 'oil',
        name: 'Счистить застывшее масло чодзи и копоть',
        requiredTool: 'tool_scraper',
        hint: 'Используйте СКРЕБОК для застывшего масла',
        color: 0x332f2b,
        target: 230
      },
      {
        type: 'clean',
        id: 'wash',
        name: 'Обработать клинок пудрой утико',
        requiredTool: 'tool_solvent',
        hint: 'Используйте РАСТВОРИТЕЛЬ для удаления микроокислов',
        color: 0x242421,
        target: 170
      },
      {
        type: 'clean',
        id: 'polish',
        name: 'Проявить волнистую линию хамона',
        requiredTool: 'tool_polish',
        hint: 'Используйте ЗАМШУ для полировки стали',
        color: 0x141413,
        target: 140
      }
    ],
    reward: 220
  },
  {
    id: 'japan_mask',
    eraId: 'japan',
    eraName: 'Феодальная Япония',
    name: 'Маска Мэнгу',
    museumDesc: 'Боевая полумаска с алым лаком уруси и клыками демона.',
    textureKey: 'art_japan_mask',
    tasks: [
      {
        type: 'clean',
        id: 'ash',
        name: 'Счистить нагар и пепел осадных битв',
        requiredTool: 'tool_scraper',
        hint: 'Используйте СКРЕБОК против окалины и гари',
        color: 0x3b2421,
        target: 240
      },
      {
        type: 'clean',
        id: 'wash',
        name: 'Очистить позолоченные клыки Они',
        requiredTool: 'tool_solvent',
        hint: 'Используйте РАСТВОРИТЕЛЬ для бережной промывки',
        color: 0x241817,
        target: 170
      },
      {
        type: 'clean',
        id: 'polish',
        name: 'Глянцевое вощение лака уруси',
        requiredTool: 'tool_polish',
        hint: 'Используйте ЗАМШУ для глубины рубинового лака',
        color: 0x140d0c,
        target: 140
      }
    ],
    reward: 240
  },
  {
    id: 'japan_netsuke',
    eraId: 'japan',
    eraName: 'Феодальная Япония',
    name: 'Нэцкэ «Дракон»',
    museumDesc: 'Резная миниатюра из кости с янтарными глазами.',
    textureKey: 'art_japan_netsuke',
    tasks: [
      {
        type: 'clean',
        id: 'dust',
        name: 'Вычистить спрессованную пыль из чешуи',
        requiredTool: 'tool_scraper',
        hint: 'Используйте СКРЕБОК для глубоких пазов кости',
        color: 0x4a4336,
        target: 200
      },
      {
        type: 'clean',
        id: 'wash',
        name: 'Промыть рельеф мыльной пеной',
        requiredTool: 'tool_solvent',
        hint: 'Используйте РАСТВОРИТЕЛЬ для пор слоновой кости',
        color: 0x2e2a22,
        target: 150
      },
      {
        type: 'clean',
        id: 'polish',
        name: 'Шелковая полировка кости до фарфора',
        requiredTool: 'tool_polish',
        hint: 'Используйте ЗАМШУ для матового теплого сияния',
        color: 0x1c1913,
        target: 120
      }
    ],
    reward: 210
  }
];
