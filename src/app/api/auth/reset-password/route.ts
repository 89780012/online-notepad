import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // 查找重置令牌
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validatedData.token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          }
        }
      }
    });

    // 验证令牌
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token.' },
        { status: 400 }
      );
    }

    // 检查令牌是否已过期
    if (resetToken.expiresAt < new Date()) {
      // 删除过期的令牌
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });
      
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // 检查令牌是否已使用
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used.' },
        { status: 400 }
      );
    }

    // 哈希新密码
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // 在事务中更新密码并标记令牌为已使用
    await prisma.$transaction(async (tx) => {
      // 更新用户密码
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      });

      // 标记令牌为已使用
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      });

      // 删除该用户所有其他未使用的重置令牌
      await tx.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          used: false,
          id: { not: resetToken.id }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}

// 验证重置令牌（不重置密码，只检查令牌有效性）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    // 查找重置令牌
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            email: true,
            username: true,
          }
        }
      }
    });

    if (!resetToken) {
      return NextResponse.json(
        { valid: false, error: 'Invalid reset token.' },
        { status: 400 }
      );
    }

    // 检查令牌是否已过期
    if (resetToken.expiresAt < new Date()) {
      // 删除过期的令牌
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });
      
      return NextResponse.json(
        { valid: false, error: 'Reset token has expired.' },
        { status: 400 }
      );
    }

    // 检查令牌是否已使用
    if (resetToken.used) {
      return NextResponse.json(
        { valid: false, error: 'Reset token has already been used.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        email: resetToken.user.email,
        username: resetToken.user.username,
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate reset token.' },
      { status: 500 }
    );
  }
}
