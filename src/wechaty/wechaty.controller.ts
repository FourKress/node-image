import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { WechatyService } from './wechaty.service';

@Controller('wechaty')
export class WechatyController {
  constructor(private readonly wechatyService: WechatyService) {}

  @Post('/sendMiniProgram')
  @HttpCode(HttpStatus.OK)
  async sendMiniProgram(@Body() params) {
    Logger.log(params, '@@@@@@@@机器人');
    await this.wechatyService.sendMiniProgram(params);
  }

  @Post('/autoShare')
  @HttpCode(HttpStatus.OK)
  async autoShare(@Body() stadiumList) {
    Logger.log(JSON.stringify(stadiumList), '@@@@@@@@每天自动分享');
    await this.wechatyService.autoShare(stadiumList);
  }

  @Post('/appleForBoss')
  @HttpCode(HttpStatus.OK)
  async appleForBoss(@Body() stadiumList) {
    Logger.log(stadiumList, '@@@@@申请场主');
    await this.wechatyService.appleForBoss(stadiumList);
  }

  @Post('/refundNotice')
  @HttpCode(HttpStatus.OK)
  async refundNotice(@Body() stadiumList) {
    Logger.log(stadiumList, '@@@@@@@@退款通知');
    await this.wechatyService.refundNotice(stadiumList);
  }

  @Post('/applyWechatyBot')
  @HttpCode(HttpStatus.OK)
  async applyWechatyBot(@Body() stadium) {
    Logger.log(stadium, '@@@@@@@申请开启机器人');
    await this.wechatyService.applyWechatyBot(stadium);
  }
}
