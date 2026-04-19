import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GetCasesQueryDto } from 'src/cases/dto';
import { buildPaginationOutput } from 'src/data/dto/pagination.dto';
import { CasesRepository } from 'src/data/repositories/cases.repository';
import { LawyerDocumentsRepository } from 'src/data/repositories/lawyer-documents.repository';
import { LawyerPracticeAreasRepository } from 'src/data/repositories/lawyer-practice-areas.repository';
import { LawyerProfilesRepository } from 'src/data/repositories/lawyer-profiles.repository';
import { UsersRepository } from 'src/data/repositories/users.repository';
import { CaseStatus } from 'src/enums';
import { In } from 'typeorm';
import { CreateLawyerDocumentDto, GetLawyersQueryDto } from './dto';
import { UpdateLawyerInput } from './dto/update-lawyer.dto';

const MAX_DOCUMENTS_LIMIT = 50;

@Injectable()
export class LawyersService {
  constructor(
    private readonly lawyerProfilesRepository: LawyerProfilesRepository,
    private readonly casesRepository: CasesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly lawyerPracticeAreasRepository: LawyerPracticeAreasRepository,
    private readonly lawyerDocumentsRepository: LawyerDocumentsRepository
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
    const { userId, body } = input;
    const { userProfile, lawyerPracticeAreas, ...rest } = body;

    if (Object.keys(userProfile ?? {}).length > 0) {
      await this.usersRepository.update({ id: userId }, { ...userProfile });
    }

    const foundLawyerProfile = await this.lawyerProfilesRepository.findOne({ where: { userId } });

    if (lawyerPracticeAreas?.length > 0) {
      await this.createLawyerPracticeAreas({
        lawyerId: foundLawyerProfile.id,
        practiceAreaIds: lawyerPracticeAreas,
      });
    }

    return this.lawyerProfilesRepository.update(
      { userId },
      {
        ...foundLawyerProfile,
        ...rest,
        isVerified: false,
      }
    );
  }

  async createLawyerDocument(input: { userId: string; dto: CreateLawyerDocumentDto }) {
    const { userId, dto } = input;

    const profile = await this.lawyerProfilesRepository.findOne({ where: { userId } });

    const countDocs = await this.lawyerDocumentsRepository.count({
      where: { lawyerProfileId: profile.id },
    });
    if (countDocs >= MAX_DOCUMENTS_LIMIT) {
      throw new BadRequestException('You can only upload up to 15 documents');
    }

    await Promise.all([
      this.lawyerProfilesRepository.update({ id: profile.id }, { isVerified: false }),
      this.lawyerDocumentsRepository.save({
        lawyerProfileId: profile.id,
        assetUrl: dto.assetUrl,
        assetName: dto.assetName,
        isApproved: false,
      }),
    ]);

    return { message: 'Document created successfully' };
  }

  async listLawyerDocumentsForUser(input: { userId: string }) {
    const { userId } = input;
    const profile = await this.lawyerProfilesRepository.findOne({ where: { userId } });

    return this.lawyerDocumentsRepository.find({
      where: { lawyerProfileId: profile.id },
      order: { createdAt: 'DESC' },
    });
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

  async deleteLawyerDocument(input: { documentId: string; userId: string }) {
    const { documentId, userId } = input;

    const profile = await this.lawyerProfilesRepository.findOne({ where: { userId } });

    await Promise.all([
      this.lawyerProfilesRepository.update({ id: profile.id }, { isVerified: false }),
      this.lawyerDocumentsRepository.delete({ id: documentId }),
    ]);

    return {
      message:
        'Your Profile has been unverified, Once Admin verifies your profile, your profile will show as verified again.',
    };
  }
}
