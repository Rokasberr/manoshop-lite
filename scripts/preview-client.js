const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..", "client");
const importClientPackage = (packageName) => import(pathToFileURL(require.resolve(packageName, { paths: [root] })).href);

const getArgValue = (name, fallback) => {
  const inlinePrefix = `--${name}=`;
  const inlineMatch = process.argv.find((argument) => argument.startsWith(inlinePrefix));

  if (inlineMatch) {
    return inlineMatch.slice(inlinePrefix.length);
  }

  const argumentIndex = process.argv.indexOf(`--${name}`);

  if (argumentIndex >= 0 && process.argv[argumentIndex + 1]) {
    return process.argv[argumentIndex + 1];
  }

  return fallback;
};

const runPreview = async () => {
  const [{ preview }, react] = await Promise.all([
    importClientPackage("vite"),
    importClientPackage("@vitejs/plugin-react"),
  ]);
  const host = getArgValue("host", "127.0.0.1");
  const port = Number(getArgValue("port", "4173"));

  await preview({
    root,
    configFile: false,
    plugins: [react.default()],
    preview: {
      host,
      port: Number.isFinite(port) ? port : 4173,
    },
  });
};

runPreview().catch((error) => {
  console.error(error);
  process.exit(1);
});
