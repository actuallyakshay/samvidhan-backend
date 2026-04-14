import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { buildPaginationOutput } from 'src/data/dto/pagination.dto';
import {
  CaseSessionRequestStatus,
  CaseSessionRequestsEntity,
} from 'src/data/entities/case-session-request.entity';
import { CaseMessagesEntity } from 'src/data/entities';
import {
  CaseChatReadStateRepository,
  CaseMessagesRepository,
  CaseNotesRepository,
  LawyerProfilesRepository,
} from 'src/data/repositories';
import { AssetsRepository } from 'src/data/repositories/assets.repository';
import { CaseSessionRequestRepository } from 'src/data/repositories/case-session-request.repository';
import { CasesRepository } from 'src/data/repositories/cases.repository';
import { PracticeAreasRepository } from 'src/data/repositories/practice-areas.repository';
import { AssetType, MessageType, RoleCode } from 'src/enums';
import { mapCaseMessageEntity } from './case-message.mapper';
import { AssetAuthor } from 'src/types';
import { In } from 'typeorm';
import {
  CreateCaseInput,
  CreateCaseNoteInput,
  CreateCaseSessionRequestInput,
  GetCasesDocumentsQueryDto,
  GetCasesQueryDto,
  GetInternalNotesQueryDto,
  MarkCaseChatReadDto,
  UploadCaseDocumentInput,
} from './dto';
import { UpdatePracticeAreaInput } from './dto/update-practice-area.dto';

export type CaseChatUnreadItem = {
  caseId: string;
  caseCode: string;
  title: string;
  unreadCount: number;
};

@Injectable()
export class CasesService {
  constructor(
    private readonly casesRepository: CasesRepository,
    private readonly assetsRepository: AssetsRepository,
    private readonly practiceAreasRepository: PracticeAreasRepository,
    private readonly caseNotesRepository: CaseNotesRepository,
    private readonly caseSessionRequestsRepository: CaseSessionRequestRepository,
    private readonly caseMessagesRepository: CaseMessagesRepository,
    private readonly lawyerProfilesRepository: LawyerProfilesRepository,
    private readonly caseChatReadStateRepository: CaseChatReadStateRepository
  ) {}

  async createCase(input: { userId: string; dto: CreateCaseInput }) {
    const { userId, dto } = input;

    const caseCode = this.generateCaseCode();

    const foundExistingCase = await this.casesRepository.findOneBy({
      userId,
      title: dto.title,
    });

    if (foundExistingCase) {
      throw new BadRequestException('Case with this title already exists');
    }

    const createdCase = await this.casesRepository.save({
      caseCode,
      userId,
      ...dto,
    });

    if (dto?.documents?.length) {
      const docs = dto.documents.map((doc) =>
        this.assetsRepository.create({
          caseId: createdCase.id,
          assetUrl: doc.assetUrl,
          assetType: doc.assetType as AssetType,
          assetName: doc?.assetName,
          author: AssetAuthor.USER,
        })
      );
      await this.assetsRepository.save(docs);
    }

    return createdCase;
  }

  async getUserCases(input: { userId: string; query: GetCasesQueryDto }) {
    const { userId, query } = input;

    const qb = this.casesRepository.getUserCasesQuery({
      userId,
      filters: { search: query.search, status: query.status },
    });

    const { data, total } = await this.casesRepository.findPaginated(qb, query);
    const pagination = buildPaginationOutput(total, query);

    return { data, pagination };
  }

