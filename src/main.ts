import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
//testrt port solve space
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // app.enableCors({ origin: ['http://localhost:3000'] });
  const logger = new Logger('Bootstrap');
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      // transformOptions: {
      //   enableImplicitConversion: true,
      // },
    }),
  );
  console.log('este es el host: ' + process.env.DB_HOST);
  console.log('este es el user: ' + process.env.DB_USERNAME);
  console.log('este es el namedb: ' + process.env.DB_NAME);
  console.log('este es el pass: ' + process.env.DB_PASSWORD);
  console.log('este es el port: ' + process.env.DB_PORT);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const config = new DocumentBuilder()
    .setTitle('Matrículas RESTFul API')
    .setDescription('Matriculas endpoints')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT);
  logger.log(`App running on port ${process.env.PORT}`);
}
bootstrap();
