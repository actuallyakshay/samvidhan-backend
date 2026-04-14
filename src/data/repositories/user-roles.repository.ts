import { Injectable, Optional } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { UserRolesEntity } from '../entities';

@Injectable()
export class UserRolesRepository extends Repository<UserRolesEntity> {
  constructor(
    @Optional() _target: EntityTarget<UserRolesEntity>,
    entityManager: EntityManager
  ) {
    super(UserRolesEntity, entityManager);
  }
}
