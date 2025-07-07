<script lang="ts">
  import {
    PlayIcon,
    PauseIcon,
    Volume2Icon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    ListIcon
  } from 'lucide-svelte'

  import { AudioPlayer, type ISong } from '@musicuon/core'
  import dayjs from 'dayjs'
  import durationPlugin from 'dayjs/plugin/duration'
  import { onMount } from 'svelte'

  dayjs.extend(durationPlugin)

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
    audioPlayer = new AudioPlayer()
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

<div class="h-[120px] w-full bg-slate-400">
  <audio
    src="/audio/sample.mp3"
    bind:this={audioRef}
    on:loadedmetadata={handleLoadedMetaData}
    on:timeupdate={handleCurrentTime} />
  <div class="px-[24px] pt-[16px]">
    <div class="flex items-center justify-between">
      <p class="font-semibold">
        {currentSong ? currentSong.name : '재생할 노래를 목록에 추가해주세요.'}
      </p>
      <button on:click={handleOpenPlayList}>
        <ListIcon />
      </button>
    </div>

    <div class="mt-[8px] flex items-center gap-2">
      <span class="flex gap-1">
        <button
          class="flex items-center rounded-none border-0 bg-inherit p-0 font-bold text-gray-200"
          on:click={handlePrev}
          aria-label="이전 곡">
          <ChevronsLeftIcon aria-hidden />
        </button>
        <button
          class="rounded-none border-0 bg-inherit p-0"
          on:click={playing ? handlePause : handlePlay}
          aria-label={playing ? '일시정지' : '재생'}>
          {#if playing}
            <PauseIcon aria-hidden />
          {:else}
            <PlayIcon aria-hidden />
          {/if}
        </button>
        <button
          class="flex items-center rounded-none border-0 bg-inherit p-0 font-bold text-gray-200"
          on:click={handleNext}
          aria-label="다음 곡">
          <ChevronsRightIcon aria-hidden />
        </button>
      </span>

      <p>{displayCurrentTime}</p>
      <input type="range" value={currentTime} max={duration} on:change={handlePlayTime} />
      <p>{displayDuration}</p>
    </div>
    <div class="mt-[8px] flex items-center gap-1">
      <Volume2Icon />
      <input type="range" value={displayVolume} max="200" on:change={handleVolume} />
    </div>
  </div>
</div>
