import "reflect-metadata"; // TODO: move this somewhere
import { container } from "tsyringe";
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
import { describe } from "mocha";

import { IMessagingService } from "../messaging-service";
import { expect } from "../test";
import { MessageRouter } from ".";

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
    throw new Error("Method not implemented.");
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

class MockMessagingService implements IMessagingService {
  connect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  disconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  flush(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  onReceive(subject: string, callback: (msg: any) => void): Promise<void> {
    throw new Error("Method not implemented.");
  }
  publish(subject: string, data: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  request(
    subject: string,
    timeout: number,
    data: Record<string, any>,
    callback?: (response: any) => any
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }
  send(to: string, msg: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  subscribe(subject: string, callback: (msg: any) => void): Promise<void> {
    throw new Error("Method not implemented.");
  }
  unsubscribe(subject: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

describe("MessageRouter", () => {
  let messagingRouter: MessageRouter;
  beforeEach(() => {
    container.register("MESSAGING_SERVICE", { useClass: MockMessagingService });
    container.register("WALLET", { useValue: new MockWallet() });
    messagingRouter = container.resolve(MessageRouter);
  });

  afterEach(() => {
    container.reset();
  });

  it("should message receiver", async () => {
    const reply = await messagingRouter.messageReceiverAndExpectReply(
      "testing",
      {
        signedStates: [],
        objectives: [],
      }
    );
    expect(reply).to.deep.equal({});
  });
});
