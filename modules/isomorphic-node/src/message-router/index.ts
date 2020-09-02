import {
  Participant,
  UpdateChannelParams,
  ChannelResult,
} from "@statechannels/client-api-schema";
import { inject, registry } from "tsyringe";
import { IMessagingService, GenericMessage } from "@connext/types";
import { makeDestination, Destination } from "@statechannels/wallet-core";
import { constants, BigNumber } from "ethers";

import { IMessageRouter, DepositParams } from "../types";
import { WalletRpcService } from "../rpc-service";
import { INJECTION_TOKEN } from "../constants";
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

  public get destination(): Destination {
    return makeDestination(this.configService.getSignerAddress());
  }

  public get me(): Participant {
    return {
      signingAddress: this.configService.getSignerAddress(),
      destination: this.destination,
      participantId: this.configService.getPublicIdentifer(),
    };
  }

  async init(): Promise<void> {
    // channel message subscription
    await this.messagingService.subscribe(this.INBOX_SUBJECT, (msg) =>
      this.handleIncomingChannelMessage(msg)
    );
  }

  async createChannel(
    receiver: Participant
  ): Promise<{ channelResult: ChannelResult }> {
    const {
      outbox: [{ params }],
      channelResult: { channelId },
    } = await this.walletRpcService.createChannel({
      appData: "0x",
      appDefinition: constants.AddressZero,
      fundingStrategy: "Direct", // TODO
      participants: [this.me, receiver],
      allocations: [
        {
          token: constants.AddressZero,
          allocationItems: [
            {
              amount: BigNumber.from(0).toString(),
              destination: this.destination,
            },
            {
              amount: BigNumber.from(0).toString(),
              destination: receiver.destination,
            },
          ],
        },
      ],
    });
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
