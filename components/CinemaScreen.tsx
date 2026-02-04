"use client";

import { useRef } from "react";
import { useVideoTexture } from "@react-three/drei";

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

  return (
    <mesh>
      <planeGeometry args={[9, 5]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function FallbackScreen() {
  return (
    <mesh>
      <planeGeometry args={[9, 5]} />
      <meshBasicMaterial color="#0a0a20" />
    </mesh>
  );
}

export function CinemaScreen({ position }: CinemaScreenProps) {
  return (
    <group position={position}>
      {/* Screen frame */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[9.6, 5.6, 0.2]} />
        <meshStandardMaterial color="#0a0a0a" />
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
