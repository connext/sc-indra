import { registry, singleton, inject } from "tsyringe";
import { Wallet } from "@statechannels/server-wallet";
import {
  WalletInterface,
  CreateChannelParams,
  UpdateChannelFundingParams,
} from "@statechannels/server-wallet";
import {
  JoinChannelParams,
  UpdateChannelParams,
  CloseChannelParams,
  GetStateParams,
  StateChannelsNotification,
  ChannelResult,
  ChannelId,
  Address,
} from "@statechannels/client-api-schema";
import { Message, Participant } from "@statechannels/wallet-core";
import { INJECTION_TOKEN } from "../constants";

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
  createChannel(
    args: CreateChannelParams
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
  getWalletInformation(): Promise<{ channelResult: ChannelResult }>;
  pushMessage(
    m: Message
  ): Promise<{
    channelResults: ChannelResult[];
  }>;
  onNotification(
    cb: (notice: StateChannelsNotification) => void
  ): { unsubscribe: () => void };
}

// TODO: replace calls to wallet with JSON-RPC calls
@singleton()
export class WalletService implements IWalletService {
  constructor(
    @inject(INJECTION_TOKEN.WALLET) private readonly wallet: WalletInterface
  ) {}
  createChannel(
    args: CreateChannelParams
  ): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResult: ChannelResult;
  }> {
    return this.wallet.createChannel(args);
  }
  joinChannel(
    args: JoinChannelParams
  ): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResult: ChannelResult;
  }> {
    throw new Error("Method not implemented.");
  }
  updateChannel(
    args: UpdateChannelParams
  ): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResult: ChannelResult;
  }> {
    throw new Error("Method not implemented.");
  }
  closeChannel(
    args: CloseChannelParams
  ): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResult: ChannelResult;
  }> {
    throw new Error("Method not implemented.");
  }
  getChannels(): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResults: ChannelResult[];
  }> {
    throw new Error("Method not implemented.");
  }
  getState(
    args: GetStateParams
  ): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
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
  getWalletInformation(): Promise<{ channelResult: ChannelResult }> {
    throw new Error("Method not implemented.");
  }
  pushMessage(
    m: Message
  ): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResults: ChannelResult[];
  }> {
    throw new Error("Method not implemented.");
  }
  onNotification(
    cb: (notice: StateChannelsNotification) => void
  ): { unsubscribe: () => void } {
    throw new Error("Method not implemented.");
  }
}

@registry([
  {
    token: "WALLET",
    useFactory: (dependencyContainer) => {
      return new Wallet();
    },
  },
])
export class WalletProvider {}
