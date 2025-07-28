<script lang="ts">
  import { toast, Toaster } from 'svelte-french-toast'
  import { PlayListNavigation, PlayListHeader, PlayList, SongDetailModal } from '@musicuon/ui'
  import { resolveEnv } from './utils/envUtils'

  let env = resolveEnv()

  // TODO: handle state via store
  let selectedShowSongDetail
  function handleSelectShowSongDetail(song) {
    selectedShowSongDetail = song
  }
  function onCloseSongDetailModal() {
    handleSelectShowSongDetail(null)
  }

  function onEditSongDetail(onEdit: Promise<unknown>) {
    toast.promise(onEdit, {
      loading: '수정중...',
      success: '수정 완료',
      error: '수정 실패'
    })
  }
</script>

<main class="min-h-screen w-full bg-gray-900">
  <PlayListHeader />
  <div class="flex w-full flex-col gap-1 px-6 py-5 md:flex-row">
    <aside class="h-full w-full p-4 md:w-[320px]">
      <PlayListNavigation />
    </aside>
    <section class="h-full w-full md:w-[calc(100%-320px)]">
      <PlayList {env} onSelectShowSongDetail={handleSelectShowSongDetail} />
    </section>
  </div>
  <SongDetailModal
    song={selectedShowSongDetail}
    onCloseModal={onCloseSongDetailModal}
    {onEditSongDetail} />
  <Toaster />
</main>

<style>
</style>
