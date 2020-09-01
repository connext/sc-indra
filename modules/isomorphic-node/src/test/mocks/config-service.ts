import { IConfigService } from "../../types";
import { mkBytes32, mkPublicIdentifier, mkAddress } from "../utils";

export class MockConfigService implements IConfigService {
  getPrivateKey(): string {
    return mkBytes32("0xa");
  }
  getPublicIdentifer(): string {
    return mkPublicIdentifier("indrande");
  }
  getSignerAddress(): string {
    return mkAddress("0xabcde");
  }
  getMessagingUrl(): string {
    return "http://localhost:4222";
  }
}
