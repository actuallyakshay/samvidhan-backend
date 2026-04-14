import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthGuard implements CanActivate {
   private readonly googleClient: OAuth2Client;

   constructor(private readonly configService: ConfigService) {
      this.googleClient = new OAuth2Client(this.configService.getOrThrow('GOOGLE_CLIENT_ID'));
   }

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const { idToken } = request.body;

      if (!idToken) throw new UnauthorizedException('Missing Google ID token');

      const ticket = await this.googleClient.verifyIdToken({
         idToken,
         audience: this.configService.getOrThrow('GOOGLE_CLIENT_ID'),
      }).catch(() => {
         throw new UnauthorizedException('Invalid Google token');
      });

      const payload = ticket.getPayload();
      if (!payload?.email) throw new UnauthorizedException('Invalid Google token payload');

      request.googleUser = payload;
      return true;
   }
}
