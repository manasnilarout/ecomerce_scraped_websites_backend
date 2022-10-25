import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WebsitesData } from './websites.data.entity';
import { ExtractorData, GroupEntity, GroupEntityField, ImportIoReponse } from './interfaces/ImportIoResponse';
import { SearchWebsiteRequest } from './interfaces/SearchWebsiteRequest';
import config from '../config';
import { FieldDetails } from './interfaces/FieldDetails';

@Injectable()
export class WebSitesDataService {
    private readonly logger = new Logger(WebSitesDataService.name);
    private static avgCalculatableFields: string[] = ['perfTimingSqlTime', 'gotResponseFromPreRenderTime'];

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

            return await this.processData(result);
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

        if (!domain.includes('?')) {
            domain += `?seodebug=T&preview=${new Date().getTime()}`;
        } else {
            if (!domain.includes('seodebug')) domain += `&seodebug=T`;
            if (!domain.includes('preview')) domain += `&preview=${new Date().getTime()}`;
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
            websiteRawRecord.perfTimingSqlTime = this.getDataFromImportGroupFieldArray(pageData['perfTiming:sqltime']);
            websiteRawRecord.eCommerceType = this.getDataFromImportGroupFieldArray(pageData.eCommerceType);
            websiteRawRecord.isHttps = this.getDataFromImportGroupFieldArray(pageData.isHttpS);
            websiteRawRecord.gotResponseFromPreRender = this.getDataFromImportGroupFieldArray(pageData.gotResponseFromPrerender);
            websiteRawRecord.governance = this.getDataFromImportGroupFieldArray(pageData.Governance);
            websiteRawRecord.isCnameMapped = this.getDataFromImportGroupFieldArray(pageData.isCNameProperlyMapped);
            websiteRawRecord.cNameTestUrl = this.getDataFromImportGroupFieldArray(pageData.cNameTestWithUrl);
            websiteRawRecord.consoleContent = this.getDataFromImportGroupFieldArray(pageData.consoleErrStringContent);
            websiteRawRecord.gotResponseFromPreRenderTime = this.getDataFromImportGroupFieldArray(pageData.gotResponseFromPrerenderTime);
            websiteRawRecord.divIdFooterTag = this.getDataFromImportGroupFieldArray(pageData.divIdFooterTag);
            websiteRawRecord.noIndexNoFollowTags = this.getDataFromImportGroupFieldArray(pageData.noIndexNoFollowTags);
            websiteRawRecord.sitemapOrigin = this.getDataFromImportGroupFieldArray(pageData.sitemapOrigin);
            websiteRawRecord.robotsPageContent = this.getDataFromImportGroupFieldArray(pageData.robotsPageContent);
            websiteRawRecord.isGoogleAnalyticsLoaded = this.getDataFromImportGroupFieldArray(pageData.isGoogleAnalyticsLoaded);
            websiteRawRecord.isApplicationLdJsonPresent = this.getDataFromImportGroupFieldArray(pageData.isApplicationLdJsonTagPresent);
            websiteRawRecord.schemaType = this.getDataFromImportGroupFieldArray(pageData.schemaType);
            websiteRawRecord.schemaMarkupPresent = this.getDataFromImportGroupFieldArray(pageData.schemaMarkupPresent);
            websiteRawRecord.isMetaDescriptionPresent = this.getDataFromImportGroupFieldArray(pageData.isMetaDescriptionPresent);
            websiteRawRecord.isSitemapLinkPresentInRobotsPage = this.getDataFromImportGroupFieldArray(pageData.isSiteMapLinkPresentInRobotsPage);
            websiteRawRecord.isRobotsPagePresent = this.getDataFromImportGroupFieldArray(pageData.isRobotsPagePresent);
            websiteRawRecord.sitemapLink = this.getDataFromImportGroupFieldArray(pageData.sitemapLink);
            websiteRawRecord.isSitemapLinkFunctional = this.getDataFromImportGroupFieldArray(pageData.isSitemapLinkFunctional);
            websiteRawRecord.gotResponseFromPrerenderAttemptOne = this.getDataFromImportGroupFieldArray(pageData['gotResponseFromPrerenderAttempt-1']);
            websiteRawRecord.gotResponseFromPrerenderAttemptTwo = this.getDataFromImportGroupFieldArray(pageData['gotResponseFromPrerenderAttempt-2']);
            websiteRawRecord.gotResponseFromPrerenderAttemptThree = this.getDataFromImportGroupFieldArray(pageData['gotResponseFromPrerenderAttempt-3']);
            websiteRawRecord.gotResponseFromPrerenderAttemptsAverage = this.getDataFromImportGroupFieldArray(pageData['gotResponseFromPrerenderAttempt-Average']);
            websiteRawRecord.gotResponseFromPrerenderAttemptsAlertLevelValues = this.getDataFromImportGroupFieldArray(pageData['gotResponseFromPrerenderAttempt-AlertLevelValues']);
            websiteRawRecord.screenCapture = extractorData.data[0].screenCapture;
            websiteRawRecord.urlInput = extractorData.url;
            websiteRawRecord.source = 'External';
            websiteRawRecord.dateScraped = new Date().toISOString().split('T')[0];

            return await this.processData(await this.webSitesDataRepository.save(websiteRawRecord));
        }

