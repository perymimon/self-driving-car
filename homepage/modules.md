### Primitives

1. **[envelope.js](https://github.com/perymimon/self-driving-car/blob/main/js/primitives/envelope.js)**\
   Takes a `Segment` and creates a `Polygon` around it. Used to convert skeleton segments into 2D polygons.

2. **[point.js](https://github.com/perymimon/self-driving-car/blob/main/js/primitives/point.js)**\
   Takes `x` and `y` coordinates to represent a point in 2D space, with methods for calculating distances and transformations.

3. **[polygon.js](https://github.com/perymimon/self-driving-car/blob/main/js/primitives/polygon.js)**\
   Takes an array of `Point` objects representing vertices. Provides methods for calculating area, perimeter, and determining point inclusion.

4. **[segment.js](https://github.com/perymimon/self-driving-car/blob/main/js/primitives/segment.js)**\
   Takes two `Point` objects to define the endpoints of the segment. Includes methods for detecting intersections and calculating length.

### Audio

1. **[beepAudio.js](https://github.com/perymimon/self-driving-car/blob/main/js/Audio/beepAudio.js)**\
   Handles beep sound effects to provide feedback during simulation events.

2. **[engineAudio.js](https://github.com/perymimon/self-driving-car/blob/main/js/Audio/engineAudio.js)**\
   Manages engine sound simulation, adjusting pitch and volume according to car speed.

### Bases

1. **[dispatcher.js](https://github.com/perymimon/self-driving-car/blob/main/js/bases/dispatcher.js)**\
   Manages communication between components, implementing an observer pattern for event handling.

2. **[marking.js](https://github.com/perymimon/self-driving-car/blob/main/js/bases/marking.js)**\
   Simple general base class for road markings, used for [Cross](https://github.com/perymimon/self-driving-car/blob/main/js/markings/cross.js), [Light](https://github.com/perymimon/self-driving-car/blob/main/js/markings/light.js), [Parking](https://github.com/perymimon/self-driving-car/blob/main/js/markings/parking.js), [Start](https://github.com/perymimon/self-driving-car/blob/main/js/markings/start.js), [Stop](https://github.com/perymimon/self-driving-car/blob/main/js/markings/stop.js), [Target](https://github.com/perymimon/self-driving-car/blob/main/js/markings/target.js), and [Yield](https://github.com/perymimon/self-driving-car/blob/main/js/markings/yield.js) marking.

3. **[markingEditor.js](https://github.com/perymimon/self-driving-car/blob/main/js/bases/markingEditor.js)**\
   Gets legal segments and registers to mouse `move` and `down` events. Generates a temporary marking on the nearest legal segment. When the mouse is pressed down, it adds the marking to a list of markings. Used by [Cross](https://github.com/perymimon/self-driving-car/blob/main/js/markings/cross.js), [Light](https://github.com/perymimon/self-driving-car/blob/main/js/markings/light.js), [Parking](https://github.com/perymimon/self-driving-car/blob/main/js/markings/parking.js), [Start](https://github.com/perymimon/self-driving-car/blob/main/js/markings/start.js), [Stop](https://github.com/perymimon/self-driving-car/blob/main/js/markings/stop.js), [Target](https://github.com/perymimon/self-driving-car/blob/main/js/markings/target.js), and [Yield](https://github.com/perymimon/self-driving-car/blob/main/js/markings/yield.js).

### Controls

1. **[brainControls.js](https://github.com/perymimon/self-driving-car/blob/main/js/controls/brainControls.js)**\
   Uses sensor data through a `Neural Network` to decide how the car should move. It processes inputs like distance to obstacles and adjusts steering, acceleration, or braking.

2. **[cameraControl.js](https://github.com/perymimon/self-driving-car/blob/main/js/controls/cameraControl.js)**\
   Adjusts the camera's position, angle, and zoom level to keep the car centered during the simulation. This helps maintain visibility of the car's movements and surroundings.

3. **[dummyControls.js](https://github.com/perymimon/self-driving-car/blob/main/js/controls/dummyControls.js)**\
   Implements simple car control for testing, allowing basic directional movement inputs.

4. **[keyboardControls.js](https://github.com/perymimon/self-driving-car/blob/main/js/controls/keyboardControls.js)**\
   Allows manual car control through keyboard inputs.

### Utils

1. **[helpers.js](https://github.com/perymimon/self-driving-car/blob/main/js/utils/helpers.js)**\
   Contains utility functions such as clamping values, random number generation, and common calculations used throughout the project.

2. **[mathUtils.js](https://github.com/perymimon/self-driving-car/blob/main/js/utils/mathUtils.js)**\
   Provides specialized mathematical operations like angle conversions, distance calculations, and geometric transformations.

3. **[domUtils.js](https://github.com/perymimon/self-driving-car/blob/main/js/utils/domUtils.js)**\
   Manages DOM-related actions, including creating HTML elements, adding event listeners, and simplifying interactions with the page.
