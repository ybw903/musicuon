<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { toast, Toaster } from 'svelte-french-toast'
  import { PlayListNavigation, PlayListHeader, PlayList, SongDetailModal } from '@musicuon/ui'
  import { resolveEnv } from './utils/envUtils'
  import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
  import { emit, type UnlistenFn } from '@tauri-apps/api/event'
  import { confirm } from '@tauri-apps/plugin-dialog'

  const appWindow = getCurrentWebviewWindow()
  let unlistenCloseRequestFn: UnlistenFn

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

  onMount(async () => {
    unlistenCloseRequestFn = await appWindow.onCloseRequested(async (evt) => {
      const confirmed = await confirm('Musicuon을 종료하시겠습니까?')
      if (!confirmed) {
        evt.preventDefault()
        return
      }
      emit('playlist_close')
    })
  })

  onDestroy(() => {
    unlistenCloseRequestFn()
  })
</script>

<main class="flex h-screen w-full flex-col bg-gray-900">
  <PlayListHeader />
  <div class="flex w-full flex-1 flex-col gap-1 overflow-hidden px-6 py-5 md:flex-row">
    <aside class="w-full p-4 md:w-[320px]">
      <PlayListNavigation />
    </aside>
    <section class="w-full flex-1 md:w-[calc(100%-320px)]">
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
