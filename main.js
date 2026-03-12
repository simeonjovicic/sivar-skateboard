import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Setup Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// gsap ScrollTrigger configuration with lenis
gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------
// THREE.JS SETUP
// ----------------------------------------------------
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
// Optional: add a subtle fog
scene.fog = new THREE.FogExp2(0x050505, 0.05);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xff9900, 2);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00ccff, 1.5);
pointLight2.position.set(-5, -5, 5);
scene.add(pointLight2);

// Load Texture
const textureLoader = new THREE.TextureLoader();
const woodTexture = textureLoader.load('assets/texture.png');
// Make texture look good
woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;
woodTexture.repeat.set(1, 4);
woodTexture.colorSpace = THREE.SRGBColorSpace;

const material = new THREE.MeshStandardMaterial({ 
    map: woodTexture,
    roughness: 0.6,
    metalness: 0.1
});

// Create Skateboard Deck
const boardGeometry = new THREE.BoxGeometry(2, 0.1, 8); // approximate shape
// Add some segments to bend it later if we want
const board = new THREE.Mesh(boardGeometry, material);
scene.add(board);

// Create Ring (Torus) - hidden initially
const ringGeometry = new THREE.TorusGeometry(1, 0.3, 32, 100);
const ring = new THREE.Mesh(ringGeometry, material);
// scale it down to zero initially
ring.scale.set(0, 0, 0);
scene.add(ring);

// Initial Camera Position
camera.position.z = 10;
board.rotation.x = Math.PI / 16;
board.rotation.y = Math.PI / 8;

// Animation Loop
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    // normalized coordinates -1 to +1
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);
    
    // Add subtle continuous floating movement to objects
    const time = performance.now() * 0.001;
    
    // board bobbing
    board.position.y = Math.sin(time) * 0.2;
    // slight interaction with mouse
    board.rotation.x += (mouseX * 0.1 - board.rotation.x) * 0.05;
    board.rotation.z += (mouseY * 0.1 - board.rotation.z) * 0.05;

    // ring rotation
    ring.rotation.y += 0.01;
    ring.rotation.x += 0.005;

    renderer.render(scene, camera);
}
animate();

// ----------------------------------------------------
// GSAP SCROLL ANIMATIONS
// ----------------------------------------------------

// 1. Skateboard Flips on scroll to Story Sector
gsap.to(board.rotation, {
    scrollTrigger: {
        trigger: ".story-section",
        start: "top bottom",
        end: "bottom center",
        scrub: 1, // smooth scrubbing
    },
    y: Math.PI * 2, // 360 flip
    z: -Math.PI / 4,
    x: Math.PI / 2
});

gsap.to(board.position, {
    scrollTrigger: {
        trigger: ".story-section",
        start: "top bottom",
        end: "center center",
        scrub: 1,
    },
    x: 3, // move to the right
    z: -2
});

// 2. Skateboard transforms to Ring
const transformTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".transform-section",
        start: "top bottom",
        end: "bottom center",
        scrub: 1,
    }
});

// Shrink/fade the board
transformTl.to(board.scale, { x: 0, y: 0, z: 0, duration: 1 }, 0)
// Grow/show the ring
transformTl.to(ring.scale, { x: 3, y: 3, z: 3, duration: 1 }, 0.2)
// Move the ring to center
transformTl.to(ring.position, { x: 0, y: 0, z: 0, duration: 1 }, 0.2);

// Parallax text
gsap.utils.toArray('.section-title').forEach(title => {
    gsap.to(title, {
        scrollTrigger: {
            trigger: title,
            start: "top 90%",
            end: "bottom 20%",
            scrub: 1
        },
        x: 50,
        opacity: 1
    });
});

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
