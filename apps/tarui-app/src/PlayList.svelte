<script lang="ts">
  import { PlayList, SongDetailModal } from '@musicuon/ui'
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
</script>

<main>
  <PlayList {env} onSelectShowSongDetail={handleSelectShowSongDetail} />
  <SongDetailModal song={selectedShowSongDetail} onCloseModal={onCloseSongDetailModal} />
</main>

<style>
</style>
