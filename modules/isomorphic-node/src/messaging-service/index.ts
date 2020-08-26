import { registry } from "tsyringe";
import { MessagingService } from "@connext/messaging";
import { IMessagingService } from "@connext/types";
@registry([
  {
    token: "MESSAGING_SERVICE",
    useFactory: (dependencyContainer): IMessagingService => {
      return new MessagingService(
        { messagingUrl: "http://localhost:4222" },
        "",
        () => Promise.resolve("")
      );
    },
  },
])
export class MessagingServiceFactory {}
