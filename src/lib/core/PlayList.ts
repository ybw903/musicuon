import { v3 as md5 } from 'uuid'
import { type IStorage } from '../../storage'
import OpfsStorage from '../../storage/opfsStorage'

class PlayList {
  #list: string[] = []
  #initLoad: boolean = false
  #storage: IStorage

  constructor() {
    this.#storage = new OpfsStorage()
    this.loadList()
  }

  async add(source: string) {
    const key = md5(source, '1a30bae5-e589-47b1-9e77-a7da2cdbc2b8')
    await this.#storage.set(key, Buffer.from(source))
    this.#list.push(source)
  }

  async remove(index: number) {
    const key = md5(this.#list[index], '1a30bae5-e589-47b1-9e77-a7da2cdbc2b8')
    await this.#storage.remove(key)
    this.#list.splice(index, 1)
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
        list.push(buffer.toString())
      }
    }
    this.#list = list
    this.#initLoad = true
  }

  isInitLoad() {
    return this.#initLoad
  }
}

const playList = new PlayList()

export default playList
