import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IJwtPayload } from 'src/types';
import { UpdateUserInput } from './dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: IJwtPayload) {
    return await this.usersService.me({ userId: user.sub, activeRole: user.activeRole });
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  getUserAnalytics(@CurrentUser() user: IJwtPayload) {
    return this.usersService.getUserAnalytics({ userId: user.sub });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-fcm-token')
  updateFcmToken(@Body() body: { fcmToken: string }, @CurrentUser() user: IJwtPayload) {
    return this.usersService.updateFcmToken({ userId: user.sub, body });
  }

  @Patch()
  updateMe(@Body() body: UpdateUserInput, @CurrentUser() user: IJwtPayload) {
    return this.usersService.updateUser({ userId: user.sub, body });
  }
}
