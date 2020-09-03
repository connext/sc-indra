export interface IConfigService {
  getPrivateKey(): string;
  getPublicIdentifer(): string;
  getSignerAddress(): string;
  getMessagingUrl(): string;
}
