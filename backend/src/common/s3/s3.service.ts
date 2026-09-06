import {
  BadRequestException,
  Injectable,
  Logger,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.getOrThrow<string>('AWS_S3_ISSUE_PHOTOS_BUCKET');
    this.client = new S3Client({
      region: this.config.getOrThrow<string>('AWS_REGION'),
    });
  }

  /**
   * Validates the file server-side (never trusts the client's declared
   * mimetype/extension alone — checks the actual buffer size and the
   * mimetype Multer detected from content) and uploads to S3. Returns only
   * the resulting URL; the caller must not accept a client-supplied path.
   */
  async uploadIssuePhoto(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Allowed: jpeg, png, webp.`,
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new PayloadTooLargeException(
        `File exceeds ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB limit`,
      );
    }

    const extension = file.mimetype.split('/')[1];
    const key = `issue-photos/${randomUUID()}.${extension}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (err) {
      this.logger.error('S3 upload failed', err as Error);
      throw err;
    }

    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }
}
