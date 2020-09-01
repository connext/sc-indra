import { IMessagingService } from "@connext/types";

export class MockMessagingService implements IMessagingService {
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
    // mirror the data back
    return Promise.resolve(data);
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
