/* TOUCH RETRO 3D - corrigido para GitHub Pages */

const phases = [
  {
    name: 'Mario Kart',
    desc: 'Corrida: desvie dos obstáculos e complete voltas.',
    chars: ['🏎️ Mario', '🏎️ Luigi', '🏎️ Peach', '🏎️ Toad'],
    time: 42,
    type: 'kart',
    goal: 28
  },
  {
    name: 'Bomberman',
    desc: 'Coloque bombas, destrua blocos e abra caminho.',
    chars: ['💣 Bomberman', '⚪ White', '⚫ Black', '🩷 Pink'],
    time: 48,
    type: 'bomb',
    goal: 10
  },
  {
    name: 'Pac-Man',
    desc: 'Labirinto: pegue as bolinhas e fuja dos inimigos.',
    chars: ['🟡 Pac-Man', '🟠 Ms. Pac', '🟣 Pinky', '🔵 Inky'],
    time: 52,
    type: 'pac',
    goal: 32
  },
  {
    name: 'Super Mario Bros.',
    desc: 'Plataformas: pule obstáculos e pegue moedas.',
    chars: ['🍄 Mario', '🧢 Luigi', '👑 Peach', '🍄 Toad'],
    time: 48,
    type: 'mario',
    goal: 18
  },
  {
    name: 'Donkey Kong',
    desc: 'Suba plataformas desviando dos barris.',
    chars: ['🧢 Jumpman', '🦍 DK', '👩 Pauline', '🧢 Diddy'],
    time: 55,
    type: 'dk',
    goal: 24
  },
  {
    name: 'Street Fighter',
    desc: 'Lute contra ondas de adversários.',
    chars: ['🥋 Ryu', '🥋 Ken', '🥋 Chun-Li', '🧔 Guile'],
    time: 52,
    type: 'fight',
    goal: 3
  },
  {
    name: 'Mortal Kombat',
    desc: 'Combate: ataque e use defesa na hora certa.',
    chars: ['🔥 Scorpion', '❄️ Sub-Zero', '⚡ Raiden', '🥋 Liu Kang'],
    time: 58,
    type: 'mk',
    goal: 4
  },
  {
    name: 'Pokémon',
    desc: 'Batalha por turnos: escolha ataque e especial.',
    chars: ['⚡ Pikachu', '🔥 Charizard', '💧 Squirtle', '🌿 Bulbasaur'],
    time: 55,
    type: 'poke',
    goal: 4
  },
  {
    name: 'Sonic',
    desc: 'Corra rápido, pegue anéis e sobreviva aos obstáculos.',
    chars: ['💙 Sonic', '🦊 Tails', '🔴 Knuckles', '⚫ Shadow'],
    time: 44,
    type: 'sonic',
    goal: 35
  },
  {
    name: 'Flappy Bird',
    desc: 'Controle a altura e passe pelos canos.',
    chars: ['🐦 Bird', '🔵 Blue Bird', '🔴 Red Bird', '🟡 Yellow Bird'],
    time: 55,
    type: 'flappy',
    goal: 16
  },
  {
    name: 'Guitar Hero',
    desc: 'Acerte as notas no ritmo para fazer combo.',
    chars: ['🎸 Guitarist', '🎤 Rock Star', '🥁 Drummer', '🎸 Bass'],
    time: 50,
    type: 'guitar',
    goal: 30
  },
  {
    name: 'Retro Chaos',
    desc: 'A fase final mistura corrida, coleta, combate, salto e ritmo.',
    chars: ['⭐ Mario', '💙 Sonic', '🥋 Ryu', '⚡ Pikachu'],
    time: 70,
    type: 'final',
    goal: 55
  }
];

let unlocked = Number(
  localStorage.getItem('touchRetroUnlocked') || 1
);

unlocked = Math.max(1, Math.min(12, unlocked));

let selectedPhase = 0;
let selectedChar = 0;

let renderer;
let scene;
let camera;
let clock;
let player;

let world = new THREE.Group();

let objects = [];
let enemies = [];
let items = [];
let particles = [];

let running = false;
let paused = false;

let phaseStart = 0;
let score = 0;
let lives = 3;
let progress = 0;

let keys = {};

let joy = {
  x: 0,
  y: 0
};

let pointerAction = false;
let gameState = {};

let initialized = false;

const $ = id => document.getElementById(id);

const clamp = (v, a, b) =>
  Math.max(a, Math.min(b, v));

const rand = (a, b) =>
  a + Math.random() * (b - a);


/* =========================
   TROCAR TELAS
========================= */

function show(id) {
  document
    .querySelectorAll('.screen')
    .forEach(x => x.classList.add('hidden'));

  $(id).classList.remove('hidden');
}


/* =========================
   FASES
========================= */

function phaseCards() {

  $('phaseList').innerHTML = phases
    .map((p, i) => `
      <button
        class="phase-card ${i + 1 > unlocked ? 'locked' : ''}"
        data-i="${i}"
        ${i + 1 > unlocked ? 'disabled' : ''}
      >
        <span class="num">${i + 1}</span>
        <b>${p.name}</b>
        <span>${p.desc}</span>
      </button>
    `)
    .join('');

  document
    .querySelectorAll('.phase-card')
    .forEach(b => {

      b.onclick = () =>
        openCharacter(+b.dataset.i);

    });
}


