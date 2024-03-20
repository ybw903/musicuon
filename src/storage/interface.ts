export interface IStorage {
  get(key: string): Promise<Buffer | null>
  set(key: string, value: Uint8Array): Promise<void>
  remove(key: string): Promise<void | null>
  keys(): Promise<string[]>
}
