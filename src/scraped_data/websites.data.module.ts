import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebSitesDataService } from './websites.data.service';
import { WebSitesDataController } from './websites.data.controller';
import { WebsitesData } from './websites.data.entity';

@Module({
    imports: [TypeOrmModule.forFeature([WebsitesData])],
    providers: [WebSitesDataService],
    controllers: [WebSitesDataController],
})
export class WebSitesDataModule { }