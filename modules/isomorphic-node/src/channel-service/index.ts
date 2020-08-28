import { registry, singleton, inject } from "tsyringe";
import { Wallet as ChannelWallet } from "@statechannels/server-wallet";
import {
  JoinChannelParams,
  UpdateChannelParams,
  CloseChannelParams,
  GetStateParams,
  ChannelResult,
  ChannelId,
  Address,
  CreateChannelParams,
  Uint256,
  ChallengeChannelParams,
  ChannelStatus,
  PushMessageParams,
  StateChannelsNotification,
  Message,
} from "@statechannels/client-api-schema";
import {
  Participant,
  makeDestination,
  Destination,
} from "@statechannels/wallet-core";
import { Message as WireMessage } from "@statechannels/wire-format";
import { IMessagingService } from "@connext/types";
import { constants, BigNumber } from "ethers";

import { INJECTION_TOKEN } from "../constants";
import { ConfigService } from "../config";

// FIXME: should be imported from `@statechannels/server-wallet` when
// the JSON RPC API there is finalized
type Outgoing = Omit<StateChannelsNotification, "jsonrpc">;
type SingleChannelResult = Promise<{
  outbox: Outgoing[];
  channelResult: ChannelResult;
}>;
type MultipleChannelResult = Promise<{
  outbox: Outgoing[];
  channelResults: ChannelResult[];
}>;

type DefundChannelParams = {
  channelId: ChannelId;
  destination: Address;
  amount: Uint256;
};

type GetChannelsParams = Partial<
  Omit<ChannelResult, "status"> & { status: ChannelStatus[] }
>;
type GetParticipantParams = { channelId: ChannelId };

type GetParticipantResult = {
  signingAddress: Address;
  destinationAddress: Address;
  ethereumEnabled: boolean;
};
type GetVersionResult = {
  walletVersion: number;
};

// FIXME: should be imported from `@statechannels/server-wallet` when
// the JSON RPC API there is finalized
export interface ChannelWalletInterface {
  createChannel(args: CreateChannelParams): SingleChannelResult;
  joinChannel(args: JoinChannelParams): SingleChannelResult;
  updateChannel(args: UpdateChannelParams): SingleChannelResult;
  closeChannel(args: CloseChannelParams): SingleChannelResult;
  defundChannel(args: DefundChannelParams): SingleChannelResult;
  challengeChannel(args: ChallengeChannelParams): SingleChannelResult;
  getChannels(args: GetChannelsParams): MultipleChannelResult;
  getState(args: GetStateParams): SingleChannelResult;
  getParticipantInformation(
    args: GetParticipantParams
  ): Promise<GetParticipantResult>;
  getVersion(): Promise<GetVersionResult>;
  pushMessage(args: PushMessageParams): MultipleChannelResult;
  onNotification(
    cb: (notice: StateChannelsNotification) => void
  ): { unsubscribe: () => void };
}

export interface IChannelService {
  createChannel(
    receiver: Participant
  ): Promise<{
    channelResult: ChannelResult;
  }>;
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
  // Wraps rpc close + defund calls
  withdrawFromChannel(
    args: DefundChannelParams
  ): Promise<{
    channelResult: ChannelResult;
  }>;
  challengeChannel(
    args: ChallengeChannelParams
  ): Promise<{
    channelResult: ChannelResult;
  }>;
  getChannels(
    queryObject: GetChannelsParams
  ): Promise<{
    channelResults: ChannelResult[];
  }>;
  getState(
    args: GetStateParams
  ): Promise<{
    channelResult: ChannelResult;
  }>;
  getParticipant(args: GetParticipantParams): Promise<GetParticipantResult>;
  getVersion(): Promise<GetVersionResult>;
}

const getSubjectFromPublicId = (publicId: string, nodeId: string): string => {
  return `${nodeId}.${publicId}`;
};

@singleton()
export class ChannelService implements IChannelService {
  constructor(
    @inject(INJECTION_TOKEN.WALLET)
    private readonly channelWallet: ChannelWalletInterface,
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

  async createChannel(
    receiver: Participant
  ): Promise<{ channelResult: ChannelResult }> {
    const {
      outbox: [{ params }],
      channelResult: { channelId },
    } = await this.channelWallet.createChannel({
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
      (params as WireMessage) as Message // FIXME: inconsistent with server-wallet e2e test
    );
    await this.channelWallet.pushMessage(reply);

    const { channelResult } = await this.channelWallet.getState({ channelId });

    return { channelResult };
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

  defundChannel(
    args: DefundChannelParams
  ): Promise<{ channelResult: ChannelResult }> {
    throw new Error("Method not implemented.");
  }

  withdrawFromChannel(
    args: DefundChannelParams
  ): Promise<{ channelResult: ChannelResult }> {
    throw new Error("Method not implemented.");
  }

  challengeChannel(
    args: ChallengeChannelParams
  ): Promise<{ channelResult: ChannelResult }> {
    throw new Error("Method not implemented.");
  }

  getChannels(
    args: GetChannelsParams
  ): Promise<{
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

  getParticipant(args: GetParticipantParams): Promise<GetParticipantResult> {
    throw new Error("Method not implemented.");
  }
  getVersion(): Promise<GetVersionResult> {
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
      // TODO: inject config into wallet
      return new ChannelWallet();
    },
  },
])
export class ChannelProvider {}
