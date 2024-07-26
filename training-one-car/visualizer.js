class Visualizer {
    static drawNetwork(ctx, network) {
        const margin = 50
        const left = margin
        const top = margin
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        // Visualizer.drawLevel(ctx, network.levels[0], left, top, width, height)
        const {levels} = network
        const levelsCount = levels.length
        const levelHeight = height / levelsCount

        var symbols = ['🠉','🠈','🠊','🠋']
        for (let i = levelsCount - 1; 0 <= i; i--) {
            const offset = levelsCount == 1 ? 0.5 : i / (levelsCount - 1)
            const levelTop = top + lerp(height - levelHeight, 0, offset)
            Visualizer.drawLevel(ctx, levels[i], left, levelTop, width, levelHeight,
                symbols
            )
            symbols = null
        }

    }

    static drawLevel(ctx, level, left, top, width, height, symbols) {
        const right = left + width
        const bottom = top + height
        const nodeRadius = 18

        const {inputs, outputs, weights, biases} = level

        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                const xOutput = Visualizer.#getNodeX(outputs, j, left, right)
                const xInput = Visualizer.#getNodeX(inputs, i, left, right)
                ctx.beginPath()
                ctx.moveTo(xInput, bottom)
                ctx.lineTo(xOutput, top)
                ctx.lineWidth = 2
                ctx.setLineDash([4, 4])
                ctx.strokeStyle = getRGBA(weights[i][j])
                ctx.stroke()
            }
        }

        for (let i = 0; i < inputs.length; i++) {
            const x = Visualizer.#getNodeX(inputs, i, left, right)
            clearCircle(ctx, x, bottom, nodeRadius)
            ctx.beginPath()
            ctx.arc(x, bottom, nodeRadius * 0.8, 0, 2 * Math.PI)
            ctx.fillStyle = getRGBA(inputs[i])
            ctx.fill()
        }

        for (let i = 0; i < outputs.length; i++) {
            const x = Visualizer.#getNodeX(outputs, i, left, right)

            clearCircle(ctx, x, top, nodeRadius)

            ctx.beginPath()
            ctx.arc(x, top, nodeRadius * 0.8, 0, 2 * Math.PI)
            ctx.fillStyle = getRGBA(outputs[i])
            ctx.fill()

            ctx.beginPath()
            ctx.arc(x, top, nodeRadius, 0, 2 * Math.PI)
            ctx.fillStyle = getRGBA(biases[i])
            ctx.setLineDash([7, 3])
            ctx.stroke()
            ctx.setLineDash([])

            if(symbols) {
                ctx.beginPath()
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillStyle = 'black'
                ctx.strokeStyle = 'white'
                ctx.font = `${nodeRadius * 1.4}px Arial`
                ctx.fillText(symbols[i],x, top )
                ctx.lineWidth = .5
                ctx.strokeText(symbols[i],x, top)
            }
        }


    }

    static #getNodeX(nodes, index, left, right) {
        const offset = nodes.length == 1 ? 0.5 : index / (nodes.length - 1)
        return lerp(left, right, offset)
    }
}