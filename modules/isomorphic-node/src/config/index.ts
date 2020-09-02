import { singleton } from "tsyringe";
import { config } from "dotenv";
import { Wallet } from "ethers";
import {
  getPublicKeyFromPrivateKey,
  getPublicIdentifierFromPublicKey,
} from "@connext/utils";

import { IConfigService } from "../types";
import { Participant, makeDestination } from "@statechannels/wallet-core";

const throwEnvError = (name: string) => {
  throw new Error(`No env var ${name} provided`);
};

@singleton()
export class ConfigService implements IConfigService {
  constructor() {
    config();
  }

  getMyParticipant(): Participant {
    const signingAddress = this.getSignerAddress();
    return {
      participantId: this.getPublicIdentifer(),
      destination: makeDestination(signingAddress),
      signingAddress,
    };
  }

  getMnemonic(): string {
    return this.getOrThrow("INDRA_MNEMONIC");
  }

  getPrivateKey(): string {
    return Wallet.fromMnemonic(this.getMnemonic()).privateKey;
  }

  getChainProviders(): { [chainId: string]: string } {
    return JSON.parse(this.getOrThrow("INDRA_CHAIN_PROVIDERS"));
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

  getDatabaseHost(): string {
    return this.getOrThrow("INDRA_PG_HOST");
  }

  getDatabasePort(): string {
    return this.getOrThrow("INDRA_PG_PORT");
  }

  getDatabasePassword(): string {
    return this.getOrThrow("INDRA_PG_PASSWORD");
  }

  private get(key: string): string | undefined {
    return process.env[key];
  }

  private getOrThrow(key: string): string {
    const res = this.get(key);
    if (!key) {
      throwEnvError(key);
    }
    return res!;
  }
}
