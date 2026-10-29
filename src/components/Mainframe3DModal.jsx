import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { 
  X, Play, Pause, RotateCcw, FastForward, Sparkles, Volume2, 
  VolumeX, RefreshCw, AlertTriangle, Cpu, Radio, Flame
} from 'lucide-react';
import { SPIRITS } from '../engine/necromancyEngine';
import { seanceAudio } from '../audio/seanceAudio';

export default function Mainframe3DModal({
  isOpen,
  onClose,
  activeSpiritId = 'pli'
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);

  // 3D Objects Refs
  const leftReelRef = useRef(null);
  const rightReelRef = useRef(null);
  const tapeLoopLeftRef = useRef(null);
  const tapeLoopRightRef = useRef(null);
  const registerLightsRef = useRef([]);
  const particleSystemRef = useRef(null);

  // Simulation State
  const [tapeState, setTapeState] = useState('running'); // 'running' | 'paused' | 'fast' | 'rewind'
  const [tapeSpeedIPS, setTapeSpeedIPS] = useState(112.5); // Inches per second (IBM 2401 standard)
  const [isEPOActive, setIsEPOActive] = useState(false);
  const [activeChannel, setActiveChannel] = useState(0);

  const spirit = SPIRITS[activeSpiritId] || SPIRITS.pli;

  // Interaction State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: 0.25, phi: 1.35, radius: 5.8 });
  const targetAngleRef = useRef({ theta: 0.25, phi: 1.35, radius: 5.8 });
  const reelSpeedRef = useRef(1.8);

  // Sync speed ref with state
  useEffect(() => {
    switch (tapeState) {
      case 'running':
        reelSpeedRef.current = 2.2;
        setTapeSpeedIPS(112.5);
        break;
      case 'fast':
        reelSpeedRef.current = 6.8;
        setTapeSpeedIPS(225.0);
        break;
      case 'rewind':
        reelSpeedRef.current = -5.4;
        setTapeSpeedIPS(-180.0);
        break;
      case 'paused':
      default:
        reelSpeedRef.current = 0;
        setTapeSpeedIPS(0);
        break;
    }
  }, [tapeState]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = 540;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.08);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.replaceChildren(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const spiritColor = new THREE.Color(spirit.accentColor || '#f59e0b');

    // Ethereal top spot illuminating the tape deck
    const spotLight = new THREE.SpotLight(0xfff5e6, 3.5, 12, Math.PI / 4, 0.5, 1);
    spotLight.position.set(0, 4.5, 3.5);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Dynamic spirit neon aura rim
    const rimLight = new THREE.PointLight(spiritColor, 2.8, 8);
    rimLight.position.set(-2.5, 2.5, 1.5);
    scene.add(rimLight);

    // 5. Build IBM 2401 Magnetic Tape Unit & Mainframe Console Geometry
    const mainframeGroup = new THREE.Group();
    scene.add(mainframeGroup);

    // Main cabinet body: Classic IBM Blue / Charcoal Dual Tone
    const cabinetGeo = new THREE.BoxGeometry(2.4, 4.2, 1.4);
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: 0x14181f, // Dark blue-charcoal
      roughness: 0.35,
      metalness: 0.6
    });
    const cabinetMesh = new THREE.Mesh(cabinetGeo, cabinetMat);
    cabinetMesh.position.set(0, 0, 0);
    cabinetMesh.castShadow = true;
    cabinetMesh.receiveShadow = true;
    mainframeGroup.add(cabinetMesh);

    // Front Brushed Aluminum Inset Panel
    const frontPanelGeo = new THREE.BoxGeometry(2.2, 4.0, 0.05);
    const frontPanelMat = new THREE.MeshStandardMaterial({
      color: 0x1d222a,
      roughness: 0.25,
      metalness: 0.8
    });
    const frontPanel = new THREE.Mesh(frontPanelGeo, frontPanelMat);
    frontPanel.position.set(0, 0, 0.71);
    mainframeGroup.add(frontPanel);

    // Top Header: IBM 2401 Magnetic Tape Unit Nameplate
    const nameplateGeo = new THREE.BoxGeometry(2.1, 0.24, 0.02);
    const nameplateMat = new THREE.MeshStandardMaterial({
      color: 0x0f2b48, // Authentic IBM Deep Blue
      roughness: 0.2,
      metalness: 0.4
    });
    const nameplate = new THREE.Mesh(nameplateGeo, nameplateMat);
    nameplate.position.set(0, 1.85, 0.74);
    mainframeGroup.add(nameplate);

    // 6. Magnetic Tape Reels (Supply Reel & Take-up Reel)
    const createTapeReel = (isLeft) => {
      const reelGroup = new THREE.Group();

      // Reel transparent/frosted flange
      const flangeGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.03, 32);
      const flangeMat = new THREE.MeshStandardMaterial({
        color: 0xcfd6dc,
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
      backFlange.position.z = -0.06;
      reelGroup.add(backFlange);

      // Aluminum Center Hub with 3 radial latch holes
      const hubGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.07, 32);
      const hubMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.4,
        metalness: 0.9
      });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.x = Math.PI / 2;
      hub.position.z = -0.03;
      reelGroup.add(hub);

      // Magnetic Tape pack (wound oxide tape cylinder)
      const tapePackRadius = isLeft ? 0.48 : 0.32;
      const tapePackGeo = new THREE.CylinderGeometry(tapePackRadius, tapePackRadius, 0.055, 32);
      const tapePackMat = new THREE.MeshStandardMaterial({
        color: 0x4a2a18, // Magnetic ferric oxide rust-brown
        roughness: 0.6,
        metalness: 0.1
      });
      const tapePack = new THREE.Mesh(tapePackGeo, tapePackMat);
      tapePack.rotation.x = Math.PI / 2;
      tapePack.position.z = -0.03;
      reelGroup.add(tapePack);

      // Triangular decorative latch markers on hub
      for (let i = 0; i < 3; i++) {
        const markerGeo = new THREE.BoxGeometry(0.06, 0.14, 0.02);
        const markerMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        const angle = (i * Math.PI * 2) / 3;
        marker.position.set(Math.cos(angle) * 0.14, Math.sin(angle) * 0.14, 0.02);
        reelGroup.add(marker);
      }

      return reelGroup;
    };

    const leftReel = createTapeReel(true);
    leftReel.position.set(-0.58, 1.15, 0.76);
    mainframeGroup.add(leftReel);
    leftReelRef.current = leftReel;

    const rightReel = createTapeReel(false);
    rightReel.position.set(0.58, 1.15, 0.76);
    mainframeGroup.add(rightReel);
    rightReelRef.current = rightReel;

    // Read/Write Magnetic Head Assembly & Capstan Drive (Between reels)
    const headBlockGeo = new THREE.BoxGeometry(0.35, 0.22, 0.08);
    const headBlockMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.9,
      roughness: 0.2
    });
    const headBlock = new THREE.Mesh(headBlockGeo, headBlockMat);
    headBlock.position.set(0, 0.82, 0.76);
    mainframeGroup.add(headBlock);

    // Magnetic read gap indicator
    const gapGeo = new THREE.BoxGeometry(0.02, 0.12, 0.09);
    const gapMat = new THREE.MeshBasicMaterial({ color: spiritColor });
    const gap = new THREE.Mesh(gapGeo, gapMat);
    gap.position.set(0, 0.82, 0.77);
    mainframeGroup.add(gap);

    // 7. Vacuum Column Tape Chambers (Left & Right vertical columns)
    const columnFrameGeo = new THREE.BoxGeometry(0.85, 1.45, 0.15);
    const columnFrameMat = new THREE.MeshStandardMaterial({
      color: 0x08131d,
      roughness: 0.3,
      metalness: 0.8
    });

    const leftColumn = new THREE.Mesh(columnFrameGeo, columnFrameMat);
    leftColumn.position.set(-0.55, -0.15, 0.75);
    mainframeGroup.add(leftColumn);

    const rightColumn = new THREE.Mesh(columnFrameGeo, columnFrameMat);
    rightColumn.position.set(0.55, -0.15, 0.75);
    mainframeGroup.add(rightColumn);

    // Tinted Acrylic Inspection Windows
    const windowGeo = new THREE.BoxGeometry(0.75, 1.35, 0.02);
    const windowMat = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.8
    });
    const leftWindow = new THREE.Mesh(windowGeo, windowMat);
    leftWindow.position.set(-0.55, -0.15, 0.84);
    mainframeGroup.add(leftWindow);

    const rightWindow = new THREE.Mesh(windowGeo, windowMat);
    rightWindow.position.set(0.55, -0.15, 0.84);
    mainframeGroup.add(rightWindow);

    // Vacuum Tape Loop Buffers (Bouncing U-shaped loops inside chambers)
    const createTapeLoop = () => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.18, 0.5, 0),
        new THREE.Vector3(-0.16, 0.0, 0),
        new THREE.Vector3(0, -0.45, 0),
        new THREE.Vector3(0.16, 0.0, 0),
        new THREE.Vector3(0.18, 0.5, 0)
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.02, 6, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 0.5 });
      return new THREE.Mesh(tubeGeo, tubeMat);
    };

    const leftLoop = createTapeLoop();
    leftLoop.position.set(-0.55, -0.15, 0.78);
    mainframeGroup.add(leftLoop);
    tapeLoopLeftRef.current = leftLoop;

    const rightLoop = createTapeLoop();
    rightLoop.position.set(0.55, -0.15, 0.78);
    mainframeGroup.add(rightLoop);
    tapeLoopRightRef.current = rightLoop;

    // 8. IBM System/360 Central Console Section (Lower control board)
    const consoleGeo = new THREE.BoxGeometry(2.1, 0.85, 0.18);
    const consoleMat = new THREE.MeshStandardMaterial({
      color: 0x23272e,
      roughness: 0.4,
      metalness: 0.5
    });
    const consoleBox = new THREE.Mesh(consoleGeo, consoleMat);
    consoleBox.position.set(0, -1.35, 0.76);
    mainframeGroup.add(consoleBox);

    // 32-Bit Register Display: Two rows of 16 incandescent pilot lamps
    const lights = [];
    const lightCols = 16;
    const lightRows = 2;
    const lampSpacingX = 1.9 / (lightCols - 1);
    const lampSpacingY = 0.16;

    for (let r = 0; r < lightRows; r++) {
      for (let c = 0; c < lightCols; c++) {
        const lampGeo = new THREE.SphereGeometry(0.022, 12, 12);
        const isAmber = c % 4 < 2;
        const lampMat = new THREE.MeshStandardMaterial({
          color: isAmber ? 0xf59e0b : 0xef4444,
          emissive: isAmber ? 0xf59e0b : 0xef4444,
          emissiveIntensity: Math.random() > 0.5 ? 1.5 : 0.1,
          roughness: 0.2
        });
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.set(
          -0.95 + c * lampSpacingX,
          -1.25 - r * lampSpacingY,
          0.86
        );
        mainframeGroup.add(lamp);
        lights.push(lamp);
      }
    }
    registerLightsRef.current = lights;

    // Emergency Power Off (EPO) Big Red Switch
    const epoBaseGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16);
    const epoBaseMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8 });
    const epoBase = new THREE.Mesh(epoBaseGeo, epoBaseMat);
    epoBase.rotation.x = Math.PI / 2;
    epoBase.position.set(0.85, -1.55, 0.86);
    mainframeGroup.add(epoBase);

    const epoPullGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.08, 16);
    const epoPullMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Bright Emergency Red
      roughness: 0.2,
      metalness: 0.1
    });
    const epoPull = new THREE.Mesh(epoPullGeo, epoPullMat);
    epoPull.rotation.x = Math.PI / 2;
    epoPull.position.set(0.85, -1.55, 0.90);
    mainframeGroup.add(epoPull);

    // 9. Floating Ethereal Séance Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 5.5;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
      particleVelocities.push({
        vx: (Math.random() - 0.5) * 0.008,
        vy: Math.random() * 0.012 + 0.004,
        vz: (Math.random() - 0.5) * 0.008
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: spiritColor,
      size: 0.055,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    particleSystemRef.current = { system: particleSystem, velocities: particleVelocities };

    // 10. Main Animation Loop
    let clock = new THREE.Clock();
    let registerTimer = 0;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth Camera Orbit interpolation
      cameraAngleRef.current.theta += (targetAngleRef.current.theta - cameraAngleRef.current.theta) * 0.08;
      cameraAngleRef.current.phi += (targetAngleRef.current.phi - cameraAngleRef.current.phi) * 0.08;
      cameraAngleRef.current.radius += (targetAngleRef.current.radius - cameraAngleRef.current.radius) * 0.08;

      const r = cameraAngleRef.current.radius;
      const phi = cameraAngleRef.current.phi;
      const theta = cameraAngleRef.current.theta;

      camera.position.x = r * Math.sin(phi) * Math.sin(theta);
      camera.position.y = r * Math.cos(phi) + 0.2;
      camera.position.z = r * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);

      // Rotate Magnetic Tape Reels
      if (!isEPOActive) {
        if (leftReelRef.current) {
          leftReelRef.current.rotation.z += delta * reelSpeedRef.current;
        }
        if (rightReelRef.current) {
          rightReelRef.current.rotation.z += delta * (reelSpeedRef.current * 0.85);
        }

        // Vacuum tape loops flutter
        if (tapeLoopLeftRef.current) {
          tapeLoopLeftRef.current.position.y = -0.15 + Math.sin(elapsedTime * 6.0) * 0.035;
        }
        if (tapeLoopRightRef.current) {
          tapeLoopRightRef.current.position.y = -0.15 + Math.cos(elapsedTime * 5.2) * 0.035;
        }

        // Blinking incandescent register lights simulation
        registerTimer += delta;
        if (registerTimer > 0.08) {
          registerTimer = 0;
          registerLightsRef.current.forEach((lamp, idx) => {
            if (Math.random() > 0.65) {
              const currentInt = lamp.material.emissiveIntensity;
              lamp.material.emissiveIntensity = currentInt > 0.5 ? 0.05 : 1.6;
            }
          });
        }
      }

      // Animate floating particles
      if (particleSystemRef.current) {
        const positions = particleSystemRef.current.system.geometry.attributes.position.array;
        const vels = particleSystemRef.current.velocities;

        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += vels[i].vy;
          positions[i * 3] += Math.sin(elapsedTime + i) * 0.003;

          // Wrap particles around when rising out of chamber
          if (positions[i * 3 + 1] > 2.8) {
            positions[i * 3 + 1] = -2.2;
            positions[i * 3] = (Math.random() - 0.5) * 4.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
          }
        }
        particleSystemRef.current.system.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mouse Interaction Handlers
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetAngleRef.current.theta += deltaX * 0.006;
      targetAngleRef.current.phi -= deltaY * 0.006;
      targetAngleRef.current.phi = Math.max(0.4, Math.min(Math.PI / 2 + 0.1, targetAngleRef.current.phi));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      targetAngleRef.current.radius += e.deltaY * 0.004;
      targetAngleRef.current.radius = Math.max(3.5, Math.min(8.5, targetAngleRef.current.radius));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      cameraRef.current.aspect = w / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isOpen, activeSpiritId, isEPOActive]);

  if (!isOpen) return null;

  // Toggle EPO Switch
  const handleToggleEPO = () => {
    const newState = !isEPOActive;
    setIsEPOActive(newState);
    seanceAudio.playKeyClick();

    if (newState) {
      // Power off lights
      registerLightsRef.current.forEach(l => {
        l.material.emissiveIntensity = 0.0;
      });
    } else {
      seanceAudio.playChime();
    }
  };

  // Test Console Register Pattern
  const handleTestLights = () => {
    if (isEPOActive) return;
    seanceAudio.playKeyClick();
    registerLightsRef.current.forEach((lamp, idx) => {
      lamp.material.emissiveIntensity = idx % 2 === 0 ? 2.0 : 0.05;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-[#ececec]">
      <div className="relative w-full max-w-5xl bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold"
              style={{ color: spirit.accentColor }}
            >
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span>IBM System/360 & 2401 Tape Unit (3D Chamber)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ONLINE
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Interactive real-time 3D simulation of vintage mainframe hardware channeling {spirit.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="relative w-full bg-[#0a0a0a]">
          <div 
            ref={containerRef} 
            className="w-full h-[520px] cursor-grab active:cursor-grabbing select-none"
          />

          {/* Floating Instructions Pill */}
          <div className="absolute top-4 left-4 bg-[#171717]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs text-neutral-300 pointer-events-none">
            <span className="text-amber-400 font-semibold">3D Mainframe Controls:</span> Orbit 360° with Mouse • Wheel to Zoom • Click switches below
          </div>

          {/* Speed Indicator Badge */}
          <div className="absolute top-4 right-4 bg-[#171717]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-neutral-300">
            <span>TAPE SPEED: </span>
            <strong className="text-emerald-400">{tapeSpeedIPS.toFixed(1)} IPS</strong>
          </div>
        </div>

        {/* Interactive Console Toolbar */}
        <div className="p-4 bg-[#181818] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tape Controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#9b9b9b] font-medium mr-1">Tape Drive:</span>

            <button
              onClick={() => {
                setTapeState(tapeState === 'running' ? 'paused' : 'running');
                seanceAudio.playKeyClick();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                tapeState === 'running' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-[#242424] hover:bg-[#2f2f2f] text-neutral-300 border-white/5'
              }`}
            >
              {tapeState === 'running' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{tapeState === 'running' ? 'Pause Reels' : 'Run Spool'}</span>
            </button>

            <button
              onClick={() => {
                setTapeState('fast');
                seanceAudio.playKeyClick();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                tapeState === 'fast'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#242424] hover:bg-[#2f2f2f] text-neutral-300 border-white/5'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Fast 225 IPS</span>
            </button>

            <button
              onClick={() => {
                setTapeState('rewind');
                seanceAudio.playKeyClick();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                tapeState === 'rewind'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-[#242424] hover:bg-[#2f2f2f] text-neutral-300 border-white/5'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rewind</span>
            </button>
          </div>

          {/* Console Register Lights & EPO */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestLights}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2f2f2f] text-cyan-300 border border-white/5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cycle Register Lights</span>
            </button>

            <button
              onClick={handleToggleEPO}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                isEPOActive
                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                  : 'bg-red-950/60 hover:bg-red-900/80 text-red-300 border-red-500/30'
              }`}
              title="Emergency Power Off - Mainframe Circuit Breaker"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isEPOActive ? 'RESET EPO BREAKER' : 'EPO PULL SWITCH'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
