import "reflect-metadata";
import { container } from "tsyringe";

import { WalletService } from "./wallet-service";

const walletService = container.resolve(WalletService);
