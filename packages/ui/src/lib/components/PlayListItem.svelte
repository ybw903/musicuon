<script lang="ts">
  import type { ISong } from '@musicuon/core'
  import { CircleXIcon, InfoIcon } from 'lucide-svelte'
  import { onMount } from 'svelte'
  import {
    draggable,
    dropTargetForElements
  } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
  import clsx from 'clsx'
  export let idx: number
  export let song: ISong
  export let handleSelect: (idx: number) => void
  export let handleSelectShowSongDetail: (song: ISong) => void
  export let handleDelete: (idx: number) => void

  let listItemRef: HTMLLIElement
  let dragging = false
  let state: 'idle' | 'hover' = 'idle'

  onMount(() => {
    if (!listItemRef) return

    const cleanup = combine(
      draggable({
        element: listItemRef,
        getInitialData() {
          return { ...song, idx }
        },

        onDragStart() {
          dragging = true
        },
        onDrop() {
          dragging = false
        }
      }),
      dropTargetForElements({
        element: listItemRef,
        canDrop({ source }) {
          if (source.element === listItemRef) return false
          return true
        },
        getData() {
          return { ...song, idx }
        },
        getIsSticky() {
          return true
        },
        onDragEnter({ self }) {
          state = 'hover'
        },
        onDragLeave() {
          state = 'idle'
        },
        onDrop() {
          state = 'idle'
        }
      })
    )

    return () => {
      cleanup()
    }
  })
</script>

<li
  class={clsx(
    'cursor-pointer border-b border-b-slate-200 py-1',
    dragging && 'opacity-70',
    state === 'hover' && 'bg-slate-800'
  )}
  bind:this={listItemRef}>
  <button
    class="flex w-full items-center px-4 py-6"
    on:click={() => handleSelect(idx)}
    aria-label={`${idx}번째 노래 선택`}>
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
        on:click|stopPropagation={() => handleDelete(idx)}
        aria-label="삭제">
        <CircleXIcon aria-hidden={true} size={16} color={'#dc2626'} />
      </button>
    </div>
  </button>
</li>
