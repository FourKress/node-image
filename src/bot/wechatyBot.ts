// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Wechaty, MiniProgram } = require('wechaty');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PuppetPadlocal } = require('wechaty-puppet-padlocal');
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const QrcodeTerminal = require('qrcode-terminal');

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import * as Moment from 'moment';

@Injectable()
export class WechatyBot {
  constructor(private readonly httpService: HttpService) {}

  private qrcodeLink = '';
  private botStatus = false;
  private expiredTime = '';

  private readonly timer = Date.now();
  private readonly bot = new Wechaty({
    name: '动起手来',
    puppet: new PuppetPadlocal({
      token: 'puppet_padlocal_063348e66c0648d191f7eaa867a5349b',
    }),
  });

  getQrcodeLink() {
    return this.qrcodeLink;
  }

  getBotStatus() {
    return this.botStatus;
  }

  getExpiredTime() {
    return this.expiredTime;
  }

  start() {
    this.bot
      // 扫码登录
      .on('scan', (qrcode, status) => {
        const qrcodeLink = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
          qrcode,
        )}`;
        console.log(`Scan QR Code to login: ${status}\n${qrcodeLink}`);
        // this.qrcodeLink = qrcodeLink;
        this.qrcodeLink = qrcode;
        // QrcodeTerminal.generate(qrcode);
      })
      // 登录监听
      .on('login', (user) => {
        this.expiredTime = Moment().add(7, 'day').format('YYYY-MM-DD');
        this.botStatus = true;
        console.log(user, 'login');
      })
      // 退出监听
      .on('logout', (user) => {
        console.log(user, 'logout');
        this.botStatus = false;
        this.qrcodeLink = '';
        if (Date.now() - this.timer < 1000 * 10) {
          console.log('重启失败');
          return;
        }
        console.log('开始重启');
        this.bot.start();
      })
      // 通过群邀请
      .on('room-invite', async (roomInvite) => {
        console.log('通过群邀请');
        await roomInvite.accept();
      })
      // 加入房间
      .on('room-join', async (room, inviteeList, inviter, date) => {
        console.log(room, room?.id, inviteeList, inviter, date);
        try {
          await lastValueFrom(
            this.httpService.post('http://localhost:9000/api/wxGroup/add', {
              wxGroupId: room.id,
              wxGroupName: room?.payload?.topic,
            }),
          );
        } catch (e) {
          console.log('http请求', e);
        }
      })
      // 监听群名称编号
      .on('room-topic', async (room, newTopic, oldTopic, changer, date) => {
        console.log(
          `on room topic: ${room.toString()}, ${
            room.id
          }, ${newTopic}, ${oldTopic}, ${changer.toString()}, ${date}`,
        );
        try {
          await lastValueFrom(
            this.httpService.post(
              'http://localhost:9000/api/stadium/modifyWxGroupName',
              {
                wxGroupId: room.id,
                wxGroupName: newTopic,
              },
            ),
          );
        } catch (e) {
          console.log('http请求', e);
        }
      });
    this.bot.start();
  }

  async botLogout() {
    await this.bot?.logout();
  }

  async sendMessage(toUserId, payload, isMini = false) {
    const toContact = await this.bot.Room.load(toUserId);
    let content = payload;
    if (isMini) {
      content = new MiniProgram(payload);
    }
    const message = await toContact.say(content);
    return message;
  }

  async baseNotice(payload) {
    const toContact = await this.bot.Room.load('20817106223@chatroom');
    const message = await toContact.say(payload);
    return message;
  }
}
