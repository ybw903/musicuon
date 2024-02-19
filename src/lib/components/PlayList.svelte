<script lang="ts">
  import { onMount } from 'svelte'
  import PlayList from '../core/PlayList'
  let playList: PlayList

  onMount(() => {
    playList = new PlayList()
  })
</script>

<section class="h-100 w-100 rounded-2xl bg-neutral-300">
  {#if playList && playList.isInitLoad()}
    <ul>
      {#each playList.getPlayList() as song}
        <li class="px-3">{song}</li>
      {/each}
    </ul>
  {/if}
</section>
