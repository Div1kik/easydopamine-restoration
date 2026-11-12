// Генератор уникальной временной метки для гарантированного обхода кэша
const t = Date.now();

// Динамическая параллельная загрузка всех модулей игры
Promise.all([
  import(`./scenes/BootScene.js?t=${t}`),
  import(`./scenes/MenuScene.js?t=${t}`),
  import(`./scenes/EraSelectScene.js?t=${t}`),
  import(`./scenes/RestoreScene.js?t=${t}`),
  import(`./scenes/VictoryScene.js?t=${t}`),
  import(`./scenes/ShopScene.js?t=${t}`),
  import(`./scenes/MuseumScene.js?t=${t}`),
  import(`./utils/AudioManager.js?t=${t}`)
]).then(([
  { BootScene },
  { MenuScene },
  { EraSelectScene },
  { RestoreScene },
  { VictoryScene },
  { ShopScene },
  { MuseumScene },
  { AudioManager }
]) => {
  const unlockAudio = () => {
    AudioManager.unlockAudio();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);

  const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#0d0906',
    render: {
      antialias: true,
      antialiasGL: true,
      pixelArt: false,
      roundPixels: false,
      powerPreference: 'high-performance'
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 480,
      height: 800,
      zoom: Math.min(window.devicePixelRatio || 1, 2)
    },
    input: {
      activePointers: 2
    },
    scene: [
      BootScene,
      MenuScene,
      EraSelectScene,
      RestoreScene,
      VictoryScene,
      ShopScene,
      MuseumScene
    ]
  };

  new Phaser.Game(config);
}).catch((err) => {
  console.error('Ошибка инициализации игры:', err);
});
