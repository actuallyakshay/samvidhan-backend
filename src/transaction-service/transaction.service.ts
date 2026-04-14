import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class TransactionService {
   constructor(private readonly dataSource: DataSource) {}

   async run<T>(transactionalFunction: (txnEM: EntityManager) => Promise<T>): Promise<T> {
      return this.dataSource.transaction(async (txnEM: EntityManager) => {
         return await transactionalFunction(txnEM);
      });
   }
}
