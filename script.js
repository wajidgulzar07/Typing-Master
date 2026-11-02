/**
 * ====================================================================
 * TYPING CHALLENGE GAME - JAVASCRIPT LOGIC
 * Course: CSC336 – Web Technologies (Lab Mid Project)
 * Technologies: Pure Vanilla JavaScript (ES6+), HTML5, CSS3
 * 
 * Features:
 *  - Mode A: Bubbles (Letter Recognition)
 *  - Mode B: KeyMagnet (Keyboard Precision)
 *  - Difficulty Levels: Easy, Medium, Hard
 *  - Audio Synthesizer: Pure Web Audio API (Zero external audio files)
 *  - Zero Page Reloads: Clean state resets & memory/loop management
 * ====================================================================
 */

"use strict";

/* ====================================================================
   1. GAME CONFIGURATION & CONSTANTS
   ==================================================================== */
const GAME_CONFIG = {
  // Letters pool for bubbles mode
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),

  // Keyset arrays for Mode B (KeyMagnet)
  keySets: {
    easy: ["A", "S", "D", "F", "J", "K", "L"],
    medium: ["A", "S", "D", "F", "G", "H", "J", "K", "L", "E", "R", "T", "U", "I", "O"],
    hard: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
  },

  // Mode A (Bubbles) Settings per Difficulty
  bubbles: {
    maxMisses: 6,
    pointsPerHit: 10,
    penaltyPerMiss: 2,
    easy: { speed: 1.1, maxConcurrent: 5 },
    medium: { speed: 1.9, maxConcurrent: 6 },
    hard: { speed: 3.0, maxConcurrent: 7 }
  },

  // Mode B (KeyMagnet) Settings per Difficulty
  keymagnet: {
    totalRounds: 25,     // Number of targets per challenge session
    pointsPerHit: 10,
    penaltyPerMiss: 2,
    easy: { timeLimitSec: 3.5 },
    medium: { timeLimitSec: 2.5 },
    hard: { timeLimitSec: 1.6 }
  }
};


/* ====================================================================
   2. GLOBAL GAME STATE VARIABLES
   ==================================================================== */
let currentMode = null;            // 'bubbles' | 'keymagnet' | null
let currentDifficulty = "easy";    // 'easy' | 'medium' | 'hard'
let isGameRunning = false;         // Guard flag to prevent duplicate loops
let isSoundEnabled = true;         // Sound mute/unmute state

// Common Game Statistics
let score = 0;
let correctCount = 0;
let incorrectCount = 0;
let sessionStartTime = 0;

// Mode A Specific State
let activeBubbles = [];            // Array of bubble objects currently on screen
let bubbleMisses = 0;
let bubbleAnimationId = null;      // requestAnimationFrame identifier
let bubbleSpawnIntervalId = null;  // Bubble creation timer ID

// Mode B Specific State
let currentTargetKey = null;
let currentRound = 0;
let targetStartTime = 0;
let responseTimes = [];            // Stores reaction time in ms for each target
let keyTimerIntervalId = null;     // Countdown interval for KeyMagnet
let keyTimeRemaining = 0;          // Seconds remaining for current target


/* ====================================================================
   3. DOM ELEMENT REFERENCES
   ==================================================================== */
// Screens
const screenHome = document.getElementById("home-screen");
const screenBubbles = document.getElementById("bubbles-screen");
const screenKeyMagnet = document.getElementById("keymagnet-screen");
const resultsModal = document.getElementById("results-modal");

// Sound Elements
const soundToggleBtn = document.getElementById("sound-toggle-btn");
const soundIcon = document.getElementById("sound-icon");

// Difficulty selection buttons
const diffButtons = document.querySelectorAll(".diff-btn");

// Mode A Elements
const bubblesArena = document.getElementById("bubbles-arena");
const bubblesScoreEl = document.getElementById("bubbles-score");
const bubblesMissCountEl = document.getElementById("bubbles-miss-count");
const bubblesAccuracyEl = document.getElementById("bubbles-accuracy");
const bubblesDiffDisplay = document.getElementById("bubbles-diff-display");
const bubblesFeedback = document.getElementById("bubbles-feedback");
const missDots = document.querySelectorAll(".miss-dot");

