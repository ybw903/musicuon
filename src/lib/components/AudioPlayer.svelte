<script lang="ts">
  import PlayIcon from '../../assets//polygon.svg'
  import PauseIcon from '../../assets/pause.svg'
  import AudioIcon from '../../assets/audio.svg'
  import audioPlayer from '../core/AudioPlayer'

  let audioRef: HTMLAudioElement
  let playing = false
  let volume = 1

  $: displayVolume = volume * 100

  function handlePlay() {
    if (!audioPlayer.isInitSource()) {
      audioPlayer.setSource(audioRef)
      audioPlayer.volume(volume)
    }

    audioPlayer.play()
    playing = true
  }

  function hanldePause() {
    audioPlayer.pause()
    playing = false
  }

  function handleVolume(evt: any) {
    volume = evt.target.value / 100
    audioPlayer.volume(evt.target.value / 100)
  }
</script>

<div class="h-[120px] w-[320px] rounded-2xl bg-neutral-400">
  <audio src="/audio/sample.mp3" bind:this={audioRef} />
  <div class="pl-[24px] pt-[16px]">
    <p class="text-xl">노래 제목 뭐시기 저시기 어</p>
    <div class="mt-[8px] flex items-center gap-1">
      <button
        class="rounded-none border-0 bg-inherit p-0"
        on:click={playing ? hanldePause : handlePlay}>
        <img
          src={playing ? PauseIcon : PlayIcon}
          alt={playing ? '일시정지 아이콘' : '재생 아아콘'} />
      </button>

      <p>00:00</p>
      <input type="range" />
      <p>03:00</p>
    </div>
    <div class="mt-[8px] flex items-center gap-1">
      <img src={AudioIcon} alt="오디오 아이콘" />
      <input type="range" value={displayVolume} on:change={handleVolume} max="200" />
    </div>
  </div>
</div>
