import { Wallet as ChannelWallet } from "@statechannels/server-wallet";
import "reflect-metadata";
import { container } from "tsyringe";
import { Wallet, providers } from "ethers";

import { WalletRpcService } from "./rpc-service";

console.log(`Good morning!`);

const rpcService = container.resolve(WalletRpcService);

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
