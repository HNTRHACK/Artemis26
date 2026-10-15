#!/usr/bin/env node
/**
 * Audio guide tooling — reads src/lib/audio-guides.ts (the single manifest).
 *   npm run audio:check      → which recordings exist in public/audio/<lang>/
 *   npm run audio:checklist  → regenerate docs/AUDIO_RECORDING_CHECKLIST.md
 * Requires Node 22.18+ / 23.6+ (runs the TypeScript manifest directly).
 */
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AUDIO_GUIDES, GUIDE_IDS } from "../src/lib/audio-guides.ts";

const LANGS = { en: "English", hi: "Hindi (हिन्दी)", mr: "Marathi (मराठी)" };
const root = new URL("..", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const has = (lang, file) => existsSync(join(root, "public", "audio", lang, file));

if (process.argv.includes("--checklist")) {
  const lines = [
    "# Audio recording checklist",
    "",
    "Generated from `src/lib/audio-guides.ts` by `npm run audio:checklist`. Edit the manifest, not this file.",
    "",
    "## How to deliver recordings",
    "",
    "1. Record each clip below in each language (27 clips in total). Speak slowly and warmly; 20–40 seconds each.",
    "2. Export as **MP3, mono, 64–128 kbps** (44.1 or 48 kHz). Trim silence at the start and end.",
    "3. Save with the **exact file name** shown, into `public/audio/en/`, `public/audio/hi/` or `public/audio/mr/`.",
    "4. Run `npm run audio:check` to confirm. No code changes are needed — the Listen buttons switch from",
    "   “Recorded audio coming soon” to the real player automatically.",
    "5. Commit the files. If you redeploy, the new clips are live.",
    "",
    "Until a clip exists, the app offers an optional **device voice** (clearly labelled as computer-generated) that reads the same script.",
    "",
    "## Where each clip plays",
    "",
    "| File | Screen |",
    "| --- | --- |",
    "| `welcome.mp3` | One-tap access (`/choose-role`) |",
    "| `onboarding.mp3` | Worker onboarding, step 1 |",
    "| `find-work.mp3` | Find work (`/worker/jobs`), FAQ “How do I find work?” |",
    "| `job-details.mp3` | Job detail, FAQ “How do I apply?” |",
    "| `payment-terms.mp3` | Pay box on job detail, FAQ “How do I check my wages?” |",
    "| `offer-accepted.mp3` | Offer panel (accept / decline) |",
    "| `ticket-help.mp3` | Job ticket, FAQ “What happens after I accept an offer?” |",
    "| `rights.mp3` | Rights & welfare page |",
    "| `faq-help.mp3` | FAQ page header |",
    "",
    "## Clips and scripts",
    "",
  ];
  for (const id of GUIDE_IDS) {
    const g = AUDIO_GUIDES[id];
    lines.push(`### ${g.title.en} — \`${g.file}\``, "");
    for (const [lang, name] of Object.entries(LANGS)) {
      lines.push(`- [ ] **${name}** → \`public/audio/${lang}/${g.file}\``, "", `  > ${g.script[lang]}`, "");
    }
  }
  writeFileSync(join(root, "docs", "AUDIO_RECORDING_CHECKLIST.md"), lines.join("\n"));
  console.log("Wrote docs/AUDIO_RECORDING_CHECKLIST.md");
} else {
  let found = 0;
  const total = GUIDE_IDS.length * 3;
  console.log("Audio guide status (✓ recorded, · missing)\n");
  console.log("file".padEnd(22) + Object.keys(LANGS).map((l) => l.padEnd(4)).join(""));
  for (const id of GUIDE_IDS) {
    const f = AUDIO_GUIDES[id].file;
    const row = Object.keys(LANGS).map((l) => {
      const ok = has(l, f);
      if (ok) found++;
      return (ok ? "✓" : "·").padEnd(4);
    });
    console.log(f.padEnd(22) + row.join(""));
  }
  console.log(`\n${found}/${total} recordings present.`);
}
