import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebsitesData } from './websites.data.entity';

@Injectable()
export class WebSitesDataService {
    constructor(
        @InjectRepository(WebsitesData)
        private webSitesDataRepository: Repository<WebsitesData>,
    ) { }

    public async getScrapedData(limit: number = 30, offset: number = 0, show_all: boolean = false): Promise<{ data: WebsitesData[]; recordsTotal: number; recordsFiltered: number; }> {
        try {
            const defaultFields: (keyof WebsitesData)[] = ['id', 'uri', 'title', 'eCommerceType', 'buildNo', 'companyId', 'baseLabel', 'dateLabel', 'version'];
            const result = await this.webSitesDataRepository.findAndCount({ take: limit, skip: offset, select: show_all ? null : defaultFields });
            return { data: result[0], recordsTotal: result[1], recordsFiltered: result[0] && Array.isArray(result[0]) && result[0].length }
        } catch (err) {
            throw new InternalServerErrorException('Something went wrong while fetching scraped data.');
        }
    }
}