const { Wechaty, MiniProgram } = require('wechaty');
const { PuppetPadlocal } = require('wechaty-puppet-padlocal');
const QrcodeTerminal = require('qrcode-terminal');

const bot = new Wechaty({
  puppet: new PuppetPadlocal({
    token: 'puppet_padlocal_e4e2f88a223949048f7fe88f8576745b',
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
    QrcodeTerminal.generate(qrcode);
  })
  // 登录监听
  .on('login', (user) => {
    console.log(user, 'login');
  })
  // 退出监听
  .on('logout', (user) => {
    console.log(user, 'logout');
  });
// 消息监听
// .on('message', async (message) => {
//   const room = message.room();
//   const from = message.talker();
//   const text = message.text();
//   console.log(`收到新消息: ${message}`);
//
//   // const allRooms = await bot.Room.findAll();
//   // console.log(allRooms);
//
//   // const targetRoom = allRooms.find(
//   //   (room) => room?.payload.id === '20817106223@chatroom',
//   // );
//
//   // if (targetRoom) {
//   //   setTimeout(async () => {
//   //     const miniProgramPayload = {
//   //       appid: 'wx8e63001d0409fa13',
//   //       username: 'gh_aeefc035b7a3@app',
//   //       title: '求队-机器人测试发送小程序',
//   //       description: '求队-为了我们的热爱!',
//   //       pagePath: '/client/pages/stadium/index.html',
//   //       thumbUrl: 'https://pic.qqtn.com/up/2019-9/15690311636958128.jpg',
//   //       iconUrl: 'https://wx.qiuchangtong.xyz/images/logo.jpg',
//   //     };
//   //     const miniProgram = new MiniProgram(miniProgramPayload);
//   //     await targetRoom.say(miniProgram);
//   //   }, 5000);
//   // }
//
//   // if (room?.payload.id === '20817106223@chatroom') {
//   //   console.log(room, room?.payload.id, from, text);
//   //
//   //   if (text === '机器人小程序') {
//   //     const miniProgramPayload = {
//   //       appid: 'wx8e63001d0409fa13',
//   //       username: 'gh_aeefc035b7a3@app',
//   //       title: '求队-机器人测试发送小程序',
//   //       description: '求队-为了我们的热爱!',
//   //       pagePath: '/client/pages/stadium/index.html',
//   //       thumbUrl: 'https://pic.qqtn.com/up/2019-9/15690311636958128.jpg',
//   //       iconUrl: 'https://wx.qiuchangtong.xyz/images/logo.jpg',
//   //     };
//   //     const miniProgram = new MiniProgram(miniProgramPayload);
//   //     await room.say(miniProgram);
//   //   }
//   // }
// });

export const wechatyBot = bot;

export const sendMessage = async (toUserId, payload, isMini) => {
  const toContact = await bot.Room.load(toUserId);
  let content = payload;
  if (isMini) {
    content = new MiniProgram(payload);
  }
  const message = await toContact.say(content);
  return message;
};
