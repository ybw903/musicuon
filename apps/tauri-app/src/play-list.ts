import '@musicuon/ui/index.css'
import PlayList from './PlayList.svelte'

const playList = new PlayList({
  target: document.getElementById('play-list')
})

export default playList
