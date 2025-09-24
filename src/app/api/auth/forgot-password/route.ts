import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
      }
    });

    // 为了安全起见，即使用户不存在也返回成功消息
    // 这样可以防止邮箱枚举攻击
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.',
      });
    }

    // 删除该用户之前的未使用的重置令牌
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
      }
    });

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1小时后过期

    // 保存重置令牌到数据库
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      }
    });

    // 发送重置邮件
    const emailResult = await sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name || user.username
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again later.' },
        { status: 500 }
      );
    }

    // 在开发环境中返回预览链接
    const response: {
      success: boolean;
      message: string;
      previewUrl?: string;
    } = {
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    };

    if (process.env.NODE_ENV === 'development' && emailResult.previewUrl) {
      response.previewUrl = emailResult.previewUrl;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process password reset request. Please try again.' },
      { status: 500 }
    );
  }
}
