import { Injectable, Optional } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository, SelectQueryBuilder } from 'typeorm';
import { CaseNotesEntity } from '../entities';
import { PaginationInputDto, getPageValues } from '../dto';
import { GetInternalNotesQueryDto } from 'src/cases/dto';

@Injectable()
export class CaseNotesRepository extends Repository<CaseNotesEntity> {
  constructor(@Optional() _target: EntityTarget<CaseNotesEntity>, entityManager: EntityManager) {
    super(CaseNotesEntity, entityManager);
  }

  async getInternalNotesQuery(input: { caseId: string; query: GetInternalNotesQueryDto }) {
    const { caseId, query } = input;
    const { skip, take } = getPageValues(query);
    const qb = this.createQueryBuilder('cn').where('cn.caseId = :caseId', { caseId });

    if (query.author) {
      qb.andWhere('cn.author = :author', { author: query.author });
    }

    qb.orderBy('cn.createdAt', 'DESC');
    qb.skip(skip).take(take);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}
