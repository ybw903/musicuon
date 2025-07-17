class AudioVisualizer {
  #canvas: HTMLCanvasElement
  #canvasCtx: CanvasRenderingContext2D
  #analyserNode: AnalyserNode
  #shouldStopDraw = false

  constructor(canvas: HTMLCanvasElement, analyserNode?: AnalyserNode) {
    this.#canvas = canvas
    const canvasCtx = this.#canvas.getContext('2d')

    if (!canvasCtx) throw new Error("can't get Canvas Context")
    this.#canvasCtx = canvasCtx

    if (!analyserNode) throw new Error("can't get Analyser Node")
    this.#analyserNode = analyserNode
  }

  draw() {
    if (this.#shouldStopDraw) {
      // TODO: use theme color
      this.#canvasCtx.fillStyle = '#1f2937'
      this.#canvasCtx.fillRect(0, 0, this.#canvas.width, this.#canvas.height)
      return
    }

    const drawVisual = requestAnimationFrame(this.draw.bind(this))

    const bufferLength = this.#analyserNode.frequencyBinCount
    const freq = new Uint8Array(bufferLength)
    this.#analyserNode.getByteFrequencyData(freq)

    this.#canvasCtx.fillStyle = '#1f2937'
    this.#canvasCtx.fillRect(0, 0, this.#canvas.width, this.#canvas.height)

    this.#canvasCtx.lineWidth = 2
    this.#canvasCtx.strokeStyle = '#fff'
    this.#canvasCtx.beginPath()

    const sliceWidth = this.#canvas.width / bufferLength

    let x = 0
    for (let i = 0; i < bufferLength; i++) {
      const v = freq[i] / 256.0
      const y = v * this.#canvas.height

      if (i === 0) {
        this.#canvasCtx.moveTo(x, y)
      } else {
        this.#canvasCtx.lineTo(x, y)
      }

      x += sliceWidth
    }

    this.#canvasCtx.stroke()
  }

  startDraw() {
    this.#shouldStopDraw = false
    this.draw()
  }

  stopDraw() {
    this.#shouldStopDraw = true
  }
}

export default AudioVisualizer
