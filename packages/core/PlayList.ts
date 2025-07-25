import { Buffer } from 'buffer'
import { parseWebStream, type IFormat } from 'music-metadata'
import { type IStorage } from '@musicuon/storage'
import { OpfsStorage, DbStorage } from '@musicuon/storage'
import { listen, emit, type Event } from '@tauri-apps/api/event'
import { convertFileSrc } from '@tauri-apps/api/core'

interface PlayListOptions {
  storage?: 'DB' | 'OPFS'
  onUpdateList: (list: ISong[]) => void
}
export interface ISong {
  id: string
  src: string
  path: string
  name: string
  title: string
  artist: string
  album: string
  year: number
  format: IFormat
}

class PlayList {
  #list: ISong[] = []
  #initLoad: boolean = false
  #storage: IStorage
  #options?: PlayListOptions

  constructor(options?: PlayListOptions) {
    const { storage = 'OPFS' } = options ?? {}

    if (storage === 'OPFS') {
      this.#storage = new OpfsStorage()
    } else {
      this.#storage = new DbStorage()
    }

    this.loadList()
    this.#bindListeners()
    this.#options = options
  }

  async #bindListeners() {
    // TODO: use command pattern
    await listen('pos_request', (evt: Event<{ idx: number }>) => {
      const { idx } = evt.payload

      emit('pos_response', {
        idx,
        ...(this.#list[idx] ? this.#list[idx] : {})
      })
    })

    await listen('length_request', (evt: Event<{ idx: number }>) => {
      const { idx } = evt.payload

      emit('length_response', { idx, length: this.#list.length })
    })

    await listen('update_song_metadata', (evt: Event<ISong>) => {
      const { path } = evt.payload

      const targetSongIdx = this.#list.findIndex((targetSong) => targetSong.path === path)
      if (targetSongIdx === -1) return

      this.#list[targetSongIdx] = evt.payload
      if (this.#options?.onUpdateList) {
        this.#options.onUpdateList(this.#list)
      }
    })
  }

  async add(path: string) {
    const key = String(new Date().valueOf())

    const src = convertFileSrc(path)
    const response = await fetch(src)

    const contentLength = response.headers.get('Content-Length')
    const size = contentLength ? parseInt(contentLength, 10) : undefined

    const metadata = await parseWebStream(response.body, {
      mimeType: response.headers.get('Content-Type') || '',
      size
    })

    const name = path.split('/').pop()

    if (!name) {
      throw new Error('invalid path!')
    }

    const song = {
      id: key,
      src,
      path,
      name,
      title: metadata.common.title || '',
      artist: metadata.common.artist || '',
      album: metadata.common.album || '',
      year: metadata.common.year || 0,
      format: metadata.format
    }

    await this.#storage.set(key, Buffer.from(JSON.stringify(song)))
    this.#list.push(song)

    if (this.#options?.onUpdateList) {
      this.#options.onUpdateList(this.#list)
    }

    if (this.#list.length === 1) {
      this.selectSong(0)
    }
  }

  async remove(idx: number) {
    const { id } = this.#list[idx]
    await this.#storage.remove(id)
    this.#list.splice(idx, 1)

    if (this.#options?.onUpdateList) {
      this.#options.onUpdateList(this.#list)
    }

    emit('removed_play_list', { idx })
  }

  selectSong(idx: number) {
    emit('selected_play_list', { idx, song: this.#list[idx] })
  }

  swapSongPosition(idxA: number, idxB: number) {
    const tmp = this.#list[idxA]
    this.#list[idxA] = this.#list[idxB]
    this.#list[idxB] = tmp
    emit('swapped_play_list', { idxA, idxB })

    if (this.#options?.onUpdateList) {
      this.#options.onUpdateList(this.#list)
    }
  }

  clear() {
    this.#list = []
  }

  length() {
    return this.#list.length
  }

  getPlayList() {
    return this.#list
  }

  async loadList() {
    const keys = await this.#storage.keys()

    const list = []
    for (const key of keys) {
      const buffer = await this.#storage.get(key)
      if (buffer) {
        list.push({ id: key, ...(buffer.toJSON() as unknown as Omit<ISong, 'id'>) })
      }
    }
    this.#list = list
    this.#initLoad = true
  }

  isInitLoad() {
    return this.#initLoad
  }
}

export default PlayList
