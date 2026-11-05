"use strict";

/* ============================================================
 * しずくの洞窟
 * iPad・パソコン対応
 * ============================================================
 */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");

const WIDTH = 1200;
const HEIGHT = 760;

const LEAD_IN = 3;
const MAX_SCORE = 999;
const MISS_PENALTY = 5;
const NEAR_EXTRA = 0.10;

const IMAGE_RECT = {
  x: 0,
  y: 165,
  width: 650,
  height: 572,
};

const TOP_Y = 80;
const HIT_Y = 689;
const BOTTOM_Y = 736;

const FAR_LEFT = 870;
const FAR_RIGHT = 1040;
const NEAR_LEFT = 653;
const NEAR_RIGHT = 1180;

const COLORS = [
  "#009fff",
  "#5cf44c",
  "#fff627",
  "#f6253a",
];

const KEY_NAMES = ["D", "F", "J", "K"];
const KEY_CODES = ["KeyD", "KeyF", "KeyJ", "KeyK"];

const BG = "#09111d";
const WHITE = "#eff6ff";
const MUTED = "#9bb4ca";
const CYAN = "#60dbff";
const GOLD = "#fff15b";
const PINK = "#ff7ea0";
const RED = "#ff5353";

const FLY_END = 0.85;
const CLOUD_END = 1.27;
const RAIN_END = 1.89;
const SEEP_END = 3.04;
const FLOW_END = 3.52;
const WATER_END = 4.17;
const GROWTH_DURATION = 1.2;

/* ============================================================
 * 曲データ
 * ============================================================
 */

const SONGS = [
  {
    title: "きらきら星",
    level: 1,
    bpm: 100,
    approach: 2.8,
    windows: [0.10, 0.18, 0.26],
    repeat: 1,
    chords: false,
    description: "ゆっくり・単押し",
    pattern: [
      0, 1, 2, 3, 2, 1, 0,
      3, 2, 1, 0, 1, 2, 3,
    ],
    melody: `
      C4 C4 G4 G4 A4 A4 G4:2
      F4 F4 E4 E4 D4 D4 C4:2
      G4 G4 F4 F4 E4 E4 D4:2
      G4 G4 F4 F4 E4 E4 D4:2
      C4 C4 G4 G4 A4 A4 G4:2
      F4 F4 E4 E4 D4 D4 C4:2
    `,
  },

  {
    title: "メリーさんの羊",
    level: 2,
    bpm: 110,
    approach: 2.6,
    windows: [0.095, 0.17, 0.24],
    repeat: 2,
    chords: false,
    description: "少し速く・単押し",
    pattern: [
      0, 1, 2, 3, 2, 1, 0, 2,
      1, 3, 2, 0, 1, 2, 3, 1,
    ],
    melody: `
      E4 D4 C4 D4
      E4 E4 E4:2
      D4 D4 D4:2
      E4 G4 G4:2
      E4 D4 C4 D4
      E4 E4 E4 E4
      D4 D4 E4 D4
      C4:4
    `,
  },

  {
    title: "ロンドン橋",
    level: 3,
    bpm: 148,
    approach: 1.85,
    windows: [0.07, 0.13, 0.19],
    repeat: 2,
    chords: false,
    description: "速い旋律・連続する単押し",
    pattern: [
      0, 2, 1, 3, 1, 2, 0, 3,
      2, 0, 3, 1, 2, 0, 1, 3,
    ],
    melody: `
      G4:1.5 A4:0.5 G4 F4
      E4 F4 G4:2
      D4 E4 F4:2
      E4 F4 G4:2
      G4:1.5 A4:0.5 G4 F4
      E4 F4 G4:2
      D4:2 G4:2
      E4 C4:3
    `,
  },

  {
    title: "よろこびの歌",
    level: 4,
    bpm: 176,
    approach: 1.45,
    windows: [0.055, 0.10, 0.15],
    repeat: 2,
    chords: true,
    description: "高速の旋律・同時押し",
    pattern: [
      0, 3, 1, 2, 0, 2, 3, 1,
      3, 0, 2, 1, 0, 3, 2, 1,
    ],
    melody: `
      E4 E4 F4 G4
      G4 F4 E4 D4
      C4 C4 D4 E4
      E4:1.5 D4:0.5 D4:2
      E4 E4 F4 G4
      G4 F4 E4 D4
      C4 C4 D4 E4
      D4:1.5 C4:0.5 C4:2
    `,
  },
];

/* ============================================================
 * 水滴の経路
 * ============================================================
 */

const ROUTE_DEFINITIONS = [
  {
    name: "左",
    cloud: [0.14, 0.060],
    rain: [0.18, 0.105],
    path: [
      [0.18, 0.250],
      [0.19, 0.285],
      [0.17, 0.320],
      [0.20, 0.350],
      [0.21, 0.395],
      [0.23, 0.430],
      [0.24, 0.490],
    ],
    floor: 0.875,
  },

  {
    name: "中央",
    cloud: [0.32, 0.060],
    rain: [0.374, 0.105],
    path: [
      [0.374, 0.247],
      [0.376, 0.282],
      [0.374, 0.319],
      [0.366, 0.346],
      [0.376, 0.365],
      [0.360, 0.393],
      [0.366, 0.421],
      [0.354, 0.452],
      [0.347, 0.484],
    ],
    floor: 0.860,
  },

  {
    name: "右",
    cloud: [0.66, 0.060],
    rain: [0.70, 0.105],
    path: [
      [0.70, 0.220],
      [0.69, 0.265],
      [0.71, 0.300],
      [0.73, 0.340],
      [0.72, 0.385],
      [0.75, 0.430],
      [0.78, 0.500],
    ],
    floor: 0.885,
  },
];

