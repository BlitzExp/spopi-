"use client";

import { useState } from "react";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { PersonalityProfile } from "@/components/personality/PersonalityProfile";
import { UploadDropzone } from "@/components/UploadDropzone";
import { WrappedExperience } from "@/components/wrapped/WrappedExperience";
import type { AnalyticsSummary, PersonalityAnalysis } from "@/lib/api/types";

export default function Home() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [personality, setPersonality] = useState<PersonalityAnalysis | null>(null);
  const [activeView, setActiveView] = useState<"dashboard" | "wrapped" | "personality">("dashboard");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.20),transparent_45%),radial-gradient(circle_at_bottom,rgba(244,114,182,0.20),transparent_45%),linear-gradient(180deg,#0b1020,#060814)] p-6 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 py-10">
        <header className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-3 rounded-full border-2 border-white/15 bg-black/30 px-4 py-2">
            <span className="text-xs font-bold tracking-[0.35em] text-cyan-200"> ★</span>
            <span className="text-xs text-white/60">idm :D</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-pink-100 sm:text-5xl">
            Sube tu .zip ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧
          </h1>
          <p className="max-w-2xl text-sm text-white/75">
            Sube tu archivo .zip para conocer más de tus hábitos de escucha.
          </p>
        </header>

        <section className="flex">
          <UploadDropzone
            onResultsReady={({ analytics: nextAnalytics, personality: nextPersonality }) => {
              setAnalytics(nextAnalytics);
              setPersonality(nextPersonality);
            }}
          />
        </section>

        {analytics && personality ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView("dashboard")}
                className={`rounded-md border-2 px-4 py-2 text-sm font-bold ${
                  activeView === "dashboard"
                    ? "border-fuchsia-300 bg-fuchsia-300/20 text-fuchsia-100"
                    : "border-white/30 bg-black/20 text-white/80"
                }`}
              >
                Dashboard ◝(ᵔᗜᵔ)◜
              </button>
              <button
                type="button"
                onClick={() => setActiveView("wrapped")}
                className={`rounded-md border-2 px-4 py-2 text-sm font-bold ${
                  activeView === "wrapped"
                    ? "border-cyan-300 bg-cyan-300/20 text-cyan-100"
                    : "border-white/30 bg-black/20 text-white/80"
                }`}
              >
                Wrapped Story ݁♬⋆.𝄞
              </button>
              <button
                type="button"
                onClick={() => setActiveView("personality")}
                className={`rounded-md border-2 px-4 py-2 text-sm font-bold ${
                  activeView === "personality"
                    ? "border-yellow-300 bg-yellow-300/20 text-yellow-100"
                    : "border-white/30 bg-black/20 text-white/80"
                }`}
              >
                Personality （˶ˆᗜˆ˵）
              </button>
            </div>

            {activeView === "dashboard" ? (
              <AnalyticsDashboard
                data={analytics}
                personality={personality}
              />
            ) : null}
            {activeView === "wrapped" ? (
              <WrappedExperience data={analytics} personality={personality} />
            ) : null}
            {activeView === "personality" ? <PersonalityProfile personality={personality} /> : null}
          </>
        ) : null}

        <footer className="text-xs text-white/55">
          API expected at{" "}
          <span className="text-white/70">{process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}</span>
        </footer>
      </div>
    </main>
  );
}
