<script lang="ts">
  import { PlayIcon, PauseIcon, Volume2Icon, ListIcon } from 'lucide-svelte'
  import musicuonLogo from '../../assets/musicuon_logo.png'

  import dayjs from 'dayjs'
  import durationPlugin from 'dayjs/plugin/duration'
  import { onMount } from 'svelte'
  import clsx from 'clsx'
  import { audioPlayer } from '../../store'
  import AudioPlaytimeSlider from './AudioPlaytimeSlider.svelte'
  import PrevSongIcon from './icons/PrevSongIcon.svelte'
  import NextSongIcon from './icons/NextSongIcon.svelte'
  import ShuffleIcon from './icons/ShuffleIcon.svelte'
  import RepeatIcon from './icons/RepeatIcon.svelte'

  dayjs.extend(durationPlugin)

  export let visualCanvasRef: HTMLCanvasElement

  const {
    audioPlayerManager,
    isPlaying,
    volume,
    duration,
    currentTime,
    currentSong,
    repeatPlay,
    shufflePlay,

    onPlayTime,
    onShufflePlay,
    onPrev,
    onPause,
    onPlay,
    onNext,
    onRepeatPlay,
    onVolume
  } = audioPlayer

  $: displayVolume = $volume * 100
  $: displayDuration = dayjs.duration($duration, 's').format('mm:ss')
  $: displayCurrentTime = dayjs.duration($currentTime, 's').format('mm:ss')

  onMount(async () => {
    audioPlayer.init(visualCanvasRef ? { options: { visualCanvasElement: visualCanvasRef } } : {})
  })

  function handleOpenPlayList() {
    $audioPlayerManager?.openPlayListWindow()
  }
</script>

<div class="h-full w-full bg-gray-900">
  <div class="px-[24px] pt-[16px]">
    <div class="flex items-center justify-between">
      <p class="text-white">
        {$currentSong ? $currentSong.name : '재생할 노래를 목록에 추가해주세요.'}
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
      <AudioPlaytimeSlider />
      <div class="flex justify-between">
        <p class="text-sm text-white">{displayCurrentTime}</p>
        <p class="text-sm text-white">{displayDuration}</p>
      </div>
    </div>
    <div class="mt-1 flex items-center justify-between">
      <button
        class={clsx(
          'flex items-center rounded-none border-0 bg-inherit p-0 font-bold transition-colors ease-out',
          $shufflePlay ? 'text-green-400' : 'text-white'
        )}
        on:click={onShufflePlay}
        aria-label="셔플">
        <ShuffleIcon />
      </button>
      <div class="flex items-center justify-center gap-6">
        <button
          class="flex items-center rounded-none border-0 bg-inherit p-0 font-bold text-white"
          on:click={onPrev}
          aria-label="이전 곡">
          <PrevSongIcon />
        </button>
        <button
          class="rounded-none border-0 bg-inherit p-0 text-black"
          on:click={$isPlaying ? onPause : onPlay}
          aria-label={$isPlaying ? '일시정지' : '재생'}>
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-400">
            {#if $isPlaying}
              <PauseIcon aria-hidden size={28} fill={'#111827'} />
            {:else}
              <PlayIcon aria-hidden size={28} fill={'#111827'} />
            {/if}
          </div>
        </button>
        <button
          class="flex items-center rounded-none border-0 bg-inherit p-0 font-bold text-white"
          on:click={onNext}
          aria-label="다음 곡">
          <NextSongIcon />
        </button>
      </div>
      <button
        class={clsx(
          'flex items-center rounded-none border-0 bg-inherit p-0 font-bold transition-colors ease-out',
          $repeatPlay ? 'text-green-400' : 'text-white'
        )}
        on:click={onRepeatPlay}
        aria-label="반복재생">
        <RepeatIcon />
      </button>
    </div>
    <div class="mt-3 flex items-center gap-1">
      <Volume2Icon color={'#fff'} />
      <input type="range" value={displayVolume} max="200" on:change={onVolume} />
    </div>
  </div>
</div>
