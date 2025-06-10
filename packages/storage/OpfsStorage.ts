import { Buffer } from 'buffer'
import type { IStorage } from './interface'

class OpfsStorage implements IStorage {
  private opfs: FileSystemDirectoryHandle | undefined

  async set(key: string, value: Uint8Array) {
    await this.init()

    if (!this.opfs) return

    const handle = await this.opfs.getFileHandle(Buffer.from(key, 'utf-8').toString('hex'), {
      create: true
    })
    const stream = await handle.createWritable()
    await stream.write(value)
    stream.close()
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      await this.init()

      if (!this.opfs) return null

      const handle = await this.opfs.getFileHandle(Buffer.from(key, 'utf-8').toString('hex'), {
        create: false
      })
      const stream = await handle.getFile()

      return Buffer.from(await stream.arrayBuffer())
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === 'NotFoundError') {
          return null
        }
      }
      throw error
    }
  }

  async remove(key: string) {
    try {
      await this.init()

      if (!this.opfs) return null

      await this.opfs.removeEntry(Buffer.from(key, 'utf-8').toString('hex'))
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === 'NotFoundError') {
          return null
        }
      }
      throw error
    }
  }

  async keys(): Promise<string[]> {
    await this.init()

    if (!this.opfs) return []

    let entries: string[] = []

    // sadly, the typings for opfs is not available yet
    // https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system#listing_the_contents_of_a_folder
    for await (const entry of (this.opfs as any).values()) {
      entries.push(Buffer.from(entry.name, 'hex').toString('utf-8'))
    }
    return entries
  }

  private async init() {
    if (!this.opfs) {
      this.opfs = await window.navigator.storage.getDirectory()
    }
  }
}

export default OpfsStorage
