/**
 * Enlaza .agents/skills → .cursor/skills (junctions en Windows).
 * autoskills v0.3.6 no mapea "cursor" en AGENT_FOLDER_MAP; Cursor lee .cursor/skills.
 */
import { existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const source = join(root, ".agents", "skills");
const dest = join(root, ".cursor", "skills");

if (!existsSync(source)) {
  console.error("No existe .agents/skills. Ejecuta: npm run skills:install");
  process.exit(1);
}

mkdirSync(dest, { recursive: true });

for (const name of readdirSync(source, { withFileTypes: true })) {
  if (!name.isDirectory()) continue;
  const target = join(dest, name.name);
  const srcPath = join(source, name.name);
  if (existsSync(target)) continue;

  if (process.platform === "win32") {
    execSync(`cmd /c mklink /J "${target}" "${srcPath}"`, { stdio: "inherit" });
  } else {
    execSync(`ln -s "${srcPath}" "${target}"`, { stdio: "inherit" });
  }
  console.log(`linked ${name.name}`);
}
