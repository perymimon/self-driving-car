# Race Overview (race-overview.md)

## Introduction

After exploring the "Training" phase, we now proceed to build our first simulated complex roads environment
using `world-editor`. This part of the project introduces a tools to create dynamic track maps, place
road signs, and prepare the scene for car training and after that racing. 
The race environment involves more complex scenarios compared to the initial training phase.
Once we understand how to build the world using `world-editor`, we proceed to utilize `race` to
conduct the actual race simulation.

## World Editor Overview

The `world-editor` page is a tool for constructing complex tracks used by the our train neural-network car. At the core
of this editor is the `world` object, which acts as the main container for all elements in the environment, such as
roads, intersections, checkpoints, and obstacles.

### Key Modules and Functions

#### 1. **World Object**

The `world` object is the main data structure that holds all components of the race environment. It is either loaded
from saved data (`localStorage`) or initialized from scratch using the `Editor` constructur that you see in your right.

```javascript
var world = worldInfo ? World.Load(worldInfo) : new World();
```

If a previously saved environment exists, it is loaded and parsed; otherwise, a new `World` instance is created.

#### 2. **Environment Setup**

The environment setup is managed through several editors that interact with the `world` object. These editors allow
users to add different types of elements to the environment, such as roads, parking spots, and intersections.

- **GraphEditor**: Base and default editor, responsible for managing road networks and intersections.
- **StartEditor, StopEditor**: Set where the car should start and where it should arrive.
- **CrossEditor, ParkingEditor, YieldEditor, LightEditor**: These manage specific features like parking spots, yield
  signs, and traffic lights.

```javascript
import GraphEditor from "../js/editors/graphEditor.js";
import StopEditor from "../js/editors/stopEditor.js";
import CrossEditor from "../js/editors/crossEditor.js";
// More editors are imported similarly
```

Each editor modifies the `world` object by adding or updating specific items, and gives visual feedback on how these
items will be placed.

#### 3. **Canvas Setup and User Interaction**

The world environment is visualized using an HTML canvas, which is dynamically set up based on the available screen
size.

```javascript
var rect = editorCanvas.parentNode.getBoundingClientRect();
editorCanvas.width = rect.width;
editorCanvas.height = rect.height - editorCanvas.previousElementSibling.offsetHeight;
```

The canvas is initialized to fit the available space, and all elements in the `world` are drawn on it.

Users can click and drag on the canvas to add or modify elements. The functions `#handleMouseMove()`
and `#handleMouseDown()` handle the core interaction for placing or removing elements:

- **`#handleMouseMove(evt)`**: Shows a preview of where an element can be placed by projecting the mouse position onto
  nearby segments.
- **`#handleMouseDown(evt)`**: Left-click adds an element; right-click removes an existing element under the mouse.

```javascript
#handleMouseMove(evt)
{
    this.mouse = this.viewport.getMouse(evt, true);
    let seg = getNearestSegment(
        this.mouse,
        this.segmentsInView,
        10 * this.viewport.zoom
    );
    if (seg) {
        const proj = seg.projectPoint(this.mouse);
        if (inRange(0, 1, proj.offset)) {
            this.intent = this.createMarking(
                proj.point,
                seg.directionVector()
            );
        }
        return true;
    }
    this.intent = null;
}

#handleMouseDown(evt)
{
    if (evt.button == 0) { // left click
        if (this.intent) {
            this.markings.push(this.intent);
            this.intent = null;
        }
    }
    if (evt.button == 2) { // right click
        for (let i = 0; i < this.markings.length; i++) {
            let poly = this.markings[i].poly;
            if (poly.containsPoint(this.mouse)) {
                this.markings.splice(i, 1);
                return;
            }
        }
    }
}
```

#### 4. **Parsing Roads**

The `parseRoads()` function converts raw road data (e.g., from OpenStreetMap) into a format that can be used by
the `world` object.

```javascript
import {parseRoads} from "../js/math/osm.js";

const roads = parseRoads(rawOSMData); // open street map
world.graph.points = points
world.graph.segments = segments // roads
```

This toy function try to save time by importing real road data from open steet map. but for now the process is kind of
havy so it good just for tiny bit region area

## Moving On: the traning the car again

// to be continue
