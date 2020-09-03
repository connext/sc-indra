import { config } from "dotenv";
import { Wallet } from "ethers";
import { getPublicKeyFromPrivateKey, getPublicIdentifierFromPublicKey } from "@connext/utils";

import { IConfigService, NodeConfigOptions } from "../types";

const throwEnvError = (name: string) => {
  throw new Error(`No env var ${name} provided`);
};

export class ConfigService implements IConfigService {
  constructor(private readonly opts?: NodeConfigOptions) {
    config();
  }

  getMnemonic(): string {
    return this.opts.mnemonic || this.getOrThrow("INDRA_MNEMONIC");
  }

  getPrivateKey(): string {
    return Wallet.fromMnemonic(this.getMnemonic()).privateKey;
  }

  getChainProviders(): { [chainId: string]: string } {
    return this.opts.chainProviders || JSON.parse(this.getOrThrow("INDRA_CHAIN_PROVIDERS"));
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
    return this.opts.messagingUrl || this.getOrThrow("INDRA_NATS_SERVERS");
  }

  getDatabaseHost(): string {
    return this.opts.databaseHost || this.getOrThrow("INDRA_PG_HOST");
  }

  getDatabasePort(): number {
    return this.opts.databasePort || parseInt(this.getOrThrow("INDRA_PG_PORT"));
  }

  getDatabasePassword(): string {
    return this.opts.databasePassword || this.getOrThrow("INDRA_PG_PASSWORD");
  }

  getDatabaseName(): string {
    return this.opts.databaseName || this.getOrThrow("INDRA_PG_DATABASE");
  }

  getDatabaseUser(): string {
    return this.opts.databaseUser || this.getOrThrow("INDRA_PG_USERNAME");
  }

  private get(key: string): string | undefined {
    return process.env[key];
  }

  private getOrThrow(key: string): string {
    const res = this.get(key);
    if (!res) {
      throwEnvError(key);
    }
    return res!;
  }
}
