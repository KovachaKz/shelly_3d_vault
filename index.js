import * as THREE from "three";
import getLayer from "./getLayer.js";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";
import { STLLoader } from "jsm/loaders/STLLoader.js";
import { RGBELoader } from "jsm/loaders/RGBELoader.js";

/** Variants config: label + file path */
const VARIANTS = {
  plus1pm: { label: "Shelly Plus 1PM", url: "./assets/shelly2.glb", scale: 1, description: "WiFi relay with one channel and power metering", type: "gltf" },
  plus2pm: { label: "Shelly Plus 2PM", url: "./assets/shelly.glb", scale: 1, description: "WiFi relay with two channels and power metering", type: "gltf" },
  plusi4:  { label: "Shelly Plus i4",  url: "./assets/shelly1.glb", scale: 1, description: "WiFi universal input module with 4 inputs", type: "gltf" },
  duorgbw: { label: "Shelly Duo RGBW", url: "./assets/duo_rgbw.glb", scale: 1, description: "WiFi RGBW smart bulb", type: "gltf" },
  pro1:  { label: "Shelly Pro 1",  url: "./assets/pro1.glb", scale: 1, description: "Professional grade relay with WiFi and Ethernet", type: "gltf" },
  pro1pm:  { label: "Shelly Pro 1PM",  url: "./assets/pro1pm.glb", scale: 1, description: "Professional relay with power metering, WiFi and Ethernet", type: "gltf" },
  pro2pm:  { label: "Shelly Pro 2PM",  url: "./assets/pro2pm.glb", scale: 1, description: "Professional relay with dual channels, power metering, WiFi and Ethernet", type: "gltf" },
  pro1dimmer:  { label: "Shelly Pro Dimmer1PM",  url: "./assets/pro1dimmer.glb", scale: 1, description: "Professional dimmer with power metering and dual communication", type: "gltf" },
  pro3em:  { label: "Shelly Pro 3EM",  url: "./assets/pro3em.glb", scale: 1, description: "Professional three-phase energy meter", type: "gltf" },
  
  // STL Models - 3D Parts & Accessories
  wallstand45: { label: "Wall Display Stand 45°", url: "./assets/wall_display_stand_45.stl", scale: 0.05, description: "3D printed wall mount stand at 45-degree angle", type: "stl" },
  wallstandflat: { label: "Wall Display Stand Flat", url: "./assets/wall_display_stand_flat_back.stl", scale: 0.05, description: "3D printed flat back wall mount stand", type: "stl" },
  wallfastener: { label: "Wall Fastener", url: "./assets/wall_display_stand_fastener.stl", scale: 0.05, description: "3D printed fastener for wall mount", type: "stl" },
  wallfastenerhigh: { label: "Wall Fastener High", url: "./assets/wall_display_stand_fastener_high.stl", scale: 0.05, description: "3D printed high fastener for wall mount", type: "stl" },
  shelly_trv: { label: "Shelly TRV", url: "./assets/shelly-trv.stl", scale: 0.05, description: "Shelly thermostatic radiator valve replacement part", type: "stl" },
  sensor_magnet: { label: "Sensor Magnet", url: "./assets/sensor-magnet.stl", scale: 0.05, description: "Replacement magnet for BLU door/window sensor", type: "stl" },
  sensor_up: { label: "Sensor Up", url: "./assets/sensor-up.stl", scale: 0.05, description: "BLU door/window sensor - upright orientation", type: "stl" },
  sensor_down: { label: "Sensor Down", url: "./assets/sensor-down.stl", scale: 0.05, description: "BLU door/window sensor - downward orientation", type: "stl" },
  sensor_left: { label: "Sensor Left", url: "./assets/sensor-left.stl", scale: 0.05, description: "BLU door/window sensor - left orientation", type: "stl" },
  sensor_right: { label: "Sensor Right", url: "./assets/sensor-right.stl", scale: 0.05, description: "BLU door/window sensor - right orientation", type: "stl" },
  magnet: { label: "Magnet", url: "./assets/magnet.stl", scale: 0.05, description: "Replacement magnet component", type: "stl" },
};

// --- Three.js setup ----------------------------------------------------------
const w = window.innerWidth, h = window.innerHeight;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // default dark gray

