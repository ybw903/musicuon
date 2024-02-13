/// <reference types="svelte" />
/// <reference types="vite/client" />

interface AudioContext {
  createGainNode(): GainNode
}

interface Window {
  webkitAudioContext: typeof AudioContext
}
