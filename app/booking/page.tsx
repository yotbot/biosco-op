"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Suspense } from "react";

function BookingContent() {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movie");
  const time = searchParams.get("time");
  const title = searchParams.get("title");

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = 12;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold tracking-tighter cursor-pointer hover:opacity-70 transition-opacity"
            >
              BIOSCO<span className="text-white/40">·</span>OP
            </motion.h1>
          </Link>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <Link
              href="/"
              className="text-sm text-white/50 hover:text-white transition-colors font-medium"
            >
              Back to Movies
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Booking Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Movie Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <p className="text-white/40 text-sm font-medium tracking-widest uppercase mb-4">
              Now Booking
            </p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              {title || "Movie"}
            </h2>
            <div className="flex items-center justify-center gap-6 text-white/50">
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-2xl font-semibold text-white">{time}</span>
              </span>
              <span className="text-white/20">|</span>
              <span className="text-sm">Today</span>
            </div>
          </motion.div>

          {/* Screen */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-16"
          >
            <div className="relative">
              <div className="h-2 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full mb-2" />
              <p className="text-center text-white/20 text-xs tracking-widest uppercase">
                Screen
              </p>
            </div>
          </motion.div>

          {/* Seats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 mb-16"
          >
            {rows.map((row, rowIndex) => (
              <motion.div
                key={row}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + rowIndex * 0.05 }}
                className="flex items-center justify-center gap-2"
              >
                <span className="w-6 text-white/30 text-sm font-mono">{row}</span>
                <div className="flex gap-2">
                  {Array.from({ length: seatsPerRow }, (_, i) => {
                    const isOccupied = Math.random() > 0.7;
                    return (
                      <motion.button
                        key={`${row}${i + 1}`}
                        whileHover={!isOccupied ? { scale: 1.2 } : {}}
                        whileTap={!isOccupied ? { scale: 0.9 } : {}}
                        disabled={isOccupied}
                        className={`w-8 h-8 rounded-t-lg text-xs font-mono transition-colors ${
                          isOccupied
                            ? "bg-white/5 text-white/10 cursor-not-allowed"
                            : "bg-white/10 hover:bg-emerald-500 text-white/50 hover:text-white cursor-pointer"
                        }`}
                      >
                        {i + 1}
                      </motion.button>
                    );
                  })}
                </div>
                <span className="w-6 text-white/30 text-sm font-mono">{row}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-8 mb-16"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-t-lg bg-white/10" />
              <span className="text-white/40 text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-t-lg bg-emerald-500" />
              <span className="text-white/40 text-sm">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-t-lg bg-white/5" />
              <span className="text-white/40 text-sm">Occupied</span>
            </div>
          </motion.div>

          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/40 text-sm">Selected Seats</p>
                <p className="text-white text-lg font-semibold">Select seats above</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-sm">Total</p>
                <p className="text-3xl font-bold">$0.00</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors"
            >
              Continue to Payment
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">Movie ID: {movieId}</p>
          <p className="text-white/20 text-xs font-mono">
            {new Date().getFullYear()} BIOSCO·OP
          </p>
        </div>
      </footer>
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
