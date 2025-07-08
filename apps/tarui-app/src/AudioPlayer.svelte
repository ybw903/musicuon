<script lang="ts">
  import { AudioPlayer, Oscilloscope } from '@musicuon/ui'
  let canvasRef: HTMLCanvasElement
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
