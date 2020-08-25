import { registry } from "tsyringe";
import { Wallet } from "@statechannels/server-wallet";

@registry([
  {
    token: "WALLET",
    useFactory: (dependencyContainer) => {
      return new Wallet();
    },
  },
])
export class WalletProvider {}
