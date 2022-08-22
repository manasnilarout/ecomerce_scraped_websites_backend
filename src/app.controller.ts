import { Controller, Get, Res } from '@nestjs/common';

import { Response } from 'express';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  respondDefaultPage(@Res() res: Response) {
    return res.render('base', {filename: './public/index.html'});
  }
}
