import { Buffer } from 'buffer'
import Database from '@tauri-apps/plugin-sql'
import type { IStorage } from './interface'

class DbStorage implements IStorage {
  private db: Database | undefined

  async set(key: string, value: Uint8Array) {
    try {
      await this.init()

      if (!this.db) return

      await this.db.execute('INSERT into songs (id, value) VALUES ($1, $2)', [key, value])
    } catch (error) {
      throw error
    }
  }

  async get(key: string): Promise<{ id: string; value: string } | null> {
    try {
      await this.init()

      if (!this.db) return null

      const songs = await this.db.select<{ id: string; value: string }[]>(
        'SELECT * from songs WHERE id = $1',
        [key]
      )

      if (songs.length === 0) return null

      return songs[0]
    } catch (error) {
      throw error
    }
  }

  async getAll(): Promise<{ id: string; value: string }[]> {
    try {
      await this.init()

      if (!this.db) return []

      const songs = await this.db.select<{ id: string; value: string }[]>('SELECT * from songs')

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
    } catch (error) {
      throw error
    }
  }

  async keys(): Promise<string[]> {
    await this.init()

    if (!this.db) return []

    const keys = await this.db.select<string[]>('SELECT id from songs')

    return keys
  }

  private async init() {
    if (!this.db) {
      this.db = await Database.load('sqlite:musicuon.db')
    }
  }
}

export default DbStorage
