import { Controller, Get } from "@nestjs/common";

import { WebSitesDataService } from "./websites.data.service";
import { WebsitesData } from "./websites.data.entity";

@Controller('api/v1/websites_data')
export class WebSitesDataController {
    constructor(private websitesDataService: WebSitesDataService) { }

    @Get()
    async findAll(): Promise<WebsitesData> {
        return await this.websitesDataService.getScrapedData();
    }
}