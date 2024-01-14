import type { Meta, StoryObj } from '@storybook/svelte'

import AudioPlayer from '../lib/AudioPlayer.svelte'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Example/AudioPlayer',
  component: AudioPlayer,
  //   tags: ['autodocs'],
  argTypes: {
    // backgroundColor: { control: 'color' },
    // size: {
    //   control: { type: 'select' },
    //   options: ['small', 'medium', 'large']
    // }
  }
} satisfies Meta<AudioPlayer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {}
}
