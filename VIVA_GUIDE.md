# Typing Challenge Game – University Lab Mid Project (CSC336)
**COMSATS University Islamabad, Vehari Campus**  
**Course:** CSC336 – Web Technologies | **Class:** BS Software Engineering (BSSE)  
**Instructor:** Yasmeen Jana | **CLO:** CLO4 (Markup & Scripting Client-Side Technologies)

---

## 1. Project Overview & Architecture

### What is this project?
The **Typing Challenge Game** is a client-side web application engineered to test, train, and improve typing speed, letter recognition, reaction time, and keyboard accuracy. It offers two distinct interactive gameplay modes:
1. **Mode A (Bubbles - Letter Recognition):** Dynamic floating letter bubbles move upward toward an upper danger boundary. The user must recognize and type letters before 6 bubbles escape.
2. **Mode B (KeyMagnet - Keyboard Precision):** A precision targeting mode where the user is prompted with target letters (home-row, extended, or full keyboard). The system tracks response time in milliseconds (ms), hit/error counts, and accuracy percentage against an on-screen interactive keyboard.

### Technology Stack (Strictly Vanilla)
- **HTML5:** Semantic document structure (header, main, section, footer, dialog modals, forms).
- **CSS3:** Custom properties (CSS variables), Flexbox, CSS Grid, animations, glassmorphism, responsive breakpoints.
- **JavaScript (ES6+):** Pure client-side logic, event delegation, DOM manipulation, `requestAnimationFrame`, `setInterval`, arrays, objects, and Web Audio API synthesizer.
- **No external frameworks or libraries:** 0% React, 0% Node.js, 0% external APIs, 0% npm dependencies. Runs right out of the box in any modern web browser.

---

## 2. Core Viva Concepts Explained Simply

### 1. What is HTML used for in this project?
HTML provides the **skeleton and structural foundation** of the application. It defines:
- The screens (`#home-screen`, `#bubbles-screen`, `#keymagnet-screen`).
- The heads-up display (HUD) elements: score badges, miss indicators, accuracy displays, buttons.
- The visual layout of the virtual keyboard rows and keys.
- The results dialog modal overlay for game-over and completion summaries.

### 2. What is CSS used for in this project?
CSS provides the **visual styling, layout, theme, and animations**. It defines:
- **CSS Variables (`:root`):** Consistent color theme (indigo, cyan, emerald green, crimson red).
- **Flexbox & Grid:** Aligning HUD panels, mode selection cards, and virtual keyboard keys.
- **Keyframe Animations:** `@keyframes bubbleBurst` for popping bubbles and `@keyframes targetShake` for incorrect keypresses.
- **Responsive Media Queries:** `@media (max-width: 860px)` and `@media (max-width: 480px)` ensuring optimal usability on phones, tablets, and laptops.

### 3. What is JavaScript used for in this project?
JavaScript provides the **behavior, interactivity, state management, and real-time computation**. It handles:
- Listening to keyboard presses (`keydown`) and screen clicks (`click`).
- The 60-FPS continuous bubble movement loop using `requestAnimationFrame`.
- The countdown timer intervals using `setInterval` and `clearInterval`.
- Generating random letters from arrays.
- Calculating scores, accuracy percentages, and average reaction times.
- Dynamic DOM manipulation (creating bubble `<div>` elements, adding/removing CSS classes).
- Audio synthesis via the Web Audio API without requiring any external mp3/wav files.

### 4. How does Mode A (Bubbles) work?
1. An array called `activeBubbles` keeps track of all bubbles currently on screen.
2. An interval spawns bubble elements at random horizontal positions at the bottom of the arena.
3. An animation loop powered by `requestAnimationFrame` updates every bubble's vertical position (`bubble.y -= bubble.speed`) every frame.
4. When a user presses a key, the function `handleBubbleLetterInput(pressedKey)` checks if any active bubble contains that letter. If found, the bubble plays a pop animation, awards +10 points, and is deleted from the DOM and array.
5. If an unmatched key is pressed, 2 points are deducted.
6. If a bubble reaches the top boundary (`bubble.y <= 55px`), it escapes, triggering a miss. Once 6 misses accumulate, `endGame()` is called.

