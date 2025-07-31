<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { AudioPlayer, Oscilloscope } from '@musicuon/ui'
  import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
  import type { UnlistenFn } from '@tauri-apps/api/event'

  const appWindow = getCurrentWebviewWindow()
  let unlistenCloseFn: UnlistenFn

  let canvasRef: HTMLCanvasElement

  onMount(async () => {
    unlistenCloseFn = await appWindow.listen('playlist_close', () => {
      appWindow.close()
    })
  })

  onDestroy(() => {
    unlistenCloseFn()
  })
</script>

<main>
  <!-- to be mount audio player after canvas ref binding -->
  {#if canvasRef}
    <AudioPlayer bind:visualCanvasRef={canvasRef} />
  {/if}
  <Oscilloscope bind:canvasRef />
</main>

<style>
</style>
