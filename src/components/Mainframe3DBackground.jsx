import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Pause, Play, Compass } from 'lucide-react';
import { SPIRITS } from '../engine/necromancyEngine';

// --- GLORIFIED IBM TEXTURE GENERATORS ---

/**
 * Generates an illuminated, high-resolution authentic IBM 8-bar header plaque.
 */
function createIBMHeaderTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Deep IBM Blue gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 128);
  bgGrad.addColorStop(0, '#0a213d');
  bgGrad.addColorStop(0.3, '#103258');
  bgGrad.addColorStop(0.7, '#07182c');
  bgGrad.addColorStop(1, '#020b14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 128);

  // Metallic brushed aluminum outer frame
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 4;
  ctx.strokeRect(3, 3, 1018, 122);

  // Subtle cyan neon inner highlight
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(8, 8, 1008, 112);

  // 1. THE GLORIFIED 8-BAR IBM LOGO
  ctx.save();
  ctx.font = '900 84px "Arial Black", "Helvetica", sans-serif';
  ctx.textBaseline = 'middle';
  
  // Neon cyan back-glow
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('IBM', 44, 64);
  ctx.restore();

  // Draw 8 horizontal cuts to form the iconic 8-bar IBM stripes
  ctx.fillStyle = '#07182c';
  const startY = 24;
  const totalH = 80;
  const numBars = 8;
  const gapH = 3.5;
  const barH = (totalH - (numBars - 1) * gapH) / numBars;
  for (let b = 0; b < numBars - 1; b++) {
    const y = startY + (b + 1) * barH + b * gapH;
    ctx.fillRect(40, y, 224, gapH);
  }

  // Vertical brushed metal divider line
  const divGrad = ctx.createLinearGradient(0, 16, 0, 112);
  divGrad.addColorStop(0, 'rgba(148, 163, 184, 0.1)');
  divGrad.addColorStop(0.5, '#94a3b8');
  divGrad.addColorStop(1, 'rgba(148, 163, 184, 0.1)');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(280, 16);
  ctx.lineTo(280, 112);
  ctx.stroke();

  // 2. MODEL IDENTITY: SYSTEM / 360
  ctx.font = '700 36px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 6;
  ctx.fillText('SYSTEM / 360', 305, 50);

  // 3. HARDWARE SPEC: TYPE 2401 TAPE DRIVE
  ctx.font = '600 20px "Courier New", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.shadowBlur = 0;
  ctx.fillText('TYPE 2401 • MAGNETIC TAPE DRIVE', 305, 88);

  // 4. CORPORATE HERITAGE & POWER INDICATOR
  ctx.font = '600 15px "Inter", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'right';
  ctx.fillText('INTERNATIONAL BUSINESS MACHINES CORP.', 980, 48);

  // Glowing Green "READY / ON-LINE" Pilot
  ctx.beginPath();
  ctx.arc(840, 84, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 10;
  ctx.fill();

  ctx.font = '600 14px "Courier New", monospace';
  ctx.fillStyle = '#4ade80';
  ctx.shadowBlur = 0;
  ctx.fillText('READY / ON-LINE', 980, 88);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

/**
 * Generates an authentic circular IBM hubcap texture for magnetic tape reels.
 */
function createReelHubTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Brushed steel radial hub gradient
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  grad.addColorStop(0, '#334155');
  grad.addColorStop(0.7, '#1e293b');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();

  // Chrome outer rim
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Inner hairline ring
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.stroke();

  // Bold "IBM" in center of hub
  ctx.font = '900 64px "Arial Black", "Helvetica", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f8fafc';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;
  ctx.fillText('IBM', 128, 128);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Generates an engraved gold-and-slate IBM 2401 read/write head assembly badge.
 */
function createHeadBadgeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0b131e';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#d4af37'; // Vintage gold trim
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 120);

  ctx.font = '900 48px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('IBM 2401', 256, 46);

  ctx.font = '700 18px "Courier New", monospace';
  ctx.fillStyle = '#d4af37';
  ctx.fillText('9-TRACK HIGH DENSITY TAPE HEAD', 256, 92);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Generates an antique cast-brass manufacturer plaque for the lower console.
 */
function createConsoleBadgeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Antique brass / bronze metallic finish
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#59441b');
  grad.addColorStop(0.5, '#785b24');
  grad.addColorStop(1, '#3b2c10');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 128);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 1016, 120);

  ctx.font = '800 32px "Inter", "Georgia", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 6;
  ctx.fillText('★  INTERNATIONAL BUSINESS MACHINES CORPORATION  ★', 512, 48);

  ctx.font = '600 20px "Courier New", monospace';
  ctx.fillStyle = '#fde047';
  ctx.fillText('SYSTEM / 360 DATA PROCESSING SYSTEM • ARMONK, N.Y.', 512, 90);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Generates an authentic stamped industrial aluminum specification plate for the rear.
 */
function createSpecPlateTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Stamped aluminum finish
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 244);

  // 4 corner mounting rivets
  const rivets = [[20, 20], [492, 20], [20, 236], [492, 236]];
  rivets.forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
  });

  // Stamped bold IBM Header
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 52px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('IBM', 256, 60);

  ctx.font = '700 17px "Inter", sans-serif';
  ctx.fillText('INTERNATIONAL BUSINESS MACHINES CORP.', 256, 94);

  ctx.font = '600 15px "Courier New", monospace';
  ctx.fillText('SYSTEM/360 MAGNETIC TAPE UNIT', 256, 126);
  ctx.fillText('MODEL: 2401-VI   SERIAL NO: 360-1964-PLI', 256, 156);
  ctx.fillText('VOLTS: 208/230V   3-PHASE   60 CYCLES', 256, 186);

  ctx.font = 'italic 13px "Georgia", serif';
  ctx.fillText('MADE IN U.S.A. • ARMONK, NEW YORK', 256, 220);

  return new THREE.CanvasTexture(canvas);
}

export default function Mainframe3DBackground({
  activeSpiritId = 'pli',
  isStreaming = false,
  hasMessages = false
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);

  // 3D Object references
  const mainframeGroupRef = useRef(null);
  const leftReelRef = useRef(null);
  const rightReelRef = useRef(null);
  const tapeLoopLeftRef = useRef(null);
  const tapeLoopRightRef = useRef(null);
  const registerLightsRef = useRef([]);
  const particleSystemRef = useRef(null);

  const spirit = SPIRITS[activeSpiritId] || SPIRITS.pli;

  // Auto-rotation & User Drag State
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const isAutoRotateRef = useRef(true);
  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  const currentRotationYRef = useRef(0);
  const targetRotationYRef = useRef(0);
  const currentRotationXRef = useRef(0);
  const targetRotationXRef = useRef(0);

  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const lastInteractionTimeRef = useRef(0);

  // Tape spooling speed state
  const reelSpeedRef = useRef(2.5);

  useEffect(() => {
    // When streaming, tape spools quickly; when idle, rotates steadily
    reelSpeedRef.current = isStreaming ? 7.8 : 2.5;
  }, [isStreaming]);

  // Reset orientation function
  const handleResetOrientation = (e) => {
    e?.stopPropagation();
    targetRotationYRef.current = 0;
    targetRotationXRef.current = 0;
  };

  const handleToggleAutoRotate = (e) => {
    e?.stopPropagation();
    setIsAutoRotate(prev => !prev);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let width = containerRef.current.clientWidth || window.innerWidth;
    let height = containerRef.current.clientHeight || window.innerHeight;

    // Track created textures for disposal on unmount
    const createdTextures = [];

    // 1. Scene with subtle deep atmospheric fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x030305, 0.08);

    // 2. Camera: slightly raised perspective viewing the mainframe
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 5.8);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing & shadow support
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.replaceChildren(renderer.domElement);

    // 4. Lights: Front Key Light, Spirit Aura, Back Rim Light, Interior Vacuum Glow
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const spiritColor = new THREE.Color(spirit.accentColor || '#f59e0b');

    // Key spotlight from front-top
    const spotLight = new THREE.SpotLight(0xfff5e8, 3.6, 16, Math.PI / 3.8, 0.45, 1);
    spotLight.position.set(0, 5.0, 4.5);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Dynamic spirit neon aura rim light on left
    const auraLight = new THREE.PointLight(spiritColor, 3.4, 10);
    auraLight.position.set(-2.8, 2.2, 2.0);
    scene.add(auraLight);

    // Right cool fill light
    const fillLight = new THREE.PointLight(0x38bdf8, 2.0, 9);
    fillLight.position.set(2.8, 1.6, 2.0);
    scene.add(fillLight);

    // Rear rim light so the cabinet is illuminated and crisp when rotating around
    const rearRimLight = new THREE.DirectionalLight(0x818cf8, 1.4);
    rearRimLight.position.set(1.5, 3.0, -4.5);
    scene.add(rearRimLight);

    // 5. Mainframe Geometry (IBM 2401 Tape Unit on IBM System/360)
    const mainframeGroup = new THREE.Group();
    // Offset slightly down when messages are present to give room to chat column
    mainframeGroup.position.set(0, hasMessages ? -0.28 : 0, -0.6);
    scene.add(mainframeGroup);
    mainframeGroupRef.current = mainframeGroup;

    // Cabinet Main Body: Charcoal IBM Steel
    const cabinetGeo = new THREE.BoxGeometry(2.36, 4.2, 1.38);
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: 0x131720,
      roughness: 0.32,
      metalness: 0.65
    });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    mainframeGroup.add(cabinet);

    // Front Brushed Steel Inset Panel
    const panelGeo = new THREE.BoxGeometry(2.2, 4.02, 0.04);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1d222b,
      roughness: 0.22,
      metalness: 0.85
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 0, 0.70);
    mainframeGroup.add(panel);

    // ─────────────────────────────────────────────────────────
    // TOP GLORIFIED IBM HEADER PLAQUE (Authentic 8-Bar IBM Logo)
    // ─────────────────────────────────────────────────────────
    const headerBoxGeo = new THREE.BoxGeometry(2.14, 0.28, 0.03);
    const headerBoxMat = new THREE.MeshStandardMaterial({
      color: 0x07111c,
      roughness: 0.3,
      metalness: 0.8
    });
    const headerBox = new THREE.Mesh(headerBoxGeo, headerBoxMat);
    headerBox.position.set(0, 1.84, 0.73);
    mainframeGroup.add(headerBox);

    const ibmHeaderTex = createIBMHeaderTexture();
    createdTextures.push(ibmHeaderTex);

    const headerDecalGeo = new THREE.PlaneGeometry(2.12, 0.26);
    const headerDecalMat = new THREE.MeshStandardMaterial({
      map: ibmHeaderTex,
      emissiveMap: ibmHeaderTex,
      emissive: 0x93c5fd,
      emissiveIntensity: 0.42,
      roughness: 0.15,
      metalness: 0.6
    });
    const headerDecal = new THREE.Mesh(headerDecalGeo, headerDecalMat);
    headerDecal.position.set(0, 0, 0.016);
    headerBox.add(headerDecal);

    // 6. Magnetic Tape Reels (Left Supply & Right Take-up)
    // High-contrast polished chrome flanges with prominent cutouts and silver registration rim bolts
    const hubTexture = createReelHubTexture();
    createdTextures.push(hubTexture);

    const createReel = (isLeft) => {
      const reelGroup = new THREE.Group();

      // Outer polished chrome flange
      const flangeGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.025, 36);
      const flangeMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.12,
        metalness: 0.96,
        transparent: true,
        opacity: 0.92
      });
      const frontFlange = new THREE.Mesh(flangeGeo, flangeMat);
      frontFlange.rotation.x = Math.PI / 2;
      reelGroup.add(frontFlange);

      // Back flange
      const backFlange = frontFlange.clone();
      backFlange.position.z = -0.055;
      reelGroup.add(backFlange);

      // Center High-Torque Hub
      const hubGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.07, 32);
      const hubMat = new THREE.MeshStandardMaterial({
        color: 0x1e2430,
        roughness: 0.35,
        metalness: 0.9
      });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.x = Math.PI / 2;
      hub.position.z = -0.028;
      reelGroup.add(hub);

      // Glorified IBM Hubcap Emblem
      const hubcapGeo = new THREE.CircleGeometry(0.18, 32);
      const hubcapMat = new THREE.MeshStandardMaterial({
        map: hubTexture,
        roughness: 0.2,
        metalness: 0.85
      });
      const hubcap = new THREE.Mesh(hubcapGeo, hubcapMat);
      hubcap.position.set(0, 0, 0.012);
      reelGroup.add(hubcap);

      // Tape Pack cylinder (ferric oxide dark brown)
      const radius = isLeft ? 0.47 : 0.34;
      const tapePackGeo = new THREE.CylinderGeometry(radius, radius, 0.05, 36);
      const tapePackMat = new THREE.MeshStandardMaterial({
        color: 0x472718,
        roughness: 0.75,
        metalness: 0.15
      });
      const tapePack = new THREE.Mesh(tapePackGeo, tapePackMat);
      tapePack.rotation.x = Math.PI / 2;
      tapePack.position.z = -0.028;
      reelGroup.add(tapePack);

      // 3 Highly Visible Chrome Radial Spokes with Black Accent Lines
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;

        // Radial Spoke Bar
        const spokeGeo = new THREE.BoxGeometry(0.075, 0.28, 0.025);
        const spokeMat = new THREE.MeshStandardMaterial({
          color: 0x222630,
          roughness: 0.3,
          metalness: 0.9
        });
        const spoke = new THREE.Mesh(spokeGeo, spokeMat);
        spoke.position.set(Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0.016);
        spoke.rotation.z = angle;
        reelGroup.add(spoke);

        // High-Contrast Bright White/Silver Indicator Marker (spins with high visibility)
        const indicatorGeo = new THREE.SphereGeometry(0.038, 12, 12);
        const indicatorMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xcccccc,
          emissiveIntensity: 0.4,
          roughness: 0.1,
          metalness: 0.9
        });
        const indicator = new THREE.Mesh(indicatorGeo, indicatorMat);
        indicator.position.set(Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, 0.02);
        reelGroup.add(indicator);

        // Inner contrasting dot near hub
        const innerDotGeo = new THREE.SphereGeometry(0.024, 10, 10);
        const innerDotMat = new THREE.MeshBasicMaterial({ color: spiritColor });
        const innerDot = new THREE.Mesh(innerDotGeo, innerDotMat);
        innerDot.position.set(Math.cos(angle) * 0.13, Math.sin(angle) * 0.13, 0.02);
        reelGroup.add(innerDot);
      }

      return reelGroup;
    };

    const leftReel = createReel(true);
    leftReel.position.set(-0.56, 1.14, 0.75);
    mainframeGroup.add(leftReel);
    leftReelRef.current = leftReel;

    const rightReel = createReel(false);
    rightReel.position.set(0.56, 1.14, 0.75);
    mainframeGroup.add(rightReel);
    rightReelRef.current = rightReel;

    // Magnetic read/write head assembly between reels
    const headGeo = new THREE.BoxGeometry(0.35, 0.22, 0.09);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x242832, metalness: 0.9, roughness: 0.25 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.82, 0.75);
    mainframeGroup.add(head);

    // Engraved IBM 2401 Badge on the Head Assembly
    const headBadgeTex = createHeadBadgeTexture();
    createdTextures.push(headBadgeTex);

    const headBadgeGeo = new THREE.PlaneGeometry(0.32, 0.08);
    const headBadgeMat = new THREE.MeshStandardMaterial({
      map: headBadgeTex,
      emissiveMap: headBadgeTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.2,
      roughness: 0.25,
      metalness: 0.8
    });
    const headBadge = new THREE.Mesh(headBadgeGeo, headBadgeMat);
    headBadge.position.set(0, 0.035, 0.046);
    head.add(headBadge);

    // Glowing head gap indicator in spirit accent color
    const gapGeo = new THREE.BoxGeometry(0.02, 0.12, 0.10);
    const gapMat = new THREE.MeshBasicMaterial({ color: spiritColor });
    const gap = new THREE.Mesh(gapGeo, gapMat);
    gap.position.set(0, 0.82, 0.76);
    mainframeGroup.add(gap);

    // 7. Vacuum Column Buffer Chambers
    const colFrameGeo = new THREE.BoxGeometry(0.82, 1.42, 0.15);
    const colFrameMat = new THREE.MeshStandardMaterial({ color: 0x0a121a, roughness: 0.3, metalness: 0.8 });

    const leftCol = new THREE.Mesh(colFrameGeo, colFrameMat);
    leftCol.position.set(-0.54, -0.16, 0.74);
    mainframeGroup.add(leftCol);

    const rightCol = new THREE.Mesh(colFrameGeo, colFrameMat);
    rightCol.position.set(0.54, -0.16, 0.74);
    mainframeGroup.add(rightCol);

    // Blue-tinted acrylic inspection glass
    const glassGeo = new THREE.BoxGeometry(0.74, 1.32, 0.02);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.32,
      roughness: 0.1,
      transmission: 0.85
    });
    const leftGlass = new THREE.Mesh(glassGeo, glassMat);
    leftGlass.position.set(-0.54, -0.16, 0.82);
    mainframeGroup.add(leftGlass);

    const rightGlass = new THREE.Mesh(glassGeo, glassMat);
    rightGlass.position.set(0.54, -0.16, 0.82);
    mainframeGroup.add(rightGlass);

    // Vacuum tape loops
    const createLoop = () => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.17, 0.48, 0),
        new THREE.Vector3(-0.15, 0.0, 0),
        new THREE.Vector3(0, -0.42, 0),
        new THREE.Vector3(0.15, 0.0, 0),
        new THREE.Vector3(0.17, 0.48, 0)
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 18, 0.019, 6, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x472718, roughness: 0.6 });
      return new THREE.Mesh(tubeGeo, tubeMat);
    };

    const leftLoop = createLoop();
    leftLoop.position.set(-0.54, -0.16, 0.77);
    mainframeGroup.add(leftLoop);
    tapeLoopLeftRef.current = leftLoop;

    const rightLoop = createLoop();
    rightLoop.position.set(0.54, -0.16, 0.77);
    mainframeGroup.add(rightLoop);
    tapeLoopRightRef.current = rightLoop;

    // ─────────────────────────────────────────────────────────
    // 8. Console Display Panel & Vintage Brass IBM Plaque
    // ─────────────────────────────────────────────────────────
    const consoleGeo = new THREE.BoxGeometry(2.05, 0.82, 0.16);
    const consoleMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.4, metalness: 0.6 });
    const consoleBox = new THREE.Mesh(consoleGeo, consoleMat);
    consoleBox.position.set(0, -1.34, 0.75);
    mainframeGroup.add(consoleBox);

    // Glorified Brass "INTERNATIONAL BUSINESS MACHINES CORPORATION" Plaque
    const consoleBadgeTex = createConsoleBadgeTexture();
    createdTextures.push(consoleBadgeTex);

    const consoleBadgeGeo = new THREE.PlaneGeometry(1.92, 0.14);
    const consoleBadgeMat = new THREE.MeshStandardMaterial({
      map: consoleBadgeTex,
      emissiveMap: consoleBadgeTex,
      emissive: 0xfef08a,
      emissiveIntensity: 0.22,
      roughness: 0.3,
      metalness: 0.8
    });
    const consoleBadge = new THREE.Mesh(consoleBadgeGeo, consoleBadgeMat);
    consoleBadge.position.set(0, 0.28, 0.082);
    consoleBox.add(consoleBadge);

    // 32 Blinking Pilot Register Lamps
    const lights = [];
    const lightCols = 16;
    const lightRows = 2;
    const spacingX = 1.85 / (lightCols - 1);

    for (let r = 0; r < lightRows; r++) {
      for (let c = 0; c < lightCols; c++) {
        const lampGeo = new THREE.SphereGeometry(0.022, 10, 10);
        const isAmber = c % 4 < 2;
        const lampMat = new THREE.MeshStandardMaterial({
          color: isAmber ? 0xf59e0b : 0xef4444,
          emissive: isAmber ? 0xf59e0b : 0xef4444,
          emissiveIntensity: Math.random() > 0.5 ? 1.6 : 0.08,
          roughness: 0.2
        });
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.set(
          -0.92 + c * spacingX,
          -1.28 - r * 0.16,
          0.84
        );
        mainframeGroup.add(lamp);
        lights.push(lamp);
      }
    }
    registerLightsRef.current = lights;

    // ─────────────────────────────────────────────────────────
    // 9. REAR CABINET DETAILS & STAMPED IBM SPECIFICATION PLATE
    // ─────────────────────────────────────────────────────────
    const rearPanelGeo = new THREE.BoxGeometry(2.2, 4.02, 0.04);
    const rearPanelMat = new THREE.MeshStandardMaterial({ color: 0x181c24, roughness: 0.4, metalness: 0.7 });
    const rearPanel = new THREE.Mesh(rearPanelGeo, rearPanelMat);
    rearPanel.position.set(0, 0, -0.70);
    mainframeGroup.add(rearPanel);

    // Rear Cooling Ventilation Louvers
    for (let l = 0; l < 7; l++) {
      const louverGeo = new THREE.BoxGeometry(1.8, 0.08, 0.03);
      const louverMat = new THREE.MeshStandardMaterial({ color: 0x0f131a, roughness: 0.5, metalness: 0.8 });
      const louver = new THREE.Mesh(louverGeo, louverMat);
      louver.position.set(0, 0.8 - l * 0.26, -0.72);
      mainframeGroup.add(louver);
    }

    // Warm Vacuum Tube Internal Glow shining through back vents
    const tubeGlowLight = new THREE.PointLight(0xff6a00, 2.8, 3.8);
    tubeGlowLight.position.set(0, 0, -0.65);
    mainframeGroup.add(tubeGlowLight);

    // Stamped Aluminum IBM Specification Plate on Rear
    const specPlateTex = createSpecPlateTexture();
    createdTextures.push(specPlateTex);

    const specPlateGeo = new THREE.BoxGeometry(0.82, 0.42, 0.02);
    const specPlateMat = new THREE.MeshStandardMaterial({ color: 0x1e2430, metalness: 0.85, roughness: 0.3 });
    const specPlateBox = new THREE.Mesh(specPlateGeo, specPlateMat);
    specPlateBox.position.set(0, -1.2, -0.72);
    mainframeGroup.add(specPlateBox);

    const specPlateDecalGeo = new THREE.PlaneGeometry(0.80, 0.40);
    const specPlateDecalMat = new THREE.MeshStandardMaterial({
      map: specPlateTex,
      roughness: 0.25,
      metalness: 0.75
    });
    const specPlateDecal = new THREE.Mesh(specPlateDecalGeo, specPlateDecalMat);
    specPlateDecal.rotation.y = Math.PI; // Face outwards toward the rear
    specPlateDecal.position.set(0, 0, -0.012);
    specPlateBox.add(specPlateDecal);

    // Heavy Mainframe Floor Cables exiting rear base
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.7, metalness: 0.2 });
    for (let c = 0; c < 3; c++) {
      const cableCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.4 + c * 0.4, -2.0, -0.65),
        new THREE.Vector3(-0.5 + c * 0.5, -2.4, -1.1),
        new THREE.Vector3(-0.6 + c * 0.6, -2.6, -1.8)
      ]);
      const cableGeo = new THREE.TubeGeometry(cableCurve, 14, 0.045, 8, false);
      const cableMesh = new THREE.Mesh(cableGeo, cableMat);
      mainframeGroup.add(cableMesh);
    }

    // 10. SIDE SERVICE PANELS & HANDLES
    const handleGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.28, 12);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

    const leftHandle = new THREE.Mesh(handleGeo, handleMat);
    leftHandle.position.set(-1.19, 0, 0);
    mainframeGroup.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeo, handleMat);
    rightHandle.position.set(1.19, 0, 0);
    mainframeGroup.add(rightHandle);

    // 11. Floating Ethereal Séance Embers / Dust Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVels = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 6.5;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 5.0;
      particleVels.push({
        vx: (Math.random() - 0.5) * 0.006,
        vy: Math.random() * 0.010 + 0.003,
        vz: (Math.random() - 0.5) * 0.006
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: spiritColor,
      size: 0.052,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    particleSystemRef.current = { system: particleSystem, vels: particleVels };

    // 12. Mouse / Touch Drag Orbit Interaction
    const handlePointerDown = (e) => {
      // Allow regular interactions on buttons, inputs, message text, code blocks
      if (e.target && e.target.closest('input, textarea, button, a, [role="button"], pre, code, .markdown-body, .message-bubble-content')) {
        return;
      }
      // On mobile touch devices inside the messages scroll container, let user scroll the chat
      if (e.pointerType === 'touch' && e.target && e.target.closest('.messages-scroll-container')) {
        return;
      }
      isDraggingRef.current = true;
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
      lastInteractionTimeRef.current = Date.now();
    };

    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
      lastInteractionTimeRef.current = Date.now();

      // Orbit rotation
      targetRotationYRef.current += dx * 0.007;
      targetRotationXRef.current = Math.max(-0.45, Math.min(0.45, targetRotationXRef.current + dy * 0.005));
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      lastInteractionTimeRef.current = Date.now();
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 13. High-Performance Render Loop
    let clock = new THREE.Clock();
    let lightTimer = 0;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Continuous 3D Auto-Rotation
      if (isAutoRotateRef.current) {
        // If user dragged recently, give a 2.5 second idle pause before resuming auto-rotation smoothly
        const isRecentlyInteracted = Date.now() - lastInteractionTimeRef.current < 2500;
        if (!isRecentlyInteracted && !isDraggingRef.current) {
          targetRotationYRef.current += delta * 0.35;
        }
      }

      // Smooth dampening / lerp rotation
      currentRotationYRef.current += (targetRotationYRef.current - currentRotationYRef.current) * 0.08;
      currentRotationXRef.current += (targetRotationXRef.current - currentRotationXRef.current) * 0.08;

      if (mainframeGroupRef.current) {
        // Apply 3D Rotation
        mainframeGroupRef.current.rotation.y = currentRotationYRef.current;
        mainframeGroupRef.current.rotation.x = currentRotationXRef.current + Math.sin(elapsedTime * 0.9) * 0.025;
        mainframeGroupRef.current.rotation.z = Math.cos(elapsedTime * 0.7) * 0.015;

        // Ethereal floating levitation bobbing
        mainframeGroupRef.current.position.y = (hasMessages ? -0.28 : 0) + Math.sin(elapsedTime * 1.3) * 0.07;
      }

      // High-Contrast Magnetic Tape Reels Spin
      if (leftReelRef.current) {
        leftReelRef.current.rotation.z += delta * reelSpeedRef.current;
      }
      if (rightReelRef.current) {
        rightReelRef.current.rotation.z += delta * (reelSpeedRef.current * 0.86);
      }

      // Flutter vacuum loops
      if (tapeLoopLeftRef.current) {
        tapeLoopLeftRef.current.position.y = -0.16 + Math.sin(elapsedTime * (isStreaming ? 9.5 : 4.5)) * 0.035;
      }
      if (tapeLoopRightRef.current) {
        tapeLoopRightRef.current.position.y = -0.16 + Math.cos(elapsedTime * (isStreaming ? 8.8 : 4.0)) * 0.035;
      }

      // Blinking register pilot lights
      lightTimer += delta;
      if (lightTimer > 0.09) {
        lightTimer = 0;
        registerLightsRef.current.forEach((lamp) => {
          if (Math.random() > 0.72) {
            const current = lamp.material.emissiveIntensity;
            lamp.material.emissiveIntensity = current > 0.5 ? 0.08 : 1.6;
          }
        });
      }

      // Animate floating ethereal particles
      if (particleSystemRef.current) {
        const pos = particleSystemRef.current.system.geometry.attributes.position.array;
        const vels = particleSystemRef.current.vels;

        for (let i = 0; i < particleCount; i++) {
          pos[i * 3 + 1] += vels[i].vy;
          pos[i * 3] += Math.sin(elapsedTime * 0.8 + i) * 0.002;

          if (pos[i * 3 + 1] > 2.8) {
            pos[i * 3 + 1] = -2.2;
            pos[i * 3] = (Math.random() - 0.5) * 6.0;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
          }
        }
        particleSystemRef.current.system.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      width = containerRef.current.clientWidth || window.innerWidth;
      height = containerRef.current.clientHeight || window.innerHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      createdTextures.forEach((tex) => tex.dispose());
      renderer.dispose();
    };
  }, [activeSpiritId, hasMessages]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none z-0">
      {/* 3D WebGL Canvas */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing" 
        title="IBM System/360 3D Mainframe • Click & drag anywhere to rotate"
      />

      {/* Atmospheric Vignette & Contrast Overlay so chat text is always 100% legible */}
      <div 
        className="absolute inset-0 bg-radial from-black/20 via-black/55 to-[#000000] pointer-events-none" 
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Sleek Floating 3D Control HUD Badge in bottom-right corner */}
      <div className="absolute bottom-20 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141824]/90 hover:bg-[#1e2333]/95 backdrop-blur-md border border-blue-500/30 text-[#cbd5e1] text-[11px] font-sans shadow-xl transition-all select-none">
        <button
          onClick={handleToggleAutoRotate}
          className="flex items-center gap-1.5 hover:text-white cursor-pointer px-1 py-0.5 rounded-full transition-colors"
          title={isAutoRotate ? 'Pause 3D auto-rotation' : 'Start 3D auto-rotation'}
        >
          {isAutoRotate ? (
            <>
              <RotateCw className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-semibold tracking-wider text-blue-200">IBM System/360</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold tracking-wider text-amber-200">IBM Paused</span>
            </>
          )}
        </button>

        <span className="text-[#3a4d66]">•</span>

        <button
          onClick={handleResetOrientation}
          className="hover:text-blue-300 cursor-pointer px-1 py-0.5 rounded transition-colors"
          title="Reset IBM Mainframe to front center"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>

        <span className="hidden sm:inline text-blue-400/60 text-[10px] font-mono">
          [Drag 360°]
        </span>
      </div>
    </div>
  );
}
