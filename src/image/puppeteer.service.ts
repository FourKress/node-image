import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as genericPool from 'generic-pool';
import { Page } from 'puppeteer';

@Injectable()
export class PuppeteerService {
  browser = null;
  pagePool = null;
  pagePoolFactory = {
    create: async () => {
      const browserPage = await this.browser.newPage();
      browserPage.setDefaultTimeout(60000);
      return browserPage;
    },
    destroy: async (page: Page) => {
      await page.close();
    },
  };

  constructor() {
    puppeteer
      .launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-extensions',
          '–disable-gpu',
          '–disable-dev-shm-usage',
          '–no-first-run',
          '–no-zygote',
          '–single-process',
        ],
      })
      .then(async (browser) => {
        this.browser = browser;
        this.pagePool = genericPool.createPool(this.pagePoolFactory, {
          max: 20,
          min: 20,
        });
      });
  }

  async getPageInstance() {
    return (await this.pagePool.acquire()) as Page;
  }

  async pageScreenshot(config) {
    const { key, viewport, type } = config;
    const page = await this.getPageInstance();
    const encodeKey = encodeURIComponent(key);

    Logger.log('-------------需要生成的图片类型-------------');

    await page.goto(`http://localhost:4927/registry/image?key=${encodeKey}`);

    await page.setViewport(viewport);

    const isBot = type === 'bot';

    const path = `images/image_${Date.now()}.jpg`;
    const screenshotConfig = {
      fullPage: true,
      omitBackground: true,
      path: undefined,
      encoding: undefined,
    };

    if (isBot) {
      screenshotConfig.path = path;
    } else {
      screenshotConfig.encoding = 'base64';
    }

    const imageData = await page.screenshot({
      ...screenshotConfig,
    });

    Logger.log('图片生成成功');

    await this.pagePool.release(page);

    return isBot ? path : imageData;
  }
}
