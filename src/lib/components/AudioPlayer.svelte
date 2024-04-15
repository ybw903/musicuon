<script lang="ts">
  import PlayIcon from '../../assets//polygon.svg'
  import PauseIcon from '../../assets/pause.svg'
  import AudioIcon from '../../assets/audio.svg'
  import audioPlayer from '../core/AudioPlayer'
  import dayjs from 'dayjs'

  let audioRef: HTMLAudioElement
  let playing = false
  let volume = 1
  let currentTime = 0
  let duration = 0

  $: displayVolume = volume * 100
  $: displayDuration = dayjs.duration(duration, 's').format('mm:ss')
  $: displayCurrentTime = dayjs.duration(currentTime, 's').format('mm:ss')

  async function handlePlay() {
    if (!audioPlayer.isInitSource()) {
      audioPlayer.setSource(audioRef)
      audioPlayer.volume(volume)
    }

    await audioPlayer.play()
    playing = true
  }

  async function hanldePause() {
    await audioPlayer.pause()
    playing = false
  }

  function handlePrev() {
    console.log(audioPlayer.prevSong())
  }

  function handleNext() {
    console.log(audioPlayer.nextSong())
  }

  function handleCurrentTime(evt: any) {
    currentTime = evt.target.currentTime
  }

  function handleLoadedMetaData(evt: any) {
    duration = evt.target.duration
  }

  // [TODO] dispatch event through debounced?...
  function handlePlayTime(evt: any) {
    hanldePause().then(() => {
      currentTime = evt.target.value
      audioPlayer.playtime(evt.target.value)
      handlePlay()
    })
  }

  function handleVolume(evt: any) {
    volume = evt.target.value / 100
    audioPlayer.volume(evt.target.value / 100)
  }
</script>

<div class="h-[120px] w-[348px] rounded-2xl bg-neutral-400">
  <audio
    src="/audio/sample.mp3"
    bind:this={audioRef}
    on:loadedmetadata={handleLoadedMetaData}
    on:timeupdate={handleCurrentTime} />
  <div class="pl-[24px] pt-[16px]">
    <p class="text-xl">노래 제목 뭐시기 저시기 어</p>
    <div class="mt-[8px] flex items-center gap-2">
      <span class="flex gap-1">
        <button
          class="flex items-center rounded-none border-0 bg-inherit p-0 font-bold text-white"
          on:click={handlePrev}>
          &lt;&lt;
        </button>
        <button
          class="rounded-none border-0 bg-inherit p-0"
          on:click={playing ? hanldePause : handlePlay}>
          <img
            src={playing ? PauseIcon : PlayIcon}
            alt={playing ? '일시정지 아이콘' : '재생 아아콘'} />
        </button>
        <button
          class="flex items-center rounded-none border-0 bg-inherit p-0 font-bold text-white"
          on:click={handleNext}>
          &gt;&gt;
        </button>
      </span>

      <p>{displayCurrentTime}</p>
      <input type="range" value={currentTime} max={duration} on:change={handlePlayTime} />
      <p>{displayDuration}</p>
    </div>
    <div class="mt-[8px] flex items-center gap-1">
      <img src={AudioIcon} alt="오디오 아이콘" />
      <input type="range" value={displayVolume} max="200" on:change={handleVolume} />
    </div>
  </div>
</div>
