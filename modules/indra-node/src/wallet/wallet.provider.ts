import { Wallet } from '@statechannels/server-wallet';

import { INJECTION_TOKEN } from '../constants';

export const walletProvider = {
  provide: INJECTION_TOKEN.WALLET,
  useFactory: () => {
    return new Wallet();
  },
  inject: [], // TODO: inject config
};
