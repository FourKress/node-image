import { Controller, Get, Query, Render, Logger } from '@nestjs/common';
import { ImageService } from './image.service';

@Controller('registry')
export class ImageController {
  constructor(private readonly appService: ImageService) {}

  @Get('/generate')
  async generate(@Query('userList') userList) {
    Logger.log('-------------请求参数 原始数据-------------');
    const params = JSON.parse(userList.replace(/'/g, ''));
    Logger.log(params);
    return await this.appService.createPicture(params);
  }

  @Get('/botGenerate')
  async botGenerate(@Query('userList') userList) {
    Logger.log('-------------请求参数 原始数据-------------');
    const params = JSON.parse(userList.replace(/'/g, ''));
    Logger.log(params);
    return await this.appService.createPicture(params, 'bot');
  }

  @Get('/image')
  @Render('index')
  async tablePage(@Query('key') key) {
    return { data: await this.appService.getImageData(key) };
  }
}
