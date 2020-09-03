import pino from "pino";
import { NodeConfigOptions } from "@connext/isomorphic-node/dist/types";

export const config: NodeConfigOptions = {
  mnemonic: process.env.INDRA_MNEMONIC!,
  chainProviders: process.env.INDRA_CHAIN_PROVIDERS!,
  messagingUrl: process.env.INDRA_NATS_SERVERS!,
  databaseHost: process.env.INDRA_PG_HOST!,
  databasePort: parseInt(process.env.INDRA_PG_PORT!),
  databasePassword: process.env.INDRA_PG_PASSWORD!,
  databaseName: process.env.INDRA_PG_NAME!,
  databaseUser: process.env.INDRA_PG_USER!,
  logger: pino(),
};
