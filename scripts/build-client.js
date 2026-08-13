const path = require("path");

const root = path.resolve(__dirname, "..", "client");

const runBuild = async () => {
  const [{ build }, react] = await Promise.all([import("vite"), import("@vitejs/plugin-react")]);

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
