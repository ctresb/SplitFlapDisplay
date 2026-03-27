/**
 * SplitFlap — A physically accurate split-flap display engine.
 *
 * Each unit simulates a rotating drum of flaps. The drum only spins
 * forward through the alphabet, every intermediate character is shown,
 * and a generation counter lets new targets cancel in-flight sequences.
 */
export class SplitFlap {
  static DEFAULT_ALPHABET =
    ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?:/-';

  constructor(container, opts = {}) {
    this.container = container;
    this.cols      = opts.cols ?? 20;
    this.rows      = opts.rows ?? 4;
    this.alphabet  = opts.alphabet ?? SplitFlap.DEFAULT_ALPHABET;

    // Timing (ms)
    this.stepInterval = opts.stepInterval ?? 55;   // drum rotation speed
    this.flipMs       = opts.flipMs       ?? 120;  // single flap animation

    // Internal state
    this.units   = [];   // [row][col] → DOM refs
    this.current = [];   // [row][col] → current char
    this._gen    = [];   // [row][col] → generation counter

    this._initDOM();
  }

  /* ──────────────────────────────────────────────
     DOM construction
     ────────────────────────────────────────────── */

  _initDOM() {
    this.container.classList.add('sf-board');
    // Clear any existing children
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }

    // Set CSS custom properties the stylesheet can read
    this.container.style.setProperty('--flip-ms', this.flipMs + 'ms');

