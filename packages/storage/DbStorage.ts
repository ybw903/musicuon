import { Buffer } from 'buffer'
import Database from '@tauri-apps/plugin-sql'
import type { IStorage } from './interface'

class DbStorage implements IStorage {
  private db: Database | undefined

  async set(key: string, value: Uint8Array) {
    try {
      await this.init()

      if (!this.db) return

      await this.db.execute('INSERT into songs (id, path) VALUES ($1, $2)', [key, value])

      await this.db.close()
    } catch (error) {
      throw error
    }
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      await this.init()

      if (!this.db) return null

      const songs = await this.db.select<string[]>('SELECT path from songs WHERE id = $1', [key])
      await this.db.close()

      if (songs.length === 0) return null

      return new Buffer(songs[0])
    } catch (error) {
      throw error
    }
  }

  async getAll(): Promise<string[]> {
    try {
      await this.init()

      if (!this.db) return []

      const songs = await this.db.select<string[]>('SELECT path from songs')
      await this.db.close()

      return songs
    } catch (error) {
      throw error
    }
  }

  async remove(key: string) {
    try {
      await this.init()

      if (!this.db) return null

      await this.db.execute('DELETE from songs WHERE id = $1', [key])

      await this.db.close()
    } catch (error) {
      throw error
    }
  }

  async keys(): Promise<string[]> {
    await this.init()

    if (!this.db) return []

    const keys = await this.db.select<string[]>('SELECT id from songs')

    await this.db.close()
    return keys
  }

  private async init() {
    if (!this.db) {
      this.db = await Database.load('sqlite:musicuon.db')
    }
  }
}

export default DbStorage
