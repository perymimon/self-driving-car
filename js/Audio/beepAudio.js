export async function beep(frequency) {
    var audioCtx = new AudioContext()

    var osc = audioCtx.createOscillator()
    var envelope = audioCtx.createGain()


    osc.frequency.setValueAtTime(frequency, 0)
    osc.connect(envelope)
    osc.start()
    osc.stop(0.4)

    envelope.gain.value = 0 // volume
    // envelope.gain.exponentialRampToValueAtTime(1, 0.1)
    envelope.gain.linearRampToValueAtTime(1, 0.1)
    envelope.gain.linearRampToValueAtTime(0, 0.4)
    envelope.connect(audioCtx.destination)

    analyzer = audioCtx.createAnalyser()
    analyzer.fftSize = 2 ** 15
    envelope.connect(analyzer)

    let {resolve, promise} = Promise.withResolvers()
    osc.addEventListener('ended', resolve)
    return promise
}