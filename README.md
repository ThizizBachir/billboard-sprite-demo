# Three.js Billboard Square - Technical Exercise

A Three.js implementation demonstrating two fundamental 3D rendering techniques: billboarding and screen-space size consistency.

## Overview

This project was created as a technical exercise to showcase camera-facing geometry and constant screen-space sizing in a 3D environment.

## Features Implemented

### 1. Billboard Effect (Camera-Facing Square)
The square mesh always faces the active camera, regardless of camera position or orientation. This is achieved by:
- Using Three.js's `lookAt()` method to continuously update the square's rotation
- Ensuring the square's normal vector always points toward Camera1
- Maintaining proper orientation even during camera animations

### 2. Fixed Apparent Size
The square maintains a constant screen size regardless of its distance from the camera. This compensates for perspective projection using:

**Scale Formula:**
```
scale = 2 × distance × tan(fov/2) × screenFraction
```

Where:
- `distance` = distance from camera to object
- `fov` = camera's vertical field of view (in radians)
- `screenFraction` = desired proportion of screen height (0.2 = 20%)

This ensures the object appears the same size to the user whether it's near or far.

## Interactive Features

- **Dual Camera System**: Switch between main camera and debug camera to observe the billboard effect
- **Camera Animations**: 
  - Rocking orbit motion to demonstrate consistent facing behavior
  - Zoom in/out animation to showcase size consistency
- **Visual Helpers**: Axis helpers, grid, and normal arrow for better spatial understanding
- **GUI Controls**: Interactive controls for all camera functions

## Technical Stack

- **Three.js** (r128) - 3D rendering library
- **OrbitControls** - Camera manipulation
- **lil-GUI** - Runtime controls interface



## Implementation Notes

The solution prioritizes:
- **Performance**: Calculations run per frame but are optimized
- **Clarity**: Clean code structure with explanatory comments
- **Flexibility**: Easy to adjust screen fraction and camera parameters
- **Demonstrability**: Multiple cameras and animations to verify behavior

