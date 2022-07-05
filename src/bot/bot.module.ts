import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { WechatyBot } from './wechatyBot';

@Module({
  controllers: [BotController],
  providers: [BotService, WechatyBot],
  exports: [WechatyBot],
})
export class BotModule {}