### 5. How does Mode B (KeyMagnet) work?
1. The game selects a random target letter from the designated key pool (e.g. Home-Row keys `['A', 'S', 'D', 'F', 'J', 'K', 'L']` on Easy).
2. The letter is displayed in the center target card, and the corresponding visual key on the on-screen keyboard is highlighted in glowing cyan.
3. A timer bar counts down from the difficulty time limit (3.5s for Easy, 2.5s for Medium, 1.6s for Hard).
4. `performance.now()` records the timestamp when the letter appears.
5. When the user types or clicks the key:
   - If correct: Elapsed reaction time (`currentTime - startTime`) is recorded in `responseTimes`, +10 points are awarded, and the key illuminates green.
   - If incorrect or if time expires: -2 points are deducted, an error is recorded, and the key shakes red.
6. After 25 targets, the mode ends, and final statistics (including Average Response Time in ms) are presented in the results modal.

### 6. How are random letters generated?
A standard JavaScript array of uppercase English alphabet letters is declared:
```javascript
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
```
To pick a random letter:
```javascript
const randomIndex = Math.floor(Math.random() * alphabet.length);
const randomLetter = alphabet[randomIndex];
```
- `Math.random()` generates a decimal number between `0` (inclusive) and `1` (exclusive).
- Multiplying by `alphabet.length` (26) gives a float between `0` and `25.999`.
- `Math.floor()` rounds down to the nearest integer (`0` to `25`), matching a valid array index.

### 7. How does keyboard input work?
A global event listener is attached to the browser window:
```javascript
window.addEventListener("keydown", (e) => {
  const key = e.key.toUpperCase();
  // route key to current active game mode
});
```
- `e.key` contains the character value of the physical key pressed.
- `.toUpperCase()` standardizes input so 'a' and 'A' are treated identically regardless of Caps Lock.
- Regex `/^[A-Z ]$/` verifies that only valid alphabet letters or space are evaluated, ignoring function keys like F1-F12, Shift, or Tab.

### 8. How is the score calculated?
- **Correct Key / Pop:** `score += 10`
- **Incorrect Key / Miss / Timeout:** `score = Math.max(0, score - 2)` (using `Math.max(0, ...)` guarantees the score never becomes negative).
- **Accuracy Percentage:** 
  $$\text{Accuracy} = \left(\frac{\text{Total Correct}}{\text{Total Correct} + \text{Total Incorrect} + \text{Misses}}\right) \times 100$$

### 9. How does the timer work?
Two types of timing mechanisms are utilized:
1. **`requestAnimationFrame(animateBubbles)`:** Used for high-performance rendering of moving bubbles. It synchronizes with the monitor's refresh rate (typically 60Hz = ~16.6ms per frame) for butter-smooth animation without screen tearing.
2. **`setInterval()` / `clearInterval()`:** Used for the countdown progress bar in Mode B and periodic bubble spawning in Mode A.
3. **`performance.now()`:** A high-resolution DOM timer used to measure reaction times in precise milliseconds.

### 10. What are event listeners?
An event listener is a built-in browser mechanism that waits for a specific user action (such as `click`, `keydown`, or `DOMContentLoaded`) and executes a specified JavaScript callback function when that event occurs.
*Example:*
```javascript
modalPlayAgainBtn.addEventListener("click", () => {
  restartCurrentMode();
});
```

### 11. What is DOM manipulation?
The **Document Object Model (DOM)** is the browser's tree representation of HTML elements. DOM manipulation is using JavaScript methods to inspect, create, modify, or remove elements dynamically:
- `document.createElement("div")`: Creates a new bubble node.
- `element.classList.add("active")`: Modifies CSS classes for styling.
- `element.textContent = score`: Updates visible text on screen.
- `parent.removeChild(child)`: Destroys popped bubbles.

### 12. How do Easy, Medium, and Hard levels work?
| Feature | Easy | Medium | Hard |
| :--- | :--- | :--- | :--- |
| **Bubbles Speed** | `1.1 px/frame` (Slow) | `1.9 px/frame` (Normal) | `3.0 px/frame` (Fast) |
| **Concurrent Bubbles**| 5 bubbles | 6 bubbles | 7 bubbles |
| **KeyMagnet Keyset** | Home-Row (`A, S, D, F, J, K, L`) | Extended (`A-L + E, R, T, U, I, O`) | Full Alphabet (`A - Z`) |
| **KeyMagnet Time Limit** | 3.5 seconds / key | 2.5 seconds / key | 1.6 seconds / key |

