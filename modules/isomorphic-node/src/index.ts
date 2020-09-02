import "reflect-metadata";

// TODO: eventually export a higher level class?
import { container } from "tsyringe";
import { Participant } from "@statechannels/client-api-schema";

import { INJECTION_TOKEN } from "./constants";
import { IMessageRouter } from "./types";
import { register } from "./registry";

register();

const messageRouter = container.resolve<IMessageRouter>(INJECTION_TOKEN.MESSAGE_ROUTER);

export class IsomorphicNode {
  constructor() {}
  async init() {
    await messageRouter.init();
  }

  async createChannel(receiver: Participant) {
    return messageRouter.createChannel(receiver);
  }
}
