import {
  BadRequestException,
  Controller,
  Get,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IJwtPayload } from 'src/types';
import { AssetsService } from './assets.service';
import { PushNotificationService } from 'src/push/push-notification.service';

@Controller('assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Assets')
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly pushNotificationService: PushNotificationService
  ) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadAsset(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 })
        .build({ fileIsRequired: true })
    )
    file: any,
    @CurrentUser() user: IJwtPayload
  ) {
    if (!file.mimetype) {
      throw new BadRequestException('Invalid file upload');
    }
    return this.assetsService.uploadAsset({ userId: user.sub, file });
  }
}
