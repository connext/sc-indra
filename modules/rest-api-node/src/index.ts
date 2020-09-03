import fastify from "fastify";
import { IsomorphicNode } from "@connext/isomorphic-node";

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

const isoNode = new IsomorphicNode();

server.addHook("onReady", async function () {
  // Some async code
  await isoNode.init();
});
