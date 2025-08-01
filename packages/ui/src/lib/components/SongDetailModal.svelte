<script lang="ts">
  import type { ISong } from '@musicuon/core'
  import { invoke } from '@tauri-apps/api/core'
  import Modal from './Modal.svelte'
  import dayjs from 'dayjs'

  export let song: ISong
  export let onCloseModal: () => void
  export let onEditSongDetail: (onEdit: Promise<unknown>) => void

  type SongFormKeys = 'title' | 'album' | 'artist' | 'year'
  let songForm: Pick<ISong, SongFormKeys> = {
    title: song?.title ?? '',
    album: song?.album ?? '',
    artist: song?.artist ?? '',
    year: song?.year ?? 0
  }
  let songFormError = {
    year: false
  }

  $: if (song) {
    showModal = true
    songForm.album = song.album
    songForm.artist = song.artist
    songForm.title = song.title
    songForm.year = song.year
  } else {
    songForm.album = ''
    songForm.artist = ''
    songForm.title = ''
    songForm.year = 0
  }

  let showModal = false
  function onOpenModal(open: boolean) {
    showModal = open
    if (open === false) {
      onCloseModal()
    }
  }

  function handleEditSongForm(
    evt: Event & { currentTarget: EventTarget & HTMLInputElement },
    key: SongFormKeys
  ) {
    if (key === 'year') {
      if (/\D/.test(evt.currentTarget.value)) {
        evt.currentTarget.value = String(songForm[key])
      } else {
        songForm[key] = Number(evt.currentTarget.value)
      }
    } else {
      songForm[key] = evt.currentTarget.value
    }
  }

  function handleEditSongDetail() {
    if (songForm.year !== 0 && String(songForm.year).length !== 4) {
      songFormError.year = true
      return
    } else {
      songFormError.year = false
    }
    const promise = invoke('write_metadata', {
      song: {
        ...song,
        ...songForm
      }
    })
    onEditSongDetail(promise)
    promise.then(() => onOpenModal(false))
  }
</script>

<Modal {showModal} {onOpenModal}>
  <div slot="header">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">노래 상세 정보</h2>
    </div>
  </div>
  <div class="mt-4" slot="content">
    <section>
      <h3 class="mb-2 text-lg font-semibold text-white">노래 파일 정보</h3>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between gap-4">
          <p class="w-24 text-xs font-medium text-white">파일 이름</p>
          <p class="text-xs font-medium text-white">{song?.name}</p>
        </div>
        <div class="flex items-center justify-between gap-4">
          <p class="w-24 text-xs font-medium text-white">Codec</p>
          <p class="text-xs font-medium text-white">{song?.format?.codec}</p>
        </div>
        <div class="flex items-center justify-between gap-4">
          <p class="w-24 text-xs font-medium text-white">Tag Type</p>
          <p class="text-xs font-medium text-white">{song?.format?.tagTypes?.join(',')}</p>
        </div>
        <div class="flex items-center justify-between gap-4">
          <p class="w-24 text-xs font-medium text-white">Duration</p>
          <p class="text-xs font-medium text-white">
            {dayjs.duration(song?.format?.duration ?? 0, 's').format('mm:ss')}
          </p>
        </div>
        <div class="flex items-center justify-between gap-4">
          <p class="w-24 text-xs font-medium text-white">Sample rate</p>
          <p class="text-xs font-medium text-white">
            {song?.format?.sampleRate}
          </p>
        </div>
        <div class="flex items-center justify-between gap-4">
          <p class="w-24 text-xs font-medium text-white">Bitrate</p>
          <p class="text-xs font-medium text-white">
            {song?.format?.bitrate}
          </p>
        </div>
      </div>
    </section>
    <section class="mt-4">
      <h3 class="mb-2 text-lg font-semibold text-white">노래 메타 정보</h3>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between gap-4">
          <p class="w-24 text-xs font-medium text-white">노래 제목</p>
          <input
            type="text"
            class="min-h-6 w-full rounded bg-gray-700 px-2 py-1 text-xs font-medium text-white"
            value={songForm.title}
            on:input={(evt) => handleEditSongForm(evt, 'title')} />
        </div>
        <div class="flex items-center justify-between gap-4">
          <p class="w-24 text-xs font-medium text-white">앨범 이름</p>
          <input
            type="text"
            class="min-h-6 w-full rounded bg-gray-700 px-2 py-1 text-xs font-medium text-white"
            on:input={(evt) => handleEditSongForm(evt, 'album')}
            value={songForm.album} />
        </div>
        <div class="flex items-center justify-between gap-4">
          <p class="w-24 text-xs font-medium text-white">가수 이름</p>
          <input
            type="text"
            class="min-h-6 w-full rounded bg-gray-700 px-2 py-1 text-xs font-medium text-white"
            on:input={(evt) => handleEditSongForm(evt, 'artist')}
            value={songForm.artist} />
        </div>
        <div class="flex items-center justify-between gap-4">
          <p class="w-24 text-xs font-medium text-white">발매 연도</p>
          <input
            type="text"
            inputmode="numeric"
            class="min-h-6 w-full rounded bg-gray-700 px-2 py-1 text-xs font-medium text-white"
            on:input={(evt) => handleEditSongForm(evt, 'year')}
            value={songForm.year} />
        </div>
        {#if songFormError.year}
          <span class="text-right text-[10px] text-red-500">유효하지 않은 연도입니다.</span>
        {/if}
      </div>
    </section>
  </div>
  <div class="mt-4 flex" slot="footer">
    <button
      class="my-2 w-full rounded-lg bg-gray-900 p-2 font-semibold text-white"
      on:click={handleEditSongDetail}>수정</button>
  </div>
</Modal>
