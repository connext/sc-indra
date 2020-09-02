import { Wallet as ChannelWallet } from "@statechannels/server-wallet";
import "reflect-metadata";
import { container } from "tsyringe";
import { Wallet, providers } from "ethers";

import { WalletRpcService } from "./rpc-service";

console.log(`Good morning!`);

const rpcService = container.resolve(RpcService);

const privateKey = Wallet.fromMnemonic(process.env.INDRA_MNEMONIC!).privateKey;

(async () => {
  try {
    const providerUrls = JSON.parse(process.env.INDRA_CHAIN_PROVIDERS || "{}");
    const chainId = Object.keys(providerUrls)[0];
    if (!chainId) {
      throw new Error(
        `Expected at least one provider in ${JSON.stringify(providerUrls)}`
      );
    }
    const provider = new providers.JsonRpcProvider(providerUrls[chainId]);

    process.env.NODE_ENV = "development";
    // Just FYI: these SERVER_ prefix env vars config the channel wallet's database connection
    process.env.SERVER_HOST = "database";
    process.env.SERVER_PORT = "5432";
    process.env.SERVER_DB_NAME = "indra";
    process.env.SERVER_DB_USER = "indra";
    process.env.SERVER_DB_PASSWORD = process.env.INDRA_PG_PASSWORD;
    process.env.SERVER_SIGNER_PRIVATE_KEY = privateKey;
    process.env.SERVER_PRIVATE_KEY = privateKey;
    process.env.RPC_ENDPOINT = ""; // ?
    process.env.CHAIN_NETWORK_ID = chainId;
    process.env.ETH_ASSET_HOLDER_ADDRESS = "";
    process.env.DEBUG_KNEX = "";
    process.env.SKIP_EVM_VALIDATION = "";
    process.env.TIMING_METRICS = "";

    // ChannelWallet does its setup async in the background so we can't catch those errors..
    const wallet = new ChannelWallet();
    console.log(`Created a new wallet, nice: ${JSON.stringify(wallet)}`);

    const participants = wallet.getParticipant();
    console.log(`Wallet has participants: ${JSON.stringify(participants)}`);
  } catch (e) {
    console.log(e.stack);
    process.exit(1);
  }
})();