/* =========================
   PERSONAGENS
========================= */

function openCharacter(i) {

  selectedPhase = i;
  selectedChar = 0;

  const p = phases[i];

  $('selectedPhaseLabel').textContent =
    `FASE ${i + 1}`;

  $('selectedPhaseTitle').textContent =
    p.name;

  $('characterList').innerHTML =
    p.chars
      .map((c, n) => {

        let a = c.split(' ')[0];
        let name = c.substring(a.length).trim();

        return `
          <button
            class="character ${n === 0 ? 'selected' : ''}"
            data-c="${n}"
          >
            <div class="avatar">${a}</div>
            <b>${name || c}</b>
            <small>Selecionar</small>
          </button>
        `;

      })
      .join('');

  document
    .querySelectorAll('.character')
    .forEach(b => {

      b.onclick = () => {

        selectedChar = +b.dataset.c;

        document
          .querySelectorAll('.character')
          .forEach(x =>
            x.classList.remove('selected')
          );

        b.classList.add('selected');
      };

    });

  show('characterScreen');
}


/* =========================
   BOTÕES
========================= */

$('playBtn').onclick = () =>
  openCharacter(Math.min(unlocked - 1, 11));

$('phasesBtn').onclick = () => {
  phaseCards();
  show('phaseScreen');
};

$('helpBtn').onclick = () =>
  show('helpScreen');

$('phaseBack').onclick = () =>
  show('menu');

$('helpBack').onclick = () =>
  show('menu');

$('characterBack').onclick = () =>
  show('phaseScreen');

$('startBtn').onclick = startGame;

$('pauseBtn').onclick = togglePause;


/* =========================
   INICIAR 3D
========================= */

function init3D() {

  if (initialized) return;

  initialized = true;

  scene = new THREE.Scene();

  scene.fog =
    new THREE.Fog(
      0x09101a,
      30,
      120
    );

  camera =
    new THREE.PerspectiveCamera(
      65,
      innerWidth / innerHeight,
      0.1,
      300
    );

  /* CÂMERA CORRIGIDA */

  camera.position.set(
    0,
    6,
    12
  );

  camera.lookAt(
    0,
    1,
    -10
  );

  renderer =
    new THREE.WebGLRenderer({
      antialias: true
    });

  renderer.setPixelRatio(
    Math.min(devicePixelRatio, 2)
  );

  renderer.setSize(
    innerWidth,
    innerHeight
  );

  renderer.shadowMap.enabled = true;

  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  $('scene').appendChild(
    renderer.domElement
  );

  clock = new THREE.Clock();

  scene.add(world);

  scene.add(
    new THREE.HemisphereLight(
      0xbfd7ff,
      0x18202d,
      2
    )
  );

  const sun =
    new THREE.DirectionalLight(
      0xffffff,
      3
    );

  sun.position.set(
    15,
    30,
    10
  );

  sun.castShadow = true;

  sun.shadow.mapSize.set(
    1024,
    1024
  );

  scene.add(sun);

  player =
    new THREE.Group();

  scene.add(player);

  renderer.domElement.addEventListener(
    'pointerdown',
    e => {

      if (
        running &&
        !paused &&
        e.pointerType !== 'touch'
      ) {

        doAction();

      }

    }
  );

  addEventListener(
    'resize',
    () => {

      camera.aspect =
        innerWidth / innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        innerWidth,
        innerHeight
      );

    }
  );

  bindControls();

  animate();
}


/* =========================
   MATERIAIS 3D
========================= */

function mat(
  c,
  rough = 0.7,
  metal = 0
) {

  return new THREE.MeshStandardMaterial({
    color: c,
    roughness: rough,
    metalness: metal
  });

}


/* =========================
   CUBO
========================= */

function box(
  w,
  h,
  d,
  c
) {

  const m =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        w,
        h,
        d
      ),
      mat(c)
    );

  m.castShadow = true;
  m.receiveShadow = true;

  return m;
}


/* =========================
   ESFERA
========================= */

function sphere(
  r,
  c
) {

  const m =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        r,
        20,
        14
      ),
      mat(c)
    );

  m.castShadow = true;
  m.receiveShadow = true;

  return m;
}


/* =========================
   CHÃO
========================= */

function ground(
  size = 100,
  c = 0x172231
) {

  const g =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        size,
        size
      ),
      mat(c)
    );

  g.rotation.x =
    -Math.PI / 2;

  g.receiveShadow = true;

  world.add(g);
}


/* =========================
   LIMPAR MUNDO
========================= */

function clearWorld() {

  while (
    world.children.length
  ) {

    world.remove(
      world.children[0]
    );

  }

  objects = [];
  enemies = [];
  items = [];
  particles = [];

  world.add(player);

  player.clear();

  player.position.set(
    0,
    1,
    0
  );
}


/* =========================
   PERSONAGEM 3D
========================= */

function buildPlayer() {

  const body =
    box(
      1.2,
      1.2,
      1.1,
      0x1d5cff
    );

  const head =
    sphere(
      0.62,
      0xf1c39b
    );

  head.position.y = 0.95;

  player.add(
    body,
    head
  );

  player.userData.radius = 0.8;
}


