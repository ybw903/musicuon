<script lang="ts">
  import { LyricsFetcher } from '@musicuon/core'
  import type { SyncedLyric } from '@musicuon/core'
  import { audioPlayer } from '../../store'
  import clsx from 'clsx'

  const { currentTime } = audioPlayer
  const lyricsFetcher = new LyricsFetcher()

  export let songTitle: string = ''
  export let artist: string = ''

  let syncedLyrics: SyncedLyric[] = []
  let loadedLyrics = false

  $: currentSyncedLyricIdx =
    syncedLyrics.findIndex(({ timestamp }) => timestamp >= $currentTime) - 1

  $: songTitle,
    artist,
    (async () => {
      syncedLyrics = []
      loadedLyrics = false

      syncedLyrics = await lyricsFetcher.fetchLRCLIBLyrics(songTitle, artist)
      loadedLyrics = true
    })()
</script>

<div class="flex h-full flex-shrink-0 justify-center text-sm text-gray-300">
  {#if loadedLyrics}
    <div class="flex flex-col gap-1 overflow-auto text-center">
      {#if syncedLyrics.length > 0}
        {#each syncedLyrics as syncedLyric, i}
          <p class={clsx(currentSyncedLyricIdx === i && 'font-semibold text-white')}>
            {syncedLyric.lyric}
          </p>
        {/each}
      {:else}
        <p class="flex items-center justify-center">가사를 불러올 수 없습니다.</p>
      {/if}
    </div>
  {:else}
    <p class="flex items-center justify-center">가사를 불러오는 중입니다...</p>
  {/if}
</div>