### 13. How does Restart work without page reload?
Instead of calling `location.reload()` (which is slow, wipes browser state, and flickers), the project uses a dedicated state reset function:
1. Cancels active animation frames (`cancelAnimationFrame`).
2. Clears intervals (`clearInterval`).
3. Resets all numerical counters (`score = 0`, `misses = 0`, `correctCount = 0`).
4. Clears leftover DOM elements inside `.bubbles-arena`.
5. Reruns the initialization function (`startBubblesGame()` or `startKeyMagnetGame()`).

### 14. How does the game detect Game Over?
- **Mode A (Bubbles):** Checks if `bubbleMisses >= 6`. When the 6th bubble crosses the red boundary line, the game halts immediately and calls `endGame("Game Over!", "You reached the maximum limit of 6 misses.")`.
- **Mode B (KeyMagnet):** Checks if `currentRound >= 25`. When the 25th target is evaluated, `endGame("Challenge Completed!", ...)` is called.

---

## 3. Line-by-Line Explanation of Key Functions

### Function 1: `startBubblesGame()`
```javascript
function startBubblesGame() {
  stopAllLoops();               // 1. Terminate any previous timers or animation frames
  currentMode = "bubbles";      // 2. Set current mode flag to 'bubbles'
  isGameRunning = true;         // 3. Set guard flag to enable key inputs and game updates

  score = 0;                    // 4. Initialize score counter to 0
  correctCount = 0;             // 5. Initialize correct hits counter
  incorrectCount = 0;           // 6. Initialize incorrect hits counter
  bubbleMisses = 0;             // 7. Initialize miss counter to 0
  activeBubbles = [];           // 8. Empty the array holding active bubble references
  sessionStartTime = performance.now(); // 9. Record start time

  // 10. Reset the visual arena by re-inserting the danger boundary line
  bubblesArena.innerHTML = `
    <div class="arena-boundary-line">
      <span class="boundary-label">⚠️ DANGER BOUNDARY (BUBBLE ESCAPE ZONE) ⚠️</span>
    </div>
  `;

  updateBubblesHUD();           // 11. Render initial 0 score and 100% accuracy to screen
  resetMissDots();              // 12. Turn off all 6 red miss indicator dots
  switchScreen("bubbles");      // 13. Hide Home screen and display Bubbles screen

  // 14. Populate arena with initial bubbles staggered vertically
  const config = GAME_CONFIG.bubbles[currentDifficulty];
  for (let i = 0; i < config.maxConcurrent; i++) {
    setTimeout(() => {
      if (isGameRunning && currentMode === "bubbles") {
        spawnBubble(true);
      }
    }, i * 350);
  }

  // 15. Launch the 60FPS animation loop
  bubbleAnimationId = requestAnimationFrame(animateBubbles);

  // 16. Launch background interval to maintain active bubble count
  bubbleSpawnIntervalId = setInterval(() => {
    if (!isGameRunning || currentMode !== "bubbles") return;
    const currentMax = GAME_CONFIG.bubbles[currentDifficulty].maxConcurrent;
    if (activeBubbles.length < currentMax) {
      spawnBubble(false);
    }
  }, 800);
}
```

### Function 2: `handleBubbleLetterInput(pressedLetter, clickX, clickY)`
```javascript
function handleBubbleLetterInput(pressedLetter, clickX, clickY) {
  if (!isGameRunning || currentMode !== "bubbles") return;

  let matchIndex = -1;
  let highestRiskY = 99999;

  // Search active bubbles for matching letter closest to the top boundary
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
    // Matched: Trigger burst animation, sound, and score
    const matchedBubble = activeBubbles[matchIndex];
    matchedBubble.isPopped = true;
    matchedBubble.element.classList.add("popped");

    SOUNDS.bubblePop();
    showVisualFeedback(bubblesFeedback, `Correct! +10 Points`, true);

    score += GAME_CONFIG.bubbles.pointsPerHit;
    correctCount++;

    activeBubbles.splice(matchIndex, 1); // Remove from tracking array
    setTimeout(() => {
      if (matchedBubble.element.parentNode) {
        matchedBubble.element.parentNode.removeChild(matchedBubble.element);
      }
    }, 350);
  } else {
    // Not matched: Penalize player
    SOUNDS.wrong();
    showVisualFeedback(bubblesFeedback, `Wrong Key! -2 Points`, false);
    score = Math.max(0, score - GAME_CONFIG.bubbles.penaltyPerMiss);
    incorrectCount++;
  }

  updateBubblesHUD();
}
```

