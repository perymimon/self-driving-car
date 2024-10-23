import NeuralNetwork from "../math/network.js";

export default class BrainControls {
    constructor(brain, mutation = 0.1) {
        if(mutation == 0)
            this.brain = brain
        else {
            this.brain = NeuralNetwork.mutate(brain, mutation);
        }

        this.forward = false
        this.left = false
        this.right = false
        this.reverse = false
    }
    update(inputs){
        const outputs = NeuralNetwork.feedForward(inputs, this.brain)
        this.forward = outputs[0]
        this.left = outputs[1]
        this.right = outputs[2]
        this.reverse = outputs[3]
    }
}