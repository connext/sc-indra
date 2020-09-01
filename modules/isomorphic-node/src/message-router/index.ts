import {
  Participant,
  UpdateChannelParams,
  ChannelResult,
} from "@statechannels/client-api-schema";

import { IMessageRouter, DepositParams } from "../types";
import { RpcService } from "../rpc-service";

export class MessageRouter implements IMessageRouter {
  constructor(private readonly walletRpcService: RpcService) {}
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
