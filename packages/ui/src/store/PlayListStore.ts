import { writable } from 'svelte/store'
import { PlayList, type ISong } from '@musicuon/core'

function createPlayListStore() {
  let playListManager: PlayList | null = null
  const { subscribe, set } = writable<ISong[]>([])

  const addSong = async (song: string) => {
    if (!playListManager) throw new Error('Store needs to be initialized!')
    await playListManager.add(song)
  }

  const removeSong = async (index: number) => {
    if (!playListManager) throw new Error('Store needs to be initialized!')
    await playListManager.remove(index)
  }

  const selectSong = async (index: number) => {
    if (!playListManager) throw new Error('Store needs to be initialized!')
    await playListManager.openAudioPlayerWindow()
    playListManager.selectSong(index)
  }

  const swapSong = (indexA: number, indexB: number) => {
    if (!playListManager) throw new Error('Store needs to be initialized!')
    playListManager.swapSongPosition(indexA, indexB)
  }

  const init = async (env: 'web' | 'webview') => {
    playListManager = new PlayList({
      storage: env === 'web' ? 'OPFS' : 'DB',
      onUpdateList: (list) => set(list)
    })
    await playListManager.loadList()
    set(playListManager.getPlayList())
  }

  return {
    subscribe,
    init,
    addSong,
    removeSong,
    selectSong,
    swapSong
  }
}

export type PlayListStore = ReturnType<typeof createPlayListStore>
export default createPlayListStore
