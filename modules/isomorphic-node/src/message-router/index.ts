import { Participant, UpdateChannelParams, ChannelResult } from "@statechannels/client-api-schema";
import { IMessagingService, GenericMessage } from "@connext/types";
import { makeDestination, Destination, Message } from "@statechannels/wallet-core";
import { Message as WireMessage } from "@statechannels/wire-format";
import { constants, BigNumber } from "ethers";
import { inject, singleton } from "tsyringe";

import { IMessageRouter, DepositParams, IWalletRpcService, IConfigService } from "../types";
import { WalletRpcService } from "../rpc-service";
import { INJECTION_TOKEN } from "../constants";
import { ConfigService } from "../config";

// to.from.subject
const INBOX_SUBJECT = `channel-inbox`;

const MESSAGE_TIMEOUT = 10_000;

@singleton()
export class MessageRouter implements IMessageRouter {
  private INBOX_SUBJECT: string;
  constructor(
    @inject(INJECTION_TOKEN.WALLET_RPC_SERVICE)
    private readonly walletRpcService: IWalletRpcService,
    @inject(INJECTION_TOKEN.MESSAGING_SERVICE)
    private readonly messagingService: IMessagingService,
    @inject(INJECTION_TOKEN.CONFIG_SERVICE) private readonly configService: IConfigService,
  ) {
    this.INBOX_SUBJECT = `${configService.getPublicIdentifer}.*.${INBOX_SUBJECT}`;
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
    await this.messagingService.connect();
    // channel message subscription
    await this.messagingService.subscribe(this.INBOX_SUBJECT, (msg) =>
      this.handleIncomingChannelMessage(msg),
    );
  }

  async createChannel(
    receiver: Participant,
  ): Promise<{
    channelResult: ChannelResult;
    completed: () => Promise<ChannelResult>;
  }> {
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

    const { channelResult } = await this.walletRpcService.getChannel({
      channelId,
    });

    const completed: Promise<ChannelResult> = new Promise(async (resolve) => {
      const reply = await this.messageReceiverAndExpectReply(
        receiver.participantId,
        (params as WireMessage) as Message, // FIXME: inconsistent with server-wallet e2e test
      );
      await this.walletRpcService.pushMessage({
        data: reply,
        recipient: this.configService.getPublicIdentifer(),
        sender: receiver.participantId,
      });

      const { channelResult } = await this.walletRpcService.getChannel({
        channelId,
      });
      resolve(channelResult);
    });

    return {
      channelResult,
      completed: () => completed,
    };
  }

  deposit(
    params: DepositParams,
  ): Promise<{ completed(): Promise<ChannelResult> } & { txHash: string }> {
    throw new Error("Method not implemented.");
  }

  updateChannel(params: UpdateChannelParams): Promise<{ channelResult: ChannelResult }> {
    throw new Error("Method not implemented.");
  }

  withdraw(params: DepositParams): Promise<{ channelResult: ChannelResult } & { txHash: string }> {
    throw new Error("Method not implemented.");
  }

  private handleIncomingChannelMessage(data: GenericMessage) {}

  private async messageReceiverAndExpectReply(
    receiverId: string,
    message: Message,
  ): Promise<Message> {
    const reply = await this.messagingService.request(
      `${receiverId}.${this.configService.getPublicIdentifer()}.${INBOX_SUBJECT}`,
      MESSAGE_TIMEOUT,
      message,
    );
    return reply;
  }
}
