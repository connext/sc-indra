import {
  ChannelWalletInterface,
  SingleChannelResult,
  DefundChannelParams,
  MultipleChannelResult,
  GetParticipantParams,
  GetParticipantResult,
  GetVersionResult,
  GetChannelsParams,
  StateChannelsMethod,
} from "../../types";
import {
  ChannelResult,
  Bytes32,
  CreateChannelParams,
  JoinChannelParams,
  UpdateChannelParams,
  CloseChannelParams,
  ChallengeChannelParams,
  GetStateParams as GetChannelParams,
  PushMessageParams,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcErrorResponse,
} from "@statechannels/client-api-schema";
import { mockChannelResult, mockOutgoing } from "../channel";
export class MockChannelWallet implements ChannelWalletInterface {
  constructor(
    private readonly channels: Map<Bytes32, ChannelResult> = new Map(),
    private readonly stubs: Map<StateChannelsMethod, Function> = new Map()
  ) {}

  /** Test helper methods */
  public addStub(methodName: StateChannelsMethod, callback: Function) {
    this.stubs.set(methodName, callback);
  }

  public addChannel(channelId: Bytes32, channel: ChannelResult) {
    this.channels.set(channelId, channel);
  }

  /** Interface methods */
  createChannel(params: CreateChannelParams): SingleChannelResult {
    if (this.stubs.has("CreateChannel")) {
      const cb = this.stubs.get("CreateChannel");
      return cb(params);
    }
    const channel = mockChannelResult({
      ...params,
    });
    this.channels.set(channel.channelId, channel);
    const outbox = mockOutgoing({
      params: channel,
      // FIXME: allign methods with rpc intercaes
      method: "ChannelProposed",
    });
    return Promise.resolve({ channelResult: channel, outbox: [outbox] });
  }
  joinChannel(params: JoinChannelParams): SingleChannelResult {
    if (this.stubs.has("JoinChannel")) {
      const cb = this.stubs.get("JoinChannel");
      return cb(params);
    }
    const existing = this.channels.get(params.channelId);
    if (!existing) {
      throw new Error("Channel not found");
    }
    const updated = mockChannelResult({
      ...this.channels.get(params.channelId),
      status: "opening",
      turnNum: existing.turnNum + 1,
    });
    this.channels.set(params.channelId, updated);
    const outbox = mockOutgoing({
      params: updated,
      // FIXME: allign methods with rpc intercaes
      method: "ChannelUpdated",
    });
    throw new Error("Mock not implemented");
  }
  updateChannel(params: UpdateChannelParams): SingleChannelResult {
    if (this.stubs.has("UpdateChannel")) {
      const cb = this.stubs.get("UpdateChannel");
      return cb(params);
    }
    throw new Error("Mock not implemented");
  }
  closeChannel(params: CloseChannelParams): SingleChannelResult {
    if (this.stubs.has("CloseChannel")) {
      const cb = this.stubs.get("CloseChannel");
      return cb(params);
    }
    throw new Error("Mock not implemented");
  }
  defundChannel(params: DefundChannelParams): SingleChannelResult {
    if (this.stubs.has("DefundChannel")) {
      const cb = this.stubs.get("DefundChannel");
      return cb(params);
    }
    throw new Error("Mock not implemented");
  }
  challengeChannel(params: ChallengeChannelParams): SingleChannelResult {
    if (this.stubs.has("ChallengeChannel")) {
      const cb = this.stubs.get("ChallengeChannel");
      return cb(params);
    }
    throw new Error("Mock not implemented");
  }
  getChannels(params: GetChannelsParams): MultipleChannelResult {
    if (this.stubs.has("GetChannels")) {
      const cb = this.stubs.get("GetChannels");
      return cb(params);
    }
    const channelResults = [...this.channels.values()];
    return Promise.resolve({ channelResults, outbox: [] });
  }
  getChannel(params: GetChannelParams): SingleChannelResult {
    if (this.stubs.has("GetChannel")) {
      const cb = this.stubs.get("GetChannel");
      return cb(params);
    }
    const channelResult = this.channels.get(params.channelId);
    return Promise.resolve({ channelResult, outbox: [] });
  }
  getParticipant(params: GetParticipantParams): Promise<GetParticipantResult> {
    if (this.stubs.has("GetParticipant")) {
      const cb = this.stubs.get("GetParticipant");
      return cb(params);
    }
    const channel = this.channels.get(params.channelId);
    if (!channel) {
      throw new Error("Could not find channel")
    }
    return Promise.resolve({
      signingAddress: channel.participants[0].signingAddress,
      destinationAddress: channel.participants[0].destination,
      ethereumEnabled: false,
    })
  }
  getVersion(): Promise<GetVersionResult> {
    if (this.stubs.has("GetVersion")) {
      const cb = this.stubs.get("GetVersion");
      return cb();
    }
    return Promise.resolve({ walletVersion: "0.0.1" });
  }
  pushMessage(params: PushMessageParams): MultipleChannelResult {
    if (this.stubs.has("PushMessage")) {
      const cb = this.stubs.get("PushMessage");
      return cb(params);
    }
    throw new Error("Mock not implemented");
  }
  async dispatch(
    req: JsonRpcRequest
  ): Promise<JsonRpcResponse | JsonRpcErrorResponse> {
    let cb: (params: any) => Promise<object>;
    switch (req.method as StateChannelsMethod) {
      case "CreateChannel": {
        cb = this.createChannel;
        break;
      }
      case "JoinChannel": {
        cb = this.joinChannel;
        break;
      }
      case "UpdateChannel": {
        cb = this.updateChannel;
        break;
      }
      case "CloseChannel": {
        cb = this.closeChannel;
        break;
      }
      case "DefundChannel": {
        cb = this.defundChannel;
        break;
      }
      case "ChallengeChannel": {
        cb = this.challengeChannel;
        break;
      }
      case "GetChannels": {
        cb = this.getChannels;
        break;
      }
      case "GetChannel": {
        cb = this.getChannel;
        break;
      }
      case "GetParticipant": {
        cb = this.getParticipant;
        break;
      }
      case "GetVersion": {
        cb = this.getVersion;
        break;
      }
      case "PushMessage": {
        cb = this.pushMessage;
        break;
      }
      default: {
        throw new Error(`Unable to dispatch method ${req.method}`);
      }
    }

    const response = {
      id: req.id,
      jsonrpc: req.jsonrpc,
    };
    try {
      const result = await cb(req.params);
      return {
        ...response,
        result,
      };
    } catch (e) {
      return {
        ...response,
        error: e.message,
      };
    }
  }
}
