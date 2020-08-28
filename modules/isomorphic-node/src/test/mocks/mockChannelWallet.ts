import {
  ChannelWalletInterface,
  SingleChannelResult,
  DefundChannelParams,
  MultipleChannelResult,
  GetParticipantParams,
  GetParticipantResult,
  GetVersionResult,
  GetChannelsParams,
} from "../../types";
import {
  ChannelResult,
  Bytes32,
  CreateChannelParams,
  JoinChannelParams,
  UpdateChannelParams,
  CloseChannelParams,
  ChallengeChannelParams,
  GetStateParams,
  PushMessageParams,
  JsonRpcRequest,
  JsonRpcResponse,
} from "@statechannels/client-api-schema";
export class MockChannelWallet implements ChannelWalletInterface {
  constructor(
    private readonly channels: Map<Bytes32, ChannelResult> = new Map()
  ) {}

  /** Test helper methods */

  /** Interface methods */
  createChannel(params: CreateChannelParams): SingleChannelResult {
    throw new Error("Mock not implemented");
  }
  joinChannel(params: JoinChannelParams): SingleChannelResult {
    throw new Error("Mock not implemented");
  }
  updateChannel(params: UpdateChannelParams): SingleChannelResult {
    throw new Error("Mock not implemented");
  }
  closeChannel(params: CloseChannelParams): SingleChannelResult {
    throw new Error("Mock not implemented");
  }
  defundChannel(params: DefundChannelParams): SingleChannelResult {
    throw new Error("Mock not implemented");
  }
  challengeChannel(params: ChallengeChannelParams): SingleChannelResult {
    throw new Error("Mock not implemented");
  }
  getChannels(params: GetChannelsParams): MultipleChannelResult {
    throw new Error("Mock not implemented");
  }
  getState(params: GetStateParams): SingleChannelResult {
    throw new Error("Mock not implemented");
  }
  getParticipant(params: GetParticipantParams): Promise<GetParticipantResult> {
    throw new Error("Mock not implemented");
  }
  getVersion(): Promise<GetVersionResult> {
    throw new Error("Mock not implemented");
  }
  pushMessage(params: PushMessageParams): MultipleChannelResult {
    throw new Error("Mock not implemented");
  }
  dispatch(req: JsonRpcRequest): Promise<JsonRpcResponse> {
    throw new Error("Mock not implemented");
  }
}
