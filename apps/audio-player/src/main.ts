import './app.css'
import App from './App.svelte'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

const app = new App({
  target: document.getElementById('app')
})

export default app
