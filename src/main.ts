import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrometheusInterceptor } from './interceptor/metrics.interceptor';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new PrometheusInterceptor());

  // uncaughtException 처리
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    console.error(err.stack);
    // 필요하다면 애플리케이션 종료
    process.exit(1);
  });

  // unhandledRejection 처리
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // 필요하다면 추가 로직 처리
  });


  await app.listen(process.env.SERVER_PORT);
  console.log(process.env.SERVER_PORT);
}
bootstrap();
