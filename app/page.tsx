"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
}

interface MovieWithShowtimes extends Movie {
  showtimes: string[];
}

function generateShowtimes(): string[] {
  const times = ["14:30", "17:15", "20:00", "22:45"];
  return times.slice(0, 3 + Math.floor(Math.random() * 2)).sort();
}

function getImageUrl(path: string | null, size: string = "w500"): string {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const timeSlotVariants = {
  hover: {
    scale: 1.05,
    backgroundColor: "rgba(255, 255, 255, 1)",
    color: "rgba(0, 0, 0, 1)",
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95 },
};

export default function Home() {
  const [movies, setMovies] = useState<MovieWithShowtimes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch("/api/movies");
        if (!response.ok) throw new Error("Failed to fetch movies");
        const data = await response.json();
        const moviesWithShowtimes = data.map((movie: Movie) => ({
          ...movie,
          showtimes: generateShowtimes(),
        }));
        setMovies(moviesWithShowtimes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-500 font-mono">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold tracking-tighter"
          >
            BIOSCO<span className="text-white/40">·</span>OP
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-8"
          >
            <span className="text-sm text-white/50 font-medium tracking-wide">NOW SHOWING</span>
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-6">
              <span className="text-white">Cinema</span>
              <br />
              <span className="text-white/20">Reimagined</span>
            </h2>
            <p className="text-white/40 text-lg md:text-xl max-w-md font-light tracking-wide">
              Select your showtime. Reserve your seat. Experience the magic.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Movie Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Table Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-12 gap-4 py-4 border-b border-white/10 mb-2 text-xs font-medium text-white/30 tracking-widest uppercase"
          >
            <div className="col-span-1">#</div>
            <div className="col-span-2">Poster</div>
            <div className="col-span-4">Title</div>
            <div className="col-span-1">Year</div>
            <div className="col-span-4">Showtimes</div>
          </motion.div>

          {/* Movie Rows */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {movies.map((movie, index) => (
              <motion.div
                key={movie.id}
                variants={rowVariants}
                className="group grid grid-cols-12 gap-4 py-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center"
              >
                {/* Index */}
                <div className="col-span-1">
                  <span className="text-white/20 font-mono text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Poster */}
                <div className="col-span-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative aspect-[2/3] w-20 rounded-lg overflow-hidden bg-white/5"
                  >
                    {movie.poster_path ? (
                      <Image
                        src={getImageUrl(movie.poster_path, "w200")}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                          />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Title */}
                <div className="col-span-4">
                  <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-white group-hover:text-white/90 transition-colors leading-tight">
                    {movie.title}
                  </h3>
                  <p className="text-white/30 text-sm mt-1 font-medium flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </p>
                </div>

                {/* Year */}
                <div className="col-span-1">
                  <span className="text-white/40 font-mono text-sm">
                    {movie.release_date?.split("-")[0] || "—"}
                  </span>
                </div>

                {/* Showtimes */}
                <div className="col-span-4">
                  <div className="flex flex-wrap gap-2">
                    {movie.showtimes.map((time) => (
                      <Link
                        key={`${movie.id}-${time}`}
                        href={`/booking?movie=${movie.id}&time=${time}&title=${encodeURIComponent(movie.title)}`}
                      >
                        <motion.span
                          variants={timeSlotVariants}
                          whileHover="hover"
                          whileTap="tap"
                          className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 text-sm font-medium text-white/70 cursor-pointer backdrop-blur-sm"
                        >
                          {time}
                        </motion.span>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            Powered by TMDB
          </p>
          <p className="text-white/20 text-xs font-mono">
            {new Date().getFullYear()} BIOSCO·OP
          </p>
        </div>
      </footer>
    </div>
  );
}
