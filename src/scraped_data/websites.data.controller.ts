import { Controller, Get, Header, Param, Query } from "@nestjs/common";

import { WebSitesDataService } from "./websites.data.service";
import { WebsitesData } from "./websites.data.entity";
import config from "../config";
import { RendererUtil } from "../utils/template.render.util";

@Controller('api/v1/websites_data')
export class WebSitesDataController {
    private renderer: RendererUtil;
    constructor(private websitesDataService: WebSitesDataService) {
        this.renderer = new RendererUtil();
    }

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
        @Query('htmlResponse') htmlResponse: boolean,
    ): Promise<WebsitesData[] | void | any> {
        const jsonResponse = await this.websitesDataService.search({ domain, companyId }, live);

        if (htmlResponse) {
            return this.renderer.renderTemplate(
                config.WEBSITE_DATA_HTML_TEMPLATE,
                { domain, entries: Object.entries(jsonResponse[0]) }
            );
        }

        return jsonResponse;
    }

    @Get('search/page')
    @Header('Content-Type', 'text/html')
    public async searchPage(
        @Query('domain') domain: string,
    ): Promise<WebsitesData[] | void | any> {
        const jsonResponse = await this.websitesDataService.search({ domain, companyId: undefined }, true);

        return this.renderer.renderTemplate(
            config.WEBSITE_DATA_HTML_TEMPLATE,
            { domain, entries: Object.entries(jsonResponse[0]) }
        );
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