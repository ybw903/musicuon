<script lang="ts">
  import { PlayIcon, PauseIcon, Volume2Icon, ListIcon } from 'lucide-svelte'
  import musicuonLogo from '../../assets/musicuon_logo.png'

  import { AudioPlayer, type ISong } from '@musicuon/core'
  import dayjs from 'dayjs'
  import durationPlugin from 'dayjs/plugin/duration'
  import { onMount } from 'svelte'
  import PrevSongIcon from './icons/PrevSongIcon.svelte'
  import NextSongIcon from './icons/NextSongIcon.svelte'

  dayjs.extend(durationPlugin)

  export let visualCanvasRef: HTMLCanvasElement
  let audioRef: HTMLAudioElement
  let audioPlayer: AudioPlayer

  let playing = false
  let volume = 1
  let currentTime = 0
  let duration = 0
  let currentSong: ISong | null = null

  $: displayVolume = volume * 100
  $: displayDuration = dayjs.duration(duration, 's').format('mm:ss')
  $: displayCurrentTime = dayjs.duration(currentTime, 's').format('mm:ss')

  onMount(async () => {
    // TODO: strict type check
    audioPlayer = new AudioPlayer(
      visualCanvasRef ? { options: { visualCanvasElement: visualCanvasRef } } : {}
    )
    audioPlayer.listenSelectedPlayList(async (song) => {
      await handlePause()
      currentSong = await audioPlayer.getSong()
      await handlePlay()
    })
    audioPlayer.listenRemovedPlayList(async (idx, currentPlaying) => {
      if (!currentPlaying) return

      await handlePause()
      currentTime = 0
      duration = 0

      currentSong = await audioPlayer.getSong()
      if (!currentSong) return

      await handlePlay()
    })
    currentSong = await audioPlayer.getSong()
  })

  async function handlePlay() {
    if (!audioPlayer.isInitSource()) {
      audioPlayer.setSource(audioRef)
      audioPlayer.volume(volume)
    }

    await audioPlayer.play()
    currentSong = await audioPlayer.getSong()
    playing = true
  }

  async function handlePause() {
    await audioPlayer.pause()
    playing = false
  }

  async function handlePrev() {
    await handlePause()
    await audioPlayer.prevSong()
    await handlePlay()
  }

  async function handleNext() {
    await handlePause()
    await audioPlayer.nextSong()
    await handlePlay()
  }

  function handleCurrentTime(evt: any) {
    currentTime = evt.target.currentTime
  }

  function handleLoadedMetaData(evt: any) {
    duration = evt.target.duration
  }

  // [TODO] dispatch event through debounced?...
  function handlePlayTime(evt: any) {
    handlePause().then(() => {
      currentTime = evt.target.value
      audioPlayer.playtime(evt.target.value)
      handlePlay()
    })
  }

  function handleVolume(evt: any) {
    volume = evt.target.value / 100
    audioPlayer.volume(evt.target.value / 100)
  }

  function handleOpenPlayList() {
    audioPlayer.openPlayListWindow()
  }
</script>

<div class="h-full w-full bg-gray-900">
  <audio
    src="/audio/sample.mp3"
    bind:this={audioRef}
    on:loadedmetadata={handleLoadedMetaData}
    on:timeupdate={handleCurrentTime} />
  <div class="px-[24px] pt-[16px]">
    <div class="flex items-center justify-between">
      <p class="text-white">
        {currentSong ? currentSong.name : '재생할 노래를 목록에 추가해주세요.'}
      </p>
      <button on:click={handleOpenPlayList}>
        <ListIcon color={'#fff'} />
      </button>
    </div>
    <div class="mt-4 flex items-center justify-center">
      <div class="flex h-32 w-32 items-center justify-center rounded-xl bg-gray-500">
        <img
          class="drop-shadow-lg"
          src={musicuonLogo}
          width={80}
          height={80}
          alt="기본 앨범 커버 이미지" />
      </div>
    </div>
    <div class="mt-4">
      <input
        class="bg-white"
        type="range"
        value={currentTime}
        max={duration}
        on:change={handlePlayTime} />
      <div class="flex justify-between">
        <p class="text-sm text-white">{displayCurrentTime}</p>
        <p class="text-sm text-white">{displayDuration}</p>
      </div>
    </div>
    <div class="flex items-center justify-center gap-6">
      <button
        class="flex items-center rounded-none border-0 bg-inherit p-0 font-bold text-white"
        on:click={handlePrev}
        aria-label="이전 곡">
        <PrevSongIcon />
      </button>
      <button
        class="rounded-none border-0 bg-inherit p-0 text-black"
        on:click={playing ? handlePause : handlePlay}
        aria-label={playing ? '일시정지' : '재생'}>
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-400">
          {#if playing}
            <PauseIcon aria-hidden size={28} fill={'#111827'} />
          {:else}
            <PlayIcon aria-hidden size={28} fill={'#111827'} />
          {/if}
        </div>
      </button>
      <button
        class="flex items-center rounded-none border-0 bg-inherit p-0 font-bold text-white"
        on:click={handleNext}
        aria-label="다음 곡">
        <NextSongIcon />
      </button>
    </div>
    <div class="mt-3 flex items-center gap-1">
      <Volume2Icon color={'#fff'} />
      <input type="range" value={displayVolume} max="200" on:change={handleVolume} />
    </div>
  </div>
</div>
