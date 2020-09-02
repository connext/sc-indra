import {
  Participant,
  UpdateChannelParams,
  ChannelResult,
} from "@statechannels/client-api-schema";

import { IMessageRouter, DepositParams } from "../types";
import { WalletRpcService } from "../rpc-service";
import { inject, registry } from "tsyringe";
import { INJECTION_TOKEN } from "../constants";
import { IMessagingService, GenericMessage } from "@connext/types";
import { ConfigService } from "../config";

export class MessageRouter implements IMessageRouter {
  private INBOX_SUBJECT: string;
  constructor(
    private readonly walletRpcService: WalletRpcService,
    @inject(INJECTION_TOKEN.MESSAGING_SERVICE)
    private readonly messagingService: IMessagingService,
    private readonly configService: ConfigService
  ) {
    this.INBOX_SUBJECT = `${configService.getPublicIdentifer}.*.channel-inbox`;
  }

  async init(): Promise<void> {
    // channel message subscription
    await this.messagingService.subscribe(this.INBOX_SUBJECT, (msg) =>
      this.handleIncomingChannelMessage(msg)
    );
  }

  createChannel(
    counterparty: Participant
  ): Promise<{ completed(): Promise<ChannelResult> } & ChannelResult> {
    throw new Error("Method not implemented.");
    this.walletRpcService.createChannel({});
  }

  deposit(
    params: DepositParams
  ): Promise<{ completed(): Promise<ChannelResult> } & { txHash: string }> {
    throw new Error("Method not implemented.");
  }

  updateChannel(params: UpdateChannelParams): Promise<ChannelResult> {
    throw new Error("Method not implemented.");
  }

  withdraw(params: DepositParams): Promise<ChannelResult & { txHash: string }> {
    throw new Error("Method not implemented.");
  }

  handleIncomingChannelMessage(data: GenericMessage) {}
}

@registry([
  {
    token: INJECTION_TOKEN.CHANNEL_WALLET,
    useFactory: async (dependencyContainer) => {
      // TODO: inject config into channel wallet
      const router = new MessageRouter(
        dependencyContainer.resolve(WalletRpcService),
        dependencyContainer.resolve(INJECTION_TOKEN.MESSAGING_SERVICE),
        dependencyContainer.resolve(ConfigService)
      );
      await router.init();
      return router;
    },
  },
])
export class ChannelProvider {}
