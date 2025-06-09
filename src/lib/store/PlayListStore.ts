import { readable, writable } from 'svelte/store'
import PlayList from '../core/PlayList'

function createPlayListStore() {
  const { subscribe, set } = writable<string[]>([])
  const playListManager = new PlayList()

  const addSong = async (song: string) => {
    await playListManager.add(song)
    set(playListManager.getPlayList())
  }

  const removeSong = async (index: number) => {
    await playListManager.remove(index)
    set(playListManager.getPlayList())
  }

  const init = async () => {
    await playListManager.loadList()
    set(playListManager.getPlayList())
  }

  return {
    subscribe,
    init,
    addSong,
    removeSong
  }
}

export type PlayListStore = ReturnType<typeof createPlayListStore>
export default createPlayListStore
