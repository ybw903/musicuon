import type PlayList from './PlayList'

class PlayQueue {
  #playList?: typeof PlayList
  #index: number = 0

  constructor() {
    
  }

  pos() {
    if (!this.#playList) {
      // [TODO] load func call
      return
    }
    return this.#playList.getPlayList()[this.#index]
  }

  prev() {
    if (this.isFirst()) return this.pos()
    this.#index -= 1
    return this.pos()
  }

  next() {
    if (this.isLast()) return this.pos()
    this.#index += 1
    return this.pos()
  }

  isFirst() {
    return this.#index === 0
  }

  isLast() {
    if (!this.#playList) {
      // [TODO] load func call
      return
    }
    return this.#playList.length() - 1 === this.#index
  }

  // [TODO] impl
  loadPlayList () {

  }
}

export default PlayQueue
