import { Module } from '@nestjs/common';
import { Transport, ClientProxyFactory } from '@nestjs/microservices';

import { INJECTION_TOKEN } from '../constants';

const messagingClientProvider = {
  provide: INJECTION_TOKEN.MESSAGING_CLIENT,
  useFactory: () => {
    return ClientProxyFactory.create({
      transport: Transport.NATS,
      options: {
        url: 'nats://localhost:4222',
      },
    });
  },
  inject: [], // TODO: inject config
};
@Module({
  providers: [messagingClientProvider],
  exports: [messagingClientProvider],
})
export class MessagingClientModule {}
