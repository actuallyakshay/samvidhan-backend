import { Injectable, NotFoundException } from '@nestjs/common';
import { GetCasesQueryDto } from 'src/cases/dto';
import { buildPaginationOutput } from 'src/data/dto/pagination.dto';
import { CasesRepository } from 'src/data/repositories/cases.repository';
import { LawyerPracticeAreasRepository } from 'src/data/repositories/lawyer-practice-areas.repository';
import { LawyerProfilesRepository } from 'src/data/repositories/lawyer-profiles.repository';
import { UsersRepository } from 'src/data/repositories/users.repository';
import { CaseStatus } from 'src/enums';
import { In } from 'typeorm';
import { GetLawyersQueryDto } from './dto';
import { UpdateLawyerInput } from './dto/update-lawyer.dto';

@Injectable()
export class LawyersService {
  constructor(
    private readonly lawyerProfilesRepository: LawyerProfilesRepository,
    private readonly casesRepository: CasesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly lawyerPracticeAreasRepository: LawyerPracticeAreasRepository
  ) {}

  async getLawyers(input: { query: GetLawyersQueryDto }) {
    const { query } = input;

    const qb = this.lawyerProfilesRepository.getVerifiedLawyersQuery();

    const { data, total } = await this.lawyerProfilesRepository.findPaginated(qb, query);
    const pagination = buildPaginationOutput(total, query);

    return { data, pagination };
  }

  async getLawyerById(input: { lawyerId: string }) {
    const { lawyerId } = input;

    const lawyer = await this.lawyerProfilesRepository
      .createQueryBuilder('lp')
      .innerJoin('lp.user', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.avatarUrl'])
      .innerJoin('user.userRoles', 'ur')
      .innerJoin('ur.role', 'role', 'role.code = :lawyerRole', { lawyerRole: 'lawyer' })
      .leftJoinAndSelect('lp.lawyerPracticeAreas', 'lpa')
      .leftJoinAndSelect('lpa.practiceArea', 'practiceArea')
      .where('lp.user_id = :lawyerId', { lawyerId })
      .andWhere('lp.is_verified = :isVerified', { isVerified: true })
      .andWhere('ur.status = :roleStatus', { roleStatus: 'active' })
      .getOne();

    if (!lawyer) {
      throw new NotFoundException('Lawyer not found');
    }

    return lawyer;
  }

  async getLawyerCases(input: { userId?: string; lawyerId?: string; query: GetCasesQueryDto }) {
    const { userId, lawyerId, query } = input;

    const foundLawyer = lawyerId
      ? { id: lawyerId }
      : await this.lawyerProfilesRepository.findOne({ where: { userId } });

    const qb = this.casesRepository.getLawyerCasesQuery({
      lawyerId: foundLawyer.id,
      filters: { search: query.search, status: query.status },
    });

    const { data, total } = await this.casesRepository.findPaginated(qb, query);
    const pagination = buildPaginationOutput(total, query);

    return { data, pagination };
  }

  async getLawyerCaseById(input: { userId: string; caseId: string }) {
    const { userId, caseId } = input;

    const profile = await this.lawyerProfilesRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Case not found');
    }

    const caseEntity = await this.casesRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.practiceArea', 'practiceArea')
      .leftJoinAndSelect('c.assets', 'assets')
      .leftJoinAndSelect('c.caseNotes', 'caseNotes')
      .leftJoin('c.user', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.avatarUrl'])
      .leftJoin('c.assignedLawyer', 'assignedLawyer')
      .addSelect(['assignedLawyer.id', 'assignedLawyer.userId'])
      .where('c.id = :caseId', { caseId })
      .andWhere('c.assigned_lawyer_id = :lawyerProfileId', { lawyerProfileId: profile.id })
      .getOne();

    if (!caseEntity) {
      throw new NotFoundException('Case not found');
    }

    return caseEntity;
  }

  async createLawyerPracticeAreas(input: { lawyerId: string; practiceAreaIds: string[] }) {
    const { lawyerId, practiceAreaIds } = input;

    await this.lawyerPracticeAreasRepository.delete({
      lawyerProfileId: lawyerId,
    });

    const lawyerPracticeAreas = practiceAreaIds.map((practiceAreaId) => ({
      lawyerProfileId: lawyerId,
      practiceAreaId,
    }));

    return this.lawyerPracticeAreasRepository.save(lawyerPracticeAreas);
  }

  async updateLawyerProfile(input: { userId: string; body: UpdateLawyerInput }) {
    const {
      userId,
      body: { userProfile, lawyerPracticeAreas, ...rest },
    } = input;

    if (userProfile) {
      await this.usersRepository.update({ id: userId }, userProfile);
    }

    const foundLawyerProfile = await this.lawyerProfilesRepository.findOne({ where: { userId } });

    if (lawyerPracticeAreas) {
      await this.createLawyerPracticeAreas({
        lawyerId: foundLawyerProfile.id,
        practiceAreaIds: lawyerPracticeAreas,
      });
    }

    return this.lawyerProfilesRepository.update({ userId }, rest);
  }

  async getLawyerAnalytics(input: { userId: string }) {
    const { userId } = input;

    const lawyerProfile = await this.lawyerProfilesRepository.findOne({ where: { userId } });

    const [totalActiveCases, totalHandledCases, assignedCases] = await Promise.all([
      this.casesRepository.count({
        where: {
          assignedLawyerId: lawyerProfile.id,
          status: In([CaseStatus.NEW, CaseStatus.UNDER_REVIEW, CaseStatus.LAWYER_ASSIGNED]),
        },
      }),
      this.casesRepository.count({
        where: {
          assignedLawyerId: lawyerProfile.id,
          status: CaseStatus.CLOSED,
        },
      }),
      this.casesRepository.find({
        where: {
          assignedLawyerId: lawyerProfile.id,
          status: In([CaseStatus.NEW, CaseStatus.UNDER_REVIEW, CaseStatus.LAWYER_ASSIGNED]),
        },
        relations: { user: true, practiceArea: true },
        take: 3,
        order: { createdAt: 'DESC' },
      }),
    ]);

    return {
      totalActiveCases,
      totalHandledCases,
      assignedCases,
      lawyerExp: lawyerProfile.careerStartDate,
    };
  }
}