/* =========================
   ITENS
========================= */

function addItem(
  mesh,
  x,
  y,
  z,
  kind = 'coin'
) {

  mesh.position.set(
    x,
    y,
    z
  );

  mesh.userData.kind = kind;

  world.add(mesh);

  items.push(mesh);

  return mesh;
}


/* =========================
   INIMIGOS
========================= */

function addEnemy(
  x,
  y,
  z,
  speed = 2
) {

  const e =
    sphere(
      0.65,
      0xd94141
    );

  e.position.set(
    x,
    y,
    z
  );

  e.userData = {
    speed,
    radius: 0.8
  };

  world.add(e);

  enemies.push(e);

  return e;
}


/* =========================
   COMEÇAR JOGO
========================= */

function startGame() {

  show('game');

  running = true;
  paused = true;

  score = 0;
  lives = 3;
  progress = 0;

  phaseStart =
    performance.now();

  gameState = {};

  clearWorld();

  buildPlayer();

  buildPhase(
    phases[selectedPhase]
  );

  /* GARANTE A VISÃO DA PISTA */

  camera.position.set(
    0,
    6,
    12
  );

  camera.lookAt(
    0,
    1,
    -10
  );

  updateHUD();

  countdown();
}


/* =========================
   CONTAGEM
========================= */

function countdown() {

  let n = 3;

  $('countdown')
    .classList
    .remove('hidden');

  $('countdown').textContent =
    n;

  const t =
    setInterval(
      () => {

        n--;

        if (n <= 0) {

          clearInterval(t);

          $('countdown')
            .classList
            .add('hidden');

          paused = false;

          phaseStart =
            performance.now();

        } else {

          $('countdown')
            .textContent = n;

        }

      },
      700
    );
}


/* =========================
   CONSTRUIR FASE
========================= */

function buildPhase(p) {

  scene.background =
    new THREE.Color(
      phaseColor(p.type)
    );

  ground(
    120,
    0x141c28
  );

  if (
    p.type === 'kart' ||
    p.type === 'sonic'
  ) {

    buildRunner(
      p.type
    );

  }

  if (p.type === 'bomb')
    buildBomb();

  if (p.type === 'pac')
    buildPac();

  if (p.type === 'mario')
    buildMario();

  if (p.type === 'dk')
    buildDK();

  if (
    p.type === 'fight' ||
    p.type === 'mk'
  ) {

    buildFight(
      p.type
    );

  }

  if (p.type === 'poke')
    buildPoke();

  if (p.type === 'flappy')
    buildFlappy();

  if (p.type === 'guitar')
    buildGuitar();

  if (p.type === 'final')
    buildFinal();
}


/* =========================
   CORES
========================= */

function phaseColor(t) {

  return {

    kart: 0x31516e,
    bomb: 0x15151b,
    pac: 0x090b25,
    mario: 0x4d8b52,
    dk: 0x633c27,
    fight: 0x442c3c,
    mk: 0x171a2b,
    poke: 0x36576b,
    sonic: 0x1768a1,
    flappy: 0x66a4cf,
    guitar: 0x251c2b,
    final: 0x24213b

  }[t] || 0x101820;
}


/* =========================
   MARIO KART / SONIC
========================= */

function buildRunner(type) {

  /*
    PISTA
  */

  const road =
    box(
      24,
      0.18,
      310,
      0x30343b
    );

  road.position.set(
    0,
    0.08,
    -145
  );

  world.add(road);


  /*
    LATERAIS
  */

  const leftSide =
    box(
      2,
      0.4,
      310,
      0x4a4f57
    );

  leftSide.position.set(
    -13,
    0.2,
    -145
  );

  world.add(leftSide);


  const rightSide =
    box(
      2,
      0.4,
      310,
      0x4a4f57
    );

  rightSide.position.set(
    13,
    0.2,
    -145
  );

  world.add(rightSide);


  /*
    FAIXAS DA PISTA
  */

  for (
    let i = 0;
    i < 45;
    i++
  ) {

    const lane =
      box(
        0.35,
        0.03,
        3,
        0xffffff
      );

    lane.position.set(
      0,
      0.19,
      -i * 7 - 5
    );

    world.add(lane);

  }


  /*
    OBSTÁCULOS
  */

  for (
    let i = 0;
    i < 45;
    i++
  ) {

    const lane =
      (i % 3 - 1) * 4;

    const z =
      -i * 7 - 10;

    const o =
      box(
        2,
        1.2,
        3,
        0x8d9aa9
      );

    o.position.set(
      lane,
      0.6,
      z
    );

    world.add(o);

    objects.push(o);

  }


  /*
    ANÉIS
  */

  for (
    let i = 0;
    i < phases[selectedPhase].goal;
    i++
  ) {

    addItem(
      sphere(
        0.45,
        0xffd23f
      ),
      rand(-5, 5),
      0.8,
      -15 - i * 10,
      'ring'
    );

  }

  gameState.lane = 0;
}


/* =========================
   BOMBERMAN
========================= */

