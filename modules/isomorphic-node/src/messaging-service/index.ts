import { connect, Client } from "ts-nats";
import { IMessagingService, GenericMessage } from "@connext/types";
import { Logger } from "pino";

export class TempNatsMessagingService implements IMessagingService {
  private connection: Client;
  constructor(private readonly natsUrl: string, private readonly logger: Logger) {}

  private assertConnected(): void {
    if (!this.connection) {
      throw new Error(`No connection detected, use connect() method`);
    }
  }

  async connect(): Promise<void> {
    this.connection = await connect({ servers: [this.natsUrl] });
  }

  disconnect(): Promise<void> {
    this.assertConnected();
    return Promise.resolve(this.connection.close());
  }

  flush(): Promise<void> {
    this.assertConnected();
    return Promise.resolve(this.connection.flush());
  }

  onReceive(subject: string, callback: (msg: GenericMessage<any>) => void): Promise<void> {
    throw new Error("Not implemented");
  }

  publish(subject: string, data: any): Promise<void> {
    this.assertConnected();
    return Promise.resolve(this.connection.publish(subject, data));
  }

  async request(
    subject: string,
    timeout: number,
    data: object,
    callback?: (response: any) => any,
  ): Promise<any> {
    this.assertConnected();
    const response = await this.connection.request(subject, timeout, data);
    if (callback) {
      callback(response);
    }
    return response;
  }

  send(to: string, msg: GenericMessage<any>): Promise<void> {
    this.assertConnected();
    return Promise.resolve(this.connection.publish(to, msg));
  }

  async subscribe(subject: string, callback: (msg: GenericMessage<any>) => void): Promise<void> {
    this.assertConnected();
    await this.connection.subscribe(subject, (msg: any, err?: any): void => {
      if (err || !msg || !msg.data) {
        throw err || new Error(`Nothing received`);
      } else {
        callback(msg);
      }
    });
  }

  unsubscribe(subject: string): Promise<void> {
    this.assertConnected();
    return this.unsubscribe(subject);
  }
}
