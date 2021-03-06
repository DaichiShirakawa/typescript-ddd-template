import { PrimaryColumn } from "typeorm";
import { HttpsError } from "../../0-base/https-error";
import { MyBaseEntity } from "./base-entity";

/**
 * テナントに属するすべてのデータはこれを継承する
 */
export abstract class TenantScopedEntity<
  T extends TenantScopedEntity<any> = any
> extends MyBaseEntity<T> {
  @PrimaryColumn({ length: 48 })
  readonly tenantId: string;

  public constructor(tenantId: string, init: Partial<Omit<T, "tenantId">>) {
    if (init == null /* from TypeORM read */) {
      super(null as any);
    } else {
      super({
        ...init,
        tenantId,
      } as any);
    }
  }

  public set(changes: Partial<Omit<T, "tenantId">>): T {
    if ((changes as any).tenantId != null) {
      throw new HttpsError("internal", `tenantId cannot change`, this);
    }
    return super.set(changes as Partial<T>);
  }
}
