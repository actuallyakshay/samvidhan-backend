import { Injectable, Optional } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { LawyerDocumentsEntity } from '../entities';

@Injectable()
export class LawyerDocumentsRepository extends Repository<LawyerDocumentsEntity> {
  constructor(
    @Optional() _target: EntityTarget<LawyerDocumentsEntity>,
    entityManager: EntityManager
  ) {
    super(LawyerDocumentsEntity, entityManager);
  }
}
