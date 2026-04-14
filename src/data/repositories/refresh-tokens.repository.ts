import { Injectable, Optional } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { RefreshTokensEntity } from '../entities';

@Injectable()
export class RefreshTokensRepository extends Repository<RefreshTokensEntity> {
   constructor(@Optional() _target: EntityTarget<RefreshTokensEntity>, entityManager: EntityManager) {
      super(RefreshTokensEntity, entityManager);
   }
}
