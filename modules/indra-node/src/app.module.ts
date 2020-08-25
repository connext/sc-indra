import { Module } from '@nestjs/common';

import { WalletModule } from './wallet/wallet.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageRouterModule } from './message-router/messageRouter.module';
import { MessagingClientModule } from './messaging-client/messagingClient.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    WalletModule,
    MessageRouterModule,
    MessagingClientModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
