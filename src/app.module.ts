import { Module } from '@nestjs/common';
import { join } from 'path';

import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageModule } from './image/image.module';
import { WechatyModule } from './wechaty/wechaty.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    // 静态文件
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      exclude: ['/registry*'],
    }),
    ImageModule,
    WechatyModule,
    BotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
