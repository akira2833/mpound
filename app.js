/**
 * HANTAL 3D Automotive Electro-Deposition (Three.js WebGL Engine)
 * Bulletproof Array-Safe Material Assignment & Error-Free Kinematics Loop
 */

// Easing Kinematics
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function smoothstep(min, max, value) {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
}

// Application State
const state = {
    animating: true,
    completed: false,
    startTime: null,
    duration: 11000,
    progress: 0,
    activeTarget: 'door',
    scrollProgress: 0,
    mouseX: 0,
    mouseY: 0
};

// Responsive Mobile 3D Camera Zoom Calculator
function getResponsiveCameraConfig() {
    const w = window.innerWidth;
    if (w < 600) {
        return { camZ: 35.0, camY: 6.2 };
    } else if (w < 900) {
        return { camZ: 27.0, camY: 5.4 };
    }
    return { camZ: 22.0, camY: 4.8 };
}

// UI Elements
const container = document.getElementById('threeCanvasContainer');
const centerPlayOverlay = document.getElementById('centerPlayOverlay');
const centerPlayBtn = document.getElementById('centerPlayBtn');

const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');

const timelineNodes = [
    document.getElementById('stepNode1'),
    document.getElementById('stepNode2'),
    document.getElementById('stepNode3'),
    document.getElementById('stepNode4'),
    document.getElementById('stepNode5')
];

function updateTimelineHighlight(p) {
    let activeIndex = 0;
    if (p <= 0.20) activeIndex = 0;
    else if (p <= 0.40) activeIndex = 1;
    else if (p <= 0.60) activeIndex = 2;
    else if (p <= 0.80) activeIndex = 3;
    else activeIndex = 4;

    timelineNodes.forEach((node, idx) => {
        if (!node) return;
        if (idx === activeIndex) node.classList.add('active');
        else node.classList.remove('active');
    });
}

// Accordion Toggle Interactivity
const accordionItems = document.querySelectorAll('.accordion-item');
accordionItems.forEach(item => {
    item.addEventListener('click', () => {
        accordionItems.forEach(otherItem => {
            if (otherItem !== item) otherItem.classList.remove('active');
        });
        item.classList.toggle('active');
    });
});

// Text Reveal Character Split & Scroll Color Transformation Engine
const revealTextEl = document.getElementById('revealText');
let revealChars = [];

if (revealTextEl) {
    const rawText = revealTextEl.textContent.trim();
    revealTextEl.innerHTML = '';
    
    // Split into individual character spans
    for (let i = 0; i < rawText.length; i++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'reveal-char';
        charSpan.textContent = rawText[i];
        revealTextEl.appendChild(charSpan);
        revealChars.push(charSpan);
    }
}

function updateTextRevealOnScroll() {
    if (!revealTextEl || revealChars.length === 0) return;

    const rect = revealTextEl.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Calculate reveal progress based on element position relative to viewport
    const startPoint = windowH * 0.85;
    const endPoint = windowH * 0.25;

    const currentPos = rect.top;
    let progress = (startPoint - currentPos) / (startPoint - endPoint);
    progress = Math.min(1, Math.max(0, progress));

    const activeIndex = Math.floor(progress * revealChars.length);

    revealChars.forEach((char, idx) => {
        if (idx <= activeIndex) {
            char.classList.add('active');
        } else {
            char.classList.remove('active');
        }
    });
}

// Mouse Drag-to-Scroll Interactivity for Horizontal Cards Track
const cardsTrack = document.querySelector('.horizontal-cards-track');
if (cardsTrack) {
    let isDown = false;
    let startX;
    let scrollLeft;

    cardsTrack.addEventListener('mousedown', (e) => {
        isDown = true;
        cardsTrack.classList.add('active-drag');
        startX = e.pageX - cardsTrack.offsetLeft;
        scrollLeft = cardsTrack.scrollLeft;
    });

    cardsTrack.addEventListener('mouseleave', () => {
        isDown = false;
        cardsTrack.classList.remove('active-drag');
    });

    cardsTrack.addEventListener('mouseup', () => {
        isDown = false;
        cardsTrack.classList.remove('active-drag');
    });

    cardsTrack.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - cardsTrack.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        cardsTrack.scrollLeft = scrollLeft - walk;
    });
}

// Window Scroll & Mouse Parallax Listeners
window.addEventListener('scroll', () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0) {
        state.scrollProgress = Math.min(1, Math.max(0, window.scrollY / totalScroll));
    }
    updateTextRevealOnScroll();
});

window.addEventListener('mousemove', (e) => {
    state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    state.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ==========================================================================
// Three.js 3D WebGL Setup
// ==========================================================================
let scene, camera, renderer, controls;
let doorGroup, rawSteelDoorMesh, coatedDoorMesh;
let tankBoxGroup, liquidVolumeMesh, waveSurfaceMesh, waveGeometry;
let conveyorBeamMesh, trolleyMesh, cableMesh, clampMesh;
let clippingPlaneAbove, clippingPlaneBelow;
let keySpotLight, rimSpotLight;
let factoryBackgroundGroup;

// Strategy B Extras: Electro-Magic Particle Flux & Live Telemetry HUD
let sparkLinesGroup, shockwaveRipples = [], holoCalloutGroup, cathodicParticleGroup;
let telemetryTextSprite;

// Materials
let globalRawSteelMat, globalCoatedPaintMat;

// 3D Tank Box Precision Dimensions
const TANK_WIDTH = 9.6;
const TANK_HEIGHT = 4.8;
const TANK_DEPTH = 4.0;
const TANK_BASE_Y = -3.8;
const POOL_SURFACE_Y = TANK_BASE_Y + TANK_HEIGHT * 0.75; // -0.2 Y Level
const OVERHEAD_RAIL_Y = 7.2;

function initThreeJS() {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const initialConfig = getResponsiveCameraConfig();

    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x18181b);
    scene.fog = new THREE.FogExp2(0x18181b, 0.016);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, initialConfig.camY, initialConfig.camZ);

    // 2. WebGL Renderer with Soft Shadow Map
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);

    // 3. OrbitControls with 360 Auto-Rotation
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.target.set(0, -0.4, 0);
    controls.update();

    // 4. DRAMATIC AUTOMOTIVE STUDIO SPOTLIGHTING SETUP
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.60);
    scene.add(ambientLight);

    keySpotLight = new THREE.SpotLight(0xffffff, 2.4);
    keySpotLight.position.set(14, 26, 18);
    keySpotLight.angle = Math.PI / 4;
    keySpotLight.penumbra = 0.5;
    keySpotLight.castShadow = true;
    keySpotLight.shadow.mapSize.width = 2048;
    keySpotLight.shadow.mapSize.height = 2048;
    keySpotLight.shadow.bias = -0.0001;
    scene.add(keySpotLight);

    rimSpotLight = new THREE.SpotLight(0x71717a, 1.6);
    rimSpotLight.position.set(-16, 15, -14);
    rimSpotLight.angle = Math.PI / 3;
    rimSpotLight.penumbra = 0.8;
    scene.add(rimSpotLight);

    const fillLight = new THREE.DirectionalLight(0x3f3f46, 0.5);
    fillLight.position.set(0, -10, 10);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x09090b, 0.4);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    // 5. Build Studio Floor & Metallic Grey Overhead Crane Rail
    buildStudioEnvironment();

    // 6. Build High-Tech Automated Factory Background Architecture
    buildFactoryArchitecturalBackground();

    // 7. STRATEGY A: MeshPhysicalMaterial Depth Attenuation Dip Tank & Circulation Pipes
    buildPrecisionIndustrialTankBox();

    // 8. Build 5X Upscaled SketchUp 3D Car Door Assembly (+20 X-Axis Shift)
    build3DCarDoorAssembly();

    // 9. STRATEGY B: Build Electro-Magic Particle Flux & Real-Time Telemetry HUD
    buildHighVoltageElectricSparks();
    build3DImpactShockwaveRipples();
    build3DHolographicCallouts();
    buildCathodicParticleFluxField();

    // Responsive Resize Handler
    window.addEventListener('resize', onWindowResize);
}

