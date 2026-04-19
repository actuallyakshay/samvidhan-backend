import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { AdminOtpChallengesRepository } from 'src/data/repositories';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AdminOtpService {
  constructor(
    private readonly challengesRepo: AdminOtpChallengesRepository,
    private readonly mailService: MailService,
    private readonly configService: ConfigService
  ) {}

  private expiryMs(): number {
    const min = parseInt(this.configService.get('ADMIN_OTP_EXPIRY_MINUTES') || '10', 10) || 10;
    return Math.max(1, min) * 60 * 1000;
  }


  async sendChallenge(
    userId: string,
    requestingEmail: string
  ): Promise<{ expiresInSeconds: number }> {

    await this.challengesRepo.delete({ userId });

    const code = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + this.expiryMs());

    await this.challengesRepo.save({ userId, otpHash, expiresAt });

    const expiresMinutes = Math.max(1, Math.round(this.expiryMs() / 60000));
    await this.mailService.sendAdminLoginOtp({
      requestingEmail,
      code,
      expiresMinutes,
    });

    return { expiresInSeconds: Math.floor(this.expiryMs() / 1000) };
  }

  async verifyAndConsume(userId: string, otp: string): Promise<boolean> {
    const row = await this.challengesRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    if (!row || row.expiresAt.getTime() < Date.now()) {
      if (row) {
        await this.challengesRepo.delete({ id: row.id });
      }
      return false;
    }
    const hash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    if (hash !== row.otpHash) {
      return false;
    }
    await this.challengesRepo.delete({ id: row.id });
    return true;
  }
}
