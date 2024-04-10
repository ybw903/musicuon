import type PlayQueue from './PlayQueue'
import playQueue from './PlayQueue'

class AudioPlayer {
  #volume: number = 1
  #ctx?: AudioContext
  #gainNode?: GainNode
  #source?: MediaElementAudioSourceNode
  #sourceElement?: HTMLAudioElement
  #playing: boolean = false
  #initSource: boolean = false
  #playQueue: typeof PlayQueue

  constructor() {
    this.#playQueue = playQueue
  }

  play() {
    if (!this.#ctx) {
      this.#initAudioContext()
    }
    if (this.#ctx?.state === 'suspended') {
      this.#ctx?.resume()
    }
    this.#sourceElement?.play()
    this.#playing = true
  }

  pause() {
    if (!this.#ctx) {
      this.#initAudioContext()
    }
    this.#ctx?.suspend()
    this.#sourceElement?.pause()
    this.#playing = false
  }

  volume(vol?: number) {
    if (vol === undefined) {
      return this.#volume
    }

    if (!this.#ctx) {
      this.#initAudioContext()
    }

    this.#volume = vol
    this.#gainNode?.gain.setValueAtTime(vol, this.#ctx?.currentTime || 0)
    return this.#volume
  }

  setSource(source: HTMLAudioElement) {
    if (!this.#ctx) {
      this.#initAudioContext()
    }

    this.#sourceElement = source
    this.#source = this.#ctx?.createMediaElementSource(source)

    if (this.#gainNode) {
      this.#source?.connect(this.#gainNode)
    }
    this.#initSource = true
  }

  // https://developer.chrome.com/blog/autoplay?hl=ko#webaudio...
  #initAudioContext() {
    if (typeof window.AudioContext !== 'undefined') {
      this.#ctx = new AudioContext()
    } else if (typeof window.webkitAudioContext !== 'undefined') {
      this.#ctx = new window.webkitAudioContext()
    }

    if (this.#ctx?.createGain) {
      this.#gainNode = this.#ctx.createGain()
    } else if (this.#ctx?.createGainNode) {
      this.#gainNode = this.#ctx.createGainNode()
    }

    if (this.#gainNode) {
      this.#gainNode.gain.value = 1
    }

    if (this.#ctx?.destination) {
      this.#gainNode?.connect(this.#ctx.destination)
    }
  }

  isPlaying() {
    return this.#playing
  }

  isInitSource() {
    return this.#initSource
  }
}

export default AudioPlayer
