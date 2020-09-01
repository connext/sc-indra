import {
  ChannelResult,
  Participant,
  ChannelId,
  Address,
  UpdateChannelParams,
} from "@statechannels/client-api-schema";
import { BigNumber } from "ethers";

type Completed<T> = {
  completed(): Promise<T>;
};

export type DepositParams = {
  channelId: ChannelId;
  amount: BigNumber;
  assetId: Address;
};

export type WithdrawParams = DepositParams;

export interface IMessageRouter {
  createChannel(
    counterparty: Participant
  ): Promise<Completed<ChannelResult> & ChannelResult>;
  deposit(
    params: DepositParams
  ): Promise<Completed<ChannelResult> & { txHash: string }>;
  updateChannel(params: UpdateChannelParams): Promise<ChannelResult>;
  withdraw(params: WithdrawParams): Promise<ChannelResult & { txHash: string }>;
}
