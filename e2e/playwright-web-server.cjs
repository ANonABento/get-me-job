const { spawn } = require("child_process");
const { rmSync } = require("fs");
const path = require("path");

const distDir = ".next/e2e";
const port = process.env.PORT || "8888";
const sqlitePath =
  process.env.GET_ME_JOB_SQLITE_PATH ||
  path.join(process.cwd(), "data", "get-me-job-e2e.db");
const nextBin = require.resolve("next/dist/bin/next");
let child;

function run(command, args) {
  const spawned = spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      NEXT_DIST_DIR: distDir,
      GET_ME_JOB_SQLITE_PATH: sqlitePath,
    },
  });

  return new Promise((resolve, reject) => {
    spawned.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with ${code ?? signal}`));
    });
  });
}

function start(command, args) {
  child = spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      NEXT_DIST_DIR: distDir,
      GET_ME_JOB_SQLITE_PATH: sqlitePath,
    },
  });

  return new Promise((_, reject) => {
    child.once("exit", (code, signal) => {
      child = undefined;
      reject(new Error(`${command} ${args.join(" ")} exited with ${code ?? signal}`));
    });
  });
}

function stop() {
  if (child) {
    child.kill("SIGTERM");
  }
}

process.once("SIGINT", stop);
process.once("SIGTERM", stop);

(async () => {
  rmSync(distDir, { recursive: true, force: true });
  rmSync(sqlitePath, { force: true });
  rmSync(`${sqlitePath}-shm`, { force: true });
  rmSync(`${sqlitePath}-wal`, { force: true });
  await run("node", [nextBin, "build"]);
  await start("node", [nextBin, "start", "-p", port]);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
