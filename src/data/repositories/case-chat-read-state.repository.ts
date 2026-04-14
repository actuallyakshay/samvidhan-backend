import { Injectable, Optional } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { CaseChatReadStateEntity } from '../entities/case-chat-read-state.entity';

@Injectable()
export class CaseChatReadStateRepository extends Repository<CaseChatReadStateEntity> {
  constructor(
    @Optional() _target: EntityTarget<CaseChatReadStateEntity>,
    entityManager: EntityManager
  ) {
    super(CaseChatReadStateEntity, entityManager);
  }
}
