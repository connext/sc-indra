import { Outgoing } from "@statechannels/server-wallet/lib/src/protocols/actions";
import { ChannelResult, StateChannelsNotification } from "@statechannels/client-api-schema";
import { mkAddress, mkPublicIdentifier, mkBytes32 } from ".";
import { constants, BigNumber } from "ethers";
import { Objective } from "@statechannels/wallet-core";
import { StateChannelsMethod, StateChannelsParameters } from "../types";

export const mockChannelResult = (
  overrides: Partial<ChannelResult> = {}
): ChannelResult => {
  return {
    allocations: [
      {
        token: constants.AddressZero,
        allocationItems: [
          {
            amount: BigNumber.from(0).toString(),
            destination: mkAddress("0xa"),
          },
          {
            amount: BigNumber.from(0).toString(),
            destination: mkAddress("0xb"),
          },
        ],
      },
    ],
    appData: "0x",
    appDefinition: constants.AddressZero,
    participants: [
      {
        destination: mkAddress("0xa"),
        participantId: mkPublicIdentifier("1"),
        signingAddress: mkAddress("0x1"),
      },
      {
        destination: mkAddress("0xb"),
        participantId: mkPublicIdentifier("1"),
        signingAddress: mkAddress("0x1"),
      },
    ],
    channelId: mkBytes32(),
    status: "proposed",
    turnNum: 0,
    challengeExpirationTime: 0,
    ...overrides,
  };
};

export function mockRpcParams<T extends StateChannelsMethod>(method: T): StateChannelsParameters[T] {
  throw new Error("Must implement mock rpc params")
}

export const mockOutgoing = (overrides: Partial<Outgoing> = {}): Outgoing => {
  return {
    method: "ChannelProposed",
    params: mockChannelResult(),
    ...overrides,
  };
};

export const getMethodFromObjective = (
  objective: Objective
): StateChannelsNotification["method"] => {
  switch (objective.type) {
    case "OpenChannel":
      return "ChannelProposed";
    case "VirtuallyFund":
      return "BudgetUpdated";
    case "FundLedger":
      return "BudgetUpdated";
    case "FundGuarantor":
      return "BudgetUpdated";
    case "CloseLedger":
      return "ChannelClosed";
  }
};