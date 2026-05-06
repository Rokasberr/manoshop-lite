const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const testsDirectory = path.join(__dirname, "..", "server", "tests");
const testFiles = fs
  .readdirSync(testsDirectory)
  .filter((entry) => entry.endsWith(".test.js"))
  .map((entry) => path.join(testsDirectory, entry));

const result = spawnSync(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit",
});

process.exit(result.status || 0);
