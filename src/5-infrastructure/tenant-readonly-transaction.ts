import { getConnection } from "typeorm";
import { MyBaseEntity } from "../1-entities/base/base-entity";
import { TxProcessor, TxStarter } from "../3-services/base/transaction";
import { HttpsError } from "../express/https-error";
import { ContextHolder } from "../express/context/base-context";
import { TenantContext } from "../express/context/tenant-context";
import { TenantTransaction } from "./tenant-transaction";

/**
 * save 系利用不可
 */
export class TenantReadonlyTransaction extends TenantTransaction {
  static get starter(): TxStarter<TenantContext> {
    return (
      ch: ContextHolder<TenantContext>,
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