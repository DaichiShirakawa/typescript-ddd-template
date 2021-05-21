import { withContext } from "../../../0-base/context";
import { ContextHolder } from "../../../0-base/context-holder";
import { wait } from "../../../0-base/wait";
import { Tenant } from "../../../1-entities/tenant.entity";
import { TenantModel } from "../../../2-models/tenant.model";
import { initializeTypeORM } from "../initialize-typeorm";
import { TransactionFactory } from "../transaction-factory";
import { TypeORMTenantScopedTx } from "../typeorm-tenant-scoped-tx";

describe("TenantScopedTransaction", () => {
  beforeAll(async () => {
    await initializeTypeORM();
  });

  test(
    "tx1",
    () =>
      withContext([TransactionFactory.typeORMContext()], async () => {
        const { model, context } = TenantModel.register({
          name: "Test Tenant",
          code: "test-tenant",
        });
        ContextHolder.set(context);

        let tenant = await TypeORMTenantScopedTx.startTx(async () => {
          expect(model.tenant.instanceMeta.isNewEntity).toBeTruthy();
          return {
            returns: () => model.tenant,
            saveModels: [model],
            statistics: ({ savedTargets }) =>
              expect(savedTargets.length).toBe(2),
          };
        });

        expect(tenant).toEqual(model.tenant);
        expect(model.tenant.updatedAt).toBeDefined();
        expect(model.tenant.instanceMeta.isNewEntity).toBeFalsy();
        const updatedAt = model.tenant.updatedAt;

        tenant = await TypeORMTenantScopedTx.startTx(async (tx) => {
          return {
            returns: () => model.tenant,
            saveModels: [model],
            statistics: ({ savedTargets }) =>
              expect(savedTargets.length).toBe(0),
          };
        });

        await wait(1000);

        tenant = await TypeORMTenantScopedTx.startTx(async (tx) => {
          model.updateName("Updated");
          expect(
            model.tenant.instanceMeta.updatedProps.size
          ).toBeGreaterThanOrEqual(1);
          return {
            returns: () => model.tenant,
            saveModels: [model],
            statistics: ({ savedTargets }) =>
              expect(savedTargets.length).toBe(2),
          };
        });

        expect(tenant.name).toBe("Updated");
        expect(tenant.updatedAt.getTime()).toBeGreaterThan(updatedAt.getTime());
      }),
    10000000
  );

  test(
    "readonly tx",
    () =>
      withContext([TransactionFactory.typeORMContext()], async () => {
        const { model, context } = TenantModel.register({
          name: "Test Tenant",
          code: "test-tenant",
        });
        ContextHolder.set(context);

        await TypeORMTenantScopedTx.startTx(async (tx) => {
          return {
            saveModels: [model],
          };
        });

        await TypeORMTenantScopedTx.startReadonlyTx(async (tx) => {
          await expect(async () =>
            tx.update(model.tenant)
          ).rejects.toBeDefined();
          const tenant = await tx.findOne(Tenant);
          expect(tenant).toBeDefined();
          expect(tenant?.id).toBe(model.tenantId);
          await expect(() => tx.update(tenant!)).rejects.toThrow();
        });
      }),
    10000000
  );
});
