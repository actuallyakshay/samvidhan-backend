import { Injectable, Optional } from "@nestjs/common";
import { EntityManager, EntityTarget, Repository } from "typeorm";
import { SubscriptionPlansEntity } from "../entities";

@Injectable()
export class SubscriptionPlansRepository extends Repository<SubscriptionPlansEntity> {
  constructor(
    @Optional() _target: EntityTarget<SubscriptionPlansEntity>,
    entityManager: EntityManager,
  ) {
    super(SubscriptionPlansEntity, entityManager);
  }
}
