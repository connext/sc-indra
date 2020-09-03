import { Participant, ChannelResult } from "@statechannels/client-api-schema";
import pino from "pino";

import { IMessageRouter, Completed, NodeConfigOptions } from "./types";
import { ConfigService } from "./config";
import { MessageRouter } from "./message-router";
import { WalletRpcService } from "./rpc-service";
import { Wallet } from "@statechannels/server-wallet";
import { TempNatsMessagingService } from "./messaging-service";

export interface IIsomorphicNode {
  init(): Promise<void>;
  createChannel(
    receiver: Participant,
  ): Promise<
    Completed<ChannelResult> & {
      channelResult: ChannelResult;
    }
  >;
}

export const createNode = (_config: NodeConfigOptions): IIsomorphicNode => {
  const logger = _config.logger ? _config.logger : pino();
  const configService = new ConfigService(_config);

  // configure wallet vars from config
  const providerUrls = configService.getChainProviders();
  const chainId = Object.keys(providerUrls)[0];
  if (!chainId) {
    throw new Error(`Expected at least one provider in ${JSON.stringify(providerUrls)}`);
  }
  const pk = configService.getPrivateKey();
  process.env.NODE_ENV = "development";
  // Just FYI: these SERVER_ prefix env vars config the channel wallet's database connection
  process.env.SERVER_HOST = configService.getDatabaseHost();
  process.env.SERVER_PORT = configService.getDatabasePort().toString();
  process.env.SERVER_DB_NAME = configService.getDatabaseName();
  process.env.SERVER_DB_USER = configService.getDatabaseUser();
  process.env.SERVER_DB_PASSWORD = configService.getDatabasePassword();
  process.env.SERVER_SIGNER_PRIVATE_KEY = pk;
  process.env.SERVER_PRIVATE_KEY = pk;
  process.env.RPC_ENDPOINT = providerUrls[chainId];
  process.env.CHAIN_NETWORK_ID = chainId;
  process.env.ETH_ASSET_HOLDER_ADDRESS = "";
  process.env.DEBUG_KNEX = "";
  process.env.SKIP_EVM_VALIDATION = "";
  process.env.TIMING_METRICS = "";
  // TODO: inject into config
  const channelWallet = new Wallet();

  // instantiate dependency classes
  const walletRpcService = new WalletRpcService(channelWallet, logger);
  const messagingService = new TempNatsMessagingService(configService.getMessagingUrl(), logger);
  const messageRouter = new MessageRouter(
    walletRpcService,
    messagingService,
    configService,
    logger,
  );

  const isoNode = new IsomorphicNode(messageRouter);
  return isoNode;
};

class IsomorphicNode {
  constructor(private readonly messageRouter: IMessageRouter) {}
  async init() {
    await this.messageRouter.init();
  }

  async createChannel(receiver: Participant) {
    return this.messageRouter.createChannel(receiver);
  }
}
