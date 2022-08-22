import { Controller, Get, Query } from "@nestjs/common";

import { WebSitesDataService } from "./websites.data.service";
import { WebsitesData } from "./websites.data.entity";

@Controller('api/v1/websites_data')
export class WebSitesDataController {
    constructor(private websitesDataService: WebSitesDataService) { }

    @Get()
    async findAll(
        @Query('limit') limit: number,
        @Query('offset') offset: number,
        @Query('show_all') show_all: boolean,
        ): Promise<{ data: WebsitesData[]; count: number; }> {
        return await this.websitesDataService.getScrapedData(limit, offset, show_all);
    }
}