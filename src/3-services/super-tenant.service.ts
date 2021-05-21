import { ContextHolder } from "../0-base/context-holder";
import { HttpsError } from "../0-base/https-error";
import { Tenant } from "../1-entities/tenant.entity";
import { TenantModel } from "../2-models/tenant.model";
import { BaseService } from "./base/base-service";
import { SuperContext } from "./base/super-context";
import { TransactionContext } from "./base/transaction-context";
import { logs } from "../0-base/logs-context";

/**
 * システム管理者権限で実行可能なテナント横断サービス
 */
export class SuperTenantService extends BaseService {
  constructor() {
    super();
    logs().info(
      `Call SuperTenantService by ${SuperContext.instance.superUserId}`
    );
  }

  async register(init: Pick<Tenant, "name" | "code">): Promise<Tenant> {
    await this.startReadonlyTx(async (tx) => {
      if (await tx.findOne(Tenant, { where: { code: init.code } })) {
        throw new HttpsError(
          "already-exists",
          `Already exists: "${init.code}"`
        );
      }
    });

    return TransactionContext.instance.tenantScopedTx(async (tx) => {
      const { model, context } = TenantModel.register(init);

      ContextHolder.set(context);

      return {
        returns: () => model.tenant,
        saveModels: [model],
      };
    });
  }

  list(): Promise<Tenant[]> {
    return this.startReadonlyTx((tx) => tx.find(Tenant));
  }

  find(tenantId: string): Promise<Tenant> {
    return this.startReadonlyTx((tx) => tx.findOneOrFail(Tenant, tenantId));
  }
}
