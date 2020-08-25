import { Injectable, Inject } from '@nestjs/common';
import { Wallet } from '@statechannels/server-wallet';
import { Message } from '@statechannels/wallet-core';
import { ClientNats } from '@nestjs/microservices';

import { INJECTION_TOKEN } from '../constants';
import { ConfigService } from '../config/config.service';

const getMessageSubjectForPublicId = (
  publicId: string,
  nodeIdentifier: string,
): string => {
  return `${nodeIdentifier}.${publicId}`;
};

@Injectable()
export class MessageRouterService {
  constructor(
    @Inject(INJECTION_TOKEN.WALLET) private readonly wallet: Wallet,
    @Inject(INJECTION_TOKEN.MESSAGING_CLIENT)
    private readonly clientProxy: ClientNats,
    private readonly configService: ConfigService,
  ) {}

  async sendToCounterpartyAndWaitForResponse(
    receiverId: string,
    message: Message,
  ) {
    const subject = getMessageSubjectForPublicId(
      receiverId,
      this.configService.getPublicId(),
    );
    const response = this.clientProxy.send(subject, JSON.stringify(message));
    const received = await response.toPromise();
    // TODO: use a schema validator
    return JSON.parse(received);
  }

  async pushToWallet(message: Message) {
    await this.wallet.pushMessage(message);
  }
}
