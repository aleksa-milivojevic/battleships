import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: "http://localhost:4200",
    credentials: true
  })

  const port = configService.get<number>('PORT') || 3000;

  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    transformOptions: {
      enableImplicitConversion: true
    }
  }));

  app.use(cookieParser(process.env.COOKIE_SECRET));
  
  await app.listen(port);
  
  console.log(`Application running on: http://localhost:${port}/`);
}
bootstrap();
