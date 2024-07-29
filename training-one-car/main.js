const carCanvas = document.querySelector('#carCanvas');
const  lanes = 5
carCanvas.width = lanes * 80;

const networkCanvas = document.querySelector('#networkCanvas');
networkCanvas.width = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, lanes);
// const car = new Car(road.getLaneCenter(1), 100, 30, 50,"AI",4)
const cars = generateCars(1)
var bestCar = cars[0]
var goodCars = [...cars]

if (localStorage.getItem('bestBrain')) {
    let bestBrain = JSON.parse(localStorage.getItem('bestBrain'));
    for (let car of cars) {
        let brain = structuredClone(bestBrain)
        car.brain = NeuralNetwork.mutate(brain, 0.1);
    }
    cars[0].brain = bestBrain
}


var traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -900, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -100, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(3), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(4), -400, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -700, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(4), -600, 30, 50, "DUMMY", 2),
]

animate()

function generateCars(N) {
    return Array.from(Array(N), i => new Car(road.getLaneCenter(1), 100, 30, 50, "AI", 4))
}

function save() {
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
}

function discard() {
    localStorage.removeItem('bestBrain')
}

function animate(time) {
    // ctx.clearRect(0, 0, canvas.width, canvas.height)
    const camera = {
        x: 0,
        y: -bestCar.y + carCanvas.height * 0.7
    }

    for (let [i, car] of traffic.entries()) {
        if (!(bestCar.y - car.y < -carCanvas.height)) continue
        let lance = random(0, lanes)
        let y = bestCar.y - carCanvas.height * 0.7 - random(0, 10) * 100
        let newCar = new Car(road.getLaneCenter(lance), y, 30, 50, "DUMMY", 2)
        traffic.splice(i, 1, newCar)
    }


    for (let car of traffic) {
        car.update(road.borders, [])
    }

    let farestCar = goodCars.reduce((best, car) => best.y > car.y ? car : best)
    for (let car of goodCars) {
        if (Math.abs(farestCar.y - car.y) > carCanvas.height) {
            car.damage = true
        } else {
            car.update(road.borders, traffic)
        }
    }
    goodCars = goodCars.filter(car=>!car.damage)


    let candidatesCars = goodCars.filter(car => Math.abs(car.y - farestCar.y) <= 100)
    bestCar = candidatesCars.reduce((best, car) => {
            let bestToMiddle = Math.abs(best.x - road.getLaneCenter(1))
            let carToMiddle = Math.abs(car.x - road.getLaneCenter(1))
            return bestToMiddle > carToMiddle ? car : best
        }
    )

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save()
    carCtx.translate(camera.x, camera.y)
    road.draw(carCtx)

    for (let car of traffic) {
        car.draw(carCtx, 'red')
    }

    carCtx.globalAlpha = 0.2

    for (let car of cars) {
        car.draw(carCtx, 'blue')
    }
    carCtx.globalAlpha = 1

    bestCar.draw(carCtx, 'blue', true)
    cars[0].draw(carCtx, 'orange', true)

    carCtx.restore()

    networkCtx.lineDashOffset = -time / 50
    Visualizer.drawNetwork(networkCtx, bestCar.brain)
    requestAnimationFrame(animate)
}