import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

interface IsingLandscapeProps {
  gamma?: number;
  beta?: number;
  className?: string;
}

function TerrainMesh({ gamma = 0.5, beta = 0.5 }: { gamma: number; beta: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const gridSize = 40;
  const size = 4.0;

  const { geometry, colors } = React.useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, gridSize, gridSize);
    const pos = geo.attributes.position;
    const colorArray = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);

      // Multi-minima Hamiltonian energy function
      const z =
        Math.sin(u * 2.5 + gamma * 2) * Math.cos(v * 2.5 + beta * 2) * 0.45 +
        Math.sin(Math.sqrt(u * u + v * v) * 3) * 0.25 -
        Math.exp(-(u * u + v * v) * 1.5) * 0.6; // Deep global minimum (ground state)

      pos.setZ(i, z);

      // Color based on energy depth (cyan at bottom/ground state, purple at peaks)
      const normZ = (z + 0.8) / 1.5;
      colorArray[i * 3] = 0.1 + (1 - normZ) * 0.7;     // R
      colorArray[i * 3 + 1] = 0.4 + (1 - normZ) * 0.5; // G
      colorArray[i * 3 + 2] = 0.9;                     // B
    }

    geo.computeVertexNormals();
    return { geometry: geo, colors: colorArray };
  }, [gamma, beta]);

  useFrame((_, delta) => {
    meshRef.current.rotation.z += delta * 0.08;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 3, 0, 0]}>
      <meshStandardMaterial
        wireframe
        color="#38bdf8"
        emissive="#0369a1"
        emissiveIntensity={0.5}
        roughness={0.4}
        metalness={0.8}
      />
    </mesh>
  );
}

function GroundStateMarker() {
  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={[0, -0.4, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#00f2fe"
          emissive="#00f2fe"
          emissiveIntensity={2.0}
        />
      </mesh>
    </Float>
  );
}

export const IsingLandscape3D: React.FC<IsingLandscapeProps> = ({
  gamma = 0.5,
  beta = 0.5,
  className = 'w-full h-56'
}) => {
  return (
    <div className={`relative ${className} group`}>
      <Canvas
        camera={{ position: [0, -3.2, 2.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={2.0} color="#38bdf8" />
        <pointLight position={[-3, -2, -2]} intensity={1.5} color="#ec4899" />
        <TerrainMesh gamma={gamma} beta={beta} />
        <GroundStateMarker />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-500/30 text-[10px] font-mono text-cyan-300 pointer-events-none">
        QUBO Cost Landscape H(x)
      </div>
    </div>
  );
};
