export default class AudioEngine {

    constructor() {
        var audioCtx = new AudioContext();

        var osc = audioCtx.createOscillator()
        osc.frequency.setValueAtTime(200, 0)
        osc.start()

        var masterGain = osc.connect(audioCtx.createGain())
        masterGain.gain.value = 0.2 // volume
        masterGain.connect(audioCtx.destination)

        var lfo = audioCtx.createOscillator()
        lfo.frequency.setValueAtTime(30, 0)
        lfo.start()

        var mod = lfo.connect(audioCtx.createGain())
        mod.gain.value = 60
        mod.connect(osc.frequency)


        this.volume = masterGain.gain
        this.frequency = osc.frequency

    }

    setVolume(percent) {
        this.volume.value = percent
    }

    setPitch(percent) {
        this.frequency.setValueAtTime(percent * 200 + 100, 0)
    }
}