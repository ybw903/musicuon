<script lang="ts">
  import { onMount } from 'svelte'
  import { open } from '@tauri-apps/plugin-dialog'
  import { PlusIcon } from 'lucide-svelte'
  import { playList } from '../../store'
  import type { ISong } from '@musicuon/core'
  import dayjs from 'dayjs'
  import durationPlugin from 'dayjs/plugin/duration'
  import PlayListItem from './PlayListItem.svelte'
  import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

  dayjs.extend(durationPlugin)

  export let env: 'web' | 'webview'
  export let onSelectShowSongDetail: (song: ISong) => void

  $: existPlayListItem = $playList.length > 0
  let dragAndDropList: ISong[] = []

  $: $playList,
    (() => {
      dragAndDropList = $playList
    })()

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

  onMount(() => {
    playList.init(env)

    const cleanup = monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0]
        if (!destination) {
          // if dropped outside of any drop targets
          return
        }

        const destinationIdx = destination.data.idx as number
        const sourceIdx = source.data.idx as number
        playList.swapSong(destinationIdx, sourceIdx)
      }
    })

    return () => {
      cleanup()
    }
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
    {#if existPlayListItem}
      <div class="flex bg-slate-800 px-4 py-3">
        <div class="w-1/4 text-left text-xs text-white">파일명</div>
        <div class="w-1/4 text-left text-xs text-white">제목</div>
        <div class="w-1/4 text-left text-xs text-white">아티스트</div>
        <div class="w-1/12 text-left text-xs text-white">연도</div>
        <div class="w-1/12 text-center text-xs text-white">상세 정보</div>
        <div class="w-1/12 text-center text-xs text-white">삭제</div>
      </div>

      <ul class="flex flex-col">
        {#each dragAndDropList as song, i}
          <PlayListItem idx={i} {song} {handleSelect} {handleSelectShowSongDetail} {handleDelete} />
        {/each}
      </ul>
    {:else}
      <div class="mt-20 flex justify-center">
        <p class="text-lg font-bold text-white">재생할 노래를 목록에 추가해주세요.</p>
      </div>
    {/if}
  </div>
</div>
