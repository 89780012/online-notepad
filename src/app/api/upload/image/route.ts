import { NextRequest, NextResponse } from 'next/server';
import { r2Service, type ImageUploadResult } from '@/lib/cloudflare-r2';
import { z } from 'zod';

// 请求验证 schema
const uploadSchema = z.object({
  file: z.instanceof(File),
  options: z.object({
    maxWidth: z.number().optional(),
    maxHeight: z.number().optional(),
    quality: z.number().min(1).max(100).optional(),
    format: z.enum(['webp', 'jpeg', 'png']).optional(),
  }).optional(),
});

interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    filename: string;
    size: number;
    contentType: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  error?: string;
}

/**
 * POST /api/upload/image
 * 上传图片到 Cloudflare R2
 */
export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    // 检查请求类型
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json({
        success: false,
        error: '请求必须是 multipart/form-data 格式',
      }, { status: 400 });
    }

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const optionsStr = formData.get('options') as string | null;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: '没有找到要上传的文件',
      }, { status: 400 });
    }

    // 解析选项参数
    let options = {};
    if (optionsStr) {
      try {
        options = JSON.parse(optionsStr);
      } catch {
        return NextResponse.json({
          success: false,
          error: '选项参数格式错误',
        }, { status: 400 });
      }
    }

    // 验证请求数据
    const validation = uploadSchema.safeParse({
      file,
      options,
    });

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: `请求参数验证失败: ${validation.error.message}`,
      }, { status: 400 });
    }

    // 转换文件为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 上传到 R2
    const result: ImageUploadResult = await r2Service.uploadImage(
      fileBuffer,
      file.name,
      file.type,
      validation.data.options
    );

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || '上传失败',
      }, { status: 400 });
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        url: result.url!,
        filename: result.metadata.filename,
        size: result.metadata.size,
        contentType: result.metadata.contentType,
        dimensions: result.metadata.dimensions,
      },
    });

  } catch (error) {
    console.error('图片上传 API 错误:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误',
    }, { status: 500 });
  }
}

/**
 * GET /api/upload/image
 * 获取上传配置信息
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ],
    supportedFormats: ['webp', 'jpeg', 'png'],
    defaultQuality: 85,
  });
}