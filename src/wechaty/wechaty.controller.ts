import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { WechatyService } from './wechaty.service';

@Controller('wechaty')
export class WechatyController {
  constructor(private readonly wechatyService: WechatyService) {}

  @Post('/sendMiniProgram')
  @HttpCode(HttpStatus.OK)
  async sendMiniProgram(@Body() params) {
    console.log('@@@@@@@@机器人', params);
    await this.wechatyService.sendMiniProgram(params);
  }
}
