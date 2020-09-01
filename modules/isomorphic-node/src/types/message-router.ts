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
  ): Completed<ChannelResult> & ChannelResult;
  deposit(params: DepositParams): Completed<ChannelResult> & { txHash: string };
  updateChannel(params: UpdateChannelParams): ChannelResult;
  withdraw(params: WithdrawParams): ChannelResult & { txHash: string };
}