        throw new InternalServerErrorException('Something went wrong while scraping data from import.');
    }

    private getDataFromImportGroupFieldArray(arr: GroupEntityField[]): string {
        if (arr && arr.length > 1) return arr.map(a => a.text).join(';').substring(0, 499);
        return (arr && arr[0]?.text?.substring(0, 499)) || null;
    }

    public async getDataFromImport(domain: string, skipRecordCheck: boolean = false, limit: number = 1): Promise<WebsitesData[]> {
        try {
            if (!skipRecordCheck) {
                const existingRecords = await this.webSitesDataRepository
                    .createQueryBuilder('websiteData')
                    .where('websiteData.uri like :domain', { domain: `%${domain}%` })
                    .limit(limit)
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

    public async search(
        { domain, companyId }: { domain: string, companyId?: string },
        isLiveQuery: boolean = false,
        limit: number = 1,
        isForceLiveQuery: boolean = false,
    ): Promise<WebsitesData[]> {
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
                if (isForceLiveQuery) {
                    return await this.getDataFromImport(domain, true);
                }

                const result = await this.webSitesDataRepository
                    .createQueryBuilder('websiteData')
                    .where('websiteData.uri like :domain', { domain: `%${domain}%` })
                    .orderBy('websiteData.dateScraped', 'DESC')
                    .limit(limit)
                    .getMany();

                if (!result || !result.length) {
                    this.logger.log(`No existing domains found with given input -> ${domain}`);
                    if (isLiveQuery) {
                        return await this.getDataFromImport(domain, true);
                    }
                    throw new NotFoundException(`No website record found with domain -> ${domain}`);
                }

                return Promise.all(result.map(async r => await this.processData(r)));
            }
        } catch (err) {
            this.logger.error('Hmm, what happened here with the search!', err);
            if (err instanceof HttpException) {
                throw err;
            }
            throw new InternalServerErrorException('Something went wrong while fetching data for record with given details.', err);
        }
    }

    private async processData(websiteData: WebsitesData): Promise<WebsitesData> {
        const tempwebsiteDataObj = JSON.parse(JSON.stringify(websiteData));

        if (!tempwebsiteDataObj.applicationLdJson) {
            delete tempwebsiteDataObj.applicationLdJson;
            tempwebsiteDataObj.applicationLdJsonPresence = false;
        }

        if (websiteData.divClassMain) {
            delete tempwebsiteDataObj.divClassMain;
            delete tempwebsiteDataObj.divIdMain;
            tempwebsiteDataObj.divClassMainIsPopulated = true;
        }

        for (const key in tempwebsiteDataObj) {
            tempwebsiteDataObj[key] = await this.processField(key, tempwebsiteDataObj[key]);
        }

        return tempwebsiteDataObj;
    }

    private async processField(fieldName: string, fieldValue: any): Promise<FieldDetails> {
        const getAvgMsg = (avg, val): { msg: string, sentiment: string } => {
            let msg = '';
            let sentiment = config.BLUE_BG;
            if (Number(val) > Number(avg)) {
                msg = `Value is more than average ${avg}`;
                sentiment = config.RED_BG;
            } else {
                msg = `Value is less than average ${avg}`;
                sentiment = config.GREEN_BG;
            }
            return { msg, sentiment };
        };

        switch (fieldName) {
            case 'perfTimingSqlTime':
                const averageValuePerf = await this.getAverageValue(fieldName);
                return {
                    value: fieldValue,
                    displayName: 'Performance Time',
                    field: fieldName,
                    averageValue: averageValuePerf.average,
                    comment: getAvgMsg(averageValuePerf.average, fieldValue).msg,
                    sentiment: getAvgMsg(averageValuePerf.average, fieldValue).sentiment,
                }

            case 'gotResponseFromPreRenderTime':
                const averageValuePrerender = await this.getAverageValue(fieldName);
                return {
                    value: fieldValue,
                    displayName: 'Response From Pre-render Time',
                    field: fieldName,
                    averageValue: averageValuePrerender.average,
                    comment: getAvgMsg(averageValuePrerender.average, fieldValue).msg,
                    sentiment: getAvgMsg(averageValuePrerender.average, fieldValue).sentiment,
                }

            case 'SSPAppContext':
                return {
                    value: fieldValue,
                    displayName: fieldName,
                    field: fieldName,
                    comment: fieldValue.toLowerCase() === 'yes' ? null : '85% of SCA Site have this ON.',
                    sentiment: fieldValue.toLowerCase() === 'yes' ? config.GREEN_BG : config.RED_BG,
                }

            case 'isCnameMapped':
                return {
                    value: fieldValue,
                    displayName: 'Is CName Mapped',
                    field: fieldName,
                    comment: fieldValue.toLowerCase() === 'no' ? `CNAME is not correctly mapped` : null,
                    sentiment: fieldValue.toLowerCase() === 'no' ? config.RED_BG : config.GREEN_BG,
                }

            case 'consoleContent':
                return {
                    value: fieldValue,
                    displayName: 'Console Errors',
                    field: fieldName,
                    comment: fieldValue ? 'There are errors while rendering the webpage.' : null,
                    sentiment: fieldValue ? config.RED_BG : config.GREEN_BG,
                }

            case 'title':
                const badTitles = ['Welcome to the Store', 'Shopping', 'Page Not Found'];
                let isBadTitle = false;
                badTitles.forEach(c => {
                    if (fieldValue.toLowerCase().includes(c.toLocaleLowerCase())) {
                        isBadTitle = true;
                    }
                })
                return {
                    value: fieldValue,
                    displayName: this.getTitleCaseFromCamelCase(fieldName),
                    field: fieldName,
                    comment: isBadTitle ? 'Title doesn\'t seem accurate, please update to something more understandable.' : null,
                    sentiment: isBadTitle ? config.RED_BG : config.GREEN_BG,
                }

            case 'screenCapture':
                return {
                    value: fieldValue,
                    displayName: 'Screen Capture',
                    field: fieldName,
                    isLink: true,
                }

            case 'gotResponseFromPrerenderAttemptOne':
                return {
                    value: fieldValue,
                    field: fieldName,
                    disableField: true,
                };

            case 'gotResponseFromPrerenderAttemptTwo':
                return {
                    value: fieldValue,
                    field: fieldName,
                    disableField: true,
                };

            case 'gotResponseFromPrerenderAttemptThree':
                return {
                    value: fieldValue,
                    field: fieldName,
                    disableField: true,
                };

            case 'gotResponseFromPrerenderAttemptsAverage':
                let comment = '';
                let sentiment = config.GREEN_BG;

                if (fieldValue > 5000 && fieldValue < 7000) {
                    comment = 'One of the times(or more) used for the average was more than warning level, try to reduce this.'
                    sentiment = config.ORANGE_BG;
                } else if (fieldValue > 7000) {
                    comment = 'One of the times(or more) used for the average was more than alert level, try to reduce this.'
                    sentiment = config.RED_BG;
                }

                return {
                    value: fieldValue,
                    field: fieldName,
                    displayName: 'Prerender response time average',
                    helperText: 'From 3 back to back attempts',
                    sentiment,
                    comment,
                };

            case 'gotResponseFromPrerenderAttemptsAlertLevelValues':
                return {
                    value: fieldValue,
                    field: fieldName,
                    displayName: 'Prerender response alert level values',
                    comment: 'This is not good, please try to reduce the prerender times',
                    helperText: 'Collected alert level values from 3 back to back attempts',
                    sentiment: config.RED_BG,
                    disableField: fieldValue === '-',
                };

            case 'version':
                const safeVersionYears = ['2020', '2021', '2022'];
                const isSafeVersion = safeVersionYears.find(s => fieldValue.includes(s));
                return {
                    value: fieldValue,
                    field: fieldName,
                    displayName: 'Version',
                    comment: isSafeVersion ? '' : 'We highly recommend an upgrade to the latest version of SuiteCommerce',
                    helperText: 'SuiteCommerce version',
                    sentiment: isSafeVersion ? config.GREEN_BG : config.RED_BG,
                };

            default:
                return {
                    value: fieldValue,
                    displayName: this.getTitleCaseFromCamelCase(fieldName),
                    field: fieldName,
                    sentiment: config.WHITE_BG,
                };
        }
    }

    private getTitleCaseFromCamelCase(fieldName: string): string {
        const result = fieldName.replace(/([A-Z])/g, " $1");
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    public async searchForDomainAndStoreUserDetails(requestBody: SearchWebsiteRequest): Promise<WebsitesData[]> {
        try {
            await this.storeSearchDetailsInSheet(requestBody);
            return await this.search({ domain: requestBody.domain }, false, config.DEFAULT_RECORDS_COUNT, requestBody.queryLive);
        } catch (err) {
            this.logger.error('Hmm, what happened here with the search!', err);
            if (err instanceof HttpException) {
                throw err;
            }
            throw new InternalServerErrorException('Something went wrong while fetching data for record with given details.', err);
        }
    }

    private async getAverageValue(fieldName: string): Promise<any> {
        const tableAlias = 'webSiteData';
        this.logger.debug(`Pulling average value for -> ${fieldName}`);
        return await this.webSitesDataRepository.createQueryBuilder(tableAlias)
            .select(`AVG(${tableAlias}.${fieldName})`, 'average')
            .getRawOne();
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
