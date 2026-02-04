"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { SeatMinimap } from "@/components/SeatMinimap";
import { CinemaData } from "@/lib/types";
import { getCinemaHall, getAllHallIds, getHallName } from "@/lib/cinemaHalls";

const Cinema3DCanvas = dynamic(
  () => import("@/components/Cinema3D").then((mod) => mod.Cinema3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading 3D Cinema...</p>
        </div>
      </div>
    ),
  }
);

const TICKET_PRICE = 14.5;

// Get row names from cinema data
function getRowNames(cinemaData: CinemaData): string[] {
  const rowNames: string[] = [];
  cinemaData.maps[0].seats.forEach((row) => {
    if (row.length > 1 && row[0].rowName && !rowNames.includes(row[0].rowName)) {
      rowNames.push(row[0].rowName);
    }
  });
  return rowNames;
}

function BookingContent() {
  const searchParams = useSearchParams();
  const time = searchParams.get("time");
  const title = searchParams.get("title") || "Movie";
  const hallParam = searchParams.get("hall") || "zaal-1";

  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [focusedSeat, setFocusedSeat] = useState<string | null>(null);
  const [cinemaData, setCinemaData] = useState<CinemaData | null>(null);
  const [currentHall, setCurrentHall] = useState(hallParam);
  const [isClient, setIsClient] = useState(false);

  // Initialize cinema data on client side
  useEffect(() => {
    setIsClient(true);
    const data = getCinemaHall(currentHall);
    setCinemaData(data);
    setSelectedSeats(new Set()); // Reset selection when hall changes

    // Set initial focus to a center seat
    const rows = getRowNames(data);
    if (rows.length > 0) {
      const middleRow = rows[Math.floor(rows.length / 2)];
      const colCount = data.maps[0].colCount;
      setFocusedSeat(`${middleRow}-S${Math.floor(colCount / 2)}`);
    }
  }, [currentHall]);

  const handleSeatSelect = useCallback((seatId: string) => {
    setSelectedSeats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(seatId)) {
        newSet.delete(seatId);
      } else {
        newSet.add(seatId);
      }
      return newSet;
    });
  }, []);

  const handleSeatFocus = useCallback((seatId: string | null) => {
    if (seatId) setFocusedSeat(seatId);
  }, []);

  // Parse seat ID format: "R5-S8" -> { row: "R5", seat: 8 }
  const parseSeatId = (seatId: string) => {
    const [rowName, seatName] = seatId.split("-");
    const seatNum = parseInt(seatName.replace("S", ""), 10);
    return { rowName, seatNum };
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!cinemaData || !focusedSeat) return;

      const rows = getRowNames(cinemaData);
      const colCount = cinemaData.maps[0].colCount;
      const { rowName, seatNum } = parseSeatId(focusedSeat);
      const rowIndex = rows.indexOf(rowName);

      let newRowIndex = rowIndex;
      let newSeatNum = seatNum;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          newRowIndex = Math.max(0, rowIndex - 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          newRowIndex = Math.min(rows.length - 1, rowIndex + 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          newSeatNum = Math.max(1, seatNum - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          newSeatNum = Math.min(colCount, seatNum + 1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          handleSeatSelect(focusedSeat);
          return;
        default:
          return;
      }

      const newSeatId = `${rows[newRowIndex]}-S${newSeatNum}`;
      setFocusedSeat(newSeatId);
    },
    [cinemaData, focusedSeat, handleSeatSelect]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const totalPrice = useMemo(
    () => selectedSeats.size * TICKET_PRICE,
    [selectedSeats]
  );

  const sortedSelectedSeats = useMemo(
    () =>
      Array.from(selectedSeats).sort((a, b) => {
        const aRow = a.split("-")[0];
        const bRow = b.split("-")[0];
        if (aRow !== bRow) return aRow.localeCompare(bRow);
        const aNum = parseInt(a.split("-")[1].replace("S", ""));
        const bNum = parseInt(b.split("-")[1].replace("S", ""));
        return aNum - bNum;
      }),
    [selectedSeats]
  );

  // Format seat ID for display: "R5-S8" -> "5-8"
  const formatSeatDisplay = (seatId: string) => {
    const [row, seat] = seatId.split("-");
    return `${row.replace("R", "")}-${seat.replace("S", "")}`;
  };

  if (!cinemaData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const hallIds = getAllHallIds();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold tracking-tighter cursor-pointer hover:opacity-70 transition-opacity"
              >
                BIOSCO<span className="text-white/40">·</span>OP
              </motion.h1>
            </Link>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-white/40">|</span>
              <span className="text-white font-medium truncate max-w-[200px]">
                {title}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-white/60">{time}</span>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm text-white/50 hover:text-white transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </header>

      {/* Hall Selector */}
      <div className="bg-zinc-950 border-b border-white/5 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto">
          <span className="text-white/40 text-sm whitespace-nowrap">Select Hall:</span>
          <div className="flex gap-2">
            {hallIds.map((hallId) => (
              <button
                key={hallId}
                onClick={() => setCurrentHall(hallId)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  currentHall === hallId
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                }`}
              >
                {getHallName(hallId)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* 3D Cinema View */}
        <div className="relative flex-1 min-h-[500px] lg:min-h-0">
          {isClient && (
            <Cinema3DCanvas
              movieTitle={title}
              cinemaData={cinemaData}
              selectedSeats={selectedSeats}
              focusedSeat={focusedSeat}
              onSeatSelect={handleSeatSelect}
              onSeatFocus={handleSeatFocus}
            />
          )}

          {/* Minimap */}
          {isClient && (
            <SeatMinimap
              cinemaData={cinemaData}
              selectedSeats={selectedSeats}
              focusedSeat={focusedSeat}
              onSeatClick={handleSeatSelect}
              onSeatHover={handleSeatFocus}
            />
          )}

          {/* Focused seat indicator */}
          {focusedSeat && (
            <motion.div
              key={focusedSeat}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10"
            >
              <span className="text-white/40 text-sm">Row </span>
              <span className="text-white font-mono font-bold">{formatSeatDisplay(focusedSeat)}</span>
            </motion.div>
          )}

          {/* Controls hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 left-6 text-white/30 text-xs hidden lg:block"
          >
            <p>Drag to rotate · Scroll to zoom</p>
          </motion.div>
        </div>

        {/* Booking Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-96 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col"
        >
          {/* Movie Info */}
          <div className="mb-8">
            <p className="text-white/40 text-xs font-medium tracking-widest uppercase mb-2">
              Booking
            </p>
            <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
            <div className="flex items-center gap-4 text-white/50 text-sm">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {time}
              </span>
              <span>Today</span>
            </div>
            <p className="text-white/30 text-sm mt-2">{cinemaData.maps[0].roomName}</p>
          </div>

          {/* Selected Seats */}
          <div className="flex-1">
            <p className="text-white/40 text-xs font-medium tracking-widest uppercase mb-3">
              Selected Seats ({selectedSeats.size})
            </p>
            {selectedSeats.size > 0 ? (
              <div className="flex flex-wrap gap-2 mb-6">
                {sortedSelectedSeats.map((seatId) => (
                  <motion.button
                    key={seatId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSeatSelect(seatId)}
                    className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-400 text-sm font-mono font-medium hover:bg-emerald-500/30 transition-colors group"
                  >
                    {formatSeatDisplay(seatId)}
                    <span className="ml-2 text-emerald-500/50 group-hover:text-emerald-400">×</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm mb-6">
                Click on seats in the 3D view or use arrow keys to navigate
              </p>
            )}

            {/* Price breakdown */}
            {selectedSeats.size > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2 mb-6 py-4 border-y border-white/5"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">
                    {selectedSeats.size} × Ticket
                  </span>
                  <span className="text-white/70">
                    ${TICKET_PRICE.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Service fee</span>
                  <span className="text-white/70">$1.50</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Total and Checkout */}
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/50">Total</span>
              <motion.span
                key={totalPrice}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold"
              >
                ${(totalPrice + (selectedSeats.size > 0 ? 1.5 : 0)).toFixed(2)}
              </motion.span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={selectedSeats.size === 0}
              className={`w-full py-4 rounded-xl font-semibold transition-all ${
                selectedSeats.size > 0
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              {selectedSeats.size > 0 ? "Continue to Payment" : "Select Seats"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
