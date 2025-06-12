<script lang="ts">
  import { onMount } from 'svelte'
  import { playList } from '../../store'
  import { open } from '@tauri-apps/plugin-dialog'

  export let env: 'web' | 'webview'

  const handleAdd = async () => {
    let file
    if (env === 'webview') {
      file = await open({ multiple: false })
    } else {
    }

    if (!file) return

    await playList.addSong(file)
    // id++
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
