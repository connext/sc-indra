import { singleton } from "tsyringe";
import { config } from "dotenv";
import {
  getPublicKeyFromPrivateKey,
  getPublicIdentifierFromPublicKey,
} from "@connext/utils";
import { Wallet } from "ethers";

const throwEnvError = (name: string) => {
  throw new Error(`No env var ${name} provided`);
};

@singleton()
export class ConfigService {
  constructor() {
    config();
  }
  get(key: string): string | undefined {
    return process.env[key];
  }

  getOrThrow(key: string): string {
    const res = this.get(key);
    if (!key) {
      throwEnvError(key);
    }
    return res;
  }

  getPrivateKey(): string {
    return this.getOrThrow("INDRA_PRIVATE_KEY");
  }

  getPublicIdentifer(): string {
    const pk = this.getPrivateKey();
    return getPublicIdentifierFromPublicKey(getPublicKeyFromPrivateKey(pk));
  }

  getSignerAddress(): string {
    const pk = this.getPrivateKey();
    return new Wallet(pk).address;
  }

  getMessagingUrl(): string {
    return this.getOrThrow("INDRA_MESSAGING_URL");
  }
}
