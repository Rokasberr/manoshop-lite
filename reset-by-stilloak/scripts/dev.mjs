import { spawn } from "node:child_process";

const command = process.platform === "win32" ? "npm.cmd" : "npm";
const processes = [
  spawn(command, ["run", "dev:api"], { stdio: "inherit", env: process.env }),
  spawn(command, ["run", "dev:web"], { stdio: "inherit", env: process.env })
];

let closing = false;
const close = (code = 0) => {
  if (closing) return;
  closing = true;
  processes.forEach((child) => child.kill("SIGTERM"));
  process.exit(code);
};

processes.forEach((child) => child.on("exit", (code) => {
  if (!closing && code) close(code);
}));
process.on("SIGINT", () => close(0));
process.on("SIGTERM", () => close(0));
