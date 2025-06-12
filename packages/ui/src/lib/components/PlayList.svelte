<script lang="ts">
  import { onMount } from 'svelte'
  import { playList } from '../../store'

  export let env: string
  let id = 0

  const handleAdd = async () => {
    await playList.addSong(String(id))
    id++
  }

  const handleDelete = async () => {
    await playList.removeSong(id - 1 < 0 ? 0 : id - 1)
    id--
  }

  onMount(async () => {
    playList.init()
  })
</script>

<div class="h-100 w-100 rounded-2xl bg-neutral-300">
  <div>
    <button class="text-white" on:click={handleAdd}>추가</button>
    <button class="text-white" on:click={handleDelete}>삭제</button>
  </div>
  <ul>
    {#each $playList as song}
      <li class="cursor-pointer px-3">{song}</li>
    {/each}
  </ul>
</div>
