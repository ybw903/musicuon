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
      const { idx, id, src, name } = evt.payload

      const resolver = this.#pendingRequests.get(idx)
      if (resolver) {
        const payload = id && src && name ? { id, src, name } : null
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

  async pos(): Promise<ISong | null> {
    emit('pos_request', { idx: this.#index })

    const promise = new Promise((resolve) => {
      this.#pendingRequests.set(this.#index, resolve)
    })
    return promise as Promise<ISong | null>
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
