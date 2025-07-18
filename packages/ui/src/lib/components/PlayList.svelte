<script lang="ts">
  import { onMount } from 'svelte'
  import { open } from '@tauri-apps/plugin-dialog'
  import { PlusIcon, CircleXIcon, InfoIcon } from 'lucide-svelte'
  import { playList } from '../../store'
  import type { ISong } from '@musicuon/core'

  export let env: 'web' | 'webview'
  export let onSelectShowSongDetail: (song: ISong) => void

  const handleAdd = async () => {
    let filePath
    if (env === 'webview') {
      filePath = await open({ multiple: false })
    } else {
    }

    if (!filePath) return

    await playList.addSong(filePath)
  }

  const handleDelete = async (idx: number) => {
    await playList.removeSong(idx)
  }

  const handleSelectShowSongDetail = (song: ISong) => {
    onSelectShowSongDetail(song)
  }

  const handleSelect = (idx: number) => {
    playList.selectSong(idx)
  }

  onMount(async () => {
    playList.init(env)
  })
</script>

<div class="h-full w-full p-4">
  <header class="flex items-center justify-between">
    <h2 class="text-3xl font-bold text-white">Your Playlist</h2>
    <button class="flex items-center rounded-lg bg-white px-3 py-2" on:click={handleAdd}>
      <span class="mr-1"><PlusIcon size={16} /></span>
      <span class="font-bold">추가</span>
    </button>
  </header>
  <ul class="mt-2 flex flex-col">
    {#each $playList as song, i}
      <li class="flex cursor-pointer items-center border-b border-b-slate-200 py-1">
        <button on:click={() => handleSelect(i)} aria-label={`${i}번째 노래 선택`}>
          <span class="truncate text-sm font-medium text-white"> {song.name}</span>
        </button>

        <button
          class="min-w-fit rounded-lg p-1"
          on:click={() => handleSelectShowSongDetail(song)}
          aria-label="상세 정보">
          <InfoIcon aria-hidden={true} size={16} color={'#fff'} />
        </button>
        <button class="min-w-fit rounded-lg p-1" on:click={() => handleDelete(i)} aria-label="삭제">
          <CircleXIcon aria-hidden={true} size={16} color={'#dc2626'} />
        </button>
      </li>
    {/each}
  </ul>
</div>
