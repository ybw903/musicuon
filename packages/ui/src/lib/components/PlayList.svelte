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
      filePath = await open({
        multiple: false,
        filters: [
          {
            name: 'audio-filter',
            extensions: ['mp3', 'wav', 'ogg', 'aac', 'opus', 'flac', '3gp', 'adts', 'webm']
          }
        ]
      })
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
  <div class="mt-6">
    <div class="flex bg-slate-800 px-4 py-3">
      <div class="w-1/4 text-left text-xs text-white">파일명</div>
      <div class="w-1/4 text-left text-xs text-white">제목</div>
      <div class="w-1/4 text-left text-xs text-white">아티스트</div>
      <div class="w-1/12 text-left text-xs text-white">연도</div>
      <div class="w-1/12 text-center text-xs text-white">상세 정보</div>
      <div class="w-1/12 text-center text-xs text-white">삭제</div>
    </div>
    <ul class="flex flex-col">
      {#each $playList as song, i}
        <li class="cursor-pointer border-b border-b-slate-200 py-1">
          <button
            class="flex w-full items-center px-4 py-6"
            on:click={() => handleSelect(i)}
            aria-label={`${i}번째 노래 선택`}>
            <div class="w-1/4 truncate">
              <span class="text-left text-sm font-medium text-white"> {song.name}</span>
            </div>
            <div class="w-1/4 truncate">
              <span class="text-left text-sm font-medium text-white"> {song.title}</span>
            </div>
            <div class="w-1/4 truncate">
              <span class="text-left text-sm font-medium text-white"> {song.artist}</span>
            </div>
            <div class="w-1/12 truncate">
              <span class="text-left text-sm font-medium text-white"> {song.year}</span>
            </div>
            <div class="w-1/12">
              <button
                class="min-w-fit rounded-lg p-1"
                on:click|stopPropagation={() => handleSelectShowSongDetail(song)}
                aria-label="상세 정보">
                <InfoIcon aria-hidden={true} size={16} color={'#fff'} />
              </button>
            </div>
            <div class="w-1/12">
              <button
                class="min-w-fit rounded-lg p-1"
                on:click|stopPropagation={() => handleDelete(i)}
                aria-label="삭제">
                <CircleXIcon aria-hidden={true} size={16} color={'#dc2626'} />
              </button>
            </div>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>
