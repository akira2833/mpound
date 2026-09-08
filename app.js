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

// 4-Stage Electro-Coating Sequence: Door -> Random 1 -> Random 2 -> Door
const CANDIDATE_ITEMS = ['heart', 'teddy', 'chair', 'toyCar'];
const shuffledCandidates = [...CANDIDATE_ITEMS].sort(() => Math.random() - 0.5);
const CARRIER_SEQUENCE = ['door', shuffledCandidates[0], shuffledCandidates[1], 'door'];
let activeCarrierKey = 'door';
let carrierItems = {};
console.log('Automotive Electro-Deposition Dynamic Carrier Sequence:', CARRIER_SEQUENCE);

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
    controls.minDistance = 8.0;
    controls.maxDistance = 50.0;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.target.set(0, -0.4, 0);
    controls.addEventListener('start', () => {
        targetCameraDistance = null;
    });
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
// Fully grounded architectural enclosure with authentic lighting mounts & conduit routing
// -------------------------------------------------------------
function buildFactoryArchitecturalBackground() {
    factoryBackgroundGroup = new THREE.Group();
    factoryBackgroundGroup.position.set(0, 0, -14);

    const steelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.85,
        roughness: 0.3
    });

    const whiteTrussMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.4,
        roughness: 0.25
    });

    const darkWallMat = new THREE.MeshStandardMaterial({
        color: 0x0f141d,
        metalness: 0.25,
        roughness: 0.85
    });

    const darkAccentMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.5,
        roughness: 0.5
    });

    // 1. FACTORY ARCHITECTURAL BACK WALL & STRUCTURAL SEAMS
    // Prevents floating in void by providing a realistic industrial envelope
    const wallGeo = new THREE.PlaneGeometry(80, 26);
    const backWall = new THREE.Mesh(wallGeo, darkWallMat);
    backWall.position.set(0, 5.2, -1.8);
    backWall.receiveShadow = true;
    factoryBackgroundGroup.add(backWall);

    // Architectural wall division panels (horizontal & vertical seam battens)
    for (let y = -2.0; y <= 12.0; y += 3.5) {
        const seamHGeo = new THREE.BoxGeometry(80, 0.08, 0.06);
        const seamH = new THREE.Mesh(seamHGeo, darkAccentMat);
        seamH.position.set(0, y, -1.76);
        factoryBackgroundGroup.add(seamH);
    }
    for (let x = -30; x <= 30; x += 10) {
        const seamVGeo = new THREE.BoxGeometry(0.1, 26, 0.06);
        const seamV = new THREE.Mesh(seamVGeo, darkAccentMat);
        seamV.position.set(x, 5.2, -1.76);
        factoryBackgroundGroup.add(seamV);
    }

    // 2. HEAVY INDUSTRIAL ROOF TRUSS & VERTICAL MAIN COLUMNS
    const trussLength = 64;
    const topBarGeo = new THREE.BoxGeometry(trussLength, 0.3, 0.3);
    
    // Top & Bottom Chord Beams
    const topBeam1 = new THREE.Mesh(topBarGeo, whiteTrussMat);
    topBeam1.position.set(0, 11.6, 0);
    factoryBackgroundGroup.add(topBeam1);

    const topBeam2 = new THREE.Mesh(topBarGeo, whiteTrussMat);
    topBeam2.position.set(0, 10.2, 0);
    factoryBackgroundGroup.add(topBeam2);

    // Truss Diagonal Webbing
    for (let x = -30; x <= 30; x += 3.5) {
        const braceGeo = new THREE.BoxGeometry(0.12, 1.8, 0.12);
        const braceLeft = new THREE.Mesh(braceGeo, steelMat);
        braceLeft.position.set(x + 0.8, 10.9, 0);
        braceLeft.rotation.z = Math.PI / 4;
        factoryBackgroundGroup.add(braceLeft);

        const braceRight = new THREE.Mesh(braceGeo, steelMat);
        braceRight.position.set(x + 0.8, 10.9, 0);
        braceRight.rotation.z = -Math.PI / 4;
        factoryBackgroundGroup.add(braceRight);
    }

    // Massive Floor-to-Ceiling Steel Support Columns (x = -22, +22)
    const colHeight = 18.5;
    const colGeo = new THREE.BoxGeometry(0.9, colHeight, 0.9);
    
    const colLeft = new THREE.Mesh(colGeo, steelMat);
    colLeft.position.set(-22, 3.25, 0);
    factoryBackgroundGroup.add(colLeft);

    const colRight = new THREE.Mesh(colGeo, steelMat);
    colRight.position.set(22, 3.25, 0);
    factoryBackgroundGroup.add(colRight);

    // Column Base Plates anchored to floor
    const basePlateGeo = new THREE.BoxGeometry(1.6, 0.25, 1.6);
    const baseL = new THREE.Mesh(basePlateGeo, steelMat);
    baseL.position.set(-22, -3.8 + 0.12, 0);
    factoryBackgroundGroup.add(baseL);

    const baseR = new THREE.Mesh(basePlateGeo, steelMat);
    baseR.position.set(22, -3.8 + 0.12, 0);
    factoryBackgroundGroup.add(baseR);

    // Column-to-Truss Heavy Gusset Joint Brackets
    const gussetGeo = new THREE.BoxGeometry(1.2, 1.2, 0.95);
    const gussetL = new THREE.Mesh(gussetGeo, steelMat);
    gussetL.position.set(-22, 10.9, 0);
    factoryBackgroundGroup.add(gussetL);

    const gussetR = new THREE.Mesh(gussetGeo, steelMat);
    gussetR.position.set(22, 10.9, 0);
    factoryBackgroundGroup.add(gussetR);

    // 3. HVAC VENTILATION DUCT & RIGID CLEVIS DROP-HANGER SUPPORTS
    const pipeGeo = new THREE.CylinderGeometry(0.35, 0.35, trussLength - 6, 24);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipeMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.9,
        roughness: 0.2
    });

    const duct1 = new THREE.Mesh(pipeGeo, pipeMat);
    duct1.position.set(0, 8.8, -1.2);
    factoryBackgroundGroup.add(duct1);

    // Reinforcing Duct Coupling Rings
    for (let x = -26; x <= 26; x += 6) {
        const ringGeo = new THREE.TorusGeometry(0.38, 0.04, 16, 32);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(x, 8.8, -1.2);
        factoryBackgroundGroup.add(ringMesh);
    }

    // Structural Hangers: Connects duct to upper truss so it does NOT float!
    for (let x = -24; x <= 24; x += 8) {
        // Horizontal Cantilever Arm from Truss (z=0) out to Duct (z=-1.2)
        const armGeo = new THREE.BoxGeometry(0.12, 0.12, 1.25);
        const armMesh = new THREE.Mesh(armGeo, steelMat);
        armMesh.position.set(x, 10.2, -0.6);
        factoryBackgroundGroup.add(armMesh);

        // Vertical Threaded Drop Rod hanging from Arm down to Duct clamp
        const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8);
        const rodMesh = new THREE.Mesh(rodGeo, steelMat);
        rodMesh.position.set(x, 9.5, -1.2);
        factoryBackgroundGroup.add(rodMesh);

        // Clevis Clamp around Duct
        const clevisGeo = new THREE.TorusGeometry(0.40, 0.03, 12, 24, Math.PI);
        clevisGeo.rotateZ(Math.PI);
        const clevisMesh = new THREE.Mesh(clevisGeo, steelMat);
        clevisMesh.position.set(x, 8.8, -1.2);
        factoryBackgroundGroup.add(clevisMesh);
    }

    // Duct End Exhaust Wall Terminations (Elbows into wall)
    const termGeo = new THREE.BoxGeometry(1.2, 1.2, 0.8);
    const termL = new THREE.Mesh(termGeo, steelMat);
    termL.position.set(-(trussLength - 6) / 2 - 0.4, 8.8, -1.4);
    factoryBackgroundGroup.add(termL);

    const termR = new THREE.Mesh(termGeo, steelMat);
    termR.position.set((trussLength - 6) / 2 + 0.4, 8.8, -1.4);
    factoryBackgroundGroup.add(termR);

    // 4. WALL-MOUNTED HIGH-TECH CYAN GLOW TUBE FIXTURES
    // Grounded to wall with continuous C-channel strut & electrical vertical conduits
    const strutChannelGeo = new THREE.BoxGeometry(50, 0.16, 0.12);
    const strutChannel = new THREE.Mesh(strutChannelGeo, steelMat);
    strutChannel.position.set(0, 5.5, -1.72);
    factoryBackgroundGroup.add(strutChannel);

    for (let x = -20; x <= 20; x += 10) {
        // Glowing cyan tube
        const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.5, 16);
        tubeGeo.rotateZ(Math.PI / 2);
        const glowTubeMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x38bdf8,
            emissiveIntensity: 1.8
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, glowTubeMat);
        tubeMesh.position.set(x, 5.5, -1.55);
        factoryBackgroundGroup.add(tubeMesh);

        // Downward soft area light
        const tubeLight = new THREE.PointLight(0x38bdf8, 0.6, 12, 2);
        tubeLight.position.set(x, 5.2, -1.2);
        factoryBackgroundGroup.add(tubeLight);

        // Heavy Fixture Mounting Backplate firmly attached to strut channel
        const fixtureBackGeo = new THREE.BoxGeometry(4.8, 0.22, 0.14);
        const fixtureBack = new THREE.Mesh(fixtureBackGeo, steelMat);
        fixtureBack.position.set(x, 5.5, -1.65);
        factoryBackgroundGroup.add(fixtureBack);

        // Left & Right Clamping End Caps
        const capGeo = new THREE.BoxGeometry(0.18, 0.28, 0.22);
        const capL = new THREE.Mesh(capGeo, steelMat);
        capL.position.set(x - 2.3, 5.5, -1.55);
        factoryBackgroundGroup.add(capL);

        const capR = new THREE.Mesh(capGeo, steelMat);
        capR.position.set(x + 2.3, 5.5, -1.55);
        factoryBackgroundGroup.add(capR);

        // Vertical Electrical Conduit Pipe connecting from ceiling truss (y=10.2) down to fixture
        const conduitGeo = new THREE.CylinderGeometry(0.025, 0.025, 4.7, 8);
        const conduit = new THREE.Mesh(conduitGeo, steelMat);
        conduit.position.set(x + 2.2, 7.85, -1.68);
        factoryBackgroundGroup.add(conduit);

        // Conduit Junction Box at top connection
        const cBoxGeo = new THREE.BoxGeometry(0.15, 0.15, 0.12);
        const cBox = new THREE.Mesh(cBoxGeo, steelMat);
        cBox.position.set(x + 2.2, 10.2, -1.68);
        factoryBackgroundGroup.add(cBox);
    }

    // 5. INDUSTRIAL PENDANT CONE LAMPS (Directly Anchored to Truss Chord)
    // Aligned to z=0 so they connect 100% seamlessly to the overhead truss!
    for (let x = -18; x <= 18; x += 12) {
        // Ceiling Junction Box mounted under truss chord
        const jBoxGeo = new THREE.BoxGeometry(0.35, 0.15, 0.35);
        const jBox = new THREE.Mesh(jBoxGeo, steelMat);
        jBox.position.set(x, 10.12, 0);
        factoryBackgroundGroup.add(jBox);

        // Rigid Steel Drop Stem connecting Junction Box to Lamp Cap
        const stemHeight = 0.55;
        const stemGeo = new THREE.CylinderGeometry(0.025, 0.025, stemHeight, 8);
        const stemMesh = new THREE.Mesh(stemGeo, steelMat);
        stemMesh.position.set(x, 9.80, 0);
        factoryBackgroundGroup.add(stemMesh);

        // Lamp Shade Collar / Socket Cap
        const collarGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.12, 16);
        const collarMesh = new THREE.Mesh(collarGeo, steelMat);
        collarMesh.position.set(x, 9.54, 0);
        factoryBackgroundGroup.add(collarMesh);

        // Pendant Lamp Metal Shade
        const lampShadeGeo = new THREE.CylinderGeometry(0.3, 1.2, 0.6, 24, 1, true);
        const lampMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.DoubleSide, metalness: 0.85, roughness: 0.3 });
        const lampMesh = new THREE.Mesh(lampShadeGeo, lampMat);
        lampMesh.position.set(x, 9.24, 0);
        factoryBackgroundGroup.add(lampMesh);

        // Warm Glowing Light Bulb inside Shade
        const bulbGeo = new THREE.SphereGeometry(0.20, 16, 16);
        const bulbMat = new THREE.MeshStandardMaterial({
            color: 0xfff4e0,
            emissive: 0xfbbf24,
            emissiveIntensity: 2.5
        });
        const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
        bulbMesh.position.set(x, 9.05, 0);
        factoryBackgroundGroup.add(bulbMesh);

        // Warm Area Downlight from Lamp
        const lampLight = new THREE.PointLight(0xfbbf24, 1.2, 18, 2);
        lampLight.position.set(x, 8.95, 0);
        lampLight.castShadow = false;
        factoryBackgroundGroup.add(lampLight);
    }

    scene.add(factoryBackgroundGroup);
}