// Helper to safely apply clipping planes to single materials or material arrays
function applyClippingPlanes(object, planes) {
    if (!object) return;
    object.traverse((child) => {
        if (child && child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                    if (mat) mat.clippingPlanes = planes;
                });
            } else {
                child.material.clippingPlanes = planes;
            }
        }
    });
}

// -------------------------------------------------------------
// CATHODIC PARTICLE FLUX ENGINE ✨
// -------------------------------------------------------------
function buildCathodicParticleFluxField() {
    cathodicParticleGroup = new THREE.Group();
    const particleCount = 250;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    const initialPos = new Float32Array(particleCount * 3);

    const minX = -TANK_WIDTH / 2 + 0.6;
    const maxX = TANK_WIDTH / 2 - 0.6;
    const minY = TANK_BASE_Y + 0.4;
    const maxY = POOL_SURFACE_Y - 0.2;
    const minZ = -TANK_DEPTH / 2 + 0.6;
    const maxZ = TANK_DEPTH / 2 - 0.6;

    for (let i = 0; i < particleCount; i++) {
        const px = minX + Math.random() * (maxX - minX);
        const py = minY + Math.random() * (maxY - minY);
        const pz = minZ + Math.random() * (maxZ - minZ);

        pos[i * 3] = px;
        pos[i * 3 + 1] = py;
        pos[i * 3 + 2] = pz;

        initialPos[i * 3] = px;
        initialPos[i * 3 + 1] = py;
        initialPos[i * 3 + 2] = pz;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.userData = { initialPos, minX, maxX, minY, maxY, minZ, maxZ };

    const mat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.12,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geo, mat);
    cathodicParticleGroup.add(particles);
    scene.add(cathodicParticleGroup);
}

function updateCathodicParticleFlux(doorX, doorY, isSubmerged) {
    if (!cathodicParticleGroup) return;
    const points = cathodicParticleGroup.children[0];
    if (!points) return;

    const pos = points.geometry.attributes.position;
    const { initialPos, minX, maxX, minY, maxY, minZ, maxZ } = points.geometry.userData;
    const count = pos.count;

    for (let i = 0; i < count; i++) {
        let px = pos.getX(i);
        let py = pos.getY(i);
        let pz = pos.getZ(i);

        if (isSubmerged) {
            const dx = doorX - px;
            const dy = doorY - py;
            const dz = 0 - pz;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < 4.5 && dist > 0.1) {
                px += (dx / dist) * 0.05;
                py += (dy / dist) * 0.05;
                pz += (dz / dist) * 0.05;
            }

            if (dist <= 0.4) {
                px = minX + Math.random() * (maxX - minX);
                py = minY + Math.random() * (maxY - minY);
                pz = minZ + Math.random() * (maxZ - minZ);
            }
        } else {
            px = initialPos[i * 3];
            py = initialPos[i * 3 + 1];
            pz = initialPos[i * 3 + 2];
        }

        px = Math.max(minX, Math.min(maxX, px));
        py = Math.max(minY, Math.min(maxY, py));
        pz = Math.max(minZ, Math.min(maxZ, pz));

        pos.setXYZ(i, px, py, pz);
    }
    pos.needsUpdate = true;
}

// CYBERNETIC BACKGROUND HOLOGRAPHIC PARTICLE DOOR & GRID SYSTEM 🌌
let cyberHoloDoorGroup = null;
let cyberParticlesGeometry = null;
let cyberParticleInitialPositions = null;
let cyberParticleMeshList = [];

function sampleVerticesFromObject(object, sampleCount) {
    const vertices = [];
    object.traverse((child) => {
        if (child.isMesh && child.geometry) {
            const geo = child.geometry.isBufferGeometry ? child.geometry : new THREE.BufferGeometry().fromGeometry(child.geometry);
            const posAttr = geo.attributes.position;
            if (posAttr) {
                const worldMatrix = child.matrixWorld;
                for (let i = 0; i < posAttr.count; i += Math.max(1, Math.floor(posAttr.count / 300))) {
                    const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
                    v.applyMatrix4(worldMatrix);
                    vertices.push(v);
                }
            }
        }
    });

    const sampledPositions = new Float32Array(sampleCount * 3);
    if (vertices.length === 0) return sampledPositions;

    for (let i = 0; i < sampleCount; i++) {
        const srcV = vertices[i % vertices.length];
        sampledPositions[i * 3] = srcV.x + (Math.random() - 0.5) * 0.08;
        sampledPositions[i * 3 + 1] = srcV.y + (Math.random() - 0.5) * 0.08;
        sampledPositions[i * 3 + 2] = srcV.z + (Math.random() - 0.5) * 0.08;
    }
    return sampledPositions;
}

function buildCyberneticBackgroundHoloDoor() {
    cyberHoloDoorGroup = new THREE.Group();
    // Position on upper-left background behind the hero typography statement
    cyberHoloDoorGroup.position.set(-10.0, 4.8, -8.0);
    cyberHoloDoorGroup.rotation.y = Math.PI / 4;
    cyberHoloDoorGroup.scale.set(1.8, 1.8, 1.8);

    // Create Cyber Floor Grid Matrix
    const gridHelper = new THREE.GridHelper(70, 45, 0x38bdf8, 0x1e293b);
    gridHelper.position.set(0, -3.9, -10);
    if (gridHelper.material) {
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.35;
    }
    scene.add(gridHelper);

    scene.add(cyberHoloDoorGroup);
}

