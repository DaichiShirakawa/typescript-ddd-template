import { getConnection } from "typeorm";
import { ContextHolder } from "../../0-definitions/context";
import { HttpsError } from "../../0-definitions/https-error";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { ReadonlyTxProcessor } from "../../3-services/base/transaction";
import { TypeORMTenantScopedReadonlyTx } from "./typeorm-tenant-scoped-readonly-tx";
import { TypeORMTx } from "./typeorm-tx";

/**
 * save 系利用不可
 */
export class TypeORMReadonlyTx extends TypeORMTx {
  static get starter() {
    return (
      ch: ContextHolder<any>,
      func: ReadonlyTxProcessor<TypeORMTenantScopedReadonlyTx>
    ) =>
      getConnection().transaction(async (tx) => {
        const tenantTx = new TypeORMTenantScopedReadonlyTx(tx, ch);
        const result = await func(tenantTx);
        return result ? result : (undefined as any);
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
