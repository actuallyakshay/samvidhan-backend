import { Injectable, Optional } from "@nestjs/common";
import { EntityManager, EntityTarget, Repository } from "typeorm";
import { CaseMessagesEntity } from "../entities";

@Injectable()
export class CaseMessagesRepository extends Repository<CaseMessagesEntity> {
  constructor(
    @Optional() _target: EntityTarget<CaseMessagesEntity>,
    entityManager: EntityManager,
  ) {
    super(CaseMessagesEntity, entityManager);
  }
}
