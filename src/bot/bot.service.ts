import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import * as Moment from 'moment';
import { WechatyBot } from './wechatyBot';

@Injectable()
export class BotService {
  constructor(private readonly wechatyBot: WechatyBot) {}

  private expiredTime = '';

  async botStart(token): Promise<any> {
    if (!shell.which('git')) {
      shell.echo('Sorry, this script requires git');
      shell.exit(1);
    }

    const filePath = path.join(__dirname, '../../src/bot/wechatyBot.ts');
    try {
      const exec = shell.exec;
      const echo = shell.echo;
      const exit = shell.exit;
      if (exec('git checkout bot').code !== 0) {
        echo('Error git checkout branch failed');
        exit(1);
      }

      if (exec('git pull').code !== 0) {
        echo('Error git pull failed');
        exit(1);
      }

      const file = fs.readFileSync(filePath, 'utf-8');
      const newFile = file.replace(
        /puppet_padlocal_[\d\w]+/,
        `puppet_padlocal_${token}`,
      );

      // 同步写入内容
      fs.writeFileSync(filePath, newFile, 'utf8');

      if (exec('git add .').code !== 0) {
        echo('Error git add failed');
        exit(1);
      }

      if (exec(`git commit -m '更换token'`).code !== 0) {
        echo('Error git commit failed');
        exit(1);
      }

      if (exec('git push').code !== 0) {
        echo('Error git push failed');
      }

      if (exec('yarn build').code !== 0) {
        echo('Error yarn build failed');
      }

      this.expiredTime = Moment().add(7, 'day').format('YYYY-MM-DD');

      return exec('pm2 restart node-image');
    } catch (e) {
      console.log(e);
    }
  }

  async restart(): Promise<any> {
    const exec = shell.exec;
    return exec('pm2 restart node-image');
  }

  async getQrcodeLink(): Promise<any> {
    return this.wechatyBot.getQrcodeLink();
  }
  async getBotStatus(): Promise<any> {
    return {
      status: this.wechatyBot.getBotStatus(),
      expiredTime: this.expiredTime,
    };
  }
}