function createRealModelParticleDoor(sketchupModelScene) {
    if (!cyberHoloDoorGroup) return;

    // Clear old placeholder objects
    while (cyberHoloDoorGroup.children.length > 0) {
        cyberHoloDoorGroup.remove(cyberHoloDoorGroup.children[0]);
    }

    // 1. High-Density Vertices Particle Sampling directly from 3D DAE Car Door!
    const sampleCount = 4500;
    const rawVertices = [];

    sketchupModelScene.traverse((child) => {
        if (child.isMesh && child.geometry) {
            const pos = child.geometry.attributes.position;
            if (pos) {
                for (let i = 0; i < pos.count; i++) {
                    const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
                    v.applyMatrix4(child.matrixWorld);
                    rawVertices.push(v);
                }
            }
        }
    });

    if (rawVertices.length === 0) return;

    // Center and scale sampled door vertices
    const box = new THREE.Box3();
    rawVertices.forEach(v => box.expandByPoint(v));
    const center = box.getCenter(new THREE.Vector3());

    const positions = new Float32Array(sampleCount * 3);
    cyberParticleInitialPositions = new Float32Array(sampleCount * 3);

    for (let i = 0; i < sampleCount; i++) {
        const srcV = rawVertices[i % rawVertices.length];
        const px = (srcV.x - center.x) * 2.2;
        const py = (srcV.y - center.y) * 2.2;
        const pz = (srcV.z - center.z) * 2.2;

        positions[i * 3] = px;
        positions[i * 3 + 1] = py;
        positions[i * 3 + 2] = pz;

        cyberParticleInitialPositions[i * 3] = px;
        cyberParticleInitialPositions[i * 3 + 1] = py;
        cyberParticleInitialPositions[i * 3 + 2] = pz;
    }

    cyberParticlesGeometry = new THREE.BufferGeometry();
    cyberParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const cyberParticleMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.15,
        transparent: true,
        opacity: 0.90,
        blending: THREE.AdditiveBlending
    });

    const particlePoints = new THREE.Points(cyberParticlesGeometry, cyberParticleMat);
    cyberHoloDoorGroup.add(particlePoints);

    // 2. Add Wireframe Cyber Hologram Version of Real DAE Door Mesh
    const wireHoloGroup = sketchupModelScene.clone(true);
    wireHoloGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
                color: 0x0284c7,
                wireframe: true,
                transparent: true,
                opacity: 0.35
            });
        }
    });
    wireHoloGroup.position.set(-center.x * 2.2, -center.y * 2.2, -center.z * 2.2);
    wireHoloGroup.scale.set(2.2, 2.2, 2.2);
    cyberHoloDoorGroup.add(wireHoloGroup);
}

function updateCyberHoloDoor(timeSec) {
    if (!cyberHoloDoorGroup || !cyberParticlesGeometry) return;

    // Slow futuristic 3D rotation & floating hover
    cyberHoloDoorGroup.rotation.y = Math.sin(timeSec * 0.3) * 0.25;
    cyberHoloDoorGroup.rotation.x = Math.cos(timeSec * 0.2) * 0.10;
    cyberHoloDoorGroup.position.y = 6.0 + Math.sin(timeSec * 0.8) * 0.35;

    // Pulsing cyber particle wave effect
    const pos = cyberParticlesGeometry.attributes.position;
    const count = pos.count;

    for (let i = 0; i < count; i++) {
        const ix = cyberParticleInitialPositions[i * 3];
        const iy = cyberParticleInitialPositions[i * 3 + 1];
        const iz = cyberParticleInitialPositions[i * 3 + 2];

        // Wave distortion
        const wave = Math.sin(timeSec * 2.5 + ix * 1.5 + iy * 2.0) * 0.12;
        pos.setXYZ(i, ix + wave, iy + Math.cos(timeSec * 2.0 + iz) * 0.10, iz + wave * 0.8);
    }
    pos.needsUpdate = true;
}

// -------------------------------------------------------------
// HIGH-TECH AUTOMATED FACTORY BACKGROUND ARCHITECTURE 🏭
// -------------------------------------------------------------
function buildFactoryArchitecturalBackground() {
    factoryBackgroundGroup = new THREE.Group();
    factoryBackgroundGroup.position.set(0, 0, -14);

    const steelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.8,
        roughness: 0.3
    });

    const whiteTrussMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.3,
        roughness: 0.2
    });

    const cyanTubeLightMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8
    });

    const trussLength = 60;
    const topBarGeo = new THREE.BoxGeometry(trussLength, 0.25, 0.25);
    
    const topBeam1 = new THREE.Mesh(topBarGeo, whiteTrussMat);
    topBeam1.position.set(0, 11.5, 0);
    factoryBackgroundGroup.add(topBeam1);

    const topBeam2 = new THREE.Mesh(topBarGeo, whiteTrussMat);
    topBeam2.position.set(0, 10.2, 0);
    factoryBackgroundGroup.add(topBeam2);

    for (let x = -28; x <= 28; x += 4) {
        const braceGeo = new THREE.BoxGeometry(0.12, 1.8, 0.12);
        const braceLeft = new THREE.Mesh(braceGeo, steelMat);
        braceLeft.position.set(x + 1.0, 10.85, 0);
        braceLeft.rotation.z = Math.PI / 4;
        factoryBackgroundGroup.add(braceLeft);

        const braceRight = new THREE.Mesh(braceGeo, steelMat);
        braceRight.position.set(x + 1.0, 10.85, 0);
        braceRight.rotation.z = -Math.PI / 4;
        factoryBackgroundGroup.add(braceRight);
    }

    const colGeo = new THREE.BoxGeometry(0.8, 16, 0.8);
    const colLeft = new THREE.Mesh(colGeo, steelMat);
    colLeft.position.set(-22, 2.8, 0);
    factoryBackgroundGroup.add(colLeft);

    const colRight = new THREE.Mesh(colGeo, steelMat);
    colRight.position.set(22, 2.8, 0);
    factoryBackgroundGroup.add(colRight);

    const pipeGeo = new THREE.CylinderGeometry(0.35, 0.35, trussLength, 24);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipeMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.9,
        roughness: 0.15
    });

    const duct1 = new THREE.Mesh(pipeGeo, pipeMat);
    duct1.position.set(0, 8.8, -1.2);
    factoryBackgroundGroup.add(duct1);

    for (let x = -26; x <= 26; x += 6) {
        const ringGeo = new THREE.TorusGeometry(0.38, 0.04, 16, 32);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(x, 8.8, -1.2);
        factoryBackgroundGroup.add(ringMesh);
    }

    for (let x = -20; x <= 20; x += 10) {
        const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.5, 16);
        tubeGeo.rotateZ(Math.PI / 2);
        const glowTubeMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x38bdf8,
            emissiveIntensity: 1.8
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, glowTubeMat);
        tubeMesh.position.set(x, 5.5, -1.5);
        factoryBackgroundGroup.add(tubeMesh);

        // Tube light source casting cyan light downward
        const tubeLight = new THREE.PointLight(0x38bdf8, 0.6, 12, 2);
        tubeLight.position.set(x, 5.2, -1.0);
        factoryBackgroundGroup.add(tubeLight);

        const bracketGeo = new THREE.BoxGeometry(4.8, 0.18, 0.12);
        const bracketMesh = new THREE.Mesh(bracketGeo, steelMat);
        bracketMesh.position.set(x, 5.5, -1.6);
        factoryBackgroundGroup.add(bracketMesh);
    }

    for (let x = -18; x <= 18; x += 12) {
        const lampShadeGeo = new THREE.CylinderGeometry(0.6, 1.2, 0.6, 24, 1, true);
        const lampMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.DoubleSide, metalness: 0.8 });
        const lampMesh = new THREE.Mesh(lampShadeGeo, lampMat);
        lampMesh.position.set(x, 9.6, -0.5);
        factoryBackgroundGroup.add(lampMesh);

        // Emissive warm bulb inside the lamp shade
        const bulbGeo = new THREE.SphereGeometry(0.22, 16, 16);
        const bulbMat = new THREE.MeshStandardMaterial({
            color: 0xfff4e0,
            emissive: 0xfbbf24,
            emissiveIntensity: 2.5
        });
        const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
        bulbMesh.position.set(x, 9.35, -0.5);
        factoryBackgroundGroup.add(bulbMesh);

        // Warm PointLight from each lamp
        const lampLight = new THREE.PointLight(0xfbbf24, 1.2, 18, 2);
        lampLight.position.set(x, 9.3, -0.5);
        lampLight.castShadow = false;
        factoryBackgroundGroup.add(lampLight);

        const cordGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
        const cordMesh = new THREE.Mesh(cordGeo, steelMat);
        cordMesh.position.set(x, 10.0, -0.5);
        factoryBackgroundGroup.add(cordMesh);
    }

    scene.add(factoryBackgroundGroup);
}

