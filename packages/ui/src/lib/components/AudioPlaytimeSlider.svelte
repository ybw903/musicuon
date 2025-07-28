<script>
  import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'svelte-radix-slider'
  import { audioPlayer } from '../../store'

  const { currentTime, onPlayTime, isSeeking, duration } = audioPlayer
</script>

<SliderRoot
  class="relative flex h-5 w-full touch-none select-none items-center"
  value={[$currentTime]}
  onValueChange={([next]) => {
    if ($isSeeking === false) {
      isSeeking.set(true)
    }
    currentTime.set(next)
  }}
  onValueCommit={([next]) => {
    onPlayTime(next)
  }}
  min={0}
  max={$duration}>
  <SliderTrack class="relative h-1 flex-grow rounded-full bg-white">
    <SliderRange class="absolute h-full rounded-full bg-green-400" />
  </SliderTrack>
  <SliderThumb
    class="block h-4 w-4 rounded-lg bg-green-400 shadow-md focus:shadow-lg focus:outline-none" />
</SliderRoot>
