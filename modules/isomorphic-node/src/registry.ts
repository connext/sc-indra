import { container } from "tsyringe";
import { Wallet as ChannelWallet, WalletInterface } from "@statechannels/server-wallet";
import { MessagingService } from "@connext/messaging";
import { IMessagingService } from "@connext/types";

import { IMessageRouter, IConfigService, IRpcService } from "./types";
import { INJECTION_TOKEN } from "./constants";
import { MessageRouter } from "./message-router";
import { ConfigService } from "./config";
import { WalletRpcService } from "./rpc-service";

export const register = () => {
  container.register<IMessageRouter>(INJECTION_TOKEN.MESSAGE_ROUTER, {
    useClass: MessageRouter,
  });
  container.register<IConfigService>(INJECTION_TOKEN.CONFIG_SERVICE, { useClass: ConfigService });
  container.register<IMessagingService>(INJECTION_TOKEN.MESSAGING_SERVICE, {
    useFactory: (dependencyContainer): IMessagingService => {
      const config = dependencyContainer.resolve(ConfigService);
      return new MessagingService({ messagingUrl: config.getMessagingUrl() }, "", () =>
        Promise.resolve(""),
      );
    },
  });
  container.register<IRpcService>(INJECTION_TOKEN.WALLET_RPC_SERVICE, {
    useClass: WalletRpcService,
  });

  // imports
  container.register<WalletInterface>(INJECTION_TOKEN.CHANNEL_WALLET, {
    useFactory: (dependencyContainer): WalletInterface => {
      const config = dependencyContainer.resolve(ConfigService);
      console.log("config: ", config);
      const providerUrls = config.getChainProviders();
      console.log("providerUrls: ", providerUrls);
      const chainId = Object.keys(providerUrls)[0];
      console.log("chainId: ", chainId);
      if (!chainId) {
        throw new Error(`Expected at least one provider in ${JSON.stringify(providerUrls)}`);
      }
      const pk = config.getPrivateKey();
      process.env.NODE_ENV = "development";
      // Just FYI: these SERVER_ prefix env vars config the channel wallet's database connection
      process.env.SERVER_HOST = config.getDatabaseHost();
      process.env.SERVER_PORT = config.getDatabasePort();
      process.env.SERVER_DB_NAME = config.getDatabaseName();
      process.env.SERVER_DB_USER = config.getDatabaseUser();
      process.env.SERVER_DB_PASSWORD = config.getDatabasePassword();
      process.env.SERVER_SIGNER_PRIVATE_KEY = pk;
      process.env.SERVER_PRIVATE_KEY = pk;
      process.env.RPC_ENDPOINT = providerUrls[chainId];
      process.env.CHAIN_NETWORK_ID = chainId;
      process.env.ETH_ASSET_HOLDER_ADDRESS = "";
      process.env.DEBUG_KNEX = "";
      process.env.SKIP_EVM_VALIDATION = "";
      process.env.TIMING_METRICS = "";
      // TODO: inject config into channel wallet
      return new ChannelWallet();
    },
  });
};
