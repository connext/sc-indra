import "reflect-metadata";
import { container } from "tsyringe";

import { ChannelService } from "./channel-service";

const channelService = container.resolve(ChannelService);
