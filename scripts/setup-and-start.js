const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";

const npmCommand = (args) => {
  if (isWindows) {
    return {
      command: process.env.ComSpec || "cmd.exe",
      args: ["/d", "/s", "/c", "npm.cmd", ...args],
    };
  }

  return {
    command: "npm",
    args,
  };
};

const runNpm = (label, args) =>
  new Promise((resolve, reject) => {
    const commandConfig = npmCommand(args);
    console.log(`\n[setup] ${label}`);

    const child = spawn(commandConfig.command, commandConfig.args, {
      cwd: root,
      stdio: "inherit",
      shell: false,
      env: process.env,
    });

    const stopChild = () => {
      if (child.pid) {
        child.kill("SIGINT");
      }
    };

    process.once("SIGINT", stopChild);
    process.once("SIGTERM", stopChild);

    child.on("exit", (code) => {
      process.removeListener("SIGINT", stopChild);
      process.removeListener("SIGTERM", stopChild);

      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${label} failed with exit code ${code || 1}`));
    });

    child.on("error", (error) => {
      process.removeListener("SIGINT", stopChild);
      process.removeListener("SIGTERM", stopChild);
      reject(error);
    });
  });

const main = async () => {
  try {
    await runNpm("Installing root, client, and server dependencies", ["install"]);
    await runNpm("Starting client and server", ["run", "dev"]);
  } catch (error) {
    console.error(`\n[setup] ${error.message}`);
    process.exit(1);
  }
};

main();
