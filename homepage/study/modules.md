### Primitives

1. **[point.js](https://github.com/perymimon/self-driving-car/blob/main/js/primitives/point.js)**
   A point in 2D or 3D space (`x`,`y`,`z`), with methods for calculating distances and transition.

2. **[segment.js](https://github.com/perymimon/self-driving-car/blob/main/js/primitives/segment.js)**
   Width 2 endpoints `Point`s define a line.
   Includes methods for detecting intersections and calculating length.

3. **[polygon.js](https://github.com/perymimon/self-driving-car/blob/main/js/primitives/polygon.js)**
   Width array of vertices `Point` define a polygon in 2D.
   Provides methods for calculating area, perimeter, and determining point and segment inclusion.

4. **[envelope.js](https://github.com/perymimon/self-driving-car/blob/main/js/primitives/envelope.js)**
   Define a `Polygon` around one `Segment`. Used to convert skeleton segments into 2D polygons.

### Utils


1. **[algebra-math-utils.js](https://github.com/perymimon/self-driving-car/blob/main/js/utils/algebra-math-utils.js)**
   Collection of utility functions deal with geometric calculations related to points, segments, and polygons in a 2D space
2. **[canvas-utils.js](https://github.com/perymimon/self-driving-car/blob/main/js/utils/canvas-utils.js)**
   Collection of utility functions provide helpful tools for manipulating canvas drawing contexts
3. **[codeflow-utils.js](https://github.com/perymimon/self-driving-car/blob/main/js/utils/codeflow-utils.js)**
   Collection of utility functions designed to streamline and enhance the code flow within the project
4. **[math-utils.js](https://github.com/perymimon/self-driving-car/blob/main/js/utils/math-utils.js)**
   Collection of utility functions that include numbers 
5. **[3d-utils.js](https://github.com/perymimon/self-driving-car/blob/main/js/utils/3d-utils.js)**
   Collection of utility functions that generate polygons in 3D

### Bases

1. **[dispatcher.js](https://github.com/perymimon/self-driving-car/blob/main/js/bases/dispatcher.js)**
   Extended class that provide implementing an observer pattern for event handling.

2. **[marking.js](https://github.com/perymimon/self-driving-car/blob/main/js/bases/marking.js)**
   Simple general base class for road markings, used
   for [Cross](https://github.com/perymimon/self-driving-car/blob/main/js/markings/cross.js), [Light](https://github.com/perymimon/self-driving-car/blob/main/js/markings/light.js), [Parking](https://github.com/perymimon/self-driving-car/blob/main/js/markings/parking.js), [Start](https://github.com/perymimon/self-driving-car/blob/main/js/markings/start.js), [Stop](https://github.com/perymimon/self-driving-car/blob/main/js/markings/stop.js), [Target](https://github.com/perymimon/self-driving-car/blob/main/js/markings/target.js),
   and [Yield](https://github.com/perymimon/self-driving-car/blob/main/js/markings/yield.js) marking.

3. **[markingEditor.js](https://github.com/perymimon/self-driving-car/blob/main/js/bases/markingEditor.js)**
   Extended class for specific road marking classes. designed to handle the creation and management of "markings" on a world  
   Used by [Cross](https://github.com/perymimon/self-driving-car/blob/main/js/markings/cross.js), [Light](https://github.com/perymimon/self-driving-car/blob/main/js/markings/light.js), [Parking](https://github.com/perymimon/self-driving-car/blob/main/js/markings/parking.js), [Start](https://github.com/perymimon/self-driving-car/blob/main/js/markings/start.js), [Stop](https://github.com/perymimon/self-driving-car/blob/main/js/markings/stop.js), [Target](https://github.com/perymimon/self-driving-car/blob/main/js/markings/target.js),
   and [Yield](https://github.com/perymimon/self-driving-car/blob/main/js/markings/yield.js).

### Controls

1. **[brainControls.js](https://github.com/perymimon/self-driving-car/blob/main/js/controls/brainControls.js)**
   Uses sensor data through a `Neural Network` to decide how the car should move. It processes inputs like distance to
   obstacles and adjusts steering, acceleration, or braking.

2. **[cameraControl.js](https://github.com/perymimon/self-driving-car/blob/main/js/controls/cameraControl.js)**
   Adjusts the camera's position, angle, and zoom level to keep the car centered during the simulation. This helps
   maintain visibility of the car's movements and surroundings.

3. **[dummyControls.js](https://github.com/perymimon/self-driving-car/blob/main/js/controls/dummyControls.js)**
   Implements simple car control for testing, allowing basic directional movement inputs.

4. **[keyboardControls.js](https://github.com/perymimon/self-driving-car/blob/main/js/controls/keyboardControls.js)**
   Allows manual car control through keyboard inputs.


### Audio

1. **[beepAudio.js](https://github.com/perymimon/self-driving-car/blob/main/js/Audio/beepAudio.js)**
   Handles beep sound effects to provide feedback during simulation events.

2. **[engineAudio.js](https://github.com/perymimon/self-driving-car/blob/main/js/Audio/engineAudio.js)**
   Manages engine sound simulation, adjusting pitch and volume according to car speed.
