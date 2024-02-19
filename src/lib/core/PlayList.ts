class PlayList {
  #list: string[] = []
  #initLoad: boolean = false

  constructor() {
    this.loadList()
  }

  add(source: string) {
    this.#list.push(source)
  }

  remove(index: number) {
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

  loadList() {
    this.#list = ['노래1', '노래2', '노래3']
    this.#initLoad = true
  }

  isInitLoad() {
    return this.#initLoad
  }
}

export default PlayList
