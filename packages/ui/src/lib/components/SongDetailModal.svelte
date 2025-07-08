<script lang="ts">
  import type { ISong } from '@musicuon/core'
  import Modal from './Modal.svelte'

  export let song: ISong
  export let onCloseModal: () => void

  $: if (song) {
    showModal = true
  }

  let showModal = false
  function onOpenModal(open: boolean) {
    showModal = open
    if (open === false) {
      onCloseModal()
    }
  }
</script>

<Modal {showModal} {onOpenModal}>
  <div slot="header">
    <div class="flex items-center justify-between">
      <h2 class="font-bold text-white">노래 상세 정보</h2>
    </div>
  </div>
  <div class="mt-4 flex flex-col gap-2" slot="content">
    <div class="flex items-center justify-between gap-4">
      <p class="w-24 text-xs font-medium text-white">노래 제목</p>
      <p class="min-h-6 w-full rounded bg-slate-300 px-2 py-1 text-xs font-medium text-white">
        {song?.title}
      </p>
    </div>
    <div class="flex items-center justify-between gap-4">
      <p class="w-24 text-xs font-medium text-white">앨범 이름</p>
      <p class="min-h-6 w-full rounded bg-slate-300 px-2 py-1 text-xs font-medium text-white">
        {song?.album}
      </p>
    </div>
    <div class="flex items-center justify-between gap-4">
      <p class="w-24 text-xs font-medium text-white">가수 이름</p>
      <p class="min-h-6 w-full rounded bg-slate-300 px-2 py-1 text-xs font-medium text-white">
        {song?.artist}
      </p>
    </div>
    <div class="flex items-center justify-between gap-4">
      <p class="w-24 text-xs font-medium text-white">발매 연도</p>
      <p class="min-h-6 w-full rounded bg-slate-300 px-2 py-1 text-xs font-medium text-white">
        {song?.year}
      </p>
    </div>
  </div>
</Modal>
