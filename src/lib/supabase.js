// src/lib/supabase.js — Phase 8.2.1 with seamless mock fallback
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("✅ Supabase URL:", SUPABASE_URL || "❌ MISSING");
console.log("✅ Supabase Key exists:", SUPABASE_KEY ? "Yes" : "❌ No Key");

let supabase;
let mockMode = false;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("⚠️ Using MOCK mode — Supabase credentials missing.");
  mockMode = true;
} else {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.error("❌ Supabase init failed. Switching to MOCK mode.", err);
    mockMode = true;
  }
}

// Mock data (seamless, no badge)
const mockSites = [
  { id: 1, name: "DroneBlog.com", revenue: "$45/day", status: "🔥 Hot" },
  { id: 2, name: "FitnessTips.net", revenue: "$20/day", status: "🟢 Stable" },
  { id: 3, name: "SmartHomeHQ.io", revenue: "$5/day", status: "🟡 Cold" },
];

const mockKeywords = [
  { keyword: "best budget drones 2025", source: "Google Trends", volume: 1400, competition: "Low" },
  { keyword: "home workout resistance bands", source: "Amazon", volume: 900, competition: "Medium" },
  { keyword: "solar energy for homes", source: "Pinterest", volume: 2200, competition: "High" },
];

export { supabase, mockMode, mockSites, mockKeywords };
