<script lang="ts">
  import { AudioPlayer } from '@musicuon/ui'
</script>

<main>
  <h1>Vite + Svelte</h1>

  <div class="card">
    <!-- <Counter /> -->
    <audio src="/src/assets/result.mp3" />
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer"
      >SvelteKit</a
    >, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">Click on the Vite and Svelte logos to learn more</p>
  <AudioPlayer />
</main>

<style>
</style>
