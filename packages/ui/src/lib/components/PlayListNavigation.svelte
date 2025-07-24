<script lang="ts">
  import PlayListIcon from './icons/PlayListIcon.svelte'

  import clsx from 'clsx'

  let selectedMenuIdx = 0

  const menus = [{ name: 'Your Playlist', icon: PlayListIcon }]
</script>

<nav>
  <ul class="flex flex-col gap-2">
    {#each menus as menu, i}
      <li
        class={clsx(
          'flex items-center gap-3 px-3 py-2 text-white',
          selectedMenuIdx === i && 'rounded-lg bg-gray-800'
        )}>
        <svelte:component this={menu.icon} />
        <span class="text-sm">{menu.name}</span>
      </li>
    {/each}
  </ul>
</nav>
