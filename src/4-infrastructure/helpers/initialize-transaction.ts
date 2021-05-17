import { BaseService } from "../../3-services/base/base-service";
import { TenantScopedService } from "../../3-services/base/tenant-scoped-service";
import { TypeORMTenantScopedTx } from "../typeorm/typeorm-tenant-scoped-tx";
import { TypeORMTx } from "../typeorm/typeorm-tx";

export function initializeTransaction() {
  BaseService.TX_STARTERS = {
    tx: TypeORMTx.startTx,
    readonlyTx: TypeORMTx.startReadonlyTx,
  };

  TenantScopedService.TX_STARTERS = {
    tx: TypeORMTenantScopedTx.startTx,
    readonlyTx: TypeORMTenantScopedTx.startReadonlyTx,
  };
}
