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
      const { idx, id, src, name, title, artist, album, year } = evt.payload

      const resolver = this.#pendingRequests.get(idx)
      if (resolver) {
        // TODO: extract nullish check function
        const payload =
          id &&
          src &&
          name &&
          typeof title !== 'undefined' &&
          typeof artist !== 'undefined' &&
          typeof album !== 'undefined' &&
          typeof year !== 'undefined'
            ? { id, src, name, title, artist, album, year }
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
  }

  async listenSelectedPlayList(onSelect: (song: ISong) => Promise<void>) {
    await listen('selected_play_list', async (evt: Event<{ idx: number } & ISong>) => {
      const { idx, ...song } = evt.payload
      await this.selectPos(idx)
      onSelect(song)
    })
  }

  async pos(): Promise<ISong | null> {
    emit('pos_request', { idx: this.#index })

    const promise = new Promise((resolve) => {
      this.#pendingRequests.set(this.#index, resolve)
    })
    return promise as Promise<ISong | null>
  }

  async selectPos(pos: number): Promise<ISong | null> {
    const length = await this.getLength()

    if (pos >= length || pos < 0) throw new Error('invalid playlist position')

    this.#index = pos
    return this.pos()
  }

  async prev() {
    if (this.#index === 0) return this.pos()
    this.#index -= 1
    return this.pos()
  }

  async next() {
    const length = await this.getLength()
    if (length - 1 === this.#index) {
      return this.pos()
    }
    this.#index += 1
    return this.pos()
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
