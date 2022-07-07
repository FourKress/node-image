import { Module, HttpModule } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { WechatyBot } from './wechatyBot';

@Module({
  imports: [HttpModule],
  controllers: [BotController],
  providers: [BotService, WechatyBot],
  exports: [WechatyBot],
})
export class BotModule {}
