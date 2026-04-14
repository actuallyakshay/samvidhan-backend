import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { mapCaseMessageEntity, type CaseMessagePayload } from 'src/cases/case-message.mapper';
import { CaseMessagesRepository } from 'src/data/repositories/case-messages.repository';
import { CasesRepository } from 'src/data/repositories/cases.repository';
import { LawyerProfilesRepository } from 'src/data/repositories/lawyer-profiles.repository';
import { MessageType, RoleCode } from 'src/enums';
import { caseChatRoom, MAX_CHAT_TEXT_LENGTH } from './case-chat.constants';
import { CaseChatSocketUser } from 'src/types';
import { ChatSendDto } from './dto/chat-send.dto';

@Injectable()
export class CaseChatService {
  constructor(
    private readonly casesRepository: CasesRepository,
    private readonly caseMessagesRepository: CaseMessagesRepository,
    private readonly lawyerProfilesRepository: LawyerProfilesRepository
  ) {}

  room(caseId: string) {
    return caseChatRoom(caseId);
  }

  async joinRoom(user: CaseChatSocketUser, caseId: string): Promise<void> {
    const caseEntity = await this.getCaseWithAccessContext(caseId);
    await this.assertCanAccessWithEntity(user, caseEntity);
  }

  async persistAndBroadcastPayload(user: CaseChatSocketUser, dto: ChatSendDto): Promise<{
    message: CaseMessagePayload;
    caseId: string;
    caseCode: string;
    ownerUserId: string;
    lawyerUserId: string | null;
  }> {
    const text = dto.text.trim();
    if (!text) throw new ForbiddenException('Empty message');

    const caseEntity = await this.getCaseWithAccessContext(dto.caseId);
    await this.assertCanAccessWithEntity(user, caseEntity);

    const saved = await this.caseMessagesRepository.save({
      caseId: dto.caseId,
      senderId: user.sub,
      messageType: MessageType.TEXT,
      messageText: text.slice(0, MAX_CHAT_TEXT_LENGTH),
    });

    const full = await this.caseMessagesRepository.findOne({
      where: { id: saved.id },
      relations: { sender: true },
    });
    if (!full) throw new NotFoundException('Message not found');

    const ctx = {
      caseUserId: caseEntity.userId,
      assignedLawyerUserId: caseEntity.assignedLawyer?.userId ?? null,
    };
    const mapped = mapCaseMessageEntity(full, ctx);
    if (!mapped) throw new NotFoundException('Message not found');
    return {
      message: mapped,
      caseId: dto.caseId,
      caseCode: caseEntity.caseCode,
      ownerUserId: caseEntity.userId,
      lawyerUserId: caseEntity.assignedLawyer?.userId ?? null,
    };
  }

  private async getCaseWithAccessContext(caseId: string) {
    const caseEntity = await this.casesRepository
      .createQueryBuilder('c')
      .leftJoin('c.assignedLawyer', 'assignedLawyer')
      .addSelect(['assignedLawyer.id', 'assignedLawyer.userId'])
      .where('c.id = :caseId', { caseId })
      .getOne();

    if (!caseEntity) throw new NotFoundException('Case not found');
    return caseEntity;
  }

  private async assertCanAccessWithEntity(
    user: CaseChatSocketUser,
    caseEntity: { userId: string; assignedLawyerId?: string | null }
  ): Promise<void> {
    if (user.isAdmin) return;
    if (caseEntity.userId === user.sub) return;

    const active = user.activeRole;
    if (active === RoleCode.LAWYER || active === 'lawyer') {
      const profile = await this.lawyerProfilesRepository.findOne({ where: { userId: user.sub } });
      if (profile && caseEntity.assignedLawyerId === profile.id) return;
    }

    throw new ForbiddenException('Not allowed for this case');
  }
}
