import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import { Sparkles, Compass, AlertCircle, RotateCcw, Eye } from 'lucide-react';

interface FlowCanvasProps {
  onSelectEvent?: (eventId: string) => void;
  onEnterDay?: (dateStr: string) => void;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({ onSelectEvent, onEnterDay }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { activeDate, setActiveDate, setEnvironment, setSelectedEventId, selectedEventId } = useNavigationStore();
  const { events, categories, getOverlaps } = useEventStore();

  const [hoveredEventTitle, setHoveredEventTitle] = useState<string | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Compute 7 days of the active week
  const activeD = new Date(activeDate);
  const dayOfWeek = activeD.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(activeD);
    d.setDate(activeD.getDate() + mondayOffset + i);
    const dateStr = d.toISOString().substring(0, 10);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dateStr, dayName, dayNum, offset: i - 3, isSelected: dateStr === activeDate };
  });

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Check WebGL support
    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0c0f);
    scene.fog = new THREE.FogExp2(0x0b0c0f, 0.008);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, -28, 42);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent flipping underneath floor
    controls.minDistance = 15;
    controls.maxDistance = 95;
    controlsRef.current = controls;

    // 5. Ambient and Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xd6a66d, 1.2);
    dirLight.position.set(20, -30, 40);
    scene.add(dirLight);

    const blueLight = new THREE.DirectionalLight(0x829ab9, 0.8);
    blueLight.position.set(-20, 30, 20);
    scene.add(blueLight);

    // 6. Raycasting for picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const eventMeshes: { mesh: THREE.Mesh; eventId: string; title: string }[] = [];
    const daySlabs: { mesh: THREE.Mesh; dateStr: string }[] = [];

    // 7. Build Day Regions
    const daySpacing = 14.0;
    const verticalScale = 26.0;

    weekDays.forEach((day) => {
      const xPos = day.offset * daySpacing;

      // Day Base Slab
      const slabGeo = new THREE.BoxGeometry(11, verticalScale, 0.5);
      const slabMat = new THREE.MeshStandardMaterial({
        color: day.isSelected ? 0x1a1d23 : 0x121419,
        roughness: 0.8,
        metalness: 0.2
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(xPos, 0, -0.25);
      scene.add(slab);
      daySlabs.push({ mesh: slab, dateStr: day.dateStr });

      // Slab Outline
      const edges = new THREE.EdgesGeometry(slabGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: day.isSelected ? 0xd6a66d : 0x292d35,
        linewidth: day.isSelected ? 2 : 1
      });
      const outline = new THREE.LineSegments(edges, lineMat);
      slab.add(outline);

      // Hour Grid Lines across day (Every 4 hours: 00, 04, 08, 12, 16, 20)
      for (let h = 0; h <= 24; h += 4) {
        const yLine = (h / 24 - 0.5) * verticalScale;
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-5, yLine, 0.05),
          new THREE.Vector3(5, yLine, 0.05)
        ]);
        const tickLine = new THREE.Line(
          lineGeo,
          new THREE.LineBasicMaterial({ color: 0x1e222a })
        );
        slab.add(tickLine);
      }

      // Floating 3D Text / Sprite for Day Header
      const canvasText = document.createElement('canvas');
      canvasText.width = 256;
      canvasText.height = 128;
      const ctx = canvasText.getContext('2d');
      if (ctx) {
        ctx.fillStyle = day.isSelected ? '#D6A66D' : '#F1F0EB';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(day.dayName.toUpperCase(), 128, 50);
        ctx.font = '24px monospace';
        ctx.fillStyle = '#92969F';
        ctx.fillText(day.dayNum, 128, 90);
      }
      const texture = new THREE.CanvasTexture(canvasText);
      const spriteMat = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(xPos, verticalScale / 2 + 2.5, 0.5);
      sprite.scale.set(6, 3, 1);
      scene.add(sprite);

      // Render Day Events as Spatial 3D Objects
      const dayEvts = events.filter(
        (e) => !e.deletedAt && e.startAt.substring(0, 10) === day.dateStr
      );

      dayEvts.forEach((ev) => {
        const startD = new Date(ev.startAt);
        const endD = new Date(ev.endAt);
        const startH = startD.getHours() + startD.getMinutes() / 60;
        let endH = endD.getHours() + endD.getMinutes() / 60;
        if (endH <= startH) endH += 24;

        const durationH = Math.max(0.5, endH - startH);
        const midH = startH + durationH / 2;

        const yPos = (midH / 24 - 0.5) * verticalScale;
        const boxHeight = (durationH / 24) * verticalScale;
        const boxWidth = 9.0;
        const boxDepth = 1.0;

        const cat = categories.find((c) => c.id === ev.categoryId);
        const hexColor = parseInt((cat?.color || '#829AB9').replace('#', '0x'), 16);

        const evGeo = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const isSelectedEv = selectedEventId === ev.id;

        const evMat = new THREE.MeshStandardMaterial({
          color: hexColor,
          roughness: 0.3,
          metalness: 0.4,
          emissive: hexColor,
          emissiveIntensity: isSelectedEv ? 0.6 : 0.15,
          transparent: true,
          opacity: 0.85
        });

        const evMesh = new THREE.Mesh(evGeo, evMat);
        evMesh.position.set(xPos, yPos, boxDepth / 2 + 0.1);
        scene.add(evMesh);

        // Edge highlights
        const evEdges = new THREE.EdgesGeometry(evGeo);
        const edgeLine = new THREE.LineSegments(
          evEdges,
          new THREE.LineBasicMaterial({
            color: isSelectedEv ? 0xffffff : hexColor,
            linewidth: isSelectedEv ? 2 : 1
          })
        );
        evMesh.add(edgeLine);

        eventMeshes.push({ mesh: evMesh, eventId: ev.id, title: ev.title });
      });
    });

    // 8. Live Laser Beacon for current time across active day
    const now = new Date();
    const currentH = now.getHours() + now.getMinutes() / 60;
    const currentY = (currentH / 24 - 0.5) * verticalScale;
    const beaconGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-daySpacing * 3.5, currentY, 1.2),
      new THREE.Vector3(daySpacing * 3.5, currentY, 1.2)
    ]);
    const beaconLine = new THREE.Line(
      beaconGeo,
      new THREE.LineBasicMaterial({ color: 0xd6a66d, linewidth: 2 })
    );
    scene.add(beaconLine);

    // 9. Interaction Listeners
    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(eventMeshes.map((m) => m.mesh));

      if (intersects.length > 0) {
        canvas.style.cursor = 'pointer';
        const hit = eventMeshes.find((m) => m.mesh === intersects[0].object);
        if (hit) setHoveredEventTitle(hit.title);
      } else {
        canvas.style.cursor = 'grab';
        setHoveredEventTitle(null);
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(eventMeshes.map((m) => m.mesh));

      if (intersects.length > 0) {
        const hit = eventMeshes.find((m) => m.mesh === intersects[0].object);
        if (hit) {
          setSelectedEventId(hit.eventId);
          onSelectEvent?.(hit.eventId);
        }
      }
    };

    const onDoubleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(daySlabs.map((s) => s.mesh));

      if (intersects.length > 0) {
        const hitSlab = daySlabs.find((s) => s.mesh === intersects[0].object);
        if (hitSlab) {
          setActiveDate(hitSlab.dateStr);
          setEnvironment('now');
          onEnterDay?.(hitSlab.dateStr);
        }
      }
    };

    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('dblclick', onDoubleClick);

    // 10. Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 11. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 12. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousemove', onPointerMove);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('dblclick', onDoubleClick);
      renderer.dispose();
      scene.clear();
    };
  }, [activeDate, events, categories, selectedEventId]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, -28, 42);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  if (!webGlSupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-surface">
        <AlertCircle size={32} className="text-warning mb-3" />
        <h3 className="text-base font-semibold text-text-primary">WebGL Acceleration Unavailable</h3>
        <p className="text-xs text-text-secondary max-w-sm mt-1">
          Your browser or display adapter does not support WebGL. MOMENTUM has seamlessly fallen back to the accessible 2D view.
        </p>
        <button
          onClick={() => setEnvironment('now')}
          className="mt-4 px-4 py-2 rounded-lg bg-accent text-black font-semibold text-xs"
        >
          Return to Radial NOW
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Hover Badge */}
      {hoveredEventTitle && (
        <div className="absolute top-4 left-6 pointer-events-none bg-surface-raised/90 border border-border px-3 py-1.5 rounded-lg text-xs font-medium text-text-primary backdrop-blur-md shadow-glow">
          {hoveredEventTitle}
        </div>
      )}

      {/* Camera Controls Overlay */}
      <div className="absolute bottom-4 right-6 flex items-center gap-2">
        <button
          onClick={handleResetCamera}
          className="px-3 py-1.5 bg-surface/80 border border-border hover:border-accent rounded-lg text-xs font-mono text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5 backdrop-blur-md"
        >
          <RotateCcw size={13} />
          <span>Reset Camera</span>
        </button>
      </div>
    </div>
  );
};
