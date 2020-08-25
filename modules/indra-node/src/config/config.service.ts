import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    this.envConfig = process.env;
  }

  get(key: string): string {
    return this.envConfig[key];
  }

  getPublicId(): string {
    return 'test-identifier';
  }
}
