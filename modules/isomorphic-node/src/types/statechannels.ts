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
  GetStateParams as GetChannelParams,
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
  walletVersion: string;
};

// TODO: Should this import from the @statechannels api as well? Must
// decide when communication at rpc layer is defined on that side
export interface IRpcService {
  createChannel(params: CreateChannelParams): SingleChannelResult;
  joinChannel(params: JoinChannelParams): SingleChannelResult;
  updateChannel(params: UpdateChannelParams): SingleChannelResult;
  closeChannel(params: CloseChannelParams): SingleChannelResult;
  defundChannel(params: DefundChannelParams): SingleChannelResult;
  challengeChannel(params: ChallengeChannelParams): SingleChannelResult;
  getChannels(params: GetChannelsParams): MultipleChannelResult;
  getChannel(params: GetStateParams): SingleChannelResult;
  getParticipant(params: GetParticipantParams): Promise<GetParticipantResult>;
  getVersion(): Promise<GetVersionResult>;
  pushMessage(params: PushMessageParams): MultipleChannelResult;
}

// TODO: How will the wallet expose rpc request dispatching?
export interface IWalletRpcService extends IRpcService {
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
  GetChannel: "GetChannel",
  GetParticipant: "GetParticipant",
  GetVersion: "GetVersion",
  PushMessage: "PushMessage",
};
export type StateChannelsMethod = keyof typeof StateChannelsMethods;

// Define all valid rpc return results
interface StateChannelsResultsMap {
  ["CreateChannel"]: SingleChannelResult;
  ["JoinChannel"]: SingleChannelResult;
  ["UpdateChannel"]: SingleChannelResult;
  ["CloseChannel"]: SingleChannelResult;
  ["DefundChannel"]: SingleChannelResult;
  ["ChallengeChannel"]: SingleChannelResult;
  ["GetChannels"]: MultipleChannelResult;
  ["GetChannel"]: SingleChannelResult;
  ["GetParticipant"]: GetParticipantResult;
  ["GetVersion"]: GetVersionResult;
  ["PushMessage"]: MultipleChannelResult;
}
export type StateChannelsResults = {
  [P in keyof StateChannelsResultsMap]: StateChannelsResultsMap[P];
};

// Define a helper type to map method names to parameters
interface StateChannelsParametersMap {
  ["CreateChannel"]: CreateChannelParams;
  ["JoinChannel"]: JoinChannelParams;
  ["UpdateChannel"]: UpdateChannelParams;
  ["CloseChannel"]: CloseChannelParams;
  ["DefundChannel"]: DefundChannelParams;
  ["ChallengeChannel"]: ChallengeChannelParams;
  ["GetChannels"]: GetChannelsParams;
  ["GetChannel"]: GetChannelParams;
  ["GetParticipant"]: GetParticipantParams;
  ["GetVersion"]: {};
  ["PushMessage"]: PushMessageParams;
}
export type StateChannelsParameters = {
  [P in keyof StateChannelsParametersMap]: StateChannelsParametersMap[P];
};
