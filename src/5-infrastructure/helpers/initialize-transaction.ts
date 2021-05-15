import { BaseService } from "../../3-services/base/base-service";
import { BaseTenantService } from "../../3-services/base/base-tenant-service";
import { TypeORMTx } from "../typeorm/typeorm-tx";
import { TypeORMReadonlyTx } from "../typeorm/typeorm-readonly-tx";
import { TypeORMTenantScopedTx } from "../typeorm/typeorm-tenant-scoped-tx";
import { TypeORMTenantScopedReadonlyTx } from "../typeorm/typeorm-tenant-scoped-readonly-tx";

export function initializeTransaction() {
  BaseService.TX_SET = {
    txClass: TypeORMTx,
    readonlyTxClass: TypeORMReadonlyTx,
  };

  BaseTenantService.TX_SET = {
    txClass: TypeORMTenantScopedTx,
    readonlyTxClass: TypeORMTenantScopedReadonlyTx,
  };
}
