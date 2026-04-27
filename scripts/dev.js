const { spawn } = require("node:child_process");

const root = process.cwd();
const isWindows = process.platform === "win32";

const createCommand = (args) => {
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

const processes = [
  {
    name: "server",
    args: ["--workspace", "server", "run", "dev"],
  },
  {
    name: "client",
    args: ["--workspace", "client", "run", "dev"],
  },
];

let shuttingDown = false;

const children = processes.map(({ name, args }) => {
  const commandConfig = createCommand(args);

  const child = spawn(commandConfig.command, commandConfig.args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  child.on("exit", (code) => {
    if (shuttingDown) {
      return;
    }

    if (code !== 0) {
      shuttingDown = true;
      console.error(`[${name}] procesas baigėsi su klaida: ${code}`);

      children.forEach((runningChild) => {
        if (runningChild.pid && runningChild !== child) {
          runningChild.kill();
        }
      });

      process.exit(code || 1);
    }
  });

  child.on("error", (error) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.error(`[${name}] nepavyko paleisti: ${error.message}`);
    process.exit(1);
  });

  return child;
});

const stopChildren = () => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  children.forEach((child) => {
    if (child.pid) {
      child.kill("SIGINT");
    }
  });
};

process.on("SIGINT", stopChildren);
process.on("SIGTERM", stopChildren);