// -------------------------------------------------------------
// INFINITE DARK SLATE STUDIO FLOOR & METALLIC GREY OVERHEAD CRANE BEAM
// -------------------------------------------------------------
function buildStudioEnvironment() {
    const floorGeo = new THREE.PlaneGeometry(140, 140);
    floorGeo.rotateX(-Math.PI / 2);

    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.75,
        metalness: 0.2
    });

    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = TANK_BASE_Y - 0.02;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const trackMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.2 });
    const trackGeo = new THREE.BoxGeometry(32, 0.12, 0.22);
    
    const trackFront = new THREE.Mesh(trackGeo, trackMat);
    trackFront.position.set(0, TANK_BASE_Y + 0.06, 2.6);
    scene.add(trackFront);

    const trackBack = new THREE.Mesh(trackGeo, trackMat);
    trackBack.position.set(0, TANK_BASE_Y + 0.06, -2.6);
    scene.add(trackBack);

    const beamGeo = new THREE.BoxGeometry(36, 0.28, 0.35);
    const beamMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.25,
        metalness: 0.85
    });
    conveyorBeamMesh = new THREE.Mesh(beamGeo, beamMat);
    conveyorBeamMesh.position.set(0, OVERHEAD_RAIL_Y, 0);
    conveyorBeamMesh.castShadow = true;
    scene.add(conveyorBeamMesh);

    // Vertical Gantry Support Columns connecting Overhead Rail to Floor
    const pillarHeight = OVERHEAD_RAIL_Y - TANK_BASE_Y;
    const gantryColGeo = new THREE.BoxGeometry(0.6, pillarHeight, 0.6);
    
    const leftPillar = new THREE.Mesh(gantryColGeo, beamMat);
    leftPillar.position.set(-15, TANK_BASE_Y + pillarHeight / 2, 0);
    leftPillar.castShadow = true;
    scene.add(leftPillar);

    const rightPillar = new THREE.Mesh(gantryColGeo, beamMat);
    rightPillar.position.set(15, TANK_BASE_Y + pillarHeight / 2, 0);
    rightPillar.castShadow = true;
    scene.add(rightPillar);

    // Diagonal Gantry Support Brackets connecting Pillars to Beam
    const bracketGeo = new THREE.BoxGeometry(0.2, 3.2, 0.2);
    
    const leftBrace = new THREE.Mesh(bracketGeo, beamMat);
    leftBrace.position.set(-13.8, OVERHEAD_RAIL_Y - 1.0, 0);
    leftBrace.rotation.z = Math.PI / 4;
    scene.add(leftBrace);

    const rightBrace = new THREE.Mesh(bracketGeo, beamMat);
    rightBrace.position.set(13.8, OVERHEAD_RAIL_Y - 1.0, 0);
    rightBrace.rotation.z = -Math.PI / 4;
    scene.add(rightBrace);

    const trolleyGeo = new THREE.BoxGeometry(1.2, 0.3, 0.6);
    const trolleyMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.25, metalness: 0.85 });
    trolleyMesh = new THREE.Mesh(trolleyGeo, trolleyMat);
    trolleyMesh.position.set(-10, OVERHEAD_RAIL_Y - 0.22, 0);
    scene.add(trolleyMesh);

    const cableGeo = new THREE.CylinderGeometry(0.025, 0.025, 5.0, 16);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    cableMesh = new THREE.Mesh(cableGeo, cableMat);
    cableMesh.position.set(-10, 4.2, 0);
    scene.add(cableMesh);

    const clampGeo = new THREE.TorusGeometry(0.18, 0.05, 16, 32);
    const clampMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 });
    clampMesh = new THREE.Mesh(clampGeo, clampMat);
    clampMesh.position.set(-10, 1.65, 0);
    scene.add(clampMesh);
}

