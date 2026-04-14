import { CaseMessagesEntity, CasesEntity } from 'src/data/entities';
import { CaseMessagesRepository } from 'src/data/repositories/case-messages.repository';
import { MessageType } from 'src/enums';

export type CaseMessagePayload = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'lawyer' | 'admin';
  content: string;
  timestamp: string;
};

export function mapCaseMessageEntity(
  msg: CaseMessagesEntity,
  ctx: { caseUserId: string; assignedLawyerUserId: string | null }
): CaseMessagePayload | null {
  if (msg.messageType !== MessageType.TEXT) return null;

  const senderRole = resolveSenderRole(msg, ctx);
  return {
    id: msg.id,
    senderId: msg.senderId,
    senderName: msg.sender?.fullName ?? 'Unknown',
    senderRole,
    content: msg.messageText ?? '',
    timestamp: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : String(msg.createdAt),
  };
}

function resolveSenderRole(
  msg: CaseMessagesEntity,
  ctx: { caseUserId: string; assignedLawyerUserId: string | null }
): 'user' | 'lawyer' | 'admin' {
  if (msg.senderId === ctx.caseUserId) return 'user';
  if (msg.sender?.isAdmin) return 'admin';
  if (ctx.assignedLawyerUserId && msg.senderId === ctx.assignedLawyerUserId) return 'lawyer';
  return 'lawyer';
}

type CaseMessageContextEntity = Pick<CasesEntity, 'id' | 'userId'> & {
  assignedLawyer?: { userId?: string } | null;
};

export async function loadCaseTextMessagesPayload(
  repo: CaseMessagesRepository,
  caseEntity: CaseMessageContextEntity
): Promise<CaseMessagePayload[]> {
  const rows = await repo.find({
    where: { caseId: caseEntity.id, messageType: MessageType.TEXT },
    relations: { sender: true },
    order: { createdAt: 'ASC' },
  });
  const ctx = {
    caseUserId: caseEntity.userId,
    assignedLawyerUserId: caseEntity.assignedLawyer?.userId ?? null,
  };
  return rows.map((r) => mapCaseMessageEntity(r, ctx)).filter((m): m is CaseMessagePayload => m !== null);
}
