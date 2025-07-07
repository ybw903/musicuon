import { invoke } from '@tauri-apps/api/core'
import PlayQueue from './PlayQueue'
import type { ISong } from './PlayList'

class AudioPlayer {
  #volume: number = 1
  #ctx?: AudioContext
  #gainNode?: GainNode
  #source?: MediaElementAudioSourceNode
  #sourceElement?: HTMLAudioElement
  #playing: boolean = false
  #initSource: boolean = false
  #currentTime: number = 0
  #duration: number = 0

  #playQueue: PlayQueue

  constructor() {
    this.#playQueue = new PlayQueue()
  }

  openPlayListWindow() {
    invoke('open_play_list_window')
  }

  async listenSelectedPlayList(onSelect: (song: ISong) => Promise<void>) {
    this.#playQueue.listenSelectedPlayList(onSelect)
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
  }

  async pause() {
    if (!this.#ctx) {
      this.#initAudioContext()
    }
    if (this.#ctx?.state === 'running') {
      await this.#ctx?.suspend()
    }
    this.#sourceElement?.pause()
    this.#playing = false
  }

  async nextSong() {
    await this.#playQueue.next()
  }

  async prevSong() {
    await this.#playQueue.prev()
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

    this.#sourceElement = source
    this.#source = this.#ctx?.createMediaElementSource(source)

    this.#sourceElement.addEventListener('loadedmetadata', this.onDuration.bind(this))
    this.#sourceElement.addEventListener('timeupdate', this.onCurrentTime.bind(this))

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
