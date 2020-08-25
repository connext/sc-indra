import { Module } from '@nestjs/common';

import { WalletModule } from '../wallet/wallet.module';
import { MessagingClientModule } from '../messaging-client/messagingClient.module';
import { ConfigModule } from '../config/config.module';

import { MessageRouterService } from './messageRouter.service';

@Module({
  imports: [WalletModule, MessagingClientModule, ConfigModule],
  providers: [MessageRouterService],
  exports: [MessageRouterService],
})
export class MessageRouterModule {}