function uv(u, v) {
  return {
    x: IMAGE_RECT.x + IMAGE_RECT.width * u,
    y: IMAGE_RECT.y + IMAGE_RECT.height * v,
  };
}

const routes = ROUTE_DEFINITIONS.map((definition) => {
  const path = definition.path.map(([u, v]) => uv(u, v));
  const last = path[path.length - 1];

  return {
    name: definition.name,
    cloud: uv(...definition.cloud),
    rain: uv(...definition.rain),
    ground: path[0],
    path,
    x: last.x,
    ceiling: last.y,
    floor: uv(0, definition.floor).y,
  };
});

/* ============================================================
 * 共通関数
 * ============================================================
 */

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function boundary(index, depth) {
  const left = lerp(FAR_LEFT, NEAR_LEFT, depth);
  const right = lerp(FAR_RIGHT, NEAR_RIGHT, depth);

  return lerp(left, right, index / 4);
}

function laneCenter(lane, depth = 1) {
  return (
    boundary(lane, depth) +
    boundary(lane + 1, depth)
  ) / 2;
}

function notePosition(lane, progress) {
  const depth = Math.pow(Math.max(0, progress), 1.5);

  return {
    x: laneCenter(lane, depth),
    y: lerp(TOP_Y, HIT_Y, depth),
    depth,
  };
}

function pathPoint(points, progress) {
  const lengths = [];
  let total = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const length = Math.hypot(
      points[i + 1].x - points[i].x,
      points[i + 1].y - points[i].y
    );

    lengths.push(length);
    total += length;
  }

  let remaining = total * clamp(progress);

  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i]) {
      const t = lengths[i] > 0
        ? remaining / lengths[i]
        : 0;

      return {
        x: lerp(points[i].x, points[i + 1].x, t),
        y: lerp(points[i].y, points[i + 1].y, t),
      };
    }

    remaining -= lengths[i];
  }

  return points[points.length - 1];
}

function inRect(x, y, rect) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

function songRect(index) {
  return {
    x: 688,
    y: 170 + index * 76,
    width: 470,
    height: 66,
  };
}

const NEXT_RECT = {
  x: 700,
  y: 510,
  width: 445,
  height: 58,
};

const BACK_RECT = {
  x: 1018,
  y: 12,
  width: 160,
  height: 42,
};

/* ============================================================
 * 描画補助
 * ============================================================
 */

function roundedRect(x, y, width, height, radius, fill, stroke) {
  radius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + radius, y);

  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );

  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);

  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);

  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function text(message, x, y, size, color, options = {}) {
  const {
    center = false,
    maxWidth,
    bold = false,
    outline = false,
  } = options;

  ctx.save();

  ctx.font = `${bold ? "bold " : ""}${size}px sans-serif`;
  ctx.textAlign = center ? "center" : "left";
  ctx.textBaseline = "middle";

  if (outline) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = BG;
    ctx.lineJoin = "round";

    if (maxWidth) {
      ctx.strokeText(String(message), x, y, maxWidth);
    } else {
      ctx.strokeText(String(message), x, y);
    }
  }

  ctx.fillStyle = color;

  if (maxWidth) {
    ctx.fillText(String(message), x, y, maxWidth);
  } else {
    ctx.fillText(String(message), x, y);
  }

  ctx.restore();
}

function polygon(points, fill, stroke = null, lineWidth = 2) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawDrop(x, y, radius, fill, outline = null) {
  ctx.beginPath();

  ctx.moveTo(x, y - radius * 2);

  ctx.bezierCurveTo(
    x - radius * 0.4,
    y - radius * 1.2,
    x - radius,
    y - radius * 0.3,
    x - radius,
    y
  );

  ctx.bezierCurveTo(
    x - radius,
    y + radius * 1.35,
    x + radius,
    y + radius * 1.35,
    x + radius,
    y
  );

  ctx.bezierCurveTo(
    x + radius,
    y - radius * 0.3,
    x + radius * 0.4,
    y - radius * 1.2,
    x,
    y - radius * 2
  );

  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.fill();

  if (outline) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = outline;
    ctx.stroke();
  }

  ctx.beginPath();

  ctx.arc(
    x - radius * 0.3,
    y - radius * 0.2,
    Math.max(1, radius * 0.18),
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "#e8f8ff";
  ctx.fill();
}

function button(rect, label, color = CYAN) {
  roundedRect(
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    9,
    "#182b3c",
    color
  );

  text(
    label,
    rect.x + rect.width / 2,
    rect.y + rect.height / 2,
    20,
    color,
    {
      center: true,
      maxWidth: rect.width - 16,
      bold: true,
    }
  );
}

/* ============================================================
 * 背景画像
 * ============================================================
 */

const background = new Image();
let backgroundReady = false;

background.onload = () => {
  backgroundReady = true;
};

background.onerror = () => {
  statusText.textContent =
    "背景画像を読み込めません。cave_background.jpeg を同じフォルダに置いてください。";
};

background.src = "cave_background.jpeg";

