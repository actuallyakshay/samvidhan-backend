import { Injectable, Optional } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository, SelectQueryBuilder } from 'typeorm';
import { UsersEntity } from '../entities';
import { getPageValues, PaginationInputDto, SortOrder } from '../dto/pagination.dto';

@Injectable()
export class UsersRepository extends Repository<UsersEntity> {
  constructor(@Optional() _target: EntityTarget<UsersEntity>, entityManager: EntityManager) {
    super(UsersEntity, entityManager);
  }

  getAdminUsersQuery(input: { search?: string; status?: string }): SelectQueryBuilder<UsersEntity> {
    const { search, status } = input;

    const qb = this.createQueryBuilder('u')
      .where('u.is_admin = false')
      .select([
        'u.id',
        'u.fullName',
        'u.email',
        'u.phone',
        'u.accountStatus',
        'u.avatarUrl',
        'u.createdAt',
      ]);

    if (search) {
      qb.andWhere('(u.full_name ILIKE :search OR u.email ILIKE :search OR u.phone ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      qb.andWhere('u.account_status = :status', { status });
    }

    return qb;
  }

  async findPaginated(
    qb: SelectQueryBuilder<UsersEntity>,
    pagination: PaginationInputDto
  ): Promise<{ data: UsersEntity[]; total: number }> {
    const { skip, take } = getPageValues(pagination);

    const orderBy = pagination.orderBy || 'createdAt';
    const order = pagination.order || SortOrder.DESC;
    qb.orderBy(`u.${orderBy}`, order);

    qb.skip(skip).take(take);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}
