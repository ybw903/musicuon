import { Buffer } from 'buffer'

export interface IStorage {
  get: (key: string) => Promise<Buffer | null>
  getAll?: () => Promise<string[]>
  set(key: string, value: Uint8Array): Promise<void>
  remove(key: string): Promise<void | null>
  keys(): Promise<string[]>
}
