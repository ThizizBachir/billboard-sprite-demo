import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import * as GUI from 'lilGUI';
import * as THREE from 'three';

function loadTexture(path) {
    const loader = new THREE.TextureLoader();
    return new Promise((resolve, reject) => {
        loader.load(path, (texture) => resolve(texture), undefined, (err) => reject(err));
    });
}

class application{

    constructor(texture){
        this.construcSceneandRenderer();

        // Main camera - this is where the square will always face
        this.Camera1= this.construct_camera(5, 5, 5);
        this.Camera_Controls1 = new OrbitControls(this.Camera1, this.canvas);
        
        // Helper to visualize Camera1 when using Camera2
        this.camHelper = new THREE.CameraHelper(this.Camera1);
        this.scene.add(this.camHelper);
        this.camHelper.visible = false;
        
        this.proxycamIndex = 1;
        this.Cam = this.Camera1;

        // Secondary camera for debugging/viewing
        this.Camera2= this.construct_camera(20, 0, 0);
        this.Camera_Controls2 = new OrbitControls(this.Camera2, this.canvas);

        this.square = this.constructsquare(texture);
        this.scene.add(this.square)
        this.construct_Gui();
    }

    construcSceneandRenderer(){
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xAAAAAA);
        
        // Basic scene helpers for orientation
        const axesHelper = new THREE.AxesHelper(22);
        this.scene.add(axesHelper);
        
        const GridHelpersize = 200;
        const Gridhelperdivisions = 200;
        const gridHelper = new THREE.GridHelper(GridHelpersize, Gridhelperdivisions);
        this.scene.add(gridHelper);

        const GridHelpersize2 = 200;
        const Gridhelperdivisions2 = 20;
        const gridHelper2 = new THREE.GridHelper(GridHelpersize2, Gridhelperdivisions2, 0x000000, 0x000000);
        this.scene.add(gridHelper2);

        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.canvas = this.renderer.domElement;
        document.body.appendChild(this.canvas);
    }

    construct_camera(x, y, z){
        const fov = 45;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.1;
        const far = 100;
        const Camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        Camera.position.set(x, y, z);
        Camera.lookAt(0, 0, 0);
        return Camera;
    }

    constructsquare(texture){
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        
        // Red arrow showing the plane's normal direction
        const normal = new THREE.Vector3(0, 0, 1);
        const arrowLength = 0.5;
        const arrowColor = 0xff0000;
        const arrow = new THREE.ArrowHelper(normal, new THREE.Vector3(0, 0, 0), arrowLength, arrowColor);

        const planeGroup = new THREE.Group();
        planeGroup.add(plane);
        planeGroup.add(arrow);

        return planeGroup;
    }

    construct_Gui(){
        this.gui = new GUI.GUI();
        this.gui.add(document, 'title');
        this.gui.add(this, '_switchCam').name("switchCam");
        this.gui.add(this, '_startCameraRockOrbit').name("start Camera Rock");
        this.gui.add(this, '_stopCameraRockOrbit').name("stop Camera Rock");
        this.gui.add(this, '_startCameraZoom').name("start Camera Zoom");
        this.gui.add(this, '_stopCameraZoom').name("stop Camera Zoom");
    }

    _switchCam(){
        if(this.Cam === this.Camera1){
            this.camHelper.visible = true;
            this.Cam = this.Camera2;
            this.Camera_Controls2.enabled = true;
            this.Camera_Controls1.enabled = false;
        } else {
            this.camHelper.visible = false;
            this.Cam = this.Camera1;
            this.Camera_Controls2.enabled = false;
            this.Camera_Controls1.enabled = true;
        }
    }

    update(deltaTime){
        // ANSWER TO QUESTION 2: Fixed apparent size
        // Calculate how much to scale the square based on distance
        // The idea is: the farther away, the bigger it needs to be to look the same size
        const distance = this.Camera1.position.distanceTo(this.square.position);
        const fov = THREE.MathUtils.degToRad(this.Camera1.fov);
        const screenFraction = 0.2; // Square takes up 20% of screen height
        const scale = 2 * distance * Math.tan(fov / 2) * screenFraction;
        this.square.scale.set(scale, scale, scale);

        // ANSWER TO QUESTION 1: Billboard effect (always face camera)
        // This makes the square rotate to face Camera1 at all times
        this.square.lookAt(this.Camera1.position);

        // Optional camera animation - rocking motion
        if (this._rockingOrbit) {
            const elapsed = performance.now() / 1000 - this._rockStartTime;
            const angle = this._rockAmplitude * Math.sin(2 * Math.PI * this._rockSpeed * elapsed);

            this.Camera1.position.x = Math.sin(angle) * this._rockRadius;
            this.Camera1.position.z = Math.cos(angle) * this._rockRadius;
            this.Camera1.position.y = this._rockHeight;
            this.Camera1.lookAt(0, 0, 0);
        }

        // Optional camera animation - zoom in/out
        if (this._zooming) {
            const elapsed = performance.now() / 1000 - this._zoomStartTime;
            const factor = Math.sin(2 * Math.PI * this._zoomSpeed * elapsed);

            const offset = this._initialCamOffset.clone().normalize().multiplyScalar(
                this._initialCamOffset.length() + factor * this._zoomAmplitude
            );
            this.Camera1.position.copy(this._zoomTarget.clone().add(offset));
            this.Camera1.lookAt(this._zoomTarget);
        }

        this.renderer.render(this.scene, this.Cam);
    }

    _startCameraRockOrbit(radius = 5, amplitudeDeg = 50, speed = 0.5) {
        this._stopCameraZoom();
        const camPos = this.Camera1.position.clone();
        this._rockRadius = radius;
        this._rockAmplitude = THREE.MathUtils.degToRad(amplitudeDeg);
        this._rockSpeed = speed;
        this._rockStartTime = performance.now() / 1000;
        this._rockHeight = camPos.y;
        this._rockingOrbit = true;
    }

    _stopCameraRockOrbit() {
        this._rockingOrbit = false;
    }

    _startCameraZoom(amplitude = 2, speed = 0.5, target = new THREE.Vector3(0, 0, 0)) {
        this._stopCameraRockOrbit();
        this._zoomTarget = target.clone();
        this._initialCamOffset = this.Camera1.position.clone().sub(this._zoomTarget);
        this._zoomAmplitude = amplitude;
        this._zoomSpeed = speed;
        this._zoomStartTime = performance.now() / 1000;
        this._zooming = true;
    }

    _stopCameraZoom() {
        this._zooming = false;
    }
}

const texture = await loadTexture('Resources/texture.png');
const app = new application(texture);
let prevTime = 0;

function render(time) {
    time *= 0.001; 
    let delta = time - prevTime;
    prevTime = time;
    app.update(delta);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);