// Mode B Elements
const keymagnetScoreEl = document.getElementById("keymagnet-score");
const keymagnetCorrectEl = document.getElementById("keymagnet-correct-count");
const keymagnetWrongEl = document.getElementById("keymagnet-wrong-count");
const keymagnetAccuracyEl = document.getElementById("keymagnet-accuracy");
const keymagnetAvgTimeEl = document.getElementById("keymagnet-avg-time");
const keymagnetDiffDisplay = document.getElementById("keymagnet-diff-display");
const keymagnetFeedback = document.getElementById("keymagnet-feedback");
const targetLetterDisplay = document.getElementById("target-letter-display");
const magnetTargetBox = document.getElementById("magnet-target-display");
const keyTimerBar = document.getElementById("key-timer-bar");
const countdownValEl = document.getElementById("keymagnet-countdown-val");
const keySetInfoEl = document.getElementById("keymagnet-keyset-info");
const virtualKeys = document.querySelectorAll(".virtual-keyboard .key");

// Modal Elements
const modalStatusIcon = document.getElementById("modal-status-icon");
const modalTitle = document.getElementById("modal-title");
const modalSubtitle = document.getElementById("modal-subtitle");
const summaryScore = document.getElementById("summary-score");
const summaryAccuracy = document.getElementById("summary-accuracy");
const summaryCorrect = document.getElementById("summary-correct");
const summaryMisses = document.getElementById("summary-misses");
const summaryExtraLabel = document.getElementById("summary-extra-label");
const summaryExtraValue = document.getElementById("summary-extra-value");
const modalPlayAgainBtn = document.getElementById("modal-play-again-btn");
const modalMainMenuBtn = document.getElementById("modal-main-menu-btn");


/* ====================================================================
   4. WEB AUDIO SYNTHESIZER (Pure JS - No external audio files needed)
   ==================================================================== */
// AudioContext instance created lazily upon user interaction
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a synthesized sound tone using the Web Audio API oscillator.
 * @param {number} freq - Pitch frequency in Hertz (Hz)
 * @param {string} type - 'sine' | 'triangle' | 'square' | 'sawtooth'
 * @param {number} duration - Duration in seconds
 */
function playTone(freq, type, duration) {
  if (!isSoundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Smooth envelope attack and fade out to avoid speaker clicking
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Audio context may be restricted before gesture; fail gracefully
    console.warn("Audio playback notice:", err);
  }
}

// Sound presets for game actions
const SOUNDS = {
  correct() {
    playTone(600, "sine", 0.1);
    setTimeout(() => playTone(900, "sine", 0.15), 60);
  },
  wrong() {
    playTone(180, "sawtooth", 0.22);
  },
  bubblePop() {
    playTone(450, "triangle", 0.08);
  },
  bubbleEscape() {
    playTone(220, "sine", 0.25);
  },
  gameOver() {
    playTone(350, "sawtooth", 0.2);
    setTimeout(() => playTone(280, "sawtooth", 0.25), 180);
    setTimeout(() => playTone(200, "sawtooth", 0.45), 380);
  },
  victory() {
    playTone(523.25, "sine", 0.12);
    setTimeout(() => playTone(659.25, "sine", 0.12), 120);
    setTimeout(() => playTone(783.99, "sine", 0.15), 240);
    setTimeout(() => playTone(1046.5, "sine", 0.35), 360);
  }
};


/* ====================================================================
   5. NAVIGATION & SCREEN MANAGEMENT
   ==================================================================== */

/**
 * Switches the visible screen cleanly without page reloads.
 * @param {string} targetScreen - 'home' | 'bubbles' | 'keymagnet'
 */
function switchScreen(targetScreen) {
  // Hide all screens
  screenHome.classList.remove("active");
  screenBubbles.classList.remove("active");
  screenKeyMagnet.classList.remove("active");

  // Close results modal if open
  resultsModal.classList.remove("open");

  // Show target screen
  if (targetScreen === "bubbles") {
    screenBubbles.classList.add("active");
  } else if (targetScreen === "keymagnet") {
    screenKeyMagnet.classList.add("active");
  } else {
    screenHome.classList.add("active");
  }
}

/**
 * Sets the active game difficulty and updates UI indicators.
 * @param {string} diff - 'easy' | 'medium' | 'hard'
 */
