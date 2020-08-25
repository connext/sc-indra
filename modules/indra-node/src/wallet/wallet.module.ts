import { Module } from '@nestjs/common';

import { walletProvider } from './wallet.provider';

@Module({
  imports: [],
  providers: [walletProvider],
  exports: [walletProvider],
})
export class WalletModule {}
