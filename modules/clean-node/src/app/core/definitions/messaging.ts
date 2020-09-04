import { Message } from '@statechannels/client-api-schema';

export interface IMessagingService {
  connect(natsUrl: string): Promise<void>;
  request(subject: string, timeout: number, data: object): Promise<any>;
  messageReceiverAndExpectReply(publicIdentifier: string, message: Message): Promise<Message>;
}
