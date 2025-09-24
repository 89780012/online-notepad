import { Resend } from 'resend';

// 创建Resend实例
const createResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('RESEND_API_KEY not found. Email sending will be simulated in development mode.');
      return null;
    }
    throw new Error('RESEND_API_KEY environment variable is required');
  }
  
  return new Resend(apiKey);
};

// 发送密码重置邮件
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  username: string
) {
  try {
    const resend = createResendClient();
    
    // 开发环境模拟邮件发送
    if (!resend) {
      console.log('=== 开发环境 - 模拟邮件发送 ===');
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      console.log(`收件人: ${email}`);
      console.log(`用户名: ${username}`);
      console.log(`重置链接: ${resetUrl}`);
      console.log('=================================');
      
      return {
        success: true,
        messageId: `dev-${Date.now()}`,
        previewUrl: resetUrl, // 在开发环境中返回重置链接
      };
    }

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset Your Password - Mini Notepad',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: #ffffff;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
              border: 1px solid #e2e8f0;
            }
            .logo {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo h1 {
              color: #2563eb;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              margin-bottom: 30px;
            }
            .content h2 {
              color: #1e293b;
              font-size: 24px;
              margin-bottom: 16px;
            }
            .button {
              display: inline-block;
              background: #2563eb;
              color: white !important;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              margin: 24px 0;
              transition: background-color 0.2s;
            }
            .button:hover {
              background: #1d4ed8;
            }
            .link-text {
              word-break: break-all;
              color: #2563eb;
              background: #f1f5f9;
              padding: 12px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 14px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              font-size: 14px;
              color: #64748b;
            }
            .warning {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
            }
            .warning strong {
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>📝 Mini Notepad</h1>
            </div>
            
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>Hi <strong>${username}</strong>,</p>
              <p>We received a request to reset your password for your Mini Notepad account. If you made this request, click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <div class="link-text">${resetUrl}</div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
              </div>
              
              <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
            </div>
            
            <div class="footer">
              <p>This email was sent by Mini Notepad. If you have any questions, please contact our support team.</p>
              <p>© ${new Date().getFullYear()} Mini Notepad. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Reset Your Password - Mini Notepad

Hi ${username},

We received a request to reset your password for your Mini Notepad account.

If you made this request, please visit the following link to reset your password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
Mini Notepad Team`,
    });
    
    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

// 验证邮件配置
export function validateEmailConfig() {
  const hasResend = process.env.RESEND_API_KEY;
  const isDev = process.env.NODE_ENV === 'development';
  
  return hasResend || isDev;
}
