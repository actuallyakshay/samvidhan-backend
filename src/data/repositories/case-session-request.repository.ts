import { Injectable, Optional } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { CaseSessionRequestsEntity } from '../entities';

@Injectable()
export class CaseSessionRequestRepository extends Repository<CaseSessionRequestsEntity> {
  constructor(
    @Optional() _target: EntityTarget<CaseSessionRequestsEntity>,
    entityManager: EntityManager
  ) {
    super(CaseSessionRequestsEntity, entityManager);
  }
}
