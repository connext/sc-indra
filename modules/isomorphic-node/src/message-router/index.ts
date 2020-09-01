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
  ): {
    completed(): Promise<ChannelResult>;
  } & ChannelResult {
    throw new Error("Method not implemented.");
  }
  deposit(
    params: DepositParams
  ): {
    completed(): Promise<ChannelResult>;
  } & { txHash: string } {
    throw new Error("Method not implemented.");
  }
  updateChannel(params: UpdateChannelParams): ChannelResult {
    throw new Error("Method not implemented.");
  }
  withdraw(
    params: DepositParams
  ): ChannelResult & {
    txHash: string;
  } {
    throw new Error("Method not implemented.");
  }
}
