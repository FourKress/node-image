// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Wechaty, MiniProgram } = require('wechaty');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PuppetPadlocal } = require('wechaty-puppet-padlocal');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrcodeTerminal = require('qrcode-terminal');
import { HttpService } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

const httpService = new HttpService();

const bot = new Wechaty({
  puppet: new PuppetPadlocal({
    token: 'puppet_padlocal_4dce190e58b647eaa221d02319dcde56',
  }),
});

bot
  // 扫码登录
  .on('scan', (qrcode, status) => {
    console.log(
      `Scan QR Code to login: ${status}\nhttps://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        qrcode,
      )}`,
    );
    console.log(qrcode);
    QrcodeTerminal.generate(qrcode);
  })
  // 登录监听
  .on('login', (user) => {
    console.log(user, 'login');
  })
  // 退出监听
  .on('logout', (user) => {
    console.log(user, 'logout');
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
        httpService.post('http://localhost:9000/api/wxGroup/add', {
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
        httpService.post(
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
// 消息监听
// .on('message', async (message) => {
//   try {
//     const room = message.room();
//     const from = message.talker();
//     const text = message.text();
//     console.log(`收到新消息: ${message}`);
//     console.log(room, room?.id, from, text);
//   } catch (e) {
//     console.log('@@@@', e);
//   }
// });

export const wechatyBot = bot;

export const sendMessage = async (toUserId, payload, isMini = false) => {
  const toContact = await bot.Room.load(toUserId);
  let content = payload;
  if (isMini) {
    content = new MiniProgram(payload);
  }
  const message = await toContact.say(content);
  return message;
};
