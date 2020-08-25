import * as natsutil from "ts-natsutil";
import { registry } from "tsyringe";

export interface MessagingConfig {
  clusterId?: string;
  messagingUrl: string | string[];
  options?: any;
  privateKey?: string;
  publicKey?: string;
  token?: string;
}

export interface IMessagingService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  flush(): Promise<void>;
  onReceive(subject: string, callback: (msg: any) => void): Promise<void>;
  publish(subject: string, data: any): Promise<void>;
  request(
    subject: string,
    timeout: number,
    data: Record<string, any>,
    callback?: (response: any) => any
  ): Promise<any>;
  send(to: string, msg: any): Promise<void>;
  subscribe(subject: string, callback: (msg: any) => void): Promise<void>;
  unsubscribe(subject: string): Promise<void>;
}

export class MessagingService implements IMessagingService {
  private service: natsutil.INatsService | undefined;
  private bearerToken: string | null;

  constructor(
    private readonly config: MessagingConfig,
    private readonly messagingServiceKey: string,
    private readonly getBearerToken: () => Promise<string>
  ) {
    this.bearerToken = null;
  }

  async connect(): Promise<void> {
    const messagingUrl = this.config.messagingUrl;
    if (!this.bearerToken) {
      this.bearerToken = await this.getBearerToken();
    }
    const service = natsutil.natsServiceFactory({
      bearerToken: this.bearerToken,
      natsServers:
        typeof messagingUrl === `string` ? [messagingUrl] : messagingUrl, // FIXME-- rename to servers instead of natsServers
    });

    const natsConnection = await service.connect();
    this.service = service;
    if (typeof natsConnection.addEventListener === "function") {
      natsConnection.addEventListener("close", async () => {
        this.bearerToken = null;
        await this.connect();
      });
    } else {
      natsConnection.on("close", async () => {
        this.bearerToken = null;
        await this.connect();
      });
    }
  }

  disconnect(): Promise<void> {
    if (this.isConnected()) {
      return this.service.disconnect();
    }
    return Promise.resolve();
  }

  ////////////////////////////////////////
  // IMessagingService Methods

  async onReceive(
    subject: string,
    callback: (msg: any) => void
  ): Promise<void> {
    await this.service.subscribe(
      this.prependKey(`${subject}.>`),
      (msg: any, err?: any): void => {
        if (err || !msg || !msg.data) {
          console.log(
            `Encountered an error while handling callback for message ${msg}: ${err}`
          );
        } else {
          const data =
            typeof msg.data === `string` ? JSON.parse(msg.data) : msg.data;
          callback(data);
        }
      }
    );
  }

  async send(to: string, msg: any): Promise<void> {
    return this.service.publish(
      this.prependKey(`${to}.${msg.from}`),
      JSON.stringify(msg)
    );
  }

  ////////////////////////////////////////
  // More generic methods

  async publish(subject: string, data: any): Promise<void> {
    this.service.publish(subject, JSON.stringify(data));
  }

  async request(
    subject: string,
    timeout: number,
    data: Record<string, any> = {}
  ): Promise<any> {
    const response = await this.service.request(
      subject,
      timeout,
      JSON.stringify(data)
    );
    return response;
  }

  async subscribe(
    subject: string,
    callback: (msg: any) => void
  ): Promise<void> {
    await this.service.subscribe(subject, (msg: any, err?: any): void => {
      if (err || !msg || !msg.data) {
        throw new Error(err || "No data received");
      } else {
        const parsedMsg = typeof msg === `string` ? JSON.parse(msg) : msg;
        const parsedData =
          typeof msg.data === `string` ? JSON.parse(msg.data) : msg.data;
        parsedMsg.data = parsedData;
        callback(parsedMsg);
      }
    });
  }

  async unsubscribe(subject: string): Promise<void> {
    const unsubscribeFrom = this.getSubjectsToUnsubscribeFrom(subject);
    unsubscribeFrom.forEach((sub) => {
      this.service.unsubscribe(sub);
    });
  }

  async flush(): Promise<void> {
    await this.service.flush();
  }

  ////////////////////////////////////////
  // Private Methods

  private prependKey(subject: string): string {
    return `${this.messagingServiceKey}.${subject}`;
  }

  private getSubjectsToUnsubscribeFrom(subject: string): string[] {
    // must account for wildcards
    const subscribedTo = this.service.getSubscribedSubjects();
    const unsubscribeFrom: string[] = [];

    // get all the substrings to match in the existing subscriptions
    // anything after `>` doesnt matter
    // `*` represents any set of characters
    // if no match for split, will return [subject]
    const substrsToMatch = subject.split(`>`)[0].split(`*`);
    subscribedTo.forEach((subscribedSubject) => {
      let subjectIncludesAllSubstrings = true;
      substrsToMatch.forEach((match) => {
        if (!subscribedSubject.includes(match) && match !== ``) {
          subjectIncludesAllSubstrings = false;
        }
      });
      if (subjectIncludesAllSubstrings) {
        unsubscribeFrom.push(subscribedSubject);
      }
    });

    return unsubscribeFrom;
  }

  private isConnected(): boolean {
    return !!this.service && this.service.isConnected();
  }
}

@registry([
  {
    token: "MESSAGING_SERVICE",
    useFactory: (dependencyContainer) => {
      return new MessagingService(
        { messagingUrl: "http://localhost:4222" },
        "",
        () => Promise.resolve("")
      );
    },
  },
])
export class MessagingServiceFactory {}
