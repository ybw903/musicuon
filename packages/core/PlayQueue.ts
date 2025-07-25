import { type ISong } from './PlayList'
import { listen, emit, type Event } from '@tauri-apps/api/event'

type Resolver = (value: ISong | null | number) => void

const LENGTH_REQUEST_ID = -1

class PlayQueue {
  #index: number = 0
  // TODO: use cache
  #pendingRequests = new Map<number, Resolver>()

  constructor() {
    this.#bindListeners()
  }

  async #bindListeners() {
    // TODO: use command pattern
    await listen('pos_response', (evt: Event<{ idx: number } & Partial<ISong>>) => {
      const { idx, id, src, path, name, title, artist, album, year, format } = evt.payload

      const resolver = this.#pendingRequests.get(idx)
      if (resolver) {
        // TODO: extract nullish check function
        const payload =
          id &&
          src &&
          name &&
          path &&
          format &&
          typeof title !== 'undefined' &&
          typeof artist !== 'undefined' &&
          typeof album !== 'undefined' &&
          typeof year !== 'undefined'
            ? { id, src, path, name, title, artist, album, year, format }
            : null
        resolver(payload)
        this.#pendingRequests.delete(idx)
      }
    })

    await listen('length_response', (evt: Event<{ length: number }>) => {
      const { length } = evt.payload

      const resolver = this.#pendingRequests.get(LENGTH_REQUEST_ID)
      if (resolver) {
        resolver(length)
        this.#pendingRequests.delete(LENGTH_REQUEST_ID)
      }
    })

    await listen('swapped_play_list', (evt: Event<{ idxA: number; idxB: number }>) => {
      const { idxA, idxB } = evt.payload
      if (this.#index === idxA) {
        this.#index = idxB
      } else if (this.#index === idxB) {
        this.#index = idxA
      }
    })
  }

  async listenSelectedPlayList(onSelect: (song: ISong) => Promise<void>) {
    await listen('selected_play_list', async (evt: Event<{ idx: number } & ISong>) => {
      const { idx, ...song } = evt.payload
      await this.selectPos(idx)
      onSelect(song)
    })
  }

  async listenRemovedPlayList(onRemove: (idx: number, currentPlaying: boolean) => Promise<void>) {
    await listen('removed_play_list', async (evt: Event<{ idx: number }>) => {
      const { idx } = evt.payload

      const currentPlaying = idx === this.#index
      const length = await this.getLength()

      if (currentPlaying) {
        await this.prev()
      }
      if (currentPlaying && idx === 0 && length !== 0) {
        await this.next()
      }

      onRemove(idx, currentPlaying)
    })
  }

  async pos(): Promise<ISong | null> {
    emit('pos_request', { idx: this.#index })

    const promise = new Promise((resolve) => {
      this.#pendingRequests.set(this.#index, resolve)
    })
    return promise as Promise<ISong | null>
  }

  async selectPos(pos: number | 'first' | 'last'): Promise<ISong | null> {
    const length = await this.getLength()

    if (typeof pos === 'number' && (pos >= length || pos < 0))
      throw new Error('invalid playlist position')

    if (pos === 'first') {
      this.#index = 0
    } else if (pos === 'last') {
      this.#index = length - 1
    } else {
      this.#index = pos
    }

    return this.pos()
  }

  async prev() {
    if (this.#index === 0) return this.pos()
    this.#index -= 1
    return this.pos()
  }

  async next() {
    const isLast = await this.isLast()
    if (isLast) {
      return this.pos()
    }
    this.#index += 1
    return this.pos()
  }

  async isFirst() {
    return this.#index === 0
  }

  async isLast() {
    const length = await this.getLength()
    return this.#index + 1 === length
  }

  async getShufflePosIdx() {
    const length = await this.getLength()
    return Math.floor(Math.random() * length)
  }

  async getLength(): Promise<number> {
    emit('length_request', { idx: LENGTH_REQUEST_ID })

    const promise = new Promise((resolve) => {
      this.#pendingRequests.set(LENGTH_REQUEST_ID, resolve)
    })
    return promise as Promise<number>
  }
}

export default PlayQueue
