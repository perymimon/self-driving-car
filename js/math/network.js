import {lerp} from "../utils/algebra-math-utils.js"

export default class NeuralNetwork {
    constructor(neuronsPerLevel = []) {
        this.levels = []
        for (let i = 0; i < neuronsPerLevel.length - 1; i++) {
            var inputCount = neuronsPerLevel[i]
            var outputCount = neuronsPerLevel[i + 1]
            this.levels.push(
                new Level(inputCount, outputCount)
            );
        }
    }

    static feedForward(givenInputs, network) {
        var outputs = givenInputs
        for (let i = 0; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i])
        }
        return outputs
    }

    static mutate(brain, amount = 1) {
        let network = structuredClone(brain)
        for (let level of network.levels) {
            level.biases = level.biases.map(b => lerp(b, Math.random() * 2 - 1, amount))

            const {weights} = level

            for (let i = 0; i < weights.length; i++) {
                for (let j = 0; j < weights[i].length; j++) {
                    const w = weights[i][j]
                    weights[i][j] = lerp(w, Math.random() * 2 - 1, amount)
                }
            }


        }
        return network
    }
}

class Level {
    constructor(inputCount, outputCount) {
        this.inputs = Array(inputCount).fill(1)
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        this.weights = []
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        Level.#randomize(this)
    }

    static #randomize(level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1
            }
        }

        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1
        }
    }

    static feedForward(givenInput, level) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInput[i] ?? 0
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0
            for (let j = 0; j < level.inputs.length; j++)
                sum += level.inputs[j] * level.weights[j][i]

            level.outputs[i] = Number(sum > level.biases[i]) // 0 or 1
        }

        return level.outputs
    }
}