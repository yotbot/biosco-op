"use client";

import { motion } from "framer-motion";
import { CinemaData, SeatType } from "@/lib/types";

interface SeatMinimapProps {
  cinemaData: CinemaData;
  selectedSeats: Set<string>;
  focusedSeat: string | null;
  onSeatClick: (seatId: string) => void;
  onSeatHover: (seatId: string | null) => void;
}

// Tailwind classes for seat type colors
const SEAT_TYPE_CLASSES: Record<SeatType, string> = {
  STD: "bg-red-800/60 hover:bg-red-600",
  DIS: "bg-blue-600/60 hover:bg-blue-500",
  DUO: "bg-purple-600/60 hover:bg-purple-500",
  TRIO: "bg-fuchsia-600/60 hover:bg-fuchsia-500",
  SOFA: "bg-violet-600/60 hover:bg-violet-500",
  LOGE: "bg-amber-600/60 hover:bg-amber-500",
  PRE: "bg-yellow-500/60 hover:bg-yellow-400",
  DBX: "bg-red-500/60 hover:bg-red-400",
  NON: "bg-transparent",
  AIL: "bg-transparent",
  HOU: "bg-transparent",
  COCOON: "bg-indigo-600/60 hover:bg-indigo-500",
  LOUNGE: "bg-violet-500/60 hover:bg-violet-400",
  TEDIBER: "bg-purple-500/60 hover:bg-purple-400",
};

export function SeatMinimap({
  cinemaData,
  selectedSeats,
  focusedSeat,
  onSeatClick,
  onSeatHover,
}: SeatMinimapProps) {
  const map = cinemaData.maps[0];

  // Get unique seat types in this hall for the legend
  const uniqueSeatTypes = new Set<SeatType>();
  map.seats.forEach((row) => {
    row.forEach((seat) => {
      if (seat.seatType !== "NON") {
        uniqueSeatTypes.add(seat.seatType);
      }
    });
  });

  const seatTypeLabels: Record<string, string> = {
    STD: "Standard",
    DIS: "Wheelchair",
    DUO: "Duo",
    TRIO: "Trio",
    SOFA: "Sofa",
    LOGE: "Loge",
    PRE: "Premium",
    DBX: "D-BOX",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10 max-w-[280px]"
    >
      <div className="text-xs text-white/40 uppercase tracking-widest mb-3 text-center">
        {map.roomName}
      </div>

      {/* Screen indicator */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded mb-4" />

      {/* Seats grid */}
      <div className="space-y-0.5">
        {map.seats.map((row, rowIndex) => {
          // Skip spacer rows
          if (row.length === 1 && row[0].seatType === "NON") {
            return <div key={rowIndex} className="h-1" />;
          }

          const rowName = row[0]?.rowName || "";

          return (
            <div key={rowIndex} className="flex items-center gap-1">
              <span className="w-4 text-[8px] text-white/30 font-mono text-right">
                {rowName.replace("R", "")}
              </span>
              <div className="flex gap-0.5">
                {row.map((seat, seatIndex) => {
                  if (seat.seatType === "NON") {
                    return <div key={seatIndex} className="w-2.5 h-2.5" />;
                  }

                  const seatId = `${seat.rowName}-${seat.seatName}`;
                  const isSelected = selectedSeats.has(seatId);
                  const isFocused = focusedSeat === seatId;
                  const isOccupied = seat.status === 1;
                  const typeClass = SEAT_TYPE_CLASSES[seat.seatType] || SEAT_TYPE_CLASSES.STD;

                  return (
                    <motion.button
                      key={seatId}
                      onClick={() => !isOccupied && onSeatClick(seatId)}
                      onMouseEnter={() => onSeatHover(seatId)}
                      onMouseLeave={() => onSeatHover(null)}
                      whileHover={!isOccupied ? { scale: 1.3 } : {}}
                      whileTap={!isOccupied ? { scale: 0.9 } : {}}
                      className={`w-2.5 h-2.5 rounded-sm transition-all duration-150 cursor-pointer ${
                        isOccupied
                          ? "bg-white/5 cursor-not-allowed"
                          : isSelected
                          ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                          : isFocused
                          ? "bg-amber-400 shadow-lg shadow-amber-400/50"
                          : typeClass
                      }`}
                      disabled={isOccupied}
                      title={`${seat.rowName} ${seat.seatName} (${seat.seatType})`}
                    />
                  );
                })}
              </div>
              <span className="w-4 text-[8px] text-white/30 font-mono">
                {rowName.replace("R", "")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend - show seat types in this hall */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-4 text-[8px] text-white/40">
        {Array.from(uniqueSeatTypes).map((type) => (
          <div key={type} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-sm ${SEAT_TYPE_CLASSES[type].split(" ")[0]}`} />
            <span>{seatTypeLabels[type] || type}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-emerald-500" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-white/5" />
          <span>Taken</span>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="mt-3 pt-3 border-t border-white/5 text-center">
        <p className="text-[9px] text-white/30">
          <kbd className="px-1 py-0.5 bg-white/10 rounded text-white/50">Arrows</kbd> navigate
          {" · "}
          <kbd className="px-1 py-0.5 bg-white/10 rounded text-white/50">Enter</kbd> select
        </p>
      </div>
    </motion.div>
  );
}
