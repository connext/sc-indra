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
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcErrorResponse,
} from "@statechannels/client-api-schema";


// FIXME: should be imported from `@statechannels/server-wallet` when
// the JSON RPC API there is finalized (pushMessage return ret)
export type Outgoing = Omit<StateChannelsNotification, "jsonrpc">;
export type SingleChannelResult = Promise<{
  outbox: Outgoing[];
  channelResult: ChannelResult;
}>;
export type MultipleChannelResult = Promise<{
  outbox: Outgoing[];
  channelResults: ChannelResult[];
}>;

export type DefundChannelParams = {
  channelId: ChannelId;
  destination: Address;
  amount: Uint256;
};

export type GetChannelsParams = Partial<
  Omit<ChannelResult, "status"> & { status: ChannelStatus[] }
>;
export type GetParticipantParams = { channelId: ChannelId };

export type GetParticipantResult = {
  signingAddress: Address;
  destinationAddress: Address;
  ethereumEnabled: boolean;
};
export type GetVersionResult = {
  walletVersion: number;
};

// TODO: Should this import from the @statechannels api as well? Must
// decide when communication at rpc layer is defined on that side
export interface RpcServiceInterface {
  createChannel(params: CreateChannelParams): SingleChannelResult;
  joinChannel(params: JoinChannelParams): SingleChannelResult;
  updateChannel(params: UpdateChannelParams): SingleChannelResult;
  closeChannel(params: CloseChannelParams): SingleChannelResult;
  defundChannel(params: DefundChannelParams): SingleChannelResult;
  challengeChannel(params: ChallengeChannelParams): SingleChannelResult;
  getChannels(params: GetChannelsParams): MultipleChannelResult;
  getState(params: GetStateParams): SingleChannelResult;
  getParticipant(params: GetParticipantParams): Promise<GetParticipantResult>;
  getVersion(): Promise<GetVersionResult>;
  pushMessage(params: PushMessageParams): MultipleChannelResult;
}

// TODO: How will the wallet expose rpc request dispatching?
export interface ChannelWalletInterface extends RpcServiceInterface {
  dispatch(
    request: JsonRpcRequest
  ): Promise<JsonRpcResponse | JsonRpcErrorResponse>;
}

// FIXME: This should be defined within client-api-schema
// define all valid rpc method names
export const StateChannelsMethods = {
  CreateChannel: "CreateChannel",
  JoinChannel: "JoinChannel",
  UpdateChannel: "UpdateChannel",
  CloseChannel: "CloseChannel",
  DefundChannel: "DefundChannel",
  ChallengeChannel: "ChallengeChannel",
  GetChannels: "GetChannels",
  GetState: "GetState",
  GetParticipant: "GetParticipant",
  GetVersion: "GetVersion",
  PushMessage: "PushMessage",
};
export type StateChannelsMethod = keyof typeof StateChannelsMethods;