import sharedConfig from '@musicuon/tailwindcss-config'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [sharedConfig],
  content: [...sharedConfig.content]
}
