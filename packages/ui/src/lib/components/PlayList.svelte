<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { open } from '@tauri-apps/plugin-dialog'
  import { CircleXIcon, PlusIcon } from 'lucide-svelte'
  import clsx from 'clsx'
  import hotkeys from 'hotkeys-js'
  import dayjs from 'dayjs'
  import durationPlugin from 'dayjs/plugin/duration'
  import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

  import type { ISong } from '@musicuon/core'
  import PlayListItem from './PlayListItem.svelte'
  import SearchIcon from './icons/SearchIcon.svelte'
  import { playList } from '../../store'

  dayjs.extend(durationPlugin)

  export let env: 'web' | 'webview'
  export let onSelectShowSongDetail: (song: ISong) => void

  let searchKeywordInputRef: HTMLInputElement | null = null
  let searchKeyword = ''
  let openSearch = false
  $: filteredPlayList =
    searchKeyword.length > 0
      ? $playList
          .map((song, idx) => ({
            ...song,
            idx,
            includeKeywords:
              song.name.toLocaleLowerCase().includes(searchKeyword.toLocaleLowerCase()) ||
              song.title.toLocaleLowerCase().includes(searchKeyword.toLocaleLowerCase()) ||
              song.artist.toLocaleLowerCase().includes(searchKeyword.toLocaleLowerCase())
          }))
          .filter((song) => song.includeKeywords)
      : []
  $: existFilteredPlayListItem = filteredPlayList.length > 0

  $: totalSong = $playList.length
  $: existPlayListItem = totalSong > 0
  let dragAndDropList: ISong[] = []

  $: $playList,
    (() => {
      dragAndDropList = $playList
    })()

  $: renderedList = openSearch ? filteredPlayList : dragAndDropList

  const handleClearSearchKeyword = () => {
    if (openSearch) {
      searchKeyword = ''
    }
  }

  const closeOpenSearch = () => {
    handleClearSearchKeyword()
    openSearch = false
  }

  const handleToggleOpenSearch = () => {
    if (openSearch) {
      closeOpenSearch()
    } else {
      openSearch = true
      tick().then(() => {
        if (searchKeywordInputRef) {
          searchKeywordInputRef.focus()
        }
      })
    }
  }

  const handleSearchKeywordInputKeydown = (
    event: KeyboardEvent & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) => {
    if (event.key == 'Escape') {
      if (searchKeyword.length > 0) {
        searchKeyword = ''
      } else {
        closeOpenSearch()
      }
    }
  }

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
    if (openSearch) {
      closeOpenSearch()
    }
    playList.selectSong(idx)
  }

  // TODO: use os plugin
  hotkeys('cmd+f', function (event) {
    handleToggleOpenSearch()
  })

  hotkeys('ctrl+f', function (event) {
    handleToggleOpenSearch()
  })

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
    <div class="flex items-center gap-3">
      <button
        class="flex items-center rounded-lg bg-white px-3 py-2"
        on:click={handleToggleOpenSearch}>
        <span class="mr-1"><SearchIcon width={'16px'} height={'16px'} /></span>
        <span class="font-bold">검색</span>
      </button>
      <button class="flex items-center rounded-lg bg-white px-3 py-2" on:click={handleAdd}>
        <span class="mr-1"><PlusIcon size={16} /></span>
        <span class="font-bold">추가</span>
      </button>
    </div>
  </header>
  <p class="mt-1 text-xs text-white">total {totalSong} songs</p>
  {#if openSearch}
    <div class="my-6 flex items-center gap-3">
      <div
        class="relative flex flex-1 items-center gap-3 rounded-lg bg-slate-700 px-4 py-2.5 focus-within:outline focus-within:outline-1 focus-within:outline-green-300">
        <SearchIcon class="text-white" />
        <input
          class="bg-inherit text-sm font-medium leading-normal text-white focus:outline-none"
          placeholder="Search"
          bind:this={searchKeywordInputRef}
          bind:value={searchKeyword}
          on:keydown={handleSearchKeywordInputKeydown} />

        <button
          class="absolute right-4"
          on:click={handleClearSearchKeyword}
          aria-label="검색어 초기화"
          ><CircleXIcon class="text-white" aria-hidden size={16} /></button>
      </div>
      <button on:click={handleToggleOpenSearch}>
        <span class="text-xs font-bold text-white">취소</span>
      </button>
    </div>
  {/if}
  <div
    class={clsx(
      'mt-6 h-[calc(100%-40px-24px-148px-82px-4px)] overflow-auto',
      openSearch ? 'md:h-[calc(100%-40px-24px-82px)]' : 'md:h-[calc(100%-40px-24px)]'
    )}>
    {#if existPlayListItem}
      <div class="sticky top-0 flex bg-slate-800 px-4 py-3">
        <div class="w-1/4 text-left text-xs text-white">파일명</div>
        <div class="w-1/4 text-left text-xs text-white">제목</div>
        <div class="w-1/4 text-left text-xs text-white">아티스트</div>
        <div class="w-1/12 text-left text-xs text-white">연도</div>
        <div class="w-1/12 text-center text-xs text-white">상세 정보</div>
        <div class="w-1/12 text-center text-xs text-white">삭제</div>
      </div>
      {#if openSearch && searchKeyword.length === 0}
        <div class="mt-20 flex justify-center">
          <p class="text-lg font-bold text-white">검색어를 입력해주세요.</p>
        </div>
      {:else if openSearch && !existFilteredPlayListItem}
        <div class="mt-20 flex justify-center">
          <p class="text-lg font-bold text-white">검색 결과가 없습니다.</p>
        </div>
      {:else}
        <ul class="flex flex-col">
          {#each renderedList as song, i}
            <PlayListItem
              idx={'idx' in song && typeof song.idx === 'number' ? song.idx : i}
              {song}
              {handleSelect}
              {handleSelectShowSongDetail}
              {handleDelete}
              disabledDraggable={openSearch} />
          {/each}
        </ul>
      {/if}
    {:else}
      <div class="mt-20 flex justify-center">
        <p class="text-lg font-bold text-white">재생할 노래를 목록에 추가해주세요.</p>
      </div>
    {/if}
  </div>
</div>
