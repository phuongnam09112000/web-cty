import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { captureAll, waitForUrl } from "./capture.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const srcDir = `${root}.baseline-src`;
const outDir = `${root}.baseline`;
const port = 3101;

const commit = process.argv[2];
if (!commit) {
  console.error("Cách dùng: node scripts/baseline.mjs <commit>");
  process.exit(1);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} lỗi`);
}

if (!existsSync(srcDir)) {
  run("git", ["worktree", "add", "--detach", srcDir, commit], root);
} else {
  run("git", ["checkout", "--detach", commit], srcDir);
}
run("npm", ["ci"], srcDir);

const server = spawn("npx", ["react-scripts", "start"], {
  cwd: srcDir,
  env: { ...process.env, BROWSER: "none", PORT: String(port) },
  stdio: "ignore",
  detached: true,
});
const stop = () => {
  try {
    process.kill(-server.pid);
  } catch {
    /* already stopped */
  }
};
process.on("exit", stop);

try {
  await waitForUrl(`http://localhost:${port}/`);
  await rm(outDir, { recursive: true, force: true });
  const files = await captureAll({ baseUrl: `http://localhost:${port}`, outDir });
  console.log(`Đã chụp ${files.length} ảnh gốc vào ${outDir}`);
} finally {
  stop();
}
