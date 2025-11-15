import Player from "./Player.js";
import Ground from "./Ground.js";
import CactiController from "./CactiController.js";
import Score from "./Score.js";

document.fonts.load('10px "Etude Noire"').then(() => {
  requestAnimationFrame(gameLoop);
});

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GAME_SPEED_START = 1; // 1.0
const GAME_SPEED_INCREMENT = 0.00001;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 88 / 1.5; //58
const PLAYER_HEIGHT = 94 / 1.5; //62
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_AND_CACTUS_SPEED = 0.5;

const CACTI_CONFIG = [
  { width: 48 / 1.5, height: 100 / 1.5, image: "images/cactus_1.png" },
  { width: 98 / 1.5, height: 100 / 1.5, image: "images/cactus_2.png" },
  { width: 68 / 1.5, height: 70 / 1.5, image: "images/cactus_3.png" },
];

//Game Objects
let player = null;
let ground = null;
let cactiController = null;
let score = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameOver = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;

function createSprites() {
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

  const groundWidthInGame = GROUND_WIDTH * scaleRatio;
  const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

  player = new Player(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio
  );

  ground = new Ground(
    ctx,
    groundWidthInGame,
    groundHeightInGame,
    GROUND_AND_CACTUS_SPEED,
    scaleRatio
  );

  const cactiImages = CACTI_CONFIG.map((cactus) => {
    const image = new Image();
    image.src = cactus.image;
    return {
      image: image,
      width: cactus.width * scaleRatio,
      height: cactus.height * scaleRatio,
    };
  });

  cactiController = new CactiController(
    ctx,
    cactiImages,
    scaleRatio,
    GROUND_AND_CACTUS_SPEED
  );

  score = new Score(ctx, scaleRatio);
}

function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}

setScreen();

// Прыжок по клику мыши
canvas.addEventListener("mousedown", () => {
  if (!gameOver && !waitingToStart) {
    player.jumpPressed = true; // имитация нажатия пробела
  }
});

canvas.addEventListener("mouseup", () => {
  player.jumpPressed = false; // имитация отпускания пробела
});


//Use setTimeout on Safari mobile rotation otherwise works fine on desktop
window.addEventListener("resize", () => setTimeout(setScreen, 500));

if (screen.orientation) {
  screen.orientation.addEventListener("change", setScreen);
}

function getScaleRatio() {
  const screenHeight = Math.min(
    window.innerHeight,
    document.documentElement.clientHeight
  );

  const screenWidth = Math.min(
    window.innerWidth,
    document.documentElement.clientWidth
  );

  //window is wider than the game width
  if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;
  }
}

function showGameOver() {
  const fontSize = 32 * scaleRatio;
  ctx.font = `${fontSize}px "Etude Noire"`;
  ctx.fillStyle = "#535353";

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

 ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20 * scaleRatio);

  // Доп. текст
  const smallFontSize = 12 * scaleRatio;
  ctx.font = `${smallFontSize}px "Etude Noire"`;
  ctx.fillStyle = "#6d6d6d";

  ctx.fillText(
    "Играть заново",
    canvas.width / 2,
    canvas.height / 2 + fontSize - 15 * scaleRatio
  );
}

function setupGameReset() {
  if (!hasAddedEventListenersForRestart) {
    hasAddedEventListenersForRestart = true;

    setTimeout(() => {
      window.addEventListener("keyup", (e) => {
          if (e.code === "Space") {
            reset();
          }
        }, { once: true });
      window.addEventListener("touchstart", reset, { once: true });
      canvas.addEventListener("mousedown", reset, { once: true }); // ← добавляем клик мышью
    }, 1000);
  }
}

function reset() {
  hasAddedEventListenersForRestart = false;
  gameOver = false;
  waitingToStart = false;
  ground.reset();
  cactiController.reset();
  score.reset();
  gameSpeed = GAME_SPEED_START;
}

/*
function showStartGameText() {
  const fontSize = 32 * scaleRatio;
  ctx.font = `${fontSize}px "Etude Noire"`;
  ctx.fillStyle = "#535353";

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText("Кликните для старта", canvas.width / 2, canvas.height / 2);
}
*/

function showStartGameText() {
  const fontSize = 16 * scaleRatio;
  ctx.font = `${fontSize}px "Etude Noire"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const text = "Играть";

  const textWidth = ctx.measureText(text).width;

  const paddingX = 20 * scaleRatio;
  const paddingTop = 10 * scaleRatio;
  const paddingBottom = 15 * scaleRatio;

  const x = canvas.width / 2;
  const y = canvas.height / 2;

  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = fontSize + paddingTop + paddingBottom;

  const bx = x - boxWidth / 2;
  const by = y - boxHeight / 2;
  const radius = 14 * scaleRatio;

  // прямоугольник со скруглением
  ctx.beginPath();
  ctx.moveTo(bx + radius, by);
  ctx.lineTo(bx + boxWidth - radius, by);
  ctx.quadraticCurveTo(bx + boxWidth, by, bx + boxWidth, by + radius);
  ctx.lineTo(bx + boxWidth, by + boxHeight - radius);
  ctx.quadraticCurveTo(bx + boxWidth, by + boxHeight, bx + boxWidth - radius, by + boxHeight);
  ctx.lineTo(bx + radius, by + boxHeight);
  ctx.quadraticCurveTo(bx, by + boxHeight, bx, by + boxHeight - radius);
  ctx.lineTo(bx, by + radius);
  ctx.quadraticCurveTo(bx, by, bx + radius, by);
  ctx.closePath();

  ctx.fillStyle = "#e3e3e3";
  ctx.fill();

  // текст
  ctx.fillStyle = "#333";
  ctx.fillText(text, x, y);
}




function updateGameSpeed(frameTimeDelta) {
  gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;
}

function clearScreen() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }
  const frameTimeDelta = currentTime - previousTime;
  previousTime = currentTime;

  clearScreen();

  if (!gameOver && !waitingToStart) {
    //Update game objects
    ground.update(gameSpeed, frameTimeDelta);
    cactiController.update(gameSpeed, frameTimeDelta);
    player.update(gameSpeed, frameTimeDelta);
    score.update(frameTimeDelta);
    updateGameSpeed(frameTimeDelta);
  }

  if (!gameOver && cactiController.collideWith(player)) {
    gameOver = true;
    setupGameReset();
    score.setHighScore();
  }

  //Draw game objects
  ground.draw();
  cactiController.draw();
  player.draw();
  score.draw();

  if (gameOver) {
    showGameOver();
  }

  if (waitingToStart) {
    showStartGameText();
  }

  requestAnimationFrame(gameLoop);
}


requestAnimationFrame(gameLoop);

// Старт игры по клику или тапу
function startGame() {
  waitingToStart = false;
  window.removeEventListener("click", startGame);
  window.removeEventListener("touchstart", startGame);
}

window.addEventListener("click", startGame);
window.addEventListener("touchstart", startGame);
