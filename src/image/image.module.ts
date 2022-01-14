import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { PuppeteerService } from './puppeteer.service';

@Module({
  imports: [],
  controllers: [ImageController],
  providers: [ImageService, PuppeteerService],
})
export class ImageModule {}
