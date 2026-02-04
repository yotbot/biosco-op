"use client";

import { useMemo, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { CinemaSeat } from "./CinemaSeat";
import { CinemaScreen } from "./CinemaScreen";
import { CinemaData } from "@/lib/types";
import { convertToFlatSeats } from "@/lib/sampleCinemaData";
import * as THREE from "three";

interface Cinema3DProps {
  movieTitle: string;
  cinemaData: CinemaData;
  selectedSeats: Set<string>;
  focusedSeat: string | null;
  onSeatSelect: (seatId: string) => void;
  onSeatFocus: (seatId: string | null) => void;
  povMode: boolean;
  povSeatId: string | null;
}

interface CameraControllerProps {
  povMode: boolean;
  povPosition: [number, number, number] | null;
  overviewPosition: [number, number, number];
  overviewTarget: [number, number, number];
  screenPosition: [number, number, number];
}

function CameraController({
  povMode,
  povPosition,
  overviewPosition,
  overviewTarget,
  screenPosition,
}: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (povMode && povPosition) {
      // Smoothly move camera to seat POV
      const targetPos = new THREE.Vector3(
        povPosition[0],
        povPosition[1] + 1.2, // Eye height when seated
        povPosition[2] + 0.3
      );
      camera.position.lerp(targetPos, 0.05);

      // Look at screen
      const lookAt = new THREE.Vector3(screenPosition[0], screenPosition[1], screenPosition[2]);
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      currentLookAt.multiplyScalar(10).add(camera.position);

      currentLookAt.lerp(lookAt, 0.05);
      camera.lookAt(lookAt);

      // Disable orbit controls in POV mode
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    } else {
      // Enable orbit controls in overview mode
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    }
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={overviewPosition}
        fov={povMode ? 70 : 55}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.3}
        minDistance={5}
        maxDistance={20}
        target={overviewTarget}
        enabled={!povMode}
      />
    </>
  );
}

function CinemaScene({
  cinemaData,
  selectedSeats,
  focusedSeat,
  onSeatSelect,
  onSeatFocus,
  povMode,
  povSeatId,
}: Cinema3DProps) {
  const { seats, rowCount, colCount } = useMemo(
    () => convertToFlatSeats(cinemaData, selectedSeats),
    [cinemaData, selectedSeats]
  );

  // Calculate scene dimensions based on seat layout
  const sceneWidth = colCount * 0.65;
  const sceneDepth = rowCount * 1.0;

  // Find the POV seat position
  const povSeat = useMemo(() => {
    if (!povSeatId) return null;
    return seats.find((s) => s.id === povSeatId) || null;
  }, [seats, povSeatId]);

  const screenPosition: [number, number, number] = [0, 2.5, -3];
  const overviewPosition: [number, number, number] = [0, 5, sceneDepth + 6];
  const overviewTarget: [number, number, number] = [0, 1, sceneDepth / 2];

  return (
    <>
      {/* Camera Controller */}
      <CameraController
        povMode={povMode}
        povPosition={povSeat?.position || null}
        overviewPosition={overviewPosition}
        overviewTarget={overviewTarget}
        screenPosition={screenPosition}
      />

      {/* Lighting */}
      <ambientLight intensity={povMode ? 0.3 : 0.5} />
      <directionalLight position={[5, 10, 5]} intensity={povMode ? 0.5 : 0.8} castShadow />
      <directionalLight position={[-5, 5, 10]} intensity={0.4} />

      {/* Cinema screen */}
      <CinemaScreen position={screenPosition} />

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

      {/* Seats - hide in POV mode or make transparent */}
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