function drawBackground() {
  if (backgroundReady) {
    const sourceX = background.naturalWidth * 0.155;
    const sourceWidth = background.naturalWidth * 0.69;

    ctx.drawImage(
      background,
      sourceX,
      0,
      sourceWidth,
      background.naturalHeight,
      IMAGE_RECT.x,
      IMAGE_RECT.y,
      IMAGE_RECT.width,
      IMAGE_RECT.height
    );

    return;
  }

  ctx.fillStyle = "#b8dbe8";

  ctx.fillRect(
    IMAGE_RECT.x,
    IMAGE_RECT.y,
    IMAGE_RECT.width,
    IMAGE_RECT.height
  );

  ctx.fillStyle = "#dec9a4";

  ctx.fillRect(
    IMAGE_RECT.x,
    IMAGE_RECT.y + 145,
    IMAGE_RECT.width,
    IMAGE_RECT.height - 145
  );

  ctx.beginPath();
  ctx.ellipse(325, 570, 280, 140, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#252722";
  ctx.fill();

  text("洞窟", 325, 560, 28, WHITE, {
    center: true,
  });
}

/* ============================================================
 * 音声
 * ============================================================
 */

let audio = null;
let masterGain = null;
let activeVoices = new Set();
let startTime = 0;
let sessionId = 0;

/*
 * この関数はタップ・クリック・キー入力の処理中に
 * 同期的に呼び出す。
 *
 * resume() の完了を待つ処理には時間制限を付ける。
 */
function ensureAudio() {
  if (audio && audio.state === "closed") {
    audio = null;
    masterGain = null;
  }

  if (!audio) {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error(
        "このブラウザは音声再生に対応していません。"
      );
    }

    audio = new AudioContextClass();

    masterGain = audio.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(audio.destination);
  }

  const currentAudio = audio;

  /*
   * await やタイマーを挟まず、
   * ユーザー操作中に resume() を呼ぶ。
   */
  const resumePromise = currentAudio.state === "running"
    ? Promise.resolve()
    : currentAudio.resume();

  let timerId;

  const timeoutPromise = new Promise((resolve, reject) => {
    timerId = setTimeout(() => {
      reject(new Error("音声の準備がタイムアウトしました。"));
    }, 5000);
  });

  return Promise.race([resumePromise, timeoutPromise])
    .then(() => {
      if (currentAudio.state !== "running") {
        throw new Error(
          `音声を開始できませんでした: ${currentAudio.state}`
        );
      }
    })
    .finally(() => {
      clearTimeout(timerId);
    });
}

function stopAudio() {
  for (const voice of activeVoices) {
    try {
      voice.stop();
    } catch (error) {
      // すでに停止している場合は何もしない。
    }
  }

  activeVoices.clear();
}

function discardAudio() {
  stopAudio();

  const oldAudio = audio;

  audio = null;
  masterGain = null;

  if (oldAudio && oldAudio.state !== "closed") {
    try {
      oldAudio.close().catch(() => {});
    } catch (error) {
      console.error(error);
    }
  }
}

