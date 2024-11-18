import NeuralNetwork from "../math/network.js";
import KeyboardControls from "./keyboardControls.js";

export default class BrainControls extends KeyboardControls {
    constructor(sensors, brain, mutation = 0.1) {
        super()
        this.sensors = sensors;
        const count = sensors.reduce((acc, b) => acc + b.sensorsCount, 0);
        brain ??= new NeuralNetwork([count, 6, 4]);
        this.brain = NeuralNetwork.mutate(brain, mutation);
        this.state = 'auto'
        this.gear(this.state)
    }
    gear(state = 'manual') {
        this.state = state
        if(state === 'manual'){
            super.addKeyboardListeners()
        }else{
            this.removeEventListeners()
        }
    }
    reading(){
        return this.sensors.map(sensor => sensor.readings).flat()
    }
    update() {
        let inputs =this.reading()
        const offsets = inputs.map(i=> i.offset)
        const outputs = NeuralNetwork.feedForward(offsets, this.brain)
        if(this.state === 'auto') {
            this.forward = outputs[0]
            this.left = outputs[1]
            this.right = outputs[2]
            this.reverse = outputs[3]
        }
    }
}