// Generates synthetic bid data for all modules that don't already have entries.
// Run: node scripts/gen-bid-data.mjs
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const modules = JSON.parse(readFileSync(join(root, "public/data/modules.json"), "utf8"));
const existing = JSON.parse(readFileSync(join(root, "public/data/bid-analytics.json"), "utf8"));

// ─── Competition tiers ──────────────────────────────────────────────────────
// HIGH   — upper-year IS/CS electives, limited seats, high demand
// MEDIUM — Year 1-2 IS/CS core, decent demand
// LOW    — COR (core curriculum), lots of sections, low competition

const HIGH   = new Set(["IS213","IS412","IS442","IS458","IS492","IS446","CS301","CS461","CS462","CS443","SE301"]);
const MEDIUM = new Set(["IS113","IS210","IS211","IS214","IS215","CS101","CS102","CS206"]);
// everything else (COR*) → LOW

function getTier(code) {
  if (HIGH.has(code))   return "HIGH";
  if (MEDIUM.has(code)) return "MEDIUM";
  return "LOW";
}

// Bid ranges per tier per window [min, max]
const RANGES = {
  HIGH: {
    1: { minBid: [4, 14],  medBid: [12, 28], befVac: [30, 45], aftVac: [20, 32] },
    2: { minBid: [20, 48], medBid: [38, 72], befVac: [16, 26], aftVac: [7, 14]  },
    3: { minBid: [45, 88], medBid: [68, 96], befVac: [6, 13],  aftVac: [1, 3]   },
  },
  MEDIUM: {
    1: { minBid: [1, 6],   medBid: [2, 12],  befVac: [35, 50], aftVac: [25, 38] },
    2: { minBid: [5, 20],  medBid: [12, 35], befVac: [18, 30], aftVac: [9, 18]  },
    3: { minBid: [14, 48], medBid: [26, 64], befVac: [7, 14],  aftVac: [1, 5]   },
  },
  LOW: {
    1: { minBid: [1, 2],   medBid: [1, 4],   befVac: [40, 65], aftVac: [32, 52] },
    2: { minBid: [1, 6],   medBid: [3, 12],  befVac: [24, 40], aftVac: [14, 28] },
    3: { minBid: [3, 14],  medBid: [6, 22],  befVac: [8, 18],  aftVac: [1, 6]   },
  },
};

// Deterministic pseudo-random seeded by a string
function seededRand(seed, salt) {
  let h = 0;
  const s = String(seed) + String(salt);
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  h = Math.abs(h);
  return (h % 1000) / 1000; // 0..1
}

function pick(min, max, seed, salt) {
  return Math.round(min + seededRand(seed, salt) * (max - min));
}

// ─── Build records ───────────────────────────────────────────────────────────

const termLabels = {
  "Term 1":  ["2024/25 Term 1", "2023/24 Term 1"],
  "Term 2":  ["2024/25 Term 2", "2023/24 Term 2"],
  "Term 3A": ["2024/25 Term 3A", "2023/24 Term 3A"],
  "Term 3B": ["2024/25 Term 3B", "2023/24 Term 3B"],
};

const result = { ...existing };

for (const [code, mod] of Object.entries(modules)) {
  if (existing[code]) continue; // already has data

  const tier = getTier(code);
  const ranges = RANGES[tier];

  // Collect unique instructors → sections map
  const instrSections = {};
  for (const sec of mod.sections) {
    const prof = sec.professor.name;
    if (!instrSections[prof]) instrSections[prof] = sec.code;
    // only track first section per instructor
  }

  const instructors = Object.keys(instrSections);
  const records = [];

  for (const instr of instructors) {
    const section = instrSections[instr];

    // Use up to 2 offered terms, 2 academic years each
    const offeredTerms = mod.terms.slice(0, 2); // cap at 2 terms to avoid huge data sets

    for (const term of offeredTerms) {
      const yearLabels = termLabels[term] ?? [];
      for (const termLabel of yearLabels) {
        for (const win of [1, 2, 3]) {
          const r  = ranges[win];
          const seedKey = `${code}|${instr}|${section}|${termLabel}|${win}`;
          records.push({
            instructor: instr,
            term: termLabel,
            section,
            window: win,
            befVac: pick(r.befVac[0], r.befVac[1], seedKey, "bef"),
            aftVac: pick(r.aftVac[0], r.aftVac[1], seedKey, "aft"),
            minBid: pick(r.minBid[0], r.minBid[1], seedKey, "min"),
            medBid: pick(r.medBid[0], r.medBid[1], seedKey, "med"),
          });
        }
      }
    }
  }

  // Ensure medBid >= minBid for every record
  for (const rec of records) {
    if (rec.medBid < rec.minBid) rec.medBid = rec.minBid + Math.round(rec.minBid * 0.2) + 1;
    if (rec.aftVac >= rec.befVac) rec.aftVac = Math.max(1, rec.befVac - 5);
  }

  result[code] = { instructors, records };
}

writeFileSync(
  join(root, "public/data/bid-analytics.json"),
  JSON.stringify(result, null, 2),
  "utf8"
);
console.log(`Done. Total modules with bid data: ${Object.keys(result).length}`);
