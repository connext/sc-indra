import { Wallet } from "@statechannels/server-wallet";
import "reflect-metadata";
import { container } from "tsyringe";

import { RpcService } from "./rpc-service";

const rpcService = container.resolve(RpcService);

console.log(`noice`);
