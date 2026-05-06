const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const scanRoots = ["server", "database"].map((entry) => path.join(root, entry));
const ignoredDirectories = new Set(["node_modules", "dist", "build", ".git"]);

const collectJavaScriptFiles = (directory, files = []) => {
  if (!fs.existsSync(directory)) {
    return files;
  }

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        collectJavaScriptFiles(path.join(directory, entry.name), files);
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(path.join(directory, entry.name));
    }
  }

  return files;
};

const files = scanRoots.flatMap((directory) => collectJavaScriptFiles(directory));

for (const file of files) {
  execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
}

console.log(`Checked ${files.length} backend JavaScript files.`);