function pitchToFrequency(pitch) {
  const match = /^([A-G])([#b]?)(-?\d+)$/.exec(pitch);

  if (!match) {
    throw new Error(`音名を読み取れません: ${pitch}`);
  }

  const semitones = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  const accidental =
    match[2] === "#" ? 1 :
    match[2] === "b" ? -1 :
    0;

  const octave = Number(match[3]);

  const midi =
    (octave + 1) * 12 +
    semitones[match[1]] +
    accidental;

  return 440 * Math.pow(2, (midi - 69) / 12);
}

function scheduleTone(frequency, when, duration, volume = 0.22) {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  const end = when + Math.max(0.04, duration);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, when);

  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(volume, when + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(masterGain);

  activeVoices.add(oscillator);

  oscillator.onended = () => {
    activeVoices.delete(oscillator);
    oscillator.disconnect();
    gain.disconnect();
  };

  oscillator.start(when);
  oscillator.stop(end + 0.01);
}

function playGrowthSound() {
  if (!audio || audio.state !== "running") {
    return;
  }

  const now = audio.currentTime;

  scheduleTone(pitchToFrequency("C6"), now, 0.20, 0.10);
  scheduleTone(pitchToFrequency("E6"), now + 0.06, 0.20, 0.10);
  scheduleTone(pitchToFrequency("G6"), now + 0.12, 0.20, 0.10);
}

function createChart(song) {
  const melody = [];
  let beat = 0;

  for (let repeat = 0; repeat < song.repeat; repeat++) {
    const tokens = song.melody.trim().split(/\s+/);

    for (const token of tokens) {
      const [pitch, lengthText] = token.split(":");
      const duration = lengthText ? Number(lengthText) : 1;

      if (pitch !== "R") {
        melody.push({
          pitch,
          beat,
          duration,
        });
      }

      beat += duration;
    }
  }

  const secondsPerBeat = 60 / song.bpm;
  const notes = [];
  const tones = [];

  melody.forEach((item, index) => {
    const time = LEAD_IN + item.beat * secondsPerBeat;
    const lane = song.pattern[index % song.pattern.length];
    const frequency = pitchToFrequency(item.pitch);

    notes.push({
      time,
      lane,
      judged: false,
    });

    tones.push({
      time,
      frequency,
      duration: Math.max(
        0.06,
        item.duration * 0.88 * secondsPerBeat
      ),
      volume: 0.22,
    });

    if (song.chords && index > 0 && index % 3 === 0) {
      notes.push({
        time,
        lane: (lane + 2) % 4,
        judged: false,
      });

      tones.push({
        time,
        frequency: frequency / 2,
        duration: Math.min(
          0.20,
          item.duration * secondsPerBeat * 0.75
        ),
        volume: 0.08,
      });
    }
  });

  notes.sort(
    (a, b) => a.time - b.time || a.lane - b.lane
  );

  return {
    notes,
    tones,
    songEnd: LEAD_IN + beat * secondsPerBeat,
  };
}

/* ============================================================
 * ゲーム状態
 * ============================================================
 */

const game = {
  state: "select",
  selected: 0,
  time: 0,
  songEnd: 0,

  notes: [],
  water: [],
  particles: [],
  rings: [],
  rocks: [],

  rawScore: 0,
  rawMaxScore: 0,
  penaltyScore: 0,
  score: 0,

  combo: 0,
  maxCombo: 0,
  successes: 0,
  settled: 0,

  counts: [0, 0, 0, 0, 0],
  flashes: [0, 0, 0, 0],

  judgement: "",
  judgementColor: WHITE,
  judgementUntil: 0,

  heldKeys: new Set(),
};

function resetGame() {
  game.time = 0;

  game.water = [];
  game.particles = [];
  game.rings = [];

  game.rawScore = 0;
  game.rawMaxScore = game.notes.length * 1000;
  game.penaltyScore = 0;
  game.score = 0;

  game.combo = 0;
  game.maxCombo = 0;
  game.successes = 0;
  game.settled = 0;

  game.counts = [0, 0, 0, 0, 0];
  game.flashes = [0, 0, 0, 0];

  game.judgement = "";
  game.judgementUntil = 0;

  game.heldKeys.clear();

  game.rocks = routes.map(() => ({
    upper: IMAGE_RECT.height * 0.084,
    lower: IMAGE_RECT.height * 0.090,
    settled: 0,
    flashUntil: 0,
    effectStart: 0,
  }));
}

resetGame();

function currentSong() {
  return SONGS[game.selected];
}

function currentTime() {
  if (game.state !== "playing" || !audio) {
    return game.time;
  }

  return Math.max(0, audio.currentTime - startTime);
}

function updateScore() {
  if (game.rawMaxScore <= 0) {
    game.score = 0;
    return;
  }

  const normalized = Math.floor(
    game.rawScore * MAX_SCORE / game.rawMaxScore
  );

  game.score = clamp(
    normalized - game.penaltyScore,
    0,
    MAX_SCORE
  );
}

function showJudgement(label, color) {
  game.judgement = label;
  game.judgementColor = color;
  game.judgementUntil = game.time + 0.65;
}

function selectScreen(message = "") {
  sessionId++;
  stopAudio();

  game.notes = [];
  game.state = "select";

  resetGame();

  statusText.textContent = message;
}

/*
 * async 関数の最初の await までは同期的に実行される。
 * ensureAudio() 内の resume() は、タップ操作中に呼ばれる。
 */
async function startGame(index) {
  if (game.state === "loading") {
    return;
  }

  const mySession = ++sessionId;

  stopAudio();

  game.state = "loading";
  game.selected = index;

  statusText.textContent = "";

  try {
    await ensureAudio();

    if (mySession !== sessionId || game.state !== "loading") {
      return;
    }

    const chart = createChart(currentSong());

    game.notes = chart.notes;
    game.songEnd = chart.songEnd;

    resetGame();

    startTime = audio.currentTime + 0.08;

    for (const tone of chart.tones) {
      scheduleTone(
        tone.frequency,
        startTime + tone.time,
        tone.duration,
        tone.volume
      );
    }

    game.state = "playing";
  } catch (error) {
    console.error(error);

    if (mySession === sessionId) {
      discardAudio();

      selectScreen(
        "音声を開始できませんでした。iPadの音量・消音設定を確認し、曲をもう一度タップしてください。"
      );
    }
  }
}

/* ============================================================
 * 判定とエフェクト
 * ============================================================
 */

function burst(x, y, color, isWater = false) {
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 35 + Math.random() * 95;

    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 25,
      life: 0.5,
      color,
      isWater,
    });
  }
}

function registerMiss(note) {
  if (note.judged) {
    return;
  }

  note.judged = true;

  game.counts[4]++;
  game.combo = 0;
  game.penaltyScore += MISS_PENALTY;

  updateScore();

  showJudgement(
    `ミス！ −${MISS_PENALTY}点`,
    RED
  );
}

function expireNotes() {
  const nearWindow =
    currentSong().windows[2] + NEAR_EXTRA;

  for (const note of game.notes) {
    if (
      !note.judged &&
      game.time > note.time + nearWindow
    ) {
      registerMiss(note);
    }
  }
}

function hit(lane) {
  if (game.state !== "playing") {
    return;
  }

  game.time = currentTime();

  expireNotes();

  game.flashes[lane] = game.time + 0.18;

  const [perfect, good, ok] = currentSong().windows;
  const nearWindow = ok + NEAR_EXTRA;

  const candidates = game.notes.filter((note) => (
    !note.judged &&
    note.lane === lane &&
    Math.abs(note.time - game.time) <= nearWindow
  ));

  if (candidates.length === 0) {
    return;
  }

  candidates.sort(
    (a, b) =>
      Math.abs(a.time - game.time) -
      Math.abs(b.time - game.time)
  );

  const note = candidates[0];
  const error = Math.abs(note.time - game.time);

  note.judged = true;

  if (error > ok) {
    game.counts[3]++;
    game.combo = 0;

    showJudgement("おしい！", PINK);
    return;
  }

  let resultIndex;

  if (error <= perfect) {
    resultIndex = 0;
  } else if (error <= good) {
    resultIndex = 1;
  } else {
    resultIndex = 2;
  }

  const points = [1000, 700, 400];
  const labels = ["ぴったり！", "いい感じ！", "せいこう！"];
  const colors = [GOLD, CYAN, WHITE];

  game.counts[resultIndex]++;
  game.rawScore += points[resultIndex];

  game.combo++;
  game.successes++;

  game.maxCombo = Math.max(
    game.maxCombo,
    game.combo
  );

  updateScore();

  showJudgement(
    labels[resultIndex],
    colors[resultIndex]
  );

  const progress =
    1 + (game.time - note.time) / currentSong().approach;

  const position = notePosition(lane, progress);

  burst(position.x, position.y, COLORS[lane]);

  const routeId = Math.floor(
    Math.random() * routes.length
  );

  game.water.push({
    born: game.time,
    start: position,
    main: true,
    offset: 0,
    tip: null,
    routeId,
  });

  for (let i = 0; i < 5; i++) {
    game.water.push({
      born: game.time + i * 0.07,
      start: position,
      main: false,
      offset: -22 + Math.random() * 44,
      tip: null,
      routeId,
    });
  }
}

