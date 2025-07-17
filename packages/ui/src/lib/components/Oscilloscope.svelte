<script lang="ts">
  export let canvasRef: HTMLCanvasElement
</script>

<div class="w-full bg-gray-900 px-4 py-2">
  <div class="bg-gray-800">
    <canvas bind:this={canvasRef} width={332} height={64} />
  </div>
</div>