function setDifficulty(diff) {
  currentDifficulty = diff;
  diffButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.difficulty === diff);
  });
  bubblesDiffDisplay.textContent = diff.toUpperCase();
  keymagnetDiffDisplay.textContent = diff.toUpperCase();
}


/* ====================================================================
   6. FEEDBACK DISPLAY HELPER
   ==================================================================== */

/**
 * Shows temporary green (success) or red (error) toast banner feedback.
 * @param {HTMLElement} bannerEl - The feedback container element
 * @param {string} message - Message text to display
 * @param {boolean} isCorrect - True for green, false for red
 */
function showVisualFeedback(bannerEl, message, isCorrect) {
  bannerEl.textContent = message;
  bannerEl.className = "feedback-banner " + (isCorrect ? "show-correct" : "show-wrong");

  // Clear feedback after 700ms
  clearTimeout(bannerEl._timeout);
  bannerEl._timeout = setTimeout(() => {
    bannerEl.className = "feedback-banner";
    bannerEl.textContent = "";
  }, 700);
}

/**
 * Spawns a floating score particle element (+10 in green or -2 in red).
 */
function spawnFloatingScore(x, y, text, isPositive) {
  const floatEl = document.createElement("div");
  floatEl.className = "floating-score";
  floatEl.textContent = text;
  floatEl.style.left = `${x}px`;
  floatEl.style.top = `${y}px`;
  floatEl.style.color = isPositive ? "var(--color-green)" : "var(--color-red)";

  document.body.appendChild(floatEl);
  setTimeout(() => {
    if (floatEl.parentNode) {
      floatEl.parentNode.removeChild(floatEl);
    }
  }, 650);
}


/* ====================================================================
   7. MODE A: BUBBLES GAME LOGIC
   ==================================================================== */

/**
 * Starts the Bubbles challenge game session.
 */
function startBubblesGame() {
  // 1. Clean up any existing state or loops
  stopAllLoops();
  currentMode = "bubbles";
  isGameRunning = true;

  // 2. Reset Mode A variables
  score = 0;
  correctCount = 0;
  incorrectCount = 0;
  bubbleMisses = 0;
  activeBubbles = [];
  sessionStartTime = performance.now();

  // 3. Clear the arena of old bubble DOM elements
  bubblesArena.innerHTML = `
    <div class="arena-boundary-line">
      <span class="boundary-label">⚠️ DANGER BOUNDARY (BUBBLE ESCAPE ZONE) ⚠️</span>
    </div>
  `;

  // 4. Update HUD displays
  updateBubblesHUD();
  resetMissDots();
  switchScreen("bubbles");

  // 5. Initial spawn: populate arena with initial bubbles
  const config = GAME_CONFIG.bubbles[currentDifficulty];
  for (let i = 0; i < config.maxConcurrent; i++) {
    // Stagger initial bubbles vertically so they don't overlap in one cluster
    setTimeout(() => {
      if (isGameRunning && currentMode === "bubbles") {
        spawnBubble(true);
      }
    }, i * 350);
  }

  // 6. Start the smooth requestAnimationFrame loop
  bubbleAnimationId = requestAnimationFrame(animateBubbles);

  // 7. Regular spawn interval: ensures arena always maintains at least 5+ bubbles
  bubbleSpawnIntervalId = setInterval(() => {
    if (!isGameRunning || currentMode !== "bubbles") return;
    const currentMax = GAME_CONFIG.bubbles[currentDifficulty].maxConcurrent;
    if (activeBubbles.length < currentMax) {
      spawnBubble(false);
    }
  }, 800);
}

/**
 * Creates a single bubble element, picks a random letter, and adds it to the arena.
 * @param {boolean} isInitial - If true, offsets initial vertical position downwards
 */
