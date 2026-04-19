import { Injectable, Optional } from '@nestjs/common';
import { CaseMessageParticipantKind } from 'src/enums';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { CaseChatReadStateEntity } from '../entities/case-chat-read-state.entity';

@Injectable()
export class CaseChatReadStateRepository extends Repository<CaseChatReadStateEntity> {
  constructor(
    @Optional() _target: EntityTarget<CaseChatReadStateEntity>,
    entityManager: EntityManager
  ) {
    super(CaseChatReadStateEntity, entityManager);
  }

  async upsertLastRead(
    caseId: string,
    readerKind: CaseMessageParticipantKind,
    lastReadMessageId: string | null
  ): Promise<void> {
    if (lastReadMessageId === null) {
      const row = await this.findOne({ where: { caseId, readerKind } });
      if (row) {
        row.lastReadMessageId = null;
        await this.save(row);
      }
      return;
    }

    let row = await this.findOne({ where: { caseId, readerKind } });
    if (!row) {
      row = this.create({ caseId, readerKind, lastReadMessageId });
    } else {
      row.lastReadMessageId = lastReadMessageId;
    }
    await this.save(row);
  }
}