function buildBomb() {

  for (
    let x = -8;
    x <= 8;
    x += 2
  ) {

    for (
      let z = -10;
      z >= -28;
      z -= 2
    ) {

      if (
        Math.random() < 0.48
      ) {

        const b =
          box(
            1.6,
            1.6,
            1.6,
            0x855a38
          );

        b.position.set(
          x,
          0.8,
          z
        );

        world.add(b);

        objects.push(b);

      }
    }
  }

  gameState.bombs = [];
}


/* =========================
   PAC-MAN
========================= */

function buildPac() {

  const wall =
    0x27346b;

  for (
    let x = -9;
    x <= 9;
    x += 3
  ) {

    let w =
      box(
        2.6,
        2,
        1,
        wall
      );

    w.position.set(
      x,
      1,
      -12
    );

    world.add(w);

    objects.push(w);

  }


  for (
    let z = -10;
    z >= -48;
    z -= 4
  ) {

    let w =
      box(
        1,
        2,
        2.6,
        wall
      );

    w.position.set(
      -10,
      1,
      z
    );

    world.add(w);

    objects.push(w);


    w =
      box(
        1,
        2,
        2.6,
        wall
      );

    w.position.set(
      10,
      1,
      z
    );

    world.add(w);

    objects.push(w);

  }


  for (
    let i = 0;
    i < phases[selectedPhase].goal;
    i++
  ) {

    addItem(
      sphere(
        0.18,
        0xffe66d
      ),
      rand(-8, 8),
      0.5,
      rand(-48, -8),
      'dot'
    );

  }


  for (
    let i = 0;
    i < 3;
    i++
  ) {

    addEnemy(
      rand(-7, 7),
      0.7,
      rand(-42, -12),
      1.5 + i * 0.35
    );

  }
}


/* =========================
   SUPER MARIO
========================= */

function buildMario() {

  for (
    let i = 0;
    i < 30;
    i++
  ) {

    const x =
      rand(-7, 7);

    const z =
      -i * 4 - 8;

    if (
      i % 3 === 0
    ) {

      const o =
        box(
          2.5,
          1,
          2,
          0x9b633c
        );

      o.position.set(
        x,
        0.5,
        z
      );

      world.add(o);

      objects.push(o);

    }
  }


  for (
    let i = 0;
    i < phases[selectedPhase].goal;
    i++
  ) {

    addItem(
      sphere(
        0.32,
        0xffd23f
      ),
      rand(-7, 7),
      rand(1.5, 3.5),
      -10 - i * 4,
      'coin'
    );

  }

  gameState.jump = 0;
}


/* =========================
   DONKEY KONG
========================= */

function buildDK() {

  for (
    let row = 0;
    row < 5;
    row++
  ) {

    for (
      let i = 0;
      i < 6;
      i++
    ) {

      const p =
        box(
          2,
          0.5,
          1,
          0x8b5b37
        );

      p.position.set(
        -7 + i * 2.8,
        1 + row * 2,
        -8 - row * 10 +
          (row % 2) * 3
      );

      world.add(p);

      objects.push(p);

    }
  }


  for (
    let i = 0;
    i < phases[selectedPhase].goal;
    i++
  ) {

    addItem(
      sphere(
        0.35,
        0xffcf4a
      ),
      rand(-7, 7),
      rand(1, 9),
      -10 - i * 3,
      'star'
    );

  }


  for (
    let i = 0;
    i < 5;
    i++
  ) {

    addEnemy(
      rand(-7, 7),
      1 +
        Math.floor(i / 2) * 2,
      -10 - i * 9,
      0.9 + i * 0.12
    );

  }
}


/* =========================
   STREET FIGHTER / MK
========================= */

function buildFight(type) {

  for (
    let i = 0;
    i < phases[selectedPhase].goal;
    i++
  ) {

    const e =
      addEnemy(
        rand(-5, 5),
        1,
        -7 - i * 5,
        1.2
      );

    e.scale.setScalar(1.2);

  }

  gameState.enemyIndex = 0;
  gameState.attackCooldown = 0;
  gameState.defend = 0;
}


/* =========================
   POKÉMON
========================= */

function buildPoke() {

  gameState.enemyHP = 4;
  gameState.playerHP = 4;
  gameState.turn = 0;

  const e =
    sphere(
      1,
      0xd95a42
    );

  e.position.set(
    4,
    1,
    -9
  );

  world.add(e);

  gameState.enemy = e;
}


/* =========================
   FLAPPY BIRD
========================= */

function buildFlappy() {

  player.position.set(
    -6,
    3,
    -5
  );

  player.userData.vy = 0;

  for (
    let i = 0;
    i < phases[selectedPhase].goal;
    i++
  ) {

    const z =
      -12 - i * 7;

    const gap =
      rand(1.8, 4.5);

    for (
      const y of [0, 7]
    ) {

      const h =
        y === 0
          ? gap - 1.8
          : 7 - (gap + 1.8);

      const pipe =
        box(
          2,
          h,
          2,
          0x4eaa55
        );

      pipe.position.set(
        6,
        y + h / 2,
        z
      );

      world.add(pipe);

      objects.push(pipe);

    }
  }

  gameState.passed = 0;
}


/* =========================
   GUITAR HERO
========================= */