function spawnBubble(isInitial = false) {
  const arenaRect = bubblesArena.getBoundingClientRect();
  const arenaWidth = arenaRect.width || 800;
  const arenaHeight = arenaRect.height || 500;

  // Pick a random English letter (A-Z)
  const randomIndex = Math.floor(Math.random() * GAME_CONFIG.alphabet.length);
  const letter = GAME_CONFIG.alphabet[randomIndex];

  // Create DOM element for bubble
  const bubbleEl = document.createElement("div");
  bubbleEl.className = "bubble";
  bubbleEl.textContent = letter;

  // Random horizontal position within arena bounds (padding 30px from sides)
  const bubbleSize = 68;
  const minX = 20;
  const maxX = Math.max(minX, arenaWidth - bubbleSize - 30);
  const posX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

  // Vertical position: start at bottom of arena
  const startY = isInitial 
    ? arenaHeight - 40 + Math.random() * 120 
    : arenaHeight + 10;

  bubbleEl.style.left = `${posX}px`;
  bubbleEl.style.top = `${startY}px`;

  // Attach click handler for mouse or touch screen support
  bubbleEl.addEventListener("click", () => {
    handleBubbleLetterInput(letter, posX + bubbleSize / 2, startY);
  });

  bubblesArena.appendChild(bubbleEl);

  // Bubble state object
  const bubbleObj = {
    element: bubbleEl,
    letter: letter,
    x: posX,
    y: startY,
    speed: GAME_CONFIG.bubbles[currentDifficulty].speed + (Math.random() * 0.4 - 0.2), // slight variance
    isPopped: false
  };

  activeBubbles.push(bubbleObj);
}

/**
 * The main animation loop for Mode A using requestAnimationFrame.
 * Moves every active bubble upwards and checks for top boundary misses.
 */
function animateBubbles() {
  if (!isGameRunning || currentMode !== "bubbles") return;

  const topBoundaryY = 55; // Danger line position from top of arena

  for (let i = activeBubbles.length - 1; i >= 0; i--) {
    const bubble = activeBubbles[i];

    if (bubble.isPopped) continue;

    // Move bubble upwards continuously
    bubble.y -= bubble.speed;
    bubble.element.style.top = `${bubble.y}px`;

    // Check if bubble reached top boundary (Escape / Miss)
    if (bubble.y <= topBoundaryY) {
      handleBubbleEscape(bubble, i);
    }
  }

  // Keep looping smoothly at 60 FPS
  bubbleAnimationId = requestAnimationFrame(animateBubbles);
}

/**
 * Triggered when a bubble crosses the top boundary.
 * Increments misses, updates dots, and checks for Game Over (6 misses).
 */
function handleBubbleEscape(bubble, index) {
  bubble.isPopped = true;
  bubble.element.classList.add("escaped");
  SOUNDS.bubbleEscape();

  // Remove from active array
  activeBubbles.splice(index, 1);

  // Remove DOM element after animation completes
  setTimeout(() => {
    if (bubble.element.parentNode) {
      bubble.element.parentNode.removeChild(bubble.element);
    }
  }, 350);

  // Increment misses count
  bubbleMisses++;
  updateBubblesHUD();
  updateMissDots(bubbleMisses);

  showVisualFeedback(bubblesFeedback, `Miss! Bubble escaped (-2)`, false);

  // Penalty for missing: deduct 2 points (cannot drop below 0)
  score = Math.max(0, score - GAME_CONFIG.bubbles.penaltyPerMiss);
  updateBubblesHUD();

  // Check Game-Over condition: End game after 6 misses
  if (bubbleMisses >= GAME_CONFIG.bubbles.maxMisses) {
    endGame("Game Over!", "You reached the maximum limit of 6 misses.");
  }
}

/**
 * Handles letter input for Mode A (called on keydown or bubble click).
 */
