# ⌨️ Typing Challenge Game

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)

A fast, fun, browser-based typing game that trains **letter recognition, typing speed, reaction time and keyboard accuracy** through two challenge modes and three difficulty levels. Built with pure **HTML5, CSS3 and JavaScript (ES6+)** – no frameworks, no libraries, no build step.

> **CSC336 – Web Technologies · Lab Mid Project**
> COMSATS University Islamabad, Vehari Campus · BS Software Engineering
> Instructor: Yasmeen Jana · CLO4 – Markup & Scripting Client-Side Technologies

![Home screen](screenshots/home-easy.png)

---

## 📑 Table of Contents
- [Game Modes](#-game-modes)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Difficulty Levels](#-difficulty-levels)
- [Scoring](#-scoring)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Customisation](#-customisation)
- [Browser Support](#-browser-support)
- [Author](#-author)

---

## 🎮 Game Modes

### 🫧 Mode A – Bubbles Challenge
*Letter recognition & reflexes*
- 5+ letter bubbles float upward at the same time.
- Press the matching letter (or click the bubble) to pop it: **+10 points**.
- Wrong key: **−2 points**.
- If **6 bubbles** escape past the danger line at the top, the game is over.

### 🎯 Mode B – KeyMagnet Challenge
*Keyboard precision & muscle memory*
- A target key is shown and highlighted on an on-screen keyboard.
- Press it before the countdown bar runs out.
- Instant green (correct) / red (wrong) key feedback.
- Tracks **accuracy** and **average response time (ms)** over **25 targets**.

---

## ✨ Features
- Two distinct game modes
- Three difficulty levels: **Easy, Medium, Hard**
- Live HUD: score, accuracy, misses, hits and average response time
- Floating score popups, burst and shake animations
- Interactive virtual keyboard (physical keyboard **and** mouse/touch)
- Sound effects generated with the **Web Audio API** (no audio files) with a mute button
- Results dialog with full performance summary
- Restart / Reset / Home controls **without page reload**
- Responsive design for desktop, tablet and mobile

---

## 📸 Screenshots

| Home – Easy | Home – Hard |
|---|---|
| ![Home Easy](screenshots/home-easy.png) | ![Home Hard](screenshots/home-hard.png) |

| Bubbles – Playing | Bubbles – Feedback |
|---|---|
| ![Bubbles playing](screenshots/bubbles-playing.png) | ![Bubbles feedback](screenshots/bubbles-feedback.png) |

| Bubbles – Game Over | KeyMagnet – Target |
|---|---|
| ![Bubbles game over](screenshots/bubbles-gameover.png) | ![KeyMagnet target](screenshots/keymagnet-target.png) |

| KeyMagnet – Correct | KeyMagnet – Wrong |
|---|---|
| ![KeyMagnet correct](screenshots/keymagnet-correct.png) | ![KeyMagnet wrong](screenshots/keymagnet-wrong.png) |

| KeyMagnet – Results | Mobile View |
|---|---|
| ![KeyMagnet results](screenshots/keymagnet-results.png) | <img src="screenshots/mobile-home.png" width="200" alt="Mobile view"> |

---

## 📊 Difficulty Levels

| Feature | Easy | Medium | Hard |
|---|---|---|---|
| Bubble speed | 1.1 px/frame | 1.9 px/frame | 3.0 px/frame |
| Concurrent bubbles | 5 | 6 | 7 |
| KeyMagnet keys | Home row: `A S D F J K L` | `A–L` + `E R T U I O` | Full alphabet `A–Z` |
| Time per key | 3.5 s | 2.5 s | 1.6 s |

---

## 🏆 Scoring

| Event | Result |
|---|---|
| Correct key / bubble popped | **+10** |
| Wrong key, escaped bubble or time-out | **−2** (score never below 0) |
| Accuracy | `Correct ÷ (Correct + Incorrect + Misses) × 100` |
| Avg. response time (Mode B) | Sum of reaction times ÷ number of correct hits |

---

## 🚀 Getting Started

No installation or server needed.

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo-name>.git

# 2. Open the folder
cd <your-repo-name>

# 3. Open index.html in your browser (or just double-click it)
```

Then choose a difficulty and click **Play Bubbles** or **Play KeyMagnet**.

> Internet is only used to load Google Fonts; the game falls back to system fonts when offline.

---

## 📁 Project Structure

```
├── index.html        # Page structure: home, bubbles & keymagnet screens, results modal
├── style.css         # Theme variables, layout, animations, responsive rules
├── script.js         # Game config, state, both modes, audio, input handling
├── VIVA_GUIDE.md     # Viva preparation notes
├── README.md         # Project documentation
└── screenshots/      # Images used in this README
```

---

## 🧠 How It Works

- **Animation loop:** `requestAnimationFrame` moves every bubble each frame; bubbles reaching the top line count as misses.
- **Timers:** `setInterval` spawns bubbles and drives the KeyMagnet countdown; `performance.now()` measures reaction time in milliseconds.
- **Input:** a global `keydown` listener converts keys with `toUpperCase()`, filters with `/^[A-Z ]$/` and routes input to the active mode.
- **Random letters:** `Math.floor(Math.random() * alphabet.length)` picks a random array index.
- **State reset:** `stopAllLoops()` cancels animation frames and intervals before every new game, so Restart works without `location.reload()`.
- **Sound:** oscillators from the Web Audio API synthesize all sound effects.

See [`VIVA_GUIDE.md`](VIVA_GUIDE.md) for detailed explanations and viva Q&A.

---

## 🔧 Customisation

All difficulty values are in the `GAME_CONFIG` object at the top of `script.js`:

```js
bubbles: {
  maxMisses: 6,
  pointsPerHit: 10,
  penaltyPerMiss: 2,
  easy:   { speed: 1.1, maxConcurrent: 5 },
  medium: { speed: 1.9, maxConcurrent: 6 },
  hard:   { speed: 3.0, maxConcurrent: 7 }
}
```

---

## 🌐 Browser Support
Latest versions of Chrome, Edge, Firefox and Safari.

---

## 👤 Author
**Your Name** – Reg. No. `XXXX-XXXX-XXX`
BS Software Engineering, COMSATS University Islamabad, Vehari Campus

---

## 📄 License
This project was created for educational purposes as part of the CSC336 Lab Mid assessment.
