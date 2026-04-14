import { Injectable, Optional } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { AdminOtpChallengeEntity } from '../entities/admin-otp-challenge.entity';

@Injectable()
export class AdminOtpChallengesRepository extends Repository<AdminOtpChallengeEntity> {
  constructor(@Optional() _target: EntityTarget<AdminOtpChallengeEntity>, entityManager: EntityManager) {
    super(AdminOtpChallengeEntity, entityManager);
  }
}