function upperTip(routeId) {
  return (
    routes[routeId].ceiling +
    game.rocks[routeId].upper
  );
}

function lowerTip(routeId) {
  return (
    routes[routeId].floor -
    game.rocks[routeId].lower
  );
}

function waterPosition(drop) {
  const elapsed = game.time - drop.born;

  if (elapsed < 0) {
    return null;
  }

  if (!drop.main && elapsed < CLOUD_END) {
    return null;
  }

  const route = routes[drop.routeId];

  if (elapsed < FLY_END) {
    const progress = elapsed / FLY_END;
    const rest = 1 - progress;

    const controlX = lerp(
      drop.start.x,
      route.cloud.x,
      0.45
    );

    const controlY = IMAGE_RECT.y - 45;

    return {
      x:
        rest * rest * drop.start.x +
        2 * rest * progress * controlX +
        progress * progress * route.cloud.x,

      y:
        rest * rest * drop.start.y +
        2 * rest * progress * controlY +
        progress * progress * route.cloud.y,
    };
  }

  if (elapsed < CLOUD_END) {
    return null;
  }

  if (elapsed < RAIN_END) {
    const progress =
      (elapsed - CLOUD_END) /
      (RAIN_END - CLOUD_END);

    return {
      x:
        lerp(route.rain.x, route.ground.x, progress) +
        drop.offset,

      y: lerp(
        route.rain.y,
        route.ground.y,
        progress * progress
      ),
    };
  }

  if (elapsed < SEEP_END) {
    const progress =
      (elapsed - RAIN_END) /
      (SEEP_END - RAIN_END);

    const position = pathPoint(route.path, progress);

    return {
      x: position.x + drop.offset * (1 - progress),
      y: position.y,
    };
  }

  if (elapsed < FLOW_END) {
    const progress =
      (elapsed - SEEP_END) /
      (FLOW_END - SEEP_END);

    return {
      x: route.x,
      y: lerp(
        route.ceiling,
        upperTip(drop.routeId),
        progress
      ),
    };
  }

  if (drop.tip === null) {
    drop.tip = upperTip(drop.routeId);
  }

  const progress = clamp(
    (elapsed - FLOW_END) /
    (WATER_END - FLOW_END)
  );

  return {
    x: route.x,
    y: lerp(
      drop.tip,
      lowerTip(drop.routeId),
      progress * progress
    ),
  };
}

function triggerGrowth(routeId) {
  const route = routes[routeId];
  const rock = game.rocks[routeId];

  game.settled++;
  rock.settled++;

  if (rock.flashUntil <= game.time) {
    rock.effectStart = game.time;
  }

  rock.flashUntil = game.time + GROWTH_DURATION;

  playGrowthSound();

  const y = lowerTip(routeId);

  burst(route.x, y, "#0041cd", true);

  game.rings.push({
    x: route.x,
    y,
    born: game.time,
  });
}

function update(dt) {
  if (game.state !== "playing") {
    return;
  }

  game.time = currentTime();

  expireNotes();

  const remainingWater = [];

  for (const drop of game.water) {
    if (game.time - drop.born >= WATER_END) {
      if (drop.main) {
        triggerGrowth(drop.routeId);
      }
    } else {
      remainingWater.push(drop);
    }
  }

  game.water = remainingWater;

  const expected = Math.max(
    1,
    game.notes.length / routes.length
  );

  const easing = 1 - Math.exp(-7 * dt);

  for (const rock of game.rocks) {
    const ratio = clamp(rock.settled / expected);

    const upperTarget =
      IMAGE_RECT.height * (0.084 + 0.08 * ratio);

    const lowerTarget =
      IMAGE_RECT.height * (0.090 + 0.08 * ratio);

    rock.upper += (upperTarget - rock.upper) * easing;
    rock.lower += (lowerTarget - rock.lower) * easing;
  }

  for (const particle of game.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 170 * dt;
    particle.life -= dt;
  }

  game.particles = game.particles.filter(
    (particle) => particle.life > 0
  );

  game.rings = game.rings.filter(
    (ring) => game.time - ring.born < 0.6
  );

  const allJudged = game.notes.every(
    (note) => note.judged
  );

  const effectsFinished = game.rocks.every(
    (rock) => rock.flashUntil <= game.time
  );

  if (
    allJudged &&
    game.water.length === 0 &&
    effectsFinished &&
    game.time > game.songEnd + 0.5
  ) {
    game.state = "result";
    stopAudio();
  }
}

/* ============================================================
 * 左側：得点・洞窟
 * ============================================================
 */

