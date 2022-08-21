import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebsitesData } from './websites.data.entity';

@Injectable()
export class WebSitesDataService {
    constructor(
        @InjectRepository(WebsitesData)
        private webSitesDataRepository: Repository<WebsitesData>,
    ) { }

    public async getScrapedData(limit: number = 30): Promise<WebsitesData> {
        return null;
    }
}