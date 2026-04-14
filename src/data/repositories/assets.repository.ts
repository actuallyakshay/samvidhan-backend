import { Injectable, Optional } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { AssetsEntity } from '../entities';
import { getPageValues } from '../dto';
import { GetCasesDocumentsQueryDto } from 'src/cases/dto';

@Injectable()
export class AssetsRepository extends Repository<AssetsEntity> {
  constructor(@Optional() _target: EntityTarget<AssetsEntity>, entityManager: EntityManager) {
    super(AssetsEntity, entityManager);
  }

  async getCasesDocumentsQuery(input: { caseId: string; query: GetCasesDocumentsQueryDto }) {
    const { caseId, query } = input;
    const { skip, take } = getPageValues(query);
    const qb = this.createQueryBuilder('a').where('a.caseId = :caseId', { caseId });
    qb.orderBy('a.createdAt', 'DESC');
    qb.skip(skip).take(take);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}