function handleBubbleLetterInput(pressedLetter, clickX, clickY) {
  if (!isGameRunning || currentMode !== "bubbles") return;

  // Search for the lowest bubble (closest to danger) that matches pressed letter
  let matchIndex = -1;
  let highestRiskY = 99999;

  for (let i = 0; i < activeBubbles.length; i++) {
    const b = activeBubbles[i];
    if (!b.isPopped && b.letter === pressedLetter) {
      if (b.y < highestRiskY) {
        highestRiskY = b.y;
        matchIndex = i;
      }
    }
  }

  if (matchIndex !== -1) {
    // CORRECT KEYPRESS:
    const matchedBubble = activeBubbles[matchIndex];
    matchedBubble.isPopped = true;
    matchedBubble.element.classList.add("popped");

    // Audio and Visual feedback
    SOUNDS.bubblePop();
    showVisualFeedback(bubblesFeedback, `Correct! +10 Points`, true);

    const arenaRect = bubblesArena.getBoundingClientRect();
    const fx = clickX || (arenaRect.left + matchedBubble.x + 30);
    const fy = clickY || (arenaRect.top + matchedBubble.y);
    spawnFloatingScore(fx, fy, "+10", true);

    // Update stats
    score += GAME_CONFIG.bubbles.pointsPerHit;
    correctCount++;

    // Remove from array and DOM
    activeBubbles.splice(matchIndex, 1);
    setTimeout(() => {
      if (matchedBubble.element.parentNode) {
        matchedBubble.element.parentNode.removeChild(matchedBubble.element);
      }
    }, 350);

    // Dynamic speed progression: slight speed bump every 100 points
    if (score % 100 === 0) {
      activeBubbles.forEach((b) => (b.speed += 0.15));
    }

  } else {
    // INCORRECT KEYPRESS:
    SOUNDS.wrong();
    showVisualFeedback(bubblesFeedback, `Wrong Key! -2 Points`, false);

    // Deduct points (cannot drop below 0)
    score = Math.max(0, score - GAME_CONFIG.bubbles.penaltyPerMiss);
    incorrectCount++;
  }

  updateBubblesHUD();
}

/**
 * Updates Mode A HUD elements: score, miss count, accuracy percentage.
 */
function updateBubblesHUD() {
  bubblesScoreEl.textContent = score;
  bubblesMissCountEl.textContent = bubbleMisses;

  const totalInputs = correctCount + incorrectCount + bubbleMisses;
  const accuracy = totalInputs === 0 ? 100 : Math.round((correctCount / totalInputs) * 100);
  bubblesAccuracyEl.textContent = `${accuracy}%`;
}

/**
 * Resets the 6 visual miss indicator dots.
 */
function resetMissDots() {
  missDots.forEach((dot) => dot.classList.remove("filled"));
}

/**
 * Lights up the miss dots up to current miss count.
 */
function updateMissDots(count) {
  missDots.forEach((dot) => {
    const idx = parseInt(dot.dataset.index, 10);
    dot.classList.toggle("filled", idx <= count);
  });
}


/* ====================================================================
   8. MODE B: KEYMAGNET GAME LOGIC
   ==================================================================== */

/**
 * Starts the KeyMagnet challenge game session.
 */
function startKeyMagnetGame() {
  // 1. Clean up existing loops
  stopAllLoops();
  currentMode = "keymagnet";
  isGameRunning = true;

  // 2. Reset Mode B variables
  score = 0;
  correctCount = 0;
  incorrectCount = 0;
  currentRound = 0;
  responseTimes = [];
  sessionStartTime = performance.now();

  // 3. Update HUD and Keyset description
  updateKeyMagnetHUD();
  updateKeySetBadge();
  switchScreen("keymagnet");

  // 4. Generate the very first target key
  nextKeyMagnetTarget();
}

/**
 * Updates the Keyset label to inform the user which keys are in play.
 */
function updateKeySetBadge() {
  if (currentDifficulty === "easy") {
    keySetInfoEl.textContent = "Home Row Practice: A S D F J K L";
  } else if (currentDifficulty === "medium") {
    keySetInfoEl.textContent = "Home Row & Extended: A-L + E R T U I O";
  } else {
    keySetInfoEl.textContent = "Full Keyboard: A - Z (Shorter Time Limit)";
  }
}

/**
 * Picks a random key from the selected difficulty's array and starts its timer.
 */
function nextKeyMagnetTarget() {
  if (!isGameRunning || currentMode !== "keymagnet") return;

  // Check completion condition: Target rounds completed
  if (currentRound >= GAME_CONFIG.keymagnet.totalRounds) {
    SOUNDS.victory();
    endGame("Challenge Completed!", `You conquered all ${GAME_CONFIG.keymagnet.totalRounds} target keys!`);
    return;
  }

  currentRound++;

  // Get key pool based on difficulty
  const keyPool = GAME_CONFIG.keySets[currentDifficulty];

  // Pick random key, ensuring it's not identical to the immediate previous one
  let newKey;
  do {
    const randomIndex = Math.floor(Math.random() * keyPool.length);
    newKey = keyPool[randomIndex];
  } while (newKey === currentTargetKey && keyPool.length > 1);

  currentTargetKey = newKey;

  // Display target letter
  targetLetterDisplay.textContent = currentTargetKey;
  magnetTargetBox.className = "magnet-target-display"; // reset classes

  // Highlight key on the visual keyboard
  highlightVirtualKey(currentTargetKey);

  // Setup response time limit countdown
  targetStartTime = performance.now();
  startKeyCountdown();
}

