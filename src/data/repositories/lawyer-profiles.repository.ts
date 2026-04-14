import { Injectable, Optional } from '@nestjs/common';
import { RoleCode, UserRoleStatus } from 'src/enums';
import { EntityManager, EntityTarget, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationInputDto, SortOrder, getPageValues } from '../dto/pagination.dto';
import { LawyerProfilesEntity } from '../entities';

@Injectable()
export class LawyerProfilesRepository extends Repository<LawyerProfilesEntity> {
  constructor(
    @Optional() _target: EntityTarget<LawyerProfilesEntity>,
    entityManager: EntityManager
  ) {
    super(LawyerProfilesEntity, entityManager);
  }

  getVerifiedLawyersQuery(): SelectQueryBuilder<LawyerProfilesEntity> {
    const qb = this.createQueryBuilder('lp')
      .select([
        'lp.id',
        'lp.userId',
        'lp.degree',
        'lp.barCouncilId',
        'lp.careerStartDate',
        'lp.bio',
        'lp.gender',
        'lp.createdAt',
        'lp.updatedAt',
      ])
      .innerJoin('lp.user', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.avatarUrl'])
      .innerJoin('user.userRoles', 'ur')
      .leftJoinAndSelect('lp.lawyerPracticeAreas', 'lpa')
      .leftJoinAndSelect('lpa.practiceArea', 'practiceArea')
      .where('ur.status = :roleStatus', { roleStatus: UserRoleStatus.ACTIVE })
      .andWhere('ur.roleCode = :roleCode', { roleCode: RoleCode.LAWYER });

    return qb;
  }

  getAdminLawyersQuery(input: {
    search?: string;
    practiceAreaId?: string;
    roleStatus?: UserRoleStatus;
  }): SelectQueryBuilder<LawyerProfilesEntity> {
    const { search, practiceAreaId, roleStatus } = input;

    const qb = this.createQueryBuilder('lp')
      .select([
        'lp.id',
        'lp.careerStartDate',
        'lp.barCouncilId',
        'lp.createdAt',
        'lp.degree',
        'lp.bio',
        'lp.gender',
      ])
      .innerJoin('lp.user', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.email', 'user.phone', 'user.avatarUrl'])
      .innerJoinAndMapOne('user.userRole', 'user.userRoles', 'ur', 'ur.role_code = :roleCode', {
        roleCode: RoleCode.LAWYER,
      })
      .leftJoin('lp.lawyerPracticeAreas', 'lpa')
      .addSelect(['lpa.id', 'lpa.practiceAreaId'])
      .leftJoin('lpa.practiceArea', 'practiceArea')
      .addSelect(['practiceArea.id', 'practiceArea.name']);

    if (search) {
      qb.andWhere('(user.full_name ILIKE :search OR lp.bar_council_id ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (practiceAreaId) {
      qb.andWhere('lpa.practice_area_id = :practiceAreaId', { practiceAreaId });
    }

    if (roleStatus) {
      qb.andWhere('ur.status = :roleStatus', {
        roleStatus: roleStatus,
      });
    }

    return qb;
  }

  async findPaginated(
    qb: SelectQueryBuilder<LawyerProfilesEntity>,
    pagination: PaginationInputDto
  ): Promise<{ data: LawyerProfilesEntity[]; total: number }> {
    const { skip, take } = getPageValues(pagination);

    const orderBy = pagination.orderBy || 'createdAt';
    const order = pagination.order || SortOrder.DESC;
    qb.orderBy(`lp.${orderBy}`, order);

    qb.skip(skip).take(take);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}
