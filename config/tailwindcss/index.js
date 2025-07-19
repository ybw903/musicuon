/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './play-list/index.html',
    './src/**/*.{js,ts,jsx,tsx,svelte}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,svelte}'
  ],
  theme: {
    extend: {
      animation: {
        zoom: 'zoom 0.3s ease-in-out',
        fade: 'fade 0.2s ease-out'
      },
      keyframes: {
        zoom: {
          from: {
            transform: 'scale(0.95)'
          },
          to: { transform: 'scale(1)' }
        },
        fade: {
          from: {
            opacity: '0'
          },
          to: {
            opacity: '1'
          }
        }
      }
    }
  },
  plugins: []
}
