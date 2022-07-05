import { Module, HttpModule } from '@nestjs/common';
import { WechatyController } from './wechaty.controller';
import { WechatyService } from './wechaty.service';
import { ImageModule } from '../image/image.module';
import { BotModule } from '../bot/bot.module';

@Module({
  imports: [HttpModule, ImageModule, BotModule],
  controllers: [WechatyController],
  providers: [WechatyService],
  exports: [WechatyService],
})
export class WechatyModule {}
