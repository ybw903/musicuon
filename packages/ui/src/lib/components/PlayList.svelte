<script lang="ts">
  import { onMount } from 'svelte'
  import { playList } from '../../store'
  import { open } from '@tauri-apps/plugin-dialog'
  import { PlusIcon } from 'lucide-svelte'
  import { CircleXIcon } from 'lucide-svelte'
  import { convertFileSrc } from '@tauri-apps/api/core'

  export let env: 'web' | 'webview'

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

  const handleSelect = (idx: number) => {
    playList.selectSong(idx)
  }

  onMount(async () => {
    playList.init(env)
  })
</script>

<div class="w-100 min-h-screen bg-slate-400 p-5">
  <div>
    <button class="flex items-center rounded-lg bg-white px-3 py-2" on:click={handleAdd}>
      <span class="mr-1"><PlusIcon size={16} /></span>
      <span class="font-bold">추가</span>
    </button>
  </div>
  <ul class="mt-2 flex flex-col">
    {#each $playList as song, i}
      <li class="flex cursor-pointer items-center border-b border-b-slate-200 py-1">
        <button on:click={() => handleSelect(i)} aria-label={`${i}번째 노래 선택`}>
          <span class="truncate text-sm font-medium"> {song.name}</span>
        </button>

        <button
          class="min-w-fit rounded-lg px-2 py-2"
          on:click={() => handleDelete(i)}
          aria-label="삭제">
          <CircleXIcon aria-hidden={true} size={16} color={'#dc2626'} />
        </button>
      </li>
    {/each}
  </ul>
</div>
