import { container } from "tsyringe";

import { WalletRpcService } from ".";
import { INJECTION_TOKEN } from "../constants";
import { StateChannelsMethods, StateChannelsMethod } from "../types";
import { MockChannelWallet } from "../test/mocks/mockChannelWallet";
import { mockRpcParams, expect } from "../test";

describe("RpcService", () => {
  let rpcService: WalletRpcService;
  let mockedWallet = new MockChannelWallet();

  beforeEach(() => {
    container.register(INJECTION_TOKEN.CHANNEL_WALLET, {
      useValue: mockedWallet,
    });
    rpcService = container.resolve(WalletRpcService);
  });

  afterEach(() => {
    container.reset();
  });

  for (const nonCamelCased of Object.keys(StateChannelsMethods)) {
    const serviceMethod =
      nonCamelCased.substr(0, 1).toLowerCase() + nonCamelCased.substr(1);
    const params = mockRpcParams(nonCamelCased as StateChannelsMethod);

    it(`should correctly call the ${nonCamelCased} method`, async () => {
      mockedWallet.addStub(
        nonCamelCased as StateChannelsMethod,
        (params) => params
      );
      const response = await rpcService[serviceMethod](params);
      expect(response).to.be.deep.eq(params);
    });

    it(`should correctly throw from the ${nonCamelCased} method`, async () => {
      mockedWallet.addStub(nonCamelCased as StateChannelsMethod, (params) =>
        Promise.reject(`Fail`)
      );
      await expect(rpcService[serviceMethod](params)).should.be.rejectedWith(
        `Fail`
      );
    });
  }
});
