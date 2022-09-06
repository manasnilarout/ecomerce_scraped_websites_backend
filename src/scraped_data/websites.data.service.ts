import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WebsitesData } from './websites.data.entity';
import { ExtractorData, GroupEntity, GroupEntityField, ImportIoReponse } from './interfaces/ImportIoResponse';
import { SearchWebsiteRequest } from './interfaces/SearchWebsiteRequest';
import config from '../config';

@Injectable()
export class WebSitesDataService {
    private readonly logger = new Logger(WebSitesDataService.name);

    constructor(
        @InjectRepository(WebsitesData)
        private webSitesDataRepository: Repository<WebsitesData>,
        private readonly httpService: HttpService,
    ) { }

    public async getScrapedData(limit: number = 30, offset: number = 0, show_all: boolean = false): Promise<{ data: WebsitesData[]; recordsTotal: number; recordsFiltered: number; }> {
        try {
            const defaultFields: (keyof WebsitesData)[] = ['id', 'uri', 'title', 'eCommerceType', 'buildNo', 'companyId', 'baseLabel', 'dateLabel', 'version'];
            const result = await this.webSitesDataRepository.findAndCount({ take: limit, skip: offset, select: show_all ? null : defaultFields });
            this.logger.log(`Fetched ${result[1]} records.`);
            return { data: result[0], recordsTotal: result[1], recordsFiltered: result[0] && Array.isArray(result[0]) && result[0].length };
        } catch (err) {
            this.logger.error('Hmm, what happened here with get all!', err);
            if (err instanceof HttpException) {
                throw err;
            }
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
            if (err instanceof HttpException) {
                throw err;
            }
            throw new InternalServerErrorException('Something went wrong while fetching data for record with ID -> ' + id);
        }
    }

    private sanitizeUrl(domain: string): string {
        if (!domain.includes('http')) {
            domain = `https://${domain}`;
        }

        if (!domain.includes('www')) {
            domain = domain.replace(/(http(s)?:\/\/)(.+)/g, '$1www.$3');
        }

        return domain;
    }

    private async queryFromImport(domain: string): Promise<WebsitesData> {
        this.logger.log(`Attempting to scrape data from import for "${this.sanitizeUrl(domain)}"`);
        const response = await this.httpService.get(
            `https://extraction.import.io/query/extractor/${process.env.IMPORT_IO_EXTRACTOR_ID}?_apikey=${process.env.IMPORT_IO_API_KEY}&url=${encodeURIComponent(this.sanitizeUrl(domain))}`
        ).toPromise();

        if (response) {
            const result: ImportIoReponse = response.data;
            const extractorData: ExtractorData = result.extractorData;
            const pageData: GroupEntity = extractorData.data[0]?.group[0];

            const websiteRawRecord = new WebsitesData();

            websiteRawRecord.uri = extractorData.url;
            websiteRawRecord.suiteCommerceTag = this.getDataFromImportGroupFieldArray(pageData.suiteCommerceTag);
            websiteRawRecord.applicationLdJson = this.getDataFromImportGroupFieldArray(pageData.application_ld_json);
            websiteRawRecord.SSPAppContext = this.getDataFromImportGroupFieldArray(pageData.SSPAppContext);
            websiteRawRecord.backgroundRequests = this.getDataFromImportGroupFieldArray(pageData.backgroundRequests);
            websiteRawRecord.baseLabel = this.getDataFromImportGroupFieldArray(pageData.base_label);
            websiteRawRecord.prodBundleId = this.getDataFromImportGroupFieldArray(pageData.prodbundle_id);
            websiteRawRecord.buildNo = this.getDataFromImportGroupFieldArray(pageData.build_no);
            websiteRawRecord.companyId = this.getDataFromImportGroupFieldArray(pageData.companyId);
            websiteRawRecord.cookies = this.getDataFromImportGroupFieldArray(pageData.cookies);
            websiteRawRecord.dateLabel = this.getDataFromImportGroupFieldArray(pageData.date_label);
            websiteRawRecord.seoGenerator = this.getDataFromImportGroupFieldArray(pageData.seoGenerator);
            websiteRawRecord.version = this.getDataFromImportGroupFieldArray(pageData.version);
            websiteRawRecord.title = this.getDataFromImportGroupFieldArray(pageData.title);
            websiteRawRecord.subRequestStatus = this.getDataFromImportGroupFieldArray(pageData.subRequestStatus);
            websiteRawRecord.divClassMain = this.getDataFromImportGroupFieldArray(pageData.div_class_main);
            websiteRawRecord.divIdMain = this.getDataFromImportGroupFieldArray(pageData.div_id_main);
            websiteRawRecord.canonicalUrl = this.getDataFromImportGroupFieldArray(pageData.canonical_url);
            websiteRawRecord.searchRequestDetails = this.getDataFromImportGroupFieldArray(pageData.searchRequest);
            websiteRawRecord.perfTiming = this.getDataFromImportGroupFieldArray(pageData.perfTiming);
            websiteRawRecord.perfTimingSqlTime = this.getDataFromImportGroupFieldArray(pageData.perfTiming)?.replace(/sqltime:(\d+)/g, '$1');
            websiteRawRecord.eCommerceType = this.getDataFromImportGroupFieldArray(pageData.eCommerceType);
            websiteRawRecord.isHttps = this.getDataFromImportGroupFieldArray(pageData.isHttpS);
            websiteRawRecord.gotResponseFromPreRender = this.getDataFromImportGroupFieldArray(pageData.gotResponseFromPrerender);
            websiteRawRecord.governance = this.getDataFromImportGroupFieldArray(pageData.Governance);
            websiteRawRecord.isCnameMapped = this.getDataFromImportGroupFieldArray(pageData.isCNameProperlyMapped);
            websiteRawRecord.cNameTestUrl = this.getDataFromImportGroupFieldArray(pageData.cNameTestWithUrl);
            websiteRawRecord.consoleContent = this.getDataFromImportGroupFieldArray(pageData.consoleContent);
            websiteRawRecord.screenCapture = extractorData.data[0].screenCapture;
            websiteRawRecord.urlInput = extractorData.url;
            websiteRawRecord.source = 'External';
            websiteRawRecord.dateScraped = new Date().toISOString().split('T')[0];

            return this.processData(await this.webSitesDataRepository.save(websiteRawRecord));
        }

        throw new InternalServerErrorException('Something went wrong while scraping data from import.');
    }

