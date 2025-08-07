<script lang="ts">
  import { EQ_FREQUENCIES } from '@musicuon/core'
  import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'svelte-radix-slider'
  import { audioPlayer } from '../../store'
  const { filterGains, onFilterGain } = audioPlayer

  function formatFrequency(frequency: number) {
    if (frequency >= 1_000) {
      return `${(frequency / 1_000).toFixed(1)}k`
    } else {
      return frequency
    }
  }
</script>

<div class="flex w-full justify-between gap-1 overflow-auto py-4">
  {#each EQ_FREQUENCIES as eqFrequency, i}
    <div class="flex h-32 min-w-[38px] flex-grow flex-col items-center gap-4">
      <SliderRoot
        class="relative flex h-full w-5 touch-none select-none items-center justify-center"
        value={[$filterGains[i]]}
        onValueChange={([next]) => {
          onFilterGain(i, next)
        }}
        min={-12}
        max={12}
        orientation={'vertical'}>
        <SliderTrack class="relative h-full w-1 rounded-full bg-white">
          <SliderRange class="absolute w-full rounded-full bg-green-400" />
        </SliderTrack>
        <SliderThumb
          class="block h-4 w-4 rounded-lg bg-green-400 shadow-md focus:shadow-lg focus:outline-none" />
      </SliderRoot>

      <p class="text-xs text-white">{formatFrequency(eqFrequency)}</p>
    </div>
  {/each}
</div>
