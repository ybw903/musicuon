import '@musicuon/ui/index.css'
import AudioPlayer from './AudioPlayer.svelte'

const audioPlayer = new AudioPlayer({
  target: document.getElementById('audio-player')
})

export default audioPlayer
