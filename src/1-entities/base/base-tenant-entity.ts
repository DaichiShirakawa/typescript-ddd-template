import { PrimaryColumn } from "typeorm";
import { ContextHolder } from "../../express/context/base-context";
import { MyBaseEntity } from "./base-entity";
import { TenantContext } from "../../express/context/tenant-context";

/**
 * テナントに属するすべてのデータはこれを継承します。
 */
export abstract class BaseTenantEntity<
  T extends BaseTenantEntity<any> = any
> extends MyBaseEntity<T> {
  @PrimaryColumn({ length: 48 })
  readonly tenantId: string;

  public constructor(
    ch: ContextHolder<TenantContext>,
    init: Partial<Omit<T, "tenantId">>
  ) {
    if (init == null /* from TypeORM read */) {
      super(null as any);
    } else if (ch) {
      super({ ...init, tenantId: ch.context.tenantId } as any);
    } else {
      // Called from TypeORM
      super(null as any);
    }
  }
}
