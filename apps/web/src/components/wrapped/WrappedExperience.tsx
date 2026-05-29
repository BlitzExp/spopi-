"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AnalyticsSummary, PersonalityAnalysis } from "@/lib/api/types";
import { buildWrappedStory } from "@/lib/wrapped/story";
import { WrappedSlideFrame } from "./WrappedSlideFrame";
import { GenreTag } from "@/components/dashboard/GenreTag";

type Props = {
  data: AnalyticsSummary;
  personality: PersonalityAnalysis;
};

export function WrappedExperience({ data, personality }: Props) {
  const story = useMemo(() => buildWrappedStory(data, personality), [data, personality]);
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    <WrappedSlideFrame
      key="intro"
      title="Tu wrapped (  •̀⤙•́  )"
      subtitle="una pequeña capsula del tiempo de tu viaje sonoro"
      accentClass="bg-gradient-to-br from-cyan-300 via-fuchsia-300 to-yellow-300"
    >
      <div className="space-y-4 text-center text-black">
        <p className="text-base md:text-lg">Este año viajaste por muchas rutas sonoras.</p>
        <p className="text-5xl font-black leading-none md:text-7xl">{story.totalMinutes.toLocaleString()}</p>
        <p className="text-sm uppercase tracking-widest md:text-base">minutos escuchados</p>
      </div>
    </WrappedSlideFrame>,
    <WrappedSlideFrame
      key="Artista "
      title="Artista Top"
      subtitle="de quien nunca te cansaste ( ◡̀_◡́)ᕤ"
      accentClass="bg-gradient-to-br from-pink-300 via-rose-200 to-orange-200"
    >
      <div className="space-y-3 text-center text-black">
        <p className="text-sm uppercase tracking-wider">#1 artist</p>
        <p className="text-3xl font-black md:text-5xl">{story.topArtistName}</p>
        <p className="text-lg font-bold">{story.topArtistMinutes.toLocaleString()} minutes together</p>
      </div>
    </WrappedSlideFrame>,
    <WrappedSlideFrame
      key="song"
      title="Canción top"
      subtitle="la que nunca falto"
      accentClass="bg-gradient-to-br from-violet-300 via-indigo-300 to-cyan-200"
    >
      <div className="space-y-3 text-center text-black">
        <p className="text-sm uppercase tracking-wider">#1 track</p>
        <p className="text-2xl font-black md:text-4xl">{story.topTrackName}</p>
        <p className="text-lg font-bold">{story.topTrackMinutes.toLocaleString()} minutes played</p>
      </div>
    </WrappedSlideFrame>,
    <WrappedSlideFrame
      key="minutes"
      title="Minutos de escucha"
      subtitle="el playtime del soundtrack de tu año"
      accentClass="bg-gradient-to-br from-lime-300 via-emerald-200 to-cyan-200"
    >
      <div className="space-y-2 text-center text-black">
        <p className="text-sm uppercase tracking-wider">total listening</p>
        <p className="text-5xl font-black md:text-7xl">{story.totalMinutes.toLocaleString()}</p>
        <p className="text-base md:text-lg">
          That is about {(story.totalMinutes / 60).toFixed(1)} hours of soundtrack.
        </p>
      </div>
    </WrappedSlideFrame>,
    <WrappedSlideFrame
      key="personality"
      title="Listening Personality"
      subtitle="your music identity this year"
      accentClass="bg-gradient-to-br from-fuchsia-300 via-pink-200 to-purple-200"
    >
      <div className="space-y-4 text-center text-black">
        <p className="text-5xl">{personality.archetypes[0]?.icon}</p>
        <p className="text-3xl font-black md:text-5xl">{personality.dominantName}</p>
        <p className="text-base font-bold md:text-lg">{personality.headline}</p>
        <p className="mx-auto max-w-xl text-sm md:text-base">{personality.commentary}</p>
      </div>
    </WrappedSlideFrame>,
    <WrappedSlideFrame
      key="fun"
      title="Fun Stats"
      subtitle="the little details that made your year"
      accentClass="bg-gradient-to-br from-yellow-300 via-orange-200 to-pink-300"
    >
      <div className="grid grid-cols-2 gap-3 text-black">
        {story.funStats.map((item) => (
          <div key={item.label} className="rounded-lg border-2 border-black/35 bg-white/50 p-3">
            <p className="text-[11px] uppercase tracking-wider">{item.label}</p>
            <p className="mt-1 text-lg font-black md:text-2xl">{item.value}</p>
          </div>
        ))}
      </div>
    </WrappedSlideFrame>,
  ];

  const totalSlides = slides.length;
  const goPrev = () => setSlideIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  const goNext = () => setSlideIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));

  return (
    <section className="w-full max-w-4xl rounded-2xl border-2 border-white/20 bg-black/35 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">Wrapped Story</h2>
        <span className="text-xs text-white/65">
          Slide {slideIndex + 1} / {totalSlides}
        </span>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">{slides[slideIndex]}</AnimatePresence>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setSlideIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === slideIndex ? "w-6 bg-cyan-300" : "w-2.5 bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={goPrev}
            className="rounded-md border-2 border-yellow-300 bg-yellow-300/15 px-4 py-2 text-sm font-bold text-yellow-100"
          >
            Prev
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={goNext}
            className="rounded-md border-2 border-cyan-300 bg-cyan-300/15 px-4 py-2 text-sm font-bold text-cyan-100"
          >
            Next
          </motion.button>
        </div>
      </div>
    </section>
  );
}

