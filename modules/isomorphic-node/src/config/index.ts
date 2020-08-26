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

export interface IConfigService {
  getPrivateKey(): string;
  getPublicIdentifer(): string;
  getSignerAddress(): string;
  getMessagingUrl(): string;
}

@singleton()
export class ConfigService implements IConfigService {
  constructor() {
    config();
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

  private get(key: string): string | undefined {
    return process.env[key];
  }

  private getOrThrow(key: string): string {
    const res = this.get(key);
    if (!key) {
      throwEnvError(key);
    }
    return res;
  }
}
