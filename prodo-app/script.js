// -------- DATA --------
let customHabits = JSON.parse(localStorage.getItem("customHabits")) || [];

let streakData = JSON.parse(localStorage.getItem("streakData")) || {
  streak: 0,
  lastDate: null
};

let lastResetDate = localStorage.getItem("lastResetDate");

// -------- DATE --------
function getToday() {
  return new Date().toDateString();
}

// -------- RESET DAILY --------
function resetHabitsIfNewDay() {
  const today = getToday();

  if (lastResetDate !== today) {
    customHabits = customHabits.map(h => ({ ...h, done: false }));

    localStorage.setItem("customHabits", JSON.stringify(customHabits));
    localStorage.setItem("lastResetDate", today);

    lastResetDate = today;
  }
}

// -------- NAVIGATION --------
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  if (id === 'habits') renderHabits();
  if (id === 'history') renderHistory();
}

// -------- AI --------
function goAI() {
  let message = "Start working";

  const pending = customHabits.find(h => !h.done);

  if (pending) {
    message = "Do this: " + pending.name;
  } else if (customHabits.length > 0) {
    message = "All tasks done";
  }

  document.getElementById("aiText").innerText = message;
  show('ai');
}

function goHome() {
  show('home');
  updateScore();
}

// -------- HABITS --------
function addHabit() {
  const input = document.getElementById("newHabit");
  const value = input.value.trim();

  if (!value) return;

  customHabits.push({ name: value, done: false });

  localStorage.setItem("customHabits", JSON.stringify(customHabits));

  input.value = "";
  renderHabits();
}

function toggleHabit(index) {
  customHabits[index].done = !customHabits[index].done;

  localStorage.setItem("customHabits", JSON.stringify(customHabits));

  updateScore();
  updateStreak();
  saveDailyHistory(); // IMPORTANT
}

function renderHabits() {
  const list = document.getElementById("habitList");
  list.innerHTML = "";

  customHabits.forEach((h, i) => {
    list.innerHTML += `
      <label>
        <input type="checkbox" ${h.done ? "checked" : ""}
        onclick="toggleHabit(${i})">
        ${h.name}
      </label><br><br>
    `;
  });
}

// -------- SCORE --------
function calculateScore() {
  let score = 0;

  customHabits.forEach(h => {
    if (h.done) score += 20;
  });

  return Math.min(score, 100);
}

function updateScore() {
  document.getElementById("score").innerText = calculateScore();
}

// -------- STREAK --------
function updateStreak() {
  const today = getToday();

  const anyDone = customHabits.some(h => h.done);
  if (!anyDone) return;

  // prevent multiple increments same day
  if (streakData.lastDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (streakData.lastDate === yesterday.toDateString()) {
    streakData.streak += 1;
  } else {
    streakData.streak = 1;
  }

  streakData.lastDate = today;

  localStorage.setItem("streakData", JSON.stringify(streakData));

  displayStreak();
}

function displayStreak() {
  document.getElementById("streak").innerText = streakData.streak + " 🔥";
}

// -------- HISTORY --------
function saveDailyHistory() {
  const today = getToday();

  let history = JSON.parse(localStorage.getItem("history")) || [];

  const index = history.findIndex(h => h.date === today);

  const data = {
    date: today,
    score: calculateScore(),
    streak: streakData.streak
  };

  if (index !== -1) {
    history[index] = data; // update same day
  } else {
    history.push(data); // new day
  }

  localStorage.setItem("history", JSON.stringify(history));
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const container = document.getElementById("historyList");

  if (history.length === 0) {
    container.innerHTML = "No data yet";
    return;
  }

  container.innerHTML = "";

  history.slice().reverse().forEach(h => {
    container.innerHTML += `
      <div style="margin-bottom:10px;">
        <b>${h.date}</b><br>
        Score: ${h.score} | Streak: ${h.streak} 🔥
      </div>
    `;
  });
}

// -------- INIT --------
window.onload = function() {
  resetHabitsIfNewDay();
  renderHabits();
  updateScore();
  displayStreak();
};