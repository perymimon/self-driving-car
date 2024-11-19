// 0.test if point close to region or no region
// 0.1 yes, build the region around the point
// 0.2 yes, clear the last segments
// 1. test if geometries collection is changed
// 2. test if result is null or empty
// 1.1,2.1 yes, rebuild result by filter the point and save the result
// 1.2,2.2 no, return the last result

export default class Region {
    constructor(squareRadius = 1000, threshold = 100, point = null) {
        this.threshold = threshold
        this.squareRadius = squareRadius
        point && this.defineBoundary(point, squareRadius)
        this.result = null
        this.geometries = null
    }

    isPointClose(point) {
        let {x, y} = point
        let {left, right, top, bottom} = this

        let proximity = Math.min(x - left, right - x, y - top, bottom - y)
        //* if distance is negative it mean we out of threshold by a lot *//
        return proximity < this.threshold
    }

    defineBoundary(point) {
        this.left = point.x - this.squareRadius
        this.right = point.x + this.squareRadius
        this.top = point.y - this.squareRadius
        this.bottom = point.y + this.squareRadius
        this.result = null
    }

    updateBoundaryIfClose(point) {
        if(this.isPointClose(point, this.threshold)) {
            this.defineBoundary(point, this.squareRadius)
        }
        return this
    }

    containsPoint(point) {
        let {x, y} = point
        if (x < this.left) return false
        if (x > this.right) return false
        if (y < this.top) return false
        if (y > this.bottom) return false
        return true
    }
    geometriesWithin(geometries, pointsGetter) {
        // 1. Test if the geometries collection has changed
        if (geometries !== this.geometries) {
            this.geometries = geometries;
            this.result = null;
        }
        if(!this.result){
            this.result = geometries.filter(geometry => {
                const points = pointsGetter(geometry);
                return points.some(point => this.containsPoint(point));
            });
        }
        return this.result;
    }
    geometriesCloseTo(point, geometries, pointsGetter) {
        return this.updateBoundaryIfClose(point)
            .geometriesWithin(geometries, pointsGetter)

    }

}