  async getCaseById(input: { caseId: string }) {
    const { caseId } = input;

    const caseEntity = await this.casesRepository
      .createQueryBuilder('c')
      .where('c.id = :caseId', { caseId })
      .leftJoin('c.user', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.avatarUrl'])
      .leftJoin('c.practiceArea', 'practiceArea')
      .addSelect(['practiceArea.id', 'practiceArea.name'])
      .leftJoin('c.assignedLawyer', 'assignedLawyer')
      .addSelect(['assignedLawyer.id', 'assignedLawyer.userId'])
      .leftJoin('assignedLawyer.user', 'lawyerUser')
      .addSelect(['lawyerUser.id', 'lawyerUser.fullName', 'lawyerUser.avatarUrl'])
      .leftJoinAndMapOne(
        'c.caseSessionRequest',
        CaseSessionRequestsEntity,
        'caseSessionRequests',
        'caseSessionRequests.caseId = c.id AND caseSessionRequests.status = :status',
        { status: CaseSessionRequestStatus.ACCEPTED }
      )
      .getOne();

    if (!caseEntity) {
      throw new NotFoundException('Case not found');
    }

    return caseEntity;
  }

  async assertCaseThreadAccess(input: {
    caseId: string;
    userId: string;
    activeRole?: string;
    isAdmin?: boolean;
  }) {
    const caseEntity = await this.casesRepository
      .createQueryBuilder('c')
      .leftJoin('c.assignedLawyer', 'assignedLawyer')
      .addSelect(['assignedLawyer.id', 'assignedLawyer.userId'])
      .where('c.id = :caseId', { caseId: input.caseId })
      .getOne();

    if (!caseEntity) {
      throw new NotFoundException('Case not found');
    }

    if (input.isAdmin) return caseEntity;
    if (caseEntity.userId === input.userId) return caseEntity;

    const ar = input.activeRole;
    if (ar === RoleCode.LAWYER || ar === 'lawyer') {
      const profile = await this.lawyerProfilesRepository.findOne({
        where: { userId: input.userId },
      });
      if (profile && caseEntity.assignedLawyerId === profile.id) return caseEntity;
    }

    throw new ForbiddenException('Not allowed for this case');
  }

  async getCaseMessagesPage(input: {
    caseId: string;
    userId: string;
    activeRole?: string;
    isAdmin?: boolean;
    beforeMessageId?: string;
    limit?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 30, 1), 100);
    const caseEntity = await this.assertCaseThreadAccess(input);
    const ctx = {
      caseUserId: caseEntity.userId,
      assignedLawyerUserId: caseEntity.assignedLawyer?.userId ?? null,
    };

    const qb = this.caseMessagesRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .where('m.caseId = :caseId', { caseId: input.caseId })
      .andWhere('m.messageType = :mt', { mt: MessageType.TEXT })
      .orderBy('m.createdAt', 'DESC')
      .addOrderBy('m.id', 'DESC')
      .take(limit + 1);

    if (input.beforeMessageId) {
      const anchor = await this.caseMessagesRepository.findOne({
        where: { id: input.beforeMessageId, caseId: input.caseId },
      });
      if (!anchor) {
        throw new BadRequestException('Invalid beforeMessageId');
      }
      qb.andWhere(
        '(m.createdAt < :anchorTs OR (m.createdAt = :anchorTs AND m.id < :anchorId))',
        {
          anchorTs: anchor.createdAt,
          anchorId: anchor.id,
        }
      );
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const mapped = slice
      .map((r) => mapCaseMessageEntity(r, ctx))
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .reverse();

    return {
      messages: mapped,
      hasMore,
      oldestMessageId: mapped.length ? mapped[0].id : null,
    };
  }

  async getCaseChatUnreadSummary(input: { userId: string; activeRole?: string }) {
    const { userId, activeRole } = input;
    let caseRows: { id: string; caseCode: string; title: string }[] = [];

    if (activeRole === RoleCode.LAWYER || activeRole === 'lawyer') {
      const profile = await this.lawyerProfilesRepository.findOne({ where: { userId } });
      if (profile) {
        caseRows = await this.casesRepository.find({
          where: { assignedLawyerId: profile.id },
          select: ['id', 'caseCode', 'title'],
        });
      }
    } else {
      caseRows = await this.casesRepository.find({
        where: { userId },
        select: ['id', 'caseCode', 'title'],
      });
    }

    return this.buildUnreadSummary(caseRows, userId);
  }

  async getCaseChatUnreadSummaryForAdmin(input: { userId: string }) {
    const caseIdsRows: { caseId: string }[] = await this.caseMessagesRepository.query(
      `SELECT case_id AS "caseId"
       FROM case_messages
       WHERE message_type = $1
       GROUP BY case_id
       ORDER BY MAX(created_at) DESC
       LIMIT 150`,
      [MessageType.TEXT]
    );
    const ids = caseIdsRows.map((r) => r.caseId);
    if (!ids.length) {
      return { items: [] as CaseChatUnreadItem[], totalUnread: 0 };
    }

    const caseRows = await this.casesRepository.find({
      where: { id: In(ids) },
      select: ['id', 'caseCode', 'title'],
    });
    const order = new Map(ids.map((id, i) => [id, i]));
    caseRows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

    return this.buildUnreadSummary(caseRows, input.userId);
  }

  async markCaseChatRead(input: {
    caseId: string;
    userId: string;
    activeRole?: string;
    isAdmin?: boolean;
    body?: MarkCaseChatReadDto;
  }) {
    await this.assertCaseThreadAccess({
      caseId: input.caseId,
      userId: input.userId,
      activeRole: input.activeRole,
      isAdmin: input.isAdmin,
    });

    const messageId = input.body?.messageId;
    let msg: CaseMessagesEntity | null = null;

    if (messageId) {
      msg = await this.caseMessagesRepository.findOne({
        where: { id: messageId, caseId: input.caseId, messageType: MessageType.TEXT },
      });
      if (!msg) {
        throw new BadRequestException('Invalid messageId');
      }
    } else {
      msg = await this.caseMessagesRepository.findOne({
        where: { caseId: input.caseId, messageType: MessageType.TEXT },
        order: { createdAt: 'DESC', id: 'DESC' },
      });
    }

    let row = await this.caseChatReadStateRepository.findOne({
      where: { userId: input.userId, caseId: input.caseId },
    });

    if (!msg) {
      if (row) {
        row.lastReadMessageId = null;
        await this.caseChatReadStateRepository.save(row);
      }
      return { ok: true as const, lastReadMessageId: null as string | null };
    }

    if (!row) {
      row = this.caseChatReadStateRepository.create({
        userId: input.userId,
        caseId: input.caseId,
        lastReadMessageId: msg.id,
      });
    } else {
      row.lastReadMessageId = msg.id;
    }
    await this.caseChatReadStateRepository.save(row);

    return { ok: true as const, lastReadMessageId: msg.id };
  }

  private async buildUnreadSummary(
    caseRows: { id: string; caseCode: string; title: string }[],
    userId: string
  ): Promise<{ items: CaseChatUnreadItem[]; totalUnread: number }> {
    const ids = caseRows.map((c) => c.id);
    const counts = await this.countUnreadByCaseIds(ids, userId);
    const items = caseRows
      .map((c) => ({
        caseId: c.id,
        caseCode: c.caseCode,
        title: c.title,
        unreadCount: counts.get(c.id) ?? 0,
      }))
      .filter((i) => i.unreadCount > 0)
      .sort((a, b) => b.unreadCount - a.unreadCount);
    const totalUnread = items.reduce((s, i) => s + i.unreadCount, 0);
    return { items, totalUnread };
  }

  private async countUnreadByCaseIds(
    caseIds: string[],
    userId: string
  ): Promise<Map<string, number>> {
    if (!caseIds.length) return new Map();
    const rows: { caseId: string; unread: string | number }[] =
      await this.caseMessagesRepository.query(
        `
        SELECT m.case_id AS "caseId", COUNT(*)::int AS unread
        FROM case_messages m
        WHERE m.case_id = ANY($1::uuid[])
          AND m.message_type = $2
          AND (
            NOT EXISTS (
              SELECT 1 FROM case_chat_read_states r
              WHERE r.case_id = m.case_id AND r.user_id = $3::uuid
            )
            OR EXISTS (
              SELECT 1 FROM case_chat_read_states r
              WHERE r.case_id = m.case_id AND r.user_id = $3::uuid AND r.last_read_message_id IS NULL
            )
            OR EXISTS (
              SELECT 1 FROM case_chat_read_states r
              INNER JOIN case_messages lr ON lr.id = r.last_read_message_id
              WHERE r.case_id = m.case_id AND r.user_id = $3::uuid AND r.last_read_message_id IS NOT NULL
                AND (m.created_at > lr.created_at OR (m.created_at = lr.created_at AND m.id > lr.id))
            )
          )
        GROUP BY m.case_id
        `,
        [caseIds, MessageType.TEXT, userId]
      );
    return new Map(
      rows.map((r) => [r.caseId, typeof r.unread === 'string' ? parseInt(r.unread, 10) : r.unread])
    );
  }

  private generateCaseCode(): string {
    const year = new Date().getFullYear();
    const uid = crypto.randomUUID().split('-')[0];
    return `CASE-${year}-${uid?.toUpperCase()}`;
  }

  getPracticeAreas() {
    return this.practiceAreasRepository
      .createQueryBuilder('practiceAreas')
      .select(['practiceAreas.id', 'practiceAreas.name'])
      .getMany();
  }

  async updatePracticeArea(input: { practiceAreaId: string; body: UpdatePracticeAreaInput }) {
    const { practiceAreaId, body } = input;
    await this.practiceAreasRepository.update({ id: practiceAreaId }, { ...body });

    return {
      message: 'Practice area updated successfully',
    };
  }

  createCaseNote(input: { caseId: string; body: CreateCaseNoteInput }) {
    const { caseId, body } = input;
    return this.caseNotesRepository.save({ caseId, ...body });
  }

  async createCaseSessionRequest(input: { caseId: string; body: CreateCaseSessionRequestInput }) {
    const { caseId, body } = input;

    const pendingRequest = await this.caseSessionRequestsRepository.findOne({
      where: {
        caseId,
        status: CaseSessionRequestStatus.PENDING,
        raisedBy: body.raisedBy,
      },
    });

    if (pendingRequest) {
      throw new BadRequestException('A pending session request already exists');
    }

    return this.caseSessionRequestsRepository.save({ caseId, ...body });
  }

  uploadCaseDocument(input: { caseId: string; body: UploadCaseDocumentInput }) {
    const { caseId, body } = input;
    return this.assetsRepository.save({ caseId, ...body });
  }

  async getCaseNotes(input: { caseId: string; query: GetInternalNotesQueryDto }) {
    const { caseId, query } = input;
    const { data, total } = await this.caseNotesRepository.getInternalNotesQuery({ caseId, query });
    const pagination = buildPaginationOutput(total, query);

    return { data, pagination };
  }

  async getCaseDocuments(input: { caseId: string; query: GetCasesDocumentsQueryDto }) {
    const { caseId, query } = input;
    const { data, total } = await this.assetsRepository.getCasesDocumentsQuery({ caseId, query });
    const pagination = buildPaginationOutput(total, query);
    return { data, pagination };
  }
}
