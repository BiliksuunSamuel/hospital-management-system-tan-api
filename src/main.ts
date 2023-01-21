import { ValidationPipe, Post } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import configuration from './configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe());

  //
  if (true) {
    const config = new DocumentBuilder()
      .setTitle('HMS TAN')
      .setDescription('Health Management System, Tan')
      .setVersion('1.0')
      .addTag('hmst')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('', app, document);
  }

  await app.listen(configuration().Port);
}
bootstrap();
