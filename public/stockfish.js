// This file serves as a wrapper for the Stockfish JavaScript engine

// Import Stockfish from a CDN
importScripts('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');

// The stockfish.js script exposes a Stockfish function that creates the engine
const engine = Stockfish();

// Forward messages from the main thread to the Stockfish engine
onmessage = function(e) {
  engine.postMessage(e.data);
};

// Forward messages from the Stockfish engine to the main thread
engine.onmessage = function(e) {
  postMessage(e.data);
};
