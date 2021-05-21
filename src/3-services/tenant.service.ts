import { getConnection } from "typeorm";
import { ContextHolder } from "../0-base/context-holder";
import { HttpsError } from "../0-base/https-error";
import { Tenant } from "../1-entities/tenant.entity";
import { TenantModel } from "../2-models/tenant.model";
import { TenantScopedService } from "./base/tenant-scoped-service";

export class TenantService extends TenantScopedService {
  list(): Promise<Tenant[]> {
    return this.startReadonlyTxDANGER((tx) => tx.find(Tenant));
  }

  find(tenantId: string): Promise<Tenant> {
    return this.startReadonlyTxDANGER((tx) =>
      tx.findOneOrFail(Tenant, tenantId)
    );
  }

  updateName(name: string): Promise<Tenant> {
    return this.startTx(async (tx) => {
      const model = new TenantModel().updateName(name);
      return {
        returns: () => model.tenant,
        saveModels: [model],
      };
    });
  }

  async updateCode(code: string): Promise<Tenant> {
    const existing = await this.startReadonlyTxDANGER((tx) =>
      tx.findOne(Tenant, { where: { code } })
    );
    if (existing) {
      throw new HttpsError("already-exists", `Already exists: "${code}"`);
    }

    return this.startTx(async (tx) => {
      const model = new TenantModel().updateCode(code);
      return {
        returns: () => model.tenant,
        saveModels: [model],
      };
    });
  }
}
