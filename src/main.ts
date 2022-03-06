import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { wechatyBot } from './wechaty/bot';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // 启动机器人
  wechatyBot.start();

  await app.listen(4927);
}

bootstrap().then(() => {
  console.log('服务启动成功');
});
