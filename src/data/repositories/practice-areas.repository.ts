import { Injectable, Optional } from "@nestjs/common";
import { EntityManager, EntityTarget, Repository } from "typeorm";
import { PracticeAreasEntity } from "../entities";

@Injectable()
export class PracticeAreasRepository extends Repository<PracticeAreasEntity> {
  constructor(
    @Optional() _target: EntityTarget<PracticeAreasEntity>,
    entityManager: EntityManager,
  ) {
    super(PracticeAreasEntity, entityManager);
  }
}
