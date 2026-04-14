import { Injectable, Optional } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { AdminSettingsEntity } from '../entities';

@Injectable()
export class AdminSettingsRepository extends Repository<AdminSettingsEntity> {
  constructor(
    @Optional() _target: EntityTarget<AdminSettingsEntity>,
    entityManager: EntityManager
  ) {
    super(AdminSettingsEntity, entityManager);
  }
}
