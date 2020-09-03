import fastify from "fastify";
import { createNode } from "@connext/isomorphic-node";

import { config } from "./config";

const server = fastify();

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.listen(8888, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Indra node listening at ${address}`);
});

const isoNode = createNode(config);
server.addHook("onReady", async function () {
  // Some async code
  await isoNode.init();
  console.log(`Initialized node`);
});
