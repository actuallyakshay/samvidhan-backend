import { Injectable, Optional } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository, SelectQueryBuilder } from 'typeorm';
import { CasesEntity } from '../entities';
import { getPageValues, PaginationInputDto, SortOrder } from '../dto/pagination.dto';

interface CasesFilterParams {
  search?: string;
  status?: string;
}

@Injectable()
export class CasesRepository extends Repository<CasesEntity> {
  constructor(@Optional() _target: EntityTarget<CasesEntity>, entityManager: EntityManager) {
    super(CasesEntity, entityManager);
  }

  getUserCasesQuery(input: {
    userId: string;
    filters: CasesFilterParams;
  }): SelectQueryBuilder<CasesEntity> {
    const { userId, filters } = input;

    const qb = this.createQueryBuilder('c')
      .leftJoinAndSelect('c.practiceArea', 'practiceArea')
      .leftJoin('c.assignedLawyer', 'assignedLawyer')
      .addSelect(['assignedLawyer.id', 'assignedLawyer.userId'])
      .leftJoin('assignedLawyer.user', 'lawyerUser')
      .addSelect(['lawyerUser.id', 'lawyerUser.fullName', 'lawyerUser.avatarUrl'])
      .where('c.user_id = :userId', { userId });

    this.applyFilters(qb, filters);
    return qb;
  }

  getLawyerCasesQuery(input: {
    lawyerId: string;
    filters: CasesFilterParams;
  }): SelectQueryBuilder<CasesEntity> {
    const { lawyerId, filters } = input;

    const qb = this.createQueryBuilder('c')
      .leftJoinAndSelect('c.practiceArea', 'practiceArea')
      .leftJoin('c.user', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.avatarUrl'])
      .where('c.assigned_lawyer_id = :lawyerId', { lawyerId });

    this.applyFilters(qb, filters);
    return qb;
  }

  async findPaginated(
    qb: SelectQueryBuilder<CasesEntity>,
    pagination: PaginationInputDto
  ): Promise<{ data: CasesEntity[]; total: number }> {
    const { skip, take } = getPageValues(pagination);

    const orderBy = pagination.orderBy || 'createdAt';
    const order = pagination.order || SortOrder.DESC;
    qb.orderBy(`c.${orderBy}`, order);

    qb.skip(skip).take(take);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  private applyFilters(qb: SelectQueryBuilder<CasesEntity>, filters: CasesFilterParams): void {
    if (filters.search) {
      qb.andWhere('(c.title ILIKE :search OR c.case_code ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    if (filters.status) {
      qb.andWhere('c.status = :status', { status: filters.status });
    }
  }

  getAdminCasesQuery(input: {
    search?: string;
    status?: string;
    practiceAreaId?: string;
  }): SelectQueryBuilder<CasesEntity> {
    const { search, status, practiceAreaId } = input;

    const qb = this.createQueryBuilder('c')
      .leftJoinAndSelect('c.practiceArea', 'practiceArea')
      .leftJoin('c.user', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.email'])
      .leftJoin('c.assignedLawyer', 'assignedLawyer')
      .leftJoin('assignedLawyer.user', 'lawyerUser')
      .addSelect(['assignedLawyer.id', 'lawyerUser.id', 'lawyerUser.fullName']);

    if (search) {
      qb.andWhere(
        '(c.title ILIKE :search OR c.case_code ILIKE :search OR user.full_name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      qb.andWhere('c.status = :status', { status });
    }

    if (practiceAreaId) {
      qb.andWhere('c.practice_area_id = :practiceAreaId', { practiceAreaId });
    }

    return qb;
  }
}
