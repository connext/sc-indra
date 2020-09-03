import { Participant, UpdateChannelParams, ChannelResult } from "@statechannels/client-api-schema";
import { IMessagingService, GenericMessage } from "@connext/types";
import { makeDestination, Destination, Message } from "@statechannels/wallet-core";
import { Message as WireMessage } from "@statechannels/wire-format";
import { constants, BigNumber } from "ethers";

import { IMessageRouter, DepositParams, IWalletRpcService, IConfigService } from "../types";
import { Logger } from "pino";

// to.from.subject
const INBOX_SUBJECT = `channel-inbox`;

const MESSAGE_TIMEOUT = 10_000;

export class MessageRouter implements IMessageRouter {
  constructor(
    private readonly walletRpcService: IWalletRpcService,
    private readonly messagingService: IMessagingService,
    private readonly configService: IConfigService,
    private readonly logger: Logger,
  ) {}

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
    this.logger.debug(`init() started`);
    await this.messagingService.connect();
    this.logger.debug(`Connected messaging`);
    // channel message subscription
    const subject = `${this.configService.getPublicIdentifer()}.*.${INBOX_SUBJECT}`;
    this.logger.debug(`Subscribing to ${subject}`);
    await this.messagingService.subscribe(subject, (msg) => this.handleIncomingChannelMessage(msg));
    this.logger.debug(`Message subscription complete`);
    this.logger.debug(`init() finished`);
  }

  async createChannel(
    receiver: Participant,
  ): Promise<{
    channelResult: ChannelResult;
    completed: () => Promise<ChannelResult>;
  }> {
    this.logger.debug(`createChannel() started`, { receiver });
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

    this.logger.debug(`createChannel() finished`, { channelResult, completed: () => completed });
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
