import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BotService {
  async botStart(token): Promise<any> {
    const filePath = path.join(__dirname, '../../src/bot/bot.ts');
    try {
      const file = fs.readFileSync(filePath, 'utf-8');
      const newFile = file.replace(
        /puppet_padlocal_[\d\w]+/,
        `puppet_padlocal_${token}`,
      );
      console.log(newFile);

      // 同步写入内容
      fs.writeFileSync(filePath, newFile, 'utf8');
    } catch (e) {
      console.log(e);
    }
  }
}
