import { Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GcpStorageService {
  private storage: Storage;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('STORAGE_BUCKET') || '';

    const serviceAccountJson = this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_KEY_JSON');
    this.storage = new Storage({ credentials: JSON.parse(serviceAccountJson) });
  }

  async uploadFileOnBucket(input: { fileName: string; buffer: Buffer; contentType: string }) {
    const { fileName, buffer, contentType } = input;
    const url = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;

    await this.storage
      .bucket(this.bucketName)
      .file(fileName)
      .save(buffer, {
        contentType,
        metadata: { cacheControl: 'public, max-age=31536000' },
      });

    return { url };
  }
}
