import { registry, singleton, inject } from "tsyringe";
import { Wallet as ChannelWallet } from "@statechannels/server-wallet";
import {
  JoinChannelParams,
  UpdateChannelParams,
  CloseChannelParams,
  GetStateParams as GetChannelParams,
  CreateChannelParams,
  ChallengeChannelParams,
  PushMessageParams,
  JsonRpcErrorResponse,
  StateChannelsRequest,
  StateChannelsError,
  StateChannelsResponse,
  isJsonRpcErrorResponse,
  isJsonRpcResponse,
} from "@statechannels/client-api-schema";
import { INJECTION_TOKEN } from "../constants";
import { safeJsonStringify } from "../utils";
import {
  SingleChannelResult,
  MultipleChannelResult,
  GetParticipantResult,
  GetVersionResult,
  DefundChannelParams,
  GetParticipantParams,
  RpcServiceInterface,
  ChannelWalletInterface,
  StateChannelsMethod,
  GetChannelsParams,
} from "../types";

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
type StateChannelsResults = {
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
type StateChannelsParameters = {
  [P in keyof StateChannelsParametersMap]: StateChannelsParametersMap[P];
};

/**
 * This class handles communication between the channel wallet and the
 * application logic. It accepts javascript objects generated by the
 * application layer, and dispatches them to the channel wallet through
 * rpc requests.
 *
 * The channel wallet will return a request or an error, which will be
 * returned or thrown, respectively.
 */
@singleton()
export class RpcService implements RpcServiceInterface {
  constructor(
    @inject(INJECTION_TOKEN.CHANNEL_WALLET)
    private readonly channelWallet: ChannelWalletInterface
  ) {}

  public async createChannel(params: CreateChannelParams): SingleChannelResult {
    return this.sendRpcRequest("CreateChannel", params);
  }
  public async joinChannel(params: JoinChannelParams): SingleChannelResult {
    return this.sendRpcRequest("JoinChannel", params);
  }
  public async updateChannel(params: UpdateChannelParams): SingleChannelResult {
    return this.sendRpcRequest("UpdateChannel", params);
  }
  public async closeChannel(params: CloseChannelParams): SingleChannelResult {
    return this.sendRpcRequest("CloseChannel", params);
  }
  public async defundChannel(params: DefundChannelParams): SingleChannelResult {
    return this.sendRpcRequest("DefundChannel", params);
  }
  public async challengeChannel(
    params: ChallengeChannelParams
  ): SingleChannelResult {
    return this.sendRpcRequest("ChallengeChannel", params);
  }
  public async getChannels(params: GetChannelsParams): MultipleChannelResult {
    return this.sendRpcRequest("GetChannels", params);
  }
  public async getChannel(params: GetChannelParams): SingleChannelResult {
    return this.sendRpcRequest("GetChannel", params);
  }
  public async getParticipant(
    params: GetParticipantParams
  ): Promise<GetParticipantResult> {
    return this.sendRpcRequest("GetParticipant", params);
  }
  public async getVersion(): Promise<GetVersionResult> {
    return this.sendRpcRequest("GetVersion", {});
  }
  public async pushMessage(params: PushMessageParams): MultipleChannelResult {
    return this.sendRpcRequest("PushMessage", params);
  }

  private async sendRpcRequest<T extends StateChannelsMethod>(
    method: T,
    params: StateChannelsParameters[T]
  ): Promise<StateChannelsResults[T]> {
    // Generate + dispatch request
    const request: StateChannelsRequest = {
      id: Date.now(),
      jsonrpc: "2.0",
      method: method as any,
      params,
    };
    const response = await this.channelWallet.dispatch(request);
    if (!isJsonRpcErrorResponse(response)) {
      const error = (response as JsonRpcErrorResponse)
        .error as StateChannelsError;
      // FIXME: add more logging for specialized error context from sc
      // error type
      throw new Error(error.message);
    }

    if (isJsonRpcResponse(response)) {
      return (response as StateChannelsResponse)
        .result as StateChannelsResults[T];
    }

    throw new Error(
      `Unable to determine if this is json rpc result or error: ${safeJsonStringify(
        response
      )}`
    );
  }
}

@registry([
  {
    token: INJECTION_TOKEN.CHANNEL_WALLET,
    useFactory: (dependencyContainer) => {
      // TODO: inject config into channel wallet
      return new ChannelWallet();
    },
  },
])
export class ChannelProvider {}