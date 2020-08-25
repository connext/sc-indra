import { inject, singleton } from "tsyringe";
import { Wallet } from "@statechannels/server-wallet";
import { Message } from "@statechannels/wallet-core";

import { MessagingService } from "../messaging-service";

const getSubjectFromPublicId = (publicId: string, nodeId: string): string => {
  return `${nodeId}.${publicId}`;
};

@singleton()
export class MessageRouter {
  constructor(
    @inject("MESSAGING_SERVICE")
    private readonly messagingService: MessagingService,
    @inject("WALLET") private readonly wallet: Wallet
  ) {}

  async messageReceiverAndExpectReply(
    receiverId: string,
    message: Message
  ): Promise<Message> {
    const reply = await this.messagingService.request(
      getSubjectFromPublicId(receiverId, "FIXME"),
      10_000,
      message
    );
    return reply;
  }
}
