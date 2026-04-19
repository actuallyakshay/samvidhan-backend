import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CasesRepository, LawyerProfilesRepository, UsersRepository } from 'src/data/repositories';
import { CaseStatus, RoleCode, UserRoleStatus } from 'src/enums';
import { In, Not } from 'typeorm';
import { UpdateUserInput } from './dto';
import { PushNotificationService } from 'src/push/push-notification.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly casesRepository: CasesRepository,
    private readonly lawyerProfilesRepository: LawyerProfilesRepository,
    private readonly pushNotificationService: PushNotificationService
  ) {}

  // async onModuleInit() {
  //   const resp = await this.pushNotificationService.sendToUserId(
  //     'f7e22389-da9c-4349-a348-be2ac84eae7e',
  //     {
  //       body: 'Hello, this is a test notification',
  //       title: 'Test Notification',
  //       clickActionUrl: 'https://www.google.com',
  //     }
  //   );
  //   console.log(resp);
  // }

  async me(input: { userId: string; activeRole?: RoleCode | string }) {
    const { userId, activeRole = RoleCode.USER } = input;

    const profileRelation = activeRole === RoleCode.LAWYER && {
      lawyerProfile: {
        lawyerPracticeAreas: true,
      },
    };

    const user = await this.usersRepository.findOne({
      where: { id: userId, userRoles: { status: UserRoleStatus.ACTIVE } },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        isProfileCompleted: true,
        provider: true,
        userRoles: { id: true, status: true, roleCode: true },
      },
      relations: { userRoles: true, ...profileRelation },
    });
    if (!user) throw new NotFoundException('User not found');

    const { userRoles, ...userData } = user;

    return {
      ...userData,
      roles: userRoles.map((ur) => ur.roleCode),
    };
  }

  async updateUser(input: { userId: string; body: UpdateUserInput }) {
    const { userId, body } = input;

    if (body?.phone) {
      const existingUser = await this.usersRepository.findOne({
        where: { phone: body.phone, id: Not(userId) },
      });
      if (existingUser) {
        throw new BadRequestException('Phone number already in use');
      }
    }
    const foundLawyerProfile = await this.lawyerProfilesRepository.findOne({ where: { userId } });

    await Promise.all([
      this.usersRepository.update(
        { id: userId },
        { ...body, ...(body.phone && { isProfileCompleted: true }) }
      ),
      ...(foundLawyerProfile
        ? [
            this.lawyerProfilesRepository.update(
              { id: foundLawyerProfile.id },
              { isVerified: false }
            ),
          ]
        : []),
    ]);

    return { message: 'User updated successfully' };
  }

  async getUserAnalytics(input: { userId: string }) {
    const { userId } = input;

    const [totalCasesCount, activeCases, subscriptionPlan, emergencyCases] = await Promise.all([
      this.casesRepository.count({
        where: {
          userId,
          status: Not(In([CaseStatus.CLOSED, CaseStatus.REJECTED])),
        },
      }),
      this.casesRepository.findAndCount({
        where: {
          userId,
          status: In([CaseStatus.NEW, CaseStatus.UNDER_REVIEW, CaseStatus.LAWYER_ASSIGNED]),
        },
        relations: { practiceArea: true },
        order: { createdAt: 'DESC' },
        take: 3,
      }),

      Promise.resolve({}),
      this.casesRepository.count({
        where: {
          userId,
          isEmergency: true,
          status: In([CaseStatus.NEW, CaseStatus.UNDER_REVIEW, CaseStatus.LAWYER_ASSIGNED]),
        },
      }),
    ]);

    return {
      totalCasesCount,
      activeCasesCount: activeCases[1],
      activeCases: activeCases[0],
      emergencyCasesCount: emergencyCases,
      subscriptionPlan: {},
    };
  }

  async updateFcmToken(input: { userId: string; body: { fcmToken: string } }) {
    const { userId, body } = input;

    await this.usersRepository.update({ id: userId }, { fcmToken: body.fcmToken });

    return { message: 'FCM token updated successfully' };
  }
}
