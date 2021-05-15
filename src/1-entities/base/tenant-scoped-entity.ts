import { PrimaryColumn } from "typeorm";
import { MyBaseEntity } from "./base-entity";

/**
 * テナントに属するすべてのデータはこれを継承します。
 */
export abstract class TenantScopedEntity<
  T extends TenantScopedEntity<any>
> extends MyBaseEntity<T> {
  @PrimaryColumn({ length: 48 })
  readonly tenantId: string;

  public constructor(tenantId: string, init: Partial<Omit<T, "tenantId">>) {
    if (init == null /* from TypeORM read */) {
      super(null as any);
    } else if (tenantId) {
      super({ ...init, tenantId } as any);
    } else {
      // Called from TypeORM
      super(null as any);
    }
  }
}
