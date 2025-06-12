import { Buffer } from 'buffer'
import { type IStorage } from '@musicuon/storage'
import { OpfsStorage, DbStorage } from '@musicuon/storage'

interface PlayListOptions {
  storage?: 'DB' | 'OPFS'
}
export interface ISong {
  id: string
  source: string
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
  }

  async add(source: string) {
    const key = String(new Date().valueOf())
    await this.#storage.set(key, Buffer.from(source))
    this.#list.push({ id: key, source })
  }

  async remove(idx: number) {
    const { id, source } = this.#list[idx]
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
        list.push({ id: key, source: buffer.toString() })
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
