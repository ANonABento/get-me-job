const { spawn } = require("child_process");
const { rmSync } = require("fs");

const distDir = ".next/e2e";
const port = process.env.PORT || "8888";
let child;

function run(command, args) {
  child = spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      NEXT_DIST_DIR: distDir,
    },
  });

  return new Promise((resolve, reject) => {
    child.once("exit", (code, signal) => {
      child = undefined;
      if (code === 0) {
        resolve();
        return;
      }
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
  await run("npm", ["run", "dev", "--", "-p", port]);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