// -------------------------------------------------------------
// MeshPhysicalMaterial LIQUID ATTENUATION & REFLECTOR SURFACE 🌊
// -------------------------------------------------------------
function buildPrecisionIndustrialTankBox() {
    tankBoxGroup = new THREE.Group();
    tankBoxGroup.position.set(0, TANK_BASE_Y, 0);

    const frameWhiteMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.25,
        roughness: 0.15
    });

    const frameAccentMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.8,
        roughness: 0.1
    });

    const orangeValveMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        metalness: 0.6,
        roughness: 0.3
    });

    const pipeMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.85,
        roughness: 0.2
    });

    const glassWallMat = new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        transmission: 0.88,
        opacity: 0.45,
        transparent: true,
        roughness: 0.08,
        ior: 1.5,
        reflectivity: 0.6,
        depthWrite: false
    });

    const basePlateGeo = new THREE.BoxGeometry(TANK_WIDTH + 0.4, 0.2, TANK_DEPTH + 0.4);
    const basePlateMesh = new THREE.Mesh(basePlateGeo, frameWhiteMat);
    basePlateMesh.position.set(0, 0.1, 0);
    basePlateMesh.receiveShadow = true;
    tankBoxGroup.add(basePlateMesh);

    const colSize = 0.22;
    const colGeo = new THREE.BoxGeometry(colSize, TANK_HEIGHT, colSize);
    
    const halfW = TANK_WIDTH / 2;
    const halfD = TANK_DEPTH / 2;

    const corners = [
        { x: -halfW, z: -halfD },
        { x: halfW, z: -halfD },
        { x: -halfW, z: halfD },
        { x: halfW, z: halfD }
    ];

    corners.forEach(c => {
        const colMesh = new THREE.Mesh(colGeo, frameWhiteMat);
        colMesh.position.set(c.x, TANK_HEIGHT / 2, c.z);
        colMesh.castShadow = true;
        tankBoxGroup.add(colMesh);

        const capGeo = new THREE.BoxGeometry(colSize + 0.08, 0.3, colSize + 0.08);
        const capMesh = new THREE.Mesh(capGeo, frameAccentMat);
        capMesh.position.set(c.x, TANK_HEIGHT - 0.15, c.z);
        tankBoxGroup.add(capMesh);
    });

    const beamThickness = 0.22;
    const topRimLongGeo = new THREE.BoxGeometry(TANK_WIDTH + 0.4, beamThickness, beamThickness);
    const topRimShortGeo = new THREE.BoxGeometry(beamThickness, beamThickness, TANK_DEPTH);

    const topFront = new THREE.Mesh(topRimLongGeo, frameWhiteMat);
    topFront.position.set(0, TANK_HEIGHT - beamThickness / 2, halfD);
    tankBoxGroup.add(topFront);

    const topBack = new THREE.Mesh(topRimLongGeo, frameWhiteMat);
    topBack.position.set(0, TANK_HEIGHT - beamThickness / 2, -halfD);
    tankBoxGroup.add(topBack);

    const topLeft = new THREE.Mesh(topRimShortGeo, frameWhiteMat);
    topLeft.position.set(-halfW, TANK_HEIGHT - beamThickness / 2, 0);
    tankBoxGroup.add(topLeft);

    const topRight = new THREE.Mesh(topRimShortGeo, frameWhiteMat);
    topRight.position.set(halfW, TANK_HEIGHT - beamThickness / 2, 0);
    tankBoxGroup.add(topRight);

    const rimPipeGeo = new THREE.CylinderGeometry(0.08, 0.08, TANK_WIDTH, 16);
    rimPipeGeo.rotateZ(Math.PI / 2);
    
    const rimPipeFront = new THREE.Mesh(rimPipeGeo, pipeMat);
    rimPipeFront.position.set(0, TANK_HEIGHT - 0.5, halfD + 0.18);
    tankBoxGroup.add(rimPipeFront);

    for (let x = -3.6; x <= 3.6; x += 2.4) {
        const valveGeo = new THREE.BoxGeometry(0.18, 0.24, 0.18);
        const valveMesh = new THREE.Mesh(valveGeo, orangeValveMat);
        valveMesh.position.set(x, TANK_HEIGHT - 0.5, halfD + 0.22);
        tankBoxGroup.add(valveMesh);
    }

    const glassThickness = 0.08;
    const innerW = TANK_WIDTH - colSize;
    const innerD = TANK_DEPTH - colSize;
    const glassH = TANK_HEIGHT - 0.2;

    const glassFrontBackGeo = new THREE.BoxGeometry(innerW, glassH, glassThickness);
    const gFront = new THREE.Mesh(glassFrontBackGeo, glassWallMat);
    gFront.position.set(0, glassH / 2 + 0.1, halfD);
    tankBoxGroup.add(gFront);

    const gBack = new THREE.Mesh(glassFrontBackGeo, glassWallMat);
    gBack.position.set(0, glassH / 2 + 0.1, -halfD);
    tankBoxGroup.add(gBack);

    const glassLeftRightGeo = new THREE.BoxGeometry(glassThickness, glassH, innerD);
    const gLeft = new THREE.Mesh(glassLeftRightGeo, glassWallMat);
    gLeft.position.set(-halfW, glassH / 2 + 0.1, 0);
    tankBoxGroup.add(gLeft);

    const gRight = new THREE.Mesh(glassLeftRightGeo, glassWallMat);
    gRight.position.set(halfW, glassH / 2 + 0.1, 0);
    tankBoxGroup.add(gRight);

    const liquidH = TANK_HEIGHT * 0.75;
    const liquidGeo = new THREE.BoxGeometry(innerW - 0.05, liquidH, innerD - 0.05);
    const liquidMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a1e3d,
        metalness: 0.05,
        roughness: 0.55,
        transmission: 0.0,
        ior: 1.45,
        thickness: 4.8,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
        transparent: true,
        opacity: 0.97
    });

    liquidVolumeMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidVolumeMesh.position.set(0, liquidH / 2 + 0.1, 0);
    liquidVolumeMesh.receiveShadow = true;
    tankBoxGroup.add(liquidVolumeMesh);

    waveGeometry = new THREE.PlaneGeometry(innerW - 0.05, innerD - 0.05, 48, 48);
    waveGeometry.rotateX(-Math.PI / 2);

    const waveMat = new THREE.MeshPhysicalMaterial({
        color: 0x0c2240,
        metalness: 0.08,
        roughness: 0.45,
        clearcoat: 0.4,
        clearcoatRoughness: 0.3,
        transparent: true,
        opacity: 0.98
    });

    waveSurfaceMesh = new THREE.Mesh(waveGeometry, waveMat);
    waveSurfaceMesh.position.set(0, liquidH + 0.1, 0);
    tankBoxGroup.add(waveSurfaceMesh);

    scene.add(tankBoxGroup);
}

