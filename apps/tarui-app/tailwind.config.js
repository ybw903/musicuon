import { join } from 'path'
import sharedConfig from '../../tailwind.config'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [sharedConfig],
  content: [
    join(require.resolve('@musicuon/ui'), '../**/*.{html,js,svelte,ts}'),
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,svelte}'
  ]
}
