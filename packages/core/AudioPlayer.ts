import { invoke } from '@tauri-apps/api/core'
import PlayQueue from './PlayQueue'
import type { ISong } from './PlayList'
import AudioVisualizer from './AudioVisualizer'

class AudioPlayer {
  #volume: number = 1
  #ctx?: AudioContext
  #gainNode?: GainNode
  #analyserNode?: AnalyserNode
  #source?: MediaElementAudioSourceNode
  #sourceElement?: HTMLAudioElement
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

  constructor({ options }: { options?: { visualCanvasElement?: HTMLCanvasElement } } = {}) {
    this.#playQueue = new PlayQueue()

    if (options?.visualCanvasElement) {
      this.#visualCanvasElement = options?.visualCanvasElement
    }
  }

  openPlayListWindow() {
    invoke('open_play_list_window')
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

    if (this.#sourceElement && this.#sourceElement?.src !== song.src) {
      this.#sourceElement.src = song.src
    }

    if (this.#sourceElement) {
      this.#sourceElement.play()
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

    this.#sourceElement?.pause()
    this.#audioVisualizer?.stopDraw()
    this.#playing = false
  }

  async nextSong() {
    await this.#playQueue.next()
  }

  async prevSong() {
    await this.#playQueue.prev()
  }

  async selectSong(pos: number) {
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

    if (!this.#sourceElement) return
    this.#sourceElement.currentTime = time
  }

  getSong() {
    return this.#playQueue.pos()
  }

  getDuration() {
    return this.#duration
  }

  onDuration(evt: any) {
    this.#duration = evt.target.duration
  }

  onCurrentTime(evt: any) {
    this.#currentTime = evt.target.currentTime
  }

  setSource(source: HTMLAudioElement) {
    if (!this.#ctx) {
      this.#initAudioContext()
    }

    if (this.#sourceElement) {
      this.#sourceElement.removeEventListener('timeupdate', this.onCurrentTime.bind(this))
      this.#sourceElement.removeEventListener('loadedmetadata', this.onDuration.bind(this))
    }

    if (this.#source && this.#gainNode) {
      this.#source.disconnect(this.#gainNode)
    }

    if (this.#source && this.#analyserNode) {
      this.#source.disconnect(this.#analyserNode)
    }

    this.#sourceElement = source
    this.#source = this.#ctx?.createMediaElementSource(source)

    this.#sourceElement.addEventListener('loadedmetadata', this.onDuration.bind(this))
    this.#sourceElement.addEventListener('timeupdate', this.onCurrentTime.bind(this))

    if (this.#gainNode) {
      this.#source?.connect(this.#gainNode)
    }

    if (this.#analyserNode) {
      this.#source?.connect(this.#analyserNode)
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

    if (this.#visualCanvasElement) {
      this.#analyserNode = this.#ctx?.createAnalyser()
      this.#audioVisualizer = new AudioVisualizer(this.#visualCanvasElement, this.#analyserNode)
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

  async getShufflePos() {
    return this.#playQueue.getShufflePosIdx()
  }

  async isLast() {
    return this.#playQueue.isLast()
  }
}

export default AudioPlayer
