<script lang="ts">
  import { PlayList } from '@musicuon/ui'
  import { resolveEnv } from './utils/envUtils'

  let env = resolveEnv()
</script>

<main>
  <PlayList {env} />
</main>

<style>
</style>
