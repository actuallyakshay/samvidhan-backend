import { BadRequestException, Injectable } from '@nestjs/common';
import { SubscriptionPlansRepository } from 'src/data/repositories';
import { CreateSubscriptionPlanInput } from './dto/create-subsciption.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly spRepository: SubscriptionPlansRepository) {}

  getAllSubscriptionPlans() {
    return this.spRepository.find({
      where: { isActive: true },
    });
  }

  async createSubscriptionPlan(input: CreateSubscriptionPlanInput) {
    const existingPlan = await this.spRepository.findOneBy({ name: input.name });
    if (existingPlan) {
      throw new BadRequestException('Subscription plan with this name already exists');
    }
    const slug = this.createSlug();
    return this.spRepository.save({
      ...input,
      slug,
    });
  }

  createSlug() {
    const randomString = Math.random().toString(36).substring(2, 15);
    return `SP-${randomString}`;
  }
}
