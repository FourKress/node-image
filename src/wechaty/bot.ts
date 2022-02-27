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
