import {
  CreateChannelParams,
  JoinChannelParams,
  UpdateChannelParams,
  CloseChannelParams,
  ChallengeChannelParams,
  GetChannelsParams,
  GetStateParams,
  PushMessageParams,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcErrorResponse,
  StateChannelsNotification,
  ChannelResult,
  ChannelId,
  Address,
  Uint256,
  ChannelStatus,
  Participant,
} from '@statechannels/client-api-schema';

export type Outgoing = Omit<StateChannelsNotification, 'jsonrpc'>;

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

export type GetParticipantParams = { channelId: ChannelId };

export type GetParticipantResult = {
  signingAddress: Address;
  destinationAddress: Address;
  ethereumEnabled: boolean;
};
export type GetVersionResult = {
  walletVersion: string;
};

export interface IWalletService {
  getMe(): Participant;
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
