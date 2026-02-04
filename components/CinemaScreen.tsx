"use client";

import { useEffect } from "react";
import { useVideoTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CinemaScreenProps {
  position: [number, number, number];
}

function VideoScreen() {
  const texture = useVideoTexture(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    {
      muted: true,
      loop: true,
      start: true,
      crossOrigin: "anonymous",
    }
  );

  // Fix video texture settings to prevent glitching
  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
    }
  }, [texture]);

  // Force texture update every frame
  useFrame(() => {
    if (texture) {
      texture.needsUpdate = true;
    }
  });

  return (
    // Move video plane forward to avoid z-fighting with frame
    <mesh position={[0, 0, 0.05]}>
      <planeGeometry args={[9, 5]} />
      <meshBasicMaterial map={texture} toneMapped={false} side={THREE.FrontSide} />
    </mesh>
  );
}

export function CinemaScreen({ position }: CinemaScreenProps) {
  return (
    <group position={position}>
      {/* Screen frame - moved further back */}
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[9.6, 5.6, 0.2]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Black backing behind video to prevent see-through */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[9.1, 5.1]} />
        <meshBasicMaterial color="#000000" side={THREE.FrontSide} />
      </mesh>

      {/* Screen with video */}
      <VideoScreen />

      {/* Screen glow */}
      <pointLight
        position={[0, 0, 4]}
        intensity={2}
        color="#6688ff"
        distance={15}
        decay={2}
      />
    </group>
  );
}
