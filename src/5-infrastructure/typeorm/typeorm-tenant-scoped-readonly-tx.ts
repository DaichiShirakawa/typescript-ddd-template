import { HttpsError } from "../../0-definitions/https-error";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { TypeORMTenantScopedTx } from "./typeorm-tenant-scoped-tx";

/**
 * save 系利用不可
 */
export class TypeORMTenantScopedReadonlyTx extends TypeORMTenantScopedTx {
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
