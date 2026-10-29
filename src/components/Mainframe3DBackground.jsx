import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Pause, Play, Compass } from 'lucide-react';
import { SPIRITS } from '../engine/necromancyEngine';

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

    // Top IBM Blue Header Nameplate
    const headerGeo = new THREE.BoxGeometry(2.12, 0.26, 0.02);
    const headerMat = new THREE.MeshStandardMaterial({
      color: 0x0f2b48, // Authentic IBM Deep Blue
      roughness: 0.2,
      metalness: 0.4
    });
    const header = new THREE.Mesh(headerGeo, headerMat);
    header.position.set(0, 1.84, 0.73);
    mainframeGroup.add(header);

    // 6. Magnetic Tape Reels (Left Supply & Right Take-up)
    // High-contrast polished chrome flanges with prominent cutouts and silver registration rim bolts
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

    // 8. Console Display Panel with 32 Blinking Pilot Register Lights
    const consoleGeo = new THREE.BoxGeometry(2.05, 0.82, 0.16);
    const consoleMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.4, metalness: 0.6 });
    const consoleBox = new THREE.Mesh(consoleGeo, consoleMat);
    consoleBox.position.set(0, -1.34, 0.75);
    mainframeGroup.add(consoleBox);

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
          -1.24 - r * 0.16,
          0.84
        );
        mainframeGroup.add(lamp);
        lights.push(lamp);
      }
    }
    registerLightsRef.current = lights;

    // 9. REAR CABINET DETAILS (Visible during 360-degree rotation)
    // Rear Inset Panel
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

    // IBM Specification Plate on Rear
    const specPlateGeo = new THREE.BoxGeometry(0.8, 0.4, 0.02);
    const specPlateMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.2 });
    const specPlate = new THREE.Mesh(specPlateGeo, specPlateMat);
    specPlate.position.set(0, -1.2, -0.72);
    mainframeGroup.add(specPlate);

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
      <div className="absolute bottom-20 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#181818]/85 hover:bg-[#222222]/90 backdrop-blur-md border border-[#2a2a2a] text-[#a3a3a3] text-[11px] font-sans shadow-lg transition-all select-none">
        <button
          onClick={handleToggleAutoRotate}
          className="flex items-center gap-1.5 hover:text-white cursor-pointer px-1.5 py-0.5 rounded-full transition-colors"
          title={isAutoRotate ? 'Pause 3D auto-rotation' : 'Start 3D auto-rotation'}
        >
          {isAutoRotate ? (
            <>
              <RotateCw className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-neutral-200">3D Rotating</span>
            </>
          ) : (
            <>
              <Pause className="w-3 h-3 text-amber-400" />
              <span>3D Paused</span>
            </>
          )}
        </button>

        <span className="text-[#3a3a3a]">•</span>

        <button
          onClick={handleResetOrientation}
          className="hover:text-white cursor-pointer px-1 py-0.5 rounded transition-colors"
          title="Reset 3D Mainframe angle to front center"
        >
          <Compass className="w-3 h-3" />
        </button>

        <span className="hidden sm:inline text-[#555] text-[10px]">
          (Drag to spin)
        </span>
      </div>
    </div>
  );
}
