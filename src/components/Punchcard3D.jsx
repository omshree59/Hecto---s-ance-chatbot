import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Play, Sparkles, Eye, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { seanceAudio } from '../audio/seanceAudio';

const ROWS = [12, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function Punchcard3D({ 
  lineText = '', 
  punchMatrix = [], 
  spiritAccentColor = '#f59e0b',
  onFeedCard
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const cardGroupRef = useRef(null);
  const scanLineRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [isScanning, setIsScanning] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);

  // Interaction State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.15, y: -0.2 });
  const currentRotationRef = useRef({ x: 0.15, y: -0.2 });

  // 1. Generate high-resolution procedural canvas texture for the punchcard
  const createCardTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 910; // Aspect ratio ~ 2.25:1 (authentic 7.375" x 3.25")
    const ctx = canvas.getContext('2d');

    // Background: Manila vintage paper
    ctx.fillStyle = '#f5ebd7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle paper grain / noise
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const alpha = Math.random() * 0.04;
      ctx.fillStyle = `rgba(100, 80, 50, ${alpha})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Border line around card
    ctx.strokeStyle = '#d4c4a1';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // Header banner: IBM 5081 Form Details
    ctx.fillStyle = '#7a6e5b';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('IBM 5081 STANDARD CARD FORM', 50, 55);
    ctx.font = '18px monospace';
    ctx.fillText('OS/360 ARCHITECTURE • SYSTEM/360 DIVISION', 720, 55);
    ctx.fillText('ENDICOTT & HURSLEY LABS', 1600, 55);

    // Interpreting row (printed text along top)
    ctx.fillStyle = '#1a1815';
    ctx.font = 'bold 26px "Fira Code", monospace';
    const colWidth = (canvas.width - 120) / 80;
    const startX = 60;
    const padded = lineText.padEnd(80, ' ').slice(0, 80);

    for (let i = 0; i < 80; i++) {
      const char = padded[i];
      const x = startX + i * colWidth;
      if (i >= 72) {
        ctx.fillStyle = '#b91c1c'; // Red card sequence key
      } else {
        ctx.fillStyle = '#1a1815';
      }
      ctx.fillText(char === ' ' ? ' ' : char, x + 3, 110);
    }

    // Grid row labels & punch positions
    const rowStartY = 160;
    const rowHeight = (canvas.height - 240) / 12;

    ROWS.forEach((rowNum, rIdx) => {
      const y = rowStartY + rIdx * rowHeight;

      // Row label left and right
      ctx.fillStyle = '#8a7f6c';
      ctx.font = 'bold 18px monospace';
      const label = rowNum === 12 ? '12' : rowNum === 11 ? '11' : String(rowNum);
      ctx.fillText(label, 30, y + 16);
      ctx.fillText(label, canvas.width - 45, y + 16);

      // Digits / dots for non-punched holes
      for (let c = 0; c < 80; c++) {
        const x = startX + c * colWidth;
        const isPunched = punchMatrix[c]?.includes(rowNum);

        if (isPunched) {
          // Punched hole cutout (shadowed rectangular punch)
          ctx.fillStyle = '#111111';
          ctx.fillRect(x + 2, y, colWidth * 0.72, rowHeight * 0.75);

          // Subtle rim highlight around punched cardboard hole
          ctx.strokeStyle = 'rgba(0,0,0,0.4)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 2, y, colWidth * 0.72, rowHeight * 0.75);
        } else {
          // Unpunched subtle row number
          ctx.fillStyle = 'rgba(180, 165, 140, 0.45)';
          ctx.font = '14px monospace';
          const digit = (rowNum >= 0 && rowNum <= 9) ? String(rowNum) : '•';
          ctx.fillText(digit, x + 6, y + 15);
        }
      }
    });

    // Column numbers across bottom (1 to 80)
    const bottomY = canvas.height - 40;
    ctx.fillStyle = '#7a6e5b';
    ctx.font = '13px monospace';
    ctx.fillText('COL', 25, bottomY);
    ctx.fillText('COL', canvas.width - 45, bottomY);

    for (let c = 0; c < 80; c++) {
      const x = startX + c * colWidth;
      const colNum = c + 1;
      if (colNum % 10 === 0) {
        ctx.fillStyle = '#3a3225';
        ctx.font = 'bold 15px monospace';
        ctx.fillText(String(colNum), x, bottomY);
      } else if (colNum === 1 || (colNum % 5 === 0 && colNum < 10)) {
        ctx.fillStyle = '#8a7f6c';
        ctx.font = '12px monospace';
        ctx.fillText(String(colNum), x + 4, bottomY);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  };

  // Back texture (blank manila back with watermark)
  const createBackTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 455;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#eee4ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle paper grain
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillStyle = `rgba(90, 70, 40, ${Math.random() * 0.03})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Faint IBM watermark
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-0.15);
    ctx.fillStyle = 'rgba(160, 145, 120, 0.12)';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IBM SYSTEM / 360', 0, 0);
    ctx.font = '32px monospace';
    ctx.fillText('HOLLERITH 80-COLUMN CARD', 0, 45);
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  };

  // Setup Three.js 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = 480;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.replaceChildren(renderer.domElement);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Ethereal colored rim light matching spirit
    const rimColor = new THREE.Color(spiritAccentColor || '#f59e0b');
    const rimLight = new THREE.DirectionalLight(rimColor, 1.5);
    rimLight.position.set(-5, 4, -3);
    scene.add(rimLight);

    // Key directional light tracking card
    const keyLight = new THREE.DirectionalLight(0xfff6e6, 2.0);
    keyLight.position.set(4, 5, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Card Group
    const cardGroup = new THREE.Group();
    cardGroupRef.current = cardGroup;
    scene.add(cardGroup);

    // 2. Punchcard Geometry with top-left corner cut
    // Standard card proportion: 7.375" x 3.25" ~ 4.4 x 1.95 units
    const cardWidth = 4.4;
    const cardHeight = 1.95;
    const cornerCutSize = 0.22;

    const shape = new THREE.Shape();
    // Top-left cut corner
    shape.moveTo(-cardWidth / 2 + cornerCutSize, cardHeight / 2);
    shape.lineTo(cardWidth / 2, cardHeight / 2);
    shape.lineTo(cardWidth / 2, -cardHeight / 2);
    shape.lineTo(-cardWidth / 2, -cardHeight / 2);
    shape.lineTo(-cardWidth / 2, cardHeight / 2 - cornerCutSize);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.018, // Cardboard thickness
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.005,
      bevelThickness: 0.005
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const frontTexture = createCardTexture();
    const backTexture = createBackTexture();

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      roughness: 0.65,
      metalness: 0.05
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      roughness: 0.7,
      metalness: 0.02
    });

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0d4b8,
      roughness: 0.9
    });

    // Materials array: 0 = sides/edges, 1 = front, 2 = back
    const materials = [frontMaterial, edgeMaterial];
    const cardMesh = new THREE.Mesh(geometry, materials);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    cardGroup.add(cardMesh);

    // 3. Reader Tray Base (IBM 2540 Card Hopper surface below card)
    const trayGeo = new THREE.BoxGeometry(5.2, 0.12, 3.2);
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0x1f1f1f,
      roughness: 0.4,
      metalness: 0.7
    });
    const trayMesh = new THREE.Mesh(trayGeo, trayMat);
    trayMesh.position.set(0, -1.35, -0.4);
    trayMesh.receiveShadow = true;
    scene.add(trayMesh);

    // Brushed metal trim on card hopper
    const trimGeo = new THREE.BoxGeometry(5.2, 0.03, 0.05);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.2,
      metalness: 0.9
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.set(0, -1.28, 1.15);
    scene.add(trimMesh);

    // 4. Holographic Laser Scan Line
    const scanGeo = new THREE.CylinderGeometry(0.015, 0.015, cardHeight * 1.05, 16);
    const scanMat = new THREE.MeshBasicMaterial({
      color: rimColor,
      transparent: true,
      opacity: 0.0
    });
    const scanLine = new THREE.Mesh(scanGeo, scanMat);
    scanLine.position.set(-cardWidth / 2, 0, 0.03);
    cardGroup.add(scanLine);
    scanLineRef.current = scanLine;

    // Render loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for rotation
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;

      if (cardGroupRef.current) {
        // Idle floating levitation
        const idleFloat = Math.sin(elapsedTime * 1.5) * 0.04;
        cardGroupRef.current.position.y = idleFloat;

        cardGroupRef.current.rotation.x = currentRotationRef.current.x;
        cardGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Laser scan sweep animation
      if (scanLineRef.current && scanLineRef.current.material.opacity > 0) {
        scanLineRef.current.position.x += delta * 3.2;
        if (scanLineRef.current.position.x > cardWidth / 2) {
          scanLineRef.current.position.x = -cardWidth / 2;
          scanLineRef.current.material.opacity = 0;
          setIsScanning(false);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mouse Drag Rotation Handlers
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x += deltaY * 0.008;

      // Clamp vertical tilt
      targetRotationRef.current.x = Math.max(-0.8, Math.min(0.8, targetRotationRef.current.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Zoom via wheel
    const handleWheel = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z += e.deltaY * 0.003;
      cameraRef.current.position.z = Math.max(3.2, Math.min(8.5, cameraRef.current.position.z));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // Window resize
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
      geometry.dispose();
      frontTexture.dispose();
      backTexture.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
    };
  }, [lineText, punchMatrix, spiritAccentColor]);

  // Flip Card 180°
  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
    targetRotationRef.current.y += Math.PI;
    seanceAudio.playKeyClick();
  };

  // Holographic Laser Scanner Sweep
  const handleLaserScan = () => {
    if (isScanning || !scanLineRef.current) return;
    setIsScanning(true);
    scanLineRef.current.position.x = -2.2;
    scanLineRef.current.material.opacity = 0.85;
    seanceAudio.playChime();
  };

  // Card Feed into Hopper Animation
  const handleFeedHopper = () => {
    if (isFeeding || !cardGroupRef.current) return;
    setIsFeeding(true);
    seanceAudio.playKeyClick('pli');

    const startY = cardGroupRef.current.position.y;
    let t = 0;
    const feedInterval = setInterval(() => {
      t += 0.08;
      if (cardGroupRef.current) {
        cardGroupRef.current.position.y -= 0.12;
        cardGroupRef.current.position.z -= 0.05;
      }
      if (t >= 1) {
        clearInterval(feedInterval);
        setTimeout(() => {
          if (cardGroupRef.current) {
            cardGroupRef.current.position.y = startY;
            cardGroupRef.current.position.z = 0;
          }
          setIsFeeding(false);
          seanceAudio.playChime();
        }, 500);
      }
    }, 25);
  };

  // Reset Camera View
  const handleResetCamera = () => {
    targetRotationRef.current = { x: 0.15, y: -0.2 };
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 6.2);
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center bg-[#0d0d0d] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-[480px] cursor-grab active:cursor-grabbing select-none relative"
      />

      {/* 3D Interactive Floating HUD Controls */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#171717]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs text-neutral-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>WebGL 3D Hollerith Simulator</span>
        <span className="text-[#888888] font-mono text-[10px]">• Drag to orbit 360° • Scroll to zoom</span>
      </div>

      <div className="absolute bottom-4 inset-x-4 flex flex-wrap items-center justify-between gap-2 bg-[#171717]/85 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          {/* Flip Card */}
          <button
            onClick={handleFlipCard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#303030] text-white transition-colors cursor-pointer"
            title="Rotate card 180° to inspect back"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFlipped ? 'Inspect Front' : 'Flip Card 180°'}</span>
          </button>

          {/* Laser Scanner */}
          <button
            onClick={handleLaserScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#303030] text-cyan-300 transition-colors cursor-pointer disabled:opacity-50"
            title="Scan card columns with holographic optical beam"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>{isScanning ? 'Reading Hollerith...' : 'Laser Scan (1-80)'}</span>
          </button>

          {/* Feed Card into Reader */}
          <button
            onClick={handleFeedHopper}
            disabled={isFeeding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#303030] text-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
            title="Feed card into IBM 2540 Card Reader hopper"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Feed Card to Hopper</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#303030] text-[#9b9b9b] hover:text-white transition-colors cursor-pointer"
            title="Reset 3D camera"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
