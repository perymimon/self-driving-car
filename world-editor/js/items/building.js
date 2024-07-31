import {average, getFake3dPoint} from "../math/utils.js";
import Polygon from "../primitives/polygon.js";

export default class Building {

    constructor(poly, height) {
        this.base = poly
        this.height = height
    }

    draw(ctx, viewPoint) {
        let basePoints = this.base.points
        let topPoints = basePoints.map(p =>
                getFake3dPoint(p, viewPoint, this.height * .6)
            // add(p, scale(subtract(p, viewPoint), this.heightCoef))
        )
        const ceiling = new Polygon(topPoints)
        let len = basePoints.length
        let sides = []
        for (let i = 0; i < len; i++) {
            const nextI = (i + 1) % len
            const poly = new Polygon([
                basePoints[i], basePoints[nextI]
                , topPoints[nextI], topPoints[i]
            ])
            sides.push(poly)

        }

        let style = {fill: 'white', stroke: '#ccc'}

        sides
            .sort((a, b) =>
                b.distanceToPoint(viewPoint) -
                a.distanceToPoint(viewPoint)
            )


        const baseMidpoints = [
            average(this.base.points[0], this.base.points[1]),
            average(this.base.points[2], this.base.points[3])
        ];

        const topMidpoints = baseMidpoints.map((p) =>
            getFake3dPoint(p, viewPoint, this.height)
        );

        const roofPolys = [
            new Polygon([
                ceiling.points[0], ceiling.points[3],
                topMidpoints[1], topMidpoints[0]
            ]),
            new Polygon([
                ceiling.points[2], ceiling.points[1],
                topMidpoints[0], topMidpoints[1]
            ])
        ];


        roofPolys.sort(
            (a, b) =>
                b.distanceToPoint(viewPoint) -
                a.distanceToPoint(viewPoint)
        );
        this.base.draw(ctx, style);
        sides.forEach((side, i) => side.draw(ctx, style));
        ceiling.draw(ctx, {fill: 'white', stroke: 'white'});
        roofPolys.forEach(poly => poly.draw(ctx, {fill: "#D44", stroke: "#C44", lineWidth: 8, join: "round"}))
    }
}