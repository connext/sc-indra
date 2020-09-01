import { registry } from "tsyringe";
import { MessagingService } from "@connext/messaging";
import { IMessagingService } from "@connext/types";

import { ConfigService } from "../config";
import { INJECTION_TOKEN } from "../constants";

@registry([
  {
    token: INJECTION_TOKEN.MESSAGING_SERVICE,
    useFactory: (dependencyContainer): IMessagingService => {
      const config = dependencyContainer.resolve(ConfigService);
      return new MessagingService(
        { messagingUrl: config.getMessagingUrl() },
        "",
        () => Promise.resolve("")
      );
    },
  },
])
export class MessagingServiceFactory {}
