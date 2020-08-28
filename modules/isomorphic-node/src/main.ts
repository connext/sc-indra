import "reflect-metadata";
import { container } from "tsyringe";

import { RpcService } from "./rpc-service";

const rpcService = container.resolve(RpcService);