interface AudioContext {
  createGainNode(): GainNode
}

interface Window {
  webkitAudioContext: typeof AudioContext
}
