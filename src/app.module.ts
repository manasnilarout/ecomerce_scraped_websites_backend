import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsitesData } from './scraped_data/websites.data.entity';
import { WebSitesDataModule } from './scraped_data/websites.data.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: (process.env.MYSQL_PORT && Number(process.env.MYSQL_PORT)) || 3306,
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'test',
      entities: [WebsitesData],
      synchronize: false,
    }),
    WebSitesDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
