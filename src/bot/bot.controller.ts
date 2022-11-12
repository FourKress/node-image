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
    Logger.log('@@@@@@@@机器人更换token');
    await this.botService.botStart(token);
    return {
      code: 10000,
      data: true,
      message: '成功',
      success: true,
    };
  }

  @Get('/restart')
  async restart() {
    Logger.log('@@@@@@@@机器人重启');
    await this.botService.restart();
    return {
      code: 10000,
      data: true,
      message: '成功',
      success: true,
    };
  }

  @Get('/qrcodeLink')
  async qrcodeLink() {
    Logger.log('@@@@@@@@二维码登录链接');
    const qrcodeLink = await this.botService.getQrcodeLink();
    return {
      code: 10000,
      data: {
        qrcodeLink,
      },
      message: '成功',
      success: true,
    };
  }

  @Get('/status')
  async getBotStatus() {
    Logger.log('@@@@@@@@机器人状态');
    const data = await this.botService.getBotStatus();
    return {
      code: 10000,
      data,
      message: '成功',
      success: true,
    };
  }

  @Get('/logout')
  async logout() {
    Logger.log('@@@@@@@@机器人退出登录');
    const data = await this.botService.botLogout();
    return {
      code: 10000,
      data,
      message: '成功',
      success: true,
    };
  }
}
