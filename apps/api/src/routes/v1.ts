import express from "express";
import { computeAnalytics } from "../analytics/service";
import { analyzePersonalities } from "../personality/service";
import { MAX_ZIP_BYTES, parseSpotifyZipUpload } from "../spotify/parseZipUpload";

const rawZipBodyParser = express.raw({
  type: ["application/zip", "application/x-zip-compressed"],
  limit: `${MAX_ZIP_BYTES}b`,
});

export const v1Router = express.Router();

v1Router.post("/upload", rawZipBodyParser, async (req, res) => {
  const parsed = await parseSpotifyZipUpload({
    contentTypeHeader: req.headers["content-type"],
    body: req.body,
  });

  res.json({
    ok: true,
    streamingHistoryFiles: parsed.streamingHistoryFiles,
    events: parsed.events.slice(0, 50),
    eventCount: parsed.events.length,
  });
});

v1Router.post("/analytics", rawZipBodyParser, async (req, res) => {
  const parsed = await parseSpotifyZipUpload({
    contentTypeHeader: req.headers["content-type"],
    body: req.body,
  });

  const analytics = computeAnalytics(parsed.events);
  const personality = analyzePersonalities(parsed.events, analytics);

  res.json({
    ok: true,
    streamingHistoryFiles: parsed.streamingHistoryFiles,
    eventCount: parsed.events.length,
    analytics,
    personality,
  });
});

