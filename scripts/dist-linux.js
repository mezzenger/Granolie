const { spawn } = require("node:child_process");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
      shell: false,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function main() {
  await run("npx", ["electron-builder", "--linux", "AppImage"]);
  await run("node", ["scripts/build-deb.js"]);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
