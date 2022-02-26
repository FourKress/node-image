import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PuppeteerService } from './puppeteer.service';

@Injectable()
export class ImageService {
  private cryptoKeys: Map<any, any>;
  constructor(private readonly pupService: PuppeteerService) {
    this.cryptoKeys = new Map();
  }

  async createPicture(params, type = '') {
    const key = await this.setKey(params);
    Logger.log(JSON.stringify('-------------生成数据加密秘钥-------------'));
    Logger.log(JSON.stringify(key));

    return await this.pupService.pageScreenshot({
      key,
      type,
      viewport: {
        width: 420,
        height: 336,
      },
    });
  }

  makeSalt(): string {
    return crypto.randomBytes(3).toString('base64');
  }

  async setKey(data) {
    const tempSalt = Buffer.from(this.makeSalt(), 'base64');
    const cryptoKey = crypto
      .pbkdf2Sync('Node Image', tempSalt, 10000, 16, 'sha1')
      .toString('base64');

    await this.cryptoKeys.set(cryptoKey, data);

    return cryptoKey;
  }

  async getImageData(key) {
    const imageData = await this.cryptoKeys.get(key);
    this.cryptoKeys.delete(key);
    Logger.log(JSON.stringify('-------------当前数据加密秘钥-------------'));
    Logger.log(JSON.stringify(key));
    Logger.log('-------------图片生成的数据-------------');
    Logger.log(JSON.stringify(imageData));
    return imageData;
  }
}