    for (let r = 0; r < this.rows; r++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'sf-row';
      this.units[r]   = [];
      this.current[r]  = [];
      this._gen[r]     = [];

      for (let c = 0; c < this.cols; c++) {
        const unit = this._createUnit(' ');
        rowEl.appendChild(unit.el);
        this.units[r][c]   = unit;
        this.current[r][c] = ' ';
        this._gen[r][c]    = 0;
      }
      this.container.appendChild(rowEl);
    }
  }

  _createUnit(ch) {
    const el = document.createElement('div');
    el.className = 'sf-unit';

    // Subtle per-unit wear variation (brightness 0.96 – 1.04)
    el.style.setProperty('--wear', (0.96 + Math.random() * 0.08).toFixed(3));

    // Top half
    const top = document.createElement('div');
    top.className = 'sf-flap sf-top';
    const charTop = document.createElement('span');
    charTop.className = 'sf-char';
    charTop.textContent = ch;
    top.appendChild(charTop);

    // Bottom half
    const bottom = document.createElement('div');
    bottom.className = 'sf-flap sf-bottom';
    const charBottom = document.createElement('span');
    charBottom.className = 'sf-char';
    charBottom.textContent = ch;
    bottom.appendChild(charBottom);

    el.appendChild(top);
    el.appendChild(bottom);

    return { el, top, bottom, charTop, charBottom };
  }

  /* ──────────────────────────────────────────────
     Single-flap flip (the atomic visual operation)
     ────────────────────────────────────────────── */

  /**
   * Force a flip animation on a unit even when the character hasn't changed.
   * Used by background() / color() so visual changes look like real flips.
   */
  _visualFlip(row, col, delay = 0) {
    setTimeout(() => {
      const unit = this.units[row][col];
      const ch   = this.current[row][col];

      const prev = unit.el.querySelector('.sf-card');
      if (prev) {
        clearTimeout(prev._cleanup);
        prev.remove();
      }

      const card = document.createElement('div');
      card.className = 'sf-card';

      const front     = document.createElement('div');
      front.className = 'sf-face sf-face-front';
      const fSpan     = document.createElement('span');
      fSpan.className = 'sf-char';
      fSpan.textContent = ch;
      front.appendChild(fSpan);

      const back      = document.createElement('div');
      back.className  = 'sf-face sf-face-back';
      const bSpan     = document.createElement('span');
      bSpan.className = 'sf-char';
      bSpan.textContent = ch;
      back.appendChild(bSpan);

      card.appendChild(front);
      card.appendChild(back);
      unit.el.appendChild(card);

      requestAnimationFrame(() => card.classList.add('sf-flipping'));

      card._cleanup = setTimeout(() => {
        if (card.parentNode) card.remove();
      }, this.flipMs + 20);
    }, delay);
  }

  _doFlip(row, col, newChar) {
    const unit    = this.units[row][col];
    const oldChar = this.current[row][col];
    if (oldChar === newChar) return;

    // Tear down any still-running card so bottom half stays in sync
    const prev = unit.el.querySelector('.sf-card');
    if (prev) {
      clearTimeout(prev._cleanup);
      unit.charBottom.textContent = this.current[row][col];
      prev.remove();
    }

    // Static top immediately shows the NEW character (hidden behind card)
    unit.charTop.textContent = newChar;

    // Build the two-faced flip card
    const card = document.createElement('div');
    card.className = 'sf-card';

    const front     = document.createElement('div');
    front.className = 'sf-face sf-face-front';
    const fSpan     = document.createElement('span');
    fSpan.className = 'sf-char';
    fSpan.textContent = oldChar;
    front.appendChild(fSpan);

    const back      = document.createElement('div');
    back.className  = 'sf-face sf-face-back';
    const bSpan     = document.createElement('span');
    bSpan.className = 'sf-char';
    bSpan.textContent = newChar;
    back.appendChild(bSpan);

    card.appendChild(front);
    card.appendChild(back);
    unit.el.appendChild(card);

    // Kick off animation on the next frame
    requestAnimationFrame(() => card.classList.add('sf-flipping'));

    // After animation finishes, reveal the new character on the static bottom
    card._cleanup = setTimeout(() => {
      unit.charBottom.textContent = newChar;
      if (card.parentNode) card.remove();
    }, this.flipMs + 20);

    this.current[row][col] = newChar;
  }

  /* ──────────────────────────────────────────────
     Drum-rotation sequence for one unit
     ────────────────────────────────────────────── */

  _flipUnit(row, col, targetChar, baseDelay) {
    if (this.current[row][col] === targetChar) return;

    // New generation → any older scheduled flips become no-ops
    const gen = ++this._gen[row][col];

    const fromIdx = this.alphabet.indexOf(this.current[row][col]);
    const toIdx   = this.alphabet.indexOf(targetChar);

    // Character not on the drum → single direct flip
    if (fromIdx === -1 || toIdx === -1) {
      setTimeout(() => {
        if (this._gen[row][col] !== gen) return;
        this._doFlip(row, col, targetChar);
      }, baseDelay);
      return;
    }

    // Build the FULL forward sequence (drum only spins one way)
    const seq = [];
    let idx = fromIdx;
    while (idx !== toIdx) {
      idx = (idx + 1) % this.alphabet.length;
      seq.push(this.alphabet[idx]);
    }

    // Schedule every intermediate flip
    let delay = baseDelay;
    for (const ch of seq) {
      ((c, d) => {
        setTimeout(() => {
          if (this._gen[row][col] !== gen) return;
          this._doFlip(row, col, c);
        }, d);
      })(ch, delay);
      // Slight jitter on step interval for organic feel (+/-4 ms)
      delay += this.stepInterval + (Math.random() * 8 - 4);
    }
  }

  /* ──────────────────────────────────────────────
     Public API
     ────────────────────────────────────────────── */

  _removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /** Set a single character at row, col with flip animation. */
  set(row, col, char) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    const ch = this._removeAccents(String(char)).toUpperCase()[0] || ' ';
    const delay = col * 28 + Math.random() * 18;
    this._flipUnit(row, col, ch, delay);
  }

  /**
   * Tint a single unit's text with a color.
   * Pass null or '' to reset to the default colour.
   */
  color(row, col, hex) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    const el = this.units[row][col].el;
    if (!hex) {
      el.style.removeProperty('--sf-color');
      el.classList.remove('sf-colored');
    } else {
      el.style.setProperty('--sf-color', hex);
      el.classList.add('sf-colored');
    }
  }

  /**
   * Change the background colour of a single unit's flaps.
   * Triggers a flip animation so the change is visible.
   * Pass null or '' to reset to the default dark background.
   */
  background(row, col, hex) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    const el    = this.units[row][col].el;
    const delay = col * 28 + Math.random() * 18;

    if (!hex) {
      el.style.removeProperty('--sf-bg');
      el.classList.remove('sf-bg');
    } else {
      el.style.setProperty('--sf-bg', hex);
      el.classList.add('sf-bg');
    }

    this._visualFlip(row, col, delay);
  }

  /**
   * Write a string of text onto the board.
   *
   * Second argument can be a color string (shorthand) or an options object:
   *   write("HELLO", "#ff0000")              — row 0, col 0, red text
   *   write("HELLO", { row: 1, col: 2 })     — row 1, col 2
   *   write("HELLO", { center: true, row: 0, color: "#ff0000", bg: "#002200" })
   */
  write(text, optsOrColor = {}) {
    const opts = typeof optsOrColor === 'string'
      ? { color: optsOrColor }
      : optsOrColor;

    const row    = opts.row    ?? 0;
    const color  = opts.color  ?? null;
    const bg     = opts.bg     ?? null;
    const center = opts.center ?? false;

    const clean = this._removeAccents(text).toUpperCase();
    const startCol = center
      ? Math.floor((this.cols - clean.length) / 2)
      : (opts.col ?? 0);

    for (let i = 0; i < clean.length; i++) {
      const c = startCol + i;
      if (c < 0 || c >= this.cols) continue;
      const ch    = clean[i];
      const delay = c * 28 + Math.random() * 18;
      this._flipUnit(row, c, ch, delay);

      if (color) this.color(row, c, ch !== ' ' ? color : null);
      if (bg)    this.background(row, c, bg);
    }
  }

  /** Flip every cell to blank. */
  clear() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const delay = c * 28 + Math.random() * 18;
        this._flipUnit(r, c, ' ', delay);
      }
    }
  }

  /** Reset all text colours and background colours. */
  clearColors() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.color(r, c, null);
        this.background(r, c, null);
      }
    }
  }
}
