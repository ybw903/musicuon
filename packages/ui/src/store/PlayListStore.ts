import { writable } from 'svelte/store'
import { PlayList, type ISong } from '@musicuon/core'

function createPlayListStore() {
  let playListManager: PlayList | null = null
  const { subscribe, set } = writable<ISong[]>([])

  const addSong = async (song: string) => {
    await playListManager.add(song)
    set(playListManager.getPlayList())
  }

  const removeSong = async (index: number) => {
    await playListManager.remove(index)
    set(playListManager.getPlayList())
  }

  const selectSong = async (index: number) => {
    playListManager.selectSong(index)
  }

  const init = async (env: 'web' | 'webview') => {
    playListManager = new PlayList({ storage: env === 'web' ? 'OPFS' : 'DB' })
    await playListManager.loadList()
    set(playListManager.getPlayList())
  }

  return {
    subscribe,
    init,
    addSong,
    removeSong,
    selectSong
  }
}

export type PlayListStore = ReturnType<typeof createPlayListStore>
export default createPlayListStore
