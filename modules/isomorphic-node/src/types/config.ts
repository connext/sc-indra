import { Logger } from "pino";

export interface IConfigService {
  getPrivateKey(): string;
  getPublicIdentifer(): string;
  getSignerAddress(): string;
  getMessagingUrl(): string;
}

export type NodeConfigOptions = {
  mnemonic: string;
  chainProviders: { [chainId: number]: string };
  messagingUrl: string;
  databaseHost: string;
  databasePort: number;
  databasePassword: string;
  databaseName: string;
  databaseUser: string;
  logger: Logger;
};
