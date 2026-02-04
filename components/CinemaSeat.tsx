"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { SeatType, SeatStatus } from "@/lib/types";

interface CinemaSeatProps {
  position: [number, number, number];
  seatId: string;
  seatType: SeatType;
  status: SeatStatus;
  isFocused: boolean;
  onClick: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

// Colors for each seat type (when not selected/focused/hovered)
const SEAT_COLORS: Record<SeatType, string> = {
  STD: "#8B0000",     // Dark red - Standard
  DIS: "#3b82f6",     // Blue - Wheelchair
  DUO: "#9333ea",     // Purple - Loveseat
  TRIO: "#c026d3",    // Fuchsia - Triple
  SOFA: "#7c3aed",    // Violet - Sofa
  LOGE: "#d97706",    // Amber - Loge VIP
  PRE: "#eab308",     // Yellow - Premium
  DBX: "#ef4444",     // Red - D-BOX
  NON: "#000000",
  AIL: "#000000",
  HOU: "#000000",
  COCOON: "#6366f1",
  LOUNGE: "#8b5cf6",
  TEDIBER: "#a855f7",
};

// Width multiplier for different seat types
const SEAT_WIDTH: Record<string, number> = {
  STD: 1,
  DIS: 1.2,
  DUO: 1,      // Individual seat of a pair
  TRIO: 1,    // Individual seat of a triple
  SOFA: 1.3,
  LOGE: 1.2,
  PRE: 1.1,
  DBX: 1.1,
};

export function CinemaSeat({
  position,
  seatType,
  status,
  isFocused,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: CinemaSeatProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const isOccupied = status === 1;
  const isSelected = status === 2;

  // Get base color for this seat type
  const baseColor = SEAT_COLORS[seatType] || SEAT_COLORS.STD;
  const widthMultiplier = SEAT_WIDTH[seatType] || 1;

  // Colors based on state
  const getColor = () => {
    if (isOccupied) return "#2a2a2a";
    if (isSelected) return "#22c55e";
    if (isFocused) return "#fbbf24";
    if (hovered) return "#f87171";
    return baseColor;
  };

  const getEmissiveColor = () => {
    if (isOccupied) return "#000000";
    if (isSelected) return "#22c55e";
    if (isFocused) return "#fbbf24";
    if (hovered) return "#f87171";
    return "#000000";
  };

  const emissiveIntensity = isOccupied ? 0 : isSelected || isFocused ? 0.5 : hovered ? 0.3 : 0;

  // Animate on hover/select
  useFrame((state) => {
    if (groupRef.current) {
      const shouldAnimate = (isSelected || isFocused || hovered) && !isOccupied;
      const targetY = shouldAnimate
        ? position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.03
        : position[1];
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
    }
  });

  // Different seat geometries based on type
  const renderSeat = () => {
    const color = getColor();
    const emissive = getEmissiveColor();
    const baseWidth = 0.5 * widthMultiplier;

    // Luxury seats (SOFA, LOGE, PRE) have taller backs
    const isLuxury = ["SOFA", "LOGE", "PRE", "DBX"].includes(seatType);
    const backHeight = isLuxury ? 0.5 : 0.4;
    const cushionThickness = isLuxury ? 0.12 : 0.1;

    return (
      <>
        {/* Seat cushion */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[baseWidth, cushionThickness, 0.4]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
            roughness={0.7}
          />
        </mesh>

        {/* Seat back */}
        <mesh position={[0, 0.25 + (backHeight - 0.4) / 2, -0.15]} castShadow>
          <boxGeometry args={[baseWidth, backHeight, 0.08]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
            roughness={0.7}
          />
        </mesh>

        {/* Armrests */}
        <mesh position={[-(baseWidth / 2 + 0.02), 0.15, 0]} castShadow>
          <boxGeometry args={[0.04, 0.1, 0.35]} />
          <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[(baseWidth / 2 + 0.02), 0.15, 0]} castShadow>
          <boxGeometry args={[0.04, 0.1, 0.35]} />
          <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.3} />
        </mesh>

        {/* Pedestal - different for D-BOX */}
        {seatType === "DBX" ? (
          // D-BOX has a motion platform base
          <mesh position={[0, -0.12, 0]} castShadow>
            <boxGeometry args={[baseWidth * 0.9, 0.1, 0.35]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
          </mesh>
        ) : (
          <mesh position={[0, -0.1, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.15, 8]} />
            <meshStandardMaterial color="#222222" roughness={0.3} metalness={0.7} />
          </mesh>
        )}

        {/* Glow ring when active */}
        {(isSelected || isFocused) && !isOccupied && (
          <mesh position={[0, -0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 0.38, 32]} />
            <meshBasicMaterial
              color={isSelected ? "#22c55e" : "#fbbf24"}
              transparent
              opacity={0.6}
            />
          </mesh>
        )}

        {/* Type indicator badge */}
        {!isOccupied && seatType !== "STD" && (
          <mesh position={[0, 0.55, -0.12]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color={baseColor} />
          </mesh>
        )}
      </>
    );
  };

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      rotation={[0, Math.PI, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (!isOccupied) onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!isOccupied) {
          setHovered(true);
          onPointerEnter();
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onPointerLeave();
        document.body.style.cursor = "auto";
      }}
    >
      {renderSeat()}
    </group>
  );
}
