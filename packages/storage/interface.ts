export interface IStorage {
  get: (key: string) => Promise<any>
  getAll?: () => Promise<any[]>
  set(key: string, value: Uint8Array): Promise<void>
  update(key: string, value: Uint8Array): Promise<void>
  remove(key: string): Promise<void | null>
  keys(): Promise<string[]>
}