### Function 3: `handleKeyMagnetInput(pressedKey)`
```javascript
function handleKeyMagnetInput(pressedKey) {
  if (!isGameRunning || currentMode !== "keymagnet") return;

  clearInterval(keyTimerIntervalId); // Stop the countdown timer

  // Calculate elapsed response time in milliseconds
  const reactionTime = Math.round(performance.now() - targetStartTime);

  if (pressedKey === currentTargetKey) {
    // Correct key hit
    SOUNDS.correct();
    score += GAME_CONFIG.keymagnet.pointsPerHit;
    correctCount++;
    responseTimes.push(reactionTime);

    magnetTargetBox.classList.add("correct-pop");
    flashVirtualKeyFeedback(pressedKey, true);
    showVisualFeedback(keymagnetFeedback, `Correct! ${reactionTime} ms (+10)`, true);
  } else {
    // Incorrect key hit
    SOUNDS.wrong();
    score = Math.max(0, score - GAME_CONFIG.keymagnet.penaltyPerMiss);
    incorrectCount++;

    magnetTargetBox.classList.add("wrong-shake");
    flashVirtualKeyFeedback(pressedKey, false);
    showVisualFeedback(keymagnetFeedback, `Wrong key '${pressedKey}'! Target: '${currentTargetKey}'`, false);
  }

  updateKeyMagnetHUD();

  // Load next target key after small animation delay
  setTimeout(() => {
    if (isGameRunning && currentMode === "keymagnet") {
      nextKeyMagnetTarget();
    }
  }, 380);
}
```

---

## 4. Top 20 University Viva Questions & Model Answers

**Q1: What are semantic HTML tags and did you use them?**  
*Answer:* Yes. Semantic tags clearly describe their meaning to both the browser and the developer. I used `<header>`, `<main>`, `<section>`, `<button>`, and `<footer>` instead of using generic `<div>` tags everywhere.

**Q2: What is the purpose of the `:root` pseudo-class in your CSS?**  
*Answer:* `:root` matches the root element of the document (the `<html>` tag) and is used to declare global CSS custom properties (variables) like colors and font families, allowing centralized theme management.

**Q3: How do you achieve glassmorphism in CSS?**  
*Answer:* By combining a semi-transparent background color (e.g., `rgba(18, 24, 38, 0.85)`), a thin border (`1px solid rgba(255, 255, 255, 0.08)`), and the `backdrop-filter: blur(16px)` property.

**Q4: Why did you use `requestAnimationFrame` instead of `setInterval` for the bubble movement?**  
*Answer:* `requestAnimationFrame` is optimized by the browser to run right before the next screen repaint (usually 60 times a second). It pauses automatically when the user switches browser tabs, saving CPU and battery, whereas `setInterval` can stutter and cause frame drops.

**Q5: What is the purpose of `"use strict";` at the top of `script.js`?**  
*Answer:* Strict mode enforces stricter parsing and error handling in JavaScript. It prevents accidental global variables, prohibits duplicate parameter names, and makes the code cleaner and more secure.

**Q6: What is event delegation or why did you use `querySelectorAll`?**  
*Answer:* `document.querySelectorAll()` selects all matching elements as a NodeList. I iterate over them using `.forEach()` to attach event listeners to multiple buttons (like difficulty pills or virtual keyboard keys) in a clean, maintainable way.

**Q7: How did you prevent the score from becoming negative?**  
*Answer:* I used `Math.max(0, score - 2)`. If `score - 2` becomes less than 0, `Math.max()` returns 0.

**Q8: How does the game differentiate between uppercase and lowercase keypresses?**  
*Answer:* By converting `e.key.toUpperCase()`. Whether the user presses 'a' or 'A', the value is normalized to uppercase, matching the letter values stored in our arrays.

**Q9: Why does the restart button not reload the webpage?**  
*Answer:* Calling `location.reload()` forces the browser to request and reload all assets from scratch, which causes flickering. Instead, our `restartCurrentMode()` function resets all state variables, clears active timers, cleans the DOM, and re-invokes the start function in pure JavaScript.

