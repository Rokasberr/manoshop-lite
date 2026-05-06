const { execFileSync } = require("child_process");

execFileSync(process.execPath, ["scripts/lint-server.js"], { stdio: "inherit" });
console.log("No TypeScript project is configured; backend JavaScript passed syntax checks.");
