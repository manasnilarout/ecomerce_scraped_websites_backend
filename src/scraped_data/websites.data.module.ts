import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { WebSitesDataService } from './websites.data.service';
import { WebSitesDataController } from './websites.data.controller';
import { WebsitesData } from './websites.data.entity';
import config from '../config';

@Module({
    imports: [
        TypeOrmModule.forFeature([WebsitesData]),
        HttpModule.registerAsync({
            useFactory: () => ({
                timeout: config.HTTP_SERVICE_TIMEOUT,
                maxRedirects: config.HTTP_SERVICE_MAX_REDIRECTS,
            }),
        })],
    providers: [WebSitesDataService],
    controllers: [WebSitesDataController],
})
export class WebSitesDataModule { }