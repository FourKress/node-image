import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Query,
  Body,
  Render,
  Logger,
} from '@nestjs/common';
import { ImageService } from './image.service';

@Controller('registry')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('/generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() userList) {
    Logger.log('-------------分享请求参数 原始数据-------------');
    Logger.log(userList);
    return await this.imageService.createPicture(userList);
  }

  @Post('/botGenerate')
  @HttpCode(HttpStatus.OK)
  async botGenerate(@Body() userList) {
    Logger.log('-------------机器人分享请求参数 原始数据-------------');
    Logger.log(userList);
    return await this.imageService.createPicture(userList, 'bot');
  }

  @Get('/image')
  @Render('index')
  async tablePage(@Query('key') key) {
    return { data: await this.imageService.getImageData(key) };
  }
}
