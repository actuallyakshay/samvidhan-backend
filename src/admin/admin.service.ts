import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CasesService } from 'src/cases/cases.service';
import {
  CreateCaseNoteInput,
  GetCaseMessagesQueryDto,
  GetCasesDocumentsQueryDto,
  GetCasesQueryDto,
  GetInternalNotesQueryDto,
  MarkCaseChatReadDto,
} from 'src/cases/dto';
import { buildPaginationOutput, getPageValues } from 'src/data/dto/pagination.dto';
import { UsersEntity } from 'src/data/entities';
import {
  CaseSessionRequestApprovedBy,
  CaseSessionRequestStatus,
} from 'src/data/entities/case-session-request.entity';
import { AdminSettingsRepository, LawyerPracticeAreasRepository } from 'src/data/repositories';
import { CaseSessionRequestRepository } from 'src/data/repositories/case-session-request.repository';
import { CasesRepository } from 'src/data/repositories/cases.repository';
import { LawyerProfilesRepository } from 'src/data/repositories/lawyer-profiles.repository';
import { UserRolesRepository } from 'src/data/repositories/user-roles.repository';
import { UsersRepository } from 'src/data/repositories/users.repository';
import { AccountStatus, CaseStatus, RoleCode, UserRoleStatus } from 'src/enums';
import { GoogleMeetService } from 'src/google-meet/google-meet.service';
import { UpdateLawyerInput } from 'src/lawyers/dto/update-lawyer.dto';
import { LawyersService } from 'src/lawyers/lawyers.service';
import { LoginProvider } from 'src/types';
import { UpdateUserInput } from 'src/users/dto';
import { In } from 'typeorm';
import {
  CreateUserInput,
  GetCasesAdminQueryDto,
  GetLawyersAdminQueryDto,
  GetUsersQueryDto,
} from './dto';
import { AddLawyerInput } from './dto/add-lawyer.dto';
import { UpdateSettingsInput } from './dto/admin-settings.dto';
import { GetCaseSessionRequestsQueryDto } from './dto/session-requests.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly lawyerProfilesRepository: LawyerProfilesRepository,
    private readonly casesRepository: CasesRepository,
    private readonly userRolesRepository: UserRolesRepository,
    private readonly caseSessionRequestsRepository: CaseSessionRequestRepository,
    private readonly casesService: CasesService,
    private readonly lawyersService: LawyersService,
    private readonly adminSettingsRepository: AdminSettingsRepository,
    private readonly lawyerPracticeAreasRepository: LawyerPracticeAreasRepository,
    private readonly googleMeetService: GoogleMeetService
  ) {}

  async getUsers(input: { query: GetUsersQueryDto }) {
    const { query } = input;

    const qb = this.usersRepository.getAdminUsersQuery({
      search: query.search,
      status: query.status,
    });

    const { data, total } = await this.usersRepository.findPaginated(qb, query);
    const pagination = buildPaginationOutput(total, query);

    return { data, pagination };
  }

  async getLawyers(input: { query: GetLawyersAdminQueryDto }) {
    const { query } = input;

    const qb = this.lawyerProfilesRepository.getAdminLawyersQuery(query);

    const { data, total } = await this.lawyerProfilesRepository.findPaginated(qb, query);
    const pagination = buildPaginationOutput(total, query);

    return { data, pagination };
  }

  async getCases(input: { query: GetCasesAdminQueryDto }) {
    const { query } = input;

    const qb = this.casesRepository.getAdminCasesQuery({
      search: query.search,
      status: query.status,
      practiceAreaId: query.practiceAreaId,
    });

    const { data, total } = await this.casesRepository.findPaginated(qb, query);

    const pagination = buildPaginationOutput(total, query);

    return { data, pagination };
  }

  async toggleUserRole(input: { userId: string; roleCode: RoleCode; status: UserRoleStatus }) {
    const { userId, roleCode, status } = input;

    const userRole = await this.userRolesRepository.findOne({
      where: { userId, roleCode },
    });
    if (!userRole) {
      throw new NotFoundException(`User role "${roleCode}" not found`);
    }

    await this.userRolesRepository.save({
      ...userRole,
      status,
    });

    return { userId, roleCode, status: userRole.status };
  }

  async suspendAccount(input: { userId: string }) {
    const { userId } = input;

    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.accountStatus =
      user.accountStatus === AccountStatus.ACTIVE ? AccountStatus.SUSPENDED : AccountStatus.ACTIVE;

    await this.usersRepository.save(user);

    return { userId, accountStatus: user.accountStatus };
  }

  async toggleLawyerProfile(input: { userId: string }) {
    const { userId } = input;

    const lawyerRole = await this.userRolesRepository.findOne({
      where: { userId, roleCode: RoleCode.LAWYER },
    });

    if (!lawyerRole) {
      throw new NotFoundException('Lawyer role not found');
    }

    return this.userRolesRepository.save({
      ...lawyerRole,
      status:
        lawyerRole.status === UserRoleStatus.ACTIVE
          ? UserRoleStatus.INACTIVE
          : UserRoleStatus.ACTIVE,
    });
  }

  async addLawyer(input: { body: AddLawyerInput }) {
    const { body } = input;

    let user: UsersEntity | null = null;

    user = await this.usersRepository.findOne({
      where: { email: body.email },
      relations: { userRoles: true },
    });

    if (!user) {
      user = await this.usersRepository.save({
        ...body,
        email: body.email,
        passwordHash: await bcrypt.hash(body.password, 10),
        accountStatus: AccountStatus.ACTIVE,
        provider: LoginProvider.EMAIL,
        fullName: body.email?.split?.('@')?.[0] || body.email,
        ...(body?.phone ? { isProfileCompleted: true } : {}),
      });

      await this.userRolesRepository.save({
        userId: user.id,
        roleCode: RoleCode.LAWYER,
        status: UserRoleStatus.ACTIVE,
      });
    }
    const lawyerProfile = await this.lawyerProfilesRepository.save({
      userId: user.id,
      barCouncilId: body.barCouncilId,
      careerStartDate: body.careerStartDate,
      bio: body.bio,
      degree: body.degree,
    });

    if (body?.lawyerPracticeAreas?.length) {
      const practiceAreas = body.lawyerPracticeAreas.map((practiceAreaId) =>
        this.lawyerPracticeAreasRepository.create({
          lawyerProfileId: lawyerProfile.id,
          practiceAreaId,
        })
      );
      await this.lawyerPracticeAreasRepository.save(practiceAreas);
    }
    return lawyerProfile;
  }

  async getAdminAnalytics() {
    const [totalUsers, totalLawyers, activeCases, resolvedCases, newCases] = await Promise.all([
      this.usersRepository.count(),
      this.lawyerProfilesRepository.count(),
      this.casesRepository.count({
        where: {
          status: In([CaseStatus.NEW, CaseStatus.UNDER_REVIEW, CaseStatus.LAWYER_ASSIGNED]),
        },
      }),
      this.casesRepository.count({
        where: {
          status: CaseStatus.CLOSED,
        },
      }),
      this.casesRepository.find({
        where: {
          status: In([CaseStatus.NEW, CaseStatus.UNDER_REVIEW]),
        },
        relations: { user: true },
        select: { user: { id: true, fullName: true } },
        take: 3,
        order: { createdAt: 'DESC' },
      }),
    ]);

    return {
      totalUsers,
      totalLawyers,
      activeCases,
      resolvedCases,
      newCases,
    };
  }

  async assignLawyerToCase(input: { caseId: string; lawyerId: string }) {
    const { caseId, lawyerId } = input;

    await this.casesRepository.update(caseId, {
      assignedLawyerId: lawyerId,
      status: CaseStatus.LAWYER_ASSIGNED,
    });
    return {
      message: 'Lawyer assigned to case successfully',
      caseId,
      lawyerId,
    };
  }

  async resetCase(input: { caseId: string }) {
    const { caseId } = input;
    await this.casesRepository.update(caseId, {
      assignedLawyerId: null,
      status: CaseStatus.NEW,
    });

    return {
      message: 'Case reset from lawyer successfully',
    };
  }

  async updateCaseStatus(input: { caseId: string; status: CaseStatus }) {
    const { caseId, status } = input;
    await this.casesRepository.update(caseId, { status });
    return {
      message: 'Case status updated successfully',
    };
  }

  async getCaseSessionRequests(input: { query: GetCaseSessionRequestsQueryDto }) {
    const { query } = input;
    const { skip, take } = getPageValues(query);

    const qb = this.caseSessionRequestsRepository
      .createQueryBuilder('csr')
      .leftJoin('csr.case', 'c')
      .addSelect(['c.id', 'c.caseCode', 'c.status'])
      .leftJoin('c.user', 'u')
      .addSelect(['u.id', 'u.fullName'])
      .leftJoin('c.assignedLawyer', 'assignedLawyer')
      .addSelect(['assignedLawyer.id'])
      .leftJoin('assignedLawyer.user', 'lawyerUser')
      .addSelect(['lawyerUser.id', 'lawyerUser.fullName'])
      .orderBy('csr.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    const [data, total] = await qb.getManyAndCount();
    const pagination = buildPaginationOutput(total, query);

    return { data, pagination };
  }

  async createUser(input: { body: CreateUserInput }) {
    const { body } = input;

    const existingUser = await this.usersRepository.findOne({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await this.usersRepository.save({
      fullName: body?.fullName || body.email?.split?.('@')?.[0] || body.email,
      email: body.email,
      passwordHash: hashedPassword,
      provider: LoginProvider.EMAIL,
      phone: body.phone,
      ...(body.phone ? { isProfileCompleted: true } : {}),
    });
    await this.userRolesRepository.save({
      userId: user.id,
      roleCode: RoleCode.USER,
      status: UserRoleStatus.ACTIVE,
    });
    return {
      message: 'User created successfully',
      userId: user.id,
    };
  }

  getUsersCases(input: { userId: string; query: GetCasesQueryDto }) {
    const { userId, query } = input;
    return this.casesService.getUserCases({ userId, query });
  }

  getUserById(input: { userId: string }) {
    const { userId } = input;
    return this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async getLawyerById(input: { lawyerId: string }) {
    const { lawyerId } = input;

    const [lawyerData, totalCasesHandled] = await Promise.all([
      this.lawyerProfilesRepository.findOne({
        where: { id: lawyerId },
        relations: {
          user: true,
          lawyerPracticeAreas: {
            practiceArea: true,
          },
        },
        select: {
          id: true,
          careerStartDate: true,
          barCouncilId: true,
          degree: true,
          bio: true,
          user: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
          },
          lawyerPracticeAreas: {
            id: true,
            practiceArea: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.casesRepository.count({
        where: {
          assignedLawyerId: lawyerId,
        },
      }),
    ]);

    return { lawyerData, totalCasesHandled };
  }

  getLawyerCases(input: { lawyerId: string; query: GetCasesQueryDto }) {
    const { lawyerId, query } = input;
    return this.lawyersService.getLawyerCases({ lawyerId, query });
  }

  async getAdminSettings() {
    const settings = await this.adminSettingsRepository.find({
      order: { id: 'DESC' },
    });
    return settings?.length ? settings[0] : null;
  }

  async updateAdminSettings(input: { body: UpdateSettingsInput }) {
    const { body } = input;
    const settings = await this.getAdminSettings();

    if (settings) {
      await this.adminSettingsRepository.update(settings.id, {
        ...settings,
        ...body,
      });
    } else {
      await this.adminSettingsRepository.save({
        ...body,
      });
    }
    return { message: 'Admin settings updated successfully' };
  }

  async updateLawyerProfile(input: { lawyerId: string; body: UpdateLawyerInput }) {
    const { lawyerId, body } = input;
    const foundLawyerProfile = await this.lawyerProfilesRepository.findOne({
      where: { id: lawyerId },
      select: { userId: true, id: true },
    });
    return this.lawyersService.updateLawyerProfile({ userId: foundLawyerProfile.userId, body });
  }

  async updateCaseSessionRequest(input: {
    sessionRequestId: string;
    status: CaseSessionRequestStatus;
  }) {
    const { sessionRequestId, status } = input;

    if (status === CaseSessionRequestStatus.ACCEPTED) {
      const { meetingUri } = await this.googleMeetService.createMeetLink();

      return this.caseSessionRequestsRepository.update(sessionRequestId, {
        status,
        meetingUri,
        approvedBy: CaseSessionRequestApprovedBy.ADMIN,
      });
    }

    return this.caseSessionRequestsRepository.update(sessionRequestId, {
      status,
    });
  }

  async updateUserProfile(input: { userId: string; body: UpdateUserInput }) {
    const { userId, body } = input;
    await this.usersRepository.update(userId, body);
    return { message: 'User profile updated successfully' };
  }

  async getCaseNotes(input: { caseId: string; query: GetInternalNotesQueryDto }) {
    const { caseId, query } = input;
    return this.casesService.getCaseNotes({ caseId, query });
  }

  async getCaseDocuments(input: { caseId: string; query: GetCasesDocumentsQueryDto }) {
    const { caseId, query } = input;
    return this.casesService.getCaseDocuments({ caseId, query });
  }

  async createCaseNote(input: { caseId: string; body: CreateCaseNoteInput }) {
    const { caseId, body } = input;
    return this.casesService.createCaseNote({ caseId, body });
  }

  getCaseById(input: { caseId: string }) {
    const { caseId } = input;
    return this.casesService.getCaseById({ caseId });
  }

  getCaseMessages(input: { caseId: string; query: GetCaseMessagesQueryDto }) {
    const { caseId, query } = input;
    return this.casesService.getCaseMessagesPage({
      caseId,
      userId: '',
      isAdmin: true,
      beforeMessageId: query.beforeMessageId,
      limit: query.limit,
    });
  }

  getCaseChatUnreadSummary(input: { userId: string }) {
    return this.casesService.getCaseChatUnreadSummaryForAdmin({ userId: input.userId });
  }

  markCaseChatRead(input: {
    caseId: string;
    userId: string;
    body: MarkCaseChatReadDto;
  }) {
    return this.casesService.markCaseChatRead({
      caseId: input.caseId,
      userId: input.userId,
      isAdmin: true,
      body: input.body,
    });
  }
}
