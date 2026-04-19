import { Injectable, Optional } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { UserSubscriptionsEntity } from '../entities';

@Injectable()
export class UserSubscriptionsRepository extends Repository<UserSubscriptionsEntity> {
  constructor(
    @Optional() _target: EntityTarget<UserSubscriptionsEntity>,
    entityManager: EntityManager,
  ) {
    super(UserSubscriptionsEntity, entityManager);
  }
}
