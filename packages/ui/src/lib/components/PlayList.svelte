<script lang="ts">
  import { onMount } from 'svelte'
  import { playList } from '../../store'
  import { open } from '@tauri-apps/plugin-dialog'
  import { convertFileSrc } from '@tauri-apps/api/core'

  export let env: 'web' | 'webview'

  const handleAdd = async () => {
    let filePath
    if (env === 'webview') {
      filePath = await open({ multiple: false })
    } else {
    }

    if (!filePath) return

    const srcPath = convertFileSrc(filePath)
    await playList.addSong(srcPath)
  }

  const handleDelete = async (idx: number) => {
    await playList.removeSong(idx)
  }

  onMount(async () => {
    playList.init(env)
  })
</script>

<div class="h-100 w-100 rounded-2xl bg-neutral-300">
  <div>
    <button class="text-white" on:click={handleAdd}>추가</button>
  </div>
  <ul>
    {#each $playList as song, i}
      <li class="cursor-pointer px-3">
        {song.source} <button class="text-white" on:click={() => handleDelete(i)}>삭제</button>
      </li>
    {/each}
  </ul>
</div>
