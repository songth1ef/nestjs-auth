/**
 * 验证码邮件模板
 */
export interface VerificationCodeTemplateData {
  code: string;
  appName: string;
  expiry?: number; // 有效期（分钟）
}

/**
 * 生成验证码邮件HTML内容
 */
export function generateVerificationHtml(
  data: VerificationCodeTemplateData,
  lang: string,
): string {
  const { code, appName, expiry = 10 } = data;

  if (lang === 'zh') {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">密码重置</h2>
        <p><strong>${code} 是你的验证码</strong></p>
        <p>您好，</p>
        <p>您正在请求重置密码。请使用上面的验证码完成密码重置流程：</p>
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>此验证码将在${expiry}分钟内有效。</p>
        <p>如果您没有请求重置密码，请忽略此邮件。</p>
        <p>谢谢，</p>
        <p>${appName} 团队</p>
      </div>
    `;
  } else {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Password Reset</h2>
        <p><strong>${code} is your verification code</strong></p>
        <p>Hello,</p>
        <p>You have requested to reset your password. Please use the code above to complete the password reset process:</p>
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>This verification code will be valid for ${expiry} minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Thank you,</p>
        <p>${appName} Team</p>
      </div>
    `;
  }
}

/**
 * 生成验证码邮件纯文本内容
 */
export function generateVerificationText(
  data: VerificationCodeTemplateData,
  lang: string,
): string {
  const { code, appName, expiry = 10 } = data;

  if (lang === 'zh') {
    return `${code} 是你的验证码

您好，

您正在请求重置密码。请使用上面的验证码完成密码重置流程。
此验证码将在${expiry}分钟内有效。

如果您没有请求重置密码，请忽略此邮件。

谢谢，
${appName} 团队`;
  } else {
    return `${code} is your verification code

Hello,

You have requested to reset your password. Please use the code above to complete the password reset process.
This verification code will be valid for ${expiry} minutes.

If you did not request a password reset, please ignore this email.

Thank you,
${appName} Team`;
  }
}

/**
 * 生成邮件主题
 */
export function generateSubject(
  data: VerificationCodeTemplateData,
  lang: string,
): string {
  const { code, appName } = data;
  return lang === 'zh'
    ? `${code}是你的验证码 - ${appName}`
    : `${code} is your verification code - ${appName}`;
} 