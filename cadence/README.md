# Cadence

**Cadence** is a browser-based running calculator that helps you dial in race distance, target time, and cadence — then shows the stride length you need to hit your goal. Change any value and the related fields update live, with training advice that stays in sync.

No install, no build step, no backend. Open `index.html` and go.

## Features

- **Race distance** — metres (default 5000), with per-field reset
- **Target time** — hours, minutes, and seconds (default 0:20:00)
- **Cadence** — steps per minute (default 180)
- **Stride length** — metres, calculated to 2 decimal places (default 1.39)
- **Bidirectional calculation** — edit cadence → stride updates; edit stride → cadence updates
- **Race presets** — common distances from 1000 m to 100K with slow, medium, and fast recreational target times
- **Reset All** — restore every field to its default and recalculate
- **Live training advice** — summary, goals, and tip update as you change inputs
- **Responsive UI** — works on phone, tablet, and desktop

## Quick start

1. Clone or download this repository.
2. Open `index.html` in a modern browser.

```bash
# Optional: serve locally (any static server works)
npx serve .
# or
python3 -m http.server 8000
```

Then visit the URL shown (for example `http://localhost:3000` or `http://localhost:8000`).

You can also open the file directly:

```bash
open index.html   # macOS
```

## How to use

1. Set your **race distance** in metres, or pick a row from **Race presets**.
2. Set your **target time** (hours : minutes : seconds), or click a **Slow**, **Medium**, or **Fast** time in the presets table.
3. Set a **cadence** (around 180 steps/min is a common aim) — the calculator fills in the **stride length** you need.
4. Or enter your current **stride length** to see what **cadence** you need for the same race and time.
5. Use each field’s **Reset** button, or **Reset All**, to return to defaults.

The **Training advice** section restates your target and suggests how to train toward that cadence and stride.

## Race presets

The presets table lists common races from track to ultra. Each row has three recreational (non-elite) target times. Clicking a time loads that distance and target into the calculator and recalculates stride length (your current cadence is kept).

| Race           | Distance   | Slow    | Medium  | Fast    |
|----------------|------------|---------|---------|---------|
| 1000 m         | 1,000 m    | 5:30    | 4:15    | 3:20    |
| 1500 m         | 1,500 m    | 8:00    | 6:15    | 5:00    |
| Mile           | 1,609 m    | 8:30    | 6:45    | 5:20    |
| 3000 m         | 3,000 m    | 16:30   | 13:00   | 10:30   |
| 5K             | 5,000 m    | 35:00   | 26:00   | 20:00   |
| 10K            | 10,000 m   | 1:15:00 | 55:00   | 42:00   |
| 15K            | 15,000 m   | 1:55:00 | 1:25:00 | 1:05:00 |
| 10 mile        | 16,093 m   | 2:05:00 | 1:35:00 | 1:15:00 |
| Half marathon  | 21,097 m   | 2:40:00 | 2:05:00 | 1:45:00 |
| Marathon       | 42,195 m   | 5:15:00 | 4:10:00 | 3:30:00 |
| 50K            | 50,000 m   | 7:30:00 | 6:00:00 | 4:45:00 |
| 100K           | 100,000 m  | 15:00:00| 12:00:00| 9:30:00 |

These times are aimed at everyday club and road runners, not elites (for example a “fast” 5K is 20:00 and a “fast” marathon is 3:30). Editing distance or time manually, or using Reset, clears the highlighted preset selection.

## Calculation

Stride length is derived from race distance, target time, and cadence:

```
stride length (m) = race distance (m) / (target time in minutes × cadence)
```

**Example** (defaults):

```
5000 / (20 × 180) = 1.39 m
```

Target time is entered as hours, minutes, and seconds, then converted to total minutes (including fractional minutes from seconds) for the formula. Stride length is shown to **two decimal places**. When you edit stride length, cadence is recalculated and rounded to the nearest whole number:

```
cadence = round(race distance / (target time in minutes × stride length))
```

## Defaults

| Field          | Default   | Unit           |
|----------------|-----------|----------------|
| Race distance  | 5000      | metres         |
| Target time    | 0:20:00   | h:mm:ss        |
| Cadence        | 180       | steps / min    |
| Stride length  | 1.39      | metres         |

## Project structure

```
cadence/
├── index.html      # Page structure, calculator, and presets table shell
├── styles.css      # Layout, theme, and responsive styles
├── app.js          # Calculations, advice, and preset data / interactions
├── requirements.md # Product requirements
└── README.md       # This file
```

| File            | Role |
|-----------------|------|
| `index.html`    | Markup for inputs, actions, advice, and presets section |
| `styles.css`    | Visual design (deep teal theme, typography, motion, presets table) |
| `app.js`        | Parsing, stride/cadence math, resets, live advice, race presets |
| `requirements.md` | Original feature requirements |

## Tech stack

- Plain HTML, CSS, and vanilla JavaScript (ES modules not required; a single IIFE in `app.js`)
- Google Fonts: [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) and [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3)
- No frameworks, bundlers, or package manager

## Browser support

Works in current versions of Chrome, Firefox, Safari, and Edge. Requires JavaScript enabled. Uses standard form controls and CSS custom properties.

## Accessibility

- Semantic labels, fieldset/legend for target time, and a visually hidden calculator heading
- Per-control and page-level reset actions as real buttons
- Preset times are buttons with clear `aria-label`s; the selected preset uses `aria-pressed`
- Horizontally scrollable presets region is keyboard-focusable on small screens
- Advice region uses `aria-live="polite"` so updates are announced without stealing focus
- Visible focus styles on interactive controls

## License

No license file is included in this repository yet. Add one if you intend to distribute or reuse the project under specific terms.
