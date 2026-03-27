import { SplitFlap } from './splitflap.js';

const boardElement = document.getElementById('board');
const sf = new SplitFlap(boardElement, {
  rows: 4,
  cols: 20,
  stepInterval: 55,
  flipMs: 120
});

const messages = [
  () => {
    sf.clear();
    sf.clearColors();
    sf.write("STATE OF THE ART", { row: 0, center: true });
    // Color "STATE" red — it starts at col 2 when centered
    const off = Math.floor((sf.cols - 16) / 2);
    for (let i = 0; i < 5; i++) sf.color(0, off + i, '#ff3d00');

    sf.write("SPLIT FLAP", { row: 2, center: true, color: '#f5c542' });
    sf.write("COMPONENT", { row: 3, center: true });
  },
  () => {
    sf.clear();
    sf.clearColors();
    sf.write("PURE JAVASCRIPT", { row: 1, col: 3 });
    sf.write("AND CSS", { row: 2, col: 6 });
  },
  () => {
    sf.clear();
    sf.clearColors();
    sf.write("NO DEPENDENCIES", { row: 0, center: true });
    sf.write("FULLY MODULAR", { row: 1, center: true });
    sf.write("READY TO USE", { row: 2, center: true, color: '#4ecdc4' });
  },
  () => {
    sf.clear();
    sf.clearColors();
    sf.write("FLIGHT AB123   PARIS", { row: 0 });
    sf.write("STATUS:    BOARDING", { row: 1 });
    sf.write("GATE:            A12", { row: 2 });
    sf.write("TIME:          10:45", { row: 3 });
    // Highlight "BOARDING" in green
    for (let i = 11; i < 19; i++) sf.color(1, i, '#66bb6a');
  },
  () => {
    sf.clear();
    sf.clearColors();
    const W = '#ffffff';
    // Row 0: eyes
    sf.background(0, 8, W);
    sf.background(0, 12, W);
    // Row 1: nothing
    // Row 2: mouth corners
    sf.background(2, 8, W);
    sf.background(2, 12, W);
    // Row 3: mouth bottom
    sf.background(3, 9, W);
    sf.background(3, 10, W);
    sf.background(3, 11, W);
  }
];

let currentIndex = 0;
messages[currentIndex]();

setInterval(() => {
  currentIndex = (currentIndex + 1) % messages.length;
  messages[currentIndex]();
}, 10000);
