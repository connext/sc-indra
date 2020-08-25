import {
  WalletInterface,
  CreateChannelParams,
  UpdateChannelFundingParams,
} from '@statechannels/server-wallet';
import {
  JoinChannelParams,
  UpdateChannelParams,
  CloseChannelParams,
  GetStateParams,
  StateChannelsNotification,
  ChannelResult,
} from '@statechannels/client-api-schema';
import { Message, Participant } from '@statechannels/wallet-core';
import { Test } from '@nestjs/testing';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { INJECTION_TOKEN } from '../constants';
import { WalletModule } from '../wallet/wallet.module';
import { MessagingClientModule } from '../messaging-client/messagingClient.module';
import { ConfigModule } from '../config/config.module';

import { MessageRouterService } from './messageRouter.service';
import { MessageRouterModule } from './messageRouter.module';

export class MockWallet implements WalletInterface {
  getParticipant(): Promise<Participant> {
    throw new Error('Method not implemented.');
  }
  createChannel(
    args: CreateChannelParams,
  ): Promise<{
    outbox: Pick<StateChannelsNotification, 'method' | 'params'>[];
    channelResult: ChannelResult;
  }> {
    throw new Error('Method not implemented.');
  }
  joinChannel(
    args: JoinChannelParams,
  ): Promise<{
    outbox: Pick<StateChannelsNotification, 'method' | 'params'>[];
    channelResult: ChannelResult;
  }> {
    throw new Error('Method not implemented.');
  }
  updateChannel(
    args: UpdateChannelParams,
  ): Promise<{
    outbox: Pick<StateChannelsNotification, 'method' | 'params'>[];
    channelResult: ChannelResult;
  }> {
    throw new Error('Method not implemented.');
  }
  closeChannel(
    args: CloseChannelParams,
  ): Promise<{
    outbox: Pick<StateChannelsNotification, 'method' | 'params'>[];
    channelResult: ChannelResult;
  }> {
    throw new Error('Method not implemented.');
  }
  getChannels(): Promise<{
    outbox: Pick<StateChannelsNotification, 'method' | 'params'>[];
    channelResults: ChannelResult[];
  }> {
    throw new Error('Method not implemented.');
  }
  getState(
    args: GetStateParams,
  ): Promise<{
    outbox: Pick<StateChannelsNotification, 'method' | 'params'>[];
    channelResult: ChannelResult;
  }> {
    throw new Error('Method not implemented.');
  }
  updateChannelFunding(args: UpdateChannelFundingParams): void {
    throw new Error('Method not implemented.');
  }
  pushMessage(
    m: Message,
  ): Promise<{
    outbox: Pick<StateChannelsNotification, 'method' | 'params'>[];
    channelResults: ChannelResult[];
  }> {
    throw new Error('Method not implemented.');
  }
  onNotification(
    cb: (notice: StateChannelsNotification) => void,
  ): { unsubscribe: () => void } {
    throw new Error('Method not implemented.');
  }
}

class MockMessagingClient extends ClientProxy {
  close() {
    throw new Error('Method not implemented.');
  }
  protected publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ): any {
    throw new Error('Method not implemented.');
  }
  protected dispatchEvent<T = any>(packet: ReadPacket<any>): Promise<T> {
    throw new Error('Method not implemented.');
  }

  async connect() {
    return true;
  }

  send<TResult = any, TInput = any>(pattern: any, data: TInput) {
    return new Observable<TResult>((subscriber) => {
      setTimeout(() => {
        subscriber.next(4 as any);
        subscriber.complete();
      }, 1000);
    });
  }
}

describe('MessageRouterService', () => {
  let messageRouterService: MessageRouterService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MessageRouterModule,
        WalletModule,
        MessagingClientModule,
        ConfigModule,
      ],
      providers: [MessageRouterService],
    })
      .overrideProvider(INJECTION_TOKEN.WALLET)
      .useValue(new MockWallet())
      .overrideProvider(INJECTION_TOKEN.MESSAGING_CLIENT)
      .useClass(MockMessagingClient)
      .compile();

    messageRouterService = moduleRef.get<MessageRouterService>(
      MessageRouterService,
    );
    console.log('messageRouterService: ', messageRouterService);
  });

  describe('sendToCounterpartyAndWaitForResponse', () => {
    it('should send a message to the counterparty and wait for a response', async () => {
      await messageRouterService.sendToCounterpartyAndWaitForResponse(
        'test-receiver',
        {
          objectives: [],
          signedStates: [],
        },
      );
    });
  });
});