// -------------------------------------------------------------
// Real SketchUp Collada 3D Car Door Assembly 🚗
// -------------------------------------------------------------
function build3DCarDoorAssembly() {
    doorGroup = new THREE.Group();
    doorGroup.position.set(-10, 2.2, 0);

    // Normal (0,1,0) keeps points above surface (Y > POOL_SURFACE_Y) -> Pre-coat Raw Steel
    clippingPlaneAbove = new THREE.Plane(new THREE.Vector3(0, 1, 0), -POOL_SURFACE_Y);
    // Normal (0,-1,0) keeps points below surface (Y < POOL_SURFACE_Y) -> Post-coat Blue Paint
    clippingPlaneBelow = new THREE.Plane(new THREE.Vector3(0, -1, 0), POOL_SURFACE_Y);

    globalRawSteelMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8, // Raw Steel Gray (Pre-Coat)
        metalness: 0.85,
        roughness: 0.65,
        clipShadows: true
    });

    globalCoatedPaintMat = new THREE.MeshPhysicalMaterial({
        color: 0x0284c7, // Bright Deep Royal Blue High-Gloss ED Paint (Post-Coat)!
        metalness: 0.3,
        roughness: 0.04,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        clipShadows: true
    });

    const hydraulicMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.9,
        roughness: 0.2
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b, metalness: 0.7, roughness: 0.3
    });

    // =========================================================
    // FULL 3D PROCEDURAL CAR DOOR ASSEMBLY (no .dae dependency)
    // =========================================================
    function buildProceduralDoor(baseMaterial) {
        const doorAssembly = new THREE.Group();

        // --- Outer Door Panel (curved shape with window cutout) ---
        const outerShape = new THREE.Shape();
        outerShape.moveTo(-2.0, -1.4);
        outerShape.lineTo(2.0, -1.4);
        outerShape.quadraticCurveTo(2.1, 0, 1.8, 0.6);
        outerShape.lineTo(1.2, 1.6);
        outerShape.lineTo(-1.4, 1.6);
        outerShape.quadraticCurveTo(-1.9, 0.6, -2.0, -0.2);
        outerShape.closePath();

        const windowHole = new THREE.Path();
        windowHole.moveTo(-1.1, 0.45);
        windowHole.lineTo(0.9, 0.45);
        windowHole.lineTo(0.8, 1.25);
        windowHole.lineTo(-0.9, 1.25);
        windowHole.closePath();
        outerShape.holes.push(windowHole);

        const outerGeo = new THREE.ExtrudeGeometry(outerShape, {
            depth: 0.35, bevelEnabled: true, bevelSegments: 6,
            steps: 2, bevelSize: 0.06, bevelThickness: 0.06
        });
        outerGeo.center();
        const outerPanel = new THREE.Mesh(outerGeo, baseMaterial.clone());
        outerPanel.castShadow = true;
        outerPanel.receiveShadow = true;
        doorAssembly.add(outerPanel);

        // --- Inner Door Panel (recessed lower section) ---
        const innerShape = new THREE.Shape();
        innerShape.moveTo(-1.6, -1.1);
        innerShape.lineTo(1.6, -1.1);
        innerShape.lineTo(1.5, 0.3);
        innerShape.lineTo(-1.0, 0.35);
        innerShape.lineTo(-1.6, 0.3);
        innerShape.closePath();

        const innerGeo = new THREE.ExtrudeGeometry(innerShape, {
            depth: 0.12, bevelEnabled: true, bevelSegments: 2,
            steps: 1, bevelSize: 0.03, bevelThickness: 0.02
        });
        innerGeo.center();
        const innerPanel = new THREE.Mesh(innerGeo, baseMaterial.clone());
        innerPanel.position.z = -0.22;
        innerPanel.castShadow = true;
        doorAssembly.add(innerPanel);

        // --- Chrome Window Frame ---
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x94a3b8, metalness: 0.95, roughness: 0.05
        });
        const frameData = [
            { p: [0, 0.52, 0], s: [2.1, 0.06, 0.42] },
            { p: [0, 1.0, 0], s: [1.8, 0.06, 0.42] },
            { p: [-1.05, 0.76, 0], s: [0.06, 0.55, 0.42] },
            { p: [0.88, 0.76, 0], s: [0.06, 0.55, 0.42] },
        ];
        frameData.forEach(f => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(...f.s), frameMat.clone());
            m.position.set(...f.p);
            doorAssembly.add(m);
        });

        // --- Door Handle ---
        const hBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.08), frameMat.clone());
        hBase.position.set(0.9, -0.15, 0.22);
        doorAssembly.add(hBase);
        const hGrip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.12), darkTrimMat.clone());
        hGrip.position.set(0.9, -0.15, 0.28);
        doorAssembly.add(hGrip);

        // --- Side Mirror ---
        const mArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.4), darkTrimMat.clone());
        mArm.position.set(-1.7, 0.55, 0.38);
        doorAssembly.add(mArm);
        const mHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), frameMat.clone());
        mHead.position.set(-1.7, 0.55, 0.58);
        mHead.scale.set(0.6, 0.8, 1.0);
        doorAssembly.add(mHead);

        // --- Reinforcement Ribs (visible from inside) ---
        for (let i = 0; i < 3; i++) {
            const rib = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.04, 0.08), baseMaterial.clone());
            rib.position.set(0, -0.8 + i * 0.5, -0.26);
            doorAssembly.add(rib);
        }

        // --- Bottom Trim ---
        const btm = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.42), darkTrimMat.clone());
        btm.position.set(0, -1.12, 0);
        doorAssembly.add(btm);

        // --- Hinge Plates ---
        for (const y of [0.8, -0.6]) {
            const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 0.10), frameMat.clone());
            hinge.position.set(-2.0, y, 0);
            doorAssembly.add(hinge);
            const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.30, 8), frameMat.clone());
            pin.position.set(-2.05, y, 0);
            doorAssembly.add(pin);
        }

        doorAssembly.scale.set(0.585, 0.585, 0.585);
        return doorAssembly;
    }

    rawSteelDoorMesh = buildProceduralDoor(globalRawSteelMat);
    coatedDoorMesh = buildProceduralDoor(globalCoatedPaintMat);

    doorGroup.add(rawSteelDoorMesh);
    doorGroup.add(coatedDoorMesh);

    // =========================================================
    // LOAD REAL 3D COLLADA MODEL (.dae) FROM FILE
    // =========================================================
    if (typeof THREE.ColladaLoader !== 'undefined') {
        const loader = new THREE.ColladaLoader();
        loader.load(
            './assets/sketchup_car_door/model.dae',
            function (collada) {
                try {
                    const sketchupScene = collada.scene;
                    sketchupScene.scale.set(0.048, 0.048, 0.048);
                    sketchupScene.rotation.x = -Math.PI / 2;

                    // Centering
                    const box = new THREE.Box3().setFromObject(sketchupScene);
                    const center = box.getCenter(new THREE.Vector3());
                    sketchupScene.position.set(-center.x, -center.y, -center.z);

                    const wrapperGroup = new THREE.Group();
                    wrapperGroup.add(sketchupScene);

                    // Raw Steel Group
                    const rawGroup = wrapperGroup.clone(true);
                    rawGroup.traverse((child) => {
                        if (child && child.isMesh) {
                            child.material = globalRawSteelMat.clone();
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    // Coated Paint Group
                    const coatedGroup = wrapperGroup.clone(true);
                    coatedGroup.traverse((child) => {
                        if (child && child.isMesh) {
                            child.material = globalCoatedPaintMat.clone();
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    // Swap out procedural meshes with real 3D DAE model
                    doorGroup.remove(rawSteelDoorMesh);
                    doorGroup.remove(coatedDoorMesh);

                    rawSteelDoorMesh = rawGroup;
                    coatedDoorMesh = coatedGroup;

                    doorGroup.add(rawSteelDoorMesh);
                    doorGroup.add(coatedDoorMesh);

                    console.log('Successfully loaded 3D DAE model: ./assets/sketchup_car_door/model.dae');
                } catch (e) {
                    console.warn('Error processing loaded DAE model, keeping 3D procedural door:', e);
                }
            },
            undefined,
            function (error) {
                console.warn('Collada DAE load skipped/failed (e.g. file:// protocol restriction). Using high-quality 3D procedural car door model instead.', error);
            }
        );
    }




    // DIAGONAL HYDRAULIC TILTING PISTON ARMS ATTACHED TO DOOR RIG
    const pistonGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 16);
    
    const leftPiston = new THREE.Mesh(pistonGeo, hydraulicMat);
    leftPiston.position.set(-0.8, 1.8, 0);
    leftPiston.rotation.z = Math.PI / 12;
    doorGroup.add(leftPiston);

    const rightPiston = new THREE.Mesh(pistonGeo, hydraulicMat);
    rightPiston.position.set(0.8, 1.8, 0);
    rightPiston.rotation.z = -Math.PI / 12;
    doorGroup.add(rightPiston);

    scene.add(doorGroup);
}

// -------------------------------------------------------------
// HIGH-VOLTAGE ELECTRIC SPARK ARCS ⚡
// -------------------------------------------------------------
function buildHighVoltageElectricSparks() {
    sparkLinesGroup = new THREE.Group();
    const sparkMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });

    for (let i = 0; i < 8; i++) {
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4));
        points.push(new THREE.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8));

        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, sparkMat);
        sparkLinesGroup.add(line);
    }
    sparkLinesGroup.visible = false;
    scene.add(sparkLinesGroup);
}

