import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "content/reports");
const DEST = path.join(ROOT, "public/raw-reports");

if (fs.existsSync(SRC)) {
  fs.mkdirSync(path.dirname(DEST), { recursive: true });
  fs.rmSync(DEST, { recursive: true, force: true });
  fs.cpSync(SRC, DEST, { recursive: true });
  console.log("Synced content/reports -> public/raw-reports");
} else {
  fs.rmSync(DEST, { recursive: true, force: true });
  console.log("No content/reports yet, skipped sync");
}