function buildGuitar() {

  player.position.set(
    0,
    0.5,
    7
  );

  gameState.notes = [];

  for (
    let i = 0;
    i < phases[selectedPhase].goal;
    i++
  ) {

    const n =
      sphere(
        0.35,
        [
          0xff4555,
          0x55aaff,
          0x65df77,
          0xffd23f
        ][i % 4]
      );

    n.position.set(
      (i % 4 - 1.5) * 2,
      -0.2,
      5 - i * 2.2
    );

    n.userData.note = true;

    world.add(n);

    gameState.notes.push(n);

  }
}


/* =========================
   FASE FINAL
========================= */

function buildFinal() {

  for (
    let i = 0;
    i < 20;
    i++
  ) {

    addItem(
      sphere(
        0.35,
        0xffd23f
      ),
      rand(-7, 7),
      0.8,
      -8 - i * 4,
      'ring'
    );

  }


  for (
    let i = 0;
    i < 12;
    i++
  ) {

    const o =
      box(
        1.8,
        1.8,
        1.8,
        0x914d3e
      );

    o.position.set(
      rand(-7, 7),
      0.9,
      -12 - i * 5
    );

    world.add(o);

    objects.push(o);

  }


  for (
    let i = 0;
    i < 3;
    i++
  ) {

    addEnemy(
      rand(-6, 6),
      0.8,
      -25 - i * 12,
      1.5 + i * 0.2
    );

  }

  gameState.finalCombo = 0;
}


/* =========================
   HUD
========================= */

function updateHUD() {

  const p =
    phases[selectedPhase];

  $('lives').textContent =
    lives;

  $('score').textContent =
    Math.floor(score);

  $('hudPhase').textContent =
    `FASE ${selectedPhase + 1} • ${p.name.toUpperCase()}`;

  $('hudChar').textContent =
    p.chars[selectedChar];

  $('objective').textContent =
    objectiveText(p);

  $('progress').style.width =
    clamp(
      progress / p.goal * 100,
      0,
      100
    ) + '%';
}


/* =========================
   OBJETIVO
========================= */

function objectiveText(p) {

  const a = {

    kart:
      'Complete a corrida e pegue os anéis.',

    bomb:
      'Destrua blocos com bombas.',

    pac:
      'Colete as bolinhas.',

    mario:
      'Pegue as moedas e avance.',

    dk:
      'Suba e pegue os itens.',

    fight:
      'Derrote os adversários.',

    mk:
      'Derrote os adversários usando ataque e defesa.',

    poke:
      'Vença a batalha por turnos.',

    sonic:
      'Pegue anéis e desvie.',

    flappy:
      'Passe pelos canos.',

    guitar:
      'Acerte as notas.',

    final:
      'Complete o desafio combinado.'

  };

  return a[p.type];
}


/* =========================
   MOVIMENTO
========================= */

function moveInput() {

  let x = joy.x;
  let y = joy.y;

  if (
    keys.ArrowLeft ||
    keys.a
  )
    x -= 1;

  if (
    keys.ArrowRight ||
    keys.d
  )
    x += 1;

  if (
    keys.ArrowUp ||
    keys.w
  )
    y -= 1;

  if (
    keys.ArrowDown ||
    keys.s
  )
    y += 1;

  return {
    x: clamp(x, -1, 1),
    y: clamp(y, -1, 1)
  };
}


/* =========================
   ATUALIZAR JOGO
========================= */

function update(dt) {

  if (
    !running ||
    paused
  )
    return;

  const p =
    phases[selectedPhase];

  const elapsed =
    (performance.now() -
      phaseStart) / 1000;

  const difficulty =
    1 +
    selectedPhase * 0.09 +
    elapsed / 70;

  let m =
    moveInput();


  if (
    p.type === 'flappy'
  ) {

    player.userData.vy -=
      14 * dt;

    player.position.y +=
      player.userData.vy * dt;

    player.position.z =
      -5 - elapsed * 4;

    player.position.x = -6;

    for (
      const o of objects
    )
      o.position.z +=
        7 * dt;

    if (
      player.position.y < 0.5 ||
      player.position.y > 7.5
    ) {

      loseLife();

      player.position.y = 4;

      player.userData.vy = 0;

    }

  } else {

    const speed =
      (
        p.type === 'sonic'
          ? 11
          : 7
      ) * dt;

    player.position.x +=
      m.x * speed;

    player.position.z +=
      m.y * speed;

    player.position.x =
      clamp(
        player.position.x,
        -9,
        9
      );

    player.position.z =
      clamp(
        player.position.z,
        -50,
        12
      );


    if (
      p.type === 'mario' ||
      p.type === 'dk'
    ) {

      gameState.vy =
        (gameState.vy || 0) -
        22 * dt;

      player.position.y +=
        gameState.vy * dt;

      if (
        player.position.y < 1
      ) {

        player.position.y = 1;

        gameState.vy = 0;

      }
    }
  }


  if (
    p.type === 'kart' ||
    p.type === 'sonic'
  )
    runnerUpdate(
      p,
      difficulty,
      dt
    );

  if (
    p.type === 'bomb'
  )
    bombUpdate(
      difficulty
    );

  if (
    p.type === 'pac'
  )
    pacUpdate(
      difficulty,
      dt
    );

  if (
    p.type === 'mario'
  )
    marioUpdate(dt);

  if (
    p.type === 'dk'
  )
    dkUpdate(
      difficulty,
      dt
    );

  if (
    p.type === 'fight' ||
    p.type === 'mk'
  )
    fightUpdate(
      p,
      difficulty,
      dt
    );

  if (
    p.type === 'poke'
  )
    pokeUpdate(dt);

  if (
    p.type === 'flappy'
  )
    flappyUpdate();

  if (
    p.type === 'guitar'
  )
    guitarUpdate(dt);

  if (
    p.type === 'final'
  )
    finalUpdate(
      difficulty,
      dt
    );


  cameraUpdate(dt);

  checkGoal(
    p,
    elapsed
  );

  updateHUD();
}


