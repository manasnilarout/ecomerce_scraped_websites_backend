import { Logger } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { renderFile } from 'pug';

import config from '../config';

export class RendererUtil {
  private templatePath: string = config.TEMPLATES_PATH;
  private readonly logger = new Logger(RendererUtil.name);

  public renderTemplate(templateName: string, argument: object): string {
    try {
      const templatePath: string = join(
        __dirname,
        config.DOUBLE_DOTS,
        this.templatePath,
        templateName.includes('pug') ? templateName : `${templateName}.pug`,
      );

      if (!existsSync(templatePath)) {
        throw new Error(`Template not found at ${templatePath}`);
      }

      return renderFile(templatePath, argument);
    } catch (err) {
      this.logger.error('Error while rendering the template', err);
      throw err;
    }
  }

  public static base64StringOfImage(imagePath: string): string {
    return 'data:image/png;base64,' + readFileSync(imagePath, 'base64');
  }
}
