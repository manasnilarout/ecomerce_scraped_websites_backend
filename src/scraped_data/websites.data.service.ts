import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebsitesData } from './websites.data.entity';

@Injectable()
export class WebSitesDataService {
    private readonly logger = new Logger(WebSitesDataService.name);

    constructor(
        @InjectRepository(WebsitesData)
        private webSitesDataRepository: Repository<WebsitesData>,
    ) { }

    public async getScrapedData(limit: number = 30, offset: number = 0, show_all: boolean = false): Promise<{ data: WebsitesData[]; recordsTotal: number; recordsFiltered: number; }> {
        try {
            const defaultFields: (keyof WebsitesData)[] = ['id', 'uri', 'title', 'eCommerceType', 'buildNo', 'companyId', 'baseLabel', 'dateLabel', 'version'];
            const result = await this.webSitesDataRepository.findAndCount({ take: limit, skip: offset, select: show_all ? null : defaultFields });
            this.logger.log(`Fetched ${result[1]} records.`);
            return { data: result[0], recordsTotal: result[1], recordsFiltered: result[0] && Array.isArray(result[0]) && result[0].length };
        } catch (err) {
            this.logger.error('Hmm, what happened here with get all!', err);
            throw new InternalServerErrorException('Something went wrong while fetching scraped data.');
        }
    }

    public async getById(id: number): Promise<WebsitesData> {
        try {
            const result = await this.webSitesDataRepository.findOneBy({ id });
            this.logger.log(`Fetched record for ${id}`);
            if (!result) {
                throw new NotFoundException(`No website record found with ID -> ${id}`);
            }

            return this.processData(result);
        } catch (err) {
            this.logger.error('Hmm, what happened here with get buy ID!', err);
            throw new InternalServerErrorException('Something went wrong while fetching data for record with ID -> ' + id);
        }
    }

    public async search({ domain, companyId }): Promise<WebsitesData[]> {
        try {
            this.logger.log(`Attempting to search with "${companyId || domain}"`);
            if (companyId) {
                const result = await this.webSitesDataRepository.find({ where: { companyId } });

                if (!result || !result.length) {
                    throw new NotFoundException(`No website record found with companyId -> ${companyId}`);
                }

                return result;
            }

            if (domain) {
                const result = await this.webSitesDataRepository
                    .createQueryBuilder('websiteData')
                    .where('websiteData.uri like :domain', { domain: `%${domain}%` })
                    .getMany();

                if (!result || !result.length) {
                    throw new NotFoundException(`No website record found with domain -> ${domain}`);
                }

                return result;
            }
        } catch (err) {
            this.logger.error('Hmm, what happened here with the search!', err);
            throw new InternalServerErrorException('Something went wrong while fetching data for record with given details.');
        }
    }

    private processData(websiteData: WebsitesData): WebsitesData {
        const tempwebsiteDataObj = JSON.parse(JSON.stringify(websiteData))

        if (!tempwebsiteDataObj.applicationLdJson) {
            tempwebsiteDataObj.applicationLdJsonPresence = false;
        }

        if (tempwebsiteDataObj.SSPAppContext === 'YES') {
            tempwebsiteDataObj.SSPAppContextStr = '85% of SCA Site have this ON.'
        }

        if (tempwebsiteDataObj.isCnameMapped === 'No') {
            tempwebsiteDataObj.isCnameMappedStr = `CNAME is not correctly mapped and it fails with url: ${tempwebsiteDataObj.cNameTestUrl}`
        }

        return tempwebsiteDataObj;
    }
}
