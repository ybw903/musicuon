export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1_000, 2_000, 4_000, 8_000, 16_000] as const

class AudioEqualizer {
  #filterNodes: BiquadFilterNode[]

  constructor(audioContext: AudioContext) {
    this.#filterNodes = EQ_FREQUENCIES.map((frequency, index) => {
      const filterNode = audioContext.createBiquadFilter()!
      filterNode.gain.value = 0

      if (index === 0) {
        filterNode.type = 'lowshelf'
      } else if (index === EQ_FREQUENCIES.length - 1) {
        filterNode.type = 'highshelf'
      } else {
        filterNode.type = 'peaking'
      }

      return filterNode
    })
  }

  onFilterGain(filterIndex: number, gain: number) {
    this.#filterNodes[filterIndex].gain.value = gain
  }

  connectFirstFilterNode(node: AudioNode) {
    this.#filterNodes.forEach((filterNode, idx, filterNodeList) => {
      if (idx === 0) {
        node.connect(filterNode)
      } else {
        filterNodeList[idx - 1].connect(filterNode)
      }
    })
  }

  connectLastFilterNode(node: AudioNode) {
    this.#filterNodes[this.#filterNodes.length - 1]?.connect(node)
  }
}

export default AudioEqualizer