/**
 * Manages the countdown timer bar for the current target key.
 */
function startKeyCountdown() {
  clearInterval(keyTimerIntervalId);

  const totalTimeLimit = GAME_CONFIG.keymagnet[currentDifficulty].timeLimitSec;
  keyTimeRemaining = totalTimeLimit;
  countdownValEl.textContent = keyTimeRemaining.toFixed(1);
  keyTimerBar.style.width = "100%";

  const intervalStepMs = 50;
  const decrementStep = intervalStepMs / 1000;

  keyTimerIntervalId = setInterval(() => {
    if (!isGameRunning || currentMode !== "keymagnet") {
      clearInterval(keyTimerIntervalId);
      return;
    }

    keyTimeRemaining -= decrementStep;

    if (keyTimeRemaining <= 0) {
      // Time Expired for this target: Counts as an incorrect miss
      clearInterval(keyTimerIntervalId);
      countdownValEl.textContent = "0.0";
      keyTimerBar.style.width = "0%";
      handleKeyMagnetTimeout();
    } else {
      // Update visual countdown and progress bar
      countdownValEl.textContent = Math.max(0, keyTimeRemaining).toFixed(1);
      const percentage = (keyTimeRemaining / totalTimeLimit) * 100;
      keyTimerBar.style.width = `${Math.max(0, percentage)}%`;
    }
  }, intervalStepMs);
}

/**
 * Called when the timer runs out before the user hits the target key.
 */
function handleKeyMagnetTimeout() {
  SOUNDS.wrong();
  incorrectCount++;
  score = Math.max(0, score - GAME_CONFIG.keymagnet.penaltyPerMiss);

  showVisualFeedback(keymagnetFeedback, `Time Out! Missed key '${currentTargetKey}'`, false);
  magnetTargetBox.classList.add("wrong-shake");

  updateKeyMagnetHUD();

  // Move to next target after brief pause
  setTimeout(() => {
    if (isGameRunning && currentMode === "keymagnet") {
      nextKeyMagnetTarget();
    }
  }, 400);
}

/**
 * Handles user keypress or click for Mode B (KeyMagnet).
 */
function handleKeyMagnetInput(pressedKey) {
  if (!isGameRunning || currentMode !== "keymagnet") return;

  // Stop countdown timer
  clearInterval(keyTimerIntervalId);

  // Calculate response time in milliseconds
  const reactionTime = Math.round(performance.now() - targetStartTime);

  const targetBoxRect = magnetTargetBox.getBoundingClientRect();
  const fx = targetBoxRect.left + targetBoxRect.width / 2;
  const fy = targetBoxRect.top;

  if (pressedKey === currentTargetKey) {
    // CORRECT KEYPRESS:
    SOUNDS.correct();
    score += GAME_CONFIG.keymagnet.pointsPerHit;
    correctCount++;
    responseTimes.push(reactionTime);

    // Visual feedback on target and visual keyboard
    magnetTargetBox.classList.add("correct-pop");
    flashVirtualKeyFeedback(pressedKey, true);
    showVisualFeedback(keymagnetFeedback, `Correct! ${reactionTime} ms (+10)`, true);
    spawnFloatingScore(fx, fy, `+10 (${reactionTime}ms)`, true);

  } else {
    // INCORRECT KEYPRESS:
    SOUNDS.wrong();
    score = Math.max(0, score - GAME_CONFIG.keymagnet.penaltyPerMiss);
    incorrectCount++;

    magnetTargetBox.classList.add("wrong-shake");
    flashVirtualKeyFeedback(pressedKey, false);
    showVisualFeedback(keymagnetFeedback, `Wrong key '${pressedKey}'! Target: '${currentTargetKey}'`, false);
    spawnFloatingScore(fx, fy, `-2`, false);
  }

  updateKeyMagnetHUD();

  // Proceed to next target key after small feedback delay
  setTimeout(() => {
    if (isGameRunning && currentMode === "keymagnet") {
      nextKeyMagnetTarget();
    }
  }, 380);
}

