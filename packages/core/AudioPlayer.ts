import { invoke } from '@tauri-apps/api/core'
import PlayQueue from './PlayQueue'
import type { ISong } from './PlayList'
import AudioVisualizer from './AudioVisualizer'

export interface AudioEvent extends Event {
  target: EventTarget & HTMLAudioElement
}

class AudioPlayer {
  #volume: number = 1
  #ctx?: AudioContext
  #gainNode?: GainNode
  #analyserNode?: AnalyserNode
  #source?: MediaElementAudioSourceNode
  #audioElement: HTMLAudioElement
  #playing: boolean = false
  #initSource: boolean = false
  #currentTime: number = 0
  #duration: number = 0

  #playQueue: PlayQueue
  #audioVisualizer?: AudioVisualizer
  #visualCanvasElement?: HTMLCanvasElement

  // TODO: move to play queue
  repeatPlay: boolean = false
  shufflePlay: boolean = false

  constructor({
    options
  }: {
    options?: {
      visualCanvasElement?: HTMLCanvasElement
      onEndedAudio?: (evt: AudioEvent) => void
      onLoadedMetaData?: (evt: AudioEvent) => void
      onCurrentTime?: (evt: AudioEvent) => void
    }
  } = {}) {
    this.#playQueue = new PlayQueue()
    this.#audioElement = new Audio()

    this.#audioElement.addEventListener('loadedmetadata', (evt) => {
      options?.onLoadedMetaData?.(evt as AudioEvent)
    })

    this.#audioElement.addEventListener('timeupdate', (evt) => {
      options?.onCurrentTime?.(evt as AudioEvent)
    })

    this.#audioElement.addEventListener('ended', async (evt) => {
      options?.onEndedAudio?.(evt as AudioEvent)
    })

    if (options?.visualCanvasElement) {
      this.#visualCanvasElement = options?.visualCanvasElement
    }
  }

  async listenSelectedPlayList(onSelect: (song: ISong) => Promise<void>) {
    this.#playQueue.listenSelectedPlayList(onSelect)
  }

  async listenRemovedPlayList(onRemove: (idx: number, currentPlaying: boolean) => Promise<void>) {
    this.#playQueue.listenRemovedPlayList(onRemove)
  }

  async play() {
    if (!this.#ctx) {
      this.#initAudioContext()
    }

    if (this.#ctx?.state === 'suspended') {
      await this.#ctx?.resume()
    }

    const song = await this.#playQueue.pos()

    // TODO: check null only specific module
    if (!song) return

    if (this.#audioElement && this.#audioElement?.src !== song.src) {
      this.#audioElement.src = song.src
    }

    if (this.#audioElement) {
      this.#audioElement.play()
      this.#playing = true
    }

    if (this.#visualCanvasElement && this.#audioVisualizer) {
      this.#audioVisualizer.startDraw()
    }
  }

  async pause() {
    if (!this.#ctx) {
      this.#initAudioContext()
    }

    if (this.#ctx?.state === 'running') {
      await this.#ctx?.suspend()
    }

    this.#audioElement?.pause()
    this.#audioVisualizer?.stopDraw()
    this.#playing = false
  }

  async nextSong() {
    await this.#playQueue.next()
  }

  async prevSong() {
    await this.#playQueue.prev()
  }

  async selectSong(pos: number | 'first' | 'last') {
    await this.#playQueue.selectPos(pos)
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

  playtime(time?: number) {
    if (time === undefined) {
      return this.#currentTime
    }

    this.#currentTime = time

    if (!this.#audioElement) return
    this.#audioElement.currentTime = time
  }

  getSong() {
    return this.#playQueue.pos()
  }

  getDuration() {
    return this.#duration
  }

  setDuration(duration: number) {
    this.#duration = duration
  }

  setCurrentTime(currentTime: number) {
    this.#currentTime = currentTime
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

    this.#source = this.#ctx?.createMediaElementSource(this.#audioElement)

    if (this.#gainNode) {
      this.#source?.connect(this.#gainNode)
    }

    if (this.#visualCanvasElement) {
      this.#analyserNode = this.#ctx?.createAnalyser()
      this.#audioVisualizer = new AudioVisualizer(this.#visualCanvasElement, this.#analyserNode)
    }

    if (this.#analyserNode) {
      this.#gainNode?.connect(this.#analyserNode)
    }

    if (this.#gainNode) {
      this.#gainNode.gain.value = 1
    }

    if (this.#ctx?.destination) {
      if (this.#analyserNode) {
        this.#analyserNode?.connect(this.#ctx.destination)
      } else {
        this.#gainNode?.connect(this.#ctx?.destination)
      }
    }
  }

  isPlaying() {
    return this.#playing
  }

  isInitSource() {
    return this.#initSource
  }

  async getShufflePos() {
    return this.#playQueue.getShufflePosIdx()
  }

  async isFirst() {
    return this.#playQueue.isFirst()
  }

  async isLast() {
    return this.#playQueue.isLast()
  }
}

export default AudioPlayer
