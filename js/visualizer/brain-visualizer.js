import {lerp} from "../utils/algebra-math-utils.js"
import {clearCircle, drawCircle, drawLine, drawText, getProperty} from "../utils/canvas-utils.js";
import {clamp} from "../utils/math-utils.js";

export default class BrainVisualizer {
    static drawNetwork(ctx, network) {
        const margin = 25
        const left = margin
        const top = margin
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        // BrainVisualizer.drawLevel(ctx, network.levels[0], left, top, width, height)
        const {levels} = network
        const levelsCount = levels.length
        const levelHeight = height / levelsCount

        var symbols = ['🠉', '🠈', '🠊', '🠋']
        for (let i = levelsCount - 1; 0 <= i; i--) {
            const offset = levelsCount == 1 ? 0.5 : i / (levelsCount - 1)
            const levelTop = top + lerp(height - levelHeight, 0, offset)
            BrainVisualizer.drawLevel(ctx, levels[i], left, levelTop, width, levelHeight, symbols)
            symbols = null
        }

    }

    static drawLevel(ctx, level, left, top, width, height, symbols) {
        const right = left + width
        const bottom = top + height
        const nodeRadius = 18

        const {inputs, outputs, weights, biases} = level
        const getColor = colorFactory(ctx, '--color-neuron-negative', '--color-neuron-positive')

        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                const xOutput = BrainVisualizer.#getNodeX(outputs, j, left, right)
                const xInput = BrainVisualizer.#getNodeX(inputs, i, left, right)
                var start = {x: xInput, y: bottom}, end = {x: xOutput, y: top}

                drawLine(ctx, start, end, {
                    lineWidth: 2, dash: [2, 4], stroke: getColor(weights[i][j])
                })
            }
        }

        for (let i = 0; i < inputs.length; i++) {
            const x = BrainVisualizer.#getNodeX(inputs, i, left, right)
            clearCircle(ctx, x, bottom, nodeRadius)
            drawCircle(ctx, x, bottom, nodeRadius * 0.8, {fill: getColor(inputs[i])})

        }

        for (let i = 0; i < outputs.length; i++) {
            const x = BrainVisualizer.#getNodeX(outputs, i, left, right)
            clearCircle(ctx, x, top, nodeRadius)
            drawCircle(ctx, x, top, nodeRadius * 0.8, {fill: getColor(outputs[i])})
            drawCircle(ctx, x, top, nodeRadius, {fill: getColor(biases[i]), dash: [7, 3]})
            ctx.setLineDash([])

            if (symbols) {
                drawText(ctx, symbols[i], x, top, {
                    fillStyle: 'black', fontSize: nodeRadius * 1.4, lineWidth: .5
                })
            }
        }
    }

    static #getNodeX(nodes, index, left, right) {
        const offset = nodes.length == 1 ? 0.5 : index / (nodes.length - 1)
        return lerp(left, right, offset)
    }
}


// function getColor(ctx, value) {
//     var colorNegative = hexToRgb(getProperty(ctx, '--color-neuron-negative'))
//     var colorPositive = hexToRgb(getProperty(ctx, '--color-neuron-positive'))
//
//     const a = (.1 + Math.abs(value)).toFixed(2)
//     const {r, g, b} = value > 0 ? colorPositive : colorNegative
//     return `rgba(${r},${g},${b},${a})`
// }

function colorFactory(ctx, negative, positive) {
    var colorNegative = getProperty(ctx, negative)
    var colorPositive = getProperty(ctx, positive)

    return function getColor(value) {
        const a = Math.round(clamp((.1 + Math.abs(value)) , -1, 1) * 255)
        const color = value > 0 ? colorPositive : colorNegative
        // return `rgba(${r},${g},${b},${a})`
        return color + a.toString(16)
    }
}