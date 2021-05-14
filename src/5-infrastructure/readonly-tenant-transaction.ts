import { getConnection } from "typeorm";
import { MyBaseEntity } from "../1-entities/_base-entity";
import { HttpsError } from "../express/https-error";
import { ContextHolder } from "../express/security/base-context";
import { TenantContext } from "../express/security/tenant-context";
import { TxProcessor } from "./base-transaction";
import { TenantTransaction } from "./tenant-transaction";

/**
 * save 系利用不可
 */
export class ReadonlyTenantTransaction extends TenantTransaction {
  static start<T>(
    ch: ContextHolder<TenantContext>,
    func: TxProcessor<ReadonlyTenantTransaction, T>
  ): Promise<T> {
    return getConnection().transaction(async (tx) => {
      const tenantTx = new ReadonlyTenantTransaction(tx, ch);
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
