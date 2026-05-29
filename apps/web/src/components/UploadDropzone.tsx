"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { uploadZipForAnalytics } from "@/lib/api/client";
import type { AnalyticsSummary, PersonalityAnalysis } from "@/lib/api/types";

type UploadResult =
  | { ok: true; eventCount: number; streamingHistoryFiles: string[] }
  | { ok: false; message: string };

type UploadDropzoneProps = {
  onResultsReady: (results: {
    analytics: AnalyticsSummary;
    personality: PersonalityAnalysis;
  }) => void;
};

export function UploadDropzone({ onResultsReady }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const apiUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    return base.replace(/\/+$/, "");
  }, []);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setResult(null);
      setProgress(0);

      if (!file.name.toLowerCase().endsWith(".zip")) {
        setProgress(null);
        setError("Please upload your Spotify data export as a .zip file.");
        return;
      }

      try {
        const response = await uploadZipForAnalytics({
          apiBaseUrl: apiUrl,
          file,
          onProgress: setProgress,
        });

        setResult({
          ok: true,
          eventCount: response.eventCount,
          streamingHistoryFiles: response.streamingHistoryFiles,
        });
        setProgress(100);
        onResultsReady({
          analytics: response.analytics,
          personality: response.personality,
        });
      } catch (uploadError) {
        setProgress(null);
        setError(
          uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.",
        );
      }
    },
    [apiUrl, onResultsReady],
  );

  const onFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.item(0) ?? null;
      if (!file) return;
      void upload(file);
    },
    [upload],
  );

  return (
    <div className="w-full max-w-2xl">
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        className={[
          "rounded-xl border-4 p-6",
          "bg-black/40 backdrop-blur",
          "border-pink-300/80 shadow-[0_0_0_4px_rgba(0,0,0,0.6)]",
          isDragging ? "outline outline-4 outline-cyan-300" : "outline-none",
        ].join(" ")}
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-cyan-200">
              Sube el .zip que te mando spotify
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-pink-200">
              Arroja el archivo aqui ⤵︎
            </h2>
            <p className="mt-2 text-sm text-white/80">

            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border-2 border-cyan-300 bg-cyan-300/10 px-4 py-2 font-bold text-cyan-100 hover:bg-cyan-300/20"
            >
              Escoge un archivo ⸜(｡˃ ᵕ ˂ )⸝
            </button>
            <p className="self-center text-xs text-white/70">
              Tip: Tu archivo se va a llamar algo como {" "}
              <span className="text-white/90">my_spotify_data.zip</span>
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />

          {progress !== null ? (
            <div className="rounded-lg border-2 border-white/20 bg-black/40 p-3">
              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-3 w-full rounded bg-white/10">
                <div
                  className="h-3 rounded bg-gradient-to-r from-cyan-300 to-pink-300"
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border-2 border-red-300/60 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {result?.ok ? (
            <div className="rounded-lg border-2 border-green-300/60 bg-green-500/10 p-3 text-sm text-green-100">
              Parsed <span className="font-bold">{result.eventCount}</span> listening events from{" "}
              <span className="font-bold">{result.streamingHistoryFiles.length}</span> file(s).
              <div className="mt-2 text-xs text-green-100/80">
                {result.streamingHistoryFiles.slice(0, 3).map((p) => (
                  <div key={p}>{p}</div>
                ))}
                {result.streamingHistoryFiles.length > 3 ? (
                  <div>…and more</div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-xs text-white/60">

      </p>
    </div>
  );
}

