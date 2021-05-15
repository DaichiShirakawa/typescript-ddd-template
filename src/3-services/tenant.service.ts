import { getConnection } from "typeorm";
import { Tenant } from "../1-entities/tenant.entity";
import { TenantModel } from "../2-models/tenant.model";
import { HttpsError } from "../express/https-error";
import { ContextHolder } from "../express/context/base-context";
import { BaseTenantService } from "./base/base-tenant-service";

export class TenantService extends BaseTenantService {
  list(): Promise<Tenant[]> {
    return this.findTransactionDANGER((tx) => tx.find(Tenant));
  }

  find(tenantId: string): Promise<Tenant> {
    return this.findTransactionDANGER((tx) =>
      tx.findOneOrFail(Tenant, tenantId)
    );
  }

  /**
   * 登録時は context に tenant がセットされていないため、
   * TenantTransaction を使わず直接保存
   */
  static register(
    ch: ContextHolder,
    data: Pick<Tenant, "name" | "code">
  ): Promise<Tenant> {
    return getConnection().transaction(async (tx) => {
      if (await tx.findOne(Tenant, { where: { code: data.code } })) {
        throw new HttpsError(
          "already-exists",
          `Already exists: "${data.code}"`
        );
      }

      const model = TenantModel.register(ch, data);

      await tx.insert(Tenant, model.tenant);
      const tenant = await tx.findOneOrFail(Tenant, model.tenantId);

      return tenant;
    });
  }

  updateName(name: string): Promise<Tenant> {
    return this.transaction(async (tx) => {
      const model = new TenantModel(this).updateName(name);
      return {
        returns: () => model.tenant,
        saveModels: [model],
      };
    });
  }

  async updateCode(code: string): Promise<Tenant> {
    const existing = await this.findTransactionDANGER((tx) =>
      tx.findOne(Tenant, { where: { code } })
    );
    if (existing) {
      throw new HttpsError("already-exists", `Already exists: "${code}"`);
    }

    return this.transaction(async (tx) => {
      const model = new TenantModel(this).updateCode(code);
      return {
        returns: () => model.tenant,
        saveModels: [model],
      };
    });
  }
}
