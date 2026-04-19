import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CaseChatReadStateRepository } from 'src/data/repositories/case-chat-read-state.repository';
import { CaseMessagesRepository } from 'src/data/repositories/case-messages.repository';
import { CasesRepository } from 'src/data/repositories/cases.repository';
import {
  CaseMessageParticipantKind,
  MessageType,
  RoleCode,
} from 'src/enums';
import { CaseChatSocketUser } from 'src/types';
import { caseChatRoom } from './case-chat.constants';
import { ChatSendDto } from './dto/chat-send.dto';

type CaseMessagePayload = {
  id: string;
  senderRole: CaseMessageParticipantKind;
  content: string;
  timestamp: string;
  messageType: MessageType;
  assetUrl?: string | null;
  assetName?: string | null;
};

function inferThreadMessageType(
  assetUrl: string | undefined,
  assetName?: string
): MessageType {
  if (!assetUrl) return MessageType.TEXT;
  const hint = `${assetName ?? ''} ${assetUrl}`.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(hint)) {
    return MessageType.IMAGE;
  }
  if (/\/image\//i.test(assetUrl) || hint.includes('image%2f')) {
    return MessageType.IMAGE;
  }
  return MessageType.DOCUMENT;
}

@Injectable()
export class CaseChatService {
  constructor(
    private readonly casesRepository: CasesRepository,
    private readonly caseMessagesRepository: CaseMessagesRepository,
    private readonly caseChatReadStateRepository: CaseChatReadStateRepository
  ) {}

  room(caseId: string) {
    return caseChatRoom(caseId);
  }

  async persistAndBroadcastPayload(user: CaseChatSocketUser, dto: ChatSendDto): Promise<{
    message: CaseMessagePayload;
    caseId: string;
    caseCode: string;
    ownerUserId: string;
    lawyerUserId: string | null;
  }> {
    const text = (dto.text ?? '').trim();
    const assetUrl = (dto.assetUrl ?? '').trim();
    if (!text && !assetUrl) {
      throw new ForbiddenException('Empty message');
    }
    if (assetUrl && !/^https?:\/\//i.test(assetUrl)) {
      throw new ForbiddenException('Invalid asset URL');
    }

    const caseEntity = await this.casesRepository.findOne({
      where: { id: dto.caseId },
      relations: { assignedLawyer: true },
      select: {
        id: true,
        caseCode: true,
        userId: true,
        assignedLawyer: { userId: true },
      },
    });
    if (!caseEntity) throw new NotFoundException('Case not found');

    const senderKind: CaseMessageParticipantKind =
      user.isAdmin || user.activeRole === RoleCode.ADMIN
        ? CaseMessageParticipantKind.ADMIN
        : user.activeRole === RoleCode.LAWYER || user.activeRole === 'lawyer'
          ? CaseMessageParticipantKind.LAWYER
          : CaseMessageParticipantKind.USER;

    const messageType = inferThreadMessageType(
      assetUrl || undefined,
      dto.assetName?.trim()
    );
    const assetName = dto.assetName?.trim() || null;

    const saved = await this.caseMessagesRepository.save({
      caseId: dto.caseId,
      senderKind,
      messageType,
      messageText: text || null,
      assetUrl: assetUrl || null,
      assetName,
    });

    await this.caseChatReadStateRepository.upsertLastRead(dto.caseId, senderKind, saved.id);

    const full = await this.caseMessagesRepository.findOne({
      where: { id: saved.id },
    });
    if (!full) throw new NotFoundException('Message not found');

    return {
      message: {
        id: full.id,
        senderRole: full.senderKind,
        content: full.messageText ?? '',
        timestamp:
          full.createdAt instanceof Date ? full.createdAt.toISOString() : String(full.createdAt),
        messageType: full.messageType,
        assetUrl: full.assetUrl ?? undefined,
        assetName: full.assetName ?? undefined,
      },
      caseId: dto.caseId,
      caseCode: caseEntity.caseCode,
      ownerUserId: caseEntity.userId,
      lawyerUserId: caseEntity.assignedLawyer?.userId ?? null,
    };
  }
}