function updateElectricSparks(currentX, doorY, isSubmerged) {
    if (!sparkLinesGroup) return;

    if (!isSubmerged) {
        sparkLinesGroup.visible = false;
        return;
    }

    sparkLinesGroup.visible = Math.random() > 0.3;
    sparkLinesGroup.position.set(currentX + (Math.random() - 0.5) * 1.5, doorY + (Math.random() - 0.5) * 1.0, (Math.random() - 0.5) * 0.4);
}

// -------------------------------------------------------------
// LIQUID IMPACT SHOCKWAVE RING RIPPLES 🌊
// -------------------------------------------------------------
function build3DImpactShockwaveRipples() {
    for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.RingGeometry(0.1, 0.25, 32);
        ringGeo.rotateX(-Math.PI / 2);

        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.0
        });

        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(0, POOL_SURFACE_Y + 0.02, 0);
        scene.add(ringMesh);

        shockwaveRipples.push({
            mesh: ringMesh,
            active: false,
            scale: 0.1,
            opacity: 0.0
        });
    }
}

function triggerImpactShockwaves(impactX) {
    shockwaveRipples.forEach((ripple, idx) => {
        setTimeout(() => {
            ripple.mesh.position.x = impactX;
            ripple.active = true;
            ripple.scale = 0.1;
            ripple.opacity = 0.9;
        }, idx * 180);
    });
}

function updateImpactShockwaves() {
    shockwaveRipples.forEach(ripple => {
        if (!ripple.active) return;

        ripple.scale += 0.12;
        ripple.opacity -= 0.02;

        ripple.mesh.scale.set(ripple.scale, ripple.scale, 1);
        ripple.mesh.material.opacity = Math.max(0, ripple.opacity);

        if (ripple.opacity <= 0) {
            ripple.active = false;
        }
    });
}

// -------------------------------------------------------------
// 3D REAL-TIME TELEMETRY DATA OVERLAY SPRITE & HOLOGRAPHIC CALLOUT 🎯
// -------------------------------------------------------------
function build3DHolographicCallouts() {
    holoCalloutGroup = new THREE.Group();

    const canvas1 = document.createElement('canvas');
    canvas1.width = 300;
    canvas1.height = 100;
    const ctx1 = canvas1.getContext('2d');
    ctx1.fillStyle = 'rgba(24, 24, 27, 0.92)';
    ctx1.fillRect(0, 0, 300, 100);
    ctx1.strokeStyle = '#38bdf8';
    ctx1.lineWidth = 3;
    ctx1.strokeRect(2, 2, 296, 96);
    ctx1.font = 'bold 15px "JetBrains Mono", monospace';
    ctx1.fillStyle = '#38bdf8';
    ctx1.fillText('⚡ VOLTAGE: 480V DC CATHODIC', 14, 30);
    ctx1.fillStyle = '#ffffff';
    ctx1.fillText('🌡️ TEMP: 28.5°C | pH: 6.25', 14, 58);
    ctx1.fillStyle = '#cbd5e1';
    ctx1.fillText('📐 COAT FILM: 22.5μm PASS', 14, 84);

    const tex1 = new THREE.CanvasTexture(canvas1);
    const spriteMat1 = new THREE.SpriteMaterial({ map: tex1, transparent: true });
    telemetryTextSprite = new THREE.Sprite(spriteMat1);
    telemetryTextSprite.scale.set(2.8, 0.93, 1);
    telemetryTextSprite.position.set(1.6, 1.4, 0.3);

    const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1.6, 1.4, 0.3)
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
    const lineMesh = new THREE.Line(lineGeo, lineMat);

    holoCalloutGroup.add(telemetryTextSprite);
    holoCalloutGroup.add(lineMesh);

    doorGroup.add(holoCalloutGroup);
}

// Fluid Surface Wave Animation
function animateFluidWaves(timeSec, S) {
    if (!waveGeometry) return;
    const pos = waveGeometry.attributes.position;
    const count = pos.count;
    const waveFreq = 0.9;
    const waveSpeed = timeSec * 3.2;
    const dipTurbulence = S * 0.30;

    for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const y = Math.sin(x * waveFreq + waveSpeed) * (0.04 + dipTurbulence) + Math.cos(z * 0.7 - waveSpeed * 1.1) * 0.03;
        pos.setY(i, y);
    }
    pos.needsUpdate = true;
    waveGeometry.computeVertexNormals();
}

function onWindowResize() {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// -------------------------------------------------------------
// 60FPS Kinematics & Full Dip Submersion Frame Loop
// -------------------------------------------------------------
let prevSubmergedState = false;

function start3DProcessAnimation() {
    const splashOverlay = document.getElementById('centerPlayOverlay');
    if (splashOverlay) splashOverlay.classList.add('hidden');

    state.animating = true;
    state.completed = false;
    state.startTime = -1; // Signal: set from next renderLoop frame
}

let targetCameraPos = null;

if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
        if (!camera) return;
        const currentPos = targetCameraPos ? targetCameraPos.clone() : camera.position.clone();
        const targetPos = controls ? controls.target.clone() : new THREE.Vector3(0, -0.4, 0);
        const dir = new THREE.Vector3().subVectors(targetPos, currentPos).normalize();
        const dist = currentPos.distanceTo(targetPos);
        if (dist > 8.0) {
            targetCameraPos = currentPos.clone().addScaledVector(dir, 6.0);
        }
    });
}

if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
        if (!camera) return;
        const currentPos = targetCameraPos ? targetCameraPos.clone() : camera.position.clone();
        const targetPos = controls ? controls.target.clone() : new THREE.Vector3(0, -0.4, 0);
        const dir = new THREE.Vector3().subVectors(currentPos, targetPos).normalize();
        const dist = currentPos.distanceTo(targetPos);
        if (dist < 55.0) {
            targetCameraPos = currentPos.clone().addScaledVector(dir, 6.0);
        }
    });
}

