import { HttpsError } from "../express/https-error";
import { ContextHolder } from "../express/security/base-context";
import { BaseModel, SubModelOrEntities } from "./_base-model";
import { TenantContext } from "../express/security/tenant-context";

/**
 * テナントに属するデータを扱うためのベースモデル
 */
export abstract class BaseTenantModel<
  E extends SubModelOrEntities = {}
> extends BaseModel<E> {
  readonly context: TenantContext;
  protected readonly entities: E = {} as any;

  constructor(ch: ContextHolder, entities: E) {
    super(ch, entities);

    const errors = this.entitiesArray.filter(
      (e) => e.tenantId && e.tenantId !== this.context.tenantId
    );

    if (errors.length) {
      throw new HttpsError(
        "failed-precondition",
        `Invalid resources: tenantId not matches`,
        {
          expected: this.tenantId,
          errors,
        }
      );
    }
  }

  get tenant() {
    return this.context.tenant;
  }

  get tenantId() {
    return this.context.tenantId;
  }
}
