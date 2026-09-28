import app from "./app.js";

const port = Number(process.env.PORT || 4000);
const server = app.listen(port, () => {
  console.log(`RESET API ready at http://localhost:${port}`);
});

const close = () => server.close(() => process.exit(0));
process.on("SIGINT", close);
process.on("SIGTERM", close);
