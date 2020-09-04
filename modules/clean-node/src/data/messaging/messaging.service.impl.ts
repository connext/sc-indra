import { connect, Client } from 'ts-nats';

import { IMessagingService } from '../../app/core/definitions/messaging';
import { Message } from '@statechannels/client-api-schema';

export class TempNatsMessagingService implements IMessagingService {
  private connection: Client;
  constructor() {}

  async messageReceiverAndExpectReply(publicIdentifier: string, message: Message): Promise<Message> {
    throw new Error('Method not implemented.');
  }

  private assertConnected(): void {
    if (!this.connection) {
      throw new Error(`No connection detected, use connect() method`);
    }
  }

  async connect(natsUrl: string): Promise<void> {
    this.connection = await connect({ servers: [natsUrl] });
  }

  async request(subject: string, timeout: number, data: object): Promise<any> {
    this.assertConnected();
    const response = await this.connection.request(subject, timeout, data);
    return response;
  }
}
