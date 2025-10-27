import type { LRCLIBLyric, SyncedLyric } from './types'

class LyricsFetcher {
  async fetchLRCLIBLyrics(songTitle: string, artist: string): Promise<SyncedLyric[]> {
    try {
      const response = await fetch(
        `https://lrclib.net/api/search?track_name=${songTitle}&artist_name=${artist}`
      )

      const lyrics: LRCLIBLyric[] = await response.json()

      if (lyrics.length <= 0) {
        return []
      }

      return this.parseLRCLyrics(lyrics[0].syncedLyrics)
    } catch (err) {
      throw err
    }
  }

  parseLRCLyrics(lyrics: string) {
    const lines = lyrics.split('\n')

    const parsedLyrics = []

    for (const line of lines) {
      const matched = line.match(/\[(\d{2}:\d{2}.\d{2})\](.*)/)

      if (matched) {
        const time = matched[1]
        const lyric = matched[2].trim()

        const [minutes, seconds] = time.split(':')
        const timestamp = parseInt(minutes) * 60 + parseFloat(seconds)
        parsedLyrics.push({ timestamp, lyric })
      }
    }
    return parsedLyrics
  }
}

export default LyricsFetcher
