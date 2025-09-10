/**
 * Cloudflare R2 Storage Service
 * 用于上传和管理图片文件到 Cloudflare R2 存储桶
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  metadata: {
    filename: string;
    originalFilename: string;
    size: number;
    contentType: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export class CloudflareR2Service {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    // 验证环境变量
    this.validateEnvironment();

    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
    this.publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  private validateEnvironment(): void {
    const requiredEnvVars = [
      'CLOUDFLARE_R2_ACCESS_KEY_ID',
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
      'CLOUDFLARE_R2_BUCKET_NAME',
      'CLOUDFLARE_R2_ENDPOINT',
      'CLOUDFLARE_R2_PUBLIC_URL',
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  /**
   * 生成唯一的文件路径
   */
  private generateFilePath(originalFilename: string): string {
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const fileId = nanoid(8);
    const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
    
    return `images/${timestamp}/${fileId}.${extension}`;
  }

  /**
   * 验证图片文件类型
   */
  private validateImageFile(file: Buffer, contentType: string): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/webp',
      'image/gif'
    ];

    if (!allowedTypes.includes(contentType)) {
      return false;
    }

    // 简单的文件头验证（Magic Numbers）
    const magicNumbers = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
      'image/gif': [0x47, 0x49, 0x46, 0x38], // GIF8
    };

    const signature = magicNumbers[contentType as keyof typeof magicNumbers];
    if (signature) {
      for (let i = 0; i < signature.length; i++) {
        if (file[i] !== signature[i]) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 上传图片到 Cloudflare R2
   */
  async uploadImage(
    fileBuffer: Buffer,
    originalFilename: string,
    contentType: string,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      // TODO: 将来使用 options 参数进行图片处理优化
      // 如：options.maxWidth, options.quality, options.format 等
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const imageOptions = options;
      
      // 验证文件
      if (!this.validateImageFile(fileBuffer, contentType)) {
        return {
          success: false,
          error: '不支持的文件类型或文件已损坏',
          metadata: {
            filename: '',
            originalFilename,
            size: fileBuffer.length,
            contentType,
          }
        };
      }

      // 检查文件大小 (最大 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (fileBuffer.length > maxSize) {
        return {
          success: false,
          error: '文件大小超过 5MB 限制',
          metadata: {
            filename: '',
            originalFilename,
            size: fileBuffer.length,
            contentType,
          }
        };
      }

      // 生成文件路径
      const filePath = this.generateFilePath(originalFilename);
      
      // 上传到 R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: contentType,
        CacheControl: 'max-age=31536000', // 1年缓存
        Metadata: {
          originalFilename,
          uploadedAt: new Date().toISOString(),
        }
      });

      await this.client.send(command);

      // 构造公共访问URL
      const publicUrl = `${this.publicUrl}/${filePath}`;

      return {
        success: true,
        url: publicUrl,
        metadata: {
          filename: filePath,
          originalFilename,
          size: fileBuffer.length,
          contentType,
        }
      };

    } catch (error) {
      console.error('图片上传失败:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败',
        metadata: {
          filename: '',
          originalFilename,
          size: fileBuffer.length,
          contentType,
        }
      };
    }
  }

  /**
   * 删除图片 (可选功能)
   */
  async deleteImage(filePath: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
      });

      await this.client.send(command);
      
      return true;
    } catch (error) {
      console.error('图片删除失败:', error);
      return false;
    }
  }

  /**
   * 生成预签名URL (用于前端直接上传)
   */
  async generatePresignedUrl(
    filename: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    try {
      const filePath = this.generateFilePath(filename);
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
        ContentType: contentType,
      });

      const presignedUrl = await getSignedUrl(this.client, command, {
        expiresIn,
      });

      return presignedUrl;
    } catch (error) {
      console.error('生成预签名URL失败:', error);
      return null;
    }
  }
}

// 单例实例
export const r2Service = new CloudflareR2Service();