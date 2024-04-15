import type PlayList from './PlayList'
import playList from './PlayList'

class PlayQueue {
  #playList: typeof PlayList
  #index: number = 0

  constructor() {
    this.#playList = playList
  }

  pos() {
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
    return this.#playList.length() - 1 === this.#index
  }
}

const playQueue = new PlayQueue()

export default playQueue
