import './app.css'
import App from './App.svelte'
import { polyfill } from './polyfill'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)
polyfill()

const app = new App({
  target: document.getElementById('app')
})

export default app
