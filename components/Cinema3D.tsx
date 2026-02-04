"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { CinemaSeat } from "./CinemaSeat";
import { CinemaScreen } from "./CinemaScreen";
import { CinemaData } from "@/lib/types";
import { convertToFlatSeats } from "@/lib/sampleCinemaData";

interface Cinema3DProps {
  movieTitle: string;
  cinemaData: CinemaData;
  selectedSeats: Set<string>;
  focusedSeat: string | null;
  onSeatSelect: (seatId: string) => void;
  onSeatFocus: (seatId: string | null) => void;
}

function CinemaScene({
  cinemaData,
  selectedSeats,
  focusedSeat,
  onSeatSelect,
  onSeatFocus,
}: Cinema3DProps) {
  const { seats, rowCount, colCount } = useMemo(
    () => convertToFlatSeats(cinemaData, selectedSeats),
    [cinemaData, selectedSeats]
  );

  // Calculate scene dimensions based on seat layout
  const sceneWidth = colCount * 0.65;
  const sceneDepth = rowCount * 1.0;

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 5, sceneDepth + 6]} fov={55} />
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.3}
        minDistance={5}
        maxDistance={20}
        target={[0, 1, sceneDepth / 2]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 5, 10]} intensity={0.4} />

      {/* Cinema screen */}
      <CinemaScreen position={[0, 2.5, -3]} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, sceneDepth / 2]} receiveShadow>
        <planeGeometry args={[sceneWidth + 4, sceneDepth + 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Stepped platforms */}
      {Array.from({ length: rowCount }, (_, i) => (
        <mesh key={i} position={[0, i * 0.3 - 0.45, i * 1.0]}>
          <boxGeometry args={[sceneWidth + 1, 0.1, 1.0]} />
          <meshStandardMaterial color="#252525" />
        </mesh>
      ))}

      {/* Red aisle strips */}
      <mesh position={[-(sceneWidth / 2 + 0.5), -0.4, sceneDepth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.25, sceneDepth + 2]} />
        <meshStandardMaterial color="#8B0000" emissive="#330000" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[(sceneWidth / 2 + 0.5), -0.4, sceneDepth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.25, sceneDepth + 2]} />
        <meshStandardMaterial color="#8B0000" emissive="#330000" emissiveIntensity={0.5} />
      </mesh>

      {/* Seats */}
      {seats.map((seat) => (
        <CinemaSeat
          key={seat.id}
          seatId={seat.id}
          position={seat.position}
          seatType={seat.seatType}
          status={selectedSeats.has(seat.id) ? 2 : seat.status}
          isFocused={focusedSeat === seat.id}
          onClick={() => onSeatSelect(seat.id)}
          onPointerEnter={() => onSeatFocus(seat.id)}
          onPointerLeave={() => onSeatFocus(null)}
        />
      ))}
    </>
  );
}

export function Cinema3DCanvas(props: Cinema3DProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true }}
      style={{ background: "#0a0a0a" }}
    >
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#0a0a0a", 12, 25]} />
      <CinemaScene {...props} />
    </Canvas>
  );
}