// -------------------------------------------------------------
// INFINITE DARK SLATE STUDIO FLOOR & STRUCTURALLY INTEGRATED OVERHEAD CRANE GANTRY
// Fully cross-braced to ceiling framework with track end-stops
// -------------------------------------------------------------
function buildStudioEnvironment() {
    // 1. Studio Floor
    const floorGeo = new THREE.PlaneGeometry(160, 160);
    floorGeo.rotateX(-Math.PI / 2);

    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x14161d,
        roughness: 0.78,
        metalness: 0.22
    });

    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = TANK_BASE_Y - 0.02;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 2. Floor Guide Tracks with Safety Buffer End-Stops & Anchor Plates
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.2 });
    const trackLength = 32;
    const trackGeo = new THREE.BoxGeometry(trackLength, 0.12, 0.22);
    
    const trackFront = new THREE.Mesh(trackGeo, trackMat);
    trackFront.position.set(0, TANK_BASE_Y + 0.06, 2.6);
    scene.add(trackFront);

    const trackBack = new THREE.Mesh(trackGeo, trackMat);
    trackBack.position.set(0, TANK_BASE_Y + 0.06, -2.6);
    scene.add(trackBack);

    // Heavy Industrial End-Stop Bumpers on Floor Tracks (x = -16, +16)
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.4, roughness: 0.4 });
    const bumperBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 });
    [-16, 16].forEach(xPos => {
        [2.6, -2.6].forEach(zPos => {
            // Anchor Base Plate
            const bPlateGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5);
            const bPlate = new THREE.Mesh(bPlateGeo, bumperBaseMat);
            bPlate.position.set(xPos, TANK_BASE_Y + 0.04, zPos);
            scene.add(bPlate);

            // High-visibility Hazard Yellow Stopper Block
            const bBlockGeo = new THREE.BoxGeometry(0.3, 0.32, 0.35);
            const bBlock = new THREE.Mesh(bBlockGeo, bumperMat);
            bBlock.position.set(xPos, TANK_BASE_Y + 0.20, zPos);
            scene.add(bBlock);
        });
    });

    // 3. Overhead Crane Conveyor Gantry Beam
    const beamGeo = new THREE.BoxGeometry(36, 0.35, 0.45);
    const beamMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.25,
        metalness: 0.85
    });
    conveyorBeamMesh = new THREE.Mesh(beamGeo, beamMat);
    conveyorBeamMesh.position.set(0, OVERHEAD_RAIL_Y, 0);
    conveyorBeamMesh.castShadow = true;
    scene.add(conveyorBeamMesh);

    // Gantry Rail End Bumpers
    [-18, 18].forEach(endX => {
        const rEndGeo = new THREE.BoxGeometry(0.3, 0.6, 0.55);
        const rEnd = new THREE.Mesh(rEndGeo, bumperMat);
        rEnd.position.set(endX, OVERHEAD_RAIL_Y, 0);
        scene.add(rEnd);
    });

    // 4. Vertical Gantry Support Columns with Heavy Flanged Bases
    const pillarHeight = OVERHEAD_RAIL_Y - TANK_BASE_Y;
    const gantryColGeo = new THREE.BoxGeometry(0.7, pillarHeight, 0.7);
    
    const leftPillar = new THREE.Mesh(gantryColGeo, beamMat);
    leftPillar.position.set(-15, TANK_BASE_Y + pillarHeight / 2, 0);
    leftPillar.castShadow = true;
    scene.add(leftPillar);

    const rightPillar = new THREE.Mesh(gantryColGeo, beamMat);
    rightPillar.position.set(15, TANK_BASE_Y + pillarHeight / 2, 0);
    rightPillar.castShadow = true;
    scene.add(rightPillar);

    // Column Base Anchor Flanges on floor
    const gantryBaseGeo = new THREE.BoxGeometry(1.4, 0.25, 1.4);
    const gBaseL = new THREE.Mesh(gantryBaseGeo, beamMat);
    gBaseL.position.set(-15, TANK_BASE_Y + 0.12, 0);
    scene.add(gBaseL);

    const gBaseR = new THREE.Mesh(gantryBaseGeo, beamMat);
    gBaseR.position.set(15, TANK_BASE_Y + 0.12, 0);
    scene.add(gBaseR);

    // Diagonal Gantry Gusset Brackets connecting Pillars to Conveyor Beam
    const bracketGeo = new THREE.BoxGeometry(0.22, 3.2, 0.22);
    
    const leftBrace = new THREE.Mesh(bracketGeo, beamMat);
    leftBrace.position.set(-13.8, OVERHEAD_RAIL_Y - 1.0, 0);
    leftBrace.rotation.z = Math.PI / 4;
    scene.add(leftBrace);

    const rightBrace = new THREE.Mesh(bracketGeo, beamMat);
    rightBrace.position.set(13.8, OVERHEAD_RAIL_Y - 1.0, 0);
    rightBrace.rotation.z = -Math.PI / 4;
    scene.add(rightBrace);

    // 5. CRITICAL STRUCTURAL TIE-IN: OVERHEAD CROSS GIRDERS (Front Z=0 to Back Z=-14)
    // Fully connects the front crane rail to the factory building framework!
    [-15, 15].forEach(xAnchor => {
        // Transverse I-beam crossing from z=0 to z=-14
        const crossLength = 14.0;
        const crossGeo = new THREE.BoxGeometry(0.4, 0.45, crossLength);
        const crossBeam = new THREE.Mesh(crossGeo, beamMat);
        crossBeam.position.set(xAnchor, OVERHEAD_RAIL_Y + 0.15, -crossLength / 2);
        crossBeam.castShadow = true;
        scene.add(crossBeam);

        // Angled Gusset Tie-in connecting Cross Beam to Vertical Column
        const tieGeo = new THREE.BoxGeometry(0.2, 0.2, 2.4);
        tieGeo.rotateX(Math.PI / 4);
        const tieMesh = new THREE.Mesh(tieGeo, beamMat);
        tieMesh.position.set(xAnchor, OVERHEAD_RAIL_Y - 0.7, -0.8);
        scene.add(tieMesh);
    });

    // 6. INDUSTRIAL HIGH-BAY LED FLOODLIGHT FIXTURES MOUNTED TO GANTRY CORNERS
    // Physically gives a source to the studio spotlighting!
    const fixtureMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
    const lensMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 2.2
    });

    [-15, 15].forEach((xPos, idx) => {
        const floodlightGroup = new THREE.Group();
        floodlightGroup.position.set(xPos, OVERHEAD_RAIL_Y + 0.6, 0.5);

        // Mounting Bracket Yoke
        const yokeGeo = new THREE.BoxGeometry(0.1, 0.45, 0.6);
        const yoke = new THREE.Mesh(yokeGeo, fixtureMat);
        floodlightGroup.add(yoke);

        // Lamp Housing Body angled downward toward tank center
        const housingGeo = new THREE.BoxGeometry(0.8, 0.4, 0.5);
        const housing = new THREE.Mesh(housingGeo, fixtureMat);
        housing.rotation.x = 0.45;
        housing.rotation.y = idx === 0 ? 0.35 : -0.35;
        floodlightGroup.add(housing);

        // Glowing Glass Front Lens
        const lensGeo = new THREE.PlaneGeometry(0.7, 0.32);
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.set(0, 0, 0.26);
        housing.add(lens);

        scene.add(floodlightGroup);
    });

    // 7. Trolley Hoist, Wire Rope & Immersion Clamp
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
    // 1. PROCEDURAL 3D CAR DOOR ASSEMBLY
    // =========================================================
    function buildProceduralDoor(baseMaterial) {
        const doorAssembly = new THREE.Group();

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

        const hBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.08), frameMat.clone());
        hBase.position.set(0.9, -0.15, 0.22);
        doorAssembly.add(hBase);
        const hGrip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.12), darkTrimMat.clone());
        hGrip.position.set(0.9, -0.15, 0.28);
        doorAssembly.add(hGrip);

        const mArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.4), darkTrimMat.clone());
        mArm.position.set(-1.7, 0.55, 0.38);
        doorAssembly.add(mArm);
        const mHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), frameMat.clone());
        mHead.position.set(-1.7, 0.55, 0.58);
        mHead.scale.set(0.6, 0.8, 1.0);
        doorAssembly.add(mHead);

        for (let i = 0; i < 3; i++) {
            const rib = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.04, 0.08), baseMaterial.clone());
            rib.position.set(0, -0.8 + i * 0.5, -0.26);
            doorAssembly.add(rib);
        }

        const btm = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.42), darkTrimMat.clone());
        btm.position.set(0, -1.12, 0);
        doorAssembly.add(btm);

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

    // =========================================================
    // 2. PROCEDURAL 3D VOLUMETRIC HEART SHAPE 💖
    // =========================================================
    function buildProceduralHeart(baseMaterial) {
        const group = new THREE.Group();
        const x = 0, y = 0;
        const heartShape = new THREE.Shape();
        heartShape.moveTo(x, y + 0.45);
        heartShape.bezierCurveTo(x, y + 0.85, x - 0.45, y + 1.25, x - 0.95, y + 1.25);
        heartShape.bezierCurveTo(x - 1.55, y + 1.25, x - 1.55, y + 0.65, x - 1.55, y + 0.65);
        heartShape.bezierCurveTo(x - 1.55, y + 0.15, x - 1.05, y - 0.55, x, y - 1.35);
        heartShape.bezierCurveTo(x + 1.05, y - 0.55, x + 1.55, y + 0.15, x + 1.55, y + 0.65);
        heartShape.bezierCurveTo(x + 1.55, y + 0.65, x + 1.55, y + 1.25, x + 0.95, y + 1.25);
        heartShape.bezierCurveTo(x + 0.45, y + 1.25, x, y + 0.85, x, y + 0.45);

        const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
            depth: 0.65,
            bevelEnabled: true,
            bevelSegments: 6,
            steps: 2,
            bevelSize: 0.18,
            bevelThickness: 0.18
        });
        heartGeo.center();
        const heartMesh = new THREE.Mesh(heartGeo, baseMaterial.clone());
        heartMesh.castShadow = true;
        heartMesh.receiveShadow = true;
        group.add(heartMesh);

        // Top Hoist Hanging Loop
        const ringGeo = new THREE.TorusGeometry(0.18, 0.04, 12, 24);
        const ringMesh = new THREE.Mesh(ringGeo, baseMaterial.clone());
        ringMesh.position.set(0, 1.25, 0);
        group.add(ringMesh);

        // 50% Scaled Compact Size
        group.scale.set(0.45, 0.45, 0.45);
        return group;
    }

    // =========================================================
    // 3. PROCEDURAL 3D CHUBBY TEDDY BEAR 🧸
    // =========================================================
    function buildProceduralTeddy(baseMaterial) {
        const group = new THREE.Group();

        // Head
        const headGeo = new THREE.SphereGeometry(0.72, 20, 20);
        const head = new THREE.Mesh(headGeo, baseMaterial.clone());
        head.position.set(0, 0.25, 0);
        head.scale.set(1.0, 0.92, 0.9);
        head.castShadow = true;
        group.add(head);

        // Ears
        [-0.58, 0.58].forEach(x => {
            const earGeo = new THREE.SphereGeometry(0.28, 16, 16);
            const ear = new THREE.Mesh(earGeo, baseMaterial.clone());
            ear.position.set(x, 0.82, 0);
            ear.scale.set(1.0, 1.0, 0.45);
            ear.castShadow = true;
            group.add(ear);
        });

        // Muzzle
        const muzzleGeo = new THREE.SphereGeometry(0.32, 16, 16);
        const muzzle = new THREE.Mesh(muzzleGeo, baseMaterial.clone());
        muzzle.position.set(0, 0.1, 0.55);
        muzzle.scale.set(1.0, 0.75, 0.85);
        group.add(muzzle);

        // Cute Nose
        const noseGeo = new THREE.SphereGeometry(0.09, 12, 12);
        const nose = new THREE.Mesh(noseGeo, darkTrimMat.clone());
        nose.position.set(0, 0.2, 0.8);
        group.add(nose);

        // Eyes
        [-0.22, 0.22].forEach(x => {
            const eyeGeo = new THREE.SphereGeometry(0.065, 10, 10);
            const eye = new THREE.Mesh(eyeGeo, darkTrimMat.clone());
            eye.position.set(x, 0.36, 0.65);
            group.add(eye);
        });

        // Chubby Body
        const bodyGeo = new THREE.SphereGeometry(0.95, 20, 20);
        const body = new THREE.Mesh(bodyGeo, baseMaterial.clone());
        body.position.set(0, -1.0, 0);
        body.scale.set(1.0, 1.15, 0.95);
        body.castShadow = true;
        group.add(body);

        // Arms
        [-0.95, 0.95].forEach((x, idx) => {
            const armGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.85, 16);
            const arm = new THREE.Mesh(armGeo, baseMaterial.clone());
            arm.position.set(x, -0.85, 0.18);
            arm.rotation.z = idx === 0 ? 0.55 : -0.55;
            arm.rotation.x = -0.3;
            arm.castShadow = true;
            group.add(arm);
        });

        // Legs
        [-0.52, 0.52].forEach(x => {
            const legGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.75, 16);
            const leg = new THREE.Mesh(legGeo, baseMaterial.clone());
            leg.position.set(x, -1.9, 0.2);
            leg.rotation.x = -0.35;
            leg.castShadow = true;
            group.add(leg);
        });

        // Top Hoist Hanging Loop
        const ringGeo = new THREE.TorusGeometry(0.18, 0.04, 12, 24);
        const ringMesh = new THREE.Mesh(ringGeo, baseMaterial.clone());
        ringMesh.position.set(0, 1.05, 0);
        group.add(ringMesh);

        // 50% Scaled Compact Size
        group.scale.set(0.425, 0.425, 0.425);
        return group;
    }

    // =========================================================
    // 4. PROCEDURAL 3D MODERN INDUSTRIAL CHAIR 🪑
    // =========================================================
    function buildProceduralChair(baseMaterial) {
        const group = new THREE.Group();

        // Curved Seat
        const seatGeo = new THREE.BoxGeometry(1.9, 0.14, 1.8);
        const seat = new THREE.Mesh(seatGeo, baseMaterial.clone());
        seat.position.set(0, -0.2, 0);
        seat.castShadow = true;
        group.add(seat);

        // Ergonomic Curved Backrest
        const backGeo = new THREE.BoxGeometry(1.8, 1.4, 0.12);
        const back = new THREE.Mesh(backGeo, baseMaterial.clone());
        back.position.set(0, 0.8, -0.8);
        back.castShadow = true;
        group.add(back);

        // Backrest Support Tubes
        [-0.65, 0.65].forEach(x => {
            const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 12);
            const post = new THREE.Mesh(postGeo, baseMaterial.clone());
            post.position.set(x, 0.3, -0.8);
            group.add(post);
        });

        // 4 Steel Legs
        const legCoords = [
            [-0.8, -0.85, 0.75],
            [0.8, -0.85, 0.75],
            [-0.8, -0.85, -0.75],
            [0.8, -0.85, -0.75]
        ];
        legCoords.forEach(([x, y, z]) => {
            const legGeo = new THREE.CylinderGeometry(0.045, 0.035, 1.35, 12);
            const leg = new THREE.Mesh(legGeo, baseMaterial.clone());
            leg.position.set(x, y, z);
            leg.castShadow = true;
            group.add(leg);
        });

        // Horizontal Leg Reinforcement Bars
        const strHGeo = new THREE.BoxGeometry(1.6, 0.04, 0.04);
        const str1 = new THREE.Mesh(strHGeo, baseMaterial.clone());
        str1.position.set(0, -0.95, 0.75);
        group.add(str1);

        const str2 = new THREE.Mesh(strHGeo, baseMaterial.clone());
        str2.position.set(0, -0.95, -0.75);
        group.add(str2);

        // Top Hoist Hanging Loop
        const ringGeo = new THREE.TorusGeometry(0.18, 0.04, 12, 24);
        const ringMesh = new THREE.Mesh(ringGeo, baseMaterial.clone());
        ringMesh.position.set(0, 1.6, -0.8);
        group.add(ringMesh);

        // 50% Scaled Compact Size
        group.scale.set(0.425, 0.425, 0.425);
        return group;
    }

    // =========================================================
    // 5. PROCEDURAL 3D MINI TOY CAR 🚙
    // =========================================================
    function buildProceduralToyCar(baseMaterial) {
        const group = new THREE.Group();

        // Main Lower Body
        const bodyGeo = new THREE.BoxGeometry(2.8, 0.7, 1.5);
        const body = new THREE.Mesh(bodyGeo, baseMaterial.clone());
        body.position.set(0, 0, 0);
        body.castShadow = true;
        group.add(body);

        // Rounded Front Nose and Rear Bumper
        const noseGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.5, 16);
        noseGeo.rotateX(Math.PI / 2);
        const nose = new THREE.Mesh(noseGeo, baseMaterial.clone());
        nose.position.set(1.35, -0.05, 0);
        group.add(nose);

        const tail = new THREE.Mesh(noseGeo, baseMaterial.clone());
        tail.position.set(-1.35, -0.05, 0);
        group.add(tail);

        // Bubble Cabin Roof
        const cabinGeo = new THREE.BoxGeometry(1.5, 0.65, 1.35);
        const cabin = new THREE.Mesh(cabinGeo, baseMaterial.clone());
        cabin.position.set(-0.1, 0.6, 0);
        cabin.castShadow = true;
        group.add(cabin);

        // Windshield and Windows
        const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 1.25), darkTrimMat.clone());
        frontGlass.position.set(0.65, 0.55, 0);
        frontGlass.rotation.z = -0.35;
        group.add(frontGlass);

        const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 1.25), darkTrimMat.clone());
        rearGlass.position.set(-0.85, 0.55, 0);
        rearGlass.rotation.z = 0.35;
        group.add(rearGlass);

        // 4 Chunky Wheels
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
        const wheelPositions = [
            [0.85, -0.35, 0.82],
            [-0.85, -0.35, 0.82],
            [0.85, -0.35, -0.82],
            [-0.85, -0.35, -0.82]
        ];
        wheelPositions.forEach(([wx, wy, wz]) => {
            const wheelGroup = new THREE.Group();
            wheelGroup.position.set(wx, wy, wz);

            const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 16);
            tireGeo.rotateX(Math.PI / 2);
            const tire = new THREE.Mesh(tireGeo, tireMat);
            tire.castShadow = true;
            wheelGroup.add(tire);

            const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.24, 12);
            hubGeo.rotateX(Math.PI / 2);
            const hub = new THREE.Mesh(hubGeo, baseMaterial.clone());
            wheelGroup.add(hub);

            group.add(wheelGroup);
        });

        // Glowing Yellow Headlights
        const hlGeo = new THREE.SphereGeometry(0.13, 12, 12);
        const hlMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.2 });
        [-0.45, 0.45].forEach(z => {
            const hl = new THREE.Mesh(hlGeo, hlMat);
            hl.position.set(1.42, 0.12, z);
            group.add(hl);
        });

        // Top Hoist Hanging Loop on Roof
        const ringGeo = new THREE.TorusGeometry(0.18, 0.04, 12, 24);
        const ringMesh = new THREE.Mesh(ringGeo, baseMaterial.clone());
        ringMesh.position.set(-0.1, 1.05, 0);
        group.add(ringMesh);

        // 50% Scaled Compact Size
        group.scale.set(0.45, 0.45, 0.45);
        return group;
    }

    // =========================================================
    // BUILD ALL 5 CARRIER OBJECTS (Door + 4 Random Candidates)
    // =========================================================
    // 1. Car Door
    rawSteelDoorMesh = buildProceduralDoor(globalRawSteelMat);
    coatedDoorMesh = buildProceduralDoor(globalCoatedPaintMat);
    const doorHolder = new THREE.Group();
    doorHolder.add(rawSteelDoorMesh);
    doorHolder.add(coatedDoorMesh);
    doorGroup.add(doorHolder);
    carrierItems.door = { group: doorHolder, rawMesh: rawSteelDoorMesh, coatedMesh: coatedDoorMesh, name: 'AUTO CAR DOOR' };

    // 2. Heart 💖 (50% Scaled)
    const heartRaw = buildProceduralHeart(globalRawSteelMat);
    const heartCoated = buildProceduralHeart(globalCoatedPaintMat);
    const heartHolder = new THREE.Group();
    heartHolder.add(heartRaw);
    heartHolder.add(heartCoated);
    heartHolder.position.y = 0.25;
    heartHolder.visible = false;
    doorGroup.add(heartHolder);
    carrierItems.heart = { group: heartHolder, rawMesh: heartRaw, coatedMesh: heartCoated, name: 'METALLIC HEART' };

    // 3. Teddy Bear 🧸 (50% Scaled)
    const teddyRaw = buildProceduralTeddy(globalRawSteelMat);
    const teddyCoated = buildProceduralTeddy(globalCoatedPaintMat);
    const teddyHolder = new THREE.Group();
    teddyHolder.add(teddyRaw);
    teddyHolder.add(teddyCoated);
    teddyHolder.position.y = 0.35;
    teddyHolder.visible = false;
    doorGroup.add(teddyHolder);
    carrierItems.teddy = { group: teddyHolder, rawMesh: teddyRaw, coatedMesh: teddyCoated, name: 'PRECISION TEDDY' };

    // 4. Modern Chair 🪑 (50% Scaled)
    const chairRaw = buildProceduralChair(globalRawSteelMat);
    const chairCoated = buildProceduralChair(globalCoatedPaintMat);
    const chairHolder = new THREE.Group();
    chairHolder.add(chairRaw);
    chairHolder.add(chairCoated);
    chairHolder.position.y = 0.15;
    chairHolder.visible = false;
    doorGroup.add(chairHolder);
    carrierItems.chair = { group: chairHolder, rawMesh: chairRaw, coatedMesh: chairCoated, name: 'MODERN CHAIR' };

    // 5. Toy Car 🚙 (50% Scaled)
    const toyCarRaw = buildProceduralToyCar(globalRawSteelMat);
    const toyCarCoated = buildProceduralToyCar(globalCoatedPaintMat);
    const toyCarHolder = new THREE.Group();
    toyCarHolder.add(toyCarRaw);
    toyCarHolder.add(toyCarCoated);
    toyCarHolder.position.y = 0.32;
    toyCarHolder.visible = false;
    doorGroup.add(toyCarHolder);
    carrierItems.toyCar = { group: toyCarHolder, rawMesh: toyCarRaw, coatedMesh: toyCarCoated, name: 'MINI TOY CAR' };

    // Set initial active item
    switchActiveCarrierItem(CARRIER_SEQUENCE[0]);

    // =========================================================
    // LOAD REAL 3D COLLADA MODEL (.dae) FROM FILE (Optional Upgrade)
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

                    const box = new THREE.Box3().setFromObject(sketchupScene);
                    const center = box.getCenter(new THREE.Vector3());
                    sketchupScene.position.set(-center.x, -center.y, -center.z);

                    const wrapperGroup = new THREE.Group();
                    wrapperGroup.add(sketchupScene);

                    const rawGroup = wrapperGroup.clone(true);
                    rawGroup.traverse((child) => {
                        if (child && child.isMesh) {
                            child.material = globalRawSteelMat.clone();
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    const coatedGroup = wrapperGroup.clone(true);
                    coatedGroup.traverse((child) => {
                        if (child && child.isMesh) {
                            child.material = globalCoatedPaintMat.clone();
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    doorHolder.remove(rawSteelDoorMesh);
                    doorHolder.remove(coatedDoorMesh);

                    rawSteelDoorMesh = rawGroup;
                    coatedDoorMesh = coatedGroup;

                    doorHolder.add(rawSteelDoorMesh);
                    doorHolder.add(coatedDoorMesh);

                    carrierItems.door.rawMesh = rawSteelDoorMesh;
                    carrierItems.door.coatedMesh = coatedDoorMesh;

                    console.log('Successfully loaded 3D DAE car door model');
                } catch (e) {
                    console.warn('Error processing loaded DAE model, keeping 3D procedural door:', e);
                }
            },
            undefined,
            function (error) {
                console.warn('Collada DAE load skipped/failed. Using high-quality 3D procedural car door model instead.', error);
            }
        );
    }

    // DIAGONAL HYDRAULIC TILTING PISTON ARMS ATTACHED TO RIG
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

// Switch active carrier item (Door, Heart, Teddy, Chair, ToyCar)
function switchActiveCarrierItem(key) {
    activeCarrierKey = key;
    Object.keys(carrierItems).forEach(k => {
        if (carrierItems[k] && carrierItems[k].group) {
            carrierItems[k].group.visible = (k === key);
        }
    });
    updateTelemetrySpriteText(key);
}

function updateTelemetrySpriteText(key) {
    if (!telemetryTextSprite) return;
    const item = carrierItems[key];
    const itemName = item ? item.name : 'AUTO CAR DOOR';

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 105;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(24, 24, 27, 0.92)';
    ctx.fillRect(0, 0, 320, 105);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 316, 101);
    ctx.font = 'bold 14px "Söhne Mono", "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`⚡ ED BATCH: ${itemName}`, 14, 30);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🌡️ TEMP: 28.5°C | pH: 6.25', 14, 58);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('📐 COAT FILM: 22.5μm PASS', 14, 86);

    const newTex = new THREE.CanvasTexture(canvas);
    if (telemetryTextSprite.material.map) {
        telemetryTextSprite.material.map.dispose();
    }
    telemetryTextSprite.material.map = newTex;
    telemetryTextSprite.material.needsUpdate = true;
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

let targetCameraDistance = null;

function updateCameraZoom() {
    if (!camera || !controls || targetCameraDistance === null) return;

    const offset = camera.position.clone().sub(controls.target);
    const currentDist = offset.length();

    if (Math.abs(currentDist - targetCameraDistance) < 0.05) {
        offset.setLength(targetCameraDistance);
        camera.position.copy(controls.target).add(offset);
        targetCameraDistance = null;
    } else {
        const newDist = THREE.MathUtils.lerp(currentDist, targetCameraDistance, 0.12);
        offset.setLength(newDist);
        camera.position.copy(controls.target).add(offset);
    }
}

if (btnZoomIn) {
    btnZoomIn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!camera || !controls) return;
        const currentDist = camera.position.distanceTo(controls.target);
        const baseDist = (targetCameraDistance !== null) ? targetCameraDistance : currentDist;
        targetCameraDistance = Math.max(9.0, baseDist - 4.5);
    });
}

