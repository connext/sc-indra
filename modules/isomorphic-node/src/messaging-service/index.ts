import { registry } from "tsyringe";
import { MessagingService } from "@connext/messaging";
import { IMessagingService } from "@connext/types";
import { ConfigService } from "../config";
@registry([
  {
    token: "MESSAGING_SERVICE",
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