/* =========================
   CORRIDA
========================= */

function runnerUpdate(
  p,
  d,
  dt
) {

  for (
    const o of objects
  ) {

    o.position.z +=
      (
        p.type === 'sonic'
          ? 7
          : 4
      ) * d * dt;

    if (
      o.position.z > 14
    )
      o.position.z = -80;

    if (
      hit(
        player,
        o,
        1.1,
        1.2
      )
    )
      loseLife();

  }


  for (
    const it of items
  ) {

    it.position.z +=
      (
        p.type === 'sonic'
          ? 7
          : 4
      ) * d * dt;

    if (
      it.position.z > 14
    )
      it.position.z = -90;

    if (
      hit(
        player,
        it,
        1.2,
        0.9
      )
    ) {

      it.position.y = -20;

      progress++;

      score += 100;

    }
  }
}


/* =========================
   BOMBERMAN
========================= */

function bombUpdate(d) {

  for (
    const e of objects
  ) {

    if (
      hit(
        player,
        e,
        1.2,
        1.5
      )
    )
      loseLife();

  }

  if (
    !gameState.lastBomb
  )
    gameState.lastBomb = 0;
}


/* =========================
   PAC-MAN
========================= */

function pacUpdate(
  d,
  dt
) {

  for (
    const e of enemies
  ) {

    const dx =
      player.position.x -
      e.position.x;

    const dz =
      player.position.z -
      e.position.z;

    const len =
      Math.hypot(
        dx,
        dz
      ) || 1;

    e.position.x +=
      dx / len *
      e.userData.speed *
      d *
      dt;

    e.position.z +=
      dz / len *
      e.userData.speed *
      d *
      dt;

    if (
      hit(
        player,
        e,
        1.2,
        1.1
      )
    )
      loseLife();

  }


  for (
    const it of items
  ) {

    if (
      it.position.y > 0 &&
      hit(
        player,
        it,
        1,
        0.6
      )
    ) {

      it.position.y = -20;

      progress++;

      score += 50;

    }
  }
}


/* =========================
   MARIO UPDATE
========================= */

function marioUpdate(dt) {

  for (
    const o of objects
  ) {

    if (
      hit(
        player,
        o,
        1,
        1.3
      ) &&
      player.position.y <
        o.position.y + 1.5
    )
      loseLife();

  }


  for (
    const it of items
  ) {

    if (
      it.position.y > 0 &&
      hit(
        player,
        it,
        1,
        1
      )
    ) {

      it.position.y = -20;

      progress++;

      score += 100;

    }
  }
}


/* =========================
   DONKEY KONG UPDATE
========================= */

function dkUpdate(
  d,
  dt
) {

  for (
    const e of enemies
  ) {

    e.position.x +=
      Math.sin(
        performance.now() /
          700 +
        e.position.z
      ) *
      e.userData.speed *
      d *
      dt;

    if (
      hit(
        player,
        e,
        1.3,
        1.2
      )
    )
      loseLife();

  }


  for (
    const it of items
  ) {

    if (
      it.position.y > 0 &&
      hit(
        player,
        it,
        1,
        1
      )
    ) {

      it.position.y = -20;

      progress++;

      score += 90;

    }
  }
}


/* =========================
   LUTA
========================= */

function fightUpdate(
  p,
  d,
  dt
) {

  for (
    const e of enemies
  ) {

    if (
      e.userData.dead
    )
      continue;

    const dx =
      player.position.x -
      e.position.x;

    e.position.x +=
      Math.sign(dx) *
      e.userData.speed *
      d *
      dt;

    if (
      Math.abs(dx) < 1.6 &&
      Math.random() <
        0.01 * d
    )
      loseLife();

  }

  enemies =
    enemies.filter(
      e =>
        !e.userData.dead
    );
}


/* =========================
   POKÉMON UPDATE
========================= */

function pokeUpdate() {

  const e =
    gameState.enemy;

  if (!e)
    return;

  if (
    gameState.enemyHP <= 0
  )
    return;
}


/* =========================
   FLAPPY UPDATE
========================= */

function flappyUpdate() {

  for (
    const o of objects
  ) {

    if (
      o.position.z > 8
    ) {

      o.position.z =
        -110;

      gameState.passed++;

      progress =
        gameState.passed;

    }

    if (
      hit(
        player,
        o,
        1.1,
        1.3
      )
    )
      loseLife();

  }
}


/* =========================
   GUITAR UPDATE
========================= */

