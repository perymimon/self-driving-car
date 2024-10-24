# Race.js Overview

After successfully building and training the self-driving car model, it's time to see it in action through `race.js`.
This file handles the task of putting our trained model into the simulation environment, allowing it to navigate the
track based on the parameters it learned during training. In this overview, we will walk through the key modules and the
important aspects of `race.js`, focusing on the new functionality introduced.

## Race.js Flow

The main goal of `race.js` is to control the car autonomously using the neural network trained in the previous steps.
Let's break down the important modules involved in the process:

### 1. Importing the Trained Model

The trained model's weights are imported to control the car. `race.js` reads the saved parameters and constructs the
neural network that we use during training. Here's a code snippet illustrating how the weights are loaded:

```javascript
const model = NeuralNetwork.loadFromJSON(savedModelJSON);
```

This line is key, as it restores the trained network that was created during the training phase.

### 2. Rendering the Race Environment

The rendering of the car's racing environment is quite similar to the one used during training. However, the primary
distinction here is that we use the trained network instead of manual control. The environment includes the car, track
boundaries, sensors, and checkpoints that help assess the model's performance.

- **Simulation Loop**: The core rendering function is responsible for updating the car's position every frame, based on
  predictions made by the trained neural network. This is done through:

  ```javascript
  function animateRace() {
    car.update(predictedSteeringAngle);
    renderRaceEnvironment();
    requestAnimationFrame(animateRace);
  }
  ```

  Here, `predictedSteeringAngle` is obtained by feeding sensor data through the network.

### 3. Sensor Data Processing

Sensors play a critical role in providing the car with a sense of its surroundings. These sensors detect distances from
track boundaries, helping the model determine the safest path.

The function for collecting sensor data remains largely the same as in `training.js`. However, in `race.js`, instead of
training the model with this data, we now use it to make a prediction:

```javascript
const sensorInputs = car.getSensorData();
const predictedSteeringAngle = model.predict(sensorInputs);
```

This prediction (`predictedSteeringAngle`) is used to determine the car's movement during the race.

### 4. Collision Detection

The car uses collision detection to ensure it stays within the track boundaries. This module is primarily used for
feedback, enabling us to observe when the car hits obstacles or moves off-track. This feedback allows us to understand
the effectiveness of our model:

```javascript
if (car.hasCollided()) {
    console.log("Car has crashed!");
}
```

In `race.js`, collision detection is simplified to provide an easy-to-read indicator of the car's success in navigating
the course.

### 5. Performance Metrics

`race.js` also includes metrics that help evaluate the trained model's performance in real-time. Some metrics tracked
include:

- **Distance covered**: To gauge how far the car has gone without crashing.
- **Time to complete**: To see how quickly the car can navigate the track.
- **Checkpoints**: Used to assess how efficiently the car can reach various points on the track.

These metrics are implemented with minimal overhead to ensure that they don't interfere with the simulation:

```javascript
const distance = car.getDistanceCovered();
const checkpointsReached = car.getCheckpointsReached();
```

## Code Links

- [Neural Network Loading Code](https://github.com/perymimon/self-driving-car/blob/main/js/neural-network.js): Refer to
  the function `loadFromJSON()` to see how the trained model's weights are restored.
- [Car Update Code](https://github.com/perymimon/self-driving-car/blob/main/js/car.js): Details of how the car is
  updated with predicted steering angles can be found here.

## Conclusion

`race.js` is essentially the practical implementation of all the training that has been done earlier. The car, which
previously learned to drive through trial and error, now applies that knowledge in a real scenario, navigating the track
autonomously. The primary task of `race.js` is to integrate the trained model and make the car react accordingly in
real-time, creating a seamless transition from theory to practice.