const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
camera.position.set(3, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- Lighting ---------------------------------------------------------------
const hemi = new THREE.HemisphereLight(0xffffff, 0x404040, 0.6);
hemi.position.set(0, 20, 0);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(5, 10, 7);
scene.add(dir);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// Optional: environment HDR map for PBR
const pmrem = new THREE.PMREMGenerator(renderer);
new RGBELoader()
  .setPath("https://threejs.org/examples/textures/equirectangular/")
  .load("royal_esplanade_1k.hdr", (hdrTex) => {
    const envMap = pmrem.fromEquirectangular(hdrTex).texture;
    scene.environment = envMap;
    hdrTex.dispose();
  });

// --- Gradient background sprites -------------------------------------------
const gradientBackground = getLayer({
  hue: 0.5,
  numSprites: 8,
  opacity: 0.18,
  radius: 10,
  size: 24,
  z: -15.5,
});
scene.add(gradientBackground);

// --- Model loader / variant handling ---------------------------------------
const gltfLoader = new GLTFLoader();
const stlLoader = new STLLoader();
const cache = new Map();
let currentModel = null;

async function setVariant(name) {
  const cfg = VARIANTS[name];
  if (!cfg) return;

  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

  let model = cache.get(name);
  if (!model) {
    try {
      if (cfg.type === "stl") {
        // Load STL model
        model = await new Promise((resolve, reject) => {
          stlLoader.load(cfg.url, (geometry) => {
            // Create mesh from geometry
            const material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
            const mesh = new THREE.Mesh(geometry, material);
            
            // Apply scale
            if (cfg.scale && cfg.scale !== 1) {
              mesh.scale.setScalar(cfg.scale);
            }
            
            // Apply standard STL rotation to match test viewer orientation
            mesh.rotation.x = -Math.PI / 2;
            
            resolve(mesh);
          }, undefined, reject);
        });
      } else {
        // Load GLTF model (default)
        model = await new Promise((resolve, reject) => {
          gltfLoader.load(cfg.url, (gltf) => resolve(gltf.scene), undefined, reject);
        });
        if (cfg.scale && cfg.scale !== 1) model.scale.setScalar(cfg.scale);
      }
      cache.set(name, model);
    } catch (error) {
      console.error("Error loading model:", error);
      setStatus(`Error loading: ${cfg.label}`);
      return;
    }
  }

  currentModel = model;
  scene.add(currentModel);
  frameObject(model, camera, controls);
  placeGridAtModelFloor(model);
  setStatus(`Loaded: ${cfg.label}`);
  
  // Call diagnostic logging after model is added to scene
  setTimeout(() => {
    diagnosticModelInfo();
  }, 100);
}

// --- Diagnostic function for model information ---
function diagnosticModelInfo() {
  if (!currentModel) {
    console.log('No model loaded');
    return;
  }
  
  const box = new THREE.Box3().setFromObject(currentModel);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  
  console.log('=== Model Diagnostic Info ===');
  console.log('Model Position:', currentModel.position);
  console.log('Bounding Box Center:', center);
  console.log('Bounding Box Size:', size);
  console.log('Model Rotation:', currentModel.rotation);
  console.log('================================');
}

function frameObject(object, cam, controls) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());

  const fitDist = size / (2 * Math.tan((cam.fov * Math.PI) / 360));
  const dir = new THREE.Vector3(1, 0.6, 1).normalize();
  cam.position.copy(center).add(dir.multiplyScalar(fitDist * 1.3));
  cam.near = size / 100;
  cam.far = size * 10;
  cam.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}

// --- Grid Helper ------------------------------------------------------------
const grid = new THREE.GridHelper(10, 20, 0x00ccff, 0x0088ff);
grid.material.linewidth = 2;
grid.material.opacity = 0.8;
grid.material.transparent = true;
grid.visible = false;
scene.add(grid);

function placeGridAtModelFloor(object3D) {
  const box = new THREE.Box3().setFromObject(object3D);
  grid.position.y = box.min.y;
}

// --- Buttons wiring ---------------------------------------------------------
const btnAuto = document.getElementById("btnAuto");
const btnBg   = document.getElementById("btnBg");
const btnGrid = document.getElementById("btnGrid");

// create a small status line under the panel row (no HTML edit needed)
const panelEl = document.querySelector(".panel");
const statusEl = document.createElement("div");
statusEl.id = "status";
statusEl.style.marginTop = "8px";
statusEl.style.opacity = "0.75";
statusEl.style.fontSize = "12px";
panelEl.appendChild(statusEl);