**Q10: How do you prevent multiple timers or animation loops from running at the same time?**  
*Answer:* Before launching any loop, `stopAllLoops()` cancels the active `bubbleAnimationId` using `cancelAnimationFrame()`, clears intervals using `clearInterval()`, and uses the boolean guard flag `isGameRunning`.

**Q11: How do you calculate the player's accuracy?**  
*Answer:* By dividing the total correct hits by the sum of all inputs (correct + incorrect + misses), then multiplying by 100 and rounding using `Math.round()`.

**Q12: How is average response time calculated in Mode B?**  
*Answer:* Each reaction time is saved in the `responseTimes` array. We sum all values using the ES6 `.reduce()` array method and divide by `responseTimes.length`.

**Q13: How does the sound work without any external MP3 files?**  
*Answer:* I used the browser's native **Web Audio API** (`AudioContext`). It uses software oscillators (`ctx.createOscillator()`) to synthesize musical frequencies (sine, sawtooth, triangle waves) and a gain node to create short envelope bursts.

**Q14: What happens if a player hits a key that matches two bubbles on screen?**  
*Answer:* The logic scans the bubbles and targets the one with the smallest `y` coordinate (the one closest to the top danger line), prioritizing the highest-risk bubble.

**Q15: How does mobile touch input work?**  
*Answer:* For Mode A, click/touch listeners are attached directly to each bubble element. For Mode B, each key on the visual keyboard has a click event listener that passes `keyEl.dataset.key` to the input handler.

**Q16: What is `performance.now()` and why not use `Date.now()`?**  
*Answer:* `performance.now()` provides high-resolution timestamps with sub-millisecond precision measured monotonically from navigation start, making it ideal for accurate game reaction time measurement.

**Q17: How does CSS Flexbox differ from CSS Grid in your layout?**  
*Answer:* CSS Grid is two-dimensional (used for the 3-column difficulty selector and 2-column mode cards), while Flexbox is one-dimensional (used for aligning items in the HUD bar and centering letters inside bubbles).

**Q18: What is a closure in JavaScript and where is it used?**  
*Answer:* A closure is when an inner function remembers variables from its outer scope even after the outer function has executed. Our event listener callbacks and timeout functions are closures that retain access to `letter`, `posX`, and `matchedBubble`.

**Q19: What is the purpose of `e.preventDefault()` in your keydown listener?**  
*Answer:* When the user presses the Space bar, the browser's default behavior is to scroll down the webpage. Calling `e.preventDefault()` suppresses that behavior so the game window stays stationary.

**Q20: How are the game modes styled differently on Easy, Medium, and Hard?**  
*Answer:* By updating the active CSS class on the difficulty buttons, updating the HUD badge text, and altering the speed constants, concurrent bubble count, and keyset arrays stored in the `GAME_CONFIG` object.

---

## 5. One-Minute Viva Presentation Speech (To say to your Teacher)

> *"Good morning / afternoon Ma'am Yasmeen.*  
>  
> *I have developed the **Typing Challenge Game** for our CSC336 Lab Mid project, adhering strictly to the CLO4 requirements using pure HTML5, CSS3, and modern ES6+ JavaScript, with zero external libraries or frameworks.*  
>  
> *The application has two distinct interactive game modes:*  
> *In **Mode A, the Bubbles challenge**, letters float upward at speeds determined by the selected difficulty: Easy, Medium, or Hard. The player pops matching bubbles before 6 of them escape past the upper danger boundary line. It provides real-time green/red feedback, awards 10 points for hits, and deducts 2 points for errors.*  
>  
> *In **Mode B, KeyMagnet**, the focus shifts to precision and muscle memory. It presents target letters starting from home-row keys on Easy, up to the full alphabet on Hard, accompanied by an interactive visual keyboard layout. The system tracks accuracy and computes the player's exact average reaction time in milliseconds using `performance.now()`.*  
>  
> *All gameplay controls—Start, Restart, and Reset—function smoothly without any page reloads. Animation frames and intervals are systematically cleaned up with `cancelAnimationFrame` and `clearInterval` to avoid memory leaks. The interface is also fully responsive on mobile and desktop.*  
>  
> *I am ready to demonstrate both modes and explain any part of the code."*
