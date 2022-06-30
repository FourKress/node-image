import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { BotService } from './bot.service';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('/start')
  @HttpCode(HttpStatus.OK)
  async loginLink(@Body('token') token: string) {
    Logger.log('@@@@@@@@机器人登录');
    await this.botService.botStart(token);
  }
}
