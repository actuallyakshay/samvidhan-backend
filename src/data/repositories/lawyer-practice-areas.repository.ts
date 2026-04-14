import { Injectable, Optional } from "@nestjs/common";
import { EntityManager, EntityTarget, Repository } from "typeorm";
import { LawyerPracticeAreasEntity } from "../entities";

@Injectable()
export class LawyerPracticeAreasRepository extends Repository<LawyerPracticeAreasEntity> {
  constructor(
    @Optional() _target: EntityTarget<LawyerPracticeAreasEntity>,
    entityManager: EntityManager,
  ) {
    super(LawyerPracticeAreasEntity, entityManager);
  }
}
