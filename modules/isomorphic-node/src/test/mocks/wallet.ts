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
} from "@statechannels/client-api-schema";
import { Message, Participant } from "@statechannels/wallet-core";
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
    throw new Error("Method not implemented.");
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
    throw new Error("Method not implemented.");
  }
  onNotification(
    cb: (notice: StateChannelsNotification) => void
  ): { unsubscribe: () => void } {
    throw new Error("Method not implemented.");
  }
}