function guitarUpdate(dt) {

  for (
    const n of
    gameState.notes || []
  ) {

    n.position.z +=
      8 * dt;

    if (
      n.position.z > 9
    ) {

      n.position.z = -100;

      n.userData.missed =
        true;

      loseLife();

    }

    if (
      n.userData.note &&
      !n.userData.hit &&
      Math.abs(
        n.position.z - 7
      ) < 0.6 &&
      Math.abs(
        n.position.x -
        player.position.x
      ) < 0.9 &&
      pointerAction
    ) {

      n.userData.hit =
        true;

      n.position.y =
        -100;

      progress++;

      score += 100;

    }
  }

  pointerAction = false;
}


/* =========================
   FINAL
========================= */

function finalUpdate(
  d,
  dt
) {

  for (
    const e of enemies
  ) {

    const dx =
      player.position.x -
      e.position.x;

    const dz =
      player.position.z -
      e.position.z;

    const len =
      Math.hypot(
        dx,
        dz
      ) || 1;

    e.position.x +=
      dx / len *
      e.userData.speed *
      d *
      dt;

    e.position.z +=
      dz / len *
      e.userData.speed *
      d *
      dt;

    if (
      hit(
        player,
        e,
        1.2,
        1.1
      )
    )
      loseLife();

  }


  for (
    const it of items
  ) {

    if (
      it.position.y > 0 &&
      hit(
        player,
        it,
        1,
        0.8
      )
    ) {

      it.position.y = -20;

      progress++;

      score += 80;

    }
  }
}


/* =========================
   VERIFICAR OBJETIVO
========================= */

function checkGoal(
  p,
  elapsed
) {

  if (
    progress >= p.goal
  ) {

    winPhase();

    return;

  }


  if (
    elapsed >= p.time
  ) {

    if (
      p.type === 'fight' ||
      p.type === 'mk' ||
      p.type === 'poke'
    ) {

      loseLife();

    } else {

      gameOver();

    }
  }
}


/* =========================
   COLISÃO
========================= */

function hit(
  a,
  b,
  ra,
  rb
) {

  const dx =
    a.position.x -
    b.position.x;

  const dy =
    a.position.y -
    b.position.y;

  const dz =
    a.position.z -
    b.position.z;

  return (
    dx * dx +
    dy * dy +
    dz * dz
  ) <
    (ra + rb) ** 2;
}


/* =========================
   PERDER VIDA
========================= */

function loseLife() {

  if (
    gameState.invuln > 0
  )
    return;

  gameState.invuln = 1.4;

  lives--;

  if (
    lives <= 0
  ) {

    gameOver();

  } else {

    player.position.x = 0;

    player.position.z = 2;

  }
}


/* =========================
   AÇÃO
========================= */

function doAction() {

  if (
    !running ||
    paused
  )
    return;

  const p =
    phases[selectedPhase];

  pointerAction = true;


  /* PULO */

  if (
    p.type === 'mario' ||
    p.type === 'dk'
  ) {

    if (
      player.position.y <= 1.15
    )
      gameState.vy = 9.5;

  }


  /* FLAPPY */

  if (
    p.type === 'flappy'
  )
    player.userData.vy = 6;


  /* BOMBA */

  if (
    p.type === 'bomb'
  ) {

    const b =
      sphere(
        0.5,
        0x111
      );

    b.position.copy(
      player.position
    );

    b.userData.bomb = true;

    b.userData.timer = 1.3;

    world.add(b);

    objects.push(b);

    setTimeout(
      () =>
        explodeBomb(b),
      1300
    );

  }


  /* LUTAS */

  if (
    p.type === 'fight' ||
    p.type === 'mk'
  ) {

    for (
      const e of enemies
    ) {

      if (
        !e.userData.dead &&
        hit(
          player,
          e,
          2.1,
          1.2
        )
      ) {

        e.userData.dead =
          true;

        progress++;

        score += 300;

      }
    }
  }


  /* POKÉMON */

  if (
    p.type === 'poke'
  ) {

    gameState.enemyHP--;

    progress++;

    score += 150;

    if (
      gameState.enemyHP <= 0
    )
      winPhase();

  }
}


/* =========================
   EXPLOSÃO
========================= */

function explodeBomb(b) {

  if (
    !b.parent
  )
    return;

  for (
    const o of objects
  ) {

    if (
      o !== b &&
      o.position.distanceTo(
        b.position
      ) < 4
    ) {

      o.position.y =
        -30;

      progress++;

      score += 50;

    }
  }

  b.removeFromParent();
}


/* =========================
   AÇÃO 2
========================= */

function doAction2() {

  if (
    !running ||
    paused
  )
    return;

  const p =
    phases[selectedPhase];


  if (
    p.type === 'mk'
  ) {

    gameState.defend =
      0.8;

    score += 20;

  }


  if (
    p.type === 'poke' &&
    gameState.enemyHP > 0
  ) {

    gameState.enemyHP -=
      2;

    progress =
      Math.min(
        phases[selectedPhase].goal,
        progress + 2
      );

    score += 250;

  }


  if (
    p.type === 'final'
  ) {

    progress += 3;

    score += 100;

  }
}


/* =========================
   CÂMERA
========================= */

