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
  async appleForBoss(@Body() user) {
    Logger.log(user, '@@@@@申请场主');
    await this.wechatyService.appleForBoss(user);
  }

  @Post('/refundNotice')
  @HttpCode(HttpStatus.OK)
  async refundNotice(@Body() params) {
    Logger.log(params, '@@@@@@@@退款通知');
    await this.wechatyService.refundNotice(params);
  }

  @Post('/applyWechatyBot')
  @HttpCode(HttpStatus.OK)
  async applyWechatyBot(@Body() stadium) {
    Logger.log(stadium, '@@@@@@@申请开启机器人');
    await this.wechatyService.applyWechatyBot(stadium);
  }

  @Post('/withdrawNotice')
  @HttpCode(HttpStatus.OK)
  async withdrawNotice(@Body() user) {
    Logger.log(user, '@@@@@@@场主提现');
    await this.wechatyService.withdrawNotice(user);
  }
}
