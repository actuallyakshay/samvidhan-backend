import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IJwtPayload } from 'src/types';
import { UpdateUserInput } from './dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: IJwtPayload) {
    return this.usersService.me({ userId: user.sub, activeRole: user.activeRole });
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  getUserAnalytics(@CurrentUser() user: IJwtPayload) {
    return this.usersService.getUserAnalytics({ userId: user.sub });
  }

  @Patch('update-fcm-token')
  updateFcmToken(@Body() body: { fcmToken: string }, @CurrentUser() user: IJwtPayload) {
    return this.usersService.updateFcmToken({ userId: user.sub, body });
  }

  @Patch()
  updateMe(@Body() body: UpdateUserInput, @CurrentUser() user: IJwtPayload) {
    return this.usersService.updateUser({ userId: user.sub, body });
  }
}
