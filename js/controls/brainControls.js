import Sensor from "../items/sensor.js";
import SensorCompass from "../items/sensorCompass.js";
import NeuralNetwork from "../math/neuralNetwork.js";
import KeyboardControls from "./keyboardControls.js";

export default class BrainControls extends KeyboardControls {

    constructor(car, brain, mutation = 0.1, proximitySensor = {}) {
        super()
        this.proximitySensor = new Sensor(car, {
            rayCount: 6, rayLength: 150,
            raySpread: Math.PI / 2, rayOffset: 0,
            ...proximitySensor
        })

        this.pathSensor = new SensorCompass(car)
        this.sensors = [this.proximitySensor, this.pathSensor]

        const count = this.sensors.reduce((acc, b) => acc + b.sensorsCount, 0);
        this.brain = brain? NeuralNetwork.mutate(brain, mutation): new NeuralNetwork([count, 6, 4]);
        if (brain.levels.at(0).inputs.length != count ) console.error('Brain input not matched sensor inputs')

        this.state = 'auto'
        this.gear(this.state)
    }
    toJSON(){
        var {proximitySensor, pathSensor,brain} = this
        return {proximitySensor, pathSensor,brain}
    }
    static FromJSON(car, json) {
        var {proximitySensor, pathSensor,brain} = json
        return  new BrainControls(car, brain, 0, proximitySensor )
    }

    gear(state = 'manual') {
        this.state = state
        if (state === 'manual') {
            super.addKeyboardListeners()
        } else {
            this.removeEventListeners()
        }
    }

    update(roadBorders, traffic = [], pathTracking = []) {
        this.proximitySensor.update(roadBorders, traffic)
        this.pathSensor.update(pathTracking)

        let offsets = this.sensors.map(sensor => sensor.readings).flat().map(input => input.offset)
        // console.table(offsets)
        const outputs = NeuralNetwork.feedForward(offsets, this.brain)
        if (this.state === 'auto') {
            this.forward = outputs[0]
            this.left = outputs[1]
            this.right = outputs[2]
            this.reverse = outputs[3]
        }
    }

    draw(ctx) {
        this.proximitySensor.draw(ctx)
        this.pathSensor.draw(ctx)
    }
}