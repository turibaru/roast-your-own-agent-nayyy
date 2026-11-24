import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// This little program does one plain job and nothing clever: it takes the
// single roast line already sitting in the repository and hands an exact
// copy of it to the grading folder, so what the judge reads is exactly
// what was written here. Keeping the logic tiny means there is almost
// nothing that can quietly change the text on its way through.

const repoRoot = dirname(fileURLToPath(import.meta.url));

const outputDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outputDir) {
  console.error("Error: MAKEFUN_OUTPUT_DIR is not set");
  process.exit(1);
}

const entryPath = join(repoRoot, "entry.txt");
let raw: Buffer;
try {
  raw = readFileSync(entryPath);
} catch (err) {
  console.error(`Error: could not read entry.txt: ${(err as Error).message}`);
  process.exit(1);
}

// Reject anything that is not valid UTF-8: a bad byte must fail loudly
// instead of silently turning into a replacement character.
const text = raw.toString("utf8");
if (Buffer.from(text, "utf8").compare(raw) !== 0) {
  console.error("Error: entry.txt is not valid UTF-8");
  process.exit(1);
}

const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 200) {
  console.error(`Error: entry.txt must be 1-200 characters, got ${codePoints}`);
  process.exit(1);
}

if (text.trim().length === 0) {
  console.error("Error: entry.txt must not be only whitespace");
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), raw);
