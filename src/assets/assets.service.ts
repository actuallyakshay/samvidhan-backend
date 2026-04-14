import { Injectable } from '@nestjs/common';
import { GcpStorageService } from 'src/gcp-service/gcp.service';

@Injectable()
export class AssetsService {
  constructor(private readonly gcpStorageService: GcpStorageService) {}

  async uploadAsset(input: { userId: string; file: any }) {
    const { userId, file } = input;

    const safeName = (file.originalname || 'file').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const fileName = `assets/${userId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const uploaded = await this.gcpStorageService.uploadFileOnBucket({
      fileName,
      buffer: file.buffer,
      contentType: file.mimetype || 'application/octet-stream',
    });

    return {
      assetUrl: uploaded.url,
      assetType: file?.mimetype?.split('/')[1] || 'image',
      assetName: file.originalname,
    };
  }
}
