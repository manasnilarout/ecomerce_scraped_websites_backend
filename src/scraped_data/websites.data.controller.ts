import { Controller, Get, Param, Query } from "@nestjs/common";

import { WebSitesDataService } from "./websites.data.service";
import { WebsitesData } from "./websites.data.entity";

@Controller('api/v1/websites_data')
export class WebSitesDataController {
    constructor(private websitesDataService: WebSitesDataService) { }

    @Get()
    async findAll(
        @Query('length') limit: number,
        @Query('start') offset: number,
        @Query('show_all') show_all: boolean,
    ): Promise<{ data: WebsitesData[]; recordsTotal: number; recordsFiltered: number; }> {
        return await this.websitesDataService.getScrapedData(limit, offset, show_all);
    }

    @Get('search')
    public async search(
        @Query('domain') domain: string,
        @Query('companyId') companyId: string,
        @Query('live') live: boolean,
    ): Promise<WebsitesData[]> {
        return await this.websitesDataService.search({ domain, companyId }, live);
    }

    @Get('search/live')
    public async searchLive(@Query('domain') domain: string): Promise<WebsitesData[]> {
        return await this.websitesDataService.getDataFromImport(domain);
    }

    @Get(':id(\\d+)')
    public async getById(@Param('id') id: number): Promise<WebsitesData> {
        return await this.websitesDataService.getById(id);
    }
}