// Mobile History Floating Button Popup Modal Controller 📜
const btnMobileHistory = document.getElementById('btnMobileHistory');
const btnCloseMobileHistory = document.getElementById('btnCloseMobileHistory');
const mobileTimelinePanel = document.getElementById('mobileTimelinePanel');

if (btnMobileHistory && mobileTimelinePanel) {
    btnMobileHistory.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileTimelinePanel.classList.add('mobile-active');
    });
}

if (btnCloseMobileHistory && mobileTimelinePanel) {
    btnCloseMobileHistory.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileTimelinePanel.classList.remove('mobile-active');
    });
}

function renderLoop(timestamp) {
    const timeSec = (timestamp || 0) / 1000;
    const responsiveConfig = getResponsiveCameraConfig();

    if (keySpotLight) {
        keySpotLight.position.x = 14 + Math.sin(timeSec * 0.4) * 2.5;
        keySpotLight.position.z = 18 + Math.cos(timeSec * 0.3) * 2.0;
    }
    if (rimSpotLight) {
        rimSpotLight.position.x = -16 + Math.cos(timeSec * 0.35) * 2.2;
    }

    if (!state.animating) {
        animateFluidWaves(timeSec, 0);
        updateCathodicParticleFlux(0, 0, false);
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
        return;
    }

    // On the very first animating frame, capture the timestamp as start
    if (state.startTime === null || state.startTime === -1) {
        state.startTime = timestamp;
    }

    let elapsed = timestamp - state.startTime;
    let p = (elapsed % state.duration) / state.duration;
    state.progress = p;

    updateTimelineHighlight(p);

    const startX = -10.0;
    const overheadCenterStart = -3.2;
    const overheadCenterEmergence = 3.2;
    const exitX = 10.0;

    let currentX = startX;
    let currentY = 2.2;
    let pitchAngleDeg = 0;
    let S = 0;

    if (p <= 0.35) { // Stage 1: Slow Overhead Entry
        const entryP = easeOutCubic(p / 0.35);
        currentX = startX + entryP * (overheadCenterStart - startX);
        currentY = 2.2;
        pitchAngleDeg = -entryP * 8;
        S = 0;
    } else if (p <= 0.70) { // Stage 2: FULL COMPLETE DIP SUBMERSION DEEP INTO PAINT TANK!
        const dipP = (p - 0.35) / 0.35;
        const easedXRatio = easeInOutCubic(dipP);
        currentX = overheadCenterStart + easedXRatio * (overheadCenterEmergence - overheadCenterStart);

        let dipSineP = Math.sin(dipP * Math.PI);
        // Clamp minimum Y so door never penetrates the tank bottom floor
        const minDoorY = TANK_BASE_Y + 1.2;
        currentY = Math.max(minDoorY, 2.2 - dipSineP * 4.8);
        pitchAngleDeg = -8 - dipSineP * 24;
        S = dipSineP;
    } else { // Stage 3: Emerges 100% Royal Blue Coated Paint Exit Right
        const exitP = smoothstep(0.70, 1.00, p);
        currentX = overheadCenterEmergence + exitP * (exitX - overheadCenterEmergence);
        currentY = 2.2;
        pitchAngleDeg = (1.0 - exitP) * -8;
        S = 0;
    }

    let isSubmerged = p > 0.35 && p < 0.70;

    if (isSubmerged && !prevSubmergedState) {
        triggerImpactShockwaves(currentX);
    }
    prevSubmergedState = isSubmerged;

    if (doorGroup) {
        doorGroup.position.set(currentX, currentY, 0);
        doorGroup.rotation.z = pitchAngleDeg * Math.PI / 180;
    }

    updateElectricSparks(currentX, currentY, isSubmerged);
    updateCathodicParticleFlux(currentX, currentY, isSubmerged);
    updateImpactShockwaves();

    if (holoCalloutGroup) {
        holoCalloutGroup.position.y = Math.sin(timeSec * 3) * 0.08;
    }

    const scrollCamZ = responsiveConfig.camZ - state.scrollProgress * 10.0;
    const scrollCamY = responsiveConfig.camY - state.scrollProgress * 2.5;

    controls.target.set(0, -0.4, 0);

    if (trolleyMesh) trolleyMesh.position.x = currentX;
    if (cableMesh) {
        const cableTopY = OVERHEAD_RAIL_Y - 0.22;
        const doorTopY = currentY + 0.8;
        const cableH = Math.max(0.4, cableTopY - doorTopY);
        cableMesh.scale.set(1, cableH / 5.0, 1);
        cableMesh.position.set(currentX, cableTopY - cableH / 2, 0);
    }
    if (clampMesh) clampMesh.position.set(currentX, currentY + 0.8, 0);

    // REALTIME WATERLINE CLIPPING KINEMATICS
    // clippingPlaneAbove cuts off everything BELOW POOL_SURFACE_Y (keeps part ABOVE pool)
    // clippingPlaneBelow cuts off everything ABOVE POOL_SURFACE_Y (keeps part BELOW pool)
    if (p < 0.40) {
        // Stage 1: Entry -> 100% Raw Steel Gray, Coated Paint completely hidden
        if (rawSteelDoorMesh) rawSteelDoorMesh.visible = true;
        if (coatedDoorMesh) coatedDoorMesh.visible = false;
        applyClippingPlanes(rawSteelDoorMesh, []);
    } else if (p < 0.65) {
        // Stage 2: Submerged inside Dip Tank -> Waterline Clipping Split
        if (rawSteelDoorMesh) rawSteelDoorMesh.visible = true;
        if (coatedDoorMesh) coatedDoorMesh.visible = true;
        applyClippingPlanes(rawSteelDoorMesh, [clippingPlaneAbove]);
        applyClippingPlanes(coatedDoorMesh, [clippingPlaneBelow]);
    } else {
        // Stage 3: Post-dip emergence -> 100% Royal Blue Glossy ED Paint Coated
        if (rawSteelDoorMesh) rawSteelDoorMesh.visible = false;
        if (coatedDoorMesh) coatedDoorMesh.visible = true;
        applyClippingPlanes(coatedDoorMesh, []);
    }

    animateFluidWaves(timeSec, S);

    // Ultra-Smooth Camera Lerp Zoom Interpolation
    if (targetCameraPos) {
        camera.position.lerp(targetCameraPos, 0.08);
        if (camera.position.distanceTo(targetCameraPos) < 0.05) {
            camera.position.copy(targetCameraPos);
            targetCameraPos = null;
        }
    }

    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(renderLoop);
}

// Initialize Three.js on Load
initThreeJS();
requestAnimationFrame(renderLoop);

// Auto-start: Show HANTAL splash for 3 seconds, then fade out seamlessly
setTimeout(() => {
    const splashOverlay = document.getElementById('centerPlayOverlay');
    if (splashOverlay) splashOverlay.classList.add('hidden');
}, 3000);