/**
 * Updates Mode B HUD statistics: score, correct/incorrect, accuracy, avg response time.
 */
function updateKeyMagnetHUD() {
  keymagnetScoreEl.textContent = score;
  keymagnetCorrectEl.textContent = correctCount;
  keymagnetWrongEl.textContent = incorrectCount;

  // Accuracy calculation
  const total = correctCount + incorrectCount;
  const accuracy = total === 0 ? 100 : Math.round((correctCount / total) * 100);
  keymagnetAccuracyEl.textContent = `${accuracy}%`;

  // Average response time calculation
  if (responseTimes.length > 0) {
    const sum = responseTimes.reduce((acc, t) => acc + t, 0);
    const avg = Math.round(sum / responseTimes.length);
    keymagnetAvgTimeEl.textContent = `${avg} ms`;
  } else {
    keymagnetAvgTimeEl.textContent = `0 ms`;
  }
}

/**
 * Highlights the target key on the on-screen visual keyboard.
 */
function highlightVirtualKey(targetKey) {
  virtualKeys.forEach((keyEl) => {
    keyEl.classList.remove("is-target", "key-hit-success", "key-hit-error");
    if (keyEl.dataset.key === targetKey) {
      keyEl.classList.add("is-target");
    }
  });
}

/**
 * Flashes green or red on a visual key when pressed.
 */
function flashVirtualKeyFeedback(key, isSuccess) {
  virtualKeys.forEach((keyEl) => {
    if (keyEl.dataset.key === key) {
      keyEl.classList.add(isSuccess ? "key-hit-success" : "key-hit-error");
      setTimeout(() => {
        keyEl.classList.remove("key-hit-success", "key-hit-error");
      }, 300);
    }
  });
}


/* ====================================================================
   9. GLOBAL KEYBOARD INPUT LISTENER (Physical Keyboard)
   ==================================================================== */
window.addEventListener("keydown", (e) => {
  // Ignore special function keys (F1-F12, Alt, Tab, Ctrl, etc.)
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  const key = e.key.toUpperCase();

  // If game is running, route input to current mode
  if (isGameRunning) {
    // Only accept A-Z English letters or Space
    if (/^[A-Z ]$/.test(key)) {
      e.preventDefault(); // Prevent accidental page scrolling with Space

      if (currentMode === "bubbles") {
        handleBubbleLetterInput(key);
      } else if (currentMode === "keymagnet") {
        handleKeyMagnetInput(key);
      }
    }
  }
});


/* ====================================================================
   10. RESULTS MODAL & GAME OVER HANDLING
   ==================================================================== */

/**
 * Halts the game and presents the performance summary modal.
 * @param {string} title - 'Game Over!' or 'Challenge Completed!'
 * @param {string} subtitle - Explanatory subtitle
 */
function endGame(title, subtitle) {
  stopAllLoops();
  isGameRunning = false;

  // Sound cue
  if (title.includes("Completed")) {
    SOUNDS.victory();
    modalStatusIcon.textContent = "🏆";
  } else {
    SOUNDS.gameOver();
    modalStatusIcon.textContent = "💥";
  }

  // Populate modal texts
  modalTitle.textContent = title;
  modalSubtitle.textContent = subtitle;
  summaryScore.textContent = score;

  const totalActions = correctCount + incorrectCount + (currentMode === "bubbles" ? bubbleMisses : 0);
  const finalAccuracy = totalActions === 0 ? 100 : Math.round((correctCount / totalActions) * 100);
  summaryAccuracy.textContent = `${finalAccuracy}%`;
  summaryCorrect.textContent = correctCount;
  summaryMisses.textContent = currentMode === "bubbles" ? bubbleMisses : incorrectCount;

  // Extra metric based on mode
  if (currentMode === "keymagnet") {
    summaryExtraLabel.textContent = "Average Response Time";
    const avg = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) 
      : 0;
    summaryExtraValue.textContent = `${avg} ms`;
  } else {
    summaryExtraLabel.textContent = "Bubbles Popped";
    summaryExtraValue.textContent = `${correctCount} bubbles`;
  }

  // Display modal
  resultsModal.classList.add("open");
}


