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

  @Post('/autoShare')
  @HttpCode(HttpStatus.OK)
  async autoShare(@Body() stadiumList) {
    console.log('@@@@@@@@每天自动分享', stadiumList);
    await this.wechatyService.autoShare(stadiumList);
  }

  @Post('/appleForBoss')
  @HttpCode(HttpStatus.OK)
  async appleForBoss(@Body() stadiumList) {
    console.log('@@@@@申请场主', stadiumList);
    await this.wechatyService.appleForBoss(stadiumList);
  }

  @Post('/refundNotice')
  @HttpCode(HttpStatus.OK)
  async refundNotice(@Body() stadiumList) {
    console.log('@@@@@@@@退款通知', stadiumList);
    await this.wechatyService.refundNotice(stadiumList);
  }
}
