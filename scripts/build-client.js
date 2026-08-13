const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..", "client");
const importClientPackage = (packageName) => import(pathToFileURL(require.resolve(packageName, { paths: [root] })).href);

const runBuild = async () => {
  const [{ build }, react] = await Promise.all([
    importClientPackage("vite"),
    importClientPackage("@vitejs/plugin-react"),
  ]);

  await build({
    root,
    configFile: false,
    plugins: [react.default()],
    server: {
      port: 5173,
    },
  });
};

runBuild().catch((error) => {
  console.error(error);
  process.exit(1);
});