function drawLeft() {
  roundedRect(
    15, 12, 615, 137, 9,
    "#0a1420",
    GOLD
  );

  text(`得点  ${game.score}`, 35, 67, 65, GOLD, {
    maxWidth: 575,
    bold: true,
  });

  const song = currentSong();

  text(
    `Lv.${song.level}  ${song.title}`,
    35,
    122,
    20,
    WHITE,
    {
      maxWidth: 390,
    }
  );

  text(
    `連続 ${game.combo}`,
    453,
    122,
    20,
    CYAN,
    {
      maxWidth: 160,
    }
  );

  drawBackground();

  ctx.save();

  ctx.beginPath();
  ctx.rect(
    IMAGE_RECT.x,
    IMAGE_RECT.y,
    IMAGE_RECT.width,
    IMAGE_RECT.height
  );
  ctx.clip();

  routes.forEach((route, index) => {
    const rock = game.rocks[index];
    const active = rock.flashUntil > game.time;

    const upper = upperTip(index);
    const lower = lowerTip(index);

    if (active) {
      for (const y of [upper, lower]) {
        const gradient = ctx.createRadialGradient(
          route.x, y, 2,
          route.x, y, 38
        );

        gradient.addColorStop(
          0,
          "rgba(255,220,60,0.65)"
        );

        gradient.addColorStop(
          1,
          "rgba(255,220,60,0)"
        );

        ctx.fillStyle = gradient;
        ctx.beginPath();

        ctx.arc(
          route.x,
          y,
          38,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }
    }

    let color = "#e3d0a8";

    if (active) {
      const blink =
        Math.floor(
          (game.time - rock.effectStart) / 0.20
        ) % 2 === 0;

      color = blink
        ? "#ffce20"
        : "#fffad1";
    }

    polygon(
      [
        {
          x: route.x - 11,
          y: route.ceiling,
        },
        {
          x: route.x + 11,
          y: route.ceiling,
        },
        {
          x: route.x + 5,
          y: route.ceiling + rock.upper * 0.5,
        },
        {
          x: route.x,
          y: upper,
        },
        {
          x: route.x - 5,
          y: route.ceiling + rock.upper * 0.5,
        },
      ],
      color,
      active ? "#ff9714" : null
    );

    polygon(
      [
        {
          x: route.x - 16,
          y: route.floor,
        },
        {
          x: route.x - 7,
          y: route.floor - rock.lower * 0.4,
        },
        {
          x: route.x,
          y: lower,
        },
        {
          x: route.x + 7,
          y: route.floor - rock.lower * 0.4,
        },
        {
          x: route.x + 16,
          y: route.floor,
        },
      ],
      color,
      active ? "#ff9714" : null
    );
  });

  ctx.restore();

  ctx.strokeStyle = "#6a8690";
  ctx.lineWidth = 2;

  ctx.strokeRect(
    IMAGE_RECT.x,
    IMAGE_RECT.y,
    IMAGE_RECT.width,
    IMAGE_RECT.height
  );
}

/* ============================================================
 * 右側：演奏レーン
 * ============================================================
 */

function drawLanes() {
  ctx.save();

  ctx.beginPath();
  ctx.rect(650, 0, 550, HEIGHT);
  ctx.clip();

  const bottomDepth =
    (BOTTOM_Y - TOP_Y) /
    (HIT_Y - TOP_Y);

  for (let lane = 0; lane < 4; lane++) {
    const active =
      game.flashes[lane] > game.time;

    ctx.globalAlpha = active ? 0.23 : 0.09;

    polygon(
      [
        {
          x: boundary(lane, 0),
          y: TOP_Y,
        },
        {
          x: boundary(lane + 1, 0),
          y: TOP_Y,
        },
        {
          x: boundary(lane + 1, bottomDepth),
          y: BOTTOM_Y,
        },
        {
          x: boundary(lane, bottomDepth),
          y: BOTTOM_Y,
        },
      ],
      COLORS[lane]
    );

    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = "#3d5165";
  ctx.lineWidth = 2;

  for (let index = 0; index < 5; index++) {
    ctx.beginPath();

    ctx.moveTo(
      boundary(index, 0),
      TOP_Y
    );

    ctx.lineTo(
      boundary(index, bottomDepth),
      BOTTOM_Y
    );

    ctx.stroke();
  }

  for (const depth of [0.16, 0.36, 0.58, 0.79]) {
    const y = lerp(TOP_Y, HIT_Y, depth);

    ctx.beginPath();
    ctx.moveTo(boundary(0, depth), y);
    ctx.lineTo(boundary(4, depth), y);

    ctx.strokeStyle = "#22303e";
    ctx.stroke();
  }

  for (let lane = 0; lane < 4; lane++) {
    const x = laneCenter(lane);

    const active =
      game.flashes[lane] > game.time;

    ctx.strokeStyle = COLORS[lane];
    ctx.lineWidth = 8;

    ctx.beginPath();

    ctx.moveTo(
      boundary(lane, 1) + 5,
      HIT_Y
    );

    ctx.lineTo(
      boundary(lane + 1, 1) - 5,
      HIT_Y
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      x,
      HIT_Y,
      active ? 29 : 25,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = COLORS[lane];
    ctx.fill();

    text(KEY_NAMES[lane], x, HIT_Y, 22, BG, {
      center: true,
      bold: true,
    });
  }

  if (game.state === "playing") {
    text(
      `ミス：−${MISS_PENALTY}点 ／ おしい：減点なし`,
      835,
      32,
      17,
      MUTED,
      {
        center: true,
        maxWidth: 330,
      }
    );

    button(BACK_RECT, "曲選択へ");

    ctx.save();

    ctx.beginPath();
    ctx.rect(650, 65, 550, 673);
    ctx.clip();

    for (let i = game.notes.length - 1; i >= 0; i--) {
      const note = game.notes[i];

      if (note.judged) {
        continue;
      }

      const progress =
        1 +
        (game.time - note.time) /
        currentSong().approach;

      if (progress < 0 || progress > 1.2) {
        continue;
      }

      const position = notePosition(
        note.lane,
        progress
      );

      const radius =
        4 + 14 * Math.min(position.depth, 1.15);

      drawDrop(
        position.x,
        position.y,
        radius,
        COLORS[note.lane]
      );
    }

    ctx.restore();

    if (game.time < LEAD_IN) {
      text(
        Math.max(
          1,
          Math.ceil(LEAD_IN - game.time)
        ),
        922,
        375,
        80,
        GOLD,
        {
          center: true,
          bold: true,
        }
      );
    }

    if (game.judgementUntil > game.time) {
      text(
        game.judgement,
        930,
        495,
        42,
        game.judgementColor,
        {
          center: true,
          maxWidth: 510,
          bold: true,
        }
      );
    }

    if (game.combo >= 2) {
      text(
        `${game.combo} 回連続！`,
        930,
        544,
        25,
        WHITE,
        {
          center: true,
        }
      );
    }
  }

  ctx.restore();
}

/* ============================================================
 * 水滴・成長エフェクト
 * ============================================================
 */

function drawEffects() {
  for (const main of [false, true]) {
    for (const drop of game.water) {
      if (drop.main !== main) {
        continue;
      }

      const position = waterPosition(drop);

      if (!position) {
        continue;
      }

      ctx.save();

      const flying =
        game.time - drop.born < FLY_END;

      if (!flying) {
        ctx.beginPath();

        ctx.rect(
          IMAGE_RECT.x,
          IMAGE_RECT.y,
          IMAGE_RECT.width,
          IMAGE_RECT.height
        );

        ctx.clip();
      }

      drawDrop(
        position.x,
        position.y,
        main ? 6 : 3,
        main ? "#0041cd" : "#0050dc",
        "#f5faff"
      );

      ctx.restore();
    }
  }

  for (const particle of game.particles) {
    ctx.save();

    if (particle.isWater) {
      ctx.beginPath();

      ctx.rect(
        IMAGE_RECT.x,
        IMAGE_RECT.y,
        IMAGE_RECT.width,
        IMAGE_RECT.height
      );

      ctx.clip();
    }

    const radius = Math.max(
      1,
      particle.life * 8
    );

    ctx.beginPath();

    ctx.arc(
      particle.x,
      particle.y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = particle.color;
    ctx.fill();

    if (particle.isWater) {
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  ctx.save();

  ctx.beginPath();

  ctx.rect(
    IMAGE_RECT.x,
    IMAGE_RECT.y,
    IMAGE_RECT.width,
    IMAGE_RECT.height
  );

  ctx.clip();

  for (const ring of game.rings) {
    const progress =
      (game.time - ring.born) / 0.6;

    const radius = 5 + 25 * progress;

    ctx.beginPath();

    ctx.ellipse(
      ring.x,
      ring.y,
      radius,
      Math.max(2, radius / 4),
      0,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle = "#e8f8ff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  routes.forEach((route, index) => {
    const rock = game.rocks[index];

    if (rock.flashUntil <= game.time) {
      return;
    }

    const rise = Math.min(
      14,
      (game.time - rock.effectStart) * 12
    );

    const offset = index === 1 ? 22 : 0;

    text(
      "成長！",
      route.x,
      lowerTip(index) - 30 - offset - rise,
      27,
      GOLD,
      {
        center: true,
        bold: true,
        outline: true,
      }
    );
  });

  ctx.restore();
}

/* ============================================================
 * 選曲画面・結果画面
 * ============================================================
 */

function drawMenu() {
  roundedRect(
    666, 92, 515, 390, 16,
    "#0d1b2b",
    "#54859d"
  );

  text(
    "曲と難易度を選ぼう",
    923,
    127,
    29,
    GOLD,
    {
      center: true,
      bold: true,
    }
  );

  SONGS.forEach((song, index) => {
    const rect = songRect(index);
    const selected = index === game.selected;

    roundedRect(
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      9,
      selected ? "#274252" : "#162737",
      selected ? GOLD : "#436077"
    );

    text(
      `Lv.${song.level}  ${song.title}`,
      rect.x + 14,
      rect.y + 23,
      23,
      selected ? GOLD : WHITE,
      {
        maxWidth: 350,
      }
    );

    text(
      `${song.description} ／ BPM ${song.bpm}`,
      rect.x + 14,
      rect.y + 49,
      15,
      MUTED,
      {
        maxWidth: 350,
      }
    );

    const cx = rect.x + rect.width - 42;
    const cy = rect.y + rect.height / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, 27, 0, Math.PI * 2);

    ctx.fillStyle = COLORS[index];
    ctx.fill();

    text(
      KEY_NAMES[index],
      cx,
      cy,
      27,
      BG,
      {
        center: true,
        bold: true,
      }
    );
  });

  text(
    "曲をタップしてスタート",
    923,
    516,
    21,
    WHITE,
    {
      center: true,
    }
  );

  text(
    "演奏：下の丸いボタンをタップ",
    923,
    554,
    22,
    CYAN,
    {
      center: true,
      maxWidth: 500,
    }
  );

  text(
    "パソコン：D・F・J・K",
    923,
    592,
    18,
    MUTED,
    {
      center: true,
    }
  );

  text(
    `ミス1回：−${MISS_PENALTY}点 ／ おしい：減点なし`,
    923,
    629,
    18,
    PINK,
    {
      center: true,
      maxWidth: 500,
    }
  );
}

function drawResult() {
  roundedRect(
    674, 145, 497, 480, 16,
    "#0d1b2b",
    "#54859d"
  );

  const center = 922;
  const song = currentSong();

  const rate =
    100 * game.successes /
    Math.max(1, game.notes.length);

  const [perfect, good, ok, near, miss] =
    game.counts;

  const routeCounts = routes.map((route, index) => (
    `${route.name} ${game.rocks[index].settled}滴`
  )).join(" ／ ");

  const title = game.successes > 0
    ? "洞窟が育ちました！"
    : "次のゲームも楽しもう！";

  const rows = [
    [title, 179, 29, GOLD],
    [`Lv.${song.level}  ${song.title}`, 216, 21, WHITE],
    [`得点 ${game.score}`, 254, 33, GOLD],
    [`ミスによる累積減点：${game.penaltyScore}点`, 292, 18, RED],
    [`地下へ届いた水滴：${game.settled}滴`, 326, 21, CYAN],
    [routeCounts, 357, 17, WHITE],
    [
      `最大連続 ${game.maxCombo}回 ／ 成功率 ${rate.toFixed(0)}％`,
      388,
      19,
      WHITE,
    ],
    [`ぴったり ${perfect} ／ いい感じ ${good}`, 419, 18, WHITE],
    [`せいこう ${ok} ／ おしい ${near} ／ ミス ${miss}`, 450, 18, WHITE],
  ];

  for (const [message, y, size, color] of rows) {
    text(
      message,
      center,
      y,
      size,
      color,
      {
        center: true,
        maxWidth: 460,
      }
    );
  }

  button(
    NEXT_RECT,
    "タップして次のゲームへ！"
  );

  text(
    "キーボード：D・F・J・K",
    center,
    591,
    18,
    MUTED,
    {
      center: true,
    }
  );
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawLeft();

  if (game.state === "select") {
    drawMenu();
    return;
  }

  if (game.state === "loading") {
    text(
      "準備中…",
      925,
      375,
      38,
      GOLD,
      {
        center: true,
        bold: true,
      }
    );

    return;
  }

  drawLanes();
  drawEffects();

  if (game.state === "result") {
    drawResult();
  }
}

/* ============================================================
 * タッチ・マウス・キーボード
 * ============================================================
 */

function canvasPosition(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x:
      (event.clientX - rect.left) *
      WIDTH / rect.width,

    y:
      (event.clientY - rect.top) *
      HEIGHT / rect.height,
  };
}

/*
 * 曲の開始は click で行う。
 *
 * iPadでは、画面をタップして指を離したときの
 * ユーザー操作から音声を開始する。
 */
canvas.addEventListener("click", (event) => {
  const { x, y } = canvasPosition(event);

  if (game.state === "select") {
    for (let index = 0; index < SONGS.length; index++) {
      if (inRect(x, y, songRect(index))) {
        startGame(index);
        return;
      }
    }

    return;
  }

  if (
    game.state === "result" &&
    inRect(x, y, NEXT_RECT)
  ) {
    selectScreen();
  }
});

/*
 * 演奏中の入力は pointerdown のままにする。
 * これにより、指が画面に触れた時点で判定できる。
 */
canvas.addEventListener("pointerdown", (event) => {
  if (game.state !== "playing") {
    return;
  }

  event.preventDefault();

  const { x, y } = canvasPosition(event);

  if (inRect(x, y, BACK_RECT)) {
    selectScreen();
    return;
  }

  if (y >= HIT_Y - 80 && y <= HEIGHT) {
    for (let lane = 0; lane < 4; lane++) {
      if (
        x >= boundary(lane, 1) &&
        x < boundary(lane + 1, 1)
      ) {
        hit(lane);
        return;
      }
    }
  }
});

window.addEventListener("keydown", (event) => {
  const lane = KEY_CODES.indexOf(event.code);

  if (
    lane !== -1 ||
    event.code === "Escape" ||
    event.code === "KeyR"
  ) {
    event.preventDefault();
  }

  if (
    event.repeat ||
    game.heldKeys.has(event.code)
  ) {
    return;
  }

  game.heldKeys.add(event.code);

  if (event.code === "Escape") {
    selectScreen();
    return;
  }

  if (game.state === "select" && lane !== -1) {
    startGame(lane);
    return;
  }

  if (game.state === "playing") {
    if (lane !== -1) {
      hit(lane);
    } else if (event.code === "KeyR") {
      startGame(game.selected);
    }

    return;
  }

  if (game.state === "result" && lane !== -1) {
    selectScreen();
  }
});

window.addEventListener("keyup", (event) => {
  game.heldKeys.delete(event.code);
});

window.addEventListener("blur", () => {
  game.heldKeys.clear();
});

/*
 * 別アプリに切り替えたときは選曲画面に戻す。
 * 音と画面のずれを防ぐため。
 */
document.addEventListener("visibilitychange", () => {
  if (
    document.hidden &&
    (
      game.state === "playing" ||
      game.state === "loading"
    )
  ) {
    selectScreen(
      "画面を離れたため、曲選択に戻りました。"
    );
  }
});

/* ============================================================
 * メインループ
 * ============================================================
 */

let previousFrame = performance.now();

function frame(now) {
  const dt = Math.min(
    (now - previousFrame) / 1000,
    0.05
  );

  previousFrame = now;

  update(dt);
  draw();

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
