import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

interface BlochSphereProps {
  theta: number; // in radians
  probability: number;
  qubitLabel?: string;
  customerId?: number;
  className?: string;
}

function SphereAxes() {
  return (
    <group>
      {/* Z-axis (|0> / |1>) */}
      <Line points={[[0, -1.3, 0], [0, 1.3, 0]]} color="#38bdf8" lineWidth={1.5} />
      {/* X-axis */}
      <Line points={[[-1.3, 0, 0], [1.3, 0, 0]]} color="#64748b" lineWidth={1} />
      {/* Y-axis */}
      <Line points={[[0, 0, -1.3], [0, 0, 1.3]]} color="#64748b" lineWidth={1} />

      {/* Axis Labels */}
      <Html position={[0, 1.45, 0]} center>
        <div className="text-[10px] font-mono font-bold text-cyan-300 bg-slate-900/80 px-1 py-0.5 rounded border border-cyan-500/30">
          |0⟩
        </div>
      </Html>
      <Html position={[0, -1.45, 0]} center>
        <div className="text-[10px] font-mono font-bold text-cyan-300 bg-slate-900/80 px-1 py-0.5 rounded border border-cyan-500/30">
          |1⟩
        </div>
      </Html>
      <Html position={[1.45, 0, 0]} center>
        <div className="text-[9px] font-mono text-slate-400">
          +X
        </div>
      </Html>
    </group>
  );
}

function EquatorRing() {
  const points = React.useMemo(() => {
    const pts = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)));
    }
    return pts;
  }, []);

  return <Line points={points} color="#475569" lineWidth={0.8} dashed dashScale={10} />;
}

function StateVector({ theta }: { theta: number }) {
  // Ry rotation: state vector in X-Y plane (where Y is quantum Z axis)
  // |psi> = cos(theta/2)|0> + sin(theta/2)|1>
  // On the Bloch sphere:
  // North pole (Y=1) is |0>, South pole (Y=-1) is |1>
  // Polar angle from +Y is theta
  const x = Math.sin(theta);
  const y = Math.cos(theta);
  const z = 0;

  const tip = new THREE.Vector3(x, y, z);
  const origin = new THREE.Vector3(0, 0, 0);

  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // gentle pulse or tilt
    }
  });

  return (
    <group ref={groupRef}>
      {/* State vector line */}
      <Line points={[origin, tip]} color="#00f2fe" lineWidth={3.5} />
      
      {/* Tip glow sphere */}
      <mesh position={[x, y, z]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#00f2fe"
          emissive="#00f2fe"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Projection line to Z-axis (Y-axis in 3D) */}
      <Line points={[[0, y, 0], [x, y, z]]} color="#f59e0b" lineWidth={1.2} dashed dashScale={20} />

      {/* State label */}
      <Html position={[x * 1.15, y * 1.15, z]} center>
        <div className="text-[9px] font-mono font-semibold text-emerald-300 bg-slate-950/90 px-1 py-0.5 rounded border border-emerald-500/40 shadow-lg whitespace-nowrap">
          |ψ⟩ ({(Math.cos(theta/2)**2).toFixed(2)}, {(Math.sin(theta/2)**2).toFixed(2)})
        </div>
      </Html>
    </group>
  );
}

export const BlochSphere3D: React.FC<BlochSphereProps> = ({
  theta,
  probability,
  qubitLabel = 'q0',
  customerId,
  className = 'w-full h-48'
}) => {
  return (
    <div className={`relative ${className} group cursor-grab active:cursor-grabbing`}>
      <Canvas
        camera={{ position: [2.2, 1.4, 2.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[4, 5, 4]} intensity={2.0} color="#38bdf8" />
        
        {/* Main translucent sphere */}
        <mesh>
          <sphereGeometry args={[1, 28, 28]} />
          <meshStandardMaterial
            color="#1e293b"
            transparent
            opacity={0.18}
            roughness={0.2}
            metalness={0.1}
            wireframe={false}
          />
        </mesh>

        {/* Wireframe overlay */}
        <mesh>
          <sphereGeometry args={[1.002, 14, 14]} />
          <meshStandardMaterial
            color="#334155"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>

        <SphereAxes />
        <EquatorRing />
        <StateVector theta={theta} />
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>

      {/* Header overlay */}
      <div className="absolute top-2 left-2 pointer-events-none flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/60 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="text-[11px] font-mono font-bold text-cyan-300">{qubitLabel}</span>
        {customerId && (
          <span className="text-[10px] text-slate-400 font-mono">#{customerId}</span>
        )}
      </div>

      {/* Bottom overlay: rotation info */}
      <div className="absolute bottom-2 left-2 right-2 pointer-events-none flex justify-between items-center bg-slate-950/70 px-2 py-1 rounded border border-slate-800 text-[10px] font-mono">
        <span className="text-slate-400">θ = {(theta * 180 / Math.PI).toFixed(1)}°</span>
        <span className="text-emerald-400 font-bold">P(|1⟩) = {(probability * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};
