import type { Meta, StoryObj } from '@storybook/svelte'

import PlayList from '../lib/components/PlayList.svelte'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Example/PlayList',
  component: PlayList,
  argTypes: {}
} satisfies Meta<PlayList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {}
}
