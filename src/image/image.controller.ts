import {
  Controller,
  Get,
  Query,
  Render,
  Body,
  Post,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ImageService } from './image.service';

@Controller('registry')
export class ImageController {
  constructor(private readonly appService: ImageService) {}

  @Post('/generate')
  @HttpCode(HttpStatus.OK)
  async test(@Body() params) {
    Logger.log('-------------请求参数 原始数据-------------');
    Logger.log(JSON.stringify(params));
    return await this.appService.createPicture(params);
  }

  @Get('/image')
  @Render('index')
  async tablePage(@Query('key') key) {
    return { data: await this.appService.getImageData(key) };
  }
}
