<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { AudioPlayer, Oscilloscope, AudioEqualizer } from '@musicuon/ui'
  import { ChevronDownIcon, ChevronUpIcon } from 'lucide-svelte'

  import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
  import type { UnlistenFn } from '@tauri-apps/api/event'
  import { LogicalSize } from '@tauri-apps/api/dpi'

  const appWindow = getCurrentWebviewWindow()
  let unlistenCloseFn: UnlistenFn

  let canvasRef: HTMLCanvasElement
  let isOpenAudioEqualizer = false

  async function handleToggleOpenAudioEqualizer() {
    if (!isOpenAudioEqualizer) {
      await appWindow.setSize(new LogicalSize(360.0, 767.0))
    } else {
      await appWindow.setSize(new LogicalSize(360.0, 592.0))
    }

    isOpenAudioEqualizer = !isOpenAudioEqualizer
  }

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
  <div class="flex items-center justify-end gap-2 bg-gray-900 px-6">
    <p class="text-sm text-white">EQ</p>
    <button
      class="text-white"
      on:click={handleToggleOpenAudioEqualizer}
      aria-label="toggle open audio equalizer">
      {#if isOpenAudioEqualizer}
        <ChevronUpIcon size={12} />
      {:else}
        <ChevronDownIcon size={12} />
      {/if}
    </button>
  </div>
  {#if isOpenAudioEqualizer}
    <div class="bg-gray-900 px-6">
      <AudioEqualizer />
    </div>
  {/if}

  <Oscilloscope bind:canvasRef />
</main>

<style>
</style>