function cameraUpdate(dt) {

  const p =
    phases[selectedPhase].type;

  let target =
    new THREE.Vector3(
      player.position.x,
      player.position.y + 4,
      player.position.z + 9
    );


  if (
    p === 'flappy'
  ) {

    target.set(
      player.position.x + 7,
      player.position.y + 2,
      player.position.z + 12
    );

  }


  camera.position.lerp(
    target,
    1 -
      Math.pow(
        0.001,
        dt
      )
  );

  camera.lookAt(
    player.position.x,
    player.position.y + 0.7,
    player.position.z - 5
  );
}


/* =========================
   VENCER
========================= */

function winPhase() {

  if (
    !running
  )
    return;

  running = false;
  paused = true;


  if (
    selectedPhase + 1 >= 12
  ) {

    showMessage(
      'VOCÊ ZEROU!',
      'A fase final foi concluída.',
      false
    );

    return;
  }


  unlocked =
    Math.max(
      unlocked,
      selectedPhase + 2
    );

  localStorage.setItem(
    'touchRetroUnlocked',
    unlocked
  );


  showMessage(
    'FASE CONCLUÍDA!',
    `Pontuação: ${Math.floor(score)}`,
    true
  );
}


/* =========================
   GAME OVER
========================= */

function gameOver() {

  if (
    !running
  )
    return;

  running = false;
  paused = true;

  showMessage(
    'GAME OVER',
    `Pontuação: ${Math.floor(score)}`,
    false
  );
}


/* =========================
   MENSAGEM
========================= */

function showMessage(
  title,
  text,
  next
) {

  $('message').innerHTML =
    `
      <h2>${title}</h2>

      <p>${text}</p>

      ${
        next
          ? `
            <button
              class="next"
              id="nextBtn"
            >
              PRÓXIMA FASE
            </button>
          `
          : ''
      }

      <button
        class="quit"
        id="quitBtn"
      >
        MENU
      </button>
    `;


  $('message')
    .classList
    .remove('hidden');


  if (next) {

    $('nextBtn').onclick =
      () => {

        selectedPhase++;

        $('message')
          .classList
          .add('hidden');

        openCharacter(
          selectedPhase
        );

      };
  }


  $('quitBtn').onclick =
    () => {

      $('message')
        .classList
        .add('hidden');

      show('menu');

    };
}


/* =========================
   PAUSAR
========================= */

function togglePause() {

  if (
    !running
  )
    return;

  paused = !paused;

  $('pauseBtn').textContent =
    paused
      ? '▶'
      : 'Ⅱ';


  if (paused) {

    showMessage(
      'PAUSADO',
      'O jogo está pausado.',
      false
    );

  } else {

    $('message')
      .classList
      .add('hidden');

  }
}


/* =========================
   CONTROLES TOUCH
========================= */

function bindControls() {

  const joyEl =
    $('joystick');

  const stick =
    $('stick');

  let pid = null;


  function pos(e) {

    const r =
      joyEl.getBoundingClientRect();

    const cx =
      r.left +
      r.width / 2;

    const cy =
      r.top +
      r.height / 2;


    let x =
      (e.clientX - cx) /
      (r.width * 0.38);

    let y =
      (e.clientY - cy) /
      (r.height * 0.38);


    const l =
      Math.hypot(
        x,
        y
      );


    if (
      l > 1
    ) {

      x /= l;
      y /= l;

    }


    joy.x = x;
    joy.y = y;


    stick.style.transform =
      `translate(${x * 32}px, ${y * 32}px)`;
  }


  joyEl.addEventListener(
    'pointerdown',
    e => {

      pid =
        e.pointerId;

      joyEl.setPointerCapture(
        pid
      );

      pos(e);

    }
  );


  joyEl.addEventListener(
    'pointermove',
    e => {

      if (
        e.pointerId === pid
      )
        pos(e);

    }
  );


  [
    'pointerup',
    'pointercancel',
    'lostpointercapture'
  ].forEach(
    ev =>

      joyEl.addEventListener(
        ev,
        () => {

          pid = null;

          joy.x = 0;
          joy.y = 0;

          stick.style.transform =
            'translate(0,0)';

        }
      )
  );


  /* AÇÃO */

  $('actionA')
    .addEventListener(
      'pointerdown',
      e => {

        e.preventDefault();

        doAction();

      }
    );


  /* AÇÃO 2 */

  $('actionB')
    .addEventListener(
      'pointerdown',
      e => {

        e.preventDefault();

        doAction2();

      }
    );


  /* TECLADO */

  addEventListener(
    'keydown',
    e => {

      keys[e.key] = true;


      if (
        e.key === ' '
      ) {

        e.preventDefault();

        doAction();

      }


      if (
        e.key === 'Shift'
      )
        doAction2();


      if (
        e.key === 'Escape'
      )
        togglePause();

    }
  );


  addEventListener(
    'keyup',
    e => {

      keys[e.key] = false;

    }
  );
}


/* =========================
   LOOP
========================= */

function animate() {

  requestAnimationFrame(
    animate
  );

  const dt =
    Math.min(
      clock.getDelta(),
      0.05
    );


  if (
    gameState.invuln > 0
  )
    gameState.invuln -= dt;


  update(dt);


  if (
    renderer &&
    scene &&
    camera
  ) {

    renderer.render(
      scene,
      camera
    );

  }
}


/* =========================
   INICIALIZAÇÃO
========================= */

init3D();

phaseCards();
