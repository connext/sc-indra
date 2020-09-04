import { Participant } from '@statechannels/client-api-schema';

import { Input } from '../core/definitions/input';

export interface CreateChannelInput extends Input {
  participant: Participant;
}
