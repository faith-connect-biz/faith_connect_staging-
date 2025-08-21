import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface FaithSymbolProps {
  position?: [number, number, number];
  scale?: number;
  color?: string;
}

const Cross = ({ position = [0, 0, 0], scale = 1, color = "#d97706" }: FaithSymbolProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (hovered) {
        meshRef.current.rotation.z += 0.02;
      }
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Vertical beam */}
      <Box 
        ref={meshRef}
        args={[0.2, 2, 0.2]} 
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={color} />
      </Box>
      
      {/* Horizontal beam */}
      <Box 
        args={[1.5, 0.2, 0.2]} 
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color={color} />
      </Box>
    </group>
  );
};

const Dove = ({ position = [0, 0, 0], scale = 1 }: FaithSymbolProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Dove body */}
      <Sphere args={[0.3, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f59e0b" />
      </Sphere>
      
      {/* Wings */}
      <Box args={[0.8, 0.1, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f59e0b" />
      </Box>
      
      {/* Head */}
      <Sphere args={[0.15, 16, 16]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#f59e0b" />
      </Sphere>
    </group>
  );
};

const Globe = ({ position = [0, 0, 0], scale = 1 }: FaithSymbolProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position} scale={scale}>
      <Sphere ref={meshRef} args={[1, 32, 32]}>
        <meshStandardMaterial 
          color="#1e3a8a" 
          transparent 
          opacity={0.8}
        />
      </Sphere>
      
      {/* Grid lines for globe effect */}
      <Sphere args={[1.01, 16, 16]}>
        <meshBasicMaterial 
          color="#d97706" 
          wireframe 
          transparent 
          opacity={0.3}
        />
      </Sphere>
    </group>
  );
};

interface FaithSymbolSceneProps {
  symbolType?: 'cross' | 'dove' | 'globe';
  position?: [number, number, number];
  scale?: number;
  color?: string;
  showControls?: boolean;
}

export const FaithSymbolScene = ({ 
  symbolType = 'cross', 
  position = [0, 0, 0], 
  scale = 1, 
  color = "#d97706",
  showControls = false 
}: FaithSymbolSceneProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {symbolType === 'cross' && (
          <Cross position={position} scale={scale} color={color} />
        )}
        
        {symbolType === 'dove' && (
          <Dove position={position} scale={scale} />
        )}
        
        {symbolType === 'globe' && (
          <Globe position={position} scale={scale} />
        )}
        
        {showControls && <OrbitControls enableZoom={false} />}
      </Canvas>
    </div>
  );
};

export default FaithSymbolScene; 