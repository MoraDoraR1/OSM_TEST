import { saveScore, getTop } from "./firebase.js";

const STATE = {
  IDLE: "idle",
  WAITING: "waiting",
  READY: "ready",
  TOO_EARLY: "too-early",
  RESULT: "result",
};

const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 12000;

const gameEl = document.getElementById("game");
const messageEl = document.getElementById("message");
const resultBox = document.getElementById("resultBox");
const resultTimeEl = document.getElementById("resultTime");
const nicknameForm = document.getElementById("nicknameForm");
const nicknameInput = document.getElementById("nicknameInput");
const saveStatus = document.getElementById("saveStatus");
const leaderboard = document.getElementById("leaderboard");
const leaderboardList = document.getElementById("leaderboardList");

let state = STATE.IDLE;
let timeoutId = null;
let readyAt = 0;
let lastMs = null;

function setState(next) {
  state = next;
  gameEl.className = "screen state-" + next;
}

function clearTimer() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

function resetResultUI() {
  resultBox.classList.add("hidden");
  leaderboard.classList.add("hidden");
  nicknameForm.reset();
  saveStatus.textContent = "";
}

function toIdle() {
  clearTimer();
  resetResultUI();
  setState(STATE.IDLE);
  messageEl.textContent = "화면을 클릭하면 시작합니다";
}

function startWaiting() {
  resetResultUI();
  setState(STATE.WAITING);
  messageEl.textContent = "빨간색으로 바뀔 때까지 기다리세요...";

  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  timeoutId = setTimeout(() => {
    timeoutId = null;
    readyAt = performance.now();
    setState(STATE.READY);
    messageEl.textContent = "지금 클릭하세요!";
  }, delay);
}

function showTooEarly() {
  clearTimer();
  setState(STATE.TOO_EARLY);
  messageEl.textContent = "너무 빨랐습니다! 다시 시도하려면 클릭하세요.";
}

async function showResult() {
  const ms = Math.round(performance.now() - readyAt);
  lastMs = ms;
  setState(STATE.RESULT);
  messageEl.textContent = "";
  resultTimeEl.textContent = `${ms} ms`;
  resultBox.classList.remove("hidden");
  await renderLeaderboard();
}

async function renderLeaderboard() {
  leaderboard.classList.remove("hidden");
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
      li.textContent = `${entry.nickname} - ${entry.ms}ms`;
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
      startWaiting();
      break;
    case STATE.WAITING:
      showTooEarly();
      break;
    case STATE.READY:
      showResult();
      break;
    case STATE.TOO_EARLY:
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
