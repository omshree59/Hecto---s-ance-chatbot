import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
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

  // Mouse Parallax
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetCameraPosRef = useRef({ x: 0, y: 0.1, z: 5.6 });

  // Tape spooling speed state
  const reelSpeedRef = useRef(0.6);

  useEffect(() => {
    // When streaming, tape spools quickly; when idle, rotates slowly
    reelSpeedRef.current = isStreaming ? 3.2 : 0.65;
  }, [isStreaming]);

  useEffect(() => {
    if (!containerRef.current) return;

    let width = containerRef.current.clientWidth || window.innerWidth;
    let height = containerRef.current.clientHeight || window.innerHeight;

    // 1. Scene with subtle deep atmospheric fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050507, 0.085);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 5.6);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.replaceChildren(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const spiritColor = new THREE.Color(spirit.accentColor || '#f59e0b');

    // Key spotlight illuminating the tape deck from above
    const spotLight = new THREE.SpotLight(0xfff5e6, 3.8, 14, Math.PI / 4, 0.45, 1);
    spotLight.position.set(0, 4.8, 4.0);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Spirit aura point light
    const auraLight = new THREE.PointLight(spiritColor, 3.2, 9);
    auraLight.position.set(-2.2, 2.0, 1.8);
    scene.add(auraLight);

    // 5. Mainframe Geometry (IBM System/360 & IBM 2401 Tape Unit)
    const mainframeGroup = new THREE.Group();
    // Offset mainframe backward slightly so it frames the background with depth
    mainframeGroup.position.set(0, hasMessages ? -0.3 : 0, -0.6);
    scene.add(mainframeGroup);
    mainframeGroupRef.current = mainframeGroup;

    // Cabinet Frame: Deep IBM Charcoal/Navy
    const cabinetGeo = new THREE.BoxGeometry(2.35, 4.2, 1.35);
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: 0x12161e,
      roughness: 0.35,
      metalness: 0.65
    });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    mainframeGroup.add(cabinet);

    // Front Brushed Steel Inset Panel
    const panelGeo = new THREE.BoxGeometry(2.18, 3.98, 0.04);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e26,
      roughness: 0.25,
      metalness: 0.85
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 0, 0.69);
    mainframeGroup.add(panel);

    // Top IBM Blue Header Nameplate
    const headerGeo = new THREE.BoxGeometry(2.1, 0.26, 0.02);
    const headerMat = new THREE.MeshStandardMaterial({
      color: 0x0f2b48, // IBM Deep Blue
      roughness: 0.2,
      metalness: 0.5
    });
    const header = new THREE.Mesh(headerGeo, headerMat);
    header.position.set(0, 1.82, 0.72);
    mainframeGroup.add(header);

    // 6. Magnetic Tape Reels (Left Supply & Right Take-up)
    const createReel = (isLeft) => {
      const reelGroup = new THREE.Group();

      // Front translucent acrylic flange
      const flangeGeo = new THREE.CylinderGeometry(0.54, 0.54, 0.025, 32);
      const flangeMat = new THREE.MeshStandardMaterial({
        color: 0xdde3ea,
        roughness: 0.15,
        metalness: 0.85,
        transparent: true,
        opacity: 0.85
      });
      const frontFlange = new THREE.Mesh(flangeGeo, flangeMat);
      frontFlange.rotation.x = Math.PI / 2;
      reelGroup.add(frontFlange);

      // Back flange
      const backFlange = frontFlange.clone();
      backFlange.position.z = -0.055;
      reelGroup.add(backFlange);

      // Center Hub
      const hubGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.065, 32);
      const hubMat = new THREE.MeshStandardMaterial({
        color: 0x1f1f1f,
        roughness: 0.4,
        metalness: 0.9
      });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.x = Math.PI / 2;
      hub.position.z = -0.028;
      reelGroup.add(hub);

      // Tape Pack cylinder (ferric oxide brown)
      const radius = isLeft ? 0.46 : 0.33;
      const tapePackGeo = new THREE.CylinderGeometry(radius, radius, 0.05, 32);
      const tapePackMat = new THREE.MeshStandardMaterial({
        color: 0x422616,
        roughness: 0.65,
        metalness: 0.1
      });
      const tapePack = new THREE.Mesh(tapePackGeo, tapePackMat);
      tapePack.rotation.x = Math.PI / 2;
      tapePack.position.z = -0.028;
      reelGroup.add(tapePack);

      // Radial cutouts
      for (let i = 0; i < 3; i++) {
        const markerGeo = new THREE.BoxGeometry(0.055, 0.13, 0.02);
        const markerMat = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.8 });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        const a = (i * Math.PI * 2) / 3;
        marker.position.set(Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0.015);
        reelGroup.add(marker);
      }

      return reelGroup;
    };

    const leftReel = createReel(true);
    leftReel.position.set(-0.56, 1.12, 0.74);
    mainframeGroup.add(leftReel);
    leftReelRef.current = leftReel;

    const rightReel = createReel(false);
    rightReel.position.set(0.56, 1.12, 0.74);
    mainframeGroup.add(rightReel);
    rightReelRef.current = rightReel;

    // Magnetic read/write head assembly between reels
    const headGeo = new THREE.BoxGeometry(0.34, 0.22, 0.08);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, metalness: 0.9, roughness: 0.2 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.80, 0.74);
    mainframeGroup.add(head);

    // Glowing head gap indicator in spirit accent color
    const gapGeo = new THREE.BoxGeometry(0.018, 0.12, 0.09);
    const gapMat = new THREE.MeshBasicMaterial({ color: spiritColor });
    const gap = new THREE.Mesh(gapGeo, gapMat);
    gap.position.set(0, 0.80, 0.75);
    mainframeGroup.add(gap);

    // 7. Vacuum Column Buffer Chambers
    const colFrameGeo = new THREE.BoxGeometry(0.82, 1.42, 0.14);
    const colFrameMat = new THREE.MeshStandardMaterial({ color: 0x09141f, roughness: 0.3, metalness: 0.8 });

    const leftCol = new THREE.Mesh(colFrameGeo, colFrameMat);
    leftCol.position.set(-0.54, -0.16, 0.73);
    mainframeGroup.add(leftCol);

    const rightCol = new THREE.Mesh(colFrameGeo, colFrameMat);
    rightCol.position.set(0.54, -0.16, 0.73);
    mainframeGroup.add(rightCol);

    // Acrylic Inspection Glass with blue tint
    const glassGeo = new THREE.BoxGeometry(0.74, 1.32, 0.02);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      transmission: 0.85
    });
    const leftGlass = new THREE.Mesh(glassGeo, glassMat);
    leftGlass.position.set(-0.54, -0.16, 0.81);
    mainframeGroup.add(leftGlass);

    const rightGlass = new THREE.Mesh(glassGeo, glassMat);
    rightGlass.position.set(0.54, -0.16, 0.81);
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
      const tubeGeo = new THREE.TubeGeometry(curve, 18, 0.018, 6, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x422616, roughness: 0.6 });
      return new THREE.Mesh(tubeGeo, tubeMat);
    };

    const leftLoop = createLoop();
    leftLoop.position.set(-0.54, -0.16, 0.76);
    mainframeGroup.add(leftLoop);
    tapeLoopLeftRef.current = leftLoop;

    const rightLoop = createLoop();
    rightLoop.position.set(0.54, -0.16, 0.76);
    mainframeGroup.add(rightLoop);
    tapeLoopRightRef.current = rightLoop;

    // 8. Console Display Panel with 32 Blinking Pilot Register Lights
    const consoleGeo = new THREE.BoxGeometry(2.05, 0.82, 0.16);
    const consoleMat = new THREE.MeshStandardMaterial({ color: 0x20242b, roughness: 0.4, metalness: 0.6 });
    const consoleBox = new THREE.Mesh(consoleGeo, consoleMat);
    consoleBox.position.set(0, -1.34, 0.74);
    mainframeGroup.add(consoleBox);

    const lights = [];
    const lightCols = 16;
    const lightRows = 2;
    const spacingX = 1.85 / (lightCols - 1);

    for (let r = 0; r < lightRows; r++) {
      for (let c = 0; c < lightCols; c++) {
        const lampGeo = new THREE.SphereGeometry(0.021, 10, 10);
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
          0.83
        );
        mainframeGroup.add(lamp);
        lights.push(lamp);
      }
    }
    registerLightsRef.current = lights;

    // 9. Floating Ethereal Séance Embers / Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVels = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 6.0;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
      particleVels.push({
        vx: (Math.random() - 0.5) * 0.006,
        vy: Math.random() * 0.010 + 0.003,
        vz: (Math.random() - 0.5) * 0.006
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: spiritColor,
      size: 0.05,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    particleSystemRef.current = { system: particleSystem, vels: particleVels };

    // 10. Mouse movement listener for parallax
    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current = { x: normX, y: normY };

      // Target camera position tilt
      targetCameraPosRef.current = {
        x: normX * 0.45,
        y: 0.1 + normY * 0.25,
        z: 5.6
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 11. Animation Loop
    let clock = new THREE.Clock();
    let lightTimer = 0;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      camera.position.x += (targetCameraPosRef.current.x - camera.position.x) * 0.05;
      camera.position.y += (targetCameraPosRef.current.y - camera.position.y) * 0.05;
      camera.lookAt(0, -0.1, 0);

      // Rotate Tape Reels
      if (leftReelRef.current) {
        leftReelRef.current.rotation.z += delta * reelSpeedRef.current;
      }
      if (rightReelRef.current) {
        rightReelRef.current.rotation.z += delta * (reelSpeedRef.current * 0.88);
      }

      // Flutter vacuum loops
      if (tapeLoopLeftRef.current) {
        tapeLoopLeftRef.current.position.y = -0.16 + Math.sin(elapsedTime * (isStreaming ? 9.0 : 4.5)) * 0.03;
      }
      if (tapeLoopRightRef.current) {
        tapeLoopRightRef.current.position.y = -0.16 + Math.cos(elapsedTime * (isStreaming ? 8.2 : 4.0)) * 0.03;
      }

      // Blinking register lights
      lightTimer += delta;
      if (lightTimer > 0.1) {
        lightTimer = 0;
        registerLightsRef.current.forEach((lamp) => {
          if (Math.random() > 0.7) {
            const current = lamp.material.emissiveIntensity;
            lamp.material.emissiveIntensity = current > 0.5 ? 0.08 : 1.5;
          }
        });
      }

      // Animate floating embers
      if (particleSystemRef.current) {
        const pos = particleSystemRef.current.system.geometry.attributes.position.array;
        const vels = particleSystemRef.current.vels;

        for (let i = 0; i < particleCount; i++) {
          pos[i * 3 + 1] += vels[i].vy;
          pos[i * 3] += Math.sin(elapsedTime * 0.8 + i) * 0.002;

          if (pos[i * 3 + 1] > 2.8) {
            pos[i * 3 + 1] = -2.2;
            pos[i * 3] = (Math.random() - 0.5) * 5.5;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [activeSpiritId, hasMessages]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Atmospheric Vignette & Contrast Overlay so chat text is always 100% legible */}
      <div 
        className="absolute inset-0 bg-radial from-black/25 via-black/60 to-[#000000] pointer-events-none" 
        style={{ mixBlendMode: 'multiply' }}
      />
    </div>
  );
}
