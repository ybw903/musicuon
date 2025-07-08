<script lang="ts">
  export let showModal: boolean
  export let onOpenModal: (open: boolean) => void

  let dialogRef: HTMLDialogElement

  $: if (showModal) {
    dialogRef.showModal()
  }

  function handleCloseModal() {
    dialogRef.close()
    onOpenModal(false)
  }

  function handleClickOutside(evt: MouseEvent) {
    if (evt.target === dialogRef) {
      handleCloseModal()
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  class="open:animate-zoom open:backdrop:animate-fade rounded-lg bg-slate-400 backdrop:bg-black/50 backdrop:backdrop-blur-md"
  bind:this={dialogRef}
  on:close={handleCloseModal}
  on:click={handleClickOutside}>
  <div class="m-4">
    <slot name="header" />
    <slot name="content" />
    <slot name="footer" />
  </div>
</dialog>
