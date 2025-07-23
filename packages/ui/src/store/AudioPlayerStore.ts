import { get, writable } from 'svelte/store'
import { AudioPlayer, type ISong } from '@musicuon/core'

function createAudioPlayerStore() {
  let audioRef: HTMLAudioElement | null = null

  const audioPlayerManager = writable<AudioPlayer | null>(null)

  const isPlaying = writable(false)
  const volume = writable(1)

  const currentTime = writable(0)
  const duration = writable(0)
  const currentSong = writable<ISong | null>(null)

  const repeatPlay = writable(false)
  const shufflePlay = writable(false)

  const init = async (
    audioEl: HTMLAudioElement,
    options: { options?: { visualCanvasElement?: HTMLCanvasElement } } = {}
  ) => {
    audioRef = audioEl
    const audioPlayer = new AudioPlayer(options)

    audioPlayer.listenSelectedPlayList(async () => {
      await onPause()
      const song = await audioPlayer.getSong()
      currentSong.set(song)
      await onPlay()
    })

    audioPlayer.listenRemovedPlayList(async (idx, currentPlaying) => {
      if (!currentPlaying) return

      await onPause()
      currentTime.set(0)
      duration.set(0)

      const song = await audioPlayer.getSong()
      currentSong.set(song)
      await onPlay()
    })

    audioPlayerManager.set(audioPlayer)

    const song = await audioPlayer.getSong()
    currentSong.set(song)
  }

  async function onPlay() {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    if (!$audioPlayerManager.isInitSource() && !!audioRef) {
      $audioPlayerManager.setSource(audioRef)
    }
    if (get(isPlaying) === true) {
      await onPause()
    }

    await $audioPlayerManager.play()

    const song = await $audioPlayerManager.getSong()
    currentSong.set(song)
    isPlaying.set(true)
  }

  async function onPause() {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    await $audioPlayerManager.pause()
    isPlaying.set(false)
  }

  async function onPrev() {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    const isFirst = await $audioPlayerManager.isFirst()

    if (get(shufflePlay)) {
      const shufflePos = await $audioPlayerManager.getShufflePos()
      await $audioPlayerManager.selectSong(shufflePos)
    } else if (isFirst && get(repeatPlay)) {
      await $audioPlayerManager.selectSong('last')
    } else {
      await $audioPlayerManager.prevSong()
    }

    await onPlay()
  }

  async function onNext() {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    const isLast = await $audioPlayerManager.isLast()

    if (get(shufflePlay)) {
      const shufflePos = await $audioPlayerManager.getShufflePos()
      await $audioPlayerManager.selectSong(shufflePos)
    } else if (isLast && get(repeatPlay)) {
      await $audioPlayerManager.selectSong('first')
    } else {
      await $audioPlayerManager.nextSong()
    }

    await onPlay()
  }

  async function onEndedAudio() {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    const isLast = await $audioPlayerManager.isLast()

    if (get(shufflePlay) || !isLast) {
      return onNext()
    }

    if (isLast && get(repeatPlay)) {
      await $audioPlayerManager.selectSong('first')
      return onPlay()
    }

    if (isLast && !get(repeatPlay)) {
      isPlaying.set(false)
    }
  }

  function onCurrentTime(
    evt: Event & {
      currentTarget: EventTarget & HTMLAudioElement
    }
  ) {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    currentTime.set(evt.currentTarget.currentTime)
    $audioPlayerManager.setCurrentTime(evt.currentTarget.currentTime)
  }

  function onLoadedMetaData(
    evt: Event & {
      currentTarget: EventTarget & HTMLAudioElement
    }
  ) {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    duration.set(evt.currentTarget.duration)
    $audioPlayerManager.setDuration(evt.currentTarget.duration)
  }

  // [TODO] dispatch event through debounced?...
  function onPlayTime(
    evt: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    onPause().then(() => {
      currentTime.set(Number(evt.currentTarget.value))
      $audioPlayerManager.playtime(Number(evt.currentTarget.value))
      onPlay()
    })
  }

  function onVolume(
    evt: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    volume.set(Number(evt.currentTarget.value) / 100)
    $audioPlayerManager.volume(Number(evt.currentTarget.value) / 100)
  }

  function onRepeatPlay() {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    repeatPlay.update((prev) => !prev)
    $audioPlayerManager.repeatPlay = get(repeatPlay)
  }

  function onShufflePlay() {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    shufflePlay.update((prev) => !prev)
    $audioPlayerManager.shufflePlay = get(shufflePlay)
  }

  return {
    init,

    audioPlayerManager,

    isPlaying,
    volume,
    currentTime,
    duration,
    currentSong,
    repeatPlay,
    shufflePlay,

    onPlay,
    onPause,
    onPrev,
    onNext,
    onEndedAudio,
    onCurrentTime,
    onLoadedMetaData,
    onPlayTime,
    onVolume,
    onRepeatPlay,
    onShufflePlay
  }
}

export type AudioPlayerStore = ReturnType<typeof createAudioPlayerStore>
export default createAudioPlayerStore