/* ====================================================================
   11. STATE RESET & CLEANUP (Crucial for Lab Mid Viva!)
   ==================================================================== */

/**
 * Safely stops all active animation loops, intervals, and timers.
 * Prevents memory leaks or multiple concurrent loops.
 */
function stopAllLoops() {
  isGameRunning = false;

  // 1. Cancel requestAnimationFrame
  if (bubbleAnimationId) {
    cancelAnimationFrame(bubbleAnimationId);
    bubbleAnimationId = null;
  }

  // 2. Clear intervals
  if (bubbleSpawnIntervalId) {
    clearInterval(bubbleSpawnIntervalId);
    bubbleSpawnIntervalId = null;
  }
  if (keyTimerIntervalId) {
    clearInterval(keyTimerIntervalId);
    keyTimerIntervalId = null;
  }
}

/**
 * Fully resets the game state and returns to the Home screen without reloading.
 */
function resetToHomeScreen() {
  stopAllLoops();
  currentMode = null;
  score = 0;
  correctCount = 0;
  incorrectCount = 0;
  bubbleMisses = 0;
  activeBubbles = [];
  responseTimes = [];
  currentTargetKey = null;

  // Clear arena
  bubblesArena.innerHTML = `
    <div class="arena-boundary-line">
      <span class="boundary-label">⚠️ DANGER BOUNDARY (BUBBLE ESCAPE ZONE) ⚠️</span>
    </div>
  `;

  // Remove virtual keyboard highlights
  virtualKeys.forEach((k) => k.classList.remove("is-target", "key-hit-success", "key-hit-error"));

  // Switch to Home view
  switchScreen("home");
}

/**
 * Restarts the active mode immediately with current difficulty.
 */
function restartCurrentMode() {
  if (currentMode === "bubbles") {
    startBubblesGame();
  } else if (currentMode === "keymagnet") {
    startKeyMagnetGame();
  }
}


/* ====================================================================
   12. EVENT LISTENERS INITIALIZATION
   ==================================================================== */
function initEventListeners() {
  // Sound Mute/Unmute Toggle
  soundToggleBtn.addEventListener("click", () => {
    isSoundEnabled = !isSoundEnabled;
    soundIcon.textContent = isSoundEnabled ? "🔊" : "🔇";
    soundToggleBtn.title = isSoundEnabled ? "Mute Sound" : "Unmute Sound";
  });

  // Difficulty Pill Buttons on Home Screen
  diffButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setDifficulty(btn.dataset.difficulty);
    });
  });

  // Start Mode Buttons on Home Screen Cards
  document.querySelectorAll(".start-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.startMode;
      if (mode === "bubbles") {
        startBubblesGame();
      } else if (mode === "keymagnet") {
        startKeyMagnetGame();
      }
    });
  });

  // Navigation: Home buttons in HUDs
  document.querySelectorAll(".home-nav-btn").forEach((btn) => {
    btn.addEventListener("click", resetToHomeScreen);
  });

  // Restart buttons in HUDs
  document.getElementById("bubbles-restart-btn").addEventListener("click", startBubblesGame);
  document.getElementById("keymagnet-restart-btn").addEventListener("click", startKeyMagnetGame);

  // Reset buttons in HUDs
  document.getElementById("bubbles-reset-btn").addEventListener("click", resetToHomeScreen);
  document.getElementById("keymagnet-reset-btn").addEventListener("click", resetToHomeScreen);

  // Results Modal Buttons
  modalPlayAgainBtn.addEventListener("click", () => {
    resultsModal.classList.remove("open");
    restartCurrentMode();
  });

  modalMainMenuBtn.addEventListener("click", () => {
    resultsModal.classList.remove("open");
    resetToHomeScreen();
  });

  // Virtual Keyboard Click / Tap Support
  virtualKeys.forEach((keyEl) => {
    keyEl.addEventListener("click", () => {
      if (isGameRunning && currentMode === "keymagnet") {
        const pressed = keyEl.dataset.key;
        handleKeyMagnetInput(pressed);
      }
    });
  });
}

// Initialize listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  setDifficulty("easy"); // default difficulty
});
