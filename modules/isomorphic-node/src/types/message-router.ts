import {
  ChannelResult,
  Participant,
  ChannelId,
  Address,
  UpdateChannelParams,
} from "@statechannels/client-api-schema";
import { BigNumber } from "ethers";

type Completed<T> = {
  completed: () => Promise<T>;
};

export type DepositParams = {
  channelId: ChannelId;
  amount: BigNumber;
  assetId: Address;
};

export type WithdrawParams = DepositParams;

export interface IMessageRouter {
  init(): Promise<void>;
  createChannel(
    counterparty: Participant,
  ): Promise<Completed<ChannelResult> & { channelResult: ChannelResult }>;
  deposit(params: DepositParams): Promise<Completed<ChannelResult> & { txHash: string }>;
  updateChannel(params: UpdateChannelParams): Promise<{ channelResult: ChannelResult }>;
  withdraw(params: WithdrawParams): Promise<{ channelResult: ChannelResult } & { txHash: string }>;
}
