import {
  Controller,
  Post,
  Get,
  Body,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { BotService } from './bot.service';
import { WechatyBot } from './wechatyBot';

@Controller('bot')
export class BotController {
  constructor(
    private readonly botService: BotService,
    private readonly wechatyBot: WechatyBot,
  ) {
    this.wechatyBot.start();
  }

  @Post('/start')
  @HttpCode(HttpStatus.OK)
  async botStart(@Body('token') token: string) {
    Logger.log('@@@@@@@@机器人登录');
    await this.botService.botStart(token);
    return 'success';
  }

  @Get('/qrcodeLink')
  async qrcodeLink() {
    Logger.log('@@@@@@@@二维码登录链接');
    return await this.botService.getQrcodeLink();
  }

  @Get('/status')
  async getBotStatus() {
    Logger.log('@@@@@@@@机器人状态');
    return await this.botService.getBotStatus();
  }
}
