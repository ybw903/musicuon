import { Buffer } from 'buffer'
import { type IStorage } from '@musicuon/storage'
import { OpfsStorage, DbStorage } from '@musicuon/storage'
import { listen, emit, type Event } from '@tauri-apps/api/event'
import { convertFileSrc } from '@tauri-apps/api/core'

interface PlayListOptions {
  storage?: 'DB' | 'OPFS'
}
export interface ISong {
  id: string
  src: string
  name: string
}

class PlayList {
  #list: ISong[] = []
  #initLoad: boolean = false
  #storage: IStorage

  constructor(options?: PlayListOptions) {
    const { storage = 'OPFS' } = options ?? {}

    if (storage === 'OPFS') {
      this.#storage = new OpfsStorage()
    } else {
      this.#storage = new DbStorage()
    }

    this.loadList()
    this.#bindListeners()
  }

  async #bindListeners() {
    // TODO: use command pattern
    await listen('pos_request', (evt: Event<{ idx: number }>) => {
      const { idx } = evt.payload

      emit('pos_response', {
        idx,
        id: this.#list[idx].id,
        src: this.#list[idx].src,
        name: this.#list[idx].name
      })
    })

    await listen('length_request', (evt: Event<{ idx: number }>) => {
      const { idx } = evt.payload

      emit('length_response', { idx, length: this.#list.length })
    })
  }

  async add(path: string) {
    const key = String(new Date().valueOf())

    const src = convertFileSrc(path)
    const name = path.split('/').pop()

    if (!name) {
      throw new Error('invalid path!')
    }

    const srcPath = await this.#storage.set(key, Buffer.from(JSON.stringify({ src, name })))
    this.#list.push({ id: key, src, name })
  }

  async remove(idx: number) {
    const { id } = this.#list[idx]
    await this.#storage.remove(id)
    this.#list.splice(idx, 1)
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
