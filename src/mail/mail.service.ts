import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export type SendAdminLoginOtpInput = {
  to: string[];
  requestingEmail: string;
  code: string;
  expiresMinutes: number;
};

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendAdminLoginOtp(input: SendAdminLoginOtpInput): Promise<void> {
    const { to, requestingEmail, code, expiresMinutes } = input;
    if (!to.length) {
      throw new InternalServerErrorException('No OTP email recipients');
    }

    const text = [
      `Admin sign-in OTP request`,
      ``,
      `Someone (${requestingEmail}) is signing in to the admin panel.`,
      `Code: ${code}`,
      `Valid for ${expiresMinutes} minute(s).`,
      ``,
      `Share this code with them only if you approve this sign-in.`,
    ].join('\n');

    const html = `
      <p><strong>Admin sign-in OTP</strong></p>
      <p>Someone (<strong>${requestingEmail}</strong>) is signing in to the admin panel.</p>
      <p style="font-size:24px;letter-spacing:4px;font-family:monospace;"><strong>${code}</strong></p>
      <p>Valid for <strong>${expiresMinutes}</strong> minute(s).</p>
      <p style="color:#666;font-size:13px;">Share this code only if you approve this sign-in.</p>
    `;

    try {
      await this.mailerService.sendMail({
        to,
        subject: `Admin OTP for ${requestingEmail}`,
        text,
        html,
      });
    } catch (error) {
      console.error('OTP email error:', error);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }
}
