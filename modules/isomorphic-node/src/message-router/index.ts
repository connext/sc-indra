import {
  Participant,
  UpdateChannelParams,
  ChannelResult,
} from "@statechannels/client-api-schema";

import { IMessageRouter, DepositParams } from "../types";
import { WalletRpcService } from "../rpc-service";
import { inject, registry } from "tsyringe";
import { INJECTION_TOKEN } from "../constants";
import { IMessagingService } from "@connext/types";

export class MessageRouter implements IMessageRouter {
  constructor(
    private readonly walletRpcService: WalletRpcService,
    @inject(INJECTION_TOKEN.MESSAGING_SERVICE)
    messagingService: IMessagingService
  ) {}
  async init(): Promise<void> {}
  createChannel(
    counterparty: Participant
  ): Promise<{ completed(): Promise<ChannelResult> } & ChannelResult> {
    throw new Error("Method not implemented.");
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
}

@registry([
  {
    token: INJECTION_TOKEN.CHANNEL_WALLET,
    useFactory: async (dependencyContainer) => {
      // TODO: inject config into channel wallet
      const router = new MessageRouter(
        dependencyContainer.resolve(WalletRpcService),
        dependencyContainer.resolve(INJECTION_TOKEN.MESSAGING_SERVICE)
      );
      await router.init();
      return router;
    },
  },
])
export class ChannelProvider {}
