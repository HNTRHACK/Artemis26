import { readdir } from "node:fs/promises";
import path from "node:path";

const LANGS = ["en", "hi", "mr"];
const AUDIO_FILE = /\.(mp3|m4a|aac|ogg|opus|wav)$/i;

/**
 * Lists the recorded guidance files present in public/audio/<lang>/.
 * Evaluated per request (it reads the filesystem), so dropping in a new recording
 * needs no code change and no rebuild when running `next start`.
 */
export async function GET() {
  const base = path.join(process.cwd(), "public", "audio");
  const files: string[] = [];
  for (const lang of LANGS) {
    try {
      for (const f of await readdir(path.join(base, lang))) {
        if (AUDIO_FILE.test(f)) files.push(`/audio/${lang}/${f}`);
      }
    } catch {
      // folder missing: no recordings for this language yet
    }
  }
  return Response.json({ files });
}
