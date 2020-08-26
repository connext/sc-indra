import { registry, singleton, inject } from "tsyringe";
import { Wallet } from "@statechannels/server-wallet";
import { WalletInterface } from "@statechannels/server-wallet";
import {
  JoinChannelParams,
  UpdateChannelParams,
  CloseChannelParams,
  GetStateParams,
  ChannelResult,
  ChannelId,
  Address,
} from "@statechannels/client-api-schema";
import {
  Message,
  Participant,
  makeDestination,
  Destination,
} from "@statechannels/wallet-core";
import { Message as WireMessage } from "@statechannels/wire-format";
import { IMessagingService } from "@connext/types";
import { constants, BigNumber } from "ethers";

import { INJECTION_TOKEN } from "../constants";
import { ConfigService } from "../config";

type DefundChannelParams = {
  channelId: ChannelId;
};
type WithdrawParams = {
  channelId: ChannelId;
  destination: Address;
};
type ChallengeChannelParams = {
  channelId: ChannelId;
};
type GetWalletInformationResult = {
  signingAddress: Address;
  destinationAddress: Address;
  walletVersion: string;
};

export interface IWalletService {
  createChannel(receiver: Participant): Promise<ChannelResult>;
  joinChannel(
    args: JoinChannelParams
  ): Promise<{
    channelResult: ChannelResult;
  }>;
  updateChannel(
    args: UpdateChannelParams
  ): Promise<{
    channelResult: ChannelResult;
  }>;
  closeChannel(
    args: CloseChannelParams
  ): Promise<{
    channelResult: ChannelResult;
  }>;
  defundChannel(
    args: DefundChannelParams
  ): Promise<{
    channelResult: ChannelResult;
  }>;
  withdraw(
    args: WithdrawParams
  ): Promise<{
    channelResult: ChannelResult;
  }>;
  challengeChannel(
    args: ChallengeChannelParams
  ): Promise<{
    channelResult: ChannelResult;
  }>;
  getChannels(): Promise<{
    channelResults: ChannelResult[];
  }>;
  getState(
    args: GetStateParams
  ): Promise<{
    channelResult: ChannelResult;
  }>;
  getWalletInformation(): Promise<GetWalletInformationResult>;
}

const getSubjectFromPublicId = (publicId: string, nodeId: string): string => {
  return `${nodeId}.${publicId}`;
};

// TODO: replace calls to wallet with JSON-RPC calls
@singleton()
export class WalletService implements IWalletService {
  constructor(
    @inject(INJECTION_TOKEN.WALLET) private readonly wallet: WalletInterface,
    @inject(INJECTION_TOKEN.MESSAGING_SERVICE)
    private readonly messagingService: IMessagingService,
    private readonly configService: ConfigService
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

  async createChannel(receiver: Participant): Promise<ChannelResult> {
    const {
      outbox: [{ params }],
      channelResult: { channelId },
    } = await this.wallet.createChannel({
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

    const reply = await this.messageReceiverAndExpectReply(
      receiver.participantId,
      ((params as WireMessage).data as unknown) as Message // fix types
    );
    await this.wallet.pushMessage(reply);

    const { channelResult } = await this.wallet.getState({ channelId });

    return channelResult;
  }

  joinChannel(
    args: JoinChannelParams
  ): Promise<{
    channelResult: ChannelResult;
  }> {
    throw new Error("Method not implemented.");
  }
  updateChannel(
    args: UpdateChannelParams
  ): Promise<{
    channelResult: ChannelResult;
  }> {
    throw new Error("Method not implemented.");
  }
  closeChannel(
    args: CloseChannelParams
  ): Promise<{
    channelResult: ChannelResult;
  }> {
    throw new Error("Method not implemented.");
  }
  getChannels(): Promise<{
    channelResults: ChannelResult[];
  }> {
    throw new Error("Method not implemented.");
  }
  getState(
    args: GetStateParams
  ): Promise<{
    channelResult: ChannelResult;
  }> {
    throw new Error("Method not implemented.");
  }
  defundChannel(
    args: DefundChannelParams
  ): Promise<{ channelResult: ChannelResult }> {
    throw new Error("Method not implemented.");
  }
  withdraw(args: WithdrawParams): Promise<{ channelResult: ChannelResult }> {
    throw new Error("Method not implemented.");
  }
  challengeChannel(
    args: ChallengeChannelParams
  ): Promise<{ channelResult: ChannelResult }> {
    throw new Error("Method not implemented.");
  }
  getWalletInformation(): Promise<GetWalletInformationResult> {
    throw new Error("Method not implemented.");
  }

  private async messageReceiverAndExpectReply(
    receiverId: string,
    message: Message
  ): Promise<Message> {
    const reply = await this.messagingService.request(
      getSubjectFromPublicId(receiverId, "FIXME"),
      10_000,
      message
    );
    return reply;
  }
}

@registry([
  {
    token: INJECTION_TOKEN.WALLET,
    useFactory: (dependencyContainer) => {
      return new Wallet();
    },
  },
])
export class WalletProvider {}
