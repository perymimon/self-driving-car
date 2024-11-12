export function getRGBA(value) {
    const a = .1 + Math.abs(value)
    const R = value < 0 ? 0 : 255
    const G = R
    const B = value > 0 ? 0 : 255
    return `rgba(${[R, G, B, a].join()})`
}

export function clearCircle(ctx, x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.clip();
    ctx.clearRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
}

export function getRandomColor(){
    let hue = 290 + Math.random() * 260;
    return `hsl(${hue}, 100%, 60%)`;
}
export function style(ctx,{stroke = 'blue', lineWidth = 2, fill = "rgba(0,0,255,0.3)", join='miter'}={}){
    ctx.fillStyle = fill
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.lineJoin = join
}

export function drawText(ctx, text, x, y, style = {}){
    let {font = '30px Arial', color = 'black' } = style
    ctx.beginPath();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, x, y);
}
export function drawCircle(ctx, x, y,r, s = {}){
    style(ctx,s)
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fill()

}
