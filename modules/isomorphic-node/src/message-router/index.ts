import { inject, singleton } from "tsyringe";
import { Message } from "@statechannels/wallet-core";
import { INJECTION_TOKEN } from "../constants";
import { IMessagingService } from "@connext/types";
import { IWalletService } from "../wallet-service";

const getSubjectFromPublicId = (publicId: string, nodeId: string): string => {
  return `${nodeId}.${publicId}`;
};

@singleton()
export class MessageRouter {
  constructor(
    @inject(INJECTION_TOKEN.MESSAGING_SERVICE)
    private readonly messagingService: IMessagingService,
    @inject("IWalletService") private readonly walletService: IWalletService
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
