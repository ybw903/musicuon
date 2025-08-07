import { get, writable } from 'svelte/store'
import { AudioPlayer, type ISong, type Artwork, EQ_FREQUENCIES } from '@musicuon/core'
import { invoke } from '@tauri-apps/api/core'

function createAudioPlayerStore() {
  let audioRef: HTMLAudioElement | null = null

  const audioPlayerManager = writable<AudioPlayer | null>(null)

  const isPlaying = writable(false)
  const volume = writable(1)
  const filterGains = writable<number[]>(EQ_FREQUENCIES.map(() => 0))

  const currentTime = writable(0)
  const duration = writable(0)
  const currentSong = writable<ISong | null>(null)
  const currentSongArtwork = writable<Artwork | null>(null)

  const repeatPlay = writable(false)
  const shufflePlay = writable(false)

  const isSeeking = writable(false)

  const init = async (options: { options?: { visualCanvasElement?: HTMLCanvasElement } } = {}) => {
    const audioPlayer = new AudioPlayer({
      options: {
        ...options.options,
        onEndedAudio,
        onLoadedMetaData,
        onCurrentTime
      }
    })

    audioPlayer.listenSelectedPlayList(async () => {
      await onPause()
      await onPlay()
    })

    audioPlayer.listenRemovedPlayList(async (idx, currentPlaying) => {
      if (!currentPlaying) return

      await onPause()
      currentTime.set(0)
      duration.set(0)
      isPlaying.set(false)
      await onPlay()
    })

    audioPlayerManager.set(audioPlayer)
  }

  async function onPlay() {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    const song = await $audioPlayerManager.getSong()
    currentSong.set(song)
    if (song) {
      const artwork = await invoke<Artwork>('get_artwork_metadata', {
        request: {
          path: song.path
        }
      })
      if (artwork) {
        currentSongArtwork.set(artwork)
      } else {
        currentSongArtwork.set(null)
      }
    }

    if (!song) {
      return
    }

    await $audioPlayerManager.play()
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
      target: EventTarget & HTMLAudioElement
    }
  ) {
    if (get(isSeeking)) return

    currentTime.set(evt.target.currentTime)
  }

  function onLoadedMetaData(
    evt: Event & {
      target: EventTarget & HTMLAudioElement
    }
  ) {
    duration.set(evt.target.duration)
  }

  function onPlayTime(playTime: number) {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    onPause().then(() => {
      currentTime.set(playTime)
      $audioPlayerManager.playtime(playTime)
      onPlay()
      isSeeking.set(false)
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

  function onFilterGain(filterIndex: number, gain: number) {
    const $audioPlayerManager = get(audioPlayerManager)
    if (!$audioPlayerManager) throw new Error('Store needs to be initialized!')

    $audioPlayerManager.filterGain(filterIndex, gain)
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
    currentSongArtwork,
    repeatPlay,
    shufflePlay,
    isSeeking,
    filterGains,

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
    onShufflePlay,
    onFilterGain
  }
}

export type AudioPlayerStore = ReturnType<typeof createAudioPlayerStore>
export default createAudioPlayerStore
