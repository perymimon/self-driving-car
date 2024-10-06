import BrainVisualizer from "../js/visualizer/brain-visualizer.js";
import Car from "../js/items/Car.js";
import PrimitiveRoad from "../js/items/primitive-road.js"

const carCanvas = document.querySelector('#carCanvas');
const lanes = 5

carCanvas.width = lanes * 80;

const networkCanvas = document.querySelector('#networkCanvas');
networkCanvas.width = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new PrimitiveRoad(carCanvas.width / 2, carCanvas.width * 0.9, lanes);
const cars = generateCars(100)


var traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, {type: "DUMMY", maxSpeed: 3}),
    new Car(road.getLaneCenter(0), -300, 30, 50, {type: "DUMMY", maxSpeed: 3}),
    new Car(road.getLaneCenter(2), -300, 30, 50, {type: "DUMMY", maxSpeed: 3}),
    new Car(road.getLaneCenter(2), -500, 30, 50, {type: "DUMMY", maxSpeed: 3}),
    new Car(road.getLaneCenter(1), -500, 30, 50, {type: "DUMMY", maxSpeed: 3}),
    new Car(road.getLaneCenter(0), -900, 30, 50, {type: "DUMMY", maxSpeed: 3}),
    new Car(road.getLaneCenter(1), -700, 30, 50, {type: "DUMMY", maxSpeed: 3}),
    new Car(road.getLaneCenter(0), -100, 30, 50, {type: "DUMMY", maxSpeed: 3}),
    new Car(road.getLaneCenter(3), -300, 30, 50, {type: "DUMMY", maxSpeed: 3}),
    new Car(road.getLaneCenter(4), -400, 30, 50, {type: "DUMMY", maxSpeed: 3}),
    new Car(road.getLaneCenter(0), -700, 30, 50, {type: "DUMMY", maxSpeed: 3}),
    new Car(road.getLaneCenter(4), -600, 30, 50, {type: "DUMMY", maxSpeed: 3}),
]


function generateCars(N) {
    var savedBrainString = localStorage.getItem('bestBrain')
    if (savedBrainString) {
        var bestBrain = JSON.parse(savedBrainString);
    }
    var cars = Array(N).fill().map(() =>
        new Car(road.getLaneCenter(1), 100, 30, 50, {
            type: "AI", maxSpeed: 4, color: 'red', brain: bestBrain, mutation: 0.2
        })
    )
    if (bestBrain)
        cars[0].controls.brain = bestBrain
    return cars

}

globalThis.save = function save() {
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.controls.brain))
}
globalThis.discard = function discard() {
    localStorage.removeItem('bestBrain')
}
var goodCars = [...cars]
var bestCar = goodCars.at(0)

function animate(time) {
    // ctx.clearRect(0, 0, canvas.width, canvas.height)
    const camera = {
        x: 0,
        y: -bestCar.y + carCanvas.height * 0.7
    }

    // generate more traffic
    for (let [i, car] of traffic.entries()) {
        if (!(bestCar.y - car.y < -carCanvas.height)) continue
        let lance = random(0, lanes)
        let y = bestCar.y - carCanvas.height * 0.7 - random(0, 10) * 100
        let newCar = new Car(road.getLaneCenter(lance), y, 30, 50, "DUMMY", 0, 3)
        traffic.splice(i, 1, newCar)
    }


    for (let car of traffic) {
        car.update(road.borders, [])
    }
    goodCars.forEach(car => car.update(road.borders, traffic))
    goodCars = goodCars.filter(car => !car.damage).sort((a, b) => a.y - b.y)

    bestCar = goodCars.at(0)

    goodCars.forEach(car => {
        car.damage = Math.abs(bestCar.y - car.y) > carCanvas.height
    })

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save()
    carCtx.translate(camera.x, camera.y)
    road.draw(carCtx)

    for (let car of traffic) {
        car.draw(carCtx)
    }

    carCtx.globalAlpha = 0.2

    for (let car of cars) {
        car.draw(carCtx)
    }
    carCtx.globalAlpha = 1

    // cars[0].draw(carCtx, {color: 'orange', drawSensor: true})
    bestCar.draw(carCtx, {color: 'yellow', drawSensor: true})
    cars.at(0).draw(carCtx, {color: 'green', drawSensor: true})

    carCtx.restore()

    networkCtx.lineDashOffset = -time / 50
    BrainVisualizer.drawNetwork(networkCtx, bestCar.controls.brain)
    requestAnimationFrame(animate)
}

animate()
