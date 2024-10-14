export default class Region {
    constructor(point, radius = 1000, threshold = 100) {
        this.threshold = threshold
        this.radius = radius
        this.setRegion(point, radius)
    }

    pointNearRegion(point, threshold) {
        let {x, y} = point
        let {left, right, top, bottom} = this

        let distance = Math.min(x - left, right - x, y - top, bottom - y)
        // if distance is negative it mean we out of threshold by a lot
        return distance < threshold
    }

    setRegion(point, radius) {
        this.left = point.x - radius
        this.right = point.x + radius
        this.top = point.y - radius
        this.bottom = point.y + radius
    }

    update(point) {
        if (!this.pointNearRegion(point, this.threshold)) return false
        this.setRegion(point, this.radius)
        return true
    }

    inside(point) {
        let {x, y} = point
        if (x < this.left) return false
        if (x > this.right) return false
        if (y < this.top) return false
        if (y > this.bottom) return false
        return true
    }

}
