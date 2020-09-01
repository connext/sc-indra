import { container } from "tsyringe";

import { RpcService } from ".";
import { INJECTION_TOKEN } from "../constants";
import { MockChannelWallet } from "../test/mocks/mockChannelWallet";
import {
  StateChannelsMethods,
  StateChannelsMethod,
  StateChannelsResults,
  StateChannelsParameters,
} from "../types";
import { mockRpcParams } from "../test/channel";

// Unit test helper function
function verifyServiceResponse<P extends StateChannelsMethod>(
  response: StateChannelsResults[P],
  method: P,
  params: StateChannelsParameters[P]
): void {
  throw new Error("Method not implemented")
};

describe("RpcService", () => {
  let rpcService: RpcService;

  beforeEach(() => {
    container.register(INJECTION_TOKEN.CHANNEL_WALLET, {
      useValue: new MockChannelWallet(),
    });
    rpcService = container.resolve(RpcService);
  });

  afterEach(() => {
    container.reset();
  });

  for (const nonCamelCased of Object.keys(StateChannelsMethods)) {
    it(`should correctly call the ${nonCamelCased} method`, async () => {
      const serviceMethod =
        nonCamelCased.substr(0, 1).toLowerCase() + nonCamelCased.substr(1);
      const params = mockRpcParams(nonCamelCased as StateChannelsMethod);
      const response = await rpcService[serviceMethod](params);
      verifyServiceResponse(response, nonCamelCased as StateChannelsMethod, params);
    });
  }
});
