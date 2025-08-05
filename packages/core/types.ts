import type { IFormat } from 'music-metadata'

export interface ISong {
  id: string
  src: string
  path: string
  name: string
  title: string
  artist: string
  album: string
  year: number
  format: IFormat
}

export interface Artwork {
  data: Uint8Array<ArrayBufferLike>
  format: string
}
