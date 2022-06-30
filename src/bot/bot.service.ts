import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import * as shell from 'shelljs';

@Injectable()
export class BotService {
  async botStart(token): Promise<any> {
    if (!shell.which('git')) {
      shell.echo('Sorry, this script requires git');
      shell.exit(1);
    }

    const filePath = path.join(__dirname, '../../src/bot/bot.ts');
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

      console.log(213);

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
        echo('Error git commit failed 123');
        exit(1);
      }

      // if (exec('git push').code !== 0) {
      //   echo('Error git push failed');
      // }
    } catch (e) {
      console.log(e);
    }
  }
}
