import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageModule } from './image/image.module';
import { WechatyModule } from './wechaty/wechaty.module';
import { join } from 'path';

@Module({
  imports: [
    // 静态文件
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      exclude: ['/registry*'],
    }),
    ImageModule,
    WechatyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