    private getDataFromImportGroupFieldArray(arr: GroupEntityField[]): string {
        return (arr && arr[0]?.text) || null;
    }

    public async getDataFromImport(domain: string, skipRecordCheck: boolean = false): Promise<WebsitesData[]> {
        try {
            if (!skipRecordCheck) {
                const existingRecords = await this.webSitesDataRepository
                    .createQueryBuilder('websiteData')
                    .where('websiteData.uri like :domain', { domain: `%${domain}%` })
                    .getMany();

                if (existingRecords && existingRecords.length) {
                    this.logger.log(`Found an existing record for domain -> "${domain}"`);
                    return existingRecords;
                }
            }

            return [await this.queryFromImport(domain)];
        } catch (err) {
            this.logger.error('Something went wrong while trying get data from import.', err);
            if (err instanceof HttpException) {
                throw err;
            }
            throw new InternalServerErrorException('Something went wrong while trying get data from import.', err);
        }
    }

    public async search({ domain, companyId }: { domain: string, companyId?: string }, isLiveQuery: boolean = false)
        : Promise<WebsitesData[]> {
        try {
            this.logger.log(`Attempting to search with "${companyId || domain}" in DB`);
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
                    this.logger.log(`No existing domains found with given input -> ${domain}`);
                    if (isLiveQuery) {
                        return await this.getDataFromImport(domain, true);
                    }
                    throw new NotFoundException(`No website record found with domain -> ${domain}`);
                }

                return result;
            }
        } catch (err) {
            this.logger.error('Hmm, what happened here with the search!', err);
            if (err instanceof HttpException) {
                throw err;
            }
            throw new InternalServerErrorException('Something went wrong while fetching data for record with given details.', err);
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

    public async searchForDomainAndStoreUserDetails(requestBody: SearchWebsiteRequest): Promise<WebsitesData[]> {
        try {
            await this.storeSearchDetailsInSheet(requestBody);
            return await this.search({ domain: requestBody.domain }, true);
        } catch (err) {
            this.logger.error('Hmm, what happened here with the search!', err);
            if (err instanceof HttpException) {
                throw err;
            }
            throw new InternalServerErrorException('Something went wrong while fetching data for record with given details.', err);
        }
    }

    private async storeSearchDetailsInSheet(requestBody: SearchWebsiteRequest): Promise<void> {
        try {
            this.logger.log(`Storing request details in google sheet.`);
            await this.httpService.post(
                `${config.CE_BASE_URL}/spreadsheets/${process.env.SPREADSHEET_ID}/worksheets/${config.CE_SHEET_NAME}/multiples`,
                { majorDimension: 'ROWS', values: [Object.values(requestBody)] },
                { headers: { Authorization: process.env.CE_AUTH_KEY } }
            ).toPromise();
        } catch (err) {
            this.logger.error(`Something went wrong while storing search details in G-Sheet.`, err);
            throw new InternalServerErrorException(`Something went wrong while storing search details in G-Sheet.`, err);
        }
    }
}
