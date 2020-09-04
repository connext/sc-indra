import { constants, BigNumber } from 'ethers';
import { Message as WireMessage } from '@statechannels/wire-format';

import { ApplicationErrorFactory } from '../core/definitions/application-error-factory';
import { Interactor } from '../core/definitions/interactor';
import { CreateChannelInput } from './create-channel';
import { CreateChannelOutput } from './create-channel.out';
import { CreateChannelValidator } from './create-channel.validator';
import { ErrorType } from '../core/definitions/error-type';
import { IMessagingService } from '../core/definitions/messaging';
import { IWalletService } from '../core/definitions/wallet';
import { ChannelResult, Message } from '@statechannels/client-api-schema';

export class CreateChannelInteractor implements Interactor {
  constructor(
    private createChannelValidator: CreateChannelValidator,
    private errorFactory: ApplicationErrorFactory,
    private messagingService: IMessagingService,
    private walletService: IWalletService,
  ) {}

  async execute(request: CreateChannelInput): Promise<CreateChannelOutput> {
    const result = this.createChannelValidator.validate(request);

    if (!result.valid) {
      throw this.errorFactory.getError(ErrorType.validation, result.error);
    }

    try {
      const {
        outbox: [{ params }],
        channelResult: { channelId },
      } = await this.walletService.createChannel({
        appData: '0x',
        appDefinition: constants.AddressZero,
        fundingStrategy: 'Direct', // TODO
        participants: [this.walletService.getMe(), request.participant],
        allocations: [
          {
            token: constants.AddressZero,
            allocationItems: [
              {
                amount: BigNumber.from(0).toString(),
                destination: this.walletService.getMe().destination,
              },
              {
                amount: BigNumber.from(0).toString(),
                destination: request.participant.destination,
              },
            ],
          },
        ],
      });

      const { channelResult } = await this.walletService.getChannel({
        channelId,
      });

      const completed: Promise<ChannelResult> = new Promise(async (resolve) => {
        const reply = await this.messagingService.messageReceiverAndExpectReply(
          request.participant.participantId,
          (params as WireMessage) as Message, // FIXME: inconsistent with server-wallet e2e test
        );
        await this.walletService.pushMessage({
          data: reply,
          recipient: this.walletService.getMe().participantId,
          sender: request.participant.participantId,
        });

        const { channelResult } = await this.walletService.getChannel({
          channelId,
        });
        resolve(channelResult);
      });

      return {
        channelResult,
        completed: () => completed,
      };
    } catch (error) {
      throw this.errorFactory.getError(ErrorType.createChannel, error);
    }
  }
}
