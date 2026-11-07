export const ARTIFACTS = [
  {
    id: 'egypt_scarab',
    eraId: 'egypt',
    eraName: 'Древний Египет',
    name: 'Золотой скарабей',
    museumDesc: 'Священный символ возрождения из гробницы Нового царства. Изготовлен из чистого нубийского золота с инкрустацией афганским лазуритом.',
    historyNote: 'Датировка: около 1330 г. до н.э. Использовался как защитный нагрудный пектораль жрецов солнца.',
    textureKey: 'art_egypt_scarab',
    phases: [
      { name: 'Снятие песчаника', toolType: 'brush', color: 0xb59846, spots: 0x8a722e, targetSteps: 180 },
      { name: 'Смывка солей', toolType: 'sponge', color: 0x6e684d, spots: 0x3d3929, targetSteps: 150 },
      { name: 'Золотая полировка', toolType: 'cloth', color: 0x4a432b, spots: 0x2b2718, targetSteps: 130 }
    ],
    reward: 60
  },
  {
    id: 'greece_amphora',
    eraId: 'greece',
    eraName: 'Античная Греция',
    name: 'Аттическая амфора',
    museumDesc: 'Сосуд для оливкового масла с чернофигурной росписью V в. до н.э., поднятый с затонувшего трирема.',
    historyNote: 'Датировка: 470 г. до н.э. На фризе изображены состязания древнегреческих атлетов в беге.',
    textureKey: 'art_greece_amphora',
    phases: [
      { name: 'Удаление ракушечника', toolType: 'brush', color: 0x4a5b50, spots: 0x26382c, targetSteps: 190 },
      { name: 'Растворение налета', toolType: 'sponge', color: 0x344238, spots: 0x1d2921, targetSteps: 160 },
      { name: 'Вощение керамики', toolType: 'cloth', color: 0x2d3b36, spots: 0x141a15, targetSteps: 130 }
    ],
    reward: 90
  },
  {
    id: 'europe_shield',
    eraId: 'europe',
    eraName: 'Средневековая Европа',
    name: 'Рыцарский щит',
    museumDesc: 'Турнирный щит с геральдическим крестом. Кованая сталь с остатками темного защитного лака.',
    historyNote: 'Датировка: 1242 г. Принадлежал рыцарю ордена. Выкован из слоеной кричной стали.',
    textureKey: 'art_europe_shield',
    phases: [
      { name: 'Снятие ржавчины', toolType: 'brush', color: 0x5a3d2e, spots: 0x7c2b18, targetSteps: 200 },
      { name: 'Очистка от копоти', toolType: 'sponge', color: 0x35312d, spots: 0x1c1917, targetSteps: 160 },
      { name: 'Зеркальная наводка', toolType: 'cloth', color: 0x2a2826, spots: 0x121110, targetSteps: 140 }
    ],
    reward: 120
  }
];
