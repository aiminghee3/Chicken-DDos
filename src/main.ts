import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrometheusInterceptor } from './interceptor/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new PrometheusInterceptor());
  await app.listen(8000);
}
bootstrap();
