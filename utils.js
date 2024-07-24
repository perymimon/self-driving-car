function lerp(A, B, t) {
    return A + (B - A) * t
}

function getIntersection(A, B, C, D) {
    /*
     Ix = Ax + (Bx-Ax)t = Cx + (Dx-Cx)u
     Iy = Ay + (By-Ay)y = Cy + (Dy-Cy)u

     Ax+ (Bx-Ax)t = Cx + (Dx-Cx)u | -Cx
     Ax-Cx + (Bx-Ax)t = (Dx-Cx)u

     Ay+ (By-Ay)t = Cy + (Dy-Cy)u | -Cy
     Ay-Cy + (By-Ay)t = (Dy-Cy)u  | * (Dx-Cx)

     (Dx-Cx)(Ay-Cy) + (Dx-Cx)(By-Ay)t = (Dy-Cy)(Dx-Cx)u
     (Dx-Cx)(Ay-Cy) + (Dx-Cx)(By-Ay)t =(Dy-Cy)( Ax-Cx + (Bx-Ax)t )
     (Dx-Cx)(Ay-Cy) + (Dx-Cx)(By-Ay)t =(Dy-Cy)( Ax-Cx ) + (Dy-Cy)(Bx-Ax)t | - (Dy-Cy)( Ax-Cx )
                                                                        | (Dx-Cx)(By-Ay)t
     (Dx-Cx)(Ay-Cy) - (Dy-Cy)( Ax-Cx ) = (Dy-Cy)(Bx-Ax)t - (Dx-Cx)(By-Ay)t

     t = (Dx-Cx)(Ay-Cy) - (Dy-Cy)( Ax-Cx ) / (Dy-Cy)(Bx-Ax) - (Dx-Cx)(By-Ay)

    */

    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x)
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y)
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y)
    if (bottom != 0) {
        const t = tTop / bottom
        const u = uTop / bottom
        if ((t >= 0 && t <= 1) && (u >= 0 && u <= 1))
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t
            }
    }

    return null


}

function polysIntersect(poly1, poly2) {
    for (let i = 0; i < poly1.length; i++)
        for (let j = 0; j < poly2.length; j++) {
            let A = poly1[i]
            let B = poly1[(i + 1) % poly1.length]
            let C = poly2[j]
            let D = poly2[(j + 1) % poly2.length]

            const touch = getIntersection(A, B, C, D)
            if (touch) return true
        }
    return false
}

function getRGBA(value) {
    const a = Math.abs(value)
    const R = value < 0 ? 0 : 255
    const G = R
    const B = value > 0 ? 0 : 255
    return `rgba(${[R, G, B, a].join()})`
}

function clearCircle(ctx, x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.clip();
    ctx.clearRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
}

function random(min,max,integer = true){
    let result = Math.random() * (max - min+ 1) + min;
    if(integer)
        return Math.floor(result)
    return result
}