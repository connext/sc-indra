import {
  WalletInterface,
  CreateChannelParams,
  UpdateChannelFundingParams,
} from "@statechannels/server-wallet";
import {
  JoinChannelParams,
  UpdateChannelParams,
  CloseChannelParams,
  GetStateParams,
  StateChannelsNotification,
  ChannelResult,
  Bytes32,
} from "@statechannels/client-api-schema";
import {
  Message,
  Participant,
  calculateChannelId,
  Objective,
} from "@statechannels/wallet-core";
import { constants } from "ethers";
import { BigNumber } from "@connext/types";
import { Outgoing } from "@statechannels/server-wallet/lib/src/protocols/actions";

import { mkAddress, mkPublicIdentifier, mkBytes32 } from "..";

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

// TODO: update this with correct interface when ready
export class MockWallet implements WalletInterface {
  getParticipant(): Promise<Participant> {
    throw new Error("Method not implemented.");
  }
  createChannel(
    args: CreateChannelParams
  ): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResult: ChannelResult;
  }> {
    const channelResult = mockChannelResult({ ...args, status: "opening" });
    return Promise.resolve({
      outbox: [{ method: "ChannelProposed", params: channelResult }],
      channelResult,
    });
  }
  joinChannel(
    args: JoinChannelParams
  ): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResult: ChannelResult;
  }> {
    throw new Error("Method not implemented.");
  }
  updateChannel(
    args: UpdateChannelParams
  ): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResult: ChannelResult;
  }> {
    throw new Error("Method not implemented.");
  }
  closeChannel(
    args: CloseChannelParams
  ): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResult: ChannelResult;
  }> {
    throw new Error("Method not implemented.");
  }
  getChannels(): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResults: ChannelResult[];
  }> {
    throw new Error("Method not implemented.");
  }
  getState(
    args: GetStateParams
  ): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResult: ChannelResult;
  }> {
    return Promise.resolve({
      channelResult: mockChannelResult({ channelId: args.channelId }),
      outbox: [],
    });
  }
  updateChannelFunding(args: UpdateChannelFundingParams): void {
    throw new Error("Method not implemented.");
  }
  pushMessage(
    m: Message
  ): Promise<{
    outbox: Pick<StateChannelsNotification, "method" | "params">[];
    channelResults: ChannelResult[];
  }> {
    const stateChannelIds =
      m.signedStates?.map((signedState) => calculateChannelId(signedState)) ??
      [];
    // TODO: generate channelIds from objectives
    const objectiveChannelIds: Bytes32[] = [];
    // TODO: why is this concat?
    const allChannelIds = stateChannelIds.concat(objectiveChannelIds);
    const outbox =
      m.objectives?.map((objective) => {
        return mockOutgoing({ method: getMethodFromObjective(objective) });
      }) ?? [];
    const channelResults = allChannelIds.map((channelId) => {
      return mockChannelResult({ channelId });
    });
    return Promise.resolve({ outbox, channelResults });
  }
  onNotification(
    cb: (notice: StateChannelsNotification) => void
  ): { unsubscribe: () => void } {
    throw new Error("Method not implemented.");
  }
}