function setStatus(text) {
  statusEl.textContent = text || "";
}

btnAuto.addEventListener("click", () => {
  controls.autoRotate = !controls.autoRotate;
  btnAuto.setAttribute("aria-pressed", String(controls.autoRotate));
  setStatus(`Auto-rotate: ${controls.autoRotate ? "ON" : "OFF"}`);
});

// Background toggle FIX:
// Instead of toggling the page body, toggle the THREE background + gradient layer.
let bgOn = true;                          // default ON (matches initial scene)
btnBg.setAttribute("aria-pressed", "true");
btnBg.addEventListener("click", () => {
  bgOn = !bgOn;

  // show/hide the gradient sprites
  gradientBackground.visible = bgOn;

  // switch scene clear color to emphasize change
  scene.background = new THREE.Color(bgOn ? 0x1a1a1a : 0x111111);
  renderer.setClearColor(scene.background, 1);

  btnBg.setAttribute("aria-pressed", String(bgOn));
  setStatus(`Background: ${bgOn ? "ON" : "OFF"}`);
});

btnGrid.addEventListener("click", () => {
  grid.visible = !grid.visible;
  btnGrid.setAttribute("aria-pressed", String(grid.visible));
  setStatus(`Grid: ${grid.visible ? "ON" : "OFF"}`);
});

// --- Variant selector & recenter -------------------------------------------
const selectEl = document.getElementById("variant");
const recenterBtn = document.getElementById("recenter");

selectEl.addEventListener("change", () => setVariant(selectEl.value));
recenterBtn.addEventListener("click", () => {
  if (currentModel) {
    frameObject(currentModel, camera, controls);
    setStatus("Re-centered");
  }
});

// Load initial model
setVariant(selectEl.value);

// --- Modal functionality ----------------------------------------------------
const shortcutsModal = document.getElementById("shortcutsModal");
const infoModal = document.getElementById("infoModal");
const btnShortcuts = document.getElementById("btnShortcuts");
const btnDownload = document.getElementById("btnDownload");
const btnInfo = document.getElementById("btnInfo");
const closeShortcuts = document.getElementById("closeShortcuts");
const closeInfo = document.getElementById("closeInfo");

btnShortcuts.addEventListener("click", () => {
  shortcutsModal.classList.add("active");
});

closeShortcuts.addEventListener("click", () => {
  shortcutsModal.classList.remove("active");
});

shortcutsModal.addEventListener("click", (e) => {
  if (e.target === shortcutsModal) {
    shortcutsModal.classList.remove("active");
  }
});

// Info modal
btnInfo.addEventListener("click", () => {
  updateInfoModal();
  infoModal.classList.add("active");
});

closeInfo.addEventListener("click", () => {
  infoModal.classList.remove("active");
});

infoModal.addEventListener("click", (e) => {
  if (e.target === infoModal) {
    infoModal.classList.remove("active");
  }
});

function updateInfoModal() {
  const variant = selectEl.value;
  const cfg = VARIANTS[variant];
  
  document.getElementById("infoModel").textContent = cfg.label;
  document.getElementById("infoFile").textContent = cfg.url.split("/").pop();
  document.getElementById("infoScale").textContent = cfg.scale || "1.0";
  document.getElementById("infoDescription").textContent = cfg.description || "No description available";
  
  // Count vertices if model is loaded
  if (currentModel) {
    let vertexCount = 0;
    currentModel.traverse((node) => {
      if (node.isMesh && node.geometry) {
        vertexCount += node.geometry.attributes.position.count;
      }
    });
    document.getElementById("infoVertices").textContent = vertexCount.toLocaleString();
  } else {
    document.getElementById("infoVertices").textContent = "-";
  }
}

// Download functionality
btnDownload.addEventListener("click", async () => {
  const variant = selectEl.value;
  const cfg = VARIANTS[variant];
  
  if (!cfg) return;
  
  try {
    setStatus("Downloading...");
    const response = await fetch(cfg.url);
    const blob = await response.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${variant}.glb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setStatus(`Downloaded: ${cfg.label}`);
  } catch (error) {
    console.error("Download failed:", error);
    setStatus("Download failed!");
  }
});

// --- Render loop & resize ---------------------------------------------------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
