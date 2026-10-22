const http = require("http");
const app = require("./app");
const { port } = require("./config/env");

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received`);

  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10000);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", err => {
  console.error(err);
  process.exit(1);
});

process.on("unhandledRejection", err => {
  console.error(err);
  process.exit(1);
});