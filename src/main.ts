import './app.css'
import App from './App.svelte'
import { polyfill } from './polyfill'

polyfill()

const app = new App({
  target: document.getElementById('app')
})

export default app