if (btnZoomOut) {
    btnZoomOut.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!camera || !controls) return;
        const currentDist = camera.position.distanceTo(controls.target);
        const baseDist = (targetCameraDistance !== null) ? targetCameraDistance : currentDist;
        targetCameraDistance = Math.min(46.0, baseDist + 4.5);
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
        updateCameraZoom();
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
    let cycleIndex = Math.floor(elapsed / state.duration);
    let p = (elapsed % state.duration) / state.duration;
    state.progress = p;

    // Strict Sequence Flow: Door -> Random 1 -> Random 2 -> Door
    const targetKey = CARRIER_SEQUENCE[cycleIndex % CARRIER_SEQUENCE.length];
    if (activeCarrierKey !== targetKey) {
        switchActiveCarrierItem(targetKey);
    }

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

    // REALTIME WATERLINE CLIPPING KINEMATICS FOR ACTIVE CARRIER ITEM
    // clippingPlaneAbove cuts off everything BELOW POOL_SURFACE_Y (keeps part ABOVE pool)
    // clippingPlaneBelow cuts off everything ABOVE POOL_SURFACE_Y (keeps part BELOW pool)
    const activeItem = carrierItems[activeCarrierKey];
    if (activeItem) {
        if (p < 0.40) {
            // Stage 1: Entry -> 100% Raw Steel Gray, Coated Paint completely hidden
            if (activeItem.rawMesh) activeItem.rawMesh.visible = true;
            if (activeItem.coatedMesh) activeItem.coatedMesh.visible = false;
            applyClippingPlanes(activeItem.rawMesh, []);
        } else if (p < 0.65) {
            // Stage 2: Submerged inside Dip Tank -> Waterline Clipping Split
            if (activeItem.rawMesh) activeItem.rawMesh.visible = true;
            if (activeItem.coatedMesh) activeItem.coatedMesh.visible = true;
            applyClippingPlanes(activeItem.rawMesh, [clippingPlaneAbove]);
            applyClippingPlanes(activeItem.coatedMesh, [clippingPlaneBelow]);
        } else {
            // Stage 3: Post-dip emergence -> 100% Royal Blue Glossy ED Paint Coated
            if (activeItem.rawMesh) activeItem.rawMesh.visible = false;
            if (activeItem.coatedMesh) activeItem.coatedMesh.visible = true;
            applyClippingPlanes(activeItem.coatedMesh, []);
        }
    }

    animateFluidWaves(timeSec, S);

    // Ultra-Smooth Orbit-Safe Camera Distance Zoom Interpolation
    updateCameraZoom();

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
