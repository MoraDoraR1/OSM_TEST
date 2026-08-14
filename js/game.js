import { saveScore, getTop } from "./firebase.js";

const STATE = {
  IDLE: "idle",
  RUNNING: "running",
  GAME_OVER: "gameover",
  RESULT: "result",
};

const TARGET_MS = 7777.77;
const HIDE_AFTER_MS = 5000;
const MAX_MS = 10000;

const gameEl = document.getElementById("game");
const messageEl = document.getElementById("message");
const timerDisplayEl = document.getElementById("timerDisplay");
const resultBox = document.getElementById("resultBox");
const resultTimeEl = document.getElementById("resultTime");
const nicknameForm = document.getElementById("nicknameForm");
const nicknameInput = document.getElementById("nicknameInput");
const saveStatus = document.getElementById("saveStatus");
const leaderboardList = document.getElementById("leaderboardList");

let state = STATE.IDLE;
let startedAt = 0;
let rafId = null;
let gameOverTimeoutId = null;
let lastMs = null;

function setState(next) {
  state = next;
  gameEl.className = "screen state-" + next;
}

function formatSeconds(ms) {
  return (ms / 1000).toFixed(3) + "초";
}

function clearTimers() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (gameOverTimeoutId !== null) {
    clearTimeout(gameOverTimeoutId);
    gameOverTimeoutId = null;
  }
}

function resetResultUI() {
  resultBox.classList.add("hidden");
  nicknameForm.reset();
  saveStatus.textContent = "";
}

function toIdle() {
  clearTimers();
  resetResultUI();
  timerDisplayEl.classList.add("hidden");
  setState(STATE.IDLE);
  messageEl.textContent =
    "클릭하면 타이머가 시작됩니다. 5초 이후에는 숫자가 사라지니 감으로 7.77777초에 맞춰 다시 클릭해 멈추세요.";
}

function tick() {
  const elapsed = performance.now() - startedAt;
  if (elapsed >= HIDE_AFTER_MS) {
    timerDisplayEl.classList.add("hidden");
    return;
  }
  timerDisplayEl.textContent = formatSeconds(elapsed);
  rafId = requestAnimationFrame(tick);
}

function startRunning() {
  resetResultUI();
  setState(STATE.RUNNING);
  messageEl.textContent = "지금 클릭해서 7.77777초에 맞춰 멈추세요! (5초 이후에는 숫자가 사라집니다)";
  timerDisplayEl.classList.remove("hidden");
  timerDisplayEl.textContent = formatSeconds(0);

  startedAt = performance.now();
  rafId = requestAnimationFrame(tick);
  gameOverTimeoutId = setTimeout(() => {
    gameOverTimeoutId = null;
    showGameOver();
  }, MAX_MS);
}

function showGameOver() {
  clearTimers();
  setState(STATE.GAME_OVER);
  timerDisplayEl.classList.add("hidden");
  messageEl.textContent = "10초가 지났습니다. 게임 오버! 다시 시도하려면 클릭하세요.";
}

async function showResult(elapsedMs) {
  clearTimers();
  const diffMs = Math.round(Math.abs(elapsedMs - TARGET_MS));
  lastMs = diffMs;

  setState(STATE.RESULT);
  messageEl.textContent = "";
  timerDisplayEl.classList.add("hidden");
  resultTimeEl.textContent = `${formatSeconds(elapsedMs)} (7.77777초와 ${(diffMs / 1000).toFixed(3)}초 차이)`;
  resultBox.classList.remove("hidden");
  await renderLeaderboard();
}

async function renderLeaderboard() {
  leaderboardList.innerHTML = "<li>불러오는 중...</li>";
  try {
    const top = await getTop(10);
    if (top.length === 0) {
      leaderboardList.innerHTML = "<li>기록이 없습니다</li>";
      return;
    }
    leaderboardList.innerHTML = "";
    top.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `${entry.nickname} - ${(entry.ms / 1000).toFixed(3)}초 차이`;
      leaderboardList.appendChild(li);
    });
  } catch (err) {
    leaderboardList.innerHTML = "<li>기록 조회 실패</li>";
    console.error(err);
  }
}

gameEl.addEventListener("click", (event) => {
  if (event.target.closest("#resultBox")) return;

  switch (state) {
    case STATE.IDLE:
      startRunning();
      break;
    case STATE.RUNNING: {
      const elapsed = performance.now() - startedAt;
      if (elapsed >= MAX_MS) {
        showGameOver();
      } else {
        showResult(elapsed);
      }
      break;
    }
    case STATE.GAME_OVER:
    case STATE.RESULT:
      toIdle();
      break;
  }
});

nicknameForm.addEventListener("click", (event) => event.stopPropagation());

nicknameForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const nickname = nicknameInput.value.trim();
  if (!nickname || lastMs === null) return;

  saveStatus.textContent = "저장 중...";
  try {
    await saveScore(lastMs, nickname);
    saveStatus.textContent = "저장되었습니다!";
    await renderLeaderboard();
  } catch (err) {
    saveStatus.textContent = "저장 실패";
    console.error(err);
  }
});

renderLeaderboard();
