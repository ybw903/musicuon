import { Buffer as BufferPolyfill } from 'buffer'

export function polyfill() {
  globalThis.Buffer = BufferPolyfill
}
