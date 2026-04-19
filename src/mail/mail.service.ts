import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export type SendAdminLoginOtpInput = {
  requestingEmail: string;
  code: string;
  expiresMinutes: number;
};

@Injectable()
export class MailService {
  private readonly resend: Resend;
  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.getOrThrow<string>('RESEND_API_KEY'));
  }

  async sendAdminLoginOtp(input: SendAdminLoginOtpInput): Promise<void> {
    const {  requestingEmail, code, expiresMinutes } = input;
  

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
      const { data, error } = await this.resend.emails.send({
        from : 'akshay.rajput1197@gmail.com',
        to:['akshay.rajput1197@gmail.com'],
        subject: `Admin OTP for ${requestingEmail}`,
        text,
        html,
      });

      if (error) {
        console.error('Resend API error:', error);
        throw new InternalServerErrorException(
          typeof error.message === 'string' ? error.message : 'Failed to send OTP email',
        );
      }

      console.log('OTP email sent', data?.id ?? data);
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      console.error('OTP email error:', error);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }
}

