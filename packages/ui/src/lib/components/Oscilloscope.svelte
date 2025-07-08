<script lang="ts">
  export let canvasRef: HTMLCanvasElement
</script>

<div class="w-full bg-slate-400 px-4 py-2">
  <div class="bg-slate-300">
    <canvas bind:this={canvasRef} width={332} height={64} />
  </div>
</div>
