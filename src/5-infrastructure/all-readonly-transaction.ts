import { getConnection } from "typeorm";
import { MyBaseEntity } from "../1-entities/base/base-entity";
import { TxProcessor, TxStarter } from "../3-services/base/transaction";
import { HttpsError } from "../express/https-error";
import { ContextHolder } from "../express/security/base-context";
import { AllTransaction } from "./all-transaction";
import { TenantReadonlyTransaction } from "./tenant-readonly-transaction";

/**
 * save 系利用不可
 */
export class AllReadonlyTransaction extends AllTransaction {
  static get starter(): TxStarter<any> {
    return (
      ch: ContextHolder<any>,
      func: TxProcessor<TenantReadonlyTransaction>
    ) =>
      getConnection().transaction(async (tx) => {
        const tenantTx = new TenantReadonlyTransaction(tx, ch);
        const result = await func(tenantTx);
        return result.returns ? result.returns() : (undefined as any);
      });
  }

  /**
   * @deprecated readonly
   */
  async insert<T extends MyBaseEntity>(entity: T): Promise<T> {
    throw new HttpsError("internal", `Read only transaction`);
  }

  /**
   * @deprecated readonly
   */
  async update<T extends MyBaseEntity>(entity: T): Promise<T> {
    throw new HttpsError("internal", `Read only transaction`);
  }
}
