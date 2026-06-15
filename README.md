# Split-Flap Display

A realistic split-flap (Solari board) display built with pure JavaScript and CSS. No dependencies, no canvas — just DOM elements with 3D CSS animations that simulate the mechanical flip of each character.

## Features

- Physically accurate flip animation with gravity, overshoot, and bounce
- Forward-only drum rotation through the full alphabet, showing every intermediate character
- Per-unit wear variation for an organic, real-hardware look
- Text coloring and background coloring per character
- Centered or positioned text writing
- Accent-insensitive input (diacritics are stripped automatically)
- Configurable grid size, flip speed, and step interval

## Getting Started

Open `index.html` in any modern browser. No build step or server required.

```
open index.html
```

## Usage

Import the `SplitFlap` class and attach it to a container element:

```js
import { SplitFlap } from './splitflap.js';

const sf = new SplitFlap(document.getElementById('board'), {
  rows: 4,
  cols: 20,
  stepInterval: 55, // ms between intermediate characters
  flipMs: 120       // single flap animation duration
});
```

### Writing text

```js
// Simple write at row 0, col 0
sf.write("HELLO WORLD");

// Centered on a specific row
sf.write("CENTERED", { row: 1, center: true });

// With color
sf.write("ALERT", { row: 2, col: 5, color: '#ff3d00' });

// With background
sf.write("OK", { row: 3, center: true, bg: '#006600' });
```

### Setting individual characters

```js
sf.set(0, 0, 'A'); // row 0, col 0
```

### Coloring

```js
sf.color(0, 3, '#f5c542');    // tint text at row 0, col 3
sf.background(1, 0, '#fff');  // set flap background at row 1, col 0
```

### Clearing

```js
sf.clear();       // flip all cells to blank
sf.clearColors(); // reset all text and background colors
```

## API Reference

### Constructor Options

| Option         | Default | Description                              |
| -------------- | ------- | ---------------------------------------- |
| `rows`         | `4`     | Number of rows                           |
| `cols`         | `20`    | Number of columns                        |
| `stepInterval` | `55`    | Milliseconds between intermediate flips  |
| `flipMs`       | `120`   | Duration of a single flap animation (ms) |
| `alphabet`     | `' A-Z0-9.,!?:/-'` | Characters on the drum        |

### Methods

| Method | Description |
| --- | --- |
| `write(text, opts?)` | Write a string to the board. Options: `row`, `col`, `center`, `color`, `bg` |
| `set(row, col, char)` | Set a single character with flip animation |
| `color(row, col, hex)` | Tint a character's text color (`null` to reset) |
| `background(row, col, hex)` | Set a character's flap background color (`null` to reset) |
| `clear()` | Flip all cells to blank |
| `clearColors()` | Reset all text and background colors |

## File Structure

```
index.html      — Entry point
splitflap.js    — SplitFlap engine (ES module)
splitflap.css   — Flap rendering, flip animation, color overrides
script.js       — Demo: rotating messages on a 4×20 board
style.css       — Page layout and board enclosure styling
```

## Browser Support

Works in all modern browsers that support CSS `perspective`, 3D transforms, `color-mix()`, and ES modules.

<p align="center">
  <a href="https://c3b.fun/r/SplitFlapDisplay" aria-label="C3B">
    <img src="https://img.shields.io/badge/C3B-feito%20por%20ctresb-ff5f7e?style=for-the-badge" alt="C3B" />
  </a>
</p>
