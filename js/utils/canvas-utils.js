export function clearCircle(ctx, x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.clip();
    ctx.clearRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
}

export function getRandomColor() {
    let hue = 290 + Math.random() * 260;
    return `hsl(${hue}, 100%, 60%)`;
}

export function getProperty(ctx, property) {
    if (String(property).startsWith('--')) {
        var {canvas} = ctx;
        return getComputedStyle(canvas).getPropertyValue(property).trim();
    }
    return property;
}

export function style(ctx, {
    dash, stroke = 'blue', lineWidth = 2, fill = "rgba(0,0,255,0.3)",
    join = 'miter', cap
} = {}) {
    ctx.fillStyle = getProperty(ctx, fill)
    ctx.strokeStyle = getProperty(ctx, stroke)
    ctx.lineWidth = getProperty(ctx, lineWidth)
    ctx.lineJoin = getProperty(ctx, join)
    ctx.lineCap = getProperty(ctx, cap)
    if (dash)
        ctx.setLineDash(getProperty(ctx, dash))

    return function revert(){
        if(dash)
            ctx.setLineDash([])
    }
}

export function drawText(ctx, text, x, y, s = {}) {
    var rev = style(s)
    let {fontSize = 30, strokeStyle} = s
    let {font = `${fontSize}px Arial`} = s
    ctx.beginPath();
    ctx.font = font;
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, x, y);
    if (strokeStyle) ctx.strokeText(text, x, y);
    rev()
}

export function drawLine(ctx, pointStart, pointEnd, s = {}) {
    var rev = style(ctx, s)
    ctx.beginPath()
    ctx.moveTo(pointStart.x, pointStart.y)
    ctx.lineTo(pointEnd.x, pointEnd.y)
    ctx.stroke()
    rev()
}

export function drawCircle(ctx, x, y, r, s = {}) {
    var rev = style(ctx, s)
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fill()
    rev()
}

export function mixColors(color1, color2, weight) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const r = Math.round(c1.r * (1 - weight) + c2.r * weight).toString(16)
    const g = Math.round(c1.g * (1 - weight) + c2.g * weight).toString(16)
    const b = Math.round(c1.b * (1 - weight) + c2.b * weight).toString(16)
    const a = Math.round(c1.a * (1 - weight) + c2.a * weight).toString(16)

    // return `rgba(${r}, ${g}, ${b}, ${a})`;
    return `#${r}${g}${b}${a}`;
}

export function hexToRgb(hex) {
    var pairs = hex.replace('#', '').length / 2
    const bigint = parseInt(hex.replace("#", ""), 16);
    return {
        r: (bigint >> ((pairs - 1) * 8)) & 255,
        g: (bigint >> ((pairs - 2) * 8)) & 255,
        b: (bigint >> ((pairs - 3) * 8)) & 255,
        a: pairs == 4 ? ((bigint) >> 0) & 255 : 255,
    };
}


