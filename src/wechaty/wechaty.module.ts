import { Module, HttpModule } from '@nestjs/common';
import { WechatyController } from './wechaty.controller';
import { WechatyService } from './wechaty.service';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [HttpModule, ImageModule],
  controllers: [WechatyController],
  providers: [WechatyService],
  exports: [WechatyService],
})
export class WechatyModule {}
