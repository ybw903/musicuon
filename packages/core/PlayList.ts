import { Buffer } from 'buffer'
import { parseWebStream, type IAudioMetadata, type IFormat } from 'music-metadata'
import { type IStorage } from '@musicuon/storage'
import { OpfsStorage, DbStorage } from '@musicuon/storage'
import { listen, emit, type Event } from '@tauri-apps/api/event'
import { convertFileSrc, invoke } from '@tauri-apps/api/core'
import { Webview } from '@tauri-apps/api/webview'

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

    await listen('update_song_metadata', async (evt: Event<ISong>) => {
      const { id, src } = evt.payload

      const targetSongIdx = this.#list.findIndex((targetSong) => targetSong.id === id)
      if (targetSongIdx === -1) return

      const targetSong = this.#list[targetSongIdx]
      const metadata = await this.#parseSongMetadata(src)
      const updatedTargetSong = this.#mergeWithMetadata(targetSong, metadata)

      this.#storage.update(targetSong.id, Buffer.from(JSON.stringify(updatedTargetSong)))
      this.#list[targetSongIdx] = updatedTargetSong
      if (this.#options?.onUpdateList) {
        this.#options.onUpdateList(this.#list)
      }
    })
  }

  async add(path: string) {
    const key = String(new Date().valueOf())

    const src = convertFileSrc(path)
    const metadata = await this.#parseSongMetadata(src)

    const name = path.split('/').pop()

    if (!name) {
      throw new Error('invalid path!')
    }

    const song = this.#mergeWithMetadata(
      {
        id: key,
        src,
        path,
        name
      },
      metadata
    )

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

  async openAudioPlayerWindow() {
    const audioPlayerWebview = await Webview.getByLabel('audio-player')
    if (audioPlayerWebview) return

    invoke('open_audio_player_window')
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(undefined)
      }, 250)
    )
  }

  async selectSong(idx: number) {
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
    if (this.#options?.storage === 'DB') {
      const list = (await this.#storage.getAll?.()) ?? []
      this.#list = list.map((stored: any) => {
        const bufferJson = JSON.parse(stored.value)
        return { id: stored.id, ...JSON.parse(Buffer.from(bufferJson.data).toString()) }
      })
    } else {
      const keys = await this.#storage.keys()

      const list = []
      for (const key of keys) {
        const buffer = await this.#storage.get(key)
        if (buffer) {
          list.push({ id: key, ...(buffer.toJSON() as unknown as Omit<ISong, 'id'>) })
        }
      }
      this.#list = list
    }

    this.#initLoad = true
  }

  isInitLoad() {
    return this.#initLoad
  }

  async #parseSongMetadata(src: string) {
    const response = await fetch(src)

    const contentLength = response.headers.get('Content-Length')
    const size = contentLength ? parseInt(contentLength, 10) : undefined

    const metadata = await parseWebStream(response.body, {
      mimeType: response.headers.get('Content-Type') || '',
      size
    })

    return metadata
  }

  #mergeWithMetadata(song: Partial<ISong>, metadata: IAudioMetadata) {
    return {
      ...song,
      title: metadata.common.title || '',
      artist: metadata.common.artist || '',
      album: metadata.common.album || '',
      year: metadata.common.year || 0,
      format: metadata.format
    } as ISong
  }
}

export default PlayList
