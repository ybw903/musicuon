<script lang="ts">
  import { onMount } from 'svelte'
  import AudioPlayer from '../core/AudioPlayer'
  import PlayIcon from '../../assets//polygon.svg'
  import PauseIcon from '../../assets/pause.svg'

  let audioPlayer: AudioPlayer | undefined
  let audioRef: HTMLAudioElement
  let playing = false

  onMount(() => {
    audioPlayer = new AudioPlayer()
  })

  function handlePlay() {
    if (!audioPlayer) return
    if (!audioPlayer.isInitSource()) {
      audioPlayer.setSource(audioRef)
    }

    audioPlayer.play()
    playing = true
  }

  function hanldePause() {
    if (!audioPlayer) return
    audioPlayer.pause()
    playing = false
  }
</script>

<div class="h-[80px] w-[320px] rounded-2xl bg-neutral-400">
  <audio src="/audio/sample.mp3" bind:this={audioRef} />
  <div class="pl-[24px] pt-[8px]">
    <p class="text-xl">노래 제목 뭐시기 저시기 어</p>
    <div class="mt-[4px] flex items-center gap-1">
      <button
        class="rounded-none border-0 bg-inherit p-0"
        on:click={audioPlayer?.isPlaying() ? hanldePause : handlePlay}>
        <img
          src={playing ? PauseIcon : PlayIcon}
          alt={playing ? '일시정지 아이콘' : '재생 아아콘'} />
      </button>

      <p>00:00</p>
      <input type="range" />
      <p>03:00</p>
    </div>
  </div>
</div>
