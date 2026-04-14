import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionPlanInput } from './dto/create-subsciption.dto';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  getAllSubscriptionPlans() {
    return this.subscriptionsService.getAllSubscriptionPlans();
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @Post()
  createSubscriptionPlan(@Body() input: CreateSubscriptionPlanInput) {
    return this.subscriptionsService.createSubscriptionPlan(input);
  }
